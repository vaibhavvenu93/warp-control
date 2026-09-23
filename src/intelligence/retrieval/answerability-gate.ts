import type {
  KnowledgeClaim,
  KnowledgeProvenance,
} from "@/domain/knowledge/types";

import type {
  RankedKnowledgeContext,
} from "@/domain/knowledge/query/retrieval-types";

export type AnswerabilityStatus =
  | "ANSWERABLE"
  | "ANSWERABLE_WITH_CAVEATS"
  | "INSUFFICIENT_EVIDENCE"
  | "CONFLICTING_EVIDENCE"
  | "HUMAN_JUDGMENT_REQUIRED";

export interface AnswerabilityFactor {
  name: string;
  score: number;
  weight: number;
  contribution: number;
  explanation: string;
}

export interface AnswerabilityAssessment {
  status: AnswerabilityStatus;

  confidence: number;

  factors: AnswerabilityFactor[];

  reasons: string[];
  caveats: string[];

  unresolvedQuestions: string[];
  requiredEvidence: string[];

  humanJudgmentRequired: boolean;

  evidenceProfile: {
    known: number;
    inferred: number;
    modeled: number;
    unknown: number;

    public: number;
    connected: number;
    internal: number;
    assumed: number;
  };

  policy: {
    mayAnswer: boolean;
    mayRecommend: boolean;
    mustDiscloseCaveats: boolean;
    mustRequestEvidence: boolean;
  };
}

const PROVENANCE_STRENGTH: Record<
  KnowledgeProvenance,
  number
> = {
  INTERNAL: 1,
  CONNECTED: 0.95,
  PUBLIC: 0.85,
  MODELED: 0.6,
  ASSUMED: 0.35,
};

const round = (value: number) =>
  Number(value.toFixed(4));

const clamp = (value: number) =>
  Math.max(0, Math.min(1, value));

const unique = <T>(values: T[]) =>
  [...new Set(values)];

function average(
  values: number[],
  fallback = 0,
) {
  if (values.length === 0) {
    return fallback;
  }

  return (
    values.reduce(
      (sum, value) => sum + value,
      0,
    ) / values.length
  );
}

function provenanceScore(
  claims: KnowledgeClaim[],
) {
  return average(
    claims.map(
      (claim) =>
        PROVENANCE_STRENGTH[
          claim.provenance
        ],
    ),
  );
}

function claimConfidenceScore(
  claims: KnowledgeClaim[],
) {
  return average(
    claims.map(
      (claim) =>
        claim.confidence,
    ),
  );
}

function evidenceCoverage(
  context: RankedKnowledgeContext,
) {
  if (
    context.claims.length === 0
  ) {
    return 0;
  }

  const claimsWithEvidence =
    context.claims.filter(
      (claim) =>
        context.evidence.some(
          (evidence) =>
            evidence.claimId ===
            claim.id,
        ),
    );

  return (
    claimsWithEvidence.length /
    context.claims.length
  );
}

function knownCoverage(
  context: RankedKnowledgeContext,
) {
  if (
    context.claims.length === 0
  ) {
    return 0;
  }

  const supported =
    context.knownClaims.length +
    context.inferredClaims.length +
    context.modeledClaims.length;

  return (
    supported /
    context.claims.length
  );
}

function unknownPenalty(
  context: RankedKnowledgeContext,
) {
  if (
    context.claims.length === 0
  ) {
    return 1;
  }

  return (
    context.unknownClaims.length /
    context.claims.length
  );
}

function contradictionPenalty(
  context: RankedKnowledgeContext,
) {
  if (
    context.contradictions.length ===
    0
  ) {
    return 0;
  }

  return Math.min(
    1,
    context.contradictions.length /
      Math.max(
        context.claims.length,
        1,
      ),
  );
}

function factor(
  name: string,
  score: number,
  weight: number,
  explanation: string,
): AnswerabilityFactor {
  return {
    name,
    score: round(score),
    weight,
    contribution:
      round(score * weight),
    explanation,
  };
}

function buildEvidenceProfile(
  context: RankedKnowledgeContext,
) {
  return {
    known:
      context.knownClaims.length,

    inferred:
      context.inferredClaims.length,

    modeled:
      context.modeledClaims.length,

    unknown:
      context.unknownClaims.length,

    public:
      context.claims.filter(
        (claim) =>
          claim.provenance ===
          "PUBLIC",
      ).length,

    connected:
      context.claims.filter(
        (claim) =>
          claim.provenance ===
          "CONNECTED",
      ).length,

    internal:
      context.claims.filter(
        (claim) =>
          claim.provenance ===
          "INTERNAL",
      ).length,

    assumed:
      context.claims.filter(
        (claim) =>
          claim.provenance ===
          "ASSUMED",
      ).length,
  };
}

export class AnswerabilityGate {
  assess(
    context: RankedKnowledgeContext,
  ): AnswerabilityAssessment {
    const claims =
      context.claims;

    const evidence =
      evidenceCoverage(context);

    const provenance =
      provenanceScore(claims);

    const claimConfidence =
      claimConfidenceScore(claims);

    const knowledgeCoverage =
      knownCoverage(context);

    const unknowns =
      unknownPenalty(context);

    const contradictions =
      contradictionPenalty(
        context,
      );

    const factors = [
      factor(
        "evidenceCoverage",
        evidence,
        0.25,
        "Share of retrieved claims backed by explicit evidence.",
      ),

      factor(
        "provenanceStrength",
        provenance,
        0.2,
        "Reliability of the provenance supporting retrieved claims.",
      ),

      factor(
        "claimConfidence",
        claimConfidence,
        0.2,
        "Average confidence recorded on retrieved claims.",
      ),

      factor(
        "knowledgeCoverage",
        knowledgeCoverage,
        0.2,
        "Share of retrieved claims that are not explicitly unknown.",
      ),

      factor(
        "unknownResolution",
        1 - unknowns,
        0.1,
        "Penalty for unresolved unknown claims.",
      ),

      factor(
        "consistency",
        1 - contradictions,
        0.05,
        "Penalty for conflicting evidence or contradictory claims.",
      ),
    ];

    const confidence =
      round(
        clamp(
          factors.reduce(
            (
              sum,
              current,
            ) =>
              sum +
              current.contribution,
            0,
          ),
        ),
      );

    const humanJudgmentRequired =
      context.queryPlan
        .requiresHumanJudgment;

    const reasons: string[] = [];
    const caveats: string[] = [];

    if (
      context.modeledClaims.length >
      0
    ) {
      caveats.push(
        `${context.modeledClaims.length} retrieved claim(s) are modeled rather than observed facts.`,
      );
    }

    if (
      context.inferredClaims.length >
      0
    ) {
      caveats.push(
        `${context.inferredClaims.length} retrieved claim(s) are inferred rather than directly observed.`,
      );
    }

    if (
      context.unknownClaims.length >
      0
    ) {
      caveats.push(
        `${context.unknownClaims.length} material unknown(s) remain unresolved.`,
      );
    }

    if (
      context.contradictions.length >
      0
    ) {
      caveats.push(
        `${context.contradictions.length} contradiction(s) require reconciliation.`,
      );
    }

    const unresolvedQuestions =
      context.gaps.map(
        (gap) =>
          gap.description,
      );

    const requiredEvidence =
      unique(
        context.gaps.flatMap(
          (gap) =>
            gap.requiredEvidence,
        ),
      );

    let status:
      AnswerabilityStatus;

    if (
      context.contradictions.length >
      0
    ) {
      status =
        "CONFLICTING_EVIDENCE";

      reasons.push(
        "Retrieved evidence contains unresolved contradictions.",
      );
    } else if (
      claims.length === 0 ||
      confidence < 0.45
    ) {
      status =
        "INSUFFICIENT_EVIDENCE";

      reasons.push(
        "The retrieved context does not meet the minimum evidence threshold for a reliable answer.",
      );
    } else if (
      humanJudgmentRequired
    ) {
      status =
        "HUMAN_JUDGMENT_REQUIRED";

      reasons.push(
        "The evidence can inform the question, but the requested conclusion crosses a human decision boundary.",
      );
    } else if (
      context.modeledClaims.length >
        0 ||
      context.inferredClaims.length >
        0 ||
      context.unknownClaims.length >
        0
    ) {
      status =
        "ANSWERABLE_WITH_CAVEATS";

      reasons.push(
        "The question can be answered, but modeled, inferred, or unresolved knowledge must be disclosed.",
      );
    } else {
      status =
        "ANSWERABLE";

      reasons.push(
        "Retrieved claims have sufficient evidence and no material unresolved caveats.",
      );
    }

    return {
      status,
      confidence,
      factors,
      reasons,
      caveats,
      unresolvedQuestions,
      requiredEvidence,
      humanJudgmentRequired,

      evidenceProfile:
        buildEvidenceProfile(
          context,
        ),

      policy: {
        mayAnswer:
          status !==
            "INSUFFICIENT_EVIDENCE" &&
          status !==
            "CONFLICTING_EVIDENCE",

        mayRecommend:
          !humanJudgmentRequired &&
          status !==
            "INSUFFICIENT_EVIDENCE" &&
          status !==
            "CONFLICTING_EVIDENCE",

        mustDiscloseCaveats:
          caveats.length > 0,

        mustRequestEvidence:
          status ===
            "INSUFFICIENT_EVIDENCE" ||
          context.gaps.length > 0,
      },
    };
  }
}