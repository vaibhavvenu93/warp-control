import {
  ArrowRight,
  CircleHelp,
  ShieldCheck,
} from "lucide-react";

import {
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

  const agentRun =
    agentRuns[0];

  const agentOutput =
    agentRun?.output ?? {};

  const nextAction =
    readString(
      agentOutput.nextAction,
      "Review the recommended revenue motion.",
    );

  const approvalReason =
    readString(
      agentOutput.approvalReason,
      "Human judgment is required before execution.",
    );

  const missingInformation =
  Array.isArray(
    agentOutput.missingInformation,
  )
    ? agentOutput.missingInformation.filter(
        (item): item is string =>
          typeof item === "string",
      )
    : [];

  const supportingEvidence =
    opportunity
      ? evidence.filter(
          (item) =>
            opportunity.evidenceIds.includes(
              item.id,
            ),
        )
      : [];

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
            Evidence before opinion.
            Recommendations remain
            explainable. High-consequence
            actions stop for human
            judgment.
          </p>
        </div>

        <div className="decision-summary">
          <strong>
            {decisions.length}
          </strong>

          <span>
            open decisions
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
          CONTROL PLANE LINKED
        </span>

        <p
          style={{
            marginTop: 7,
          }}
        >
          This queue is generated from
          the same signal, scoring,
          opportunity and agent runtime
          used across Accounts, GTM and
          Agents.
        </p>
      </div>

      <div className="decision-list">
        {decisions.map(
          (decision) => (
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
                      {account.name}
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
                    confidence
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
                    {nextAction}
                  </h3>

                  <p>
                    {approvalReason}
                  </p>

                  <div className="eyebrow space-top">
                    SUPPORTING EVIDENCE
                  </div>

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
                              size={
                                15
                              }
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
                </div>

                <div className="decision-economics">
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
                        Missing
                        information
                      </span>

                      <p>
                        {missingInformation.length >
                        0
                          ? missingInformation.join(
                              " · ",
                            )
                          : "No additional information explicitly requested by the opportunity engine."}
                      </p>
                    </div>
                  </div>
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
                    "repeat(3, minmax(0, 1fr))",
                  gap: 18,
                }}
              >
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
                    {agentRun?.status ??
                      "—"}
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
                  Approve motion

                  <ArrowRight
                    size={15}
                  />
                </button>
              </div>
            </article>
          ),
        )}
      </div>
    </div>
  );
}