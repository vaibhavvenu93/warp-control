import {
  describe,
  expect,
  it,
} from "vitest";

import {
  marketRadarDemoSignals,
} from "@/data/demo/market-radar/market-radar-corpus";

import {
  rankMarketSignals,
} from "./signal-engine";

import {
  buildTrend,
} from "./trend-engine";

describe(
  "Market Radar trend engine",
  () => {
    const signals =
      rankMarketSignals(
        marketRadarDemoSignals,
      ).slice(0, 3);

    it(
      "builds a trend from multiple signals",
      () => {
        const trend =
          buildTrend(
            "trend-test",
            "Test trend",
            "Test thesis",
            signals,
            "Test implication",
            "Test action",
          );

        expect(
          trend.signalIds,
        ).toHaveLength(3);

        expect(
          trend.momentum,
        ).toBeGreaterThan(0);
      },
    );

    it(
      "aggregates impact areas without duplicates",
      () => {
        const trend =
          buildTrend(
            "trend-test",
            "Test trend",
            "Test thesis",
            signals,
            "Test implication",
            "Test action",
          );

        expect(
          new Set(
            trend.impactAreas,
          ).size,
        ).toBe(
          trend.impactAreas.length,
        );
      },
    );

    it(
      "calculates aggregate confidence",
      () => {
        const trend =
          buildTrend(
            "trend-test",
            "Test trend",
            "Test thesis",
            signals,
            "Test implication",
            "Test action",
          );

        expect(
          trend.confidence,
        ).toBeGreaterThan(0);
      },
    );
  },
);