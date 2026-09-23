import {
  AgentRunRepository,
} from "@/agents/contracts/agent";

import {
  experimentAnalystAgent,
  ExperimentAnalystOutput,
} from "@/agents/experiment-analyst-agent";

import {
  AgentRuntime,
} from "@/agents/runtime/agent-runtime";

import {
  demoExperimentEvaluations,
  demoExperimentPortfolio,
} from "@/data/demo/experiment-portfolio";

import {
  ExperimentCandidate,
  ExperimentEvaluation,
} from "@/domain/experiment-intelligence/types";

import {
  optimizePortfolio,
  PortfolioConstraints,
  PortfolioOptimization,
} from "@/domain/experiment-intelligence/portfolio-optimizer";

import {
  DomainEvent,
} from "@/domain/types";

import {
  createDomainEvent,
} from "@/events/create-event";

import {
  EventBus,
} from "@/events/event-bus";

export interface ExperimentOrchestratorOptions {
  experiments?:
    ExperimentCandidate[];

  evaluations?:
    ExperimentEvaluation[];

  constraints?:
    PortfolioConstraints;

  now?: () => Date;

  createRunId?: () => string;

  createDecisionId?: () => string;
}

export interface ExperimentOrchestrationResult {
  portfolio:
    PortfolioOptimization;

  analysis:
    ExperimentAnalystOutput;

  confidence: number;

  requiresHumanReview: boolean;

  correlationId: string;

  decisionEventId?: string;
}

const DEFAULT_CONSTRAINTS:
  PortfolioConstraints = {
    budget: 50_000,

    maxConcurrentExperiments: 3,

    owners: {
      Growth: 2,
      Revenue: 1,
      CEO: 1,
      Operations: 1,
    },
  };

export class ExperimentOrchestrator {
  private readonly experiments:
    ExperimentCandidate[];

  private readonly evaluations:
    ExperimentEvaluation[];

  private readonly constraints:
    PortfolioConstraints;

  private readonly now: () => Date;

  private readonly createDecisionId:
    () => string;

  private readonly runtime:
    AgentRuntime;

  constructor(
    private readonly eventBus:
      EventBus,

    agentRunRepository:
      AgentRunRepository,

    options:
      ExperimentOrchestratorOptions = {},
  ) {
    this.experiments =
      options.experiments ??
      demoExperimentPortfolio;

    this.evaluations =
      options.evaluations ??
      demoExperimentEvaluations;

    this.constraints =
      options.constraints ??
      DEFAULT_CONSTRAINTS;

    this.now =
      options.now ??
      (() => new Date());

    this.createDecisionId =
      options.createDecisionId ??
      (() =>
        `decision-experiment-${crypto.randomUUID()}`);

    this.runtime =
      new AgentRuntime(
        agentRunRepository,
        eventBus,
        {
          now: this.now,
          createRunId:
            options.createRunId,
        },
      );
  }

  async analyze({
    correlationId,
    causationId,
  }: {
    correlationId: string;
    causationId?: string;
  }): Promise<
    ExperimentOrchestrationResult
  > {
    const portfolio =
      optimizePortfolio(
        this.experiments,
        this.constraints,
      );

    const result =
      await this.runtime.execute({
        agent:
          experimentAnalystAgent,

        trigger:
          "EXPERIMENT_PORTFOLIO_REVIEW",

        execution: {
          input: {
            experiments:
              this.experiments,

            evaluations:
              this.evaluations,

            portfolio,
          },

          context: {
            correlationId,

            causationId,

            evidence: [],

            metadata: {
              portfolioOptimizerVersion:
                portfolio.methodologyVersion,

              experimentCount:
                this.experiments.length,
            },
          },
        },
      });

    let decisionEventId:
      string | undefined;

    if (
      result.requiresHumanReview
    ) {
      const decisionId =
        this.createDecisionId();

      const decisionEvent =
        createDomainEvent({
          id: decisionId,

          type:
            "DECISION_REQUIRED",

          aggregateType:
            "DECISION",

          aggregateId:
            decisionId,

          payload: {
            decisionType:
              "EXPERIMENT_PORTFOLIO_APPROVAL",

            title:
              "Approve experiment portfolio",

            recommendation:
              result.output
                .portfolioRecommendation,

            executiveDecision:
              result.output
                .executiveDecision,

            nextAction:
              result.output
                .nextAction,

            priorityExperimentId:
              result.output
                .priorityExperimentId,

            selectedExperimentIds:
              result.output
                .selectedExperimentIds,

            allocatedBudget:
              result.output
                .allocatedBudget,

            remainingBudget:
              result.output
                .remainingBudget,

            modeledExpectedValue:
              result.output
                .modeledExpectedValue,

            expectedPortfolioROI:
              result.output
                .expectedPortfolioROI,

            evidenceRequests:
              result.output
                .evidenceRequests,

            blockedExperiments:
              result.output
                .blockedExperiments,

            killedExperiments:
              result.output
                .killedExperiments,

            confidence:
              result.confidence,

            requiresHumanReview:
              true,

            agent:
              experimentAnalystAgent.name,

            agentVersion:
              experimentAnalystAgent.version,
          },

          source:
            "AGENT",

          correlationId,

          causationId,

          occurredAt:
            this.now().toISOString(),
        });

      await this.eventBus.publish(
        decisionEvent,
      );

      decisionEventId =
        decisionEvent.id;
    }

    return {
      portfolio,

      analysis:
        result.output,

      confidence:
        result.confidence,

      requiresHumanReview:
        result.requiresHumanReview,

      correlationId,

      decisionEventId,
    };
  }
}

export function findExperimentDecisionEvents(
  events: DomainEvent[],
): DomainEvent[] {
  return events.filter(
    (event) =>
      event.type ===
        "DECISION_REQUIRED" &&
      event.payload
        .decisionType ===
        "EXPERIMENT_PORTFOLIO_APPROVAL",
  );
}