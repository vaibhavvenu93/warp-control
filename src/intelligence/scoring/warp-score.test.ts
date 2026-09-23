import { describe, expect, it } from "vitest";

import {
  Account,
  EvidenceRef,
  Signal,
} from "@/domain/types";

import {
  calculateWarpScore,
  WARP_SCORE_VERSION,
} from "./warp-score";

const NOW = new Date("2026-09-23T10:00:00.000Z");

function createAccount(
  overrides: Partial<Account> = {},
): Account {
  return {
    id: "acc-test",
    name: "Test Engineering Co",
    domain: "example.com",
    stage: "DISCOVERED",

    profile: {
      industry: "Developer Tools",
      employeeCount: 500,
      developerCount: 200,
      headquarters: "San Francisco",
      fundingStage: "Series B",
    },

    engineering: {
      repositories: 80,
      estimatedDevelopers: 200,
      ciProvider: "GitHub Actions",
      cloudProvider: "AWS",
      languages: ["TypeScript", "Python", "Go"],
      frameworks: ["Next.js", "FastAPI"],
      aiCodingSignals: ["AI coding assistant adoption"],
    },

    commercial: {
      estimatedACV: 80_000,
      expansionPotential: 85,
      currentSpendEstimate: 60_000,
    },

    signalIds: [],
    evidenceIds: ["ev-account"],

    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-23T09:00:00.000Z",

    ...overrides,
  };
}

function createEvidence(
  overrides: Partial<EvidenceRef> = {},
): EvidenceRef {
  return {
    id: "ev-1",
    type: "PUBLIC",
    source: "Public engineering source",
    capturedAt: "2026-09-22T10:00:00.000Z",
    claim: "Company demonstrates engineering activity.",
    confidence: 90,
    ...overrides,
  };
}

function createSignal(
  overrides: Partial<Signal> = {},
): Signal {
  return {
    id: "sig-1",
    accountId: "acc-test",
    category: "CI_PAIN",
    direction: "POSITIVE",
    title: "CI bottleneck detected",
    description:
      "Engineering team shows evidence of CI feedback-loop pressure.",
    strength: 90,
    confidence: 90,
    evidenceIds: ["ev-1"],
    detectedAt: "2026-09-22T10:00:00.000Z",
    ...overrides,
  };
}

describe("WarpScore", () => {
  it("returns an explainable versioned score", () => {
    const result = calculateWarpScore({
      account: createAccount(),
      signals: [createSignal()],
      evidence: [createEvidence()],
      now: NOW,
    });

    expect(result.accountId).toBe("acc-test");
    expect(result.version).toBe(WARP_SCORE_VERSION);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(100);

    expect(result.components).toHaveLength(7);

    for (const component of result.components) {
      expect(component.weight).toBeGreaterThan(0);
      expect(component.rawValue).toBeGreaterThanOrEqual(0);
      expect(component.rawValue).toBeLessThanOrEqual(100);
      expect(component.contribution).toBeGreaterThanOrEqual(0);
    }
  });

  it("scores a strong WarpBuild-like account above a weak account", () => {
    const evidence = [
      createEvidence({
        id: "ev-ci",
        type: "CONNECTED",
      }),
      createEvidence({
        id: "ev-ai",
        type: "PUBLIC",
      }),
      createEvidence({
        id: "ev-growth",
        type: "PUBLIC",
      }),
      createEvidence({
        id: "ev-buy",
        type: "INTERNAL",
      }),
      createEvidence({
        id: "ev-infra",
        type: "CONNECTED",
      }),
    ];

    const strongSignals: Signal[] = [
      createSignal({
        id: "sig-ci",
        category: "CI_PAIN",
        strength: 95,
        evidenceIds: ["ev-ci"],
      }),

      createSignal({
        id: "sig-ai",
        category: "AI_ADOPTION",
        strength: 90,
        evidenceIds: ["ev-ai"],
      }),

      createSignal({
        id: "sig-growth",
        category: "GROWTH",
        strength: 85,
        evidenceIds: ["ev-growth"],
      }),

      createSignal({
        id: "sig-infra",
        category: "INFRASTRUCTURE",
        strength: 88,
        evidenceIds: ["ev-infra"],
      }),

      createSignal({
        id: "sig-buy",
        category: "BUYING_INTENT",
        strength: 95,
        evidenceIds: ["ev-buy"],
      }),
    ];

    const strong = calculateWarpScore({
      account: createAccount(),
      signals: strongSignals,
      evidence,
      now: NOW,
    });

    const weak = calculateWarpScore({
      account: createAccount({
        engineering: {
          repositories: 2,
          estimatedDevelopers: 5,
          languages: ["JavaScript"],
          frameworks: [],
          aiCodingSignals: [],
        },
        commercial: {},
        evidenceIds: [],
      }),
      signals: [],
      evidence: [],
      now: NOW,
    });

    expect(strong.score).toBeGreaterThan(weak.score);
    expect(strong.confidence).toBeGreaterThan(weak.confidence);
  });

  it("allows negative signals to reduce a dimension", () => {
    const positive = calculateWarpScore({
      account: createAccount(),
      signals: [
        createSignal({
          direction: "POSITIVE",
          strength: 90,
        }),
      ],
      evidence: [createEvidence()],
      now: NOW,
    });

    const negative = calculateWarpScore({
      account: createAccount(),
      signals: [
        createSignal({
          direction: "NEGATIVE",
          strength: 90,
        }),
      ],
      evidence: [createEvidence()],
      now: NOW,
    });

    const positiveCI = positive.components.find(
      (component) => component.key === "ciPain",
    );

    const negativeCI = negative.components.find(
      (component) => component.key === "ciPain",
    );

    expect(positiveCI).toBeDefined();
    expect(negativeCI).toBeDefined();

    expect(positiveCI!.rawValue).toBeGreaterThan(
      negativeCI!.rawValue,
    );
  });

  it("ignores expired signals", () => {
    const result = calculateWarpScore({
      account: createAccount(),
      signals: [
        createSignal({
          expiresAt: "2026-09-20T10:00:00.000Z",
        }),
      ],
      evidence: [createEvidence()],
      now: NOW,
    });

    const ciPain = result.components.find(
      (component) => component.key === "ciPain",
    );

    expect(ciPain).toBeDefined();
    expect(ciPain!.rawValue).toBe(0);
    expect(ciPain!.evidenceIds).toHaveLength(0);
  });

  it("reduces confidence when evidence is only assumed", () => {
    const connected = calculateWarpScore({
      account: createAccount(),
      signals: [
        createSignal({
          evidenceIds: ["ev-connected"],
        }),
      ],
      evidence: [
        createEvidence({
          id: "ev-connected",
          type: "CONNECTED",
          confidence: 95,
        }),
      ],
      now: NOW,
    });

    const assumed = calculateWarpScore({
      account: createAccount(),
      signals: [
        createSignal({
          evidenceIds: ["ev-assumed"],
        }),
      ],
      evidence: [
        createEvidence({
          id: "ev-assumed",
          type: "ASSUMED",
          confidence: 95,
        }),
      ],
      now: NOW,
    });

    expect(connected.confidence).toBeGreaterThan(
      assumed.confidence,
    );
  });

  it("handles missing account intelligence without producing NaN", () => {
    const sparseAccount = createAccount({
      profile: {},
      engineering: {
        languages: [],
        frameworks: [],
        aiCodingSignals: [],
      },
      commercial: {},
      evidenceIds: [],
    });

    const result = calculateWarpScore({
      account: sparseAccount,
      signals: [],
      evidence: [],
      now: NOW,
    });

    expect(Number.isNaN(result.score)).toBe(false);
    expect(Number.isNaN(result.confidence)).toBe(false);

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("is deterministic for identical inputs and time", () => {
    const input = {
      account: createAccount(),
      signals: [createSignal()],
      evidence: [createEvidence()],
      now: NOW,
    };

    const first = calculateWarpScore(input);
    const second = calculateWarpScore(input);

    expect(first).toEqual(second);
  });

  it("preserves evidence provenance inside score components", () => {
    const result = calculateWarpScore({
      account: createAccount(),
      signals: [
        createSignal({
          evidenceIds: ["ev-provenance"],
        }),
      ],
      evidence: [
        createEvidence({
          id: "ev-provenance",
          type: "PUBLIC",
        }),
      ],
      now: NOW,
    });

    const ciPain = result.components.find(
      (component) => component.key === "ciPain",
    );

    expect(ciPain).toBeDefined();

    expect(ciPain!.evidenceIds).toContain(
      "ev-provenance",
    );
  });
});