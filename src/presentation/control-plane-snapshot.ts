import {
  Account,
  AgentRun,
  DomainEvent,
  EvidenceRef,
  Opportunity,
  Signal,
  WarpScore,
} from "@/domain/types";

export interface ControlPlaneDecision {
  id: string;

  title: string;

  reason: string;

  status:
    | "REQUIRES_HUMAN"
    | "SYSTEM_REVIEW";

  confidence?: number;

  source:
    | "AGENT"
    | "SYSTEM";

  agent?: string;

  decisionType?: string;

  correlationId: string;

  causationId?: string;
}

export interface ControlPlaneSnapshot {
  generatedAt: string;

  scenario: {
    name: string;

    mode:
      "DETERMINISTIC_DEMO";

    disclaimer: string;
  };

  account: Account;

  signals: Signal[];

  evidence: EvidenceRef[];

  warpScore: WarpScore;

  opportunity:
    Opportunity | null;

  agentRuns: AgentRun[];

  decisions:
    ControlPlaneDecision[];

  events: DomainEvent[];

  telemetry: {
    eventCount: number;

    agentRunCount: number;

    evidenceCount: number;

    signalCount: number;

    humanReviewCount: number;

    decisionCount: number;

    correlationIds: string[];

    correlationId: string;
  };
}

function readString(
  value: unknown,
  fallback: string,
): string {
  return typeof value === "string"
    ? value
    : fallback;
}

function readNumber(
  value: unknown,
): number | undefined {
  return typeof value === "number"
    ? value
    : undefined;
}

function readOptionalString(
  value: unknown,
): string | undefined {
  return typeof value === "string" &&
    value.length > 0
    ? value
    : undefined;
}

function formatMoney(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    },
  ).format(value);
}

function buildEventDecision(
  event: DomainEvent,
): ControlPlaneDecision {
  const isAgentDecision =
    event.source === "AGENT";

  const title =
    readString(
      event.payload.title,
      readString(
        event.payload.decision,
        "System decision required",
      ),
    );

  const reason =
    readString(
      event.payload.recommendation,
      readString(
        event.payload.reason,
        readString(
          event.payload.executiveDecision,
          "A control-plane rule requires human review.",
        ),
      ),
    );

  return {
    id:
      `decision-${event.id}`,

    title,

    reason,

    status:
      isAgentDecision
        ? "REQUIRES_HUMAN"
        : "SYSTEM_REVIEW",

    confidence:
      readNumber(
        event.payload.confidence,
      ),

    source:
      isAgentDecision
        ? "AGENT"
        : "SYSTEM",

    agent:
      readOptionalString(
        event.payload.agent,
      ),

    decisionType:
      readOptionalString(
        event.payload.decisionType,
      ),

    correlationId:
      event.correlationId,

    causationId:
      event.causationId,
  };
}

function buildAgentDecision(
  run: AgentRun,
): ControlPlaneDecision {
  const output =
    run.output ?? {};

  const isExperimentAnalyst =
    run.agent ===
    "EXPERIMENT_ANALYST";

  const allocatedBudget =
    readNumber(
      output.allocatedBudget,
    );

  const experimentTitle =
    allocatedBudget !== undefined
      ? `Approve ${formatMoney(
          allocatedBudget,
        )} experiment portfolio`
      : "Approve experiment portfolio";

  const title =
    isExperimentAnalyst
      ? experimentTitle
      : readString(
          output.nextAction,
          "Revenue motion requires approval",
        );

  const reason =
    isExperimentAnalyst
      ? readString(
          output.portfolioRecommendation,
          readString(
            output.reasoningSummary,
            "The experiment analyst requires human judgment before portfolio execution.",
          ),
        )
      : readString(
          output.approvalReason,
          readString(
            output.reasoningSummary,
            "The revenue intelligence agent requires human judgment before execution.",
          ),
        );

  return {
    id:
      `decision-${run.id}`,

    title,

    reason,

    status:
      "REQUIRES_HUMAN",

    confidence:
      run.confidence,

    source:
      "AGENT",

    agent:
      run.agent,

    correlationId:
      readString(
        run.input
          .correlationId,
        "unknown",
      ),

    causationId:
      readString(
        run.input
          .causationId,
        "",
      ) || undefined,
  };
}

function isDuplicateAgentEvent(
  event: DomainEvent,
  agentRuns: AgentRun[],
): boolean {
  if (
    event.source !== "AGENT"
  ) {
    return false;
  }

  const eventAgent =
    readOptionalString(
      event.payload.agent,
    );

  if (!eventAgent) {
    return false;
  }

  return agentRuns.some(
    (run) =>
      run.status ===
        "REQUIRES_HUMAN" &&
      run.agent ===
        eventAgent &&
      readString(
        run.input
          .correlationId,
        "unknown",
      ) ===
        event.correlationId,
  );
}

export function buildControlPlaneDecisions(
  events: DomainEvent[],
  agentRuns: AgentRun[],
): ControlPlaneDecision[] {
  const eventDecisions =
    events
      .filter(
        (event) =>
          event.type ===
          "DECISION_REQUIRED",
      )
      .filter(
        (event) =>
          !isDuplicateAgentEvent(
            event,
            agentRuns,
          ),
      )
      .map(
        buildEventDecision,
      );

  const agentDecisions =
    agentRuns
      .filter(
        (run) =>
          run.status ===
          "REQUIRES_HUMAN",
      )
      .map(
        buildAgentDecision,
      );

  return [
    ...agentDecisions,
    ...eventDecisions,
  ];
}