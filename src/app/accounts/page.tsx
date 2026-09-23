import {
  EvidenceRef,
  Signal,
} from "@/domain/types";

import {
  buildRevenueDemo,
} from "@/services/control-plane";

function formatNumber(
  value?: number,
): string {
  if (value === undefined) {
    return "—";
  }

  return new Intl.NumberFormat(
    "en-US",
  ).format(value);
}

function evidenceClass(
  type: EvidenceRef["type"],
): string {
  switch (type) {
    case "PUBLIC":
      return "badge badge-public";

    case "CONNECTED":
    case "INTERNAL":
      return "badge badge-connected";

    case "MODELED":
      return "badge badge-modeled";

    case "ASSUMED":
      return "badge badge-assumed";
  }
}

function signalStrength(
  signal: Signal,
): string {
  if (signal.strength >= 85) {
    return "severity-high";
  }

  if (signal.strength >= 70) {
    return "severity-medium";
  }

  return "severity-low";
}

export default async function AccountsPage() {
  const snapshot =
    await buildRevenueDemo();

  const {
    account,
    warpScore,
    signals,
    evidence,
  } = snapshot;

  const strongestComponents =
    [...warpScore.components].sort(
      (a, b) =>
        b.contribution -
        a.contribution,
    );

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <div className="eyebrow">
            REVENUE INTELLIGENCE / ACCOUNT 360
          </div>

          <h1>{account.name}</h1>

          <p>
            An explainable account model combining
            engineering intensity, CI pressure, AI
            adoption, commercial fit and buying
            signals into one decision surface.
          </p>
        </div>

        <div className="decision-summary">
          <strong>
            {warpScore.score}
          </strong>

          <span>
            WARPSCORE / 100
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
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            gap: 20,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div>
            <span>
              {snapshot.scenario.mode}
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

          <span className="badge badge-modeled">
            PROVENANCE ENFORCED
          </span>
        </div>
      </div>

      <section>
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              ACCOUNT STATE
            </div>

            <h2>
              Qualification snapshot
            </h2>
          </div>

          <span className="muted">
            WARP SCORE ENGINE v
            {warpScore.version}
          </span>
        </div>

        <div className="metric-grid">
          <article className="metric-card">
            <div className="card-top">
              <span>
                WarpScore
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
              Weighted across seven
              explainable scoring
              dimensions.
            </p>
          </article>

          <article className="metric-card">
            <div className="card-top">
              <span>
                Score confidence
              </span>

              <span className="badge badge-modeled">
                ENGINE
              </span>
            </div>

            <strong className="metric-value">
              {warpScore.confidence}%
            </strong>

            <span className="metric-change">
              Evidence weighted
            </span>

            <p>
              Confidence changes with
              source reliability, signal
              confidence and completeness.
            </p>
          </article>

          <article className="metric-card">
            <div className="card-top">
              <span>
                Estimated developers
              </span>

              <span className="badge badge-modeled">
                MODELED
              </span>
            </div>

            <strong className="metric-value">
              {formatNumber(
                account.engineering
                  .estimatedDevelopers,
              )}
            </strong>

            <span className="metric-change">
              {
                account.engineering
                  .repositories ?? "—"
              }{" "}
              repositories
            </span>

            <p>
              Engineering surface used
              by the qualification model.
            </p>
          </article>

          <article className="metric-card">
            <div className="card-top">
              <span>
                Active signals
              </span>

              <span className="badge badge-public">
                TRACEABLE
              </span>
            </div>

            <strong className="metric-value">
              {signals.length}
            </strong>

            <span className="metric-change">
              {evidence.length} evidence
              objects
            </span>

            <p>
              Every signal retains its
              underlying evidence IDs.
            </p>
          </article>
        </div>
      </section>

      <section>
        <div className="section-heading compact">
          <div>
            <div className="eyebrow">
              WARPSCORE
            </div>

            <h2>
              Score decomposition
            </h2>
          </div>

          <span className="muted">
            SCORE → WEIGHT → CONTRIBUTION
          </span>
        </div>

        <div className="decision-list">
          {strongestComponents.map(
            (component) => (
              <article
                className="decision-card"
                key={component.key}
                style={{
                  padding: 17,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "minmax(220px, 1fr) 100px 100px 120px",
                    gap: 20,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div className="eyebrow">
                      {component.key}
                    </div>

                    <h3
                      style={{
                        margin:
                          "6px 0 0",
                      }}
                    >
                      {component.label}
                    </h3>
                  </div>

                  <div>
                    <div className="eyebrow">
                      RAW SCORE
                    </div>

                    <strong>
                      {
                        component.rawValue
                      }
                    </strong>
                  </div>

                  <div>
                    <div className="eyebrow">
                      WEIGHT
                    </div>

                    <strong>
                      {Math.round(
                        component.weight *
                          100,
                      )}
                      %
                    </strong>
                  </div>

                  <div>
                    <div className="eyebrow">
                      CONTRIBUTION
                    </div>

                    <strong>
                      {
                        component.contribution
                      }
                    </strong>
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
              SIGNAL INTELLIGENCE
            </div>

            <h2>
              Why this account moved
            </h2>
          </div>

          <span className="muted">
            {signals.length} SIGNALS
          </span>
        </div>

        <div className="signal-list">
          {signals.map((signal) => (
            <article
              className="signal-card"
              key={signal.id}
            >
              <div
                className={`severity ${signalStrength(
                  signal,
                )}`}
              />

              <div className="signal-main">
                <div className="signal-meta">
                  <span>
                    {signal.category}
                  </span>

                  <span>•</span>

                  <span>
                    STRENGTH{" "}
                    {signal.strength}
                  </span>

                  <span>•</span>

                  <span>
                    CONFIDENCE{" "}
                    {signal.confidence}%
                  </span>
                </div>

                <h3>
                  {signal.title}
                </h3>

                <p>
                  {signal.description}
                </p>

                <div className="signal-footer">
                  <span>
                    {
                      signal.evidenceIds
                        .length
                    }{" "}
                    evidence reference
                    {signal.evidenceIds
                      .length === 1
                      ? ""
                      : "s"}
                  </span>

                  <span>
                    {signal.direction}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="section-heading compact">
          <div>
            <div className="eyebrow">
              EVIDENCE GRAPH
            </div>

            <h2>
              Provenance ledger
            </h2>
          </div>

          <span className="muted">
            NO UNLABELED CLAIMS
          </span>
        </div>

        <div className="decision-list">
          {evidence.map((item) => (
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
                    className={evidenceClass(
                      item.type,
                    )}
                  >
                    {item.type}
                  </span>

                  <h3
                    style={{
                      margin:
                        "11px 0 5px",
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

                <div
                  className="confidence-ring"
                >
                  <strong>
                    {item.confidence}%
                  </strong>

                  <span>
                    SOURCE CONFIDENCE
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}