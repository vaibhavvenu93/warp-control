import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  ExternalFetcher,
} from "./fetch-contract";

import {
  GitHubRepositoryAdapter,
} from "./github-repository-adapter";

import {
  createExternalSource,
} from "@/domain/market-radar/ingestion/source-registry";

const source =
  createExternalSource({
    id:
      "github-example",

    name:
      "Example GitHub Repository",

    kind:
      "GITHUB",

    sourceType:
      "PUBLIC_WEB",

    provenance:
      "PUBLIC",

    uri:
      "https://github.com/example/repo",

    description:
      "Public GitHub repository metadata.",

    trustScore: 0.9,

    enabled: true,

    pollingEligible: true,

    tags: [
      "github",
      "developer-ecosystem",
    ],

    metadata: {},
  });

describe(
  "GitHubRepositoryAdapter",
  () => {
    it(
      "creates an evidence-bounded repository observation",
      async () => {
        const fetcher:
          ExternalFetcher = {
            async fetch(
              url,
            ) {
              expect(
                url,
              ).toContain(
                "api.github.com/repos/example/repo",
              );

              return {
                ok: true,

                status: 200,

                statusText:
                  "OK",

                url,

                headers: {
                  "content-type":
                    "application/json",
                },

                body:
                  JSON.stringify({
                    full_name:
                      "example/repo",

                    description:
                      "Fast CI tooling",

                    html_url:
                      "https://github.com/example/repo",

                    language:
                      "TypeScript",

                    stargazers_count:
                      123,

                    forks_count:
                      12,

                    open_issues_count:
                      4,

                    default_branch:
                      "main",

                    pushed_at:
                      "2026-09-23T09:00:00.000Z",

                    updated_at:
                      "2026-09-23T09:30:00.000Z",

                    archived:
                      false,

                    topics: [
                      "ci",
                      "developer-tools",
                    ],
                  }),
              };
            },
          };

        const adapter =
          new GitHubRepositoryAdapter({
            source,

            fetcher,

            owner:
              "example",

            repository:
              "repo",

            companyName:
              "Example CI",
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
            .body,
        ).toContain(
          "Stars observed: 123",
        );

        expect(
          observations[0]
            .metadata
            .epistemicBoundary,
        ).toBe(
          "REPOSITORY_METADATA_ONLY",
        );
      },
    );

    it(
      "does not convert repository activity into company strategy",
      async () => {
        const fetcher:
          ExternalFetcher = {
            async fetch(
              url,
            ) {
              return {
                ok: true,

                status: 200,

                statusText:
                  "OK",

                url,

                headers: {},

                body:
                  JSON.stringify({
                    full_name:
                      "example/repo",

                    stargazers_count:
                      1000,

                    forks_count:
                      100,

                    pushed_at:
                      "2026-09-23T11:00:00.000Z",
                  }),
              };
            },
          };

        const adapter =
          new GitHubRepositoryAdapter({
            source,

            fetcher,

            owner:
              "example",

            repository:
              "repo",

            companyName:
              "Example CI",
          });

        const [
          observation,
        ] =
          await adapter.fetch({
            now:
              "2026-09-23T12:00:00.000Z",
          });

        expect(
          observation.body,
        ).not.toMatch(
          /strategy|traction|revenue|customers|winning/i,
        );
      },
    );

    it(
      "rejects malformed GitHub responses",
      async () => {
        const fetcher:
          ExternalFetcher = {
            async fetch(
              url,
            ) {
              return {
                ok: true,

                status: 200,

                statusText:
                  "OK",

                url,

                headers: {},

                body:
                  "{not-json",
              };
            },
          };

        const adapter =
          new GitHubRepositoryAdapter({
            source,

            fetcher,

            owner:
              "example",

            repository:
              "repo",
          });

        await expect(
          adapter.fetch({
            now:
              "2026-09-23T12:00:00.000Z",
          }),
        ).rejects.toThrow(
          /invalid JSON/,
        );
      },
    );
  },
);