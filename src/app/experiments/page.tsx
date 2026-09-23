import type { CSSProperties } from "react";

import {
  demoExperimentEvaluations,
  demoExperimentPortfolio,
} from "@/data/demo/experiment-portfolio";

import {
  optimizePortfolio,
} from "@/domain/experiment-intelligence/portfolio-optimizer";

import type {
  ExperimentCandidate,
  ExperimentDecision,
  ExperimentEvaluation,
} from "@/domain/experiment-intelligence/types";

const portfolio = optimizePortfolio(
  demoExperimentPortfolio,
  {
    budget: 50_000,
    maxConcurrentExperiments: 3,

    owners: {
      Growth: 2,
      Revenue: 1,
      CEO: 1,
      Operations: 1,
    },
  },
);

const experimentById = new Map(
  demoExperimentPortfolio.map(
    (experiment) => [
      experiment.id,
      experiment,
    ],
  ),
);

const evaluationById = new Map(
  demoExperimentEvaluations.map(
    (evaluation) => [
      evaluation.experimentId,
      evaluation,
    ],
  ),
);

function money(value: number): string {
  const absolute = Math.abs(value);

  if (absolute >= 1_000_000) {
    return `$${(
      value / 1_000_000
    ).toFixed(2)}M`;
  }

  if (absolute >= 1_000) {
    return `$${Math.round(
      value / 1_000,
    )}K`;
  }

  return `$${Math.round(
    value,
  ).toLocaleString("en-US")}`;
}

function decisionTone(
  decision: ExperimentDecision,
): string {
  switch (decision) {
    case "RUN":
      return "#74e6a7";

    case "HOLD":
      return "#f4c56a";

    case "NEEDS_EVIDENCE":
      return "#75b9ff";

    case "KILL":
      return "#ff7d7d";
  }
}

function evidenceTone(
  type: string,
): string {
  switch (type) {
    case "INTERNAL":
      return "#74e6a7";

    case "CONNECTED":
      return "#75b9ff";

    case "PUBLIC":
      return "#c39cff";

    case "MODELED":
      return "#f4c56a";

    default:
      return "#9aa5b1";
  }
}

function cardStyle(): CSSProperties {
  return {
    background:
      "rgba(15, 19, 25, 0.78)",
    border:
      "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
  };
}

function labelStyle(): CSSProperties {
  return {
    fontSize: 10,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#7f8995",
    fontWeight: 700,
  };
}

function getExperiment(
  evaluation: ExperimentEvaluation,
): ExperimentCandidate {
  const experiment =
    experimentById.get(
      evaluation.experimentId,
    );

  if (!experiment) {
    throw new Error(
      `Missing experiment ${evaluation.experimentId}`,
    );
  }

  return experiment;
}

function ExperimentCard({
  evaluation,
  rank,
}: {
  evaluation: ExperimentEvaluation;
  rank: number;
}) {
  const experiment =
    getExperiment(evaluation);

  const selected =
    portfolio.selected.some(
      (item) =>
        item.experimentId ===
        experiment.id,
    );

  const deferred =
    portfolio.deferred.find(
      (item) =>
        item.experimentId ===
        experiment.id,
    );

  return (
    <article
      style={{
        ...cardStyle(),
        padding: 20,
        display: "grid",
        gap: 18,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: decisionTone(
            evaluation.decision,
          ),
          opacity: 0.8,
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          gap: 16,
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              ...labelStyle(),
              marginBottom: 8,
            }}
          >
            #{rank} ·{" "}
            {experiment.category}
          </div>

          <h3
            style={{
              margin: 0,
              fontSize: 17,
              lineHeight: 1.35,
              color: "#edf2f7",
            }}
          >
            {experiment.title}
          </h3>
        </div>

        <div
          style={{
            textAlign: "right",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              color: decisionTone(
                evaluation.decision,
              ),
              fontSize: 10,
              fontWeight: 800,
              letterSpacing:
                "0.08em",
            }}
          >
            {evaluation.decision.replace(
              "_",
              " ",
            )}
          </div>

          <div
            style={{
              fontSize: 24,
              fontWeight: 750,
              marginTop: 5,
            }}
          >
            {evaluation.score}
          </div>

          <div
            style={{
              fontSize: 9,
              color: "#727d89",
            }}
          >
            EXPERIMENT SCORE
          </div>
        </div>
      </div>

      <p
        style={{
          margin: 0,
          color: "#aeb8c3",
          fontSize: 13,
          lineHeight: 1.65,
        }}
      >
        {experiment.hypothesis}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
          gap: 8,
        }}
      >
        {[
          [
            "EXPECTED VALUE",
            money(
              evaluation.expectedValue,
            ),
          ],
          [
            "COST",
            money(
              experiment.estimatedCost,
            ),
          ],
          [
            "LEARNING",
            `${experiment.learningDays}d`,
          ],
          [
            "EVIDENCE",
            `${evaluation.evidenceQuality}/100`,
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              padding: "10px 9px",
              background:
                "rgba(255,255,255,0.025)",
              borderRadius: 8,
            }}
          >
            <div
              style={{
                ...labelStyle(),
                fontSize: 7,
              }}
            >
              {label}
            </div>

            <div
              style={{
                marginTop: 5,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
        }}
      >
        {experiment.evidence.map(
          (evidence) => (
            <span
              key={evidence.id}
              style={{
                fontSize: 9,
                padding: "5px 7px",
                borderRadius: 5,
                border:
                  `1px solid ${evidenceTone(
                    evidence.type,
                  )}44`,
                color: evidenceTone(
                  evidence.type,
                ),
                letterSpacing:
                  "0.05em",
              }}
            >
              {evidence.type} ·{" "}
              {evidence.confidence}%
            </span>
          ),
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: 12,
          borderTop:
            "1px solid rgba(255,255,255,0.06)",
          paddingTop: 14,
        }}
      >
        <div
          style={{
            color: "#7f8995",
            fontSize: 10,
          }}
        >
          OWNER ·{" "}
          <span
            style={{
              color: "#c7d0da",
            }}
          >
            {experiment.owner}
          </span>
        </div>

        {selected ? (
          <span
            style={{
              color: "#74e6a7",
              fontSize: 9,
              fontWeight: 800,
              letterSpacing:
                "0.07em",
            }}
          >
            ● ALLOCATED
          </span>
        ) : deferred ? (
          <span
            style={{
              color: "#87919c",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing:
                "0.06em",
            }}
          >
            DEFERRED ·{" "}
            {deferred.reason.replace(
              "_",
              " ",
            )}
          </span>
        ) : null}
      </div>
    </article>
  );
}

export default function Page() {
  const runCount =
    demoExperimentEvaluations.filter(
      (item) =>
        item.decision === "RUN",
    ).length;

  const holdCount =
    demoExperimentEvaluations.filter(
      (item) =>
        item.decision === "HOLD",
    ).length;

  const evidenceCount =
    demoExperimentEvaluations.filter(
      (item) =>
        item.decision ===
        "NEEDS_EVIDENCE",
    ).length;

  const killCount =
    demoExperimentEvaluations.filter(
      (item) =>
        item.decision === "KILL",
    ).length;

  const priority =
    portfolio.selected[0];

  const priorityEvaluation =
    priority
      ? evaluationById.get(
          priority.experimentId,
        )
      : undefined;

  const evidenceRequests =
    demoExperimentEvaluations.filter(
      (evaluation) =>
        evaluation.decision ===
        "NEEDS_EVIDENCE",
    );

  const blocked =
    demoExperimentEvaluations.filter(
      (evaluation) =>
        evaluation.decision ===
        "HOLD",
    );

  const killed =
    demoExperimentEvaluations.filter(
      (evaluation) =>
        evaluation.decision ===
        "KILL",
    );

  return (
    <div className="page">
      <div
        style={{
          maxWidth: 1500,
          margin: "0 auto",
          padding: "8px 4px 80px",
        }}
      >
        <header
          style={{
            marginBottom: 28,
          }}
        >
          <div
            className="eyebrow"
            style={{
              marginBottom: 12,
            }}
          >
            WARP / CONTROL ·
            EXPERIMENT INTELLIGENCE
          </div>

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "flex-end",
              gap: 30,
            }}
          >
            <div
              style={{
                maxWidth: 760,
              }}
            >
              <h1
                style={{
                  margin: "0 0 10px",
                  fontSize: 36,
                  letterSpacing:
                    "-0.035em",
                }}
              >
                Experiment Control
                Room
              </h1>

              <p
                style={{
                  margin: 0,
                  color: "#8f9aa6",
                  lineHeight: 1.6,
                  fontSize: 14,
                }}
              >
                Turn assumptions
                into evidence,
                allocate scarce
                execution capacity,
                and escalate only
                the decisions that
                require human
                judgment.
              </p>
            </div>

            <div
              style={{
                textAlign: "right",
              }}
            >
              <div
                style={{
                  ...labelStyle(),
                  marginBottom: 6,
                }}
              >
                SYSTEM
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: "#aab4bf",
                }}
              >
                DECISION ENGINE
                V1.0.0 · PORTFOLIO
                OPTIMIZER V1.0.0
              </div>
            </div>
          </div>
        </header>

        <section
          style={{
            ...cardStyle(),
            padding: 17,
            marginBottom: 18,
            border:
              "1px solid rgba(244,197,106,0.16)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                color: "#f4c56a",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing:
                  "0.08em",
              }}
            >
              MODELED
            </span>

            <p
              style={{
                margin: 0,
                fontSize: 11,
                lineHeight: 1.6,
                color: "#9ba6b1",
              }}
            >
              Deterministic
              demonstration
              portfolio. Impact,
              cost, baselines and
              targets are modeled
              inputs, not verified
              WarpBuild performance
              or customer data.
              Provenance is retained
              so weak assumptions can
              be replaced by measured
              evidence.
            </p>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(6, minmax(0, 1fr))",
            gap: 10,
            marginBottom: 18,
          }}
        >
          {[
            [
              "HYPOTHESES",
              demoExperimentEvaluations.length,
              "portfolio",
            ],
            [
              "RUN",
              runCount,
              "cleared",
            ],
            [
              "HOLD",
              holdCount,
              "blocked",
            ],
            [
              "NEEDS EVIDENCE",
              evidenceCount,
              "uncertain",
            ],
            [
              "KILL",
              killCount,
              "uneconomic",
            ],
            [
              "ALLOCATED",
              portfolio.selectedCount,
              `${money(
                portfolio.allocatedBudget,
              )} deployed`,
            ],
          ].map(
            ([label, value, detail]) => (
              <div
                key={label}
                style={{
                  ...cardStyle(),
                  padding: 15,
                }}
              >
                <div
                  style={{
                    ...labelStyle(),
                    fontSize: 7,
                  }}
                >
                  {label}
                </div>

                <div
                  style={{
                    marginTop: 7,
                    fontSize: 24,
                    fontWeight: 750,
                  }}
                >
                  {value}
                </div>

                <div
                  style={{
                    marginTop: 3,
                    fontSize: 9,
                    color: "#727d89",
                  }}
                >
                  {detail}
                </div>
              </div>
            ),
          )}
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1.55fr) minmax(300px, .65fr)",
            gap: 18,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              ...cardStyle(),
              padding: 22,
            }}
          >
            <div
              style={{
                ...labelStyle(),
                marginBottom: 18,
              }}
            >
              RECOMMENDED PORTFOLIO
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(4, minmax(0, 1fr))",
                gap: 10,
                marginBottom: 22,
              }}
            >
              {[
                [
                  "BUDGET",
                  money(
                    portfolio.totalBudget,
                  ),
                ],
                [
                  "ALLOCATED",
                  money(
                    portfolio.allocatedBudget,
                  ),
                ],
                [
                  "EXPECTED VALUE",
                  money(
                    portfolio.modeledExpectedValue,
                  ),
                ],
                [
                  "EV / COST",
                  `${portfolio.expectedPortfolioROI}x`,
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    padding: 13,
                    background:
                      "rgba(255,255,255,0.025)",
                    borderRadius: 9,
                  }}
                >
                  <div
                    style={{
                      ...labelStyle(),
                      fontSize: 7,
                    }}
                  >
                    {label}
                  </div>

                  <div
                    style={{
                      marginTop: 7,
                      fontSize: 18,
                      fontWeight: 750,
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gap: 9,
              }}
            >
              {portfolio.selected.map(
                (item, index) => (
                  <div
                    key={
                      item.experimentId
                    }
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "34px minmax(0, 1fr) auto",
                      gap: 12,
                      alignItems: "center",
                      padding: "13px 14px",
                      border:
                        "1px solid rgba(116,230,167,0.12)",
                      background:
                        "rgba(116,230,167,0.025)",
                      borderRadius: 9,
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        display: "grid",
                        placeItems:
                          "center",
                        borderRadius: 7,
                        background:
                          "rgba(116,230,167,0.08)",
                        color: "#74e6a7",
                        fontSize: 10,
                        fontWeight: 800,
                      }}
                    >
                      {index + 1}
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {item.title}
                      </div>

                      <div
                        style={{
                          marginTop: 4,
                          color: "#7f8995",
                          fontSize: 9,
                        }}
                      >
                        {item.owner} ·{" "}
                        {item.learningDays}
                        d to learn ·{" "}
                        {money(
                          item.estimatedCost,
                        )}{" "}
                        cost
                      </div>
                    </div>

                    <div
                      style={{
                        textAlign: "right",
                      }}
                    >
                      <div
                        style={{
                          color: "#74e6a7",
                          fontSize: 12,
                          fontWeight: 750,
                        }}
                      >
                        {money(
                          item.expectedValue,
                        )}
                      </div>

                      <div
                        style={{
                          color: "#6f7984",
                          fontSize: 8,
                        }}
                      >
                        EXPECTED VALUE
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          <aside
            style={{
              ...cardStyle(),
              padding: 22,
              border:
                "1px solid rgba(255,125,125,0.14)",
            }}
          >
            <div
              style={{
                color: "#ff7d7d",
                fontSize: 9,
                fontWeight: 800,
                letterSpacing:
                  "0.1em",
                marginBottom: 14,
              }}
            >
              CEO REQUIRED
            </div>

            <h2
              style={{
                margin: "0 0 10px",
                fontSize: 20,
                lineHeight: 1.3,
              }}
            >
              Approve experiment
              portfolio
            </h2>

            <p
              style={{
                margin: "0 0 18px",
                color: "#909ba6",
                fontSize: 11,
                lineHeight: 1.65,
              }}
            >
              Seven hypotheses have
              been scored, gated and
              optimized against a{" "}
              {money(
                portfolio.totalBudget,
              )}{" "}
              budget and a
              three-experiment
              concurrency limit.
            </p>

            {priority ? (
              <div
                style={{
                  padding: 14,
                  background:
                    "rgba(255,255,255,0.025)",
                  borderRadius: 9,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    ...labelStyle(),
                    fontSize: 7,
                  }}
                >
                  PRIORITY EXPERIMENT
                </div>

                <div
                  style={{
                    marginTop: 7,
                    fontSize: 12,
                    fontWeight: 700,
                    lineHeight: 1.45,
                  }}
                >
                  {priority.title}
                </div>

                {priorityEvaluation ? (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 9,
                      color: "#7f8995",
                    }}
                  >
                    Score{" "}
                    {
                      priorityEvaluation.score
                    }
                    /100 · Evidence{" "}
                    {
                      priorityEvaluation.evidenceQuality
                    }
                    /100
                  </div>
                ) : null}
              </div>
            ) : null}

            <div
              style={{
                padding: 14,
                borderRadius: 9,
                background:
                  "rgba(244,197,106,0.04)",
                border:
                  "1px solid rgba(244,197,106,0.1)",
              }}
            >
              <div
                style={{
                  ...labelStyle(),
                  color: "#f4c56a",
                  fontSize: 7,
                }}
              >
                HUMAN BOUNDARY
              </div>

              <p
                style={{
                  margin: "7px 0 0",
                  color: "#a8b1bb",
                  fontSize: 10,
                  lineHeight: 1.55,
                }}
              >
                WARP / CONTROL may
                recommend allocation.
                It does not
                autonomously spend
                budget or launch
                experiments.
              </p>
            </div>
          </aside>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1fr) 320px",
            gap: 18,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "flex-end",
                gap: 20,
                marginBottom: 12,
              }}
            >
              <div>
                <div
                  style={{
                    ...labelStyle(),
                    marginBottom: 5,
                  }}
                >
                  DECISION ENGINE
                </div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: 20,
                  }}
                >
                  Ranked hypotheses
                </h2>
              </div>

              <div
                style={{
                  color: "#68727d",
                  fontSize: 8,
                  textAlign: "right",
                }}
              >
                IMPACT · CONFIDENCE ·
                STRATEGY · EVIDENCE ·
                LEARNING ·
                REVERSIBILITY ·
                EFFICIENCY
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: 12,
              }}
            >
              {demoExperimentEvaluations.map(
                (
                  evaluation,
                  index,
                ) => (
                  <ExperimentCard
                    key={
                      evaluation.experimentId
                    }
                    evaluation={
                      evaluation
                    }
                    rank={
                      index + 1
                    }
                  />
                ),
              )}
            </div>
          </div>

          <aside
            style={{
              display: "grid",
              gap: 12,
              alignContent: "start",
            }}
          >
            <div
              style={{
                ...cardStyle(),
                padding: 18,
              }}
            >
              <div
                style={{
                  ...labelStyle(),
                  marginBottom: 13,
                }}
              >
                ALLOCATION
                CONSTRAINTS
              </div>

              {[
                [
                  "Budget",
                  money(
                    portfolio.totalBudget,
                  ),
                ],
                [
                  "Concurrent slots",
                  "3",
                ],
                [
                  "Growth capacity",
                  "2",
                ],
                [
                  "Revenue capacity",
                  "1",
                ],
                [
                  "CEO capacity",
                  "1",
                ],
                [
                  "Operations capacity",
                  "1",
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    gap: 12,
                    padding: "9px 0",
                    borderBottom:
                      "1px solid rgba(255,255,255,0.05)",
                    fontSize: 10,
                  }}
                >
                  <span
                    style={{
                      color: "#7f8995",
                    }}
                  >
                    {label}
                  </span>

                  <strong>
                    {value}
                  </strong>
                </div>
              ))}
            </div>

            <div
              style={{
                ...cardStyle(),
                padding: 18,
              }}
            >
              <div
                style={{
                  ...labelStyle(),
                  marginBottom: 13,
                }}
              >
                EVIDENCE REQUESTS
              </div>

              {evidenceRequests.map(
                (evaluation) => {
                  const experiment =
                    getExperiment(
                      evaluation,
                    );

                  return (
                    <div
                      key={
                        evaluation.experimentId
                      }
                      style={{
                        padding: "10px 0",
                        borderBottom:
                          "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          lineHeight: 1.4,
                        }}
                      >
                        {experiment.title}
                      </div>

                      <div
                        style={{
                          marginTop: 5,
                          color: "#75b9ff",
                          fontSize: 9,
                        }}
                      >
                        Evidence{" "}
                        {
                          evaluation.evidenceQuality
                        }
                        /100
                      </div>

                      <div
                        style={{
                          marginTop: 5,
                          color: "#7f8995",
                          fontSize: 9,
                          lineHeight: 1.45,
                        }}
                      >
                        Replace weak
                        provenance with
                        connected or
                        internal evidence
                        before allocation.
                      </div>
                    </div>
                  );
                },
              )}
            </div>

            <div
              style={{
                ...cardStyle(),
                padding: 18,
              }}
            >
              <div
                style={{
                  ...labelStyle(),
                  marginBottom: 13,
                }}
              >
                DECISION GATES
              </div>

              {[
                [
                  "RUN",
                  runCount,
                  "#74e6a7",
                  "Clears score, evidence and dependency gates.",
                ],
                [
                  "HOLD",
                  holdCount,
                  "#f4c56a",
                  "Blocked by dependency or measurement readiness.",
                ],
                [
                  "NEEDS EVIDENCE",
                  evidenceCount,
                  "#75b9ff",
                  "Potential exists but provenance is insufficient.",
                ],
                [
                  "KILL",
                  killCount,
                  "#ff7d7d",
                  "Modeled economics do not justify execution.",
                ],
              ].map(
                ([
                  decision,
                  count,
                  tone,
                  description,
                ]) => (
                  <div
                    key={decision}
                    style={{
                      padding: "10px 0",
                      borderBottom:
                        "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        gap: 10,
                      }}
                    >
                      <strong
                        style={{
                          color:
                            String(
                              tone,
                            ),
                          fontSize: 9,
                        }}
                      >
                        {decision}
                      </strong>

                      <span
                        style={{
                          fontSize: 9,
                          color: "#aab4bf",
                        }}
                      >
                        {count}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: 5,
                        fontSize: 9,
                        lineHeight: 1.45,
                        color: "#727d89",
                      }}
                    >
                      {description}
                    </div>
                  </div>
                ),
              )}
            </div>

            <div
              style={{
                ...cardStyle(),
                padding: 18,
              }}
            >
              <div
                style={{
                  ...labelStyle(),
                  marginBottom: 13,
                }}
              >
                SYSTEM OUTCOME
              </div>

              <div
                style={{
                  fontSize: 10,
                  lineHeight: 1.6,
                  color: "#aab4bf",
                }}
              >
                <strong
                  style={{
                    color: "#74e6a7",
                  }}
                >
                  {portfolio.selectedCount}
                </strong>{" "}
                experiments allocated.
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 10,
                  lineHeight: 1.6,
                  color: "#aab4bf",
                }}
              >
                <strong
                  style={{
                    color: "#75b9ff",
                  }}
                >
                  {evidenceRequests.length}
                </strong>{" "}
                require stronger
                evidence.
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 10,
                  lineHeight: 1.6,
                  color: "#aab4bf",
                }}
              >
                <strong
                  style={{
                    color: "#f4c56a",
                  }}
                >
                  {blocked.length}
                </strong>{" "}
                blocked by gates.
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 10,
                  lineHeight: 1.6,
                  color: "#aab4bf",
                }}
              >
                <strong
                  style={{
                    color: "#ff7d7d",
                  }}
                >
                  {killed.length}
                </strong>{" "}
                removed from execution.
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}