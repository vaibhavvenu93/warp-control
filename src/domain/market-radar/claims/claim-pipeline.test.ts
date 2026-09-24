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
  InMemoryClaimRepository,
} from "@/repositories/market-radar/claim-repository";

import {
  InMemoryObservationRepository,
} from "@/repositories/market-radar/observation-repository";

import {
  MarketClaimPipeline,
} from "./claim-pipeline";

async function observations() {
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

  return result.observations;
}

describe(
  "MarketClaimPipeline",
  () => {
    it(
      "creates claims from normalized observations",
      async () => {
        const repository =
          new InMemoryClaimRepository();

        const pipeline =
          new MarketClaimPipeline(
            repository,
          );

        const result =
          pipeline.process(
            await observations(),
            INGESTION_DEMO_NOW,
          );

        expect(
          result.processedObservations,
        ).toBe(2);

        expect(
          result.createdClaims,
        ).toBe(2);

        expect(
          repository.count(),
        ).toBe(2);
      },
    );

    it(
      "updates matching claims rather than duplicating them",
      async () => {
        const repository =
          new InMemoryClaimRepository();

        const pipeline =
          new MarketClaimPipeline(
            repository,
          );

        const input =
          await observations();

        pipeline.process(
          input,
          INGESTION_DEMO_NOW,
        );

        const second =
          pipeline.process(
            input,
            INGESTION_DEMO_NOW,
          );

        expect(
          second.createdClaims,
        ).toBe(0);

        expect(
          second.updatedClaims,
        ).toBe(2);

        expect(
          repository.count(),
        ).toBe(2);
      },
    );

    it(
      "preserves claim categories",
      async () => {
        const repository =
          new InMemoryClaimRepository();

        const pipeline =
          new MarketClaimPipeline(
            repository,
          );

        pipeline.process(
          await observations(),
          INGESTION_DEMO_NOW,
        );

        expect(
          repository
            .getAll()[0]
            .categories.length,
        ).toBeGreaterThan(0);
      },
    );
  },
);