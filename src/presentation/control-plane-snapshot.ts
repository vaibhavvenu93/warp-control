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

export function buildControlPlaneDecisions(
  events: DomainEvent[],
  agentRuns: AgentRun[],
): ControlPlaneDecision[] {
  const systemDecisions =
    events
      .filter(
        (event) =>
          event.type ===
          "DECISION_REQUIRED",
      )
      .map(
        (
          event,
        ): ControlPlaneDecision => ({
          id:
            `decision-${event.id}`,

          title:
            readString(
              event.payload.decision,
              "System decision required",
            ),

          reason:
            readString(
              event.payload.reason,
              "A control-plane rule requires human review.",
            ),

          status:
            "SYSTEM_REVIEW",

          confidence:
            readNumber(
              event.payload.confidence,
            ),

          source:
            "SYSTEM",

          correlationId:
            event.correlationId,

          causationId:
            event.causationId,
        }),
      );

  const agentDecisions =
    agentRuns
      .filter(
        (run) =>
          run.status ===
          "REQUIRES_HUMAN",
      )
      .map(
        (
          run,
        ): ControlPlaneDecision => {
          const output =
            run.output ?? {};

          return {
            id:
              `decision-${run.id}`,

            title:
              readString(
                output.nextAction,
                "Revenue motion requires approval",
              ),

            reason:
              readString(
                output.approvalReason,
                readString(
                  output.reasoningSummary,
                  "The revenue intelligence agent requires human judgment before execution.",
                ),
              ),

            status:
              "REQUIRES_HUMAN",

            confidence:
              run.confidence,

            source:
              "AGENT",

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
        },
      );

  return [
    ...agentDecisions,
    ...systemDecisions,
  ];
}