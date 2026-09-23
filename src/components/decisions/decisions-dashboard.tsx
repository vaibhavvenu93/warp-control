import {
  ArrowRight,
  CircleHelp,
  ShieldCheck,
} from "lucide-react";

import {
  ControlPlaneDecision,
  ControlPlaneSnapshot,
} from "@/presentation/control-plane-snapshot";

interface DecisionsDashboardProps {
  snapshot: ControlPlaneSnapshot;
}

function money(
  value?: number,
): string {
  if (value === undefined) {
    return "—";
  }

  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    },
  ).format(value);
}

function readString(
  value: unknown,
  fallback = "—",
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

function readStringArray(
  value: unknown,
): string[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === "string",
      )
    : [];
}

function isExperimentDecision(
  decision: ControlPlaneDecision,
): boolean {
  return (
    decision.agent ===
      "EXPERIMENT_ANALYST" ||
    decision.decisionType ===
      "EXPERIMENT_PORTFOLIO_APPROVAL"
  );
}

export function DecisionsDashboard({
  snapshot,
}: DecisionsDashboardProps) {
  const {
    account,
    opportunity,
    warpScore,
    agentRuns,
    decisions,
    evidence,
  } = snapshot;

  const revenueRun =
    agentRuns.find(
      (run) =>
        run.agent ===
        "REVENUE_INTELLIGENCE",
    );

  const experimentRun =
    agentRuns.find(
      (run) =>
        run.agent ===
        "EXPERIMENT_ANALYST",
    );

  const revenueOutput =
    revenueRun?.output ?? {};

  const experimentOutput =
    experimentRun?.output ?? {};

  const supportingEvidence =
    opportunity
      ? evidence.filter(
          (item) =>
            opportunity.evidenceIds.includes(
              item.id,
            ),
        )
      : [];

  const revenueMissingInformation =
    readStringArray(
      revenueOutput
        .missingInformation,
    );

  const evidenceRequests =
    readStringArray(
      experimentOutput
        .evidenceRequests,
    );

  const selectedExperimentIds =
    readStringArray(
      experimentOutput
        .selectedExperimentIds,
    );

  const allocatedBudget =
    readNumber(
      experimentOutput
        .allocatedBudget,
    );

  const modeledExpectedValue =
    readNumber(
      experimentOutput
        .modeledExpectedValue,
    );

  const expectedPortfolioROI =
    readNumber(
      experimentOutput
        .expectedPortfolioROI,
    );

  return (
    <div className="page">
      <section className="page-header">
        <div>
          <div className="eyebrow">
            CONTROL / DECISIONS
          </div>

          <h1>
            CEO decision queue
          </h1>

          <p>
            One queue across revenue,
            experimentation and system
            policy. Evidence before
            opinion; high-consequence
            actions stop for human
            judgment.
          </p>
        </div>

        <div className="decision-summary">
          <strong>
            {decisions.length}
          </strong>

          <span>
            OPEN DECISIONS
          </span>
        </div>
      </section>

      <div
        className="coming-card"
        style={{
          marginTop: 0,
          marginBottom: 28,
        }}
      >
        <span>
          SHARED DECISION LAYER
        </span>

        <p
          style={{
            marginTop: 7,
          }}
        >
          Revenue Intelligence,
          Experiment Analyst and
          deterministic system rules
          converge here without losing
          their original correlation,
          causation or provenance.
        </p>
      </div>

      <div className="decision-list">
        {decisions.map(
          (decision) => {
            const experiment =
              isExperimentDecision(
                decision,
              );

            const run =
              experiment
                ? experimentRun
                : revenueRun;

            const output =
              run?.output ?? {};

            const recommendation =
              experiment
                ? readString(
                    output.nextAction,
                    "Confirm instrumentation, owner and launch criteria.",
                  )
                : readString(
                    output.nextAction,
                    "Review the recommended revenue motion.",
                  );

            const approvalReason =
              experiment
                ? readString(
                    output.portfolioRecommendation,
                    readString(
                      output.reasoningSummary,
                      "Human approval is required before allocating experiment capacity.",
                    ),
                  )
                : readString(
                    output.approvalReason,
                    readString(
                      output.reasoningSummary,
                      "Human judgment is required before execution.",
                    ),
                  );

            return (
              <article
                className="decision-card"
                key={decision.id}
              >
                <div className="decision-card-header">
                  <div>
                    <div className="signal-meta">
                      <span>
                        {decision.source}
                      </span>

                      <span>•</span>

                      <span>
                        {decision.status}
                      </span>

                      <span>•</span>

                      <span>
                        {experiment
                          ? "EXPERIMENT PORTFOLIO"
                          : account.name}
                      </span>
                    </div>

                    <h2>
                      {decision.title}
                    </h2>
                  </div>

                  <div className="confidence-ring">
                    <strong>
                      {decision.confidence ??
                        warpScore.confidence}
                      %
                    </strong>

                    <span>
                      CONFIDENCE
                    </span>
                  </div>
                </div>

                <div className="decision-columns">
                  <div>
                    <div className="eyebrow">
                      WHY NOW
                    </div>

                    <p>
                      {decision.reason}
                    </p>

                    <div className="eyebrow space-top">
                      SYSTEM RECOMMENDATION
                    </div>

                    <h3>
                      {recommendation}
                    </h3>

                    <p>
                      {approvalReason}
                    </p>

                    <div className="eyebrow space-top">
                      {experiment
                        ? "EVIDENCE REQUIRED"
                        : "SUPPORTING EVIDENCE"}
                    </div>

                    {experiment ? (
                      evidenceRequests.length >
                      0 ? (
                        <ul className="evidence-list">
                          {evidenceRequests.map(
                            (request) => (
                              <li
                                key={
                                  request
                                }
                              >
                                <CircleHelp
                                  size={15}
                                />

                                <span>
                                  {
                                    request
                                  }
                                </span>
                              </li>
                            ),
                          )}
                        </ul>
                      ) : (
                        <p>
                          No additional
                          evidence requests
                          are blocking the
                          recommended
                          portfolio.
                        </p>
                      )
                    ) : (
                      <ul className="evidence-list">
                        {supportingEvidence
                          .slice(0, 4)
                          .map(
                            (item) => (
                              <li
                                key={
                                  item.id
                                }
                              >
                                <ShieldCheck
                                  size={15}
                                />

                                <span>
                                  {
                                    item.claim
                                  }
                                </span>
                              </li>
                            ),
                          )}
                      </ul>
                    )}
                  </div>

                  <div className="decision-economics">
                    {experiment ? (
                      <>
                        <div>
                          <span>
                            SELECTED
                          </span>

                          <p>
                            {
                              selectedExperimentIds.length
                            }{" "}
                            experiments
                          </p>
                        </div>

                        <div>
                          <span>
                            ALLOCATED BUDGET
                          </span>

                          <p>
                            {money(
                              allocatedBudget,
                            )}
                          </p>
                        </div>

                        <div>
                          <span>
                            MODELED EXPECTED VALUE
                          </span>

                          <p>
                            {money(
                              modeledExpectedValue,
                            )}
                          </p>
                        </div>

                        <div>
                          <span>
                            EV / COST
                          </span>

                          <p>
                            {expectedPortfolioROI !==
                            undefined
                              ? `${expectedPortfolioROI.toFixed(
                                  1,
                                )}x`
                              : "—"}
                          </p>
                        </div>

                        <div className="missing-box">
                          <CircleHelp
                            size={16}
                          />

                          <div>
                            <span>
                              Human boundary
                            </span>

                            <p>
                              Portfolio
                              selection does
                              not spend budget
                              or launch tests
                              autonomously.
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span>
                            WarpScore
                          </span>

                          <p>
                            {
                              warpScore.score
                            }{" "}
                            / 100
                          </p>
                        </div>

                        <div>
                          <span>
                            Recommended motion
                          </span>

                          <p>
                            {opportunity
                              ?.recommendedMotion ??
                              "—"}
                          </p>
                        </div>

                        <div>
                          <span>
                            Estimated ACV
                          </span>

                          <p>
                            {money(
                              opportunity
                                ?.estimatedACV,
                            )}
                          </p>
                        </div>

                        <div>
                          <span>
                            Expected value
                          </span>

                          <p>
                            {money(
                              opportunity
                                ?.expectedValue,
                            )}
                          </p>
                        </div>

                        <div className="missing-box">
                          <CircleHelp
                            size={16}
                          />

                          <div>
                            <span>
                              Missing information
                            </span>

                            <p>
                              {revenueMissingInformation.length >
                              0
                                ? revenueMissingInformation.join(
                                    " · ",
                                  )
                                : "No additional information explicitly requested by the opportunity engine."}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 20,
                    paddingTop: 16,
                    borderTop:
                      "1px solid rgba(255,255,255,0.08)",
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(4, minmax(0, 1fr))",
                    gap: 18,
                  }}
                >
                  <div>
                    <div className="eyebrow">
                      SOURCE
                    </div>

                    <p>
                      {decision.agent ??
                        decision.source}
                    </p>
                  </div>

                  <div>
                    <div className="eyebrow">
                      CORRELATION
                    </div>

                    <p>
                      {
                        decision.correlationId
                      }
                    </p>
                  </div>

                  <div>
                    <div className="eyebrow">
                      CAUSATION
                    </div>

                    <p>
                      {decision.causationId ??
                        "—"}
                    </p>
                  </div>

                  <div>
                    <div className="eyebrow">
                      AGENT STATE
                    </div>

                    <p>
                      {run?.status ??
                        "SYSTEM REVIEW"}
                    </p>
                  </div>
                </div>

                <div className="decision-actions">
                  <button className="secondary-button">
                    Need more evidence
                  </button>

                  <button className="secondary-button">
                    Reject
                  </button>

                  <button className="primary-button">
                    {experiment
                      ? "Approve portfolio"
                      : "Approve motion"}

                    <ArrowRight
                      size={15}
                    />
                  </button>
                </div>
              </article>
            );
          },
        )}
      </div>
    </div>
  );
}