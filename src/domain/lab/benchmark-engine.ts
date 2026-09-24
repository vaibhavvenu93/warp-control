import type {
  BenchmarkComparison,
  BenchmarkRun,
  BenchmarkStage,
  DeveloperFeedbackModel,
} from "./types";

const STAGES: BenchmarkStage[] = [
  "INSTALL",
  "TYPECHECK",
  "TEST",
  "BUILD",
];

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function stageDuration(
  run: BenchmarkRun,
  stage: BenchmarkStage,
) {
  return (
    run.stages.find(
      (measurement) =>
        measurement.stage === stage,
    )?.durationMs ?? null
  );
}

export function compareBenchmarks(
  baseline: BenchmarkRun,
  candidate: BenchmarkRun,
): BenchmarkComparison {
  const bothMeasured =
    baseline.state === "MEASURED" &&
    candidate.state === "MEASURED";

  const sameCommit =
    Boolean(baseline.commitSha) &&
    baseline.commitSha === candidate.commitSha;

  const comparable =
    bothMeasured && sameCommit;

  const limitations: string[] = [];

  if (!bothMeasured) {
    limitations.push(
      "Both benchmark providers must have measured runs before performance can be compared.",
    );
  }

  if (
    bothMeasured &&
    !sameCommit
  ) {
    limitations.push(
      "Runs were not executed against the same commit, so a performance conclusion would be unsafe.",
    );
  }

  const stages = STAGES.map((stage) => {
    const baselineMs = stageDuration(
      baseline,
      stage,
    );

    const candidateMs = stageDuration(
      candidate,
      stage,
    );

    if (
      !comparable ||
      baselineMs === null ||
      candidateMs === null ||
      baselineMs <= 0 ||
      candidateMs <= 0
    ) {
      return {
        stage,
        baselineMs,
        candidateMs,
        deltaMs: null,
        improvementPercent: null,
        speedupMultiple: null,
      };
    }

    const deltaMs =
      baselineMs - candidateMs;

    return {
      stage,
      baselineMs,
      candidateMs,
      deltaMs,
      improvementPercent: round(
        (deltaMs / baselineMs) * 100,
      ),
      speedupMultiple: round(
        baselineMs / candidateMs,
      ),
    };
  });

  const baselineTotalMs =
    baseline.totalObservedMs;

  const candidateTotalMs =
    candidate.totalObservedMs;

  if (
    !comparable ||
    baselineTotalMs === null ||
    candidateTotalMs === null ||
    baselineTotalMs <= 0 ||
    candidateTotalMs <= 0
  ) {
    return {
      state:
        bothMeasured
          ? "NOT_COMPARABLE"
          : "PENDING",
      baselineProvider: baseline.provider,
      candidateProvider: candidate.provider,
      stages,
      baselineTotalMs,
      candidateTotalMs,
      totalDeltaMs: null,
      totalImprovementPercent: null,
      totalSpeedupMultiple: null,
      limitations,
    };
  }

  const totalDeltaMs =
    baselineTotalMs - candidateTotalMs;

  return {
    state: "COMPARABLE",
    baselineProvider: baseline.provider,
    candidateProvider: candidate.provider,
    stages,
    baselineTotalMs,
    candidateTotalMs,
    totalDeltaMs,
    totalImprovementPercent: round(
      (totalDeltaMs / baselineTotalMs) *
        100,
    ),
    totalSpeedupMultiple: round(
      baselineTotalMs /
        candidateTotalMs,
    ),
    limitations,
  };
}

export function modelDeveloperFeedback(
  baseline: BenchmarkRun,
  candidate: BenchmarkRun,
  assumptions: {
    developers: number;
    ciRunsPerDeveloperPerDay: number;
    workingDaysPerMonth: number;
  },
): DeveloperFeedbackModel {
  const baselineMinutesPerRun =
    baseline.totalObservedMs === null
      ? null
      : baseline.totalObservedMs / 60000;

  const candidateMinutesPerRun =
    candidate.totalObservedMs === null
      ? null
      : candidate.totalObservedMs / 60000;

  if (
    baseline.state !== "MEASURED" ||
    candidate.state !== "MEASURED" ||
    baselineMinutesPerRun === null ||
    candidateMinutesPerRun === null
  ) {
    return {
      ...assumptions,
      baselineMinutesPerRun,
      candidateMinutesPerRun,
      minutesSavedPerRun: null,
      estimatedTeamHoursSavedPerMonth:
        null,
    };
  }

  const minutesSavedPerRun =
    baselineMinutesPerRun -
    candidateMinutesPerRun;

  const monthlyRuns =
    assumptions.developers *
    assumptions.ciRunsPerDeveloperPerDay *
    assumptions.workingDaysPerMonth;

  return {
    ...assumptions,
    baselineMinutesPerRun: round(
      baselineMinutesPerRun,
    ),
    candidateMinutesPerRun: round(
      candidateMinutesPerRun,
    ),
    minutesSavedPerRun: round(
      minutesSavedPerRun,
    ),
    estimatedTeamHoursSavedPerMonth:
      round(
        (minutesSavedPerRun *
          monthlyRuns) /
          60,
      ),
  };
}