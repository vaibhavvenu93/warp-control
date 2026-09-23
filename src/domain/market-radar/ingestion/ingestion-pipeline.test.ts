import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DemoWarpBuildPublicAdapter,
  demoWarpBuildPublicSource,
  INGESTION_DEMO_NOW,
} from "@/data/demo/market-radar/ingestion/demo-source-adapter";

import {
  InMemoryObservationRepository,
} from "@/repositories/market-radar/observation-repository";

import type {
  ExternalSourceAdapter,
} from "./observation-types";

import {
  MarketObservationIngestionPipeline,
} from "./ingestion-pipeline";

describe(
  "MarketObservationIngestionPipeline",
  () => {
    it(
      "ingests normalized observations",
      async () => {
        const repository =
          new InMemoryObservationRepository();

        const pipeline =
          new MarketObservationIngestionPipeline(
            repository,
          );

        const result =
          await pipeline.ingest(
            new DemoWarpBuildPublicAdapter(),
            INGESTION_DEMO_NOW,
          );

        expect(
          result.received,
        ).toBe(2);

        expect(
          result.accepted,
        ).toBe(2);

        expect(
          result.rejected,
        ).toBe(0);

        expect(
          repository.count(),
        ).toBe(2);
      },
    );

    it(
      "preserves public provenance and trust",
      async () => {
        const repository =
          new InMemoryObservationRepository();

        const pipeline =
          new MarketObservationIngestionPipeline(
            repository,
          );

        const result =
          await pipeline.ingest(
            new DemoWarpBuildPublicAdapter(),
            INGESTION_DEMO_NOW,
          );

        expect(
          result.observations[0]
            .provenance,
        ).toBe("PUBLIC");

        expect(
          result.observations[0]
            .trustScore,
        ).toBe(0.85);
      },
    );

    it(
      "calculates freshness",
      async () => {
        const repository =
          new InMemoryObservationRepository();

        const pipeline =
          new MarketObservationIngestionPipeline(
            repository,
          );

        const result =
          await pipeline.ingest(
            new DemoWarpBuildPublicAdapter(),
            INGESTION_DEMO_NOW,
          );

        expect(
          result.observations[0]
            .freshness.score,
        ).toBeGreaterThan(0);

        expect(
          result.observations[0]
            .freshness.band,
        ).toBe("FRESH");
      },
    );

    it(
      "deduplicates repeated ingestion",
      async () => {
        const repository =
          new InMemoryObservationRepository();

        const pipeline =
          new MarketObservationIngestionPipeline(
            repository,
          );

        const adapter =
          new DemoWarpBuildPublicAdapter();

        await pipeline.ingest(
          adapter,
          INGESTION_DEMO_NOW,
        );

        const second =
          await pipeline.ingest(
            adapter,
            INGESTION_DEMO_NOW,
          );

        expect(
          second.accepted,
        ).toBe(0);

        expect(
          second.duplicates,
        ).toBe(2);

        expect(
          repository.count(),
        ).toBe(2);
      },
    );

    it(
      "rejects malformed observations without crashing the batch",
      async () => {
        const repository =
          new InMemoryObservationRepository();

        const adapter:
          ExternalSourceAdapter = {
            source:
              demoWarpBuildPublicSource,

            async fetch() {
              return [
                {
                  externalId:
                    "broken-1",

                  sourceId:
                    demoWarpBuildPublicSource.id,

                  sourceName:
                    demoWarpBuildPublicSource.name,

                  sourceUri:
                    "https://warpbuild.com",

                  title: "",

                  body:
                    "Body exists.",

                  observedAt:
                    INGESTION_DEMO_NOW,

                  categories: [],

                  entities: [],

                  metadata: {},
                },

                {
                  externalId:
                    "valid-1",

                  sourceId:
                    demoWarpBuildPublicSource.id,

                  sourceName:
                    demoWarpBuildPublicSource.name,

                  sourceUri:
                    "https://warpbuild.com/valid",

                  title:
                    "Valid observation",

                  body:
                    "Valid body.",

                  observedAt:
                    INGESTION_DEMO_NOW,

                  categories: [
                    "PRODUCT",
                  ],

                  entities: [],

                  metadata: {},
                },
              ];
            },
          };

        const pipeline =
          new MarketObservationIngestionPipeline(
            repository,
          );

        const result =
          await pipeline.ingest(
            adapter,
            INGESTION_DEMO_NOW,
          );

        expect(
          result.received,
        ).toBe(2);

        expect(
          result.accepted,
        ).toBe(1);

        expect(
          result.rejected,
        ).toBe(1);

        expect(
          repository.count(),
        ).toBe(1);
      },
    );

    it(
      "can retain stale intelligence while marking it stale",
      async () => {
        const repository =
          new InMemoryObservationRepository();

        const adapter:
          ExternalSourceAdapter = {
            source:
              demoWarpBuildPublicSource,

            async fetch() {
              return [
                {
                  externalId:
                    "old-1",

                  sourceId:
                    demoWarpBuildPublicSource.id,

                  sourceName:
                    demoWarpBuildPublicSource.name,

                  sourceUri:
                    "https://warpbuild.com/archive",

                  title:
                    "Historical observation",

                  body:
                    "Historical context remains available but should not be treated as fresh intelligence.",

                  observedAt:
                    "2026-01-01T00:00:00.000Z",

                  publishedAt:
                    "2026-01-01T00:00:00.000Z",

                  categories: [
                    "CI_INFRASTRUCTURE",
                  ],

                  entities: [],

                  metadata: {},
                },
              ];
            },
          };

        const pipeline =
          new MarketObservationIngestionPipeline(
            repository,
          );

        const result =
          await pipeline.ingest(
            adapter,
            INGESTION_DEMO_NOW,
          );

        expect(
          result.stale,
        ).toBe(1);

        expect(
          result.accepted,
        ).toBe(1);

        expect(
          result.observations[0]
            .state,
        ).toBe("STALE");
      },
    );

    it(
      "can reject stale intelligence by policy",
      async () => {
        const repository =
          new InMemoryObservationRepository();

        const adapter:
          ExternalSourceAdapter = {
            source:
              demoWarpBuildPublicSource,

            async fetch() {
              return [
                {
                  externalId:
                    "old-2",

                  sourceId:
                    demoWarpBuildPublicSource.id,

                  sourceName:
                    demoWarpBuildPublicSource.name,

                  sourceUri:
                    "https://warpbuild.com/archive-2",

                  title:
                    "Very old observation",

                  body:
                    "Old intelligence fixture.",

                  observedAt:
                    "2026-01-01T00:00:00.000Z",

                  categories: [],

                  entities: [],

                  metadata: {},
                },
              ];
            },
          };

        const pipeline =
          new MarketObservationIngestionPipeline(
            repository,
            {
              rejectStale:
                true,
            },
          );

        const result =
          await pipeline.ingest(
            adapter,
            INGESTION_DEMO_NOW,
          );

        expect(
          result.stale,
        ).toBe(1);

        expect(
          result.accepted,
        ).toBe(0);

        expect(
          repository.count(),
        ).toBe(0);
      },
    );

    it(
      "does not fetch disabled sources",
      async () => {
        const repository =
          new InMemoryObservationRepository();

        let called = false;

        const adapter:
          ExternalSourceAdapter = {
            source: {
              ...demoWarpBuildPublicSource,
              id:
                "disabled-source",
              enabled:
                false,
            },

            async fetch() {
              called = true;
              return [];
            },
          };

        const pipeline =
          new MarketObservationIngestionPipeline(
            repository,
          );

        const result =
          await pipeline.ingest(
            adapter,
            INGESTION_DEMO_NOW,
          );

        expect(called).toBe(
          false,
        );

        expect(
          result.received,
        ).toBe(0);
      },
    );
  },
);