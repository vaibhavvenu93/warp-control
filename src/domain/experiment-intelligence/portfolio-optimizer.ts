import {
  ExperimentCandidate,
  ExperimentEvaluation,
} from "@/domain/experiment-intelligence/types";

import {
  evaluateExperiment,
} from "@/domain/experiment-intelligence/experiment-engine";

export interface PortfolioConstraints {
  budget: number;

  maxConcurrentExperiments: number;

  maxExecutionDays?: number;

  owners?: Record<
    string,
    number
  >;
}

export interface PortfolioSelection {
  experimentId: string;

  title: string;

  owner: string;

  decision:
    ExperimentEvaluation["decision"];

  score: number;

  expectedValue: number;

  estimatedCost: number;

  learningDays: number;

  allocationReason: string;
}

export interface DeferredExperiment {
  experimentId: string;

  title: string;

  reason:
    | "BUDGET"
    | "CAPACITY"
    | "DURATION"
    | "OWNER_CAPACITY"
    | "DECISION_GATE";
}

export interface PortfolioOptimization {
  selected:
    PortfolioSelection[];

  deferred:
    DeferredExperiment[];

  totalBudget: number;

  allocatedBudget: number;

  remainingBudget: number;

  modeledExpectedValue: number;

  expectedPortfolioROI: number;

  selectedCount: number;

  methodologyVersion: string;
}

export const PORTFOLIO_OPTIMIZER_VERSION =
  "1.0.0";

function round(
  value: number,
  decimals = 2,
): number {
  const multiplier =
    10 ** decimals;

  return (
    Math.round(
      (value +
        Number.EPSILON) *
        multiplier,
    ) / multiplier
  );
}

function validateConstraints(
  constraints:
    PortfolioConstraints,
): void {
  if (
    !Number.isFinite(
      constraints.budget,
    ) ||
    constraints.budget < 0
  ) {
    throw new Error(
      "Portfolio budget must be zero or greater.",
    );
  }

  if (
    !Number.isInteger(
      constraints.maxConcurrentExperiments,
    ) ||
    constraints.maxConcurrentExperiments <
      0
  ) {
    throw new Error(
      "maxConcurrentExperiments must be a non-negative integer.",
    );
  }

  if (
    constraints.maxExecutionDays !==
      undefined &&
    (
      !Number.isFinite(
        constraints.maxExecutionDays,
      ) ||
      constraints.maxExecutionDays <=
        0
    )
  ) {
    throw new Error(
      "maxExecutionDays must be greater than zero.",
    );
  }

  if (constraints.owners) {
    for (
      const [
        owner,
        capacity,
      ] of Object.entries(
        constraints.owners,
      )
    ) {
      if (
        !Number.isInteger(
          capacity,
        ) ||
        capacity < 0
      ) {
        throw new Error(
          `Owner capacity for ${owner} must be a non-negative integer.`,
        );
      }
    }
  }
}

function allocationUtility(
  experiment:
    ExperimentCandidate,
  evaluation:
    ExperimentEvaluation,
): number {
  /*
   * Portfolio utility is intentionally
   * different from experiment score.
   *
   * It combines:
   * - decision-engine quality
   * - expected commercial value
   * - speed to learning
   * - capital efficiency
   *
   * This prevents the optimizer from
   * blindly selecting experiments by
   * score alone.
   */

  const positiveExpectedValue =
    Math.max(
      0,
      evaluation.expectedValue,
    );

  const valueScore =
    Math.min(
      100,
      (
        positiveExpectedValue /
        250_000
      ) * 100,
    );

  const speedScore =
    experiment.learningDays <= 7
      ? 100
      : experiment.learningDays >=
          60
        ? 0
        : 100 -
          (
            (
              experiment.learningDays -
              7
            ) /
            53
          ) *
            100;

  const efficiency =
    experiment.estimatedCost === 0
      ? 100
      : Math.min(
          100,
          (
            positiveExpectedValue /
            experiment.estimatedCost /
            10
          ) *
            100,
        );

  return round(
    evaluation.score * 0.4 +
      valueScore * 0.25 +
      speedScore * 0.15 +
      efficiency * 0.2,
  );
}

function reasonForSelection(
  experiment:
    ExperimentCandidate,
  evaluation:
    ExperimentEvaluation,
): string {
  const value =
    Math.round(
      evaluation.expectedValue,
    ).toLocaleString(
      "en-US",
    );

  return (
    `Selected with experiment score ` +
    `${evaluation.score}/100, ` +
    `$${value} modeled expected value, ` +
    `${experiment.learningDays}-day learning cycle ` +
    `and no failed decision gate.`
  );
}

export function optimizePortfolio(
  experiments:
    ExperimentCandidate[],
  constraints:
    PortfolioConstraints,
): PortfolioOptimization {
  validateConstraints(
    constraints,
  );

  const evaluated =
    experiments.map(
      (experiment) => {
        const evaluation =
          evaluateExperiment(
            experiment,
          );

        return {
          experiment,
          evaluation,
          utility:
            allocationUtility(
              experiment,
              evaluation,
            ),
        };
      },
    );

  const ranked =
    evaluated
      .slice()
      .sort(
        (a, b) => {
          if (
            b.utility !==
            a.utility
          ) {
            return (
              b.utility -
              a.utility
            );
          }

          return (
            b.evaluation
              .expectedValue -
            a.evaluation
              .expectedValue
          );
        },
      );

  const selected:
    PortfolioSelection[] = [];

  const deferred:
    DeferredExperiment[] = [];

  const ownerUsage:
    Record<string, number> =
      {};

  let allocatedBudget = 0;

  for (const item of ranked) {
    const {
      experiment,
      evaluation,
    } = item;

    if (
      evaluation.decision !==
      "RUN"
    ) {
      deferred.push({
        experimentId:
          experiment.id,

        title:
          experiment.title,

        reason:
          "DECISION_GATE",
      });

      continue;
    }

    if (
      constraints.maxExecutionDays !==
        undefined &&
      experiment.executionDays >
        constraints.maxExecutionDays
    ) {
      deferred.push({
        experimentId:
          experiment.id,

        title:
          experiment.title,

        reason:
          "DURATION",
      });

      continue;
    }

    if (
      selected.length >=
      constraints.maxConcurrentExperiments
    ) {
      deferred.push({
        experimentId:
          experiment.id,

        title:
          experiment.title,

        reason:
          "CAPACITY",
      });

      continue;
    }

    const ownerCapacity =
      constraints.owners?.[
        experiment.owner
      ];

    const currentOwnerUsage =
      ownerUsage[
        experiment.owner
      ] ?? 0;

    if (
      ownerCapacity !==
        undefined &&
      currentOwnerUsage >=
        ownerCapacity
    ) {
      deferred.push({
        experimentId:
          experiment.id,

        title:
          experiment.title,

        reason:
          "OWNER_CAPACITY",
      });

      continue;
    }

    if (
      allocatedBudget +
        experiment.estimatedCost >
      constraints.budget
    ) {
      deferred.push({
        experimentId:
          experiment.id,

        title:
          experiment.title,

        reason:
          "BUDGET",
      });

      continue;
    }

    selected.push({
      experimentId:
        experiment.id,

      title:
        experiment.title,

      owner:
        experiment.owner,

      decision:
        evaluation.decision,

      score:
        evaluation.score,

      expectedValue:
        evaluation.expectedValue,

      estimatedCost:
        experiment.estimatedCost,

      learningDays:
        experiment.learningDays,

      allocationReason:
        reasonForSelection(
          experiment,
          evaluation,
        ),
    });

    allocatedBudget +=
      experiment.estimatedCost;

    ownerUsage[
      experiment.owner
    ] =
      currentOwnerUsage + 1;
  }

  const modeledExpectedValue =
    round(
      selected.reduce(
        (
          total,
          experiment,
        ) =>
          total +
          experiment.expectedValue,
        0,
      ),
    );

  const expectedPortfolioROI =
    allocatedBudget === 0
      ? 0
      : round(
          modeledExpectedValue /
            allocatedBudget,
        );

  return {
    selected,

    deferred,

    totalBudget:
      constraints.budget,

    allocatedBudget:
      round(
        allocatedBudget,
      ),

    remainingBudget:
      round(
        constraints.budget -
          allocatedBudget,
      ),

    modeledExpectedValue,

    expectedPortfolioROI,

    selectedCount:
      selected.length,

    methodologyVersion:
      PORTFOLIO_OPTIMIZER_VERSION,
  };
}