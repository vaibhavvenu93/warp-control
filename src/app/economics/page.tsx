import { Fragment } from "react";

import {
  demoEconomicAssumptions,
  demoEconomicResult,
  demoEconomicSensitivity,
} from "@/data/demo/economics-scenario";

function money(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function compactMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function number(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function decimal(
  value: number,
  digits = 1,
): string {
  return value.toFixed(digits);
}

function percentageInput(
  value: number,
): string {
  return `${decimal(value * 100, 0)}%`;
}

const panelStyle = {
  border:
    "1px solid rgba(255,255,255,0.09)",
  borderRadius: 14,
  background:
    "rgba(255,255,255,0.018)",
} as const;

const insetStyle = {
  border:
    "1px solid rgba(255,255,255,0.07)",
  borderRadius: 10,
  background:
    "rgba(255,255,255,0.018)",
} as const;

const labelStyle = {
  fontSize: 11,
  letterSpacing: "0.12em",
  color: "#7f8b99",
  textTransform:
    "uppercase" as const,
  fontWeight: 700,
} as const;

const mutedStyle = {
  color: "#8f9aa8",
} as const;

export default function EconomicsPage() {
  const {
    baseline,
    scenario,
    commercial,
    assumptions,
    methodologyVersion,
  } = demoEconomicResult;

  const economicCasePositive =
    commercial.customerNetAnnualValue > 0 &&
    commercial.roiMultiple > 1;

  const lowestConfidence =
    [...demoEconomicAssumptions]
      .sort(
        (a, b) =>
          a.confidence - b.confidence,
      )
      .slice(0, 3);

  return (
    <div className="page">
      {/* EXECUTIVE HERO */}

      <section
        style={{
          ...panelStyle,
          padding: 28,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            gap: 32,
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              maxWidth: 760,
            }}
          >
            <div className="eyebrow">
              CONTROL / ECONOMICS
            </div>

            <h1
              style={{
                marginTop: 10,
                marginBottom: 10,
              }}
            >
              CI Economics Console
            </h1>

            <p
              style={{
                margin: 0,
                maxWidth: 720,
                fontSize: 17,
                lineHeight: 1.6,
                color: "#aab4c0",
              }}
            >
              Translate CI latency into
              engineering capacity,
              customer value, pricing
              power and modeled WarpBuild
              unit economics.
            </p>
          </div>

          <div
            style={{
              minWidth: 180,
              textAlign: "right",
            }}
          >
            <div style={labelStyle}>
              VALUE / PRICE
            </div>

            <div
              style={{
                fontSize: 40,
                fontWeight: 750,
                lineHeight: 1,
                marginTop: 9,
              }}
            >
              {decimal(
                commercial.roiMultiple,
                2,
              )}
              ×
            </div>

            <div
              style={{
                ...mutedStyle,
                marginTop: 8,
                fontSize: 13,
              }}
            >
              modeled base case
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 24,
            paddingTop: 18,
            borderTop:
              "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            justifyContent:
              "space-between",
            gap: 24,
            alignItems: "center",
          }}
        >
          <div>
            <span
              style={{
                ...labelStyle,
                color: "#9bb8dc",
              }}
            >
              DETERMINISTIC MODEL · V
              {methodologyVersion}
            </span>

            <p
              style={{
                margin: "7px 0 0",
                color: "#8f9aa8",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              Explicit assumptions only.
              Modeled speedup, workload,
              pricing and margin are not
              presented as verified
              WarpBuild or customer data.
            </p>
          </div>

          <span className="status-pill">
            ASSUMPTION-LED
          </span>
        </div>
      </section>

      {/* KPI STRIP */}

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        {[
          {
            label: "ANNUAL CI DEMAND",
            value: number(
              baseline.annualBuilds,
            ),
            note: "modeled builds / year",
          },
          {
            label:
              "RECOVERABLE CAPACITY",
            value: number(
              scenario
                .recoverableEngineeringHours,
            ),
            note: "engineering hours / year",
          },
          {
            label:
              "CUSTOMER VALUE",
            value: compactMoney(
              commercial
                .customerAnnualValue,
            ),
            note: "annual productivity value",
          },
          {
            label: "PAYBACK",
            value: `${decimal(
              commercial.paybackMonths,
              1,
            )} mo`,
            note: "at modeled annual price",
          },
        ].map((item) => (
          <article
            key={item.label}
            style={{
              ...panelStyle,
              padding: 18,
            }}
          >
            <div style={labelStyle}>
              {item.label}
            </div>

            <div
              style={{
                fontSize: 27,
                fontWeight: 750,
                marginTop: 9,
                lineHeight: 1.1,
              }}
            >
              {item.value}
            </div>

            <div
              style={{
                ...mutedStyle,
                fontSize: 12,
                marginTop: 7,
              }}
            >
              {item.note}
            </div>
          </article>
        ))}
      </section>

      {/* BASELINE VS ACCELERATED */}

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <article
          style={{
            ...panelStyle,
            padding: 22,
          }}
        >
          <div className="eyebrow">
            CURRENT CI BASELINE
          </div>

          <h2
            style={{
              marginTop: 8,
              marginBottom: 4,
            }}
          >
            Engineering feedback cost
          </h2>

          <p
            style={{
              ...mutedStyle,
              marginTop: 0,
              fontSize: 13,
            }}
          >
            Estimated annual cost and
            developer exposure before
            acceleration.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: 10,
              marginTop: 20,
            }}
          >
            {[
              [
                "Developers",
                number(
                  assumptions.developers,
                ),
              ],
              [
                "Builds / dev / day",
                decimal(
                  assumptions
                    .buildsPerDeveloperPerDay,
                  1,
                ),
              ],
              [
                "Average build",
                `${decimal(
                  assumptions
                    .averageBuildMinutes,
                  1,
                )} min`,
              ],
              [
                "AI throughput",
                `${decimal(
                  assumptions
                    .aiCodingMultiplier,
                  2,
                )}×`,
              ],
              [
                "CI minutes / year",
                number(
                  baseline
                    .annualCIMinutes,
                ),
              ],
              [
                "Blocking rate",
                percentageInput(
                  assumptions
                    .developerBlockingRate,
                ),
              ],
              [
                "Wait exposure",
                `${number(
                  baseline
                    .annualDeveloperWaitHours,
                )} hrs`,
              ],
              [
                "Wait-time cost",
                money(
                  baseline
                    .annualDeveloperWaitCost,
                ),
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  ...insetStyle,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    ...mutedStyle,
                    fontSize: 12,
                  }}
                >
                  {label}
                </div>

                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    marginTop: 5,
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article
          style={{
            ...panelStyle,
            padding: 22,
          }}
        >
          <div className="eyebrow">
            ACCELERATED SCENARIO
          </div>

          <h2
            style={{
              marginTop: 8,
              marginBottom: 4,
            }}
          >
            Modeled WarpBuild path
          </h2>

          <p
            style={{
              ...mutedStyle,
              marginTop: 0,
              fontSize: 13,
            }}
          >
            Economic effect of faster
            feedback across eligible
            blocking CI workloads.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: 10,
              marginTop: 20,
            }}
          >
            {[
              [
                "Speedup assumption",
                `${decimal(
                  assumptions
                    .speedupMultiplier,
                  1,
                )}×`,
              ],
              [
                "Eligible adoption",
                percentageInput(
                  assumptions.adoptionRate,
                ),
              ],
              [
                "Effective build",
                `${decimal(
                  scenario
                    .effectiveBuildMinutes,
                  1,
                )} min`,
              ],
              [
                "Minutes saved",
                number(
                  scenario
                    .annualMinutesSaved,
                ),
              ],
              [
                "Hours saved",
                number(
                  scenario
                    .annualHoursSaved,
                ),
              ],
              [
                "Productive recovery",
                percentageInput(
                  assumptions
                    .productiveRecoveryRate,
                ),
              ],
              [
                "Recoverable hours",
                number(
                  scenario
                    .recoverableEngineeringHours,
                ),
              ],
              [
                "Recovered value",
                money(
                  scenario
                    .recoveredProductivityValue,
                ),
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  ...insetStyle,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    ...mutedStyle,
                    fontSize: 12,
                  }}
                >
                  {label}
                </div>

                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    marginTop: 5,
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* VALUE BRIDGE */}

      <article
        style={{
          ...panelStyle,
          padding: 22,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "flex-start",
            gap: 24,
          }}
        >
          <div>
            <div className="eyebrow">
              VALUE ENGINE
            </div>

            <h2
              style={{
                marginTop: 8,
                marginBottom: 4,
              }}
            >
              From CI latency to economic
              value
            </h2>
          </div>

          <span className="status-pill">
            BLOCKING-AWARE
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr auto 1fr auto 1fr auto 1fr",
            alignItems: "center",
            gap: 12,
            marginTop: 24,
          }}
        >
          {[
            {
              label:
                "WAIT-TIME EXPOSURE",
              value: compactMoney(
                baseline
                  .annualDeveloperWaitCost,
              ),
              note: `${number(
                baseline
                  .annualDeveloperWaitHours,
              )} blocking hrs`,
            },
            {
              label:
                "TIME REMOVED",
              value: `${number(
                scenario.annualHoursSaved,
              )} hrs`,
              note: `${percentageInput(
                assumptions.adoptionRate,
              )} eligible adoption`,
            },
            {
              label:
                "RECOVERED CAPACITY",
              value: `${number(
                scenario
                  .recoverableEngineeringHours,
              )} hrs`,
              note: `${percentageInput(
                assumptions
                  .productiveRecoveryRate,
              )} productive recovery`,
            },
            {
              label:
                "CUSTOMER VALUE",
              value: compactMoney(
                commercial
                  .customerAnnualValue,
              ),
              note: "modeled annual value",
            },
          ].map((item, index) => (
            <Fragment key={item.label}>
              <div
                style={{
                  ...insetStyle,
                  padding: 16,
                  minHeight: 105,
                }}
              >
                <div style={labelStyle}>
                  {item.label}
                </div>

                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 750,
                    marginTop: 9,
                  }}
                >
                  {item.value}
                </div>

                <div
                  style={{
                    ...mutedStyle,
                    fontSize: 12,
                    marginTop: 6,
                  }}
                >
                  {item.note}
                </div>
              </div>

              {index < 3 && (
                <div
                  key={`${item.label}-arrow`}
                  style={{
                    color: "#596573",
                    fontSize: 22,
                  }}
                >
                  →
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </article>

      {/* COMMERCIAL + DECISION */}

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "1.35fr .65fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <article
          style={{
            ...panelStyle,
            padding: 22,
          }}
        >
          <div className="eyebrow">
            COMMERCIAL ENGINE
          </div>

          <h2
            style={{
              marginTop: 8,
              marginBottom: 4,
            }}
          >
            Customer ROI × modeled
            WarpBuild economics
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: 10,
              marginTop: 20,
            }}
          >
            {[
              [
                "Modeled annual price",
                money(
                  commercial
                    .warpBuildAnnualPrice,
                ),
              ],
              [
                "Customer value",
                money(
                  commercial
                    .customerAnnualValue,
                ),
              ],
              [
                "Net customer value",
                money(
                  commercial
                    .customerNetAnnualValue,
                ),
              ],
              [
                "Value / price",
                `${decimal(
                  commercial.roiMultiple,
                  2,
                )}×`,
              ],
              [
                "Value capture",
                `${decimal(
                  commercial
                    .valueCaptureRate,
                  1,
                )}%`,
              ],
              [
                "Payback",
                `${decimal(
                  commercial
                    .paybackMonths,
                  1,
                )} mo`,
              ],
              [
                "Modeled infra cost",
                money(
                  scenario
                    .estimatedWarpBuildInfrastructureCost,
                ),
              ],
              [
                "Gross profit",
                money(
                  commercial.grossProfit,
                ),
              ],
              [
                "Modeled gross margin",
                `${decimal(
                  commercial
                    .grossMarginPercent,
                  0,
                )}%`,
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  ...insetStyle,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    ...mutedStyle,
                    fontSize: 12,
                  }}
                >
                  {label}
                </div>

                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    marginTop: 5,
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </article>

        <aside
          style={{
            ...panelStyle,
            padding: 22,
          }}
        >
          <div className="eyebrow">
            CEO DECISION
          </div>

          <div
            style={{
              marginTop: 14,
              fontSize: 12,
              letterSpacing: "0.1em",
              fontWeight: 750,
              color:
                economicCasePositive
                  ? "#9ed5bb"
                  : "#e5b4a7",
            }}
          >
            {economicCasePositive
              ? "ECONOMIC CASE CLEARS PRICE"
              : "ECONOMIC CASE BELOW PRICE"}
          </div>

          <div
            style={{
              fontSize: 34,
              fontWeight: 760,
              lineHeight: 1,
              marginTop: 12,
            }}
          >
            {decimal(
              commercial.roiMultiple,
              2,
            )}
            ×
          </div>

          <p
            style={{
              color: "#aab4c0",
              lineHeight: 1.6,
              fontSize: 14,
              marginTop: 12,
            }}
          >
            The base model generates{" "}
            {money(
              commercial
                .customerAnnualValue,
            )}{" "}
            of annual customer value
            against{" "}
            {money(
              commercial
                .warpBuildAnnualPrice,
            )}{" "}
            of modeled annual price.
          </p>

          <div
            style={{
              borderTop:
                "1px solid rgba(255,255,255,0.07)",
              marginTop: 18,
              paddingTop: 18,
            }}
          >
            <div style={labelStyle}>
              VALIDATE NEXT
            </div>

            <div
              style={{
                display: "grid",
                gap: 10,
                marginTop: 12,
              }}
            >
              {lowestConfidence.map(
                (item) => (
                  <div
                    key={item.key}
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      gap: 12,
                      fontSize: 13,
                    }}
                  >
                    <span
                      style={{
                        color: "#aab4c0",
                      }}
                    >
                      {item.label}
                    </span>

                    <strong>
                      {item.confidence}%
                    </strong>
                  </div>
                ),
              )}
            </div>
          </div>

          <div
            style={{
              ...insetStyle,
              marginTop: 18,
              padding: 14,
            }}
          >
            <div style={labelStyle}>
              NEXT EVIDENCE
            </div>

            <p
              style={{
                margin:
                  "8px 0 0",
                color: "#9aa6b3",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              Replace the weakest modeled
              inputs with measured CI
              telemetry and the WarpBuild
              Lab benchmark before treating
              this as a commercial case.
            </p>
          </div>
        </aside>
      </section>

      {/* SENSITIVITY */}

      <article
        style={{
          ...panelStyle,
          padding: 22,
          marginBottom: 16,
        }}
      >
        <div className="eyebrow">
          SENSITIVITY ENGINE
        </div>

        <h2
          style={{
            marginTop: 8,
            marginBottom: 4,
          }}
        >
          What has to be true?
        </h2>

        <p
          style={{
            ...mutedStyle,
            marginTop: 0,
            fontSize: 13,
          }}
        >
          Stress-test the economic case
          across speedup, adoption,
          blocking exposure, productive
          recovery and AI-driven CI
          demand.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",
            gap: 12,
            marginTop: 20,
          }}
        >
          {demoEconomicSensitivity.map(
            (item) => (
              <section
                key={item.name}
                style={{
                  ...insetStyle,
                  padding: 18,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span style={labelStyle}>
                    {item.name}
                  </span>

                  {item.name ===
                    "BASE" && (
                    <span className="status-pill">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 750,
                    marginTop: 14,
                  }}
                >
                  {compactMoney(
                    item.result.commercial
                      .customerAnnualValue,
                  )}
                </div>

                <div
                  style={{
                    ...mutedStyle,
                    fontSize: 12,
                    marginTop: 3,
                  }}
                >
                  modeled customer value
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: 10,
                    marginTop: 18,
                  }}
                >
                  {[
                    [
                      "Speedup",
                      `${decimal(
                        item.inputs
                          .speedupMultiplier,
                        2,
                      )}×`,
                    ],
                    [
                      "Adoption",
                      percentageInput(
                        item.inputs
                          .adoptionRate,
                      ),
                    ],
                    [
                      "Blocking",
                      percentageInput(
                        item.inputs
                          .developerBlockingRate,
                      ),
                    ],
                    [
                      "ROI",
                      `${decimal(
                        item.result
                          .commercial
                          .roiMultiple,
                        2,
                      )}×`,
                    ],
                    [
                      "Payback",
                      `${decimal(
                        item.result
                          .commercial
                          .paybackMonths,
                        1,
                      )} mo`,
                    ],
                    [
                      "Recovery",
                      percentageInput(
                        item.inputs
                          .productiveRecoveryRate,
                      ),
                    ],
                  ].map(
                    ([label, value]) => (
                      <div key={label}>
                        <div
                          style={{
                            ...mutedStyle,
                            fontSize: 11,
                          }}
                        >
                          {label}
                        </div>

                        <strong
                          style={{
                            display: "block",
                            marginTop: 3,
                          }}
                        >
                          {value}
                        </strong>
                      </div>
                    ),
                  )}
                </div>
              </section>
            ),
          )}
        </div>
      </article>

      {/* PROVENANCE */}

      <article
        style={{
          ...panelStyle,
          padding: 22,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            gap: 24,
            alignItems: "flex-start",
          }}
        >
          <div>
            <div className="eyebrow">
              ASSUMPTION & PROVENANCE
              LEDGER
            </div>

            <h2
              style={{
                marginTop: 8,
                marginBottom: 4,
              }}
            >
              Every number has a source
            </h2>

            <p
              style={{
                ...mutedStyle,
                marginTop: 0,
                fontSize: 13,
              }}
            >
              Modeled economics stay
              separate from verified
              customer and WarpBuild data.
            </p>
          </div>

          <div
            style={{
              textAlign: "right",
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 750,
              }}
            >
              {
                demoEconomicAssumptions.length
              }
            </div>

            <div style={labelStyle}>
              INPUTS TRACKED
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 20,
            borderTop:
              "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1.15fr .65fr .65fr 2fr .45fr",
              gap: 14,
              padding: "12px 10px",
              borderBottom:
                "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {[
              "ASSUMPTION",
              "VALUE",
              "PROVENANCE",
              "RATIONALE",
              "CONF.",
            ].map((heading) => (
              <strong
                key={heading}
                style={labelStyle}
              >
                {heading}
              </strong>
            ))}
          </div>

          {demoEconomicAssumptions.map(
            (assumption) => (
              <div
                key={assumption.key}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1.15fr .65fr .65fr 2fr .45fr",
                  gap: 14,
                  alignItems: "center",
                  padding: "14px 10px",
                  borderBottom:
                    "1px solid rgba(255,255,255,0.055)",
                }}
              >
                <strong
                  style={{
                    fontSize: 13,
                  }}
                >
                  {assumption.label}
                </strong>

                <span
                  style={{
                    fontSize: 13,
                  }}
                >
                  {assumption.unit ===
                  "ratio"
                    ? percentageInput(
                        assumption.value,
                      )
                    : `${assumption.value} ${assumption.unit}`}
                </span>

                <span className="status-pill">
                  {
                    assumption.provenance
                  }
                </span>

                <span
                  style={{
                    ...mutedStyle,
                    fontSize: 12,
                    lineHeight: 1.45,
                  }}
                >
                  {assumption.rationale}
                </span>

                <strong
                  style={{
                    fontSize: 13,
                  }}
                >
                  {assumption.confidence}%
                </strong>
              </div>
            ),
          )}
        </div>
      </article>
    </div>
  );
}
