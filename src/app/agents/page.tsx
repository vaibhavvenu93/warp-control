import {
  AgentRun,
} from "@/domain/types";

import {
  buildRevenueDemo,
} from "@/services/control-plane";

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

function statusClass(
  status: AgentRun["status"],
): string {
  if (status === "COMPLETED") {
    return "badge badge-live";
  }

  if (
    status === "REQUIRES_HUMAN" ||
    status === "FAILED"
  ) {
    return "badge badge-assumed";
  }

  return "badge badge-modeled";
}

function humanBoundary(
  run: AgentRun,
): string {
  return run.status ===
    "REQUIRES_HUMAN"
    ? "HUMAN REVIEW"
    : "AUTONOMOUS";
}

function agentLabel(
  agent: AgentRun["agent"],
): string {
  if (
    agent ===
    "REVENUE_INTELLIGENCE"
  ) {
    return "Revenue Intelligence";
  }

  if (
    agent ===
    "EXPERIMENT_ANALYST"
  ) {
    return "Experiment Analyst";
  }

  return agent
    .split("_")
    .map(
      (part) =>
        part.charAt(0) +
        part.slice(1).toLowerCase(),
    )
    .join(" ");
}

function agentDomain(
  run: AgentRun,
): string {
  if (
    run.agent ===
    "REVENUE_INTELLIGENCE"
  ) {
    return "COMMERCIAL INTELLIGENCE";
  }

  if (
    run.agent ===
    "EXPERIMENT_ANALYST"
  ) {
    return "EXPERIMENT INTELLIGENCE";
  }

  return "COMPANY INTELLIGENCE";
}

function agentObjective(
  run: AgentRun,
): string {
  const output =
    run.output ?? {};

  if (
    run.agent ===
    "EXPERIMENT_ANALYST"
  ) {
    return readString(
      output.portfolioRecommendation,
      readString(
        output.nextAction,
        "Evaluate the experiment portfolio.",
      ),
    );
  }

  return readString(
    output.nextAction,
    "Review agent recommendation.",
  );
}

function agentReasoning(
  run: AgentRun,
): string {
  const output =
    run.output ?? {};

  return readString(
    output.reasoningSummary,
    readString(
      output.approvalReason,
      "No reasoning summary returned.",
    ),
  );
}

function AgentCard({
  run,
  index,
}: {
  run: AgentRun;
  index: number;
}) {
  const output =
    run.output ?? {};

  const evidenceRequests =
    readStringArray(
      output.evidenceRequests,
    );

  const warnings =
    readStringArray(
      output.warnings,
    );

  const selectedCount =
    readNumber(
      output.selectedCount,
    );

  const allocatedBudget =
    readNumber(
      output.allocatedBudget,
    );

  const expectedPortfolioROI =
    readNumber(
      output.expectedPortfolioROI,
    );

  const commercialPriority =
    readString(
      output.commercialPriority,
    );

  const recommendedMotion =
    readString(
      output.recommendedMotion,
    );

  return (
    <article className="decision-card">
      <div className="decision-card-header">
        <div>
          <div className="signal-meta">
            <span>
              {String(
                index + 1,
              ).padStart(2, "0")}
            </span>

            <span>•</span>

            <span>
              {agentDomain(run)}
            </span>

            <span>•</span>

            <span>
              {run.trigger}
            </span>
          </div>

          <h2>
            {agentLabel(
              run.agent,
            )}
          </h2>

          <p
            style={{
              marginTop: 8,
              maxWidth: 760,
            }}
          >
            {agentObjective(run)}
          </p>
        </div>

        <div className="confidence-ring">
          <strong>
            {run.confidence ??
              "—"}
            {run.confidence !==
            undefined
              ? "%"
              : ""}
          </strong>

          <span>
            CONFIDENCE
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginTop: 18,
        }}
      >
        <span
          className={statusClass(
            run.status,
          )}
        >
          {run.status}
        </span>

        <span className="badge badge-modeled">
          {run.toolsCalled.length} TOOLS
        </span>

        <span className="badge badge-public">
          {run.evidenceIds.length} EVIDENCE
        </span>

        <span className="badge badge-assumed">
          {humanBoundary(run)}
        </span>
      </div>

      <div
        className="decision-columns"
        style={{
          marginTop: 22,
        }}
      >
        <div>
          <div className="eyebrow">
            REASONING SUMMARY
          </div>

          <p>
            {agentReasoning(run)}
          </p>

          <div className="eyebrow space-top">
            CAPABILITIES INVOKED
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginTop: 10,
            }}
          >
            {run.toolsCalled.map(
              (tool) => (
                <span
                  className="badge badge-live"
                  key={tool}
                >
                  {tool}
                </span>
              ),
            )}
          </div>

          {warnings.length >
            0 && (
            <>
              <div className="eyebrow space-top">
                RUNTIME WARNINGS
              </div>

              <p>
                {warnings.join(
                  " · ",
                )}
              </p>
            </>
          )}

          {evidenceRequests.length >
            0 && (
            <>
              <div className="eyebrow space-top">
                EVIDENCE REQUESTS
              </div>

              <p>
                {evidenceRequests.join(
                  " · ",
                )}
              </p>
            </>
          )}
        </div>

        <div className="decision-economics">
          {run.agent ===
          "REVENUE_INTELLIGENCE" ? (
            <>
              <div>
                <span>
                  COMMERCIAL PRIORITY
                </span>

                <p>
                  {commercialPriority}
                </p>
              </div>

              <div>
                <span>
                  GTM MOTION
                </span>

                <p>
                  {recommendedMotion}
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <span>
                  SELECTED
                </span>

                <p>
                  {selectedCount ??
                    "—"}{" "}
                  experiments
                </p>
              </div>

              <div>
                <span>
                  ALLOCATED BUDGET
                </span>

                <p>
                  {allocatedBudget !==
                  undefined
                    ? `$${allocatedBudget.toLocaleString(
                        "en-US",
                      )}`
                    : "—"}
                </p>
              </div>

              <div>
                <span>
                  PORTFOLIO EV / COST
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
            </>
          )}

          <div>
            <span>
              LATENCY
            </span>

            <p>
              {run.latencyMs ??
                "—"}{" "}
              ms
            </p>
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
            RUN ID
          </div>

          <p>
            {run.id}
          </p>
        </div>

        <div>
          <div className="eyebrow">
            CORRELATION
          </div>

          <p>
            {readString(
              run.input
                .correlationId,
            )}
          </p>
        </div>

        <div>
          <div className="eyebrow">
            CAUSATION
          </div>

          <p>
            {readString(
              run.input
                .causationId,
            )}
          </p>
        </div>
      </div>
    </article>
  );
}

export default async function AgentsPage() {
  const snapshot =
    await buildRevenueDemo();

  const humanReviewCount =
    snapshot.agentRuns.filter(
      (run) =>
        run.status ===
        "REQUIRES_HUMAN",
    ).length;

  const toolCount =
    snapshot.agentRuns.reduce(
      (
        total,
        run,
      ) =>
        total +
        run.toolsCalled.length,
      0,
    );

  const evidenceCount =
    snapshot.agentRuns.reduce(
      (
        total,
        run,
      ) =>
        total +
        run.evidenceIds.length,
      0,
    );

  const correlationCount =
    new Set(
      snapshot.agentRuns.map(
        (run) =>
          readString(
            run.input
              .correlationId,
          ),
      ),
    ).size;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <div className="eyebrow">
            INTELLIGENCE / AGENT RUNTIME
          </div>

          <h1>
            Multi-agent execution
          </h1>

          <p>
            Observable specialist agents
            operating through one control
            plane with explicit evidence,
            tools, confidence, lineage and
            human judgment boundaries.
          </p>
        </div>

        <div className="decision-summary">
          <strong>
            {
              snapshot
                .agentRuns
                .length
            }
          </strong>

          <span>
            EXECUTIONS IN TRACE
          </span>
        </div>
      </header>

      <div
        className="coming-card"
        style={{
          marginTop: 0,
          marginBottom: 28,
        }}
      >
        <span>
          SHARED AGENT RUNTIME
        </span>

        <p
          style={{
            marginTop: 7,
          }}
        >
          Revenue Intelligence and
          Experiment Analyst execute
          independently while sharing
          the same event bus, event
          store, agent-run repository
          and CEO decision layer.
        </p>
      </div>

      <section>
        <div className="metric-grid">
          <article className="metric-card">
            <div className="card-top">
              <span>
                Specialist agents
              </span>

              <span className="badge badge-live">
                ACTIVE
              </span>
            </div>

            <strong className="metric-value">
              {
                snapshot
                  .agentRuns
                  .length
              }
            </strong>

            <span className="metric-change">
              Shared runtime
            </span>

            <p>
              Domain agents execute
              independently rather than
              hiding inside one chatbot.
            </p>
          </article>

          <article className="metric-card">
            <div className="card-top">
              <span>
                Tool calls
              </span>

              <span className="badge badge-modeled">
                OBSERVED
              </span>
            </div>

            <strong className="metric-value">
              {toolCount}
            </strong>

            <span className="metric-change">
              Runtime capabilities
            </span>

            <p>
              Every declared capability
              is retained with its
              execution trace.
            </p>
          </article>

          <article className="metric-card">
            <div className="card-top">
              <span>
                Evidence refs
              </span>

              <span className="badge badge-public">
                TRACEABLE
              </span>
            </div>

            <strong className="metric-value">
              {evidenceCount}
            </strong>

            <span className="metric-change">
              Provenance links
            </span>

            <p>
              Agent outputs remain
              connected to supplied
              evidence.
            </p>
          </article>

          <article className="metric-card">
            <div className="card-top">
              <span>
                Human boundaries
              </span>

              <span className="badge badge-assumed">
                POLICY
              </span>
            </div>

            <strong className="metric-value">
              {humanReviewCount}
            </strong>

            <span className="metric-change">
              Approval required
            </span>

            <p>
              High-consequence actions
              stop before autonomous
              execution.
            </p>
          </article>
        </div>
      </section>

      <section>
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              EXECUTION TRACES
            </div>

            <h2>
              Agent runtime
            </h2>
          </div>

          <span className="muted">
            {correlationCount} CORRELATION CHAINS
          </span>
        </div>

        <div className="decision-list">
          {snapshot.agentRuns.map(
            (run, index) => (
              <AgentCard
                key={run.id}
                run={run}
                index={index}
              />
            ),
          )}
        </div>
      </section>

      <section>
        <div className="section-heading compact">
          <div>
            <div className="eyebrow">
              RUNTIME ARCHITECTURE
            </div>

            <h2>
              Observable by design
            </h2>
          </div>
        </div>

        <article className="decision-card">
          <div className="decision-economics">
            <div>
              <span>
                EVENT STORE
              </span>

              <p>
                {
                  snapshot
                    .telemetry
                    .eventCount
                }{" "}
                events
              </p>
            </div>

            <div>
              <span>
                AGENT RUNS
              </span>

              <p>
                {
                  snapshot
                    .telemetry
                    .agentRunCount
                }
              </p>
            </div>

            <div>
              <span>
                CORRELATION CHAINS
              </span>

              <p>
                {
                  snapshot
                    .telemetry
                    .correlationIds
                    .length
                }
              </p>
            </div>

            <div>
              <span>
                HUMAN REVIEWS
              </span>

              <p>
                {
                  snapshot
                    .telemetry
                    .humanReviewCount
                }
              </p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}