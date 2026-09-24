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
  InMemorySourceHealthRepository,
} from "@/repositories/market-radar/source-health-repository";

import {
  MonitoredSourceAdapter,
} from "./monitored-adapter";

const source =
  createExternalSource({
    id:
      "source-1",

    name:
      "Source 1",

    kind:
      "WEBSITE",

    sourceType:
      "PUBLIC_WEB",

    provenance:
      "PUBLIC",

    uri:
      "https://example.com",

    description:
      "Test source.",

    trustScore: 0.8,

    enabled: true,

    pollingEligible: true,

    tags: [],

    metadata: {},
  });

function clock() {
  const values = [
    new Date(
      "2026-09-23T12:00:00.000Z",
    ),

    new Date(
      "2026-09-23T12:00:00.125Z",
    ),
  ];

  let index = 0;

  return () =>
    values[
      Math.min(
        index++,
        values.length - 1,
      )
    ];
}

describe(
  "MonitoredSourceAdapter",
  () => {
    it(
      "records successful source execution",
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
                    "Observed update",

                  body:
                    "Observed body",

                  observedAt:
                    context.now,

                  categories: [
                    "PRODUCT",
                  ],

                  entities: [],

                  metadata: {},
                },
              ];
            },
          };

        const repository =
          new InMemorySourceHealthRepository();

        const monitored =
          new MonitoredSourceAdapter(
            adapter,
            repository,
            {
              now:
                clock(),

              createAttemptId:
                () =>
                  "attempt-1",
            },
          );

        await monitored.fetch({
          now:
            "2026-09-23T12:00:00.000Z",
        });

        const health =
          repository.get(
            source.id,
          );

        expect(
          health?.status,
        ).toBe(
          "HEALTHY",
        );

        expect(
          health?.averageLatencyMs,
        ).toBe(125);

        expect(
          health
            ?.totalObservationsReceived,
        ).toBe(1);
      },
    );

    it(
      "records failed source execution and rethrows",
      async () => {
        const adapter:
          ExternalSourceAdapter = {
            source,

            async fetch() {
              throw new Error(
                "Source unavailable",
              );
            },
          };

        const repository =
          new InMemorySourceHealthRepository();

        const monitored =
          new MonitoredSourceAdapter(
            adapter,
            repository,
            {
              now:
                clock(),

              createAttemptId:
                () =>
                  "attempt-1",
            },
          );

        await expect(
          monitored.fetch({
            now:
              "2026-09-23T12:00:00.000Z",
          }),
        ).rejects.toThrow(
          "Source unavailable",
        );

        expect(
          repository.get(
            source.id,
          )?.status,
        ).toBe(
          "DEGRADED",
        );
      },
    );
  },
);