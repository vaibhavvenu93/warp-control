import type {
  AgentDefinition,
} from "@/agents/contracts/agent";

import type {
  MarketClaim,
} from "@/domain/market-radar/claims/claim-types";

export interface MarketRadarAgentInput
  extends Record<
    string,
    unknown
  > {
  claims: MarketClaim[];

  investigationWindow: {
    startedAt: string;
    endedAt: string;
  };

  strategicContext: {
    company: string;
    priorities: string[];
  };
}

export interface MarketRadarFinding {
  claimId: string;

  subject: string;
  observation: string;

  confidence: number;
  evidenceCount: number;
  independentSourceCount: number;

  interpretation: string;

  recommendation: string;

  humanReviewRequired: boolean;
}

export interface MarketRadarAgentOutput
  extends Record<
    string,
    unknown
  > {
  investigatedClaimCount: number;

  highConfidenceClaimIds:
    string[];

  weakClaimIds:
    string[];

  findings:
    MarketRadarFinding[];

  executiveSummary: string;

  evidenceRequests: string[];

  nextAction: string;
}

function uniqueSourceCount(
  claim: MarketClaim,
): number {
  return new Set(
    claim.evidence.map(
      (item) =>
        item.sourceId,
    ),
  ).size;
}

function interpretationForClaim(
  claim: MarketClaim,
): string {
  switch (
    claim.type
  ) {
    case "PRICING_CHANGE":
      return (
        "This may affect category price-performance expectations. " +
        "Validate the commercial implication before changing packaging or pricing."
      );

    case "PRODUCT_CHANGE":
      return (
        "This may alter the product comparison surface. " +
        "Assess whether the change affects WarpBuild differentiation."
      );

    case "TECHNOLOGY_CHANGE":
      return (
        "This may change developer workflow expectations or infrastructure demand. " +
        "Assess the impact on CI feedback loops and product positioning."
      );

    case "ECOSYSTEM_CHANGE":
      return (
        "This may change where developer attention and distribution concentrate. " +
        "Evaluate whether it creates a GTM or product-distribution opportunity."
      );

    case "HIRING_SIGNAL":
      return (
        "Hiring activity can indicate strategic investment, but the intent is not directly observable. " +
        "Treat this as an investigation signal rather than proof of company strategy."
      );

    case "CAPITAL_SIGNAL":
      return (
        "Capital activity can alter competitive capacity, but does not by itself prove product or GTM execution. " +
        "Monitor subsequent operating evidence."
      );

    case "SECURITY_SIGNAL":
      return (
        "This may affect enterprise evaluation requirements. " +
        "Check whether security evidence or packaging should enter the sales motion."
      );

    case "CUSTOMER_SIGNAL":
      return (
        "This may indicate customer demand or adoption behavior. " +
        "Validate whether the evidence generalizes beyond the observed customer context."
      );

    case "PARTNERSHIP_SIGNAL":
      return (
        "This may alter distribution, integrations or ecosystem reach. " +
        "Investigate the practical scope of the partnership before assigning strategic impact."
      );

    default:
      return (
        "This is an observed external change. " +
        "Its strategic implication remains an inference until additional evidence is available."
      );
  }
}

function recommendationForClaim(
  claim: MarketClaim,
): string {
  const sources =
    uniqueSourceCount(
      claim,
    );

  if (
    claim.confidence < 50
  ) {
    return (
      "Collect stronger evidence before escalating this observation."
    );
  }

  if (
    sources < 2
  ) {
    return (
      "Seek an independent source or first-party confirmation before treating this as corroborated."
    );
  }

  if (
    claim.type ===
      "PRICING_CHANGE" ||
    claim.type ===
      "PRODUCT_CHANGE"
  ) {
    return (
      "Create a bounded competitive investigation and test whether WarpBuild positioning or packaging should respond."
    );
  }

  if (
    claim.type ===
      "ECOSYSTEM_CHANGE" ||
    claim.type ===
      "TECHNOLOGY_CHANGE"
  ) {
    return (
      "Create a market experiment hypothesis and quantify the likely product or GTM impact."
    );
  }

  return (
    "Escalate for structured review with the supporting evidence attached."
  );
}

export const marketRadarAgent:
  AgentDefinition<
    MarketRadarAgentInput,
    MarketRadarAgentOutput
  > = {
    name:
      "MARKET_RADAR",

    version:
      "1.0.0",

    description:
      "Investigates evidence-backed external market claims while separating observation, interpretation and recommended action.",

    async execute({
      input,
    }) {
      const {
        claims,
        strategicContext,
      } = input;

      const sorted =
        [...claims].sort(
          (
            left,
            right,
          ) =>
            right.confidence -
            left.confidence,
        );

      const findings =
        sorted.map(
          (
            claim,
          ): MarketRadarFinding => ({
            claimId:
              claim.id,

            subject:
              claim.subject,

            observation:
              claim.statement,

            confidence:
              claim.confidence,

            evidenceCount:
              claim.evidence.length,

            independentSourceCount:
              uniqueSourceCount(
                claim,
              ),

            interpretation:
              interpretationForClaim(
                claim,
              ),

            recommendation:
              recommendationForClaim(
                claim,
              ),

            humanReviewRequired:
              claim.confidence >=
                70 ||
              claim.type ===
                "PRICING_CHANGE" ||
              claim.type ===
                "PRODUCT_CHANGE",
          }),
        );

      const highConfidenceClaimIds =
        sorted
          .filter(
            (claim) =>
              claim.confidence >=
              70,
          )
          .map(
            (claim) =>
              claim.id,
          );

      const weakClaimIds =
        sorted
          .filter(
            (claim) =>
              claim.confidence <
              50,
          )
          .map(
            (claim) =>
              claim.id,
          );

      const evidenceRequests =
        sorted
          .filter(
            (claim) =>
              uniqueSourceCount(
                claim,
              ) < 2,
          )
          .map(
            (claim) =>
              `Find independent corroboration for "${claim.statement}"`,
          );

      const requiresHumanReview =
        findings.some(
          (finding) =>
            finding.humanReviewRequired,
        );

      const averageConfidence =
        sorted.length === 0
          ? 0
          : Math.round(
              (
                sorted.reduce(
                  (
                    total,
                    claim,
                  ) =>
                    total +
                    claim.confidence,
                  0,
                ) /
                sorted.length
              ) *
                100,
            ) / 100;

      const executiveSummary =
        claims.length === 0
          ? (
              `No external market claims were available for ${strategicContext.company}.`
            )
          : (
              `Market Radar investigated ${claims.length} evidence-backed claim` +
              `${claims.length === 1 ? "" : "s"}. ` +
              `${highConfidenceClaimIds.length} currently clear the high-confidence threshold; ` +
              `${evidenceRequests.length} require additional source corroboration.`
            );

      return {
        output: {
          investigatedClaimCount:
            claims.length,

          highConfidenceClaimIds,

          weakClaimIds,

          findings,

          executiveSummary,

          evidenceRequests,

          nextAction:
            findings[0]
              ?.recommendation ??
            "Wait for additional external observations before escalating market intelligence.",
        },

        confidence:
          averageConfidence,

        evidenceIds:
          sorted.flatMap(
            (claim) =>
              claim.evidence.map(
                (evidence) =>
                  evidence.observationId,
              ),
          ),

        toolsCalled: [
          "market_claim_repository",
          "claim_triangulation_engine",
          "market_radar_reasoning_policy",
        ],

        requiresHumanReview,

        reasoningSummary:
          claims.length === 0
            ? "No evidence-backed claims were available for investigation."
            : (
                `The agent ranked ${claims.length} claim(s) by evidence confidence, ` +
                `checked independent-source coverage and generated interpretations separately from observed claims.`
              ),

        warnings:
          evidenceRequests.length >
          0
            ? [
                `${evidenceRequests.length} claim(s) lack independent-source corroboration.`,
              ]
            : [],
      };
    },
  };