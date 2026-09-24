import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  ExternalFetcher,
} from "@/domain/market-radar/adapters/fetch-contract";

import {
  HttpTextSourceAdapter,
} from "@/domain/market-radar/adapters/http-text-adapter";

import {
  createExternalSource,
} from "@/domain/market-radar/ingestion/source-registry";

import {
  InMemoryObservationRepository,
} from "@/repositories/market-radar/observation-repository";

import {
  InMemoryClaimRepository,
} from "@/repositories/market-radar/claim-repository";

import {
  InMemorySourceHealthRepository,
} from "@/repositories/market-radar/source-health-repository";

import {
  InMemoryKnowledgeRepository,
} from "@/repositories/knowledge/knowledge-repository";

import {
  ExternalMarketIntelligence,
} from "./external-market-intelligence";

const source =
  createExternalSource({
    id:
      "example-product-page",

    name:
      "Example Product Page",

    kind:
      "WEBSITE",

    sourceType:
      "PUBLIC_WEB",

    provenance:
      "PUBLIC",

    uri:
      "https://example.com/product",

    description:
      "Public product information.",

    trustScore: 0.9,

    enabled: true,

    pollingEligible: true,

    tags: [
      "product",
      "ci",
    ],

    metadata: {},
  });

describe(
  "ExternalMarketIntelligence",
  () => {
    it(
      "moves public evidence through observation, claim and Company Brain knowledge layers",
      async () => {
        const fetcher:
          ExternalFetcher = {
            async fetch() {
              return {
                ok: true,

                status: 200,

                statusText:
                  "OK",

                url:
                  source.uri,

                headers: {
                  "content-type":
                    "text/html",
                },

                body:
                  `
                    <html>
                      <head>
                        <title>
                          Example CI Product Update
                        </title>
                      </head>

                      <body>
                        Example CI announced
                        faster build execution
                        for developer workflows.
                      </body>
                    </html>
                  `,
              };
            },
          };

        const adapter =
          new HttpTextSourceAdapter({
            source,

            fetcher,

            categories: [
              "PRODUCT",
              "CI_INFRASTRUCTURE",
            ],

            entities: [
              {
                name:
                  "Example CI",

                type:
                  "COMPANY",
              },
            ],
          });

        const observations =
          new InMemoryObservationRepository();

        const claims =
          new InMemoryClaimRepository();

        const health =
          new InMemorySourceHealthRepository();

        const knowledge =
          new InMemoryKnowledgeRepository();

        const intelligence =
          new ExternalMarketIntelligence(
            observations,
            claims,
            health,
            knowledge,
            {
              now:
                () =>
                  new Date(
                    "2026-09-23T12:00:00.000Z",
                  ),
            },
          );

        const result =
          await intelligence
            .investigate(
              adapter,
              source,
            );

        const snapshot =
          await knowledge
            .getSnapshot();

        expect(
          result
            .observationsAccepted,
        ).toBe(1);

        expect(
          result.claimsCreated,
        ).toBeGreaterThan(0);

        expect(
          result
            .knowledgeClaimsSynced,
        ).toBeGreaterThan(0);

        expect(
          result
            .sourceHealthStatus,
        ).toBe(
          "HEALTHY",
        );

        expect(
          snapshot.graph
            .claims.length,
        ).toBeGreaterThan(0);

        /*
         * One public source is not enough
         * to become KNOWN company truth.
         */
        expect(
          snapshot.graph
            .claims.every(
              (claim) =>
                claim.state ===
                "INFERRED",
            ),
        ).toBe(true);
      },
    );

    it(
      "rejects an adapter/source identity mismatch",
      async () => {
        const fetcher:
          ExternalFetcher = {
            async fetch() {
              throw new Error(
                "Should not execute",
              );
            },
          };

        const adapter =
          new HttpTextSourceAdapter({
            source,

            fetcher,

            categories: [
              "PRODUCT",
            ],

            entities: [],
          });

        const otherSource =
          createExternalSource({
            ...source,

            id:
              "different-source",
          });

        const intelligence =
          new ExternalMarketIntelligence(
            new InMemoryObservationRepository(),
            new InMemoryClaimRepository(),
            new InMemorySourceHealthRepository(),
            new InMemoryKnowledgeRepository(),
          );

        await expect(
          intelligence
            .investigate(
              adapter,
              otherSource,
            ),
        ).rejects.toThrow(
          /does not match/,
        );
      },
    );
  },
);