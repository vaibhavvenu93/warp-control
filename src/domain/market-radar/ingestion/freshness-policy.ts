import type {
  ObservationFreshness,
} from "./observation-types";

const HOUR_MS =
  60 * 60 * 1000;

function clamp(
  value: number,
  minimum = 0,
  maximum = 100,
): number {
  return Math.min(
    maximum,
    Math.max(
      minimum,
      value,
    ),
  );
}

function round(
  value: number,
): number {
  return (
    Math.round(
      value * 100,
    ) / 100
  );
}

export function calculateFreshness(
  observedAt: string,
  now: string,
): ObservationFreshness {
  const observed =
    new Date(
      observedAt,
    ).getTime();

  const current =
    new Date(
      now,
    ).getTime();

  if (
    !Number.isFinite(
      observed,
    ) ||
    !Number.isFinite(
      current,
    )
  ) {
    throw new Error(
      "Freshness requires valid ISO timestamps.",
    );
  }

  const ageHours =
    Math.max(
      0,
      (
        current -
        observed
      ) / HOUR_MS,
    );

  let score: number;
  let band:
    ObservationFreshness["band"];

  if (
    ageHours <= 24
  ) {
    score =
      100 -
      ageHours * 0.25;

    band = "FRESH";
  } else if (
    ageHours <= 168
  ) {
    score =
      94 -
      (
        ageHours - 24
      ) * 0.25;

    band = "RECENT";
  } else if (
    ageHours <= 720
  ) {
    score =
      58 -
      (
        ageHours - 168
      ) * 0.07;

    band = "AGING";
  } else {
    score =
      20 -
      (
        ageHours - 720
      ) * 0.01;

    band = "STALE";
  }

  return {
    ageHours:
      round(ageHours),

    score:
      round(
        clamp(score),
      ),

    band,
  };
}

export function isStaleObservation(
  freshness:
    ObservationFreshness,
): boolean {
  return (
    freshness.band ===
    "STALE"
  );
}