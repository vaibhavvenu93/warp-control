import {
  Account,
  EvidenceRef,
  Signal,
} from "@/domain/types";

export const DEMO_NOW =
  new Date(
    "2026-09-23T12:00:00.000Z",
  );

export const DEMO_CORRELATION_ID =
  "corr-warp-control-demo-001";

export const DEMO_ACCOUNT_ID =
  "acc-northstar-labs";

export const demoAccount: Account = {
  id: DEMO_ACCOUNT_ID,

  name: "Northstar Labs",

  domain:
    "northstar.example",

  stage: "QUALIFIED",

  profile: {
    industry:
      "AI Developer Infrastructure",

    employeeCount: 420,

    developerCount: 180,

    headquarters:
      "San Francisco",

    fundingStage:
      "Series B",
  },

  engineering: {
    repositories: 74,

    estimatedDevelopers: 180,

    ciProvider:
      "GitHub Actions",

    cloudProvider: "AWS",

    languages: [
      "TypeScript",
      "Go",
      "Python",
      "Rust",
    ],

    frameworks: [
      "Next.js",
      "React",
    ],

    aiCodingSignals: [
      "AI-assisted development",
      "Agentic coding workflows",
    ],
  },

  commercial: {
    estimatedACV: 120_000,

    currentSpendEstimate:
      85_000,

    expansionPotential: 88,
  },

  signalIds: [
    "sig-engineering",
    "sig-ci",
    "sig-ai",
    "sig-growth",
    "sig-infra",
    "sig-buying",
  ],

  evidenceIds: [
    "ev-company-profile",
    "ev-engineering-model",
  ],

  createdAt:
    "2026-09-01T00:00:00.000Z",

  updatedAt:
    DEMO_NOW.toISOString(),
};

export const demoEvidence: EvidenceRef[] =
  [
    {
      id:
        "ev-company-profile",

      type: "PUBLIC",

      source:
        "Demo public company profile",

      capturedAt:
        DEMO_NOW.toISOString(),

      claim:
        "Company profile and engineering footprint used for the deterministic demonstration scenario.",

      confidence: 86,
    },

    {
      id:
        "ev-engineering-model",

      type: "MODELED",

      source:
        "WARP / CONTROL demo model",

      capturedAt:
        DEMO_NOW.toISOString(),

      claim:
        "Developer count and repository intensity are modeled inputs for product demonstration only.",

      confidence: 72,
    },

    {
      id:
        "ev-ci",

      type: "MODELED",

      source:
        "CI pressure model",

      capturedAt:
        DEMO_NOW.toISOString(),

      claim:
        "Modeled CI feedback-loop pressure suggests material developer waiting time.",

      confidence: 84,
    },

    {
      id:
        "ev-ai",

      type: "PUBLIC",

      source:
        "Demo engineering research",

      capturedAt:
        DEMO_NOW.toISOString(),

      claim:
        "Public engineering signals indicate AI-assisted software development adoption.",

      confidence: 82,
    },

    {
      id:
        "ev-growth",

      type: "PUBLIC",

      source:
        "Demo hiring research",

      capturedAt:
        DEMO_NOW.toISOString(),

      claim:
        "Public hiring activity is used as a modeled growth-momentum signal.",

      confidence: 78,
    },

    {
      id:
        "ev-infra",

      type: "MODELED",

      source:
        "Infrastructure complexity model",

      capturedAt:
        DEMO_NOW.toISOString(),

      claim:
        "Repository, cloud and stack complexity imply a meaningful CI infrastructure surface.",

      confidence: 76,
    },

    {
      id:
        "ev-buying",

      type: "ASSUMED",

      source:
        "Demo buying-intent scenario",

      capturedAt:
        DEMO_NOW.toISOString(),

      claim:
        "Buying intent is intentionally assumed for this demonstration and is not presented as verified customer data.",

      confidence: 65,
    },
  ];

export const demoSignals: Signal[] =
  [
    {
      id:
        "sig-engineering",

      accountId:
        DEMO_ACCOUNT_ID,

      category:
        "ENGINEERING",

      direction:
        "POSITIVE",

      title:
        "High engineering intensity",

      description:
        "Large developer population and repository footprint create substantial CI surface area.",

      strength: 88,

      confidence: 88,

      evidenceIds: [
        "ev-company-profile",
        "ev-engineering-model",
      ],

      detectedAt:
        DEMO_NOW.toISOString(),
    },

    {
      id: "sig-ci",

      accountId:
        DEMO_ACCOUNT_ID,

      category:
        "CI_PAIN",

      direction:
        "POSITIVE",

      title:
        "CI feedback-loop pressure",

      description:
        "Modeled build and validation latency creates a credible developer-productivity problem.",

      strength: 94,

      confidence: 88,

      evidenceIds: [
        "ev-ci",
      ],

      detectedAt:
        DEMO_NOW.toISOString(),
    },

    {
      id: "sig-ai",

      accountId:
        DEMO_ACCOUNT_ID,

      category:
        "AI_ADOPTION",

      direction:
        "POSITIVE",

      title:
        "AI coding velocity",

      description:
        "AI-assisted development increases code-generation throughput and raises the cost of slow validation.",

      strength: 91,

      confidence: 86,

      evidenceIds: [
        "ev-ai",
      ],

      detectedAt:
        DEMO_NOW.toISOString(),
    },

    {
      id:
        "sig-growth",

      accountId:
        DEMO_ACCOUNT_ID,

      category:
        "GROWTH",

      direction:
        "POSITIVE",

      title:
        "Engineering growth",

      description:
        "Growth in technical headcount increases the economic leverage of faster CI.",

      strength: 78,

      confidence: 80,

      evidenceIds: [
        "ev-growth",
      ],

      detectedAt:
        DEMO_NOW.toISOString(),
    },

    {
      id:
        "sig-infra",

      accountId:
        DEMO_ACCOUNT_ID,

      category:
        "INFRASTRUCTURE",

      direction:
        "POSITIVE",

      title:
        "Infrastructure complexity",

      description:
        "Multi-language repositories and cloud infrastructure increase CI orchestration complexity.",

      strength: 82,

      confidence: 82,

      evidenceIds: [
        "ev-infra",
      ],

      detectedAt:
        DEMO_NOW.toISOString(),
    },

    {
      id:
        "sig-buying",

      accountId:
        DEMO_ACCOUNT_ID,

      category:
        "BUYING_INTENT",

      direction:
        "POSITIVE",

      title:
        "Modeled evaluation intent",

      description:
        "A deliberately assumed evaluation signal demonstrates how WARP / CONTROL routes high-intent accounts.",

      strength: 86,

      confidence: 72,

      evidenceIds: [
        "ev-buying",
      ],

      detectedAt:
        DEMO_NOW.toISOString(),
    },
  ];