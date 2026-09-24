import type {
  BenchmarkRun,
} from "@/domain/lab/types";

const emptyStages = () => [
  {
    stage: "INSTALL" as const,
    durationMs: null,
  },
  {
    stage: "TYPECHECK" as const,
    durationMs: null,
  },
  {
    stage: "TEST" as const,
    durationMs: null,
  },
  {
    stage: "BUILD" as const,
    durationMs: null,
  },
];

export const LAB_BASELINE: BenchmarkRun = {
  id: "warp-control-baseline",
  provider: "GITHUB_ACTIONS",
  state: "NOT_MEASURED",

  repository:
    "vaibhavvenu93/warp-control",

  branch:
    "cluster-2-revenue-engine",

  runner: "ubuntu-latest",

  stages: emptyStages(),

  totalObservedMs: null,

  notes: [
    "Baseline workflow has been defined but no benchmark result is embedded in the product yet.",
    "A measured GitHub Actions run must be captured before baseline performance is displayed.",
  ],
};

export const LAB_WARPBUILD_RUN: BenchmarkRun = {
  id: "warp-control-warpbuild",
  provider: "WARPBUILD",
  state: "NOT_MEASURED",

  repository:
    "vaibhavvenu93/warp-control",

  branch:
    "cluster-2-revenue-engine",

  runner: "WarpBuild runner — pending configuration",

  stages: emptyStages(),

  totalObservedMs: null,

  notes: [
    "WarpBuild benchmark has not been executed yet.",
    "No speedup or performance claim should be shown until a comparable run exists.",
  ],
};