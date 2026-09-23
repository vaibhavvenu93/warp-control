import {
  describe,
  expect,
  it,
} from "vitest";

import {
  demoWarpBuildPublicSource,
} from "@/data/demo/market-radar/ingestion/demo-source-adapter";

import {
  buildObservationFingerprint,
  normalizeObservation,
} from "./observation-normalizer";

describe(
  "Market observation normalizer",
  () => {
    it(
      "normalizes whitespace and tracking parameters",
      () => {
        const observation =
          normalizeObservation(
            {
              externalId:
                "test-1",

              sourceId:
                demoWarpBuildPublicSource.id,

              sourceName:
                demoWarpBuildPublicSource.name,

              sourceUri:
                "https://warpbuild.com/?utm_source=test",

              canonicalUri:
                "https://warpbuild.com/?utm_source=test",

              title:
                "  WarpBuild   CI  ",

              body:
                " Faster   CI\nfeedback. ",

              observedAt:
                "2026-09-23T10:00:00.000Z",

              categories: [
                "CI_INFRASTRUCTURE",
              ],

              entities: [
                {
                  name:
                    " WarpBuild ",
                  type:
                    "COMPANY",
                },
              ],

              metadata: {},
            },

            demoWarpBuildPublicSource,

            "2026-09-23T12:00:00.000Z",
          );

        expect(
          observation.title,
        ).toBe(
          "WarpBuild CI",
        );

        expect(
          observation.body,
        ).toBe(
          "Faster CI feedback.",
        );

        expect(
          observation.canonicalUri,
        ).toBe(
          "https://warpbuild.com/",
        );

        expect(
          observation.entities[0]
            .normalizedName,
        ).toBe(
          "warpbuild",
        );
      },
    );

    it(
      "creates deterministic fingerprints",
      () => {
        const input = {
          sourceId:
            "source-1",
          canonicalUri:
            "https://example.com/a",
          title:
            "Signal",
          body:
            "Something changed.",
        };

        expect(
          buildObservationFingerprint(
            input,
          ),
        ).toBe(
          buildObservationFingerprint(
            input,
          ),
        );
      },
    );

    it(
      "changes fingerprint when content changes",
      () => {
        const first =
          buildObservationFingerprint({
            sourceId:
              "source-1",
            canonicalUri:
              "https://example.com/a",
            title:
              "Signal",
            body:
              "Version one",
          });

        const second =
          buildObservationFingerprint({
            sourceId:
              "source-1",
            canonicalUri:
              "https://example.com/a",
            title:
              "Signal",
            body:
              "Version two",
          });

        expect(
          first,
        ).not.toBe(
          second,
        );
      },
    );
  },
);