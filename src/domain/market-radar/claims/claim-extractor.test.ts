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
} from "@/repositories/market-radar/observation-repository";

import {
  extractClaimsFromObservation,
} from "./claim-extractor";

async function observation() {
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

  return result.observations[0];
}

describe(
  "Market claim extractor",
  () => {
    it(
      "extracts one bounded claim from an observation",
      async () => {
        const result =
          extractClaimsFromObservation(
            await observation(),
          );

        expect(
          result.candidates,
        ).toHaveLength(1);
      },
    );

    it(
      "uses an observed entity as the claim subject",
      async () => {
        const result =
          extractClaimsFromObservation(
            await observation(),
          );

        expect(
          result.candidates[0]
            .subject,
        ).toBe(
          "WarpBuild",
        );
      },
    );

    it(
      "classifies CI evidence without inventing a strategic conclusion",
      async () => {
        const result =
          extractClaimsFromObservation(
            await observation(),
          );

        expect(
          result.candidates[0]
            .type,
        ).toBe(
          "TECHNOLOGY_CHANGE",
        );

        expect(
          result.candidates[0]
            .statement,
        ).not.toMatch(
          /must|will win|should change pricing/i,
        );
      },
    );
  },
);