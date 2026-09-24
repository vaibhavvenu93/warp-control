import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  MarketObservation,
} from "@/domain/market-radar/ingestion/observation-types";

import {
  buildClaimFingerprint,
  createMarketClaim,
  mergeClaimEvidence,
  triangulateClaim,
} from "./claim-engine";

import type {
  ClaimCandidate,
} from "./claim-types";

const NOW =
  "2026-09-23T12:00:00.000Z";

const candidate:
  ClaimCandidate = {
    type:
      "PRODUCT_CHANGE",

    subject:
      "Example CI",

    predicate:
      "has a product-related observation",

    object:
      "Faster runner launch",

    statement:
      "Example CI has a product-related observation: Faster runner launch.",

    categories: [
      "PRODUCT",
    ],
  };

function makeObservation(
  id: string,
  sourceId: string,
  trustScore: number,
): MarketObservation {
  return {
    id,
    fingerprint:
      `fingerprint-${id}`,

    externalId:
      `external-${id}`,

    sourceId,

    sourceName:
      sourceId,

    sourceKind:
      "WEBSITE",

    sourceUri:
      `https://${sourceId}.example.com`,

    title:
      "Faster runner launch",

    body:
      "Observed product update.",

    canonicalUri:
      `https://${sourceId}.example.com/update`,

    publishedAt:
      "2026-09-23T10:00:00.000Z",

    observedAt:
      "2026-09-23T10:00:00.000Z",

    ingestedAt:
      NOW,

    categories: [
      "PRODUCT",
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
    ],

    provenance:
      "PUBLIC",

    trustScore,

    freshness: {
      ageHours: 2,
      score: 99.5,
      band: "FRESH",
    },

    state:
      "NORMALIZED",

    metadata: {},
  };
}

describe(
  "Market claim engine",
  () => {
    it(
      "creates deterministic claim fingerprints",
      () => {
        expect(
          buildClaimFingerprint(
            candidate,
          ),
        ).toBe(
          buildClaimFingerprint(
            candidate,
          ),
        );
      },
    );

    it(
      "creates a claim with observation evidence",
      () => {
        const claim =
          createMarketClaim(
            candidate,
            makeObservation(
              "obs-1",
              "source-1",
              0.9,
            ),
            NOW,
          );

        expect(
          claim.evidence,
        ).toHaveLength(1);

        expect(
          claim.epistemicState,
        ).toBe(
          "OBSERVED",
        );
      },
    );

    it(
      "corroborates a claim using an independent source",
      () => {
        const first =
          createMarketClaim(
            candidate,
            makeObservation(
              "obs-1",
              "source-1",
              0.9,
            ),
            NOW,
          );

        const merged =
          mergeClaimEvidence(
            first,
            makeObservation(
              "obs-2",
              "source-2",
              0.85,
            ),
            NOW,
          );

        expect(
          merged.evidence,
        ).toHaveLength(2);

        expect(
          merged.epistemicState,
        ).toBe(
          "CORROBORATED",
        );

        expect(
          merged.confidence,
        ).toBeGreaterThan(
          first.confidence,
        );
      },
    );

    it(
      "does not count repeated evidence from one source as source diversity",
      () => {
        const first =
          createMarketClaim(
            candidate,
            makeObservation(
              "obs-1",
              "source-1",
              0.9,
            ),
            NOW,
          );

        const merged =
          mergeClaimEvidence(
            first,
            makeObservation(
              "obs-2",
              "source-1",
              0.9,
            ),
            NOW,
          );

        const result =
          triangulateClaim(
            merged,
          );

        expect(
          result.evidenceCount,
        ).toBe(2);

        expect(
          result.independentSourceCount,
        ).toBe(1);

        expect(
          result.epistemicState,
        ).toBe(
          "OBSERVED",
        );
      },
    );

    it(
      "does not attach the same observation twice",
      () => {
        const observation =
          makeObservation(
            "obs-1",
            "source-1",
            0.9,
          );

        const first =
          createMarketClaim(
            candidate,
            observation,
            NOW,
          );

        const merged =
          mergeClaimEvidence(
            first,
            observation,
            NOW,
          );

        expect(
          merged.evidence,
        ).toHaveLength(1);
      },
    );
  },
);