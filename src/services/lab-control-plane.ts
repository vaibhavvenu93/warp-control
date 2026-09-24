import {
  compareBenchmarks,
  modelDeveloperFeedback,
} from "@/domain/lab/benchmark-engine";

import type {
  LabExperiment,
} from "@/domain/lab/types";

import {
  LAB_BASELINE,
  LAB_WARPBUILD_RUN,
} from "@/data/demo/lab/lab-scenario";

export function buildLabExperiment(): LabExperiment {
  const baseline =
    structuredClone(LAB_BASELINE);

  const candidate =
    structuredClone(LAB_WARPBUILD_RUN);

  const comparison =
    compareBenchmarks(
      baseline,
      candidate,
    );

  const developerFeedbackModel =
    modelDeveloperFeedback(
      baseline,
      candidate,
      {
        developers: 20,
        ciRunsPerDeveloperPerDay: 5,
        workingDaysPerMonth: 20,
      },
    );

  return {
    id: "warp-control-ci-experiment",

    title:
      "WARP / CONTROL CI Infrastructure Experiment",

    hypothesis:
      "Running the same WARP / CONTROL CI workload on WarpBuild may reduce developer feedback time relative to a GitHub-hosted baseline. No performance conclusion is permitted until comparable measured runs exist.",

    repository:
      "vaibhavvenu93/warp-control",

    branch:
      "cluster-2-revenue-engine",

    baseline,
    candidate,
    comparison,
    developerFeedbackModel,

    methodology: [
      "Run the same repository and commit on both infrastructure providers.",
      "Use the same Node.js major version and dependency lockfile.",
      "Execute npm ci, TypeScript validation, the full Vitest suite and the Next.js production build.",
      "Capture stage-level and total observed wall-clock duration.",
      "Repeat runs before drawing a durable performance conclusion.",
      "Separate measured CI performance from modeled developer-economics assumptions.",
    ],

    limitations: [
      "GitHub-hosted runners can vary between executions.",
      "Cold-cache and warm-cache behavior must not be mixed without being labeled.",
      "One run is evidence of one run, not a general performance benchmark.",
      "Network and package-registry variability can materially affect dependency installation.",
      "Developer-time savings are modeled estimates and are not equivalent to realized payroll savings.",
    ],

    conclusion:
      comparison.state === "COMPARABLE"
        ? "Comparable evidence exists. Review measured deltas and experiment limitations before drawing a conclusion."
        : "Experiment pending. WARP / CONTROL refuses to claim a WarpBuild performance advantage before comparable measured evidence exists.",
  };
}