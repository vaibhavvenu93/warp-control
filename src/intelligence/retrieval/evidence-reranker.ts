import type {
  KnowledgeProvenance,
  KnowledgeSnapshot,
} from "@/domain/knowledge/types";

import type {
  QueryPlan,
} from "@/domain/knowledge/query/types";

import type {
  RetrievalCandidate,
  RetrievalScoreBreakdown,
  RetrievalTraceStep,
} from "@/domain/knowledge/query/retrieval-types";

const PROVENANCE_RELIABILITY: Record<
  KnowledgeProvenance,
  number
> = {
  INTERNAL: 1,
  CONNECTED: 0.95,
  PUBLIC: 0.85,
  MODELED: 0.6,
  ASSUMED: 0.35,
};

const clamp = (
  value: number,
) =>
  Math.min(
    1,
    Math.max(0, value),
  );

const round = (
  value: number,
) =>
  Number(
    value.toFixed(4),
  );

function provenanceReliability(
  candidate: RetrievalCandidate,
  snapshot: KnowledgeSnapshot,
) {
  if (
    candidate.provenance
  ) {
    return PROVENANCE_RELIABILITY[
      candidate.provenance
    ];
  }

  if (
    candidate.sourceId
  ) {
    const source =
      snapshot.sources.find(
        (item) =>
          item.id ===
          candidate.sourceId,
      );

    if (source) {
      return source.trustScore;
    }
  }

  return 0.5;
}

function unknownPriority(
  candidate: RetrievalCandidate,
  plan: QueryPlan,
) {
  if (
    candidate.state !==
    "UNKNOWN"
  ) {
    return 0;
  }

  if (
    plan.evidenceRequirements.includes(
      "UNKNOWN_RESOLUTION",
    )
  ) {
    return 1;
  }

  return 0.35;
}

function modeledPenalty(
  candidate: RetrievalCandidate,
) {
  if (
    candidate.state ===
      "MODELED" ||
    candidate.provenance ===
      "MODELED"
  ) {
    return 0.12;
  }

  if (
    candidate.provenance ===
    "ASSUMED"
  ) {
    return 0.25;
  }

  return 0;
}

function scoreCandidate(
  candidate: RetrievalCandidate,
  snapshot: KnowledgeSnapshot,
  plan: QueryPlan,
): RetrievalScoreBreakdown {
  const provenance =
    provenanceReliability(
      candidate,
      snapshot,
    );

  const confidence =
    candidate.confidence ??
    0.5;

  const unknown =
    unknownPriority(
      candidate,
      plan,
    );

  const penalty =
    modeledPenalty(
      candidate,
    );

  /*
   * Deterministic ranking V1.
   *
   * Relevance remains dominant,
   * while evidence quality,
   * graph proximity and explicit
   * unknowns influence ranking.
   */
  const raw =
    candidate.lexicalScore *
      0.28 +
    candidate.entityAffinity *
      0.2 +
    candidate.graphAffinity *
      0.14 +
    provenance * 0.16 +
    confidence * 0.12 +
    unknown * 0.1 -
    penalty;

  return {
    lexical:
      round(
        candidate.lexicalScore,
      ),

    entityAffinity:
      round(
        candidate.entityAffinity,
      ),

    graphAffinity:
      round(
        candidate.graphAffinity,
      ),

    provenanceReliability:
      round(provenance),

    claimConfidence:
      round(confidence),

    unknownPriority:
      round(unknown),

    modeledPenalty:
      round(penalty),

    finalScore:
      round(
        clamp(raw),
      ),
  };
}

export interface RerankResult {
  candidates:
    RetrievalCandidate[];

  trace:
    RetrievalTraceStep;
}

export class EvidenceReranker {
  rerank(
    candidates:
      RetrievalCandidate[],

    snapshot:
      KnowledgeSnapshot,

    plan:
      QueryPlan,
  ): RerankResult {
    const ranked =
      candidates
        .map(
          (candidate) => ({
            ...candidate,

            score:
              scoreCandidate(
                candidate,
                snapshot,
                plan,
              ),
          }),
        )
        .sort(
          (a, b) => {
            const scoreDifference =
              (
                b.score
                  ?.finalScore ??
                0
              ) -
              (
                a.score
                  ?.finalScore ??
                0
              );

            if (
              scoreDifference !==
              0
            ) {
              return scoreDifference;
            }

            return a.id.localeCompare(
              b.id,
            );
          },
        );

    return {
      candidates: ranked,

      trace: {
        stage: "RERANK",

        message:
          `Evidence-aware reranking scored ` +
          `${ranked.length} candidate(s).`,

        candidateIds:
          ranked.map(
            (candidate) =>
              candidate.id,
          ),

        metadata: {
          rankingVersion:
            "evidence-reranker-v1",

          weights: {
            lexical: 0.28,
            entityAffinity:
              0.2,
            graphAffinity:
              0.14,
            provenanceReliability:
              0.16,
            claimConfidence:
              0.12,
            unknownPriority:
              0.1,
          },

          modeledPenalty:
            0.12,

          assumedPenalty:
            0.25,
        },
      },
    };
  }
}