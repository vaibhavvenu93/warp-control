import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  ExternalFetcher,
} from "./fetch-contract";

import {
  HttpTextSourceAdapter,
} from "./http-text-adapter";

import {
  createExternalSource,
} from "@/domain/market-radar/ingestion/source-registry";

const source =
  createExternalSource({
    id:
      "warpbuild-homepage",

    name:
      "WarpBuild Homepage",

    kind:
      "WEBSITE",

    sourceType:
      "PUBLIC_WEB",

    provenance:
      "PUBLIC",

    uri:
      "https://example.com",

    description:
      "Public product page.",

    trustScore: 0.9,

    enabled: true,

    pollingEligible: true,

    tags: [
      "warpbuild",
      "product",
    ],

    metadata: {},
  });

const fetcher:
  ExternalFetcher = {
    async fetch() {
      return {
        ok: true,

        status: 200,

        statusText:
          "OK",

        url:
          "https://example.com/",

        headers: {
          "content-type":
            "text/html",
        },

        body:
          `
            <html>
              <head>
                <title>
                  WarpBuild Test
                </title>
                <style>
                  .hidden { color: red; }
                </style>
              </head>
              <body>
                <h1>
                  Faster CI infrastructure
                </h1>
                <script>
                  window.secret = "ignore";
                </script>
              </body>
            </html>
          `,
      };
    },
  };

describe(
  "HttpTextSourceAdapter",
  () => {
    it(
      "turns public HTML into a bounded observation",
      async () => {
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
                  "WarpBuild",

                type:
                  "COMPANY",
              },
            ],
          });

        const observations =
          await adapter.fetch({
            now:
              "2026-09-23T12:00:00.000Z",
          });

        expect(
          observations,
        ).toHaveLength(1);

        expect(
          observations[0]
            .title,
        ).toBe(
          "WarpBuild Test",
        );

        expect(
          observations[0]
            .body,
        ).toContain(
          "Faster CI infrastructure",
        );
      },
    );

    it(
      "removes script content",
      async () => {
        const adapter =
          new HttpTextSourceAdapter({
            source,

            fetcher,

            categories: [
              "PRODUCT",
            ],

            entities: [],
          });

        const observations =
          await adapter.fetch({
            now:
              "2026-09-23T12:00:00.000Z",
          });

        expect(
          observations[0]
            .body,
        ).not.toContain(
          "window.secret",
        );
      },
    );

    it(
      "fails closed on non-success HTTP responses",
      async () => {
        const failingFetcher:
          ExternalFetcher = {
            async fetch() {
              return {
                ok: false,

                status: 503,

                statusText:
                  "Unavailable",

                url:
                  "https://example.com",

                headers: {},

                body: "",
              };
            },
          };

        const adapter =
          new HttpTextSourceAdapter({
            source,

            fetcher:
              failingFetcher,

            categories: [
              "PRODUCT",
            ],

            entities: [],
          });

        await expect(
          adapter.fetch({
            now:
              "2026-09-23T12:00:00.000Z",
          }),
        ).rejects.toThrow(
          /503/,
        );
      },
    );
  },
);