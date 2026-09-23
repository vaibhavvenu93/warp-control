import type {
  MarketSignal,
} from "@/domain/market-radar/types";

export const MARKET_RADAR_DEMO_NOW =
  "2026-09-23T12:00:00.000Z";

export const marketRadarDemoSignals:
  MarketSignal[] = [
    {
      id: "signal-ai-ci-bottleneck",
      title:
        "AI coding velocity is increasing pressure on CI feedback loops",
      summary:
        "Modeled market scenario: engineering teams using AI coding tools generate and iterate on code faster, increasing the strategic cost of slow validation infrastructure.",
      category:
        "AI_ENGINEERING",
      direction:
        "OPPORTUNITY",
      urgency:
        "THIS_WEEK",
      status:
        "NEW",
      detectedAt:
        "2026-09-23T08:00:00.000Z",
      entities: [
        "AI-native engineering teams",
        "CI infrastructure",
      ],
      impactAreas: [
        "POSITIONING",
        "PRODUCT",
        "GTM",
        "STRATEGY",
      ],
      evidence: [
        {
          id: "evidence-ai-ci-001",
          title:
            "AI engineering velocity scenario",
          sourceName:
            "WARP / CONTROL Market Model",
          sourceType:
            "MODELED",
          observedAt:
            "2026-09-23T08:00:00.000Z",
          excerpt:
            "Modeled hypothesis: faster code generation increases the relative importance of validation and CI latency.",
          reliability: 0.72,
          isSynthetic: true,
        },
        {
          id: "evidence-ai-ci-002",
          title:
            "CI economics linkage",
          sourceName:
            "WARP / CONTROL CI Economics",
          sourceType:
            "INTERNAL",
          observedAt:
            "2026-09-23T08:00:00.000Z",
          excerpt:
            "The existing economics model translates CI waiting time into developer-time and customer-value exposure.",
          reliability: 1,
          isSynthetic: true,
        },
      ],
      factors: {
        strategicFit: 96,
        commercialImpact: 90,
        productImpact: 88,
        timeSensitivity: 84,
        evidenceStrength: 0,
        competitiveIntensity: 72,
        actionability: 94,
      },
      whyItMatters:
        "WarpBuild can position faster CI as infrastructure for AI-native engineering velocity rather than only as faster GitHub Actions runners.",
      recommendedAction:
        "Test AI-native engineering velocity as a positioning wedge against the existing speed-led message.",
      recommendedActionType:
        "CREATE_EXPERIMENT",
      decisionRequired: false,
      experimentCandidate: true,
      tags: [
        "ai-native",
        "developer-velocity",
        "ci-latency",
      ],
    },

    {
      id: "signal-performance-packaging",
      title:
        "CI category may be shifting toward price-performance packaging",
      summary:
        "Modeled competitive scenario: high-performance CI providers increasingly compete on the economic value of faster compute rather than raw runner specifications.",
      category:
        "PRICING",
      direction:
        "THREAT",
      urgency:
        "THIS_MONTH",
      status:
        "INVESTIGATING",
      detectedAt:
        "2026-09-22T16:00:00.000Z",
      entities: [
        "CI infrastructure vendors",
        "Engineering buyers",
      ],
      impactAreas: [
        "PRICING",
        "POSITIONING",
        "ECONOMICS",
        "ENTERPRISE_SALES",
      ],
      evidence: [
        {
          id: "evidence-price-001",
          title:
            "Competitive packaging scenario",
          sourceName:
            "WARP / CONTROL Market Model",
          sourceType:
            "MODELED",
          observedAt:
            "2026-09-22T16:00:00.000Z",
          excerpt:
            "Modeled scenario used to test whether WarpBuild should defend price with compute cost or customer value.",
          reliability: 0.65,
          isSynthetic: true,
        },
      ],
      factors: {
        strategicFit: 90,
        commercialImpact: 94,
        productImpact: 62,
        timeSensitivity: 68,
        evidenceStrength: 0,
        competitiveIntensity: 90,
        actionability: 82,
      },
      whyItMatters:
        "If buyers evaluate CI on effective price-performance, WarpBuild needs a defensible value model rather than a generic speed claim.",
      recommendedAction:
        "Compare value-based pricing, effective build-minute economics and competitor packaging before changing price.",
      recommendedActionType:
        "UPDATE_MODEL",
      decisionRequired: true,
      experimentCandidate: true,
      tags: [
        "pricing",
        "competition",
        "unit-economics",
      ],
    },

    {
      id: "signal-plg-enterprise",
      title:
        "Developer-led adoption can expose enterprise sales triggers",
      summary:
        "Modeled GTM signal: usage concentration, repository growth and team expansion can identify accounts that are moving from individual adoption toward enterprise relevance.",
      category:
        "CUSTOMER",
      direction:
        "OPPORTUNITY",
      urgency:
        "THIS_WEEK",
      status:
        "NEW",
      detectedAt:
        "2026-09-22T12:00:00.000Z",
      entities: [
        "Developer users",
        "Enterprise accounts",
      ],
      impactAreas: [
        "GTM",
        "ENTERPRISE_SALES",
        "STRATEGY",
      ],
      evidence: [
        {
          id: "evidence-plg-001",
          title:
            "PLG-to-sales hypothesis",
          sourceName:
            "WARP / CONTROL Experiment System",
          sourceType:
            "INTERNAL",
          observedAt:
            "2026-09-22T12:00:00.000Z",
          excerpt:
            "Existing experiment portfolio includes product-usage triggers as a route into enterprise sales.",
          reliability: 1,
          isSynthetic: true,
        },
      ],
      factors: {
        strategicFit: 94,
        commercialImpact: 92,
        productImpact: 70,
        timeSensitivity: 82,
        evidenceStrength: 0,
        competitiveIntensity: 58,
        actionability: 96,
      },
      whyItMatters:
        "A reliable product-qualified-account signal can make founder-led sales materially more focused.",
      recommendedAction:
        "Define usage thresholds that create an account-intelligence event and route qualified accounts into the GTM engine.",
      recommendedActionType:
        "GTM_ACTION",
      decisionRequired: false,
      experimentCandidate: true,
      tags: [
        "plg",
        "enterprise",
        "account-intelligence",
      ],
    },

    {
      id: "signal-security-enterprise",
      title:
        "Enterprise CI adoption depends on security evidence, not speed alone",
      summary:
        "Modeled enterprise-buying scenario: performance may open the conversation, but security, isolation, compliance and procurement evidence determine whether larger accounts progress.",
      category:
        "SECURITY",
      direction:
        "WATCH",
      urgency:
        "THIS_MONTH",
      status:
        "INVESTIGATING",
      detectedAt:
        "2026-09-21T14:00:00.000Z",
      entities: [
        "Enterprise engineering teams",
        "Security buyers",
      ],
      impactAreas: [
        "ENTERPRISE_SALES",
        "SECURITY",
        "PRODUCT",
      ],
      evidence: [
        {
          id: "evidence-security-001",
          title:
            "Enterprise buying model",
          sourceName:
            "WARP / CONTROL Market Model",
          sourceType:
            "MODELED",
          observedAt:
            "2026-09-21T14:00:00.000Z",
          excerpt:
            "Modeled assumption: enterprise CI evaluations include security and procurement gates beyond performance.",
          reliability: 0.7,
          isSynthetic: true,
        },
      ],
      factors: {
        strategicFit: 86,
        commercialImpact: 84,
        productImpact: 78,
        timeSensitivity: 60,
        evidenceStrength: 0,
        competitiveIntensity: 55,
        actionability: 74,
      },
      whyItMatters:
        "A high-intent enterprise account can still stall if proof required by security and procurement arrives too late.",
      recommendedAction:
        "Map the enterprise security evidence pack and test where security enters the sales cycle.",
      recommendedActionType:
        "INVESTIGATE",
      decisionRequired: false,
      experimentCandidate: true,
      tags: [
        "security",
        "enterprise",
        "procurement",
      ],
    },

    {
      id: "signal-runner-commoditization",
      title:
        "Raw runner speed risks becoming a commoditized message",
      summary:
        "Modeled category scenario: as more infrastructure vendors market faster compute, differentiation may migrate toward developer economics, workflow intelligence and reliability.",
      category:
        "COMPETITOR",
      direction:
        "THREAT",
      urgency:
        "THIS_MONTH",
      status:
        "NEW",
      detectedAt:
        "2026-09-21T10:00:00.000Z",
      entities: [
        "CI infrastructure vendors",
        "Developer tooling market",
      ],
      impactAreas: [
        "POSITIONING",
        "PRODUCT",
        "STRATEGY",
      ],
      evidence: [
        {
          id: "evidence-commodity-001",
          title:
            "Category differentiation scenario",
          sourceName:
            "WARP / CONTROL Market Model",
          sourceType:
            "MODELED",
          observedAt:
            "2026-09-21T10:00:00.000Z",
          excerpt:
            "Synthetic scenario designed to test whether speed alone remains a durable category differentiator.",
          reliability: 0.62,
          isSynthetic: true,
        },
      ],
      factors: {
        strategicFit: 92,
        commercialImpact: 80,
        productImpact: 86,
        timeSensitivity: 64,
        evidenceStrength: 0,
        competitiveIntensity: 92,
        actionability: 72,
      },
      whyItMatters:
        "WarpBuild's long-term differentiation may need to connect infrastructure performance to measurable engineering outcomes.",
      recommendedAction:
        "Investigate category messaging and identify differentiation that remains defensible if faster runners become expected.",
      recommendedActionType:
        "INVESTIGATE",
      decisionRequired: false,
      experimentCandidate: false,
      tags: [
        "competition",
        "positioning",
        "moat",
      ],
    },

    {
      id: "signal-agentic-devtools",
      title:
        "Agentic developer tooling expands the CI intelligence surface",
      summary:
        "Modeled product scenario: autonomous coding agents create demand for infrastructure that can validate, observe and govern machine-generated changes at higher frequency.",
      category:
        "DEVELOPER_ECOSYSTEM",
      direction:
        "OPPORTUNITY",
      urgency:
        "THIS_MONTH",
      status:
        "NEW",
      detectedAt:
        "2026-09-20T15:00:00.000Z",
      entities: [
        "Coding agents",
        "Developer infrastructure",
      ],
      impactAreas: [
        "PRODUCT",
        "STRATEGY",
        "POSITIONING",
        "PARTNERSHIPS",
      ],
      evidence: [
        {
          id: "evidence-agentic-001",
          title:
            "Agentic development scenario",
          sourceName:
            "WARP / CONTROL Market Model",
          sourceType:
            "MODELED",
          observedAt:
            "2026-09-20T15:00:00.000Z",
          excerpt:
            "Modeled hypothesis: machine-generated code increases validation frequency and creates new orchestration requirements.",
          reliability: 0.68,
          isSynthetic: true,
        },
      ],
      factors: {
        strategicFit: 96,
        commercialImpact: 78,
        productImpact: 94,
        timeSensitivity: 72,
        evidenceStrength: 0,
        competitiveIntensity: 64,
        actionability: 70,
      },
      whyItMatters:
        "WarpBuild could become part of the execution and validation infrastructure used by coding agents rather than serving only human-triggered CI workflows.",
      recommendedAction:
        "Map how coding agents trigger validation today and identify one integration or workflow experiment.",
      recommendedActionType:
        "CREATE_EXPERIMENT",
      decisionRequired: false,
      experimentCandidate: true,
      tags: [
        "agents",
        "developer-tools",
        "future-product",
      ],
    },

    {
      id: "signal-open-source-distribution",
      title:
        "Open-source developer tooling can create high-intent distribution",
      summary:
        "Modeled distribution scenario: useful open-source utilities around CI analysis or developer economics can attract teams already experiencing the problem WarpBuild solves.",
      category:
        "OPEN_SOURCE",
      direction:
        "OPPORTUNITY",
      urgency:
        "MONITOR",
      status:
        "NEW",
      detectedAt:
        "2026-09-19T09:00:00.000Z",
      entities: [
        "Open-source developers",
        "Engineering teams",
      ],
      impactAreas: [
        "GTM",
        "POSITIONING",
        "PARTNERSHIPS",
      ],
      evidence: [
        {
          id: "evidence-oss-001",
          title:
            "Open-source distribution hypothesis",
          sourceName:
            "WARP / CONTROL Market Model",
          sourceType:
            "MODELED",
          observedAt:
            "2026-09-19T09:00:00.000Z",
          excerpt:
            "Synthetic GTM hypothesis for evaluating developer-led distribution.",
          reliability: 0.58,
          isSynthetic: true,
        },
      ],
      factors: {
        strategicFit: 76,
        commercialImpact: 58,
        productImpact: 50,
        timeSensitivity: 38,
        evidenceStrength: 0,
        competitiveIntensity: 42,
        actionability: 80,
      },
      whyItMatters:
        "Developer infrastructure products benefit when useful tooling creates trust before a commercial conversation.",
      recommendedAction:
        "Keep as a low-cost distribution hypothesis until higher-priority experiments produce evidence.",
      recommendedActionType:
        "MONITOR",
      decisionRequired: false,
      experimentCandidate: true,
      tags: [
        "open-source",
        "distribution",
        "developer-marketing",
      ],
    },
  ];