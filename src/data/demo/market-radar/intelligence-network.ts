import type {
  RadarIntelligenceNetwork,
} from "@/domain/market-radar/types";

export const marketRadarIntelligenceNetwork:
  RadarIntelligenceNetwork = {
    mode:
      "GOVERNED_DEMO",

    cycleStatus:
      "READY",

    lastCycleAt:
      "2026-09-23T12:00:00.000Z",

    sources: [
      {
        id:
          "source-warpbuild-product",

        name:
          "WarpBuild Product Surface",

        kind:
          "WEBSITE",

        status:
          "HEALTHY",

        trust: 92,

        latencyMs: 184,

        lastObservedAt:
          "2026-09-23T11:58:00.000Z",

        observationCount: 4,

        mode:
          "DEMO",
      },

      {
        id:
          "source-developer-ecosystem",

        name:
          "Developer Ecosystem",

        kind:
          "GITHUB",

        status:
          "HEALTHY",

        trust: 88,

        latencyMs: 96,

        lastObservedAt:
          "2026-09-23T11:56:00.000Z",

        observationCount: 7,

        mode:
          "DEMO",
      },

      {
        id:
          "source-category-watch",

        name:
          "CI Category Watch",

        kind:
          "PUBLIC_WEB",

        status:
          "HEALTHY",

        trust: 84,

        latencyMs: 241,

        lastObservedAt:
          "2026-09-23T11:52:00.000Z",

        observationCount: 6,

        mode:
          "DEMO",
      },

      {
        id:
          "source-customer-patterns",

        name:
          "Customer Pattern Monitor",

        kind:
          "MODELED_ANALYSIS",

        status:
          "UNKNOWN",

        trust: 62,

        latencyMs: 0,

        lastObservedAt:
          "2026-09-23T11:45:00.000Z",

        observationCount: 5,

        mode:
          "DEMO",
      },
    ],

    lineage: [
      {
        signalId:
          "signal-ai-ci-bottleneck",

        epistemicState:
          "CORROBORATED",

        claim:
          "AI-assisted software development can increase the strategic importance of validation and CI feedback speed.",

        observation:
          "Multiple modeled developer-workflow observations point toward code-generation velocity increasing pressure on downstream validation loops.",

        sourceIds: [
          "source-developer-ecosystem",
          "source-category-watch",
        ],

        independentSourceCount:
          2,

        confidence: 86,

        freshness: 94,

        interpretation:
          "The bottleneck may move from producing code toward validating, testing and safely integrating a larger volume of generated changes.",

        implication:
          "WarpBuild may have a stronger category narrative around AI-era development throughput than a generic faster-runners message.",

        proposedAction:
          "Investigate AI-native engineering teams and test validation-speed positioning before changing the core narrative.",

        humanReviewRequired:
          true,
      },

      {
        signalId:
          "signal-plg-enterprise",

        epistemicState:
          "CORROBORATED",

        claim:
          "Developer-led product usage can create signals that help identify enterprise sales opportunities.",

        observation:
          "The modeled GTM system contains repeated patterns connecting product adoption, account activity and enterprise buying readiness.",

        sourceIds: [
          "source-customer-patterns",
          "source-developer-ecosystem",
        ],

        independentSourceCount:
          2,

        confidence: 84,

        freshness: 88,

        interpretation:
          "Usage intelligence may provide a stronger enterprise prioritization mechanism than treating product adoption and outbound sales independently.",

        implication:
          "WarpBuild can connect developer adoption to account scoring, buying committees and enterprise readiness.",

        proposedAction:
          "Define product-qualified-account triggers and test an account-intelligence motion.",

        humanReviewRequired:
          false,
      },

      {
        signalId:
          "signal-performance-packaging",

        epistemicState:
          "INFERRED",

        claim:
          "CI category competition may increasingly be evaluated on price-performance rather than speed alone.",

        observation:
          "Modeled category scenarios indicate that raw compute performance can become less differentiated as infrastructure alternatives improve.",

        sourceIds: [
          "source-category-watch",
        ],

        independentSourceCount:
          1,

        confidence: 68,

        freshness: 83,

        interpretation:
          "A speed-only category message could become easier for competitors to imitate than an economic outcome narrative.",

        implication:
          "WarpBuild should quantify engineering time saved, compute economics and feedback-loop value before making packaging decisions.",

        proposedAction:
          "Use the CI Economics engine to pressure-test price-performance positioning.",

        humanReviewRequired:
          true,
      },

      {
        signalId:
          "signal-agentic-devtools",

        epistemicState:
          "CORROBORATED",

        claim:
          "Agentic developer tooling may expand the number of automated software changes requiring validation infrastructure.",

        observation:
          "Modeled ecosystem observations connect autonomous coding workflows with higher potential demand for automated testing and CI execution.",

        sourceIds: [
          "source-developer-ecosystem",
          "source-category-watch",
        ],

        independentSourceCount:
          2,

        confidence: 78,

        freshness: 91,

        interpretation:
          "CI may increasingly serve software agents as well as human developers, changing workload frequency and product expectations.",

        implication:
          "WarpBuild can investigate whether agent-triggered CI becomes a distinct product and infrastructure use case.",

        proposedAction:
          "Create an experiment around agent-generated workload patterns and CI demand.",

        humanReviewRequired:
          false,
      },

      {
        signalId:
          "signal-runner-commoditization",

        epistemicState:
          "MODELED",

        claim:
          "Raw runner speed may become a weaker standalone differentiator over time.",

        observation:
          "This is currently a modeled competitive scenario rather than a verified external market fact.",

        sourceIds: [
          "source-category-watch",
        ],

        independentSourceCount:
          1,

        confidence: 61,

        freshness: 76,

        interpretation:
          "If infrastructure performance converges, differentiation may migrate toward reliability, economics, developer experience and intelligence.",

        implication:
          "WarpBuild should understand which parts of its value proposition remain difficult to commoditize.",

        proposedAction:
          "Monitor category messaging and test economic-outcome positioning.",

        humanReviewRequired:
          true,
      },

      {
        signalId:
          "signal-security-enterprise",

        epistemicState:
          "INFERRED",

        claim:
          "Enterprise CI adoption can depend on security and procurement evidence in addition to developer value.",

        observation:
          "Modeled enterprise adoption patterns suggest technical adoption does not automatically remove organizational buying gates.",

        sourceIds: [
          "source-customer-patterns",
        ],

        independentSourceCount:
          1,

        confidence: 71,

        freshness: 80,

        interpretation:
          "A technically successful developer trial can still stall if security, procurement and governance evidence is unavailable.",

        implication:
          "Enterprise GTM should surface readiness evidence alongside product-qualified account signals.",

        proposedAction:
          "Map enterprise security gates into the account progression model.",

        humanReviewRequired:
          false,
      },

      {
        signalId:
          "signal-open-source-distribution",

        epistemicState:
          "MODELED",

        claim:
          "Open-source developer tooling may create high-intent distribution paths for infrastructure products.",

        observation:
          "This is a modeled distribution hypothesis represented in the Market Radar demo corpus.",

        sourceIds: [
          "source-developer-ecosystem",
        ],

        independentSourceCount:
          1,

        confidence: 57,

        freshness: 72,

        interpretation:
          "Developer participation in adjacent tooling could expose intent before a conventional enterprise sales interaction occurs.",

        implication:
          "WarpBuild can test whether ecosystem participation creates measurable product-qualified demand.",

        proposedAction:
          "Design a bounded open-source distribution experiment with attribution.",

        humanReviewRequired:
          false,
      },
    ],
  };