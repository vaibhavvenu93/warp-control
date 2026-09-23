import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DemoWarpBuildPublicAdapter,
  INGESTION_DEMO_NOW,
} from "@/data/demo/market-radar/ingestion/demo-source-adapter";

import {
  MarketObservationIngestionPipeline,
} from "@/domain/market-radar/ingestion/ingestion-pipeline";

import {
  InMemoryObservationRepository,
} from "./observation-repository";

describe(
  "InMemoryObservationRepository",
  () => {
    it(
      "stores and retrieves observations",
      async () => {
        const repository =
          new InMemoryObservationRepository();

        const pipeline =
          new MarketObservationIngestionPipeline(
            repository,
          );

        await pipeline.ingest(
          new DemoWarpBuildPublicAdapter(),
          INGESTION_DEMO_NOW,
        );

        expect(
          repository.count(),
        ).toBe(2);

        expect(
          repository.getAll(),
        ).toHaveLength(2);
      },
    );

    it(
      "indexes observations by fingerprint",
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

        const first =
          result.observations[0];

        expect(
          repository
            .getByFingerprint(
              first.fingerprint,
            )
            ?.id,
        ).toBe(first.id);
      },
    );

    it(
      "filters observations by source",
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

        expect(
          repository.getBySource(
            adapter.source.id,
          ),
        ).toHaveLength(2);
      },
    );
  },
);