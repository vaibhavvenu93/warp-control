import {
  Account,
  EvidenceRef,
  GTMMotion,
  Opportunity,
  Signal,
  WarpScore,
} from "@/domain/types";

export const OPPORTUNITY_ENGINE_VERSION =
  "1.0.0";

export interface OpportunityEngineInput {
  account: Account;
  signals: Signal[];
  evidence: EvidenceRef[];
  warpScore: WarpScore;
  now?: Date;
}

export interface OpportunityRecommendation {
  opportunity: Opportunity;

  explanation: {
    primaryProblem: string;
    recommendedMotion: GTMMotion;

    scoreDrivers: string[];

    supportingSignals: string[];

    missingInformation: string[];

    reasoningSummary: string;

    engineVersion: string;
  };
}

function clamp(
  value: number,
  min = 0,
  max = 100,
): number {
  return Math.min(
    max,
    Math.max(min, value),
  );
}

function round(
  value: number,
  decimals = 2,
): number {
  const multiplier = 10 ** decimals;

  return (
    Math.round(value * multiplier) /
    multiplier
  );
}

function strongestComponent(
  warpScore: WarpScore,
): WarpScore["components"][number] | null {
  if (
    warpScore.components.length === 0
  ) {
    return null;
  }

  return [...warpScore.components].sort(
    (a, b) =>
      b.contribution -
      a.contribution,
  )[0];
}

function findSignalStrength(
  signals: Signal[],
  categories: Signal["category"][],
): number {
  const relevant = signals.filter(
    (signal) =>
      categories.includes(
        signal.category,
      ) &&
      signal.direction === "POSITIVE",
  );

  if (relevant.length === 0) {
    return 0;
  }

  return Math.max(
    ...relevant.map(
      (signal) => signal.strength,
    ),
  );
}

function determineProblem(
  signals: Signal[],
): string {
  const ciPain = findSignalStrength(
    signals,
    ["CI_PAIN"],
  );

  const infrastructure =
    findSignalStrength(signals, [
      "INFRASTRUCTURE",
      "SECURITY",
    ]);

  const aiAdoption =
    findSignalStrength(signals, [
      "AI_ADOPTION",
    ]);

  const usage =
    findSignalStrength(signals, [
      "USAGE",
    ]);

  if (ciPain >= 70) {
    return "Engineering velocity may be constrained by CI feedback-loop latency.";
  }

  if (
    aiAdoption >= 70 &&
    infrastructure >= 60
  ) {
    return "AI-assisted development may be increasing code-generation velocity faster than validation infrastructure can absorb it.";
  }

  if (usage >= 70) {
    return "Usage intensity may justify a product-led sales or expansion intervention.";
  }

  if (infrastructure >= 70) {
    return "Infrastructure complexity may create an economic case for faster and more scalable CI execution.";
  }

  return "The account shows enough engineering and commercial fit to justify deeper CI discovery.";
}

function determineMotion(
  account: Account,
  signals: Signal[],
  warpScore: WarpScore,
): GTMMotion {
  const buyingIntent =
    findSignalStrength(signals, [
      "BUYING_INTENT",
    ]);

  const usage =
    findSignalStrength(signals, [
      "USAGE",
    ]);

  const security =
    findSignalStrength(signals, [
      "SECURITY",
    ]);

  if (
    account.stage === "CUSTOMER" ||
    account.stage === "EXPANSION"
  ) {
    return "EXPANSION";
  }

  if (usage >= 75) {
    return "PLG_INTERVENTION";
  }

  if (
    warpScore.score >= 85 &&
    (security >= 60 ||
      account.engineering
        .estimatedDevelopers! >= 150)
  ) {
    return "ENTERPRISE_SALES";
  }

  if (
    warpScore.score >= 70 &&
    buyingIntent >= 60
  ) {
    return "FOUNDER_OUTBOUND";
  }

  if (warpScore.score >= 55) {
    return "TECHNICAL_OUTBOUND";
  }

  return "NURTURE";
}

function estimateACV(
  account: Account,
  warpScore: WarpScore,
): number {
  if (
    account.commercial.estimatedACV !==
    undefined
  ) {
    return Math.max(
      0,
      account.commercial.estimatedACV,
    );
  }

  const developers =
    account.engineering
      .estimatedDevelopers ?? 0;

  const developerDrivenEstimate =
    developers * 400;

  const scoreMultiplier =
    0.5 + warpScore.score / 100;

  return round(
    Math.max(
      5_000,
      Math.min(
        250_000,
        developerDrivenEstimate *
          scoreMultiplier,
      ),
    ),
  );
}

function estimateProbability(
  warpScore: WarpScore,
  signals: Signal[],
): number {
  const buyingIntent =
    findSignalStrength(signals, [
      "BUYING_INTENT",
      "USAGE",
    ]);

  const scoreContribution =
    warpScore.score * 0.55;

  const confidenceContribution =
    warpScore.confidence * 0.2;

  const intentContribution =
    buyingIntent * 0.25;

  return round(
    clamp(
      scoreContribution +
        confidenceContribution +
        intentContribution,
      5,
      90,
    ),
  );
}

function collectEvidenceIds(
  account: Account,
  signals: Signal[],
  warpScore: WarpScore,
): string[] {
  const ids = new Set<string>(
    account.evidenceIds,
  );

  for (const signal of signals) {
    signal.evidenceIds.forEach((id) =>
      ids.add(id),
    );
  }

  for (
    const component of
    warpScore.components
  ) {
    component.evidenceIds.forEach(
      (id) => ids.add(id),
    );
  }

  return [...ids];
}

function identifyMissingInformation(
  account: Account,
): string[] {
  const missing: string[] = [];

  if (
    account.engineering
      .estimatedDevelopers === undefined
  ) {
    missing.push(
      "Verified developer count",
    );
  }

  if (
    account.engineering.ciProvider ===
    undefined
  ) {
    missing.push(
      "Current CI provider",
    );
  }

  if (
    account.commercial
      .currentSpendEstimate === undefined
  ) {
    missing.push(
      "Current CI spend",
    );
  }

  if (
    account.commercial.estimatedACV ===
    undefined
  ) {
    missing.push(
      "Validated contract value",
    );
  }

  return missing;
}

export function generateOpportunity({
  account,
  signals,
  evidence,
  warpScore,
  now = new Date(),
}: OpportunityEngineInput): OpportunityRecommendation {
  const primaryProblem =
    determineProblem(signals);

  const recommendedMotion =
    determineMotion(
      account,
      signals,
      warpScore,
    );

  const estimatedACV =
    estimateACV(
      account,
      warpScore,
    );

  const probability =
    estimateProbability(
      warpScore,
      signals,
    );

  const expectedValue = round(
    estimatedACV *
      (probability / 100),
  );

  const evidenceIds =
    collectEvidenceIds(
      account,
      signals,
      warpScore,
    );

  const availableEvidence =
    evidence.filter((item) =>
      evidenceIds.includes(item.id),
    );

  const evidenceConfidence =
    availableEvidence.length === 0
      ? 25
      : availableEvidence.reduce(
          (sum, item) =>
            sum + item.confidence,
          0,
        ) /
        availableEvidence.length;

  const confidence = round(
    clamp(
      warpScore.confidence * 0.7 +
        evidenceConfidence * 0.3,
    ),
  );

  const strongest =
    strongestComponent(warpScore);

  const scoreDrivers =
    [...warpScore.components]
      .sort(
        (a, b) =>
          b.contribution -
          a.contribution,
      )
      .slice(0, 3)
      .map(
        (component) =>
          `${component.label}: ${component.rawValue}`,
      );

  const supportingSignals =
    [...signals]
      .filter(
        (signal) =>
          signal.direction ===
          "POSITIVE",
      )
      .sort(
        (a, b) =>
          b.strength - a.strength,
      )
      .slice(0, 5)
      .map(
        (signal) => signal.title,
      );

  const missingInformation =
    identifyMissingInformation(
      account,
    );

  const opportunity: Opportunity = {
    id: `opp-${account.id}-${now.getTime()}`,

    accountId: account.id,

    hypothesis:
      `${account.name} may have a commercially meaningful WarpBuild opportunity because ${primaryProblem.toLowerCase()}`,

    problem: primaryProblem,

    recommendedMotion,

    estimatedACV,

    probability,

    expectedValue,

    score: warpScore.score,

    confidence,

    evidenceIds,

    createdAt: now.toISOString(),
  };

  return {
    opportunity,

    explanation: {
      primaryProblem,

      recommendedMotion,

      scoreDrivers,

      supportingSignals,

      missingInformation,

      reasoningSummary:
        strongest
          ? `The recommendation is primarily driven by ${strongest.label.toLowerCase()}, supported by the account's current WarpScore and available evidence.`
          : "The recommendation is based on the available account, signal and commercial evidence.",

      engineVersion:
        OPPORTUNITY_ENGINE_VERSION,
    },
  };
}