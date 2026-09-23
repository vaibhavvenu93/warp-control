import type {
  KnowledgeClaim,
  KnowledgeEntity,
  KnowledgeRelation,
  KnowledgeSnapshot,
} from "@/domain/knowledge/types";

import type {
  QueryPlan,
  RetrievalStrategy,
} from "@/domain/knowledge/query/types";

import type {
  RetrievalCandidate,
  RetrievalTraceStep,
} from "@/domain/knowledge/query/retrieval-types";

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s$.-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const unique = <T>(values: T[]) =>
  [...new Set(values)];

function matchedTerms(
  content: string,
  terms: string[],
) {
  const normalized = normalize(content);

  return terms.filter((term) =>
    normalized.includes(term),
  );
}

function lexicalScore(
  content: string,
  terms: string[],
) {
  if (terms.length === 0) {
    return 0;
  }

  const matches = matchedTerms(
    content,
    terms,
  );

  return Number(
    (
      matches.length /
      terms.length
    ).toFixed(4),
  );
}

function findEntityByHint(
  snapshot: KnowledgeSnapshot,
  value: string,
) {
  const normalizedHint =
    normalize(value);

  return snapshot.graph.entities.find(
    (entity) => {
      const candidates = [
        entity.name,
        ...entity.aliases,
      ].map(normalize);

      return candidates.some(
        (candidate) =>
          candidate ===
            normalizedHint ||
          candidate.includes(
            normalizedHint,
          ) ||
          normalizedHint.includes(
            candidate,
          ),
      );
    },
  );
}

function evidenceIdsForClaim(
  snapshot: KnowledgeSnapshot,
  claimId: string,
) {
  return snapshot.graph.evidence
    .filter(
      (evidence) =>
        evidence.claimId === claimId,
    )
    .map((evidence) => evidence.id);
}

function candidateFromClaim(
  snapshot: KnowledgeSnapshot,
  claim: KnowledgeClaim,
  plan: QueryPlan,
  strategies: RetrievalStrategy[],
  entityAffinity: number,
  graphAffinity: number,
): RetrievalCandidate {
  return {
    id: `candidate-claim-${claim.id}`,
    type: "CLAIM",

    title: claim.statement,
    content: claim.statement,

    entityIds: claim.entityIds,

    claimId: claim.id,
    sourceId: claim.sourceId,

    evidenceIds:
      evidenceIdsForClaim(
        snapshot,
        claim.id,
      ),

    state: claim.state,
    provenance: claim.provenance,
    confidence: claim.confidence,

    matchedTerms: matchedTerms(
      claim.statement,
      plan.terms,
    ),

    matchedStrategies: strategies,

    lexicalScore: lexicalScore(
      claim.statement,
      plan.terms,
    ),

    entityAffinity,
    graphAffinity,

    metadata: {
      ...claim.metadata,

      observedAt:
        claim.observedAt,

      validFrom:
        claim.validFrom,

      validUntil:
        claim.validUntil,

      supersedesClaimId:
        claim.supersedesClaimId,
    },
  };
}

function candidateFromEntity(
  entity: KnowledgeEntity,
  plan: QueryPlan,
): RetrievalCandidate {
  const content = [
    entity.name,
    ...entity.aliases,
    entity.description ?? "",
    JSON.stringify(
      entity.attributes,
    ),
  ].join(" ");

  return {
    id: `candidate-entity-${entity.id}`,
    type: "ENTITY",

    title: entity.name,
    content,

    entityIds: [entity.id],

    evidenceIds: [],

    matchedTerms: matchedTerms(
      content,
      plan.terms,
    ),

    matchedStrategies: ["ENTITY"],

    lexicalScore: lexicalScore(
      content,
      plan.terms,
    ),

    entityAffinity: 1,
    graphAffinity: 0,

    metadata: {
      entityType: entity.type,
      ...entity.attributes,
    },
  };
}

function candidateFromRelation(
  relation: KnowledgeRelation,
  snapshot: KnowledgeSnapshot,
): RetrievalCandidate {
  const from =
    snapshot.graph.entities.find(
      (entity) =>
        entity.id ===
        relation.fromEntityId,
    );

  const to =
    snapshot.graph.entities.find(
      (entity) =>
        entity.id ===
        relation.toEntityId,
    );

  const content = [
    from?.name ??
      relation.fromEntityId,
    relation.type,
    to?.name ??
      relation.toEntityId,
    relation.description ?? "",
  ].join(" ");

  return {
    id: `candidate-relation-${relation.id}`,
    type: "RELATION",

    title: content,
    content,

    entityIds: [
      relation.fromEntityId,
      relation.toEntityId,
    ],

    relationId: relation.id,

    evidenceIds:
      relation.evidenceIds,

    confidence:
      relation.confidence,

    matchedTerms: [],

    matchedStrategies: ["GRAPH"],

    lexicalScore: 0,
    entityAffinity: 0.75,
    graphAffinity: 1,

    metadata: {
      relationType:
        relation.type,

      description:
        relation.description,
    },
  };
}

function candidateFromChunk(
  snapshot: KnowledgeSnapshot,
  chunkId: string,
  plan: QueryPlan,
):
  | RetrievalCandidate
  | undefined {
  const chunk =
    snapshot.chunks.find(
      (candidate) =>
        candidate.id === chunkId,
    );

  if (!chunk) {
    return undefined;
  }

  const document =
    snapshot.documents.find(
      (candidate) =>
        candidate.id ===
        chunk.documentId,
    );

  if (!document) {
    return undefined;
  }

  const score = lexicalScore(
    chunk.content,
    plan.terms,
  );

  if (score === 0) {
    return undefined;
  }

  return {
    id: `candidate-chunk-${chunk.id}`,
    type: "CHUNK",

    title: document.title,
    content: chunk.content,

    entityIds: chunk.entityIds,

    chunkId: chunk.id,
    sourceId: chunk.sourceId,

    evidenceIds: [],

    matchedTerms: matchedTerms(
      chunk.content,
      plan.terms,
    ),

    matchedStrategies: ["LEXICAL"],

    lexicalScore: score,

    entityAffinity:
      plan.entityHints.length > 0 &&
      chunk.entityIds.length > 0
        ? 0.5
        : 0,

    graphAffinity: 0,

    metadata: {
      documentId:
        document.id,

      tokenEstimate:
        chunk.tokenEstimate,

      tags: chunk.tags,
    },
  };
}

function mergeCandidates(
  candidates: RetrievalCandidate[],
) {
  const merged =
    new Map<
      string,
      RetrievalCandidate
    >();

  for (const candidate of candidates) {
    const existing =
      merged.get(candidate.id);

    if (!existing) {
      merged.set(
        candidate.id,
        candidate,
      );

      continue;
    }

    existing.matchedTerms =
      unique([
        ...existing.matchedTerms,
        ...candidate.matchedTerms,
      ]);

    existing.matchedStrategies =
      unique([
        ...existing.matchedStrategies,
        ...candidate.matchedStrategies,
      ]);

    existing.evidenceIds =
      unique([
        ...existing.evidenceIds,
        ...candidate.evidenceIds,
      ]);

    existing.entityIds =
      unique([
        ...existing.entityIds,
        ...candidate.entityIds,
      ]);

    existing.lexicalScore =
      Math.max(
        existing.lexicalScore,
        candidate.lexicalScore,
      );

    existing.entityAffinity =
      Math.max(
        existing.entityAffinity,
        candidate.entityAffinity,
      );

    existing.graphAffinity =
      Math.max(
        existing.graphAffinity,
        candidate.graphAffinity,
      );
  }

  return [...merged.values()];
}

export interface HybridRetrievalResult {
  candidates:
    RetrievalCandidate[];

  trace:
    RetrievalTraceStep[];

  seedEntityIds: string[];
}

export class HybridRetriever {
  retrieve(
    snapshot: KnowledgeSnapshot,
    plan: QueryPlan,
  ): HybridRetrievalResult {
    const candidates:
      RetrievalCandidate[] = [];

    const trace:
      RetrievalTraceStep[] = [];

    const seedEntities =
      plan.entityHints
        .map((hint) =>
          findEntityByHint(
            snapshot,
            hint.value,
          ),
        )
        .filter(
          (
            entity,
          ): entity is KnowledgeEntity =>
            Boolean(entity),
        );

    const seedEntityIds =
      unique(
        seedEntities.map(
          (entity) => entity.id,
        ),
      );

    trace.push({
      stage: "PLAN",

      message:
        `Retrieval plan accepted with ` +
        `${plan.strategies.length} strategies.`,

      candidateIds: [],

      metadata: {
        intent: plan.intent,
        strategies:
          plan.strategies,
        seedEntityIds,
      },
    });

    if (
      plan.strategies.includes(
        "LEXICAL",
      )
    ) {
      const lexicalCandidates =
        snapshot.chunks
          .map((chunk) =>
            candidateFromChunk(
              snapshot,
              chunk.id,
              plan,
            ),
          )
          .filter(
            (
              candidate,
            ): candidate is RetrievalCandidate =>
              Boolean(candidate),
          );

      candidates.push(
        ...lexicalCandidates,
      );

      trace.push({
        stage: "LEXICAL",

        message:
          `Lexical retrieval produced ` +
          `${lexicalCandidates.length} candidate(s).`,

        candidateIds:
          lexicalCandidates.map(
            (candidate) =>
              candidate.id,
          ),

        metadata: {
          terms: plan.terms,
        },
      });
    }

    if (
      plan.strategies.includes(
        "ENTITY",
      )
    ) {
      const entityCandidates =
        seedEntities.map(
          (entity) =>
            candidateFromEntity(
              entity,
              plan,
            ),
        );

      candidates.push(
        ...entityCandidates,
      );

      trace.push({
        stage: "ENTITY",

        message:
          `Entity resolution produced ` +
          `${entityCandidates.length} seed candidate(s).`,

        candidateIds:
          entityCandidates.map(
            (candidate) =>
              candidate.id,
          ),

        metadata: {
          seedEntityIds,
        },
      });
    }

    if (
      plan.strategies.includes(
        "CLAIM",
      )
    ) {
      const relevantClaims =
        seedEntityIds.length > 0
          ? snapshot.graph.claims.filter(
              (claim) =>
                claim.entityIds.some(
                  (entityId) =>
                    seedEntityIds.includes(
                      entityId,
                    ),
                ),
            )
          : snapshot.graph.claims.filter(
              (claim) =>
                lexicalScore(
                  claim.statement,
                  plan.terms,
                ) > 0,
            );

      const claimCandidates =
        relevantClaims.map(
          (claim) =>
            candidateFromClaim(
              snapshot,
              claim,
              plan,
              ["CLAIM"],

              claim.entityIds.some(
                (entityId) =>
                  seedEntityIds.includes(
                    entityId,
                  ),
              )
                ? 1
                : 0,

              0,
            ),
        );

      candidates.push(
        ...claimCandidates,
      );

      trace.push({
        stage: "CLAIM",

        message:
          `Claim retrieval produced ` +
          `${claimCandidates.length} candidate(s).`,

        candidateIds:
          claimCandidates.map(
            (candidate) =>
              candidate.id,
          ),

        metadata: {
          claimIds:
            relevantClaims.map(
              (claim) =>
                claim.id,
            ),
        },
      });
    }

    if (
      plan.strategies.includes(
        "GRAPH",
      ) &&
      seedEntityIds.length > 0
    ) {
      const graphRelations =
        snapshot.graph.relations.filter(
          (relation) =>
            seedEntityIds.includes(
              relation.fromEntityId,
            ) ||
            seedEntityIds.includes(
              relation.toEntityId,
            ),
        );

      const graphEntityIds =
        unique(
          graphRelations.flatMap(
            (relation) => [
              relation.fromEntityId,
              relation.toEntityId,
            ],
          ),
        );

      const graphClaims =
        snapshot.graph.claims.filter(
          (claim) =>
            claim.entityIds.some(
              (entityId) =>
                graphEntityIds.includes(
                  entityId,
                ),
            ),
        );

      const relationCandidates =
        graphRelations.map(
          (relation) =>
            candidateFromRelation(
              relation,
              snapshot,
            ),
        );

      const graphClaimCandidates =
        graphClaims.map(
          (claim) =>
            candidateFromClaim(
              snapshot,
              claim,
              plan,
              ["GRAPH"],

              claim.entityIds.some(
                (entityId) =>
                  seedEntityIds.includes(
                    entityId,
                  ),
              )
                ? 1
                : 0.65,

              1,
            ),
        );

      candidates.push(
        ...relationCandidates,
        ...graphClaimCandidates,
      );

      trace.push({
        stage: "GRAPH",

        message:
          `Graph expansion followed ` +
          `${graphRelations.length} relation(s) ` +
          `and surfaced ${graphClaims.length} claim(s).`,

        candidateIds: [
          ...relationCandidates,
          ...graphClaimCandidates,
        ].map(
          (candidate) =>
            candidate.id,
        ),

        metadata: {
          relationIds:
            graphRelations.map(
              (relation) =>
                relation.id,
            ),

          expandedEntityIds:
            graphEntityIds,
        },
      });
    }

    return {
      candidates:
        mergeCandidates(
          candidates,
        ),

      trace,

      seedEntityIds,
    };
  }
}