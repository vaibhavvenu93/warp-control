import {
  buildRevenueDemo,
} from "@/services/control-plane";

function money(
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

export default async function GTMPage() {
  const snapshot =
    await buildRevenueDemo();

  const {
    account,
    opportunity,
    warpScore,
    signals,
    events,
  } = snapshot;

  if (!opportunity) {
    return (
      <div className="page">
        <section className="placeholder-page">
          <div className="eyebrow">
            GTM ENGINE
          </div>

          <h1>
            No opportunity generated
          </h1>

          <p className="placeholder-lead">
            The control plane did not
            produce a commercial
            opportunity for this account.
          </p>
        </section>
      </div>
    );
  }

  const probabilityPercent =
    opportunity.probability.toFixed(2);

  const relevantEvidence =
    snapshot.evidence.filter(
      (item) =>
        opportunity.evidenceIds.includes(
          item.id,
        ),
    );

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <div className="eyebrow">
            REVENUE / GTM ENGINE
          </div>

          <h1>
            Signal → Revenue
          </h1>

          <p>
            The GTM engine converts
            account intelligence into an
            explainable commercial
            hypothesis, recommended
            motion and execution path.
          </p>
        </div>

        <div className="decision-summary">
          <strong>
            {warpScore.score}
          </strong>

          <span>
            ACCOUNT WARPSCORE
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
          DETERMINISTIC DEMO
        </span>

        <p
          style={{
            marginTop: 7,
          }}
        >
          {
            snapshot.scenario
              .disclaimer
          }
        </p>
      </div>

      <section>
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              GENERATED OPPORTUNITY
            </div>

            <h2>
              {account.name}
            </h2>
          </div>

          <span className="badge badge-live">
            ENGINE GENERATED
          </span>
        </div>

        <article className="decision-card">
          <div className="decision-card-header">
            <div>
              <div className="signal-meta">
                <span>
                  {
                    opportunity.recommendedMotion
                  }
                </span>

                <span>•</span>

                <span>
                  SCORE{" "}
                  {opportunity.score}
                </span>
              </div>

              <h2>
                {
                  opportunity.hypothesis
                }
              </h2>
            </div>

            <div className="confidence-ring">
              <strong>
                {opportunity.confidence}%
              </strong>

              <span>
                OPPORTUNITY CONFIDENCE
              </span>
            </div>
          </div>

          <div className="decision-columns">
            <div>
              <div className="eyebrow">
                PROBLEM
              </div>

              <p>
                {opportunity.problem}
              </p>

              <div className="eyebrow space-top">
                RECOMMENDED MOTION
              </div>

              <h3>
                {
                  opportunity.recommendedMotion
                }
              </h3>

              <p>
                The motion is selected
                programmatically from
                WarpScore, buying intent,
                engineering scale,
                product usage and account
                state.
              </p>
            </div>

            <div className="decision-economics">
              <div>
                <span>
                  ESTIMATED ACV
                </span>

                <p>
                  {money(
                    opportunity.estimatedACV,
                  )}
                </p>
              </div>

              <div>
                <span>
                  WIN PROBABILITY
                </span>

                <p>
                  {probabilityPercent}%
                </p>
              </div>

              <div>
                <span>
                  EXPECTED VALUE
                </span>

                <p>
                  {money(
                    opportunity.expectedValue,
                  )}
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
              SIGNAL → ACCOUNT → PROBLEM → REVENUE
            </div>

            <h2>
              Commercial reasoning surface
            </h2>
          </div>

          <span className="muted">
            {
              opportunity.evidenceIds
                .length
            }{" "}
            EVIDENCE REFERENCES
          </span>
        </div>

        <div className="metric-grid">
          <article className="metric-card">
            <div className="card-top">
              <span>
                Account
              </span>

              <span className="badge badge-public">
                INPUT
              </span>
            </div>

            <strong className="metric-value">
              {account.name}
            </strong>

            <span className="metric-change">
              {
                account.engineering
                  .ciProvider
              }
            </span>

            <p>
              {
                account.engineering
                  .estimatedDevelopers
              }{" "}
              estimated developers
              across{" "}
              {
                account.engineering
                  .repositories
              }{" "}
              repositories.
            </p>
          </article>

          <article className="metric-card">
            <div className="card-top">
              <span>
                Qualification
              </span>

              <span className="badge badge-live">
                COMPUTED
              </span>
            </div>

            <strong className="metric-value">
              {warpScore.score}
            </strong>

            <span className="metric-change">
              {
                warpScore.classification
              }
            </span>

            <p>
              WarpScore confidence{" "}
              {warpScore.confidence}%.
            </p>
          </article>

          <article className="metric-card">
            <div className="card-top">
              <span>
                Signal density
              </span>

              <span className="badge badge-modeled">
                ENGINE
              </span>
            </div>

            <strong className="metric-value">
              {signals.length}
            </strong>

            <span className="metric-change">
              Active signals
            </span>

            <p>
              CI pain, AI adoption,
              engineering intensity and
              commercial intent are
              evaluated together.
            </p>
          </article>

          <article className="metric-card">
            <div className="card-top">
              <span>
                Expected value
              </span>

              <span className="badge badge-modeled">
                MODELED
              </span>
            </div>

            <strong className="metric-value">
              {money(
                opportunity.expectedValue,
              )}
            </strong>

            <span className="metric-change">
              ACV × probability
            </span>

            <p>
              Commercial prioritization
              without pretending modeled
              economics are booked
              revenue.
            </p>
          </article>
        </div>
      </section>

      <section>
        <div className="section-heading compact">
          <div>
            <div className="eyebrow">
              SUPPORTING INTELLIGENCE
            </div>

            <h2>
              Evidence behind the motion
            </h2>
          </div>

          <span className="muted">
            PROVENANCE PRESERVED
          </span>
        </div>

        <div className="decision-list">
          {relevantEvidence.map(
            (item) => (
              <article
                className="decision-card"
                key={item.id}
                style={{
                  padding: 17,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "flex-start",
                    gap: 24,
                  }}
                >
                  <div>
                    <span
                      className={`badge ${
                        item.type ===
                        "PUBLIC"
                          ? "badge-public"
                          : item.type ===
                              "ASSUMED"
                            ? "badge-assumed"
                            : "badge-modeled"
                      }`}
                    >
                      {item.type}
                    </span>

                    <h3
                      style={{
                        margin:
                          "10px 0 5px",
                      }}
                    >
                      {item.source}
                    </h3>

                    <p
                      style={{
                        margin: 0,
                      }}
                    >
                      {item.claim}
                    </p>
                  </div>

                  <div className="confidence-ring">
                    <strong>
                      {
                        item.confidence
                      }
                      %
                    </strong>

                    <span>
                      CONFIDENCE
                    </span>
                  </div>
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
              EXECUTION TRACE
            </div>

            <h2>
              Revenue event chain
            </h2>
          </div>

          <span className="muted">
            CORRELATION{" "}
            {
              snapshot.telemetry
                .correlationId
            }
          </span>
        </div>

        <div className="decision-list">
          {events.map(
            (event, index) => (
              <article
                className="decision-card"
                key={event.id}
                style={{
                  padding: 16,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "45px minmax(220px, 1fr) 130px 130px",
                    gap: 18,
                    alignItems: "center",
                  }}
                >
                  <div className="eyebrow">
                    {String(
                      index + 1,
                    ).padStart(2, "0")}
                  </div>

                  <div>
                    <h3
                      style={{
                        margin: 0,
                      }}
                    >
                      {event.type}
                    </h3>
                  </div>

                  <span className="muted">
                    {event.source}
                  </span>

                  <span className="muted">
                    {event.aggregateType}
                  </span>
                </div>
              </article>
            ),
          )}
        </div>
      </section>
    </div>
  );
}