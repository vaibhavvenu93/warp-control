import type {
  ConfidenceLevel,
  EvidenceRef,
} from "@/domain/types";

import type {
  ClaimRisk,
  ClaimState,
  ClaimValidationResult,
  CommunicationAudience,
  CommunicationClaim,
} from "@/domain/communications/types";

function clamp(
  value: number,
  min = 0,
  max = 100,
): number {
  return Math.max(
    min,
    Math.min(max, value),
  );
}

function confidenceLevel(
  confidence: number,
): ConfidenceLevel {
  if (confidence >= 80) {
    return "HIGH";
  }

  if (confidence >= 55) {
    return "MEDIUM";
  }

  return "LOW";
}

function uniqueSources(
  evidence: EvidenceRef[],
): number {
  return new Set(
    evidence.map(
      (item) => item.source,
    ),
  ).size;
}

function calculateConfidence(
  evidence: EvidenceRef[],
): number {
  if (evidence.length === 0) {
    return 0;
  }

  const average =
    evidence.reduce(
      (sum, item) =>
        sum + item.confidence,
      0,
    ) / evidence.length;

  const corroborationBonus =
    Math.min(
      12,
      Math.max(
        0,
        uniqueSources(evidence) - 1,
      ) * 6,
    );

  return clamp(
    Math.round(
      average +
        corroborationBonus,
    ),
  );
}

function determineRisk(
  claim: CommunicationClaim,
): ClaimRisk {
  if (
    claim.audience.includes(
      "PUBLIC",
    ) ||
    claim.audience.includes(
      "CUSTOMER",
    )
  ) {
    return "HIGH";
  }

  if (
    claim.audience.includes(
      "INVESTOR",
    )
  ) {
    return "HIGH";
  }

  if (
    claim.audience.includes(
      "CEO",
    )
  ) {
    return "MEDIUM";
  }

  return "LOW";
}

function allowedAudiencesForState(
  state: ClaimState,
): CommunicationAudience[] {
  switch (state) {
    case "SUPPORTED":
      return [
        "CEO",
        "LEADERSHIP",
        "TEAM",
        "INVESTOR",
        "CUSTOMER",
        "PUBLIC",
      ];

    case "MODELED":
      return [
        "CEO",
        "LEADERSHIP",
        "TEAM",
      ];

    case "NEEDS_EVIDENCE":
      return [
        "CEO",
        "LEADERSHIP",
      ];

    case "BLOCKED":
      return [];

    default:
      return [];
  }
}

export interface ValidateClaimInput {
  claim: CommunicationClaim;
  evidence: EvidenceRef[];
}

export function validateCommunicationClaim({
  claim,
  evidence,
}: ValidateClaimInput): ClaimValidationResult {
  const relevantEvidence =
    evidence.filter(
      (item) =>
        claim.evidenceIds.includes(
          item.id,
        ),
    );

  const evidenceTypes =
    new Set(
      relevantEvidence.map(
        (item) => item.type,
      ),
    );

  const hasPublicEvidence =
    evidenceTypes.has("PUBLIC");

  const hasConnectedEvidence =
    evidenceTypes.has(
      "CONNECTED",
    );

  const hasInternalEvidence =
    evidenceTypes.has(
      "INTERNAL",
    );

  const hasModeledEvidence =
    evidenceTypes.has("MODELED");

  const hasAssumedEvidence =
    evidenceTypes.has("ASSUMED");

  const factualEvidence =
    relevantEvidence.filter(
      (item) =>
        item.type === "PUBLIC" ||
        item.type ===
          "CONNECTED" ||
        item.type === "INTERNAL",
    );

  const modeledEvidence =
    relevantEvidence.filter(
      (item) =>
        item.type === "MODELED",
    );

  const assumedEvidence =
    relevantEvidence.filter(
      (item) =>
        item.type === "ASSUMED",
    );

  const independentSourceCount =
    uniqueSources(
      relevantEvidence,
    );

  const confidence =
    calculateConfidence(
      relevantEvidence,
    );

  const risk =
    determineRisk(claim);

  const reasons: string[] = [];

  let state: ClaimState;

  if (
    relevantEvidence.length === 0
  ) {
    state = "NEEDS_EVIDENCE";

    reasons.push(
      "Claim has no linked evidence.",
    );
  } else if (
    factualEvidence.length > 0 &&
    !hasAssumedEvidence
  ) {
    state = "SUPPORTED";

    reasons.push(
      "Claim is supported by factual evidence.",
    );

    if (
      independentSourceCount >= 2
    ) {
      reasons.push(
        "Claim is corroborated by multiple independent sources.",
      );
    }
  } else if (
    factualEvidence.length === 0 &&
    modeledEvidence.length > 0 &&
    assumedEvidence.length === 0
  ) {
    state = "MODELED";

    reasons.push(
      "Claim is derived from modeled evidence and must remain explicitly labeled as modeled.",
    );
  } else if (
    assumedEvidence.length > 0 &&
    factualEvidence.length === 0
  ) {
    state = "NEEDS_EVIDENCE";

    reasons.push(
      "Claim currently depends on assumed evidence.",
    );
  } else {
    state = "NEEDS_EVIDENCE";

    reasons.push(
      "Available evidence is insufficient to communicate the claim as established fact.",
    );
  }

  /*
   * External audiences have a higher communication boundary.
   *
   * Modeled or assumed statements must never silently become
   * external facts simply because prose generation is possible.
   */
  const targetsExternalAudience =
    claim.audience.some(
      (audience) =>
        audience ===
          "INVESTOR" ||
        audience ===
          "CUSTOMER" ||
        audience === "PUBLIC",
    );

  if (
    targetsExternalAudience &&
    state !== "SUPPORTED"
  ) {
    state = "BLOCKED";

    reasons.push(
      "External communication requires supported evidence.",
    );
  }

  /*
   * A low-confidence external factual claim should still
   * require human review even when factual evidence exists.
   */
  const humanReviewRequired =
    claim.humanReviewRequired ||
    risk === "HIGH" ||
    state === "MODELED" ||
    state ===
      "NEEDS_EVIDENCE" ||
    state === "BLOCKED" ||
    confidence < 70;

  const allowedAudiences =
    allowedAudiencesForState(
      state,
    );

  return {
    claimId: claim.id,

    state,
    risk,

    confidence,
    confidenceLevel:
      confidenceLevel(confidence),

    evidenceCount:
      relevantEvidence.length,

    independentSourceCount,

    hasPublicEvidence,
    hasConnectedEvidence,
    hasInternalEvidence,
    hasModeledEvidence,
    hasAssumedEvidence,

    allowedAudiences,

    humanReviewRequired,

    reasons,
  };
}

export function validateCommunicationClaims(
  claims: CommunicationClaim[],
  evidence: EvidenceRef[],
): ClaimValidationResult[] {
  return claims.map(
    (claim) =>
      validateCommunicationClaim({
        claim,
        evidence,
      }),
  );
}