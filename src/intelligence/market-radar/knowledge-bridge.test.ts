import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  MarketClaim,
} from "@/domain/market-radar/claims/claim-types";

import {
  createExternalSource,
} from "@/domain/market-radar/ingestion/source-registry";

import {
  InMemoryKnowledgeRepository,
} from "@/repositories/knowledge/knowledge-repository";

import {
  MarketKnowledgeBridge,
} from "./knowledge-bridge";

const sourceOne =
  createExternalSource({
    id:
      "source-one",

    name:
      "Source One",

    kind:
      "WEBSITE",

    sourceType:
      "PUBLIC_WEB",

    provenance:
      "PUBLIC",

    uri:
      "https://example.com/one",

    description:
      "Primary public source.",

    trustScore: 0.9,

    enabled: true,

    pollingEligible: true,

    tags: [
      "market-radar",
    ],

    metadata: {},
  });

const sourceTwo =
  createExternalSource({
    id:
      "source-two",

    name:
      "Source Two",

    kind:
      "NEWS",

    sourceType:
      "PUBLIC_WEB",

    provenance:
      "PUBLIC",

    uri:
      "https://example.com/two",

    description:
      "Independent public source.",

    trustScore: 0.85,

    enabled: true,

    pollingEligible: true,

    tags: [
      "market-radar",
    ],

    metadata: {},
  });

function evidence(
  sourceId: string,
  sourceName: string,
  sourceUri: string,
  observationId: string,
) {
  return {
    observationId,

    sourceId,

    sourceName,

    sourceUri,

    provenance:
      "PUBLIC" as const,

    trustScore: 0.9,

    freshnessScore: 95,

    observedAt:
      "2026-09-23T12:00:00.000Z",
  };
}

function claim(
  overrides:
    Partial<MarketClaim> = {},
): MarketClaim {
  return {
    id:
      "claim-product-change",

    fingerprint:
      "fingerprint-1",

    type:
      "PRODUCT_CHANGE",

    subject:
      "Example CI",

    normalizedSubject:
      "example ci",

    predicate:
      "published",

    object:
      "a product update",

    statement:
      "Example CI published a product update.",

    categories: [
      "PRODUCT",
      "CI_INFRASTRUCTURE",
    ],

    entities: [
      {
        name:
          "Example CI",

        normalizedName:
          "example ci",

        type:
          "COMPANY",
      },

      {
        name:
          "example/repo",

        normalizedName:
          "example/repo",

        type:
          "REPOSITORY",
      },
    ],

    evidence: [
      evidence(
        sourceOne.id,
        sourceOne.name,
        sourceOne.uri,
        "observation-1",
      ),
    ],

    epistemicState:
      "OBSERVED",

    strength:
      "MODERATE",

    confidence: 72,

    firstObservedAt:
      "2026-09-23T12:00:00.000Z",

    lastObservedAt:
      "2026-09-23T12:00:00.000Z",

    createdAt:
      "2026-09-23T12:00:00.000Z",

    updatedAt:
      "2026-09-23T12:00:00.000Z",

    metadata: {},

    ...overrides,
  };
}

describe(
  "MarketKnowledgeBridge",
  () => {
    it(
      "syncs public market intelligence into the knowledge repository",
      async () => {
        const repository =
          new InMemoryKnowledgeRepository();

        const bridge =
          new MarketKnowledgeBridge(
            repository,
          );

        const result =
          await bridge.sync({
            claims: [
              claim(),
            ],

            sources: [
              sourceOne,
            ],

            syncedAt:
              "2026-09-23T12:05:00.000Z",
          });

        const snapshot =
          await repository
            .getSnapshot();

        expect(
          result.claimCount,
        ).toBe(1);

        expect(
          snapshot.graph
            .claims,
        ).toHaveLength(1);

        expect(
          snapshot.graph
            .evidence,
        ).toHaveLength(1);

        expect(
          snapshot.sources[0]
            .lastSyncedAt,
        ).toBe(
          "2026-09-23T12:05:00.000Z",
        );
      },
    );

    it(
      "keeps a single-source observation inferred",
      async () => {
        const repository =
          new InMemoryKnowledgeRepository();

        const bridge =
          new MarketKnowledgeBridge(
            repository,
          );

        await bridge.sync({
          claims: [
            claim({
              confidence: 90,

              epistemicState:
                "OBSERVED",
            }),
          ],

          sources: [
            sourceOne,
          ],

          syncedAt:
            "2026-09-23T12:05:00.000Z",
        });

        const snapshot =
          await repository
            .getSnapshot();

        expect(
          snapshot.graph
            .claims[0].state,
        ).toBe(
          "INFERRED",
        );
      },
    );

    it(
      "promotes a corroborated multi-source claim to known",
      async () => {
        const repository =
          new InMemoryKnowledgeRepository();

        const bridge =
          new MarketKnowledgeBridge(
            repository,
          );

        await bridge.sync({
          claims: [
            claim({
              epistemicState:
                "CORROBORATED",

              confidence: 84,

              strength:
                "STRONG",

              evidence: [
                evidence(
                  sourceOne.id,
                  sourceOne.name,
                  sourceOne.uri,
                  "observation-1",
                ),

                evidence(
                  sourceTwo.id,
                  sourceTwo.name,
                  sourceTwo.uri,
                  "observation-2",
                ),
              ],
            }),
          ],

          sources: [
            sourceOne,
            sourceTwo,
          ],

          syncedAt:
            "2026-09-23T12:05:00.000Z",
        });

        const snapshot =
          await repository
            .getSnapshot();

        expect(
          snapshot.graph
            .claims[0].state,
        ).toBe(
          "KNOWN",
        );
      },
    );

    it(
      "does not promote low-confidence corroboration to known",
      async () => {
        const repository =
          new InMemoryKnowledgeRepository();

        const bridge =
          new MarketKnowledgeBridge(
            repository,
          );

        await bridge.sync({
          claims: [
            claim({
              epistemicState:
                "CORROBORATED",

              confidence: 62,

              evidence: [
                evidence(
                  sourceOne.id,
                  sourceOne.name,
                  sourceOne.uri,
                  "observation-1",
                ),

                evidence(
                  sourceTwo.id,
                  sourceTwo.name,
                  sourceTwo.uri,
                  "observation-2",
                ),
              ],
            }),
          ],

          sources: [
            sourceOne,
            sourceTwo,
          ],

          syncedAt:
            "2026-09-23T12:05:00.000Z",
        });

        const snapshot =
          await repository
            .getSnapshot();

        expect(
          snapshot.graph
            .claims[0].state,
        ).toBe(
          "INFERRED",
        );
      },
    );

    it(
      "preserves market entity ontology when the brain has no dedicated entity type",
      async () => {
        const repository =
          new InMemoryKnowledgeRepository();

        const bridge =
          new MarketKnowledgeBridge(
            repository,
          );

        await bridge.sync({
          claims: [
            claim(),
          ],

          sources: [
            sourceOne,
          ],

          syncedAt:
            "2026-09-23T12:05:00.000Z",
        });

        const snapshot =
          await repository
            .getSnapshot();

        const repositoryEntity =
          snapshot.graph.entities.find(
            (entity) =>
              entity.name ===
              "example/repo",
          );

        expect(
          repositoryEntity?.type,
        ).toBe(
          "CONCEPT",
        );

        expect(
          repositoryEntity
            ?.attributes
            .marketEntityType,
        ).toBe(
          "REPOSITORY",
        );
      },
    );

    it(
      "normalizes market confidence to the brain zero-to-one confidence scale",
      async () => {
        const repository =
          new InMemoryKnowledgeRepository();

        const bridge =
          new MarketKnowledgeBridge(
            repository,
          );

        await bridge.sync({
          claims: [
            claim({
              confidence: 82,
            }),
          ],

          sources: [
            sourceOne,
          ],

          syncedAt:
            "2026-09-23T12:05:00.000Z",
        });

        const snapshot =
          await repository
            .getSnapshot();

        expect(
          snapshot.graph
            .claims[0]
            .confidence,
        ).toBe(0.82);
      },
    );
  },
);