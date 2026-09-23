import {
  AgentName,
  AgentRun,
} from "@/domain/types";

import {
  AgentDefinition,
  AgentExecutionInput,
  AgentExecutionResult,
  AgentRunRepository,
} from "@/agents/contracts/agent";

import { createDomainEvent } from "@/events/create-event";
import { EventBus } from "@/events/event-bus";

interface AgentRuntimeOptions {
  now?: () => Date;

  createRunId?: () => string;
}

export interface ExecuteAgentOptions<
  TInput extends Record<string, unknown>,
  TOutput extends Record<string, unknown>,
> {
  agent: AgentDefinition<
    TInput,
    TOutput
  >;

  execution: AgentExecutionInput<TInput>;

  trigger: string;
}

export class AgentRuntime {
  private readonly now: () => Date;

  private readonly createRunId: () => string;

  constructor(
    private readonly repository: AgentRunRepository,
    private readonly eventBus: EventBus,
    options: AgentRuntimeOptions = {},
  ) {
    this.now =
      options.now ??
      (() => new Date());

    this.createRunId =
      options.createRunId ??
      (() =>
        `run-${crypto.randomUUID()}`);
  }

  async execute<
    TInput extends Record<
      string,
      unknown
    >,
    TOutput extends Record<
      string,
      unknown
    >,
  >({
    agent,
    execution,
    trigger,
  }: ExecuteAgentOptions<
    TInput,
    TOutput
  >): Promise<
    AgentExecutionResult<TOutput>
  > {
    /*
     * Fail immediately if orchestration code
     * attempts to execute an invalid agent.
     *
     * This produces a useful boundary error
     * instead of a cryptic `agent.name`
     * TypeError later.
     */
    if (!agent) {
      throw new Error(
        "AgentRuntime.execute received an undefined agent.",
      );
    }

    const runId =
      this.createRunId();

    const startedAt =
      this.now();

    const initialRun: AgentRun = {
      id: runId,

      agent: agent.name,

      status: "RUNNING",

      trigger,

      input: {
        ...execution.input,

        correlationId:
          execution.context
            .correlationId,

        causationId:
          execution.context
            .causationId,

        accountId:
          execution.context.accountId,

        opportunityId:
          execution.context
            .opportunityId,

        agentVersion:
          agent.version,
      },

      evidenceIds:
        execution.context.evidence.map(
          (item) => item.id,
        ),

      toolsCalled: [],

      startedAt:
        startedAt.toISOString(),
    };

    await this.repository.save(
      initialRun,
    );

    try {
      const result =
        await agent.execute(
          execution,
        );

      const completedAt =
        this.now();

      const latencyMs = Math.max(
        0,
        completedAt.getTime() -
          startedAt.getTime(),
      );

      const status =
        result.requiresHumanReview
          ? "REQUIRES_HUMAN"
          : "COMPLETED";

      const completedRun: AgentRun = {
        ...initialRun,

        status,

        output: {
          ...result.output,

          reasoningSummary:
            result.reasoningSummary,

          warnings:
            result.warnings,

          requiresHumanReview:
            result.requiresHumanReview,
        },

        evidenceIds: [
          ...new Set([
            ...initialRun.evidenceIds,
            ...result.evidenceIds,
          ]),
        ],

        confidence:
          result.confidence,

        toolsCalled:
          result.toolsCalled,

        completedAt:
          completedAt.toISOString(),

        latencyMs,
      };

      await this.repository.save(
        completedRun,
      );

      await this.eventBus.publish(
        createDomainEvent({
          type: "AGENT_RUN_COMPLETED",

          aggregateType: "AGENT",

          aggregateId: runId,

          payload: {
            runId,

            agent:
              agent.name,

            agentVersion:
              agent.version,

            status,

            confidence:
              result.confidence,

            requiresHumanReview:
              result.requiresHumanReview,

            toolsCalled:
              result.toolsCalled,

            latencyMs,
          },

          source: "AGENT",

          correlationId:
            execution.context
              .correlationId,

          causationId:
            execution.context
              .causationId,

          occurredAt:
            completedAt.toISOString(),
        }),
      );

      return result;
    } catch (error) {
      const completedAt =
        this.now();

      const message =
        error instanceof Error
          ? error.message
          : "Unknown agent failure";

      const failedRun: AgentRun = {
        ...initialRun,

        status: "FAILED",

        completedAt:
          completedAt.toISOString(),

        latencyMs: Math.max(
          0,
          completedAt.getTime() -
            startedAt.getTime(),
        ),

        error: message,
      };

      await this.repository.save(
        failedRun,
      );

      await this.eventBus.publish(
        createDomainEvent({
          type: "AGENT_RUN_FAILED",

          aggregateType: "AGENT",

          aggregateId: runId,

          payload: {
            runId,

            agent:
              agent.name,

            agentVersion:
              agent.version,

            error: message,
          },

          source: "AGENT",

          correlationId:
            execution.context
              .correlationId,

          causationId:
            execution.context
              .causationId,

          occurredAt:
            completedAt.toISOString(),
        }),
      );

      throw error;
    }
  }
}

export function isAgentName(
  value: string,
): value is AgentName {
  const agents: AgentName[] = [
    "MARKET_RADAR",
    "ACCOUNT_INTELLIGENCE",
    "REVENUE_INTELLIGENCE",
    "CI_ECONOMICS",
    "CUSTOMER_VOICE",
    "EXPERIMENT_ANALYST",
    "EXECUTIVE_BRIEF",
  ];

  return agents.includes(
    value as AgentName,
  );
}