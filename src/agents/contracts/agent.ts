import {
  AgentName,
  AgentRun,
  EvidenceRef,
} from "@/domain/types";

export interface AgentContext {
  correlationId: string;
  causationId?: string;

  accountId?: string;
  opportunityId?: string;
  experimentId?: string;

  evidence: EvidenceRef[];

  metadata?: Record<string, unknown>;
}

export interface AgentExecutionInput<
  TInput extends Record<string, unknown> = Record<string, unknown>,
> {
  input: TInput;
  context: AgentContext;
}

export interface AgentExecutionResult<
  TOutput extends Record<string, unknown> = Record<string, unknown>,
> {
  output: TOutput;

  confidence: number;

  evidenceIds: string[];

  toolsCalled: string[];

  requiresHumanReview: boolean;

  reasoningSummary: string;

  warnings: string[];
}

export interface AgentDefinition<
  TInput extends Record<string, unknown> = Record<string, unknown>,
  TOutput extends Record<string, unknown> = Record<string, unknown>,
> {
  name: AgentName;

  version: string;

  description: string;

  execute(
    execution: AgentExecutionInput<TInput>,
  ): Promise<AgentExecutionResult<TOutput>>;
}

export interface AgentRunRepository {
  save(run: AgentRun): Promise<void>;

  getById(
    runId: string,
  ): Promise<AgentRun | null>;

  getByCorrelationId(
    correlationId: string,
  ): Promise<AgentRun[]>;

  getByAgent(
    agent: AgentName,
  ): Promise<AgentRun[]>;
}

export class InMemoryAgentRunRepository
  implements AgentRunRepository
{
  private readonly runs =
    new Map<string, AgentRun>();

  async save(
    run: AgentRun,
  ): Promise<void> {
    this.runs.set(
      run.id,
      structuredClone(run),
    );
  }

  async getById(
    runId: string,
  ): Promise<AgentRun | null> {
    const run = this.runs.get(runId);

    return run
      ? structuredClone(run)
      : null;
  }

  async getByCorrelationId(
    correlationId: string,
  ): Promise<AgentRun[]> {
    return [...this.runs.values()]
      .filter(
        (run) =>
          run.input.correlationId ===
          correlationId,
      )
      .map((run) =>
        structuredClone(run),
      );
  }

  async getByAgent(
    agent: AgentName,
  ): Promise<AgentRun[]> {
    return [...this.runs.values()]
      .filter(
        (run) => run.agent === agent,
      )
      .map((run) =>
        structuredClone(run),
      );
  }
}