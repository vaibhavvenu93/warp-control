import type {
  ExternalSourceDefinition,
  MarketObservation,
  ObservationEntityType,
  RawObservation,
} from "./observation-types";

function normalizeWhitespace(
  value: string,
): string {
  return value
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeEntityName(
  value: string,
): string {
  return normalizeWhitespace(
    value,
  ).toLowerCase();
}

function normalizeUrl(
  value: string,
): string {
  try {
    const url =
      new URL(value);

    url.hash = "";

    const removableParameters = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "ref",
    ];

    for (
      const parameter
      of removableParameters
    ) {
      url.searchParams.delete(
        parameter,
      );
    }

    if (
      url.pathname.length > 1 &&
      url.pathname.endsWith("/")
    ) {
      url.pathname =
        url.pathname.slice(
          0,
          -1,
        );
    }

    return url.toString();
  } catch {
    return value.trim();
  }
}

function hashString(
  value: string,
): string {
  let hash = 2166136261;

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    hash ^=
      value.charCodeAt(
        index,
      );

    hash = Math.imul(
      hash,
      16777619,
    );
  }

  return (
    hash >>> 0
  )
    .toString(16)
    .padStart(8, "0");
}

export function buildObservationFingerprint(
  input: {
    sourceId: string;
    canonicalUri: string;
    title: string;
    body: string;
  },
): string {
  const canonical = [
    input.sourceId,
    normalizeUrl(
      input.canonicalUri,
    ),
    normalizeWhitespace(
      input.title,
    ).toLowerCase(),
    normalizeWhitespace(
      input.body,
    ).toLowerCase(),
  ].join("|");

  return hashString(
    canonical,
  );
}

function uniqueEntities(
  entities: Array<{
    name: string;
    type: ObservationEntityType;
  }>,
): MarketObservation["entities"] {
  const seen =
    new Set<string>();

  const output:
    MarketObservation["entities"] =
      [];

  for (
    const entity of entities
  ) {
    const name =
      normalizeWhitespace(
        entity.name,
      );

    const normalizedName =
      normalizeEntityName(
        name,
      );

    const key =
      `${entity.type}:${normalizedName}`;

    if (
      !normalizedName ||
      seen.has(key)
    ) {
      continue;
    }

    seen.add(key);

    output.push({
      name,
      normalizedName,
      type: entity.type,
    });
  }

  return output;
}

export function normalizeObservation(
  raw: RawObservation,
  source: ExternalSourceDefinition,
  ingestedAt: string,
): MarketObservation {
  const title =
    normalizeWhitespace(
      raw.title,
    );

  const body =
    normalizeWhitespace(
      raw.body,
    );

  const canonicalUri =
    normalizeUrl(
      raw.canonicalUri ??
        raw.sourceUri ??
        source.uri,
    );

  const fingerprint =
    buildObservationFingerprint({
      sourceId:
        source.id,
      canonicalUri,
      title,
      body,
    });

  return {
    id:
      `observation-${fingerprint}`,

    fingerprint,

    externalId:
      raw.externalId,

    sourceId:
      source.id,

    sourceName:
      source.name,

    sourceKind:
      source.kind,

    sourceUri:
      normalizeUrl(
        raw.sourceUri ||
          source.uri,
      ),

    title,

    body,

    canonicalUri,

    publishedAt:
      raw.publishedAt,

    observedAt:
      raw.observedAt,

    ingestedAt,

    author:
      raw.author,

    categories:
      Array.from(
        new Set(
          raw.categories,
        ),
      ),

    entities:
      uniqueEntities(
        raw.entities,
      ),

    provenance:
      source.provenance,

    trustScore:
      source.trustScore,

    freshness: {
      ageHours: 0,
      score: 100,
      band: "FRESH",
    },

    state:
      "NORMALIZED",

    metadata: {
      ...raw.metadata,
    },
  };
}