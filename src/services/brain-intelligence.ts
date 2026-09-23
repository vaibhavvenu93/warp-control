import type {
  BrainBlindSpot,
  BrainIntelligenceSnapshot,
  BrainLineageView,
  BrainSourceView,
} from "@/domain/brain/intelligence";

import type {
  KnowledgeProvenance,
  KnowledgeSnapshot,
  KnowledgeState,
} from "@/domain/knowledge/types";

function average(
  values: number[],
): number {
  if (values.length === 0) {
    return 0;
  }

  return (
    values.reduce(
      (total, value) =>
        total + value,
      0,
    ) / values.length
  );
}

function round(
  value: number,
): number {
  return Math.round(
    value * 10000,
  ) / 10000;
}

function requiredEvidenceFrom(
  metadata: Record<
    string,
    unknown
  >,
): string[] {
  const value =
    metadata.requiredEvidence;

  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (
      item,
    ): item is string =>
      typeof item === "string",
  );
}

function buildSources(
  snapshot:
    KnowledgeSnapshot,
): BrainSourceView[] {
  return snapshot.sources.map(
    (source) => ({
      id: source.id,
      name: source.name,
      type: source.type,
      provenance:
        source.provenance,
      description:
        source.description,
      trustScore:
        source.trustScore,
      connected:
        source.connected,
      readOnly:
        source.readOnly,
      lastSyncedAt:
        source.lastSyncedAt,

      documentCount:
        snapshot.documents.filter(
          (document) =>
            document.sourceId ===
            source.id,
        ).length,

      claimCount:
        snapshot.graph.claims.filter(
          (claim) =>
            claim.sourceId ===
            source.id,
        ).length,

      evidenceCount:
        snapshot.graph.evidence.filter(
          (evidence) =>
            evidence.sourceId ===
            source.id,
        ).length,
    }),
  );
}

function buildLineage(
  snapshot:
    KnowledgeSnapshot,
): BrainLineageView[] {
  return snapshot.graph.claims.map(
    (claim) => {
      const source =
        snapshot.sources.find(
          (candidate) =>
            candidate.id ===
            claim.sourceId,
        );

      if (!source) {
        throw new Error(
          `Knowledge source ${claim.sourceId} was not found for claim ${claim.id}.`,
        );
      }

      const evidence =
        snapshot.graph.evidence.find(
          (candidate) =>
            candidate.claimId ===
            claim.id,
        );

      const document =
        claim.documentId
          ? snapshot.documents.find(
              (candidate) =>
                candidate.id ===
                claim.documentId,
            )
          : undefined;

      return {
        claimId: claim.id,
        statement:
          claim.statement,
        state: claim.state,
        provenance:
          claim.provenance,
        confidence:
          claim.confidence,

        evidence:
          evidence
            ? {
                id: evidence.id,
                excerpt:
                  evidence.excerpt,
                reliability:
                  evidence.reliability,
                observedAt:
                  evidence.observedAt,
              }
            : undefined,

        document:
          document
            ? {
                id: document.id,
                title:
                  document.title,
                tags:
                  document.tags,
              }
            : undefined,

        source: {
          id: source.id,
          name: source.name,
          type: source.type,
          provenance:
            source.provenance,
          trustScore:
            source.trustScore,
          connected:
            source.connected,
        },

        entityIds:
          claim.entityIds,

        requiredEvidence:
          requiredEvidenceFrom(
            claim.metadata,
          ),
      };
    },
  );
}

function buildBlindSpots(
  snapshot:
    KnowledgeSnapshot,
): BrainBlindSpot[] {
  return snapshot.graph.claims
    .filter(
      (claim) =>
        claim.state ===
        "UNKNOWN",
    )
    .map((claim) => ({
      claimId: claim.id,
      statement:
        claim.statement,
      confidence:
        claim.confidence,
      entityIds:
        claim.entityIds,
      requiredEvidence:
        requiredEvidenceFrom(
          claim.metadata,
        ),
      sourceId:
        claim.sourceId,
    }));
}

export function
buildBrainIntelligenceSnapshot(
  snapshot:
    KnowledgeSnapshot,
  generatedAt:
    string,
): BrainIntelligenceSnapshot {
  const knowledgeStates:
    Record<
      KnowledgeState,
      number
    > = {
      KNOWN: 0,
      INFERRED: 0,
      MODELED: 0,
      UNKNOWN: 0,
    };

  const provenance:
    Record<
      KnowledgeProvenance,
      number
    > = {
      PUBLIC: 0,
      CONNECTED: 0,
      INTERNAL: 0,
      MODELED: 0,
      ASSUMED: 0,
    };

  for (
    const claim of
    snapshot.graph.claims
  ) {
    knowledgeStates[
      claim.state
    ] += 1;

    provenance[
      claim.provenance
    ] += 1;
  }

  return {
    generatedAt,

    summary: {
      sourceCount:
        snapshot.sources.length,

      connectedSourceCount:
        snapshot.sources.filter(
          (source) =>
            source.connected,
        ).length,

      documentCount:
        snapshot.documents.length,

      chunkCount:
        snapshot.chunks.length,

      entityCount:
        snapshot.graph.entities
          .length,

      relationCount:
        snapshot.graph.relations
          .length,

      claimCount:
        snapshot.graph.claims
          .length,

      evidenceCount:
        snapshot.graph.evidence
          .length,

      averageSourceTrust:
        round(
          average(
            snapshot.sources.map(
              (source) =>
                source.trustScore,
            ),
          ),
        ),

      averageEvidenceReliability:
        round(
          average(
            snapshot.graph.evidence.map(
              (evidence) =>
                evidence.reliability,
            ),
          ),
        ),
    },

    knowledgeStates,

    provenance,

    sources:
      buildSources(snapshot),

    lineage:
      buildLineage(snapshot),

    graph: {
      nodes:
        snapshot.graph.entities.map(
          (entity) => ({
            id: entity.id,
            name: entity.name,
            type: entity.type,
            description:
              entity.description,
          }),
        ),

      edges:
        snapshot.graph.relations.map(
          (relation) => ({
            id: relation.id,
            from:
              relation.fromEntityId,
            to:
              relation.toEntityId,
            type:
              relation.type,
            description:
              relation.description,
            confidence:
              relation.confidence,
            evidenceIds:
              relation.evidenceIds,
          }),
        ),
    },

    blindSpots:
      buildBlindSpots(snapshot),
  };
}