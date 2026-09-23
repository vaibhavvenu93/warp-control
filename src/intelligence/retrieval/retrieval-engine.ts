import type {
  KnowledgeClaim,
  KnowledgeEntity,
  KnowledgeEvidence,
  KnowledgeRelation,
  KnowledgeSnapshot,
} from "@/domain/knowledge/types";

import type {
  QueryPlan,
} from "@/domain/knowledge/query/types";

import type {
  RankedKnowledgeContext,
  RetrievalCandidate,
  RetrievalContradiction,
  RetrievalGap,
  RetrievalTraceStep,
} from "@/domain/knowledge/query/retrieval-types";

import {
  HybridRetriever,
} from "@/intelligence/retrieval/hybrid-retriever";

import {
  EvidenceReranker,
} from "@/intelligence/retrieval/evidence-reranker";

const unique = <T>(values: T[]) =>
  [...new Set(values)];

function selectedClaimIds(
  candidates: RetrievalCandidate[],
) {
  return unique(
    candidates
      .map((candidate) => candidate.claimId)
      .filter(
        (claimId): claimId is string =>
          Boolean(claimId),
      ),
  );
}

function selectedEntityIds(
  candidates: RetrievalCandidate[],
) {
  return unique(
    candidates.flatMap(
      (candidate) => candidate.entityIds,
    ),
  );
}

function selectedRelationIds(
  candidates: RetrievalCandidate[],
) {
  return unique(
    candidates
      .map(
        (candidate) =>
          candidate.relationId,
      )
      .filter(
        (
          relationId,
        ): relationId is string =>
          Boolean(relationId),
      ),
  );
}

function selectedEvidenceIds(
  candidates: RetrievalCandidate[],
) {
  return unique(
    candidates.flatMap(
      (candidate) =>
        candidate.evidenceIds,
    ),
  );
}

function buildGaps(
  claims: KnowledgeClaim[],
): RetrievalGap[] {
  return claims
    .filter(
      (claim) =>
        claim.state === "UNKNOWN",
    )
    .map((claim) => {
      const requiredEvidence =
        Array.isArray(
          claim.metadata.requiredEvidence,
        )
          ? claim.metadata.requiredEvidence.filter(
              (
                value,
              ): value is string =>
                typeof value === "string",
            )
          : [];

      return {
        id: `gap-${claim.id}`,

        entityIds:
          claim.entityIds,

        claimId:
          claim.id,

        description:
          claim.statement,

        requiredEvidence,

        severity:
          requiredEvidence.length > 0
            ? "HIGH"
            : "MEDIUM",
      };
    });
}

function explicitContradictions(
  snapshot: KnowledgeSnapshot,
  claimIds: string[],
  entityIds: string[],
): RetrievalContradiction[] {
  const contradictions:
    RetrievalContradiction[] = [];

  for (
    const relation
    of snapshot.graph.relations
  ) {
    if (
      relation.type !==
      "CONTRADICTS"
    ) {
      continue;
    }

    const relevant =
      entityIds.includes(
        relation.fromEntityId,
      ) ||
      entityIds.includes(
        relation.toEntityId,
      );

    if (!relevant) {
      continue;
    }

    const relatedClaims =
      snapshot.graph.claims
        .filter((claim) =>
          claim.entityIds.some(
            (entityId) =>
              entityId ===
                relation.fromEntityId ||
              entityId ===
                relation.toEntityId,
          ),
        )
        .map((claim) => claim.id)
        .filter((claimId) =>
          claimIds.includes(claimId),
        );

    contradictions.push({
      id:
        `contradiction-${relation.id}`,

      entityIds: unique([
        relation.fromEntityId,
        relation.toEntityId,
      ]),

      claimIds:
        unique(relatedClaims),

      description:
        relation.description ??
        `Knowledge graph contains an explicit contradiction between ${relation.fromEntityId} and ${relation.toEntityId}.`,
    });
  }

  return contradictions;
}

function metadataContradictions(
  claims: KnowledgeClaim[],
): RetrievalContradiction[] {
  const groups =
    new Map<
      string,
      KnowledgeClaim[]
    >();

  for (const claim of claims) {
    const contradictionKey =
      typeof claim.metadata
        .contradictionKey ===
      "string"
        ? claim.metadata
            .contradictionKey
        : undefined;

    if (!contradictionKey) {
      continue;
    }

    const existing =
      groups.get(
        contradictionKey,
      ) ?? [];

    existing.push(claim);

    groups.set(
      contradictionKey,
      existing,
    );
  }

  const contradictions:
    RetrievalContradiction[] = [];

  for (
    const [key, groupedClaims]
    of groups
  ) {
    if (
      groupedClaims.length < 2
    ) {
      continue;
    }

    contradictions.push({
      id:
        `contradiction-metadata-${key}`,

      entityIds:
        unique(
          groupedClaims.flatMap(
            (claim) =>
              claim.entityIds,
          ),
        ),

      claimIds:
        groupedClaims.map(
          (claim) => claim.id,
        ),

      description:
        `Multiple retrieved claims share contradiction key "${key}" and require reconciliation.`,
    });
  }

  return contradictions;
}

function buildContradictions(
  snapshot: KnowledgeSnapshot,
  claims: KnowledgeClaim[],
  entityIds: string[],
): RetrievalContradiction[] {
  const claimIds =
    claims.map(
      (claim) => claim.id,
    );

  return [
    ...explicitContradictions(
      snapshot,
      claimIds,
      entityIds,
    ),

    ...metadataContradictions(
      claims,
    ),
  ];
}

function buildContextTrace(
  candidates:
    RetrievalCandidate[],

  claims:
    KnowledgeClaim[],

  evidence:
    KnowledgeEvidence[],

  gaps:
    RetrievalGap[],

  contradictions:
    RetrievalContradiction[],
): RetrievalTraceStep {
  return {
    stage: "CONTEXT",

    message:
      `Context assembly selected ` +
      `${candidates.length} candidate(s), ` +
      `${claims.length} claim(s), ` +
      `${evidence.length} evidence item(s), ` +
      `${gaps.length} evidence gap(s), and ` +
      `${contradictions.length} contradiction(s).`,

    candidateIds:
      candidates.map(
        (candidate) =>
          candidate.id,
      ),

    metadata: {
      claimIds:
        claims.map(
          (claim) =>
            claim.id,
        ),

      evidenceIds:
        evidence.map(
          (item) =>
            item.id,
        ),

      gapIds:
        gaps.map(
          (gap) =>
            gap.id,
        ),

      contradictionIds:
        contradictions.map(
          (contradiction) =>
            contradiction.id,
        ),
    },
  };
}

export interface RetrievalEngineOptions {
  maxCandidates?: number;
  minimumScore?: number;
}

export class RetrievalEngine {
  private readonly retriever:
    HybridRetriever;

  private readonly reranker:
    EvidenceReranker;

  private readonly maxCandidates:
    number;

  private readonly minimumScore:
    number;

  constructor(
    options:
      RetrievalEngineOptions = {},
  ) {
    this.retriever =
      new HybridRetriever();

    this.reranker =
      new EvidenceReranker();

    this.maxCandidates =
      options.maxCandidates ?? 12;

    this.minimumScore =
      options.minimumScore ?? 0.1;
  }

  retrieve(
    snapshot: KnowledgeSnapshot,
    plan: QueryPlan,
  ): RankedKnowledgeContext {
    const hybrid =
      this.retriever.retrieve(
        snapshot,
        plan,
      );

    const reranked =
      this.reranker.rerank(
        hybrid.candidates,
        snapshot,
        plan,
      );

    const candidates =
      reranked.candidates
        .filter(
          (candidate) =>
            (
              candidate.score
                ?.finalScore ??
              0
            ) >=
            this.minimumScore,
        )
        .slice(
          0,
          this.maxCandidates,
        );

    const claimIds =
      selectedClaimIds(
        candidates,
      );

    const entityIds =
      selectedEntityIds(
        candidates,
      );

    const relationIds =
      selectedRelationIds(
        candidates,
      );

    const evidenceIds =
      selectedEvidenceIds(
        candidates,
      );

    const claims =
      snapshot.graph.claims.filter(
        (claim) =>
          claimIds.includes(
            claim.id,
          ),
      );

    const entities =
      snapshot.graph.entities.filter(
        (entity) =>
          entityIds.includes(
            entity.id,
          ),
      );

    const relations =
      snapshot.graph.relations.filter(
        (relation) =>
          relationIds.includes(
            relation.id,
          ) ||
          (
            entityIds.includes(
              relation.fromEntityId,
            ) &&
            entityIds.includes(
              relation.toEntityId,
            )
          ),
      );

    const evidence =
      snapshot.graph.evidence.filter(
        (item) =>
          evidenceIds.includes(
            item.id,
          ) ||
          claimIds.includes(
            item.claimId,
          ),
      );

    const knownClaims =
      claims.filter(
        (claim) =>
          claim.state === "KNOWN",
      );

    const inferredClaims =
      claims.filter(
        (claim) =>
          claim.state ===
          "INFERRED",
      );

    const modeledClaims =
      claims.filter(
        (claim) =>
          claim.state ===
          "MODELED",
      );

    const unknownClaims =
      claims.filter(
        (claim) =>
          claim.state ===
          "UNKNOWN",
      );

    const gaps =
      buildGaps(
        unknownClaims,
      );

    const contradictions =
      buildContradictions(
        snapshot,
        claims,
        entityIds,
      );

    const trace = [
      ...hybrid.trace,
      reranked.trace,

      buildContextTrace(
        candidates,
        claims,
        evidence,
        gaps,
        contradictions,
      ),
    ];

    return {
      queryPlan: plan,

      candidates,

      claims,
      entities,
      relations,
      evidence,

      knownClaims,
      inferredClaims,
      modeledClaims,
      unknownClaims,

      gaps,
      contradictions,

      trace,

      summary: {
        candidateCount:
          hybrid.candidates.length,

        selectedCount:
          candidates.length,

        evidenceCount:
          evidence.length,

        unknownCount:
          unknownClaims.length,

        modeledCount:
          modeledClaims.length,

        contradictionCount:
          contradictions.length,
      },
    };
  }
}