import {
  ExperimentCandidate,
} from "@/domain/experiment-intelligence/types";

import {
  rankExperiments,
} from "@/domain/experiment-intelligence/experiment-engine";

export const demoExperimentPortfolio:
  ExperimentCandidate[] = [
    {
      id: "exp-ci-roi-calculator",

      title:
        "Interactive CI ROI calculator",

      hypothesis:
        "If engineering leaders can quantify the economic cost of CI latency using their own inputs, more high-intent visitors will convert into qualified enterprise conversations.",

      owner: "Growth",

      category: "CONVERSION",

      estimatedAnnualImpact:
        300_000,

      estimatedCost: 15_000,

      executionDays: 10,

      learningDays: 14,

      confidence: 78,

      strategicRelevance: 95,

      reversibility: 95,

      metrics: [
        {
          id: "metric-roi-demo",

          name:
            "Qualified demo conversion",

          direction:
            "INCREASE",

          baseline: 0.08,

          target: 0.12,

          unit: "rate",
        },

        {
          id: "metric-roi-pql",

          name:
            "Enterprise-intent submissions",

          direction:
            "INCREASE",

          baseline: 20,

          target: 35,

          unit: "monthly leads",
        },
      ],

      dependencies: [
        {
          id: "dep-economics",

          name:
            "CI economics model",

          status: "READY",

          critical: true,
        },

        {
          id: "dep-web",

          name:
            "Website experiment surface",

          status: "READY",

          critical: true,
        },
      ],

      evidence: [
        {
          id: "ev-ci-economics",

          type: "MODELED",

          confidence: 82,
        },

        {
          id: "ev-account-signals",

          type: "CONNECTED",

          confidence: 85,
        },
      ],
    },

    {
      id: "exp-plg-sales-trigger",

      title:
        "PLG → sales usage trigger",

      hypothesis:
        "If accounts showing high CI usage or rapid usage growth are routed to sales at the moment of demonstrated value, enterprise conversion and expansion will increase.",

      owner: "Revenue",

      category: "CONVERSION",

      estimatedAnnualImpact:
        450_000,

      estimatedCost: 25_000,

      executionDays: 18,

      learningDays: 21,

      confidence: 74,

      strategicRelevance: 98,

      reversibility: 90,

      metrics: [
        {
          id: "metric-pql-sql",

          name:
            "PQL to qualified opportunity",

          direction:
            "INCREASE",

          baseline: 0.12,

          target: 0.2,

          unit: "rate",
        },

        {
          id: "metric-expansion",

          name:
            "Expansion pipeline",

          direction:
            "INCREASE",

          baseline: 100_000,

          target: 175_000,

          unit: "USD",
        },
      ],

      dependencies: [
        {
          id: "dep-usage-events",

          name:
            "Product usage telemetry",

          status: "PARTIAL",

          critical: true,
        },

        {
          id: "dep-crm",

          name:
            "CRM account mapping",

          status: "PARTIAL",

          critical: true,
        },
      ],

      evidence: [
        {
          id: "ev-usage",

          type: "CONNECTED",

          confidence: 78,
        },

        {
          id: "ev-revenue-model",

          type: "MODELED",

          confidence: 75,
        },
      ],
    },

    {
      id: "exp-ai-team-positioning",

      title:
        "AI-native engineering team positioning",

      hypothesis:
        "Positioning fast CI as infrastructure for AI-accelerated engineering teams will improve engagement among companies where code generation is increasing faster than validation capacity.",

      owner: "Growth",

      category: "ACQUISITION",

      estimatedAnnualImpact:
        240_000,

      estimatedCost: 12_000,

      executionDays: 12,

      learningDays: 14,

      confidence: 70,

      strategicRelevance: 94,

      reversibility: 98,

      metrics: [
        {
          id: "metric-ai-ctr",

          name:
            "ICP landing-page conversion",

          direction:
            "INCREASE",

          baseline: 0.035,

          target: 0.055,

          unit: "rate",
        },
      ],

      dependencies: [
        {
          id: "dep-ai-segment",

          name:
            "AI adoption account segment",

          status: "READY",

          critical: true,
        },
      ],

      evidence: [
        {
          id: "ev-ai-signal",

          type: "PUBLIC",

          confidence: 82,
        },

        {
          id: "ev-ai-model",

          type: "MODELED",

          confidence: 72,
        },
      ],
    },

    {
      id: "exp-enterprise-pricing",

      title:
        "Value-based enterprise pricing",

      hypothesis:
        "Pricing enterprise contracts against quantified engineering capacity recovered, rather than only compute consumption, may increase ACV while preserving compelling customer ROI.",

      owner: "CEO",

      category: "PRICING",

      estimatedAnnualImpact:
        600_000,

      estimatedCost: 35_000,

      executionDays: 30,

      learningDays: 45,

      confidence: 62,

      strategicRelevance: 96,

      reversibility: 65,

      metrics: [
        {
          id: "metric-acv",

          name:
            "Enterprise ACV",

          direction:
            "INCREASE",

          baseline: 120_000,

          target: 160_000,

          unit: "USD",
        },

        {
          id: "metric-win-rate",

          name:
            "Enterprise win rate",

          direction:
            "INCREASE",

          baseline: 0.22,

          target: 0.25,

          unit: "rate",
        },
      ],

      dependencies: [
        {
          id: "dep-pricing-data",

          name:
            "Historical pricing and win-loss data",

          status: "BLOCKED",

          critical: true,
        },
      ],

      evidence: [
        {
          id: "ev-pricing-model",

          type: "MODELED",

          confidence: 65,
        },

        {
          id: "ev-value-model",

          type: "MODELED",

          confidence: 72,
        },
      ],
    },

    {
      id: "exp-founder-outbound",

      title:
        "Founder-led CI pain outbound",

      hypothesis:
        "Highly personalized outbound to engineering leaders at accounts with visible CI pain, hiring growth and AI adoption signals will create qualified pipeline faster than broad outbound.",

      owner: "CEO",

      category: "ACQUISITION",

      estimatedAnnualImpact:
        220_000,

      estimatedCost: 8_000,

      executionDays: 7,

      learningDays: 14,

      confidence: 76,

      strategicRelevance: 88,

      reversibility: 100,

      metrics: [
        {
          id: "metric-founder-reply",

          name:
            "Positive reply rate",

          direction:
            "INCREASE",

          baseline: 0.04,

          target: 0.1,

          unit: "rate",
        },

        {
          id: "metric-founder-pipeline",

          name:
            "Qualified pipeline created",

          direction:
            "INCREASE",

          baseline: 0,

          target: 100_000,

          unit: "USD",
        },
      ],

      dependencies: [
        {
          id: "dep-warp-score",

          name:
            "WarpScore account qualification",

          status: "READY",

          critical: true,
        },
      ],

      evidence: [
        {
          id: "ev-warp-score",

          type: "INTERNAL",

          confidence: 88,
        },

        {
          id: "ev-public-triggers",

          type: "PUBLIC",

          confidence: 80,
        },
      ],
    },

    {
      id: "exp-generic-paid-search",

      title:
        "Broad CI paid-search campaign",

      hypothesis:
        "Increasing spend on broad CI keywords will generate enough incremental enterprise pipeline to justify acquisition cost.",

      owner: "Growth",

      category: "ACQUISITION",

      estimatedAnnualImpact:
        35_000,

      estimatedCost: 55_000,

      executionDays: 30,

      learningDays: 45,

      confidence: 32,

      strategicRelevance: 38,

      reversibility: 75,

      metrics: [
        {
          id: "metric-paid-pipeline",

          name:
            "Paid-search sourced pipeline",

          direction:
            "INCREASE",

          baseline: 0,

          target: 35_000,

          unit: "USD",
        },
      ],

      dependencies: [
        {
          id: "dep-attribution",

          name:
            "Channel attribution",

          status: "READY",

          critical: true,
        },
      ],

      evidence: [
        {
          id: "ev-paid-assumption",

          type: "PUBLIC",

          confidence: 65,
        },
      ],
    },

    {
      id: "exp-security-enterprise",

      title:
        "Enterprise security acceleration",

      hypothesis:
        "Reducing security-review friction with stronger enterprise security materials will shorten sales cycles for security-sensitive engineering organizations.",

      owner: "Operations",

      category: "CONVERSION",

      estimatedAnnualImpact:
        350_000,

      estimatedCost: 45_000,

      executionDays: 30,

      learningDays: 35,

      confidence: 68,

      strategicRelevance: 91,

      reversibility: 80,

      metrics: [
        {
          id: "metric-security-cycle",

          name:
            "Security review duration",

          direction:
            "DECREASE",

          baseline: 30,

          target: 18,

          unit: "days",
        },
      ],

      dependencies: [
        {
          id: "dep-security-data",

          name:
            "Enterprise loss-reason data",

          status: "PARTIAL",

          critical: true,
        },
      ],

      evidence: [
        {
          id: "ev-security",

          type: "ASSUMED",

          confidence: 55,
        },
      ],
    },
  ];

export const demoExperimentEvaluations =
  rankExperiments(
    demoExperimentPortfolio,
  );

export const demoExperimentSummary = {
  total:
    demoExperimentEvaluations.length,

  run:
    demoExperimentEvaluations.filter(
      (item) =>
        item.decision === "RUN",
    ).length,

  hold:
    demoExperimentEvaluations.filter(
      (item) =>
        item.decision === "HOLD",
    ).length,

  needsEvidence:
    demoExperimentEvaluations.filter(
      (item) =>
        item.decision ===
        "NEEDS_EVIDENCE",
    ).length,

  kill:
    demoExperimentEvaluations.filter(
      (item) =>
        item.decision === "KILL",
    ).length,

  modeledExpectedValue:
    demoExperimentEvaluations.reduce(
      (total, item) =>
        total +
        item.expectedValue,
      0,
    ),
};