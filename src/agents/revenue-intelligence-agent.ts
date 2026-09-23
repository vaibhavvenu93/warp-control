import {
  Account,
  Opportunity,
  WarpScore,
} from "@/domain/types";

import {
  AgentDefinition,
  AgentExecutionResult,
} from "@/agents/contracts/agent";

export interface RevenueIntelligenceInput
  extends Record<string, unknown> {
  account: Account;

  opportunity: Opportunity;

  warpScore: WarpScore;

  missingInformation: string[];

  scoreDrivers: string[];

  supportingSignals: string[];
}

export interface RevenueIntelligenceOutput
  extends Record<string, unknown> {
  accountId: string;

  opportunityId: string;

  recommendedMotion:
    Opportunity["recommendedMotion"];

  commercialPriority:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "EXECUTIVE";

  expectedValue: number;

  nextAction: string;

  approvalReason?: string;

  missingInformation: string[];
}

function determinePriority(
  opportunity: Opportunity,
): RevenueIntelligenceOutput["commercialPriority"] {
  if (
    opportunity.score >= 85 &&
    opportunity.expectedValue >= 50_000
  ) {
    return "EXECUTIVE";
  }

  if (
    opportunity.score >= 70 ||
    opportunity.expectedValue >= 25_000
  ) {
    return "HIGH";
  }

  if (
    opportunity.score >= 55
  ) {
    return "MEDIUM";
  }

  return "LOW";
}

function determineNextAction(
  opportunity: Opportunity,
): string {
  switch (
    opportunity.recommendedMotion
  ) {
    case "ENTERPRISE_SALES":
      return "Prepare an enterprise discovery brief and identify the technical and economic buying committee.";

    case "FOUNDER_OUTBOUND":
      return "Prepare founder-led outreach anchored on the strongest verified engineering trigger.";

    case "TECHNICAL_OUTBOUND":
      return "Run technical discovery outreach focused on CI latency, developer throughput and current workflow.";

    case "PLG_INTERVENTION":
      return "Review product usage and identify the highest-leverage conversion or sales-assist intervention.";

    case "EXPANSION":
      return "Build an expansion case from usage, developer adoption and additional workload potential.";

    case "NURTURE":
      return "Continue signal monitoring until stronger technical or commercial intent appears.";

    default:
      return "Review the opportunity and determine the next commercial action.";
  }
}

export const revenueIntelligenceAgent: AgentDefinition<
  RevenueIntelligenceInput,
  RevenueIntelligenceOutput
> = {
  name: "REVENUE_INTELLIGENCE",

  version: "1.0.0",

  description:
    "Converts a qualified WarpBuild opportunity into an explainable commercial recommendation and human-review decision.",

  async execute({
    input,
    context,
  }): Promise<
    AgentExecutionResult<RevenueIntelligenceOutput>
  > {
    const {
      account,
      opportunity,
      missingInformation,
      scoreDrivers,
      supportingSignals,
    } = input;

    const commercialPriority =
      determinePriority(opportunity);

    const nextAction =
      determineNextAction(
        opportunity,
      );

    const requiresHumanReview =
      commercialPriority ===
        "EXECUTIVE" ||
      opportunity.recommendedMotion ===
        "FOUNDER_OUTBOUND" ||
      opportunity.recommendedMotion ===
        "ENTERPRISE_SALES";

    const warnings: string[] = [];

    if (
      missingInformation.length > 0
    ) {
      warnings.push(
        `${missingInformation.length} commercial intelligence field(s) remain unresolved.`,
      );
    }

    if (
      context.evidence.length === 0
    ) {
      warnings.push(
        "No evidence objects were supplied to the agent runtime.",
      );
    }

    const confidence =
      Math.min(
        100,
        Math.max(
          0,
          opportunity.confidence,
        ),
      );

    const reasoningSummary = [
      `${account.name} is classified as ${commercialPriority.toLowerCase()} commercial priority.`,
      `WarpScore is ${opportunity.score} with an estimated opportunity value of ${opportunity.expectedValue}.`,
      `Recommended motion is ${opportunity.recommendedMotion}.`,
      scoreDrivers.length > 0
        ? `Primary score drivers: ${scoreDrivers.join(", ")}.`
        : "No score-driver explanation was supplied.",
      supportingSignals.length > 0
        ? `Supporting signals include ${supportingSignals.join(", ")}.`
        : "No supporting signals were supplied.",
    ].join(" ");

    return {
      output: {
        accountId: account.id,

        opportunityId:
          opportunity.id,

        recommendedMotion:
          opportunity.recommendedMotion,

        commercialPriority,

        expectedValue:
          opportunity.expectedValue,

        nextAction,

        approvalReason:
          requiresHumanReview
            ? "The recommended action has executive, founder-led or enterprise commercial impact."
            : undefined,

        missingInformation,
      },

      confidence,

      evidenceIds:
        opportunity.evidenceIds,

      toolsCalled: [
        "warp_score",
        "opportunity_engine",
        "evidence_graph",
      ],

      requiresHumanReview,

      reasoningSummary,

      warnings,
    };
  },
};