import {
  marketRadarDemoSignals,
  MARKET_RADAR_DEMO_NOW,
} from "@/data/demo/market-radar/market-radar-corpus";

import {
  rankMarketSignals,
} from "@/domain/market-radar/signal-engine";

import {
  buildTrend,
} from "@/domain/market-radar/trend-engine";

import type {
  MarketRadarMetrics,
  MarketRadarSnapshot,
  MarketSignal,
} from "@/domain/market-radar/types";

function average(
  values: number[],
): number {
  if (values.length === 0) {
    return 0;
  }

  return (
    Math.round(
      (values.reduce(
        (total, value) =>
          total + value,
        0,
      ) /
        values.length) *
        100,
    ) / 100
  );
}

function buildMetrics(
  signals: MarketSignal[],
): MarketRadarMetrics {
  return {
    signalCount:
      signals.length,

    criticalCount:
      signals.filter(
        (signal) =>
          signal.score
            ?.classification ===
          "CRITICAL",
      ).length,

    highPriorityCount:
      signals.filter(
        (signal) =>
          signal.score
            ?.classification ===
          "HIGH",
      ).length,

    opportunityCount:
      signals.filter(
        (signal) =>
          signal.direction ===
          "OPPORTUNITY",
      ).length,

    threatCount:
      signals.filter(
        (signal) =>
          signal.direction ===
          "THREAT",
      ).length,

    decisionCount:
      signals.filter(
        (signal) =>
          signal.decisionRequired,
      ).length,

    experimentCandidateCount:
      signals.filter(
        (signal) =>
          signal.experimentCandidate,
      ).length,

    averageConfidence:
      average(
        signals.map(
          (signal) =>
            signal.score
              ?.confidence ?? 0,
        ),
      ),
  };
}

function byIds(
  signals: MarketSignal[],
  ids: string[],
): MarketSignal[] {
  return ids
    .map(
      (id) =>
        signals.find(
          (signal) =>
            signal.id === id,
        ),
    )
    .filter(
      (
        signal,
      ): signal is MarketSignal =>
        Boolean(signal),
    );
}

export function buildMarketRadarSnapshot():
  MarketRadarSnapshot {
  const signals =
    rankMarketSignals(
      marketRadarDemoSignals,
    );

  const aiVelocitySignals =
    byIds(signals, [
      "signal-ai-ci-bottleneck",
      "signal-agentic-devtools",
    ]);

  const categoryPressureSignals =
    byIds(signals, [
      "signal-performance-packaging",
      "signal-runner-commoditization",
    ]);

  const enterpriseSignals =
    byIds(signals, [
      "signal-plg-enterprise",
      "signal-security-enterprise",
    ]);

  const trends = [
    buildTrend(
      "trend-ai-validation",
      "AI-native engineering is moving the bottleneck toward validation",
      "As code generation accelerates, CI latency and validation infrastructure can become more strategically important.",
      aiVelocitySignals,
      "WarpBuild can potentially own the layer between faster code generation and trustworthy deployment.",
      "Test AI-native engineering velocity positioning and investigate agent-triggered CI workflows.",
    ),

    buildTrend(
      "trend-category-economics",
      "CI differentiation is moving from raw speed toward economic outcomes",
      "If high-performance compute becomes easier to access, durable differentiation may depend on price-performance, reliability and developer economics.",
      categoryPressureSignals,
      "WarpBuild should be able to explain not only that CI is faster, but what that speed is economically worth.",
      "Use the CI Economics model to pressure-test pricing and positioning before changing commercial packaging.",
    ),

    buildTrend(
      "trend-enterprise-conversion",
      "Enterprise conversion requires both usage intelligence and buying evidence",
      "Developer adoption can identify high-intent accounts, while security and procurement evidence determine whether those accounts can progress.",
      enterpriseSignals,
      "The GTM system should connect product-qualified accounts to enterprise readiness rather than treating adoption and sales as separate systems.",
      "Define product-qualified-account triggers and map enterprise security gates.",
    ),
  ];

  const attention =
    signals.filter(
      (signal) =>
        signal.score
          ?.classification ===
          "CRITICAL" ||
        signal.score
          ?.classification ===
          "HIGH" ||
        signal.decisionRequired,
    );

  return {
    generatedAt:
      MARKET_RADAR_DEMO_NOW,

    systemStatus:
      "ONLINE",

    signals,

    trends,

    metrics:
      buildMetrics(signals),

    attention,

    disclaimer:
      "Market Radar currently uses synthetic and modeled intelligence to demonstrate the operating architecture. It does not represent verified live competitor activity, customer behavior or WarpBuild commercial performance. Public-source ingestion is intentionally separated from the scoring and decision layers so live sources can replace the demo corpus without redesigning the system.",
  };
}