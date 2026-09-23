import { describe, expect, it } from "vitest";

import {
  Account,
  EvidenceRef,
  Signal,
  WarpScore,
} from "@/domain/types";

import {
  generateOpportunity,
  OPPORTUNITY_ENGINE_VERSION,
} from "./opportunity-engine";

const NOW = new Date("2026-09-23T10:00:00.000Z");

function createAccount(): Account {
  return {
    id: "acc-ai-native",
    name: "AI Native Engineering Co",
    domain: "example.com",
    stage: "QUALIFIED",

    profile: {
      industry: "Software",
      employeeCount: 600,
      developerCount: 220,
      headquarters: "San Francisco",
      fundingStage: "Series B",
    },

    engineering: {
      repositories: 90,
      estimatedDevelopers: 220,
      ciProvider: "GitHub Actions",
      cloudProvider: "AWS",
      languages: ["TypeScript", "Python", "Go"],
      frameworks: ["Next.js", "FastAPI"],
      aiCodingSignals: ["AI coding adoption"],
    },

    commercial: {
      estimatedACV: 100_000,
      expansionPotential: 85,
      currentSpendEstimate: 80_000,
    },

    signalIds: [
      "sig-ci",
      "sig-ai",
      "sig-buy",
    ],

    evidenceIds: ["ev-account"],

    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-23T09:00:00.000Z",
  };
}

function createEvidence(): EvidenceRef[] {
  return [
    {
      id: "ev-account",
      type: "CONNECTED",
      source: "Account enrichment",
      capturedAt: "2026-09-22T10:00:00.000Z",
      claim: "Engineering profile verified.",
      confidence: 95,
    },
    {
      id: "ev-ci",
      type: "CONNECTED",
      source: "CI telemetry",
      capturedAt: "2026-09-23T09:00:00.000Z",
      claim: "CI pressure detected.",
      confidence: 96,
    },
    {
      id: "ev-ai",
      type: "PUBLIC",
      source: "Engineering research",
      capturedAt: "2026-09-22T09:00:00.000Z",
      claim: "AI coding adoption detected.",
      confidence: 90,
    },
    {
      id: "ev-buy",
      type: "INTERNAL",
      source: "Product signal",
      capturedAt: "2026-09-23T09:30:00.000Z",
      claim: "Buying intent detected.",
      confidence: 98,
    },
  ];
}

function createSignals(): Signal[] {
  return [
    {
      id: "sig-ci",
      accountId: "acc-ai-native",
      category: "CI_PAIN",
      direction: "POSITIVE",
      title: "CI bottleneck",
      description: "CI feedback loop is under pressure.",
      strength: 95,
      confidence: 95,
      evidenceIds: ["ev-ci"],
      detectedAt: "2026-09-23T09:00:00.000Z",
    },
    {
      id: "sig-ai",
      accountId: "acc-ai-native",
      category: "AI_ADOPTION",
      direction: "POSITIVE",
      title: "AI coding adoption",
      description: "AI-assisted development is active.",
      strength: 90,
      confidence: 90,
      evidenceIds: ["ev-ai"],
      detectedAt: "2026-09-22T09:00:00.000Z",
    },
    {
      id: "sig-buy",
      accountId: "acc-ai-native",
      category: "BUYING_INTENT",
      direction: "POSITIVE",
      title: "Commercial intent",
      description: "Strong buying signal detected.",
      strength: 80,
      confidence: 95,
      evidenceIds: ["ev-buy"],
      detectedAt: "2026-09-23T09:30:00.000Z",
    },
  ];
}

function createWarpScore(): WarpScore {
  return {
    accountId: "acc-ai-native",
    score: 82,
    classification: "HIGH_PRIORITY",
    confidence: 88,

    components: [
      {
        key: "ciPain",
        label: "CI pain",
        rawValue: 95,
        normalizedValue: 95,
        weight: 0.2,
        contribution: 19,
        evidenceIds: ["ev-ci"],
      },
      {
        key: "engineeringIntensity",
        label: "Engineering intensity",
        rawValue: 88,
        normalizedValue: 88,
        weight: 0.2,
        contribution: 17.6,
        evidenceIds: ["ev-account"],
      },
      {
        key: "aiAdoption",
        label: "AI coding adoption",
        rawValue: 90,
        normalizedValue: 90,
        weight: 0.15,
        contribution: 13.5,
        evidenceIds: ["ev-ai"],
      },
    ],

    calculatedAt: NOW.toISOString(),
    version: "1.0.0",
  };
}

describe("OpportunityEngine", () => {
  it("generates a commercial opportunity from qualified intelligence", () => {
    const result = generateOpportunity({
      account: createAccount(),
      signals: createSignals(),
      evidence: createEvidence(),
      warpScore: createWarpScore(),
      now: NOW,
    });

    expect(result.opportunity.accountId).toBe(
      "acc-ai-native",
    );

    expect(result.opportunity.estimatedACV).toBe(
      100_000,
    );

    expect(result.opportunity.expectedValue).toBeGreaterThan(
      0,
    );

    expect(result.opportunity.probability).toBeGreaterThan(
      0,
    );

    expect(result.opportunity.probability).toBeLessThanOrEqual(
      90,
    );
  });

  it("selects a founder outbound motion for a high-priority account with buying intent", () => {
    const result = generateOpportunity({
      account: createAccount(),
      signals: createSignals(),
      evidence: createEvidence(),
      warpScore: createWarpScore(),
      now: NOW,
    });

    expect(
      result.opportunity.recommendedMotion,
    ).toBe("FOUNDER_OUTBOUND");
  });

  it("identifies CI pain as the primary problem when the signal is strong", () => {
    const result = generateOpportunity({
      account: createAccount(),
      signals: createSignals(),
      evidence: createEvidence(),
      warpScore: createWarpScore(),
      now: NOW,
    });

    expect(
      result.explanation.primaryProblem.toLowerCase(),
    ).toContain("ci");
  });

  it("preserves evidence provenance", () => {
    const result = generateOpportunity({
      account: createAccount(),
      signals: createSignals(),
      evidence: createEvidence(),
      warpScore: createWarpScore(),
      now: NOW,
    });

    expect(
      result.opportunity.evidenceIds,
    ).toContain("ev-ci");

    expect(
      result.opportunity.evidenceIds,
    ).toContain("ev-buy");
  });

  it("reports missing commercial intelligence rather than fabricating it", () => {
    const account = createAccount();

    account.commercial = {};
    account.engineering.ciProvider = undefined;

    const result = generateOpportunity({
      account,
      signals: createSignals(),
      evidence: createEvidence(),
      warpScore: createWarpScore(),
      now: NOW,
    });

    expect(
      result.explanation.missingInformation,
    ).toContain("Current CI provider");

    expect(
      result.explanation.missingInformation,
    ).toContain("Current CI spend");

    expect(
      result.explanation.missingInformation,
    ).toContain("Validated contract value");

    expect(
      result.opportunity.estimatedACV,
    ).toBeGreaterThan(0);
  });

  it("returns an explainable versioned recommendation", () => {
    const result = generateOpportunity({
      account: createAccount(),
      signals: createSignals(),
      evidence: createEvidence(),
      warpScore: createWarpScore(),
      now: NOW,
    });

    expect(
      result.explanation.engineVersion,
    ).toBe(OPPORTUNITY_ENGINE_VERSION);

    expect(
      result.explanation.scoreDrivers.length,
    ).toBeGreaterThan(0);

    expect(
      result.explanation.supportingSignals.length,
    ).toBeGreaterThan(0);

    expect(
      result.explanation.reasoningSummary.length,
    ).toBeGreaterThan(20);
  });
});