import {
  describe,
  expect,
  it,
} from "vitest";

import {
  applyFetchAttempt,
  emptySourceHealth,
} from "./source-health";

const source =
  emptySourceHealth(
    "source-1",
    "Example Source",
    "WEBSITE",
  );

describe(
  "source health",
  () => {
    it(
      "starts unknown",
      () => {
        expect(
          source.status,
        ).toBe(
          "UNKNOWN",
        );

        expect(
          source.totalAttempts,
        ).toBe(0);
      },
    );

    it(
      "becomes healthy after success",
      () => {
        const health =
          applyFetchAttempt(
            source,
            {
              id:
                "attempt-1",

              sourceId:
                "source-1",

              sourceName:
                "Example Source",

              sourceKind:
                "WEBSITE",

              startedAt:
                "2026-09-23T10:00:00.000Z",

              completedAt:
                "2026-09-23T10:00:00.100Z",

              latencyMs: 100,

              success: true,

              observationsReceived: 2,
            },
          );

        expect(
          health.status,
        ).toBe(
          "HEALTHY",
        );

        expect(
          health.successRate,
        ).toBe(1);

        expect(
          health
            .totalObservationsReceived,
        ).toBe(2);
      },
    );

    it(
      "becomes degraded after a failure",
      () => {
        const health =
          applyFetchAttempt(
            source,
            {
              id:
                "attempt-1",

              sourceId:
                "source-1",

              sourceName:
                "Example Source",

              sourceKind:
                "WEBSITE",

              startedAt:
                "2026-09-23T10:00:00.000Z",

              completedAt:
                "2026-09-23T10:00:00.100Z",

              latencyMs: 100,

              success: false,

              observationsReceived: 0,

              error:
                "Network failure",
            },
          );

        expect(
          health.status,
        ).toBe(
          "DEGRADED",
        );

        expect(
          health.lastError,
        ).toBe(
          "Network failure",
        );
      },
    );

    it(
      "becomes failing after three consecutive failures",
      () => {
        let health =
          source;

        for (
          let index = 0;
          index < 3;
          index += 1
        ) {
          health =
            applyFetchAttempt(
              health,
              {
                id:
                  `attempt-${index}`,

                sourceId:
                  "source-1",

                sourceName:
                  "Example Source",

                sourceKind:
                  "WEBSITE",

                startedAt:
                  "2026-09-23T10:00:00.000Z",

                completedAt:
                  "2026-09-23T10:00:00.100Z",

                latencyMs: 100,

                success: false,

                observationsReceived: 0,

                error:
                  "Failure",
              },
            );
        }

        expect(
          health.status,
        ).toBe(
          "FAILING",
        );

        expect(
          health.consecutiveFailures,
        ).toBe(3);
      },
    );

    it(
      "resets consecutive failures after recovery",
      () => {
        const failed =
          applyFetchAttempt(
            source,
            {
              id:
                "attempt-1",

              sourceId:
                "source-1",

              sourceName:
                "Example Source",

              sourceKind:
                "WEBSITE",

              startedAt:
                "2026-09-23T10:00:00.000Z",

              completedAt:
                "2026-09-23T10:00:00.100Z",

              latencyMs: 100,

              success: false,

              observationsReceived: 0,

              error:
                "Failure",
            },
          );

        const recovered =
          applyFetchAttempt(
            failed,
            {
              id:
                "attempt-2",

              sourceId:
                "source-1",

              sourceName:
                "Example Source",

              sourceKind:
                "WEBSITE",

              startedAt:
                "2026-09-23T10:01:00.000Z",

              completedAt:
                "2026-09-23T10:01:00.050Z",

              latencyMs: 50,

              success: true,

              observationsReceived: 1,
            },
          );

        expect(
          recovered.status,
        ).toBe(
          "HEALTHY",
        );

        expect(
          recovered
            .consecutiveFailures,
        ).toBe(0);

        expect(
          recovered.successRate,
        ).toBe(0.5);
      },
    );
  },
);