import type {
  MarketEvidence,
  MarketSignal,
  MarketSignalFactors,
  MarketSignalScore,
} from "./types";

const WEIGHTS: Record<
  keyof MarketSignalFactors,
  number
> = {
  strategicFit: 0.2,
  commercialImpact: 0.18,
  productImpact: 0.14,
  timeSensitivity: 0.12,
  evidenceStrength: 0.14,
  competitiveIntensity: 0.1,
  actionability: 0.12,
};

function clamp(
  value: number,
  minimum = 0,
  maximum = 100,
): number {
  return Math.min(
    maximum,
    Math.max(minimum, value),
  );
}

function round(
  value: number,
  precision = 2,
): number {
  const multiplier =
    10 ** precision;

  return (
    Math.round(
      value * multiplier,
    ) / multiplier
  );
}

function evidenceConfidence(
  evidence: MarketEvidence[],
): number {
  if (evidence.length === 0) {
    return 0;
  }

  const reliability =
    evidence.reduce(
      (total, item) =>
        total +
        clamp(
          item.reliability,
          0,
          1,
        ),
      0,
    ) / evidence.length;

  const independentSourceCount =
    new Set(
      evidence.map(
        (item) =>
          item.sourceName,
      ),
    ).size;

  const diversityBonus =
    Math.min(
      0.12,
      Math.max(
        0,
        independentSourceCount - 1,
      ) * 0.04,
    );

  const syntheticPenalty =
    evidence.every(
      (item) =>
        item.isSynthetic,
    )
      ? 0.18
      : 0;

  return clamp(
    (
      reliability +
      diversityBonus -
      syntheticPenalty
    ) * 100,
  );
}

function classify(
  score: number,
): MarketSignalScore["classification"] {
  if (score >= 82) {
    return "CRITICAL";
  }

  if (score >= 68) {
    return "HIGH";
  }

  if (score >= 48) {
    return "MEDIUM";
  }

  return "LOW";
}

export function scoreMarketSignal(
  signal: MarketSignal,
): MarketSignalScore {
  const factors = {
    ...signal.factors,
    evidenceStrength:
      evidenceConfidence(
        signal.evidence,
      ),
  };

  const score = Object.entries(
    WEIGHTS,
  ).reduce(
    (
      total,
      [factor, weight],
    ) =>
      total +
      factors[
        factor as keyof MarketSignalFactors
      ] *
        weight,
    0,
  );

  const confidence =
    evidenceConfidence(
      signal.evidence,
    );

  return {
    score: round(score),
    confidence:
      round(confidence),
    classification:
      classify(score),
    factors,
  };
}

export function rankMarketSignals(
  signals: MarketSignal[],
): MarketSignal[] {
  return signals
    .map((signal) => ({
      ...signal,
      score:
        scoreMarketSignal(
          signal,
        ),
    }))
    .sort(
      (left, right) =>
        (right.score?.score ??
          0) -
        (left.score?.score ??
          0),
    );
}