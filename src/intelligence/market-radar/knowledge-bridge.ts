import type {
  KnowledgeClaim,
  KnowledgeDocument,
  KnowledgeEntity,
  KnowledgeEvidence,
  KnowledgeSource,
  KnowledgeState,
} from "@/domain/knowledge/types";

import type {
  MarketClaim,
  MarketClaimEvidence,
} from "@/domain/market-radar/claims/claim-types";

import type {
  ExternalSourceDefinition,
} from "@/domain/market-radar/ingestion/observation-types";

import {
  externalSourceToKnowledgeSource,
} from "@/domain/market-radar/ingestion/source-registry";

import type {
  KnowledgeRepository,
} from "@/repositories/knowledge/knowledge-repository";

export interface MarketKnowledgeBridgeInput {
  claims: MarketClaim[];

  sources:
    ExternalSourceDefinition[];

  syncedAt: string;
}

export interface MarketKnowledgeBridgeResult {
  sourceCount: number;

  entityCount: number;

  documentCount: number;

  claimCount: number;

  evidenceCount: number;

  knownCount: number;

  inferredCount: number;

  claimIds: string[];
}

function safeId(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    );
}

function unique<T>(
  values: T[],
): T[] {
  return Array.from(
    new Set(values),
  );
}

function knowledgeStateForClaim(
  claim: MarketClaim,
): KnowledgeState {
  const independentSources =
    new Set(
      claim.evidence.map(
        (evidence) =>
          evidence.sourceId,
      ),
    ).size;

  if (
    claim.epistemicState ===
      "CORROBORATED" &&
    independentSources >= 2 &&
    claim.confidence >= 70
  ) {
    return "KNOWN";
  }

  return "INFERRED";
}

function entityTypeForMarketEntity(
  type:
    MarketClaim["entities"][number]["type"],
): KnowledgeEntity["type"] {
  switch (type) {
    case "COMPANY":
      return "COMPANY";

    case "PRODUCT":
      return "PRODUCT";

    case "TECHNOLOGY":
      return "TECHNOLOGY";

    case "MARKET":
      return "MARKET";

    case "PERSON":
      return "PERSON";

    case "CONCEPT":
      return "CONCEPT";

    /*
     * KnowledgeEntityType does not currently
     * have dedicated REPOSITORY or PRICING
     * entity types. Preserve the original
     * external type in attributes instead
     * of pretending the ontology has one.
     */
    case "REPOSITORY":
    case "PRICING":
    case "CUSTOMER":
    default:
      return "CONCEPT";
  }
}

function entityId(
  normalizedName: string,
): string {
  return (
    "market-entity-" +
    safeId(
      normalizedName,
    )
  );
}

function sourceForEvidence(
  evidence:
    MarketClaimEvidence,

  sources:
    Map<
      string,
      ExternalSourceDefinition
    >,
): ExternalSourceDefinition | undefined {
  return sources.get(
    evidence.sourceId,
  );
}

function documentId(
  claimId: string,
  observationId: string,
): string {
  return (
    `market-document-` +
    `${safeId(claimId)}-` +
    `${safeId(observationId)}`
  );
}

function evidenceId(
  claimId: string,
  observationId: string,
): string {
  return (
    `market-evidence-` +
    `${safeId(claimId)}-` +
    `${safeId(observationId)}`
  );
}

function knowledgeClaimId(
  marketClaimId: string,
): string {
  return (
    "market-knowledge-" +
    safeId(
      marketClaimId,
    )
  );
}

function buildKnowledgeEntity(
  entity:
    MarketClaim["entities"][number],
): KnowledgeEntity {
  return {
    id:
      entityId(
        entity.normalizedName,
      ),

    type:
      entityTypeForMarketEntity(
        entity.type,
      ),

    name:
      entity.name,

    aliases: [],

    attributes: {
      normalizedName:
        entity.normalizedName,

      marketEntityType:
        entity.type,

      origin:
        "MARKET_RADAR",
    },
  };
}

function buildDocument(
  claim: MarketClaim,
  evidence:
    MarketClaimEvidence,

  source:
    ExternalSourceDefinition | undefined,

  syncedAt: string,
): KnowledgeDocument {
  return {
    id:
      documentId(
        claim.id,
        evidence.observationId,
      ),

    sourceId:
      evidence.sourceId,

    title:
      `Market evidence: ${claim.subject}`,

    content:
      claim.statement,

    createdAt:
      evidence.observedAt,

    updatedAt:
      syncedAt,

    effectiveAt:
      evidence.observedAt,

    tags: unique([
      "market-radar",
      "external-intelligence",
      claim.type.toLowerCase(),
      ...claim.categories.map(
        (category) =>
          category.toLowerCase(),
      ),
    ]),

    entityIds:
      unique(
        claim.entities.map(
          (entity) =>
            entityId(
              entity.normalizedName,
            ),
        ),
      ),

    metadata: {
      marketClaimId:
        claim.id,

      observationId:
        evidence.observationId,

      sourceUri:
        evidence.sourceUri,

      sourceName:
        evidence.sourceName,

      sourceKind:
        source?.kind,

      epistemicState:
        claim.epistemicState,

      claimStrength:
        claim.strength,

      marketConfidence:
        claim.confidence,

      origin:
        "MARKET_RADAR",
    },
  };
}

function buildKnowledgeEvidence(
  claim: MarketClaim,
  evidence:
    MarketClaimEvidence,
): KnowledgeEvidence {
  return {
    id:
      evidenceId(
        claim.id,
        evidence.observationId,
      ),

    claimId:
      knowledgeClaimId(
        claim.id,
      ),

    sourceId:
      evidence.sourceId,

    documentId:
      documentId(
        claim.id,
        evidence.observationId,
      ),

    /*
     * MarketClaimEvidence intentionally stores
     * provenance metadata rather than arbitrary
     * copied webpage text. The bounded market
     * claim is therefore the evidence excerpt
     * exposed to Company Brain.
     */
    excerpt:
      claim.statement,

    reliability:
      Math.max(
        0,
        Math.min(
          1,
          (
            evidence.trustScore +
            evidence.freshnessScore /
              100
          ) /
            2,
        ),
      ),

    observedAt:
      evidence.observedAt,
  };
}

function buildKnowledgeClaim(
  claim: MarketClaim,
): KnowledgeClaim {
  const state =
    knowledgeStateForClaim(
      claim,
    );

  const primaryEvidence =
    [...claim.evidence].sort(
      (
        left,
        right,
      ) =>
        right.observedAt.localeCompare(
          left.observedAt,
        ),
    )[0];

  return {
    id:
      knowledgeClaimId(
        claim.id,
      ),

    statement:
      claim.statement,

    state,

    provenance:
      primaryEvidence
        ?.provenance ??
      "PUBLIC",

    confidence:
      Math.max(
        0,
        Math.min(
          1,
          claim.confidence /
            100,
        ),
      ),

    sourceId:
      primaryEvidence
        ?.sourceId ??
      "market-radar",

    documentId:
      primaryEvidence
        ? documentId(
            claim.id,
            primaryEvidence
              .observationId,
          )
        : undefined,

    entityIds:
      unique(
        claim.entities.map(
          (entity) =>
            entityId(
              entity.normalizedName,
            ),
        ),
      ),

    observedAt:
      claim.lastObservedAt,

    validFrom:
      claim.firstObservedAt,

    metadata: {
      marketClaimId:
        claim.id,

      marketClaimType:
        claim.type,

      epistemicState:
        claim.epistemicState,

      claimStrength:
        claim.strength,

      evidenceCount:
        claim.evidence.length,

      independentSourceCount:
        new Set(
          claim.evidence.map(
            (evidence) =>
              evidence.sourceId,
          ),
        ).size,

      origin:
        "MARKET_RADAR",
    },
  };
}

export class MarketKnowledgeBridge {
  constructor(
    private readonly repository:
      KnowledgeRepository,
  ) {}

  async sync(
    input:
      MarketKnowledgeBridgeInput,
  ): Promise<
    MarketKnowledgeBridgeResult
  > {
    const sourceMap =
      new Map(
        input.sources.map(
          (source) => [
            source.id,
            source,
          ],
        ),
      );

    const knowledgeSources =
      input.sources.map(
        (
          source,
        ): KnowledgeSource =>
          ({
            ...externalSourceToKnowledgeSource(
              source,
            ),

            lastSyncedAt:
              input.syncedAt,
          }),
      );

    for (
      const source
      of knowledgeSources
    ) {
      await this.repository
        .saveSource(
          source,
        );
    }

    const entities =
      new Map<
        string,
        KnowledgeEntity
      >();

    let documentCount = 0;
    let evidenceCount = 0;
    let knownCount = 0;
    let inferredCount = 0;

    const claimIds:
      string[] = [];

    for (
      const claim
      of input.claims
    ) {
      for (
        const entity
        of claim.entities
      ) {
        const knowledgeEntity =
          buildKnowledgeEntity(
            entity,
          );

        entities.set(
          knowledgeEntity.id,
          knowledgeEntity,
        );
      }

      for (
        const evidence
        of claim.evidence
      ) {
        const source =
          sourceForEvidence(
            evidence,
            sourceMap,
          );

        const document =
          buildDocument(
            claim,
            evidence,
            source,
            input.syncedAt,
          );

        await this.repository
          .saveDocument(
            document,
          );

        documentCount += 1;

        const knowledgeEvidence =
          buildKnowledgeEvidence(
            claim,
            evidence,
          );

        await this.repository
          .saveEvidence(
            knowledgeEvidence,
          );

        evidenceCount += 1;
      }

      const knowledgeClaim =
        buildKnowledgeClaim(
          claim,
        );

      await this.repository
        .saveClaim(
          knowledgeClaim,
        );

      claimIds.push(
        knowledgeClaim.id,
      );

      if (
        knowledgeClaim.state ===
        "KNOWN"
      ) {
        knownCount += 1;
      } else {
        inferredCount += 1;
      }
    }

    for (
      const entity
      of entities.values()
    ) {
      await this.repository
        .saveEntity(
          entity,
        );
    }

    return {
      sourceCount:
        knowledgeSources.length,

      entityCount:
        entities.size,

      documentCount,

      claimCount:
        input.claims.length,

      evidenceCount,

      knownCount,

      inferredCount,

      claimIds,
    };
  }
}