import {
  AgentDefinition,
} from "@/agents/contracts/agent";

import {
  ExperimentCandidate,
  ExperimentEvaluation,
} from "@/domain/experiment-intelligence/types";

import {
  PortfolioOptimization,
} from "@/domain/experiment-intelligence/portfolio-optimizer";

export interface ExperimentAnalystInput
  extends Record<string, unknown> {
  experiments: ExperimentCandidate[];
  evaluations: ExperimentEvaluation[];
  portfolio: PortfolioOptimization;
}

export interface ExperimentAnalystOutput
  extends Record<string, unknown> {
  portfolioRecommendation: string;
  selectedExperimentIds: string[];
  selectedCount: number;
  allocatedBudget: number;
  remainingBudget: number;
  modeledExpectedValue: number;
  expectedPortfolioROI: number;
  priorityExperimentId: string | null;
  evidenceRequests: string[];
  blockedExperiments: string[];
  killedExperiments: string[];
  deferredRunnableExperiments: string[];
  executiveDecision: string;
  nextAction: string;
}

function money(
  value: number,
): string {
  return `$${Math.round(
    value,
  ).toLocaleString(
    "en-US",
  )}`;
}

export const experimentAnalystAgent:
  AgentDefinition<
    ExperimentAnalystInput,
    ExperimentAnalystOutput
  > = {
    name:
      "EXPERIMENT_ANALYST",

    version:
      "1.0.0",

    description:
      "Analyzes experiment portfolios, allocation constraints, evidence gaps and executive decision requirements.",

    async execute({
      input,
    }) {
      const {
        experiments,
        evaluations,
        portfolio,
      } = input;

      const experimentById =
        new Map(
          experiments.map(
            (experiment) => [
              experiment.id,
              experiment,
            ],
          ),
        );

      const evaluationById =
        new Map(
          evaluations.map(
            (evaluation) => [
              evaluation.experimentId,
              evaluation,
            ],
          ),
        );

      const selectedExperimentIds =
        portfolio.selected.map(
          (item) =>
            item.experimentId,
        );

      const priority =
        portfolio.selected[0] ??
        null;

      const evidenceRequests =
        evaluations
          .filter(
            (evaluation) =>
              evaluation.decision ===
              "NEEDS_EVIDENCE",
          )
          .map(
            (evaluation) => {
              const experiment =
                experimentById.get(
                  evaluation.experimentId,
                );

              return (
                `Strengthen evidence for ` +
                `"${experiment?.title ?? evaluation.experimentId}" ` +
                `before allocating execution capacity. ` +
                `Current evidence quality: ` +
                `${evaluation.evidenceQuality}/100.`
              );
            },
          );

      const blockedExperiments =
        evaluations
          .filter(
            (evaluation) =>
              evaluation.decision ===
              "HOLD",
          )
          .map(
            (evaluation) =>
              evaluation.experimentId,
          );

      const killedExperiments =
        evaluations
          .filter(
            (evaluation) =>
              evaluation.decision ===
              "KILL",
          )
          .map(
            (evaluation) =>
              evaluation.experimentId,
          );

      const selectedSet =
        new Set(
          selectedExperimentIds,
        );

      const deferredRunnableExperiments =
        portfolio.deferred
          .filter(
            (item) => {
              const evaluation =
                evaluationById.get(
                  item.experimentId,
                );

              return (
                evaluation?.decision ===
                "RUN" &&
                !selectedSet.has(
                  item.experimentId,
                )
              );
            },
          )
          .map(
            (item) =>
              item.experimentId,
          );

      const portfolioRecommendation =
        portfolio.selectedCount ===
        0
          ? "Do not launch a new experiment portfolio under the current constraints."
          : (
              `Run ${portfolio.selectedCount} experiment` +
              `${portfolio.selectedCount === 1 ? "" : "s"} ` +
              `using ${money(portfolio.allocatedBudget)} ` +
              `of available budget. ` +
              `The selected portfolio carries ` +
              `${money(portfolio.modeledExpectedValue)} ` +
              `of modeled expected value ` +
              `(${portfolio.expectedPortfolioROI}x expected-value-to-cost).`
            );

      const executiveDecision =
        priority
          ? (
              `Approve the recommended experiment portfolio, ` +
              `starting with "${priority.title}" as the highest-allocation-priority experiment.`
            )
          : "No experiment currently clears both the decision engine and portfolio constraints.";

      const nextAction =
        priority
          ? (
              `Confirm instrumentation, owner and launch criteria for ` +
              `"${priority.title}" before execution begins.`
            )
          : evidenceRequests[0] ??
            "Resolve experiment constraints before allocating execution capacity.";

      const requiresHumanReview =
        portfolio.selectedCount >
          0 ||
        evidenceRequests.length >
          0;

      const warnings:
        string[] = [];

      if (
        deferredRunnableExperiments.length >
        0
      ) {
        warnings.push(
          `${deferredRunnableExperiments.length} runnable experiment(s) were deferred by portfolio constraints.`,
        );
      }

      if (
        evidenceRequests.length >
        0
      ) {
        warnings.push(
          `${evidenceRequests.length} experiment(s) require stronger evidence.`,
        );
      }

      if (
        blockedExperiments.length >
        0
      ) {
        warnings.push(
          `${blockedExperiments.length} experiment(s) remain on hold.`,
        );
      }

      return {
        output: {
          portfolioRecommendation,

          selectedExperimentIds,

          selectedCount:
            portfolio.selectedCount,

          allocatedBudget:
            portfolio.allocatedBudget,

          remainingBudget:
            portfolio.remainingBudget,

          modeledExpectedValue:
            portfolio.modeledExpectedValue,

          expectedPortfolioROI:
            portfolio.expectedPortfolioROI,

          priorityExperimentId:
            priority?.experimentId ??
            null,

          evidenceRequests,

          blockedExperiments,

          killedExperiments,

          deferredRunnableExperiments,

          executiveDecision,

          nextAction,
        },

        confidence:
          evaluations.length === 0
            ? 0
            : Math.round(
                (
                  evaluations.reduce(
                    (
                      total,
                      evaluation,
                    ) =>
                      total +
                      evaluation.evidenceQuality,
                    0,
                  ) /
                  evaluations.length
                ) *
                  100,
              ) / 100,

        evidenceIds:
          experiments.flatMap(
            (experiment) =>
              experiment.evidence.map(
                (evidence) =>
                  evidence.id,
              ),
          ),

        toolsCalled: [
          "experiment_decision_engine",
          "portfolio_optimizer",
          "evidence_graph",
        ],

        requiresHumanReview,

        reasoningSummary:
          portfolio.selectedCount >
          0
            ? (
                `The portfolio optimizer selected ` +
                `${portfolio.selectedCount} runnable experiment(s) ` +
                `after applying budget, concurrency, duration, owner-capacity and decision-gate constraints.`
              )
            : "No experiment satisfied the current decision and allocation constraints.",

        warnings,
      };
    },
  };