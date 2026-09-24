import type {
  MarketObservation,
} from "@/domain/market-radar/ingestion/observation-types";

import type {
  ClaimCandidate,
  ClaimStrength,
  ClaimTriangulation,
  MarketClaim,
  MarketClaimEvidence,
} from "./claim-types";

function clamp(
  value: number,
  minimum = 0,
  maximum = 100,
): number {
  return Math.min(
    maximum,
    Math.max(
      minimum,
      value,
    ),
  );
}

function round(
  value: number,
): number {
  return (
    Math.round(
      value * 100,
    ) / 100
  );
}

function normalize(
  value: string,
): string {
  return value
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
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

export function buildClaimFingerprint(
  candidate: ClaimCandidate,
): string {
  return hashString(
    [
      candidate.type,
      normalize(
        candidate.subject,
      ),
      normalize(
        candidate.predicate,
      ),
      normalize(
        candidate.object,
      ),
    ].join("|"),
  );
}

function evidenceFromObservation(
  observation: MarketObservation,
): MarketClaimEvidence {
  return {
    observationId:
      observation.id,

    sourceId:
      observation.sourceId,

    sourceName:
      observation.sourceName,

    sourceUri:
      observation.canonicalUri,

    provenance:
      observation.provenance,

    trustScore:
      observation.trustScore,

    freshnessScore:
      observation.freshness.score,

    observedAt:
      observation.observedAt,
  };
}

function strengthFromConfidence(
  confidence: number,
  independentSourceCount: number,
): ClaimStrength {
  if (
    confidence >= 88 &&
    independentSourceCount >= 3
  ) {
    return "VERY_STRONG";
  }

  if (
    confidence >= 74 &&
    independentSourceCount >= 2
  ) {
    return "STRONG";
  }

  if (
    confidence >= 50
  ) {
    return "MODERATE";
  }

  return "WEAK";
}

export function triangulateClaim(
  claim: MarketClaim,
): ClaimTriangulation {
  const evidence =
    claim.evidence;

  const sourceIds =
    Array.from(
      new Set(
        evidence.map(
          (item) =>
            item.sourceId,
        ),
      ),
    );

  const averageTrust =
    evidence.length === 0
      ? 0
      : evidence.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.trustScore,
          0,
        ) /
        evidence.length;

  const averageFreshness =
    evidence.length === 0
      ? 0
      : evidence.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.freshnessScore,
          0,
        ) /
        evidence.length;

  const sourceDiversityBonus =
    Math.min(
      18,
      Math.max(
        0,
        sourceIds.length - 1,
      ) * 9,
    );

  const evidenceVolumeBonus =
    Math.min(
      8,
      Math.max(
        0,
        evidence.length - 1,
      ) * 2,
    );

  const confidence =
    round(
      clamp(
        averageTrust *
          55 +
          averageFreshness *
            0.35 +
          sourceDiversityBonus +
          evidenceVolumeBonus,
      ),
    );

  const strength =
    strengthFromConfidence(
      confidence,
      sourceIds.length,
    );

  const epistemicState =
    sourceIds.length >= 2
      ? "CORROBORATED"
      : "OBSERVED";

  return {
    claimId:
      claim.id,

    evidenceCount:
      evidence.length,

    independentSourceCount:
      sourceIds.length,

    averageTrust:
      round(
        averageTrust * 100,
      ),

    averageFreshness:
      round(
        averageFreshness,
      ),

    confidence,

    strength,

    epistemicState,

    sourceIds,
  };
}

export function createMarketClaim(
  candidate: ClaimCandidate,
  observation: MarketObservation,
  now: string,
): MarketClaim {
  const fingerprint =
    buildClaimFingerprint(
      candidate,
    );

  const evidence = [
    evidenceFromObservation(
      observation,
    ),
  ];

  const claim:
    MarketClaim = {
      id:
        `claim-${fingerprint}`,

      fingerprint,

      type:
        candidate.type,

      subject:
        candidate.subject,

      normalizedSubject:
        normalize(
          candidate.subject,
        ),

      predicate:
        candidate.predicate,

      object:
        candidate.object,

      statement:
        candidate.statement,

      categories:
        Array.from(
          new Set(
            candidate.categories,
          ),
        ),

      entities:
        observation.entities.map(
          (entity) => ({
            ...entity,
          }),
        ),

      evidence,

      epistemicState:
        "OBSERVED",

      strength:
        "WEAK",

      confidence: 0,

      firstObservedAt:
        observation.observedAt,

      lastObservedAt:
        observation.observedAt,

      createdAt:
        now,

      updatedAt:
        now,

      metadata: {
        ...candidate.metadata,
      },
    };

  const triangulation =
    triangulateClaim(
      claim,
    );

  return {
    ...claim,

    epistemicState:
      triangulation.epistemicState,

    strength:
      triangulation.strength,

    confidence:
      triangulation.confidence,
  };
}

export function mergeClaimEvidence(
  existing: MarketClaim,
  observation: MarketObservation,
  now: string,
): MarketClaim {
  const alreadyAttached =
    existing.evidence.some(
      (item) =>
        item.observationId ===
        observation.id,
    );

  const evidence =
    alreadyAttached
      ? existing.evidence
      : [
          ...existing.evidence,
          evidenceFromObservation(
            observation,
          ),
        ];

  const categories =
    Array.from(
      new Set([
        ...existing.categories,
        ...observation.categories,
      ]),
    );

  const entityKeys =
    new Set<string>();

  const entities = [
    ...existing.entities,
    ...observation.entities,
  ].filter(
    (entity) => {
      const key =
        `${entity.type}:${entity.normalizedName}`;

      if (
        entityKeys.has(key)
      ) {
        return false;
      }

      entityKeys.add(key);
      return true;
    },
  );

  const merged:
    MarketClaim = {
      ...existing,

      evidence,

      categories,

      entities,

      firstObservedAt:
        [
          existing.firstObservedAt,
          observation.observedAt,
        ].sort()[0],

      lastObservedAt:
        [
          existing.lastObservedAt,
          observation.observedAt,
        ].sort().at(-1) ??
        existing.lastObservedAt,

      updatedAt:
        now,
    };

  const triangulation =
    triangulateClaim(
      merged,
    );

  return {
    ...merged,

    epistemicState:
      triangulation.epistemicState,

    strength:
      triangulation.strength,

    confidence:
      triangulation.confidence,
  };
}