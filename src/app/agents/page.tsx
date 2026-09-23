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

function readBoolean(
  value: unknown,
): boolean {
  return value === true;
}

function statusClass(
  status: AgentRun["status"],
): string {
  if (
    status === "COMPLETED"
  ) {
    return "badge badge-live";
  }

  if (
    status ===
    "REQUIRES_HUMAN"
  ) {
    return "badge badge-assumed";
  }

  if (status === "FAILED") {
    return "badge badge-assumed";
  }

  return "badge badge-modeled";
}

export default async function AgentsPage() {
  const snapshot =
    await buildRevenueDemo();

  const run =
    snapshot.agentRuns[0];

  if (!run) {
    return (
      <div className="page">
        <section className="placeholder-page">
          <div className="eyebrow">
            AGENT RUNTIME
          </div>

          <h1>
            No agent execution
          </h1>

          <p className="placeholder-lead">
            No agent run was produced
            by the current control-plane
            scenario.
          </p>
        </section>
      </div>
    );
  }

  const output =
    run.output ?? {};

  const reasoningSummary =
    readString(
      output.reasoningSummary,
      "No reasoning summary returned.",
    );

  const nextAction =
    readString(
      output.nextAction,
      "No action returned.",
    );

  const approvalReason =
    readString(
      output.approvalReason,
      "No additional approval reason.",
    );

  const priority =
    readString(
      output.commercialPriority,
      "—",
    );

  const motion =
    readString(
      output.recommendedMotion,
      "—",
    );

  const requiresHumanReview =
    readBoolean(
      output.requiresHumanReview,
    );

  const warnings =
    Array.isArray(output.warnings)
      ? output.warnings.filter(
          (
            warning,
          ): warning is string =>
            typeof warning ===
            "string",
        )
      : [];

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <div className="eyebrow">
            INTELLIGENCE / AGENT RUNTIME
          </div>

          <h1>
            Agent execution
          </h1>

          <p>
            Observable AI execution with
            explicit inputs, evidence,
            tools, confidence, latency,
            output and human judgment
            boundaries.
          </p>
        </div>

        <div className="decision-summary">
          <strong>
            {snapshot.agentRuns.length}
          </strong>

          <span>
            EXECUTION IN TRACE
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
          AGENT POLICY
        </span>

        <p
          style={{
            marginTop: 7,
          }}
        >
          Agents may research, score,
          synthesize and recommend.
          High-consequence commercial
          actions remain visible to a
          human before execution.
        </p>
      </div>

      <section>
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              EXECUTION RECORD
            </div>

            <h2>
              {run.agent}
            </h2>
          </div>

          <span
            className={statusClass(
              run.status,
            )}
          >
            {run.status}
          </span>
        </div>

        <article className="decision-card">
          <div className="decision-card-header">
            <div>
              <div className="signal-meta">
                <span>
                  TRIGGER{" "}
                  {run.trigger}
                </span>

                <span>•</span>

                <span>
                  RUN {run.id}
                </span>
              </div>

              <h2>
                {nextAction}
              </h2>
            </div>

            <div className="confidence-ring">
              <strong>
                {run.confidence ?? "—"}
                {run.confidence !==
                undefined
                  ? "%"
                  : ""}
              </strong>

              <span>
                AGENT CONFIDENCE
              </span>
            </div>
          </div>

          <div className="decision-columns">
            <div>
              <div className="eyebrow">
                REASONING SUMMARY
              </div>

              <p>
                {reasoningSummary}
              </p>

              <div className="eyebrow space-top">
                HUMAN REVIEW
              </div>

              <h3>
                {requiresHumanReview
                  ? "Required before execution"
                  : "Not required"}
              </h3>

              <p>
                {approvalReason}
              </p>
            </div>

            <div className="decision-economics">
              <div>
                <span>
                  COMMERCIAL PRIORITY
                </span>

                <p>{priority}</p>
              </div>

              <div>
                <span>
                  GTM MOTION
                </span>

                <p>{motion}</p>
              </div>

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
        </article>
      </section>

      <section>
        <div className="section-heading compact">
          <div>
            <div className="eyebrow">
              OBSERVABILITY
            </div>

            <h2>
              Runtime telemetry
            </h2>
          </div>

          <span className="muted">
            CORRELATION PRESERVED
          </span>
        </div>

        <div className="metric-grid">
          <article className="metric-card">
            <div className="card-top">
              <span>
                Status
              </span>

              <span
                className={statusClass(
                  run.status,
                )}
              >
                LIVE TRACE
              </span>
            </div>

            <strong
              className="metric-value"
              style={{
                fontSize: 20,
              }}
            >
              {run.status}
            </strong>

            <span className="metric-change">
              Policy evaluated
            </span>

            <p>
              Execution state is
              persisted by the runtime.
            </p>
          </article>

          <article className="metric-card">
            <div className="card-top">
              <span>
                Tools
              </span>

              <span className="badge badge-modeled">
                OBSERVED
              </span>
            </div>

            <strong className="metric-value">
              {
                run.toolsCalled
                  .length
              }
            </strong>

            <span className="metric-change">
              Recorded calls
            </span>

            <p>
              Tool usage is retained
              with the agent run rather
              than hidden inside a
              chatbot.
            </p>
          </article>

          <article className="metric-card">
            <div className="card-top">
              <span>
                Evidence
              </span>

              <span className="badge badge-public">
                TRACEABLE
              </span>
            </div>

            <strong className="metric-value">
              {
                run.evidenceIds
                  .length
              }
            </strong>

            <span className="metric-change">
              Evidence IDs
            </span>

            <p>
              Outputs can be traced back
              to evidence supplied to
              the execution context.
            </p>
          </article>

          <article className="metric-card">
            <div className="card-top">
              <span>
                Human boundary
              </span>

              <span className="badge badge-assumed">
                POLICY
              </span>
            </div>

            <strong
              className="metric-value"
              style={{
                fontSize: 20,
              }}
            >
              {requiresHumanReview
                ? "REVIEW"
                : "AUTONOMOUS"}
            </strong>

            <span className="metric-change">
              Judgment boundary
            </span>

            <p>
              High-consequence actions
              can stop for CEO or
              operator approval.
            </p>
          </article>
        </div>
      </section>

      <section>
        <div className="section-heading compact">
          <div>
            <div className="eyebrow">
              TOOL TRACE
            </div>

            <h2>
              Capabilities invoked
            </h2>
          </div>

          <span className="muted">
            {
              run.toolsCalled
                .length
            }{" "}
            TOOLS
          </span>
        </div>

        <div className="decision-list">
          {run.toolsCalled.map(
            (tool, index) => (
              <article
                className="decision-card"
                key={tool}
                style={{
                  padding: 16,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "50px minmax(220px, 1fr) 130px",
                    alignItems:
                      "center",
                    gap: 18,
                  }}
                >
                  <div className="eyebrow">
                    {String(
                      index + 1,
                    ).padStart(2, "0")}
                  </div>

                  <h3
                    style={{
                      margin: 0,
                    }}
                  >
                    {tool}
                  </h3>

                  <span className="badge badge-live">
                    CALLED
                  </span>
                </div>
              </article>
            ),
          )}
        </div>
      </section>

      <section>
        <div className="section-heading compact">
          <div>
            <div className="eyebrow">
              EXECUTION CONTEXT
            </div>

            <h2>
              Provenance & lineage
            </h2>
          </div>
        </div>

        <article className="decision-card">
          <div className="decision-economics">
            <div>
              <span>
                CORRELATION ID
              </span>

              <p>
                {readString(
                  run.input
                    .correlationId,
                )}
              </p>
            </div>

            <div>
              <span>
                CAUSATION ID
              </span>

              <p>
                {readString(
                  run.input
                    .causationId,
                )}
              </p>
            </div>

            <div>
              <span>
                ACCOUNT ID
              </span>

              <p>
                {readString(
                  run.input
                    .accountId,
                )}
              </p>
            </div>

            <div>
              <span>
                OPPORTUNITY ID
              </span>

              <p>
                {readString(
                  run.input
                    .opportunityId,
                )}
              </p>
            </div>
          </div>
        </article>
      </section>

      {warnings.length > 0 && (
        <section>
          <div className="section-heading compact">
            <div>
              <div className="eyebrow">
                RUNTIME WARNINGS
              </div>

              <h2>
                Agent warnings
              </h2>
            </div>
          </div>

          <div className="decision-list">
            {warnings.map(
              (warning) => (
                <article
                  className="decision-card"
                  key={warning}
                  style={{
                    padding: 16,
                  }}
                >
                  <span className="badge badge-assumed">
                    WARNING
                  </span>

                  <p
                    style={{
                      margin:
                        "10px 0 0",
                    }}
                  >
                    {warning}
                  </p>
                </article>
              ),
            )}
          </div>
        </section>
      )}
    </div>
  );
}