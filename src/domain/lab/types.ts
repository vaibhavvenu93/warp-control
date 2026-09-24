export type BenchmarkProvider =
  | "GITHUB_ACTIONS"
  | "WARPBUILD";

export type BenchmarkState =
  | "NOT_MEASURED"
  | "MEASURED"
  | "FAILED";

export type BenchmarkStage =
  | "INSTALL"
  | "TYPECHECK"
  | "TEST"
  | "BUILD";

export interface BenchmarkStageMeasurement {
  stage: BenchmarkStage;
  durationMs: number | null;
}

export interface BenchmarkRun {
  id: string;
  provider: BenchmarkProvider;
  state: BenchmarkState;

  repository: string;
  branch: string;
  commitSha?: string;
  runId?: string;

  runner: string;

  capturedAt?: string;

  stages: BenchmarkStageMeasurement[];

  totalObservedMs: number | null;

  evidenceUrl?: string;

  notes: string[];
}

export interface StageComparison {
  stage: BenchmarkStage;

  baselineMs: number | null;
  candidateMs: number | null;

  deltaMs: number | null;
  improvementPercent: number | null;
  speedupMultiple: number | null;
}

export type ComparisonState =
  | "PENDING"
  | "COMPARABLE"
  | "NOT_COMPARABLE";

export interface BenchmarkComparison {
  state: ComparisonState;

  baselineProvider: BenchmarkProvider;
  candidateProvider: BenchmarkProvider;

  stages: StageComparison[];

  baselineTotalMs: number | null;
  candidateTotalMs: number | null;

  totalDeltaMs: number | null;
  totalImprovementPercent: number | null;
  totalSpeedupMultiple: number | null;

  limitations: string[];
}

export interface DeveloperFeedbackModel {
  developers: number;
  ciRunsPerDeveloperPerDay: number;
  workingDaysPerMonth: number;

  baselineMinutesPerRun: number | null;
  candidateMinutesPerRun: number | null;

  minutesSavedPerRun: number | null;
  estimatedTeamHoursSavedPerMonth: number | null;
}

export interface LabExperiment {
  id: string;
  title: string;
  hypothesis: string;

  repository: string;
  branch: string;

  baseline: BenchmarkRun;
  candidate: BenchmarkRun;

  comparison: BenchmarkComparison;

  developerFeedbackModel: DeveloperFeedbackModel;

  methodology: string[];
  limitations: string[];

  conclusion: string;
}