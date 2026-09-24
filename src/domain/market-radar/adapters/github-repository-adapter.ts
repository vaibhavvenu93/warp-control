import type {
  ExternalFetcher,
} from "./fetch-contract";

import type {
  ExternalSourceAdapter,
  ExternalSourceDefinition,
  RawObservation,
  SourceAdapterContext,
} from "@/domain/market-radar/ingestion/observation-types";

export interface GitHubRepositoryAdapterOptions {
  fetcher: ExternalFetcher;

  source:
    ExternalSourceDefinition;

  owner: string;
  repository: string;

  companyName?: string;
}

interface GitHubRepositoryPayload {
  full_name?: string;

  description?: string | null;

  html_url?: string;

  homepage?: string | null;

  language?: string | null;

  stargazers_count?: number;

  forks_count?: number;

  open_issues_count?: number;

  watchers_count?: number;

  default_branch?: string;

  pushed_at?: string | null;

  updated_at?: string | null;

  archived?: boolean;

  visibility?: string;

  topics?: string[];
}

function numberOrZero(
  value: unknown,
): number {
  return (
    typeof value ===
      "number" &&
    Number.isFinite(value)
      ? value
      : 0
  );
}

export class GitHubRepositoryAdapter
  implements ExternalSourceAdapter {
  readonly source:
    ExternalSourceDefinition;

  private readonly fetcher:
    ExternalFetcher;

  private readonly owner:
    string;

  private readonly repository:
    string;

  private readonly companyName:
    string;

  constructor(
    options:
      GitHubRepositoryAdapterOptions,
  ) {
    this.source =
      options.source;

    this.fetcher =
      options.fetcher;

    this.owner =
      options.owner;

    this.repository =
      options.repository;

    this.companyName =
      options.companyName ??
      options.owner;
  }

  async fetch(
    context:
      SourceAdapterContext,
  ): Promise<
    RawObservation[]
  > {
    const apiUrl =
      `https://api.github.com/repos/` +
      `${encodeURIComponent(this.owner)}/` +
      `${encodeURIComponent(this.repository)}`;

    const response =
      await this.fetcher.fetch(
        apiUrl,
        {
          method: "GET",

          headers: {
            Accept:
              "application/vnd.github+json",

            "X-GitHub-Api-Version":
              "2022-11-28",
          },
        },
      );

    if (!response.ok) {
      throw new Error(
        `GitHub source "${this.source.id}" returned HTTP ${response.status} ${response.statusText}.`,
      );
    }

    let payload:
      GitHubRepositoryPayload;

    try {
      payload =
        JSON.parse(
          response.body,
        ) as GitHubRepositoryPayload;
    } catch {
      throw new Error(
        `GitHub source "${this.source.id}" returned invalid JSON.`,
      );
    }

    const fullName =
      payload.full_name ??
      `${this.owner}/${this.repository}`;

    const pushedAt =
      payload.pushed_at ??
      payload.updated_at ??
      undefined;

    const stars =
      numberOrZero(
        payload.stargazers_count,
      );

    const forks =
      numberOrZero(
        payload.forks_count,
      );

    const openIssues =
      numberOrZero(
        payload.open_issues_count,
      );

    const body = [
      payload.description
        ? `Description: ${payload.description}.`
        : null,

      payload.language
        ? `Primary language: ${payload.language}.`
        : null,

      `Stars observed: ${stars}.`,

      `Forks observed: ${forks}.`,

      `Open issues observed: ${openIssues}.`,

      payload.default_branch
        ? `Default branch: ${payload.default_branch}.`
        : null,

      pushedAt
        ? `Latest repository push timestamp reported by GitHub: ${pushedAt}.`
        : null,

      payload.archived ===
      true
        ? "Repository is reported as archived."
        : null,
    ]
      .filter(
        (
          item,
        ): item is string =>
          Boolean(item),
      )
      .join(" ");

    return [
      {
        externalId:
          `github-repository:${fullName}:${payload.updated_at ?? context.now}`,

        sourceId:
          this.source.id,

        sourceName:
          this.source.name,

        sourceUri:
          this.source.uri,

        canonicalUri:
          payload.html_url ??
          this.source.uri,

        title:
          `${fullName} repository snapshot`,

        body,

        publishedAt:
          pushedAt,

        observedAt:
          context.now,

        categories: [
          "DEVELOPER_ECOSYSTEM",
          "OPEN_SOURCE",
          "PRODUCT",
        ],

        entities: [
          {
            name:
              this.companyName,

            type:
              "COMPANY",
          },

          {
            name:
              fullName,

            type:
              "REPOSITORY",
          },
        ],

        metadata: {
          adapter:
            "GITHUB_REPOSITORY_V1",

          owner:
            this.owner,

          repository:
            this.repository,

          stars,

          forks,

          openIssues,

          language:
            payload.language,

          defaultBranch:
            payload.default_branch,

          pushedAt,

          updatedAt:
            payload.updated_at,

          topics:
            payload.topics ??
            [],

          visibility:
            payload.visibility,

          homepage:
            payload.homepage,

          /*
           * Critical:
           *
           * These values are observations from
           * GitHub's repository API. They are
           * not automatically evidence of
           * company strategy, commercial
           * traction or product adoption.
           */
          epistemicBoundary:
            "REPOSITORY_METADATA_ONLY",
        },
      },
    ];
  }
}