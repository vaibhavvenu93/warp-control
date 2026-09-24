import type {
  ExternalFetcher,
} from "./fetch-contract";

import type {
  ExternalSourceAdapter,
  ExternalSourceDefinition,
  RawObservation,
  SourceAdapterContext,
} from "@/domain/market-radar/ingestion/observation-types";

import type {
  MarketSignalCategory,
} from "@/domain/market-radar/types";

export interface HttpTextAdapterOptions {
  fetcher: ExternalFetcher;

  source:
    ExternalSourceDefinition;

  categories:
    MarketSignalCategory[];

  entities: RawObservation[
    "entities"
  ];

  maxBodyCharacters?:
    number;
}

function decodeEntities(
  value: string,
): string {
  return value
    .replace(
      /&nbsp;/gi,
      " ",
    )
    .replace(
      /&amp;/gi,
      "&",
    )
    .replace(
      /&quot;/gi,
      '"',
    )
    .replace(
      /&#39;/gi,
      "'",
    )
    .replace(
      /&lt;/gi,
      "<",
    )
    .replace(
      /&gt;/gi,
      ">",
    );
}

function stripHtml(
  value: string,
): string {
  return decodeEntities(
    value
      .replace(
        /<script[\s\S]*?<\/script>/gi,
        " ",
      )
      .replace(
        /<style[\s\S]*?<\/style>/gi,
        " ",
      )
      .replace(
        /<noscript[\s\S]*?<\/noscript>/gi,
        " ",
      )
      .replace(
        /<[^>]+>/g,
        " ",
      )
      .replace(
        /\s+/g,
        " ",
      )
      .trim(),
  );
}

function extractTitle(
  html: string,
  fallback: string,
): string {
  const match =
    html.match(
      /<title[^>]*>([\s\S]*?)<\/title>/i,
    );

  if (!match?.[1]) {
    return fallback;
  }

  const title =
    stripHtml(
      match[1],
    );

  return (
    title ||
    fallback
  );
}

function stableExternalId(
  sourceId: string,
  observedAt: string,
): string {
  return (
    `${sourceId}:` +
    observedAt
  );
}

export class HttpTextSourceAdapter
  implements ExternalSourceAdapter {
  readonly source:
    ExternalSourceDefinition;

  private readonly fetcher:
    ExternalFetcher;

  private readonly categories:
    MarketSignalCategory[];

  private readonly entities:
    RawObservation[
      "entities"
    ];

  private readonly maxBodyCharacters:
    number;

  constructor(
    options:
      HttpTextAdapterOptions,
  ) {
    this.source =
      options.source;

    this.fetcher =
      options.fetcher;

    this.categories = [
      ...options.categories,
    ];

    this.entities =
      options.entities.map(
        (entity) => ({
          ...entity,
        }),
      );

    this.maxBodyCharacters =
      options
        .maxBodyCharacters ??
      12_000;
  }

  async fetch(
    context:
      SourceAdapterContext,
  ): Promise<
    RawObservation[]
  > {
    const response =
      await this.fetcher.fetch(
        this.source.uri,
        {
          method: "GET",
        },
      );

    if (!response.ok) {
      throw new Error(
        `External source "${this.source.id}" returned HTTP ${response.status} ${response.statusText}.`,
      );
    }

    const contentType =
      response.headers[
        "content-type"
      ] ??
      "";

    const isHtml =
      contentType.includes(
        "text/html",
      ) ||
      response.body.includes(
        "<html",
      );

    const title =
      isHtml
        ? extractTitle(
            response.body,
            this.source.name,
          )
        : this.source.name;

    const body =
      (
        isHtml
          ? stripHtml(
              response.body,
            )
          : response.body
              .replace(
                /\s+/g,
                " ",
              )
              .trim()
      ).slice(
        0,
        this.maxBodyCharacters,
      );

    if (!body) {
      throw new Error(
        `External source "${this.source.id}" returned no readable content.`,
      );
    }

    return [
      {
        externalId:
          stableExternalId(
            this.source.id,
            context.now,
          ),

        sourceId:
          this.source.id,

        sourceName:
          this.source.name,

        sourceUri:
          this.source.uri,

        canonicalUri:
          response.url ||
          this.source.uri,

        title,

        body,

        observedAt:
          context.now,

        categories: [
          ...this.categories,
        ],

        entities:
          this.entities.map(
            (entity) => ({
              ...entity,
            }),
          ),

        metadata: {
          adapter:
            "HTTP_TEXT_V1",

          statusCode:
            response.status,

          contentType,

          fetchedFrom:
            response.url ||
            this.source.uri,
        },
      },
    ];
  }
}