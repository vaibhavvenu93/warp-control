import type {
  MarketRadarImpactArea,
  MarketSignal,
  MarketSignalDirection,
  MarketTrend,
} from "./types";

function round(
  value: number,
): number {
  return (
    Math.round(value * 100) /
    100
  );
}

function dominantDirection(
  signals: MarketSignal[],
): MarketSignalDirection {
  const counts =
    signals.reduce<
      Record<
        MarketSignalDirection,
        number
      >
    >(
      (result, signal) => {
        result[
          signal.direction
        ] += 1;

        return result;
      },
      {
        OPPORTUNITY: 0,
        THREAT: 0,
        WATCH: 0,
        NEUTRAL: 0,
      },
    );

  return (
    Object.entries(counts)
      .sort(
        (left, right) =>
          right[1] -
          left[1],
      )[0][0] as
      MarketSignalDirection
  );
}

function uniqueImpactAreas(
  signals: MarketSignal[],
): MarketRadarImpactArea[] {
  return [
    ...new Set(
      signals.flatMap(
        (signal) =>
          signal.impactAreas,
      ),
    ),
  ];
}

export function buildTrend(
  id: string,
  title: string,
  thesis: string,
  signals: MarketSignal[],
  implication: string,
  recommendedAction: string,
): MarketTrend {
  const scored =
    signals.filter(
      (signal) =>
        signal.score,
    );

  const momentum =
    scored.length === 0
      ? 0
      : scored.reduce(
          (total, signal) =>
            total +
            (signal.score
              ?.score ?? 0),
          0,
        ) / scored.length;

  const confidence =
    scored.length === 0
      ? 0
      : scored.reduce(
          (total, signal) =>
            total +
            (signal.score
              ?.confidence ??
              0),
          0,
        ) / scored.length;

  return {
    id,
    title,
    thesis,
    signalIds:
      signals.map(
        (signal) =>
          signal.id,
      ),
    direction:
      dominantDirection(
        signals,
      ),
    momentum:
      round(momentum),
    confidence:
      round(confidence),
    impactAreas:
      uniqueImpactAreas(
        signals,
      ),
    implication,
    recommendedAction,
  };
}