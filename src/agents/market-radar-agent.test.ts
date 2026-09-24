import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  MarketClaim,
} from "@/domain/market-radar/claims/claim-types";

import {
  marketRadarAgent,
} from "./market-radar-agent";

function claim(
  overrides:
    Partial<MarketClaim> = {},
): MarketClaim {
  return {
    id:
      "claim-1",

    fingerprint:
      "fingerprint-1",

    type:
      "PRODUCT_CHANGE",

    subject:
      "Example CI",

    normalizedSubject:
      "example ci",

    predicate:
      "has a product-related observation",

    object:
      "Runner launch",

    statement:
      "Example CI has a product-related observation: Runner launch.",

    categories: [
      "PRODUCT",
    ],

    entities: [],

    evidence: [
      {
        observationId:
          "obs-1",

        sourceId:
          "source-1",

        sourceName:
          "Source 1",

        sourceUri:
          "https://example.com/1",

        provenance:
          "PUBLIC",

        trustScore:
          0.9,

        freshnessScore:
          95,

        observedAt:
          "2026-09-23T10:00:00.000Z",
      },
    ],

    epistemicState:
      "OBSERVED",

    strength:
      "MODERATE",

    confidence: 68,

    firstObservedAt:
      "2026-09-23T10:00:00.000Z",

    lastObservedAt:
      "2026-09-23T10:00:00.000Z",

    createdAt:
      "2026-09-23T12:00:00.000Z",

    updatedAt:
      "2026-09-23T12:00:00.000Z",

    metadata: {},

    ...overrides,
  };
}

const context = {
  correlationId:
    "correlation-radar-test",

  evidence: [],
};

describe(
  "Market Radar Agent",
  () => {
    it(
      "keeps observation and interpretation separate",
      async () => {
        const result =
          await marketRadarAgent.execute({
            input: {
              claims: [
                claim(),
              ],

              investigationWindow: {
                startedAt:
                  "2026-09-23T00:00:00.000Z",

                endedAt:
                  "2026-09-23T12:00:00.000Z",
              },

              strategicContext: {
                company:
                  "WarpBuild",

                priorities: [
                  "CI performance",
                  "developer economics",
                ],
              },
            },

            context,
          });

        const finding =
          result.output
            .findings[0];

        expect(
          finding.observation,
        ).toContain(
          "Runner launch",
        );

        expect(
          finding.interpretation,
        ).not.toBe(
          finding.observation,
        );
      },
    );

    it(
      "requests corroboration for single-source claims",
      async () => {
        const result =
          await marketRadarAgent.execute({
            input: {
              claims: [
                claim(),
              ],

              investigationWindow: {
                startedAt:
                  "2026-09-23T00:00:00.000Z",

                endedAt:
                  "2026-09-23T12:00:00.000Z",
              },

              strategicContext: {
                company:
                  "WarpBuild",

                priorities: [],
              },
            },

            context,
          });

        expect(
          result.output
            .evidenceRequests,
        ).toHaveLength(1);
      },
    );

    it(
      "recognizes independently corroborated claims",
      async () => {
        const corroborated =
          claim({
            confidence: 82,

            epistemicState:
              "CORROBORATED",

            strength:
              "STRONG",

            evidence: [
              ...claim().evidence,

              {
                observationId:
                  "obs-2",

                sourceId:
                  "source-2",

                sourceName:
                  "Source 2",

                sourceUri:
                  "https://example.org/2",

                provenance:
                  "PUBLIC",

                trustScore:
                  0.85,

                freshnessScore:
                  92,

                observedAt:
                  "2026-09-23T11:00:00.000Z",
              },
            ],
          });

        const result =
          await marketRadarAgent.execute({
            input: {
              claims: [
                corroborated,
              ],

              investigationWindow: {
                startedAt:
                  "2026-09-23T00:00:00.000Z",

                endedAt:
                  "2026-09-23T12:00:00.000Z",
              },

              strategicContext: {
                company:
                  "WarpBuild",

                priorities: [],
              },
            },

            context,
          });

        expect(
          result.output
            .highConfidenceClaimIds,
        ).toContain(
          "claim-1",
        );

        expect(
          result.output
            .evidenceRequests,
        ).toHaveLength(0);
      },
    );

    it(
      "requires human review for material product claims",
      async () => {
        const result =
          await marketRadarAgent.execute({
            input: {
              claims: [
                claim(),
              ],

              investigationWindow: {
                startedAt:
                  "2026-09-23T00:00:00.000Z",

                endedAt:
                  "2026-09-23T12:00:00.000Z",
              },

              strategicContext: {
                company:
                  "WarpBuild",

                priorities: [],
              },
            },

            context,
          });

        expect(
          result.requiresHumanReview,
        ).toBe(true);
      },
    );

    it(
      "handles an empty investigation safely",
      async () => {
        const result =
          await marketRadarAgent.execute({
            input: {
              claims: [],

              investigationWindow: {
                startedAt:
                  "2026-09-23T00:00:00.000Z",

                endedAt:
                  "2026-09-23T12:00:00.000Z",
              },

              strategicContext: {
                company:
                  "WarpBuild",

                priorities: [],
              },
            },

            context,
          });

        expect(
          result.output
            .investigatedClaimCount,
        ).toBe(0);

        expect(
          result.confidence,
        ).toBe(0);

        expect(
          result.requiresHumanReview,
        ).toBe(false);
      },
    );
  },
);