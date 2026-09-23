import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildMarketRadarSnapshot,
} from "./market-radar";

describe(
  "Market Radar service",
  () => {
    const snapshot =
      buildMarketRadarSnapshot();

    it(
      "builds the complete radar snapshot",
      () => {
        expect(
          snapshot.systemStatus,
        ).toBe("ONLINE");

        expect(
          snapshot.signals,
        ).toHaveLength(7);

        expect(
          snapshot.trends,
        ).toHaveLength(3);
      },
    );

    it(
      "scores every signal",
      () => {
        expect(
          snapshot.signals.every(
            (signal) =>
              Boolean(
                signal.score,
              ),
          ),
        ).toBe(true);
      },
    );

    it(
      "contains opportunity and threat intelligence",
      () => {
        expect(
          snapshot.metrics
            .opportunityCount,
        ).toBeGreaterThan(0);

        expect(
          snapshot.metrics
            .threatCount,
        ).toBeGreaterThan(0);
      },
    );

    it(
      "surfaces human decisions",
      () => {
        expect(
          snapshot.metrics
            .decisionCount,
        ).toBeGreaterThan(0);

        expect(
          snapshot.attention.some(
            (signal) =>
              signal
                .decisionRequired,
          ),
        ).toBe(true);
      },
    );

    it(
      "surfaces experiment candidates",
      () => {
        expect(
          snapshot.metrics
            .experimentCandidateCount,
        ).toBeGreaterThan(0);
      },
    );

    it(
      "preserves the demo-data boundary",
      () => {
        expect(
          snapshot.disclaimer,
        ).toContain(
          "synthetic",
        );

        expect(
          snapshot.disclaimer,
        ).toContain(
          "live",
        );
      },
    );
  },
);