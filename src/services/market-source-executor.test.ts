import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  ExternalSourceAdapter,
} from "@/domain/market-radar/ingestion/observation-types";

import {
  createExternalSource,
} from "@/domain/market-radar/ingestion/source-registry";

import {
  InMemoryObservationRepository,
} from "@/repositories/market-radar/observation-repository";

import {
  InMemorySourceHealthRepository,
} from "@/repositories/market-radar/source-health-repository";

import {
  MarketSourceExecutor,
} from "./market-source-executor";

const source =
  createExternalSource({
    id:
      "source-executor-test",

    name:
      "Executor Test Source",

    kind:
      "API",

    sourceType:
      "PUBLIC_WEB",

    provenance:
      "PUBLIC",

    uri:
      "https://example.com/api",

    description:
      "Executor test.",

    trustScore: 0.85,

    enabled: true,

    pollingEligible: true,

    tags: [],

    metadata: {},
  });

describe(
  "MarketSourceExecutor",
  () => {
    it(
      "executes monitored ingestion end to end",
      async () => {
        const adapter:
          ExternalSourceAdapter = {
            source,

            async fetch(
              context,
            ) {
              return [
                {
                  externalId:
                    "external-1",

                  sourceId:
                    source.id,

                  sourceName:
                    source.name,

                  sourceUri:
                    source.uri,

                  title:
                    "Product update",

                  body:
                    "Observed product update.",

                  observedAt:
                    context.now,

                  categories: [
                    "PRODUCT",
                  ],

                  entities: [
                    {
                      name:
                        "Example",

                      type:
                        "COMPANY",
                    },
                  ],

                  metadata: {},
                },
              ];
            },
          };

        const observations =
          new InMemoryObservationRepository();

        const health =
          new InMemorySourceHealthRepository();

        const fixed =
          new Date(
            "2026-09-23T12:00:00.000Z",
          );

        const executor =
          new MarketSourceExecutor(
            observations,
            health,
            {
              now:
                () =>
                  fixed,
            },
          );

        const result =
          await executor.execute(
            adapter,
          );

        expect(
          result.ingestion
            .accepted,
        ).toBe(1);

        expect(
          observations.count(),
        ).toBe(1);

        expect(
          result.health
            ?.status,
        ).toBe(
          "HEALTHY",
        );
      },
    );

    it(
      "does not hide adapter failures",
      async () => {
        const adapter:
          ExternalSourceAdapter = {
            source,

            async fetch() {
              throw new Error(
                "External API failed",
              );
            },
          };

        const observations =
          new InMemoryObservationRepository();

        const health =
          new InMemorySourceHealthRepository();

        const executor =
          new MarketSourceExecutor(
            observations,
            health,
            {
              now:
                () =>
                  new Date(
                    "2026-09-23T12:00:00.000Z",
                  ),
            },
          );

        await expect(
          executor.execute(
            adapter,
          ),
        ).rejects.toThrow(
          "External API failed",
        );

        expect(
          health.get(
            source.id,
          )?.failedAttempts,
        ).toBe(1);
      },
    );
  },
);