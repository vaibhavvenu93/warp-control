import {
  Account,
  EvidenceRef,
  ScoreComponent,
  Signal,
  SignalCategory,
  WarpScore,
} from "@/domain/types";

export const WARP_SCORE_VERSION = "1.0.0";

type ScoringDimension =
  | "engineeringIntensity"
  | "ciPain"
  | "aiAdoption"
  | "growth"
  | "infrastructureComplexity"
  | "buyingIntent"
  | "commercialFit";

interface DimensionDefinition {
  key: ScoringDimension;
  label: string;
  weight: number;
  signalCategories: SignalCategory[];
}

interface ScoreAccountInput {
  account: Account;
  signals: Signal[];
  evidence: EvidenceRef[];
  now?: Date;
}

interface DimensionResult {
  rawValue: number;
  confidence: number;
  evidenceIds: string[];
}

const DIMENSIONS: DimensionDefinition[] = [
  {
    key: "engineeringIntensity",
    label: "Engineering intensity",
    weight: 0.2,
    signalCategories: ["ENGINEERING"],
  },
  {
    key: "ciPain",
    label: "CI pain",
    weight: 0.2,
    signalCategories: ["CI_PAIN"],
  },
  {
    key: "aiAdoption",
    label: "AI coding adoption",
    weight: 0.15,
    signalCategories: ["AI_ADOPTION"],
  },
  {
    key: "growth",
    label: "Growth momentum",
    weight: 0.1,
    signalCategories: ["GROWTH", "HIRING"],
  },
  {
    key: "infrastructureComplexity",
    label: "Infrastructure complexity",
    weight: 0.1,
    signalCategories: ["INFRASTRUCTURE", "SECURITY"],
  },
  {
    key: "buyingIntent",
    label: "Buying intent",
    weight: 0.15,
    signalCategories: ["BUYING_INTENT", "USAGE"],
  },
  {
    key: "commercialFit",
    label: "Commercial fit",
    weight: 0.1,
    signalCategories: [],
  },
];

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, decimals = 2): number {
  const multiplier = 10 ** decimals;
  return Math.round(value * multiplier) / multiplier;
}

function ageInDays(date: string, now: Date): number {
  const timestamp = new Date(date).getTime();

  if (Number.isNaN(timestamp)) {
    return 365;
  }

  return Math.max(0, (now.getTime() - timestamp) / 86_400_000);
}

function freshnessMultiplier(detectedAt: string, now: Date): number {
  const age = ageInDays(detectedAt, now);

  if (age <= 7) return 1;
  if (age <= 30) return 0.9;
  if (age <= 90) return 0.75;
  if (age <= 180) return 0.55;

  return 0.35;
}

function evidenceReliability(type: EvidenceRef["type"]): number {
  switch (type) {
    case "INTERNAL":
      return 1;
    case "CONNECTED":
      return 0.95;
    case "PUBLIC":
      return 0.85;
    case "MODELED":
      return 0.6;
    case "ASSUMED":
      return 0.35;
  }
}

function calculateEvidenceConfidence(
  evidenceIds: string[],
  evidenceMap: Map<string, EvidenceRef>,
): number {
  const evidence = evidenceIds
    .map((id) => evidenceMap.get(id))
    .filter((item): item is EvidenceRef => Boolean(item));

  if (evidence.length === 0) {
    return 25;
  }

  const weightedConfidence = evidence.map((item) => {
    const sourceConfidence = clamp(item.confidence) / 100;
    return sourceConfidence * evidenceReliability(item.type);
  });

  const average =
    weightedConfidence.reduce((sum, value) => sum + value, 0) /
    weightedConfidence.length;

  return clamp(round(average * 100));
}

function relevantSignals(
  signals: Signal[],
  categories: SignalCategory[],
  now: Date,
): Signal[] {
  return signals.filter((signal) => {
    if (!categories.includes(signal.category)) {
      return false;
    }

    if (!signal.expiresAt) {
      return true;
    }

    return new Date(signal.expiresAt).getTime() >= now.getTime();
  });
}

function scoreSignals(
  signals: Signal[],
  categories: SignalCategory[],
  evidenceMap: Map<string, EvidenceRef>,
  now: Date,
): DimensionResult {
  const relevant = relevantSignals(signals, categories, now);

  if (relevant.length === 0) {
    return {
      rawValue: 0,
      confidence: 20,
      evidenceIds: [],
    };
  }

  let weightedValue = 0;
  let totalWeight = 0;

  const evidenceIds = new Set<string>();

  for (const signal of relevant) {
    const direction =
      signal.direction === "POSITIVE"
        ? 1
        : signal.direction === "NEGATIVE"
          ? -1
          : 0;

    const signalConfidence = clamp(signal.confidence) / 100;
    const freshness = freshnessMultiplier(signal.detectedAt, now);

    const weight = signalConfidence * freshness;

    weightedValue += clamp(signal.strength) * direction * weight;
    totalWeight += weight;

    signal.evidenceIds.forEach((id) => evidenceIds.add(id));
  }

  const signedScore =
    totalWeight === 0 ? 0 : weightedValue / totalWeight;

  const normalizedScore = clamp((signedScore + 100) / 2);

  const evidenceConfidence = calculateEvidenceConfidence(
    [...evidenceIds],
    evidenceMap,
  );

  const signalConfidence =
    relevant.reduce((sum, signal) => sum + clamp(signal.confidence), 0) /
    relevant.length;

  return {
    rawValue: round(normalizedScore),
    confidence: round(
      clamp(signalConfidence * 0.6 + evidenceConfidence * 0.4),
    ),
    evidenceIds: [...evidenceIds],
  };
}

function scoreEngineeringIntensity(account: Account): DimensionResult {
  const developers = account.engineering.estimatedDevelopers ?? 0;
  const repositories = account.engineering.repositories ?? 0;
  const languages = account.engineering.languages.length;
  const frameworks = account.engineering.frameworks.length;

  const developerScore = clamp((developers / 250) * 100);
  const repositoryScore = clamp((repositories / 100) * 100);
  const stackScore = clamp(((languages + frameworks) / 12) * 100);

  const knownFields = [
    account.engineering.estimatedDevelopers !== undefined,
    account.engineering.repositories !== undefined,
    languages > 0 || frameworks > 0,
  ].filter(Boolean).length;

  return {
    rawValue: round(
      developerScore * 0.55 +
        repositoryScore * 0.3 +
        stackScore * 0.15,
    ),
    confidence: round(30 + (knownFields / 3) * 70),
    evidenceIds: account.evidenceIds,
  };
}

function scoreCommercialFit(account: Account): DimensionResult {
  const acv = account.commercial.estimatedACV;
  const expansion = account.commercial.expansionPotential;
  const spend = account.commercial.currentSpendEstimate;

  const acvScore =
    acv === undefined ? 0 : clamp((acv / 100_000) * 100);

  const expansionScore =
    expansion === undefined ? 0 : clamp(expansion);

  const spendScore =
    spend === undefined ? 0 : clamp((spend / 100_000) * 100);

  const knownFields = [acv, expansion, spend].filter(
    (value) => value !== undefined,
  ).length;

  if (knownFields === 0) {
    return {
      rawValue: 0,
      confidence: 20,
      evidenceIds: [],
    };
  }

  return {
    rawValue: round(
      acvScore * 0.45 +
        expansionScore * 0.35 +
        spendScore * 0.2,
    ),
    confidence: round(35 + (knownFields / 3) * 65),
    evidenceIds: account.evidenceIds,
  };
}

function calculateDimension(
  definition: DimensionDefinition,
  account: Account,
  signals: Signal[],
  evidenceMap: Map<string, EvidenceRef>,
  now: Date,
): DimensionResult {
  if (definition.key === "engineeringIntensity") {
    const accountScore = scoreEngineeringIntensity(account);

    const signalScore = scoreSignals(
      signals,
      ["ENGINEERING"],
      evidenceMap,
      now,
    );

    if (signalScore.evidenceIds.length === 0) {
      return accountScore;
    }

    return {
      rawValue: round(
        accountScore.rawValue * 0.6 +
          signalScore.rawValue * 0.4,
      ),
      confidence: round(
        accountScore.confidence * 0.5 +
          signalScore.confidence * 0.5,
      ),
      evidenceIds: [
        ...new Set([
          ...accountScore.evidenceIds,
          ...signalScore.evidenceIds,
        ]),
      ],
    };
  }

  if (definition.key === "commercialFit") {
    return scoreCommercialFit(account);
  }

  return scoreSignals(
    signals,
    definition.signalCategories,
    evidenceMap,
    now,
  );
}

function classify(score: number): WarpScore["classification"] {
  if (score >= 85) return "STRATEGIC";
  if (score >= 70) return "HIGH_PRIORITY";
  if (score >= 55) return "QUALIFIED";
  if (score >= 35) return "WATCH";

  return "LOW";
}

export function calculateWarpScore({
  account,
  signals,
  evidence,
  now = new Date(),
}: ScoreAccountInput): WarpScore {
  const evidenceMap = new Map(
    evidence.map((item) => [item.id, item]),
  );

  const components: ScoreComponent[] = DIMENSIONS.map((definition) => {
    const result = calculateDimension(
      definition,
      account,
      signals,
      evidenceMap,
      now,
    );

    return {
      key: definition.key,
      label: definition.label,
      rawValue: result.rawValue,
      normalizedValue: result.rawValue,
      weight: definition.weight,
      contribution: round(result.rawValue * definition.weight),
      evidenceIds: result.evidenceIds,
    };
  });

  const score = round(
    components.reduce(
      (total, component) => total + component.contribution,
      0,
    ),
  );

  const dimensionConfidences = DIMENSIONS.map((definition) =>
    calculateDimension(
      definition,
      account,
      signals,
      evidenceMap,
      now,
    ).confidence,
  );

  const confidence = round(
    dimensionConfidences.reduce(
      (total, dimensionConfidence, index) =>
        total + dimensionConfidence * DIMENSIONS[index].weight,
      0,
    ),
  );

  return {
    accountId: account.id,
    score,
    classification: classify(score),
    components,
    confidence,
    calculatedAt: now.toISOString(),
    version: WARP_SCORE_VERSION,
  };
}