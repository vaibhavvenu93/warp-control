"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  MarketRadarSnapshot,
  MarketSignal,
  RadarEvidenceLineage,
  RadarEpistemicState,
  RadarSourceNode,
} from "@/domain/market-radar/types";

import "./market-radar.css";

type LoadState =
  | "LOADING"
  | "READY"
  | "ERROR";

function formatLabel(
  value: string,
): string {
  return value.replaceAll(
    "_",
    " ",
  );
}

function scoreClass(
  signal: MarketSignal,
): string {
  return (
    signal.score
      ?.classification
      .toLowerCase() ??
    "low"
  );
}

function directionClass(
  direction:
    MarketSignal["direction"],
): string {
  return direction.toLowerCase();
}

function epistemicClass(
  state:
    RadarEpistemicState,
): string {
  return state.toLowerCase();
}

function healthClass(
  status:
    RadarSourceNode["status"],
): string {
  return status.toLowerCase();
}

function relativeTime(
  value: string,
  reference: string,
): string {
  const observed =
    new Date(
      value,
    ).getTime();

  const now =
    new Date(
      reference,
    ).getTime();

  const minutes =
    Math.max(
      0,
      Math.round(
        (now - observed) /
          60_000,
      ),
    );

  if (minutes < 1) {
    return "NOW";
  }

  if (minutes < 60) {
    return `${minutes}M AGO`;
  }

  const hours =
    Math.round(
      minutes / 60,
    );

  return `${hours}H AGO`;
}

function RadarMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value:
    | string
    | number;
  detail: string;
}) {
  return (
    <div className="radar-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

function EpistemicBadge({
  state,
}: {
  state:
    RadarEpistemicState;
}) {
  return (
    <span
      className={`epistemic-badge ${epistemicClass(
        state,
      )}`}
    >
      {state}
    </span>
  );
}

function SourceNetwork({
  snapshot,
}: {
  snapshot:
    MarketRadarSnapshot;
}) {
  const healthy =
    snapshot.intelligence
      .sources.filter(
        (source) =>
          source.status ===
          "HEALTHY",
      ).length;

  return (
    <section className="source-network">
      <div className="source-network-heading">
        <div>
          <span className="system-label">
            SOURCE NETWORK
          </span>

          <h2>
            Governed external
            intelligence
          </h2>

          <p>
            Sources are monitored
            before their observations
            can enter the claim and
            decision layers.
          </p>
        </div>

        <div className="source-network-status">
          <span>
            {
              snapshot
                .intelligence
                .mode
            }
          </span>

          <strong>
            {healthy}/
            {
              snapshot
                .intelligence
                .sources.length
            }{" "}
            HEALTHY
          </strong>
        </div>
      </div>

      <div className="source-grid">
        {snapshot.intelligence
          .sources.map(
            (
              source,
            ) => (
              <article
                className="source-card"
                key={
                  source.id
                }
              >
                <div className="source-card-top">
                  <div className="source-identity">
                    <span
                      className={`source-health-dot ${healthClass(
                        source.status,
                      )}`}
                    />

                    <div>
                      <strong>
                        {
                          source.name
                        }
                      </strong>

                      <span>
                        {
                          source.kind
                        }
                      </span>
                    </div>
                  </div>

                  <span
                    className={`source-health-label ${healthClass(
                      source.status,
                    )}`}
                  >
                    {
                      source.status
                    }
                  </span>
                </div>

                <div className="source-card-metrics">
                  <div>
                    <span>
                      TRUST
                    </span>

                    <strong>
                      {
                        source.trust
                      }
                      %
                    </strong>
                  </div>

                  <div>
                    <span>
                      LATENCY
                    </span>

                    <strong>
                      {source.latencyMs >
                      0
                        ? `${source.latencyMs}ms`
                        : "N/A"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      OBS
                    </span>

                    <strong>
                      {
                        source.observationCount
                      }
                    </strong>
                  </div>
                </div>

                <footer>
                  <span>
                    {
                      source.mode
                    }
                  </span>

                  <span>
                    {relativeTime(
                      source.lastObservedAt,
                      snapshot.generatedAt,
                    )}
                  </span>
                </footer>
              </article>
            ),
          )}
      </div>
    </section>
  );
}

function SignalCard({
  signal,
  lineage,
  selected,
  onSelect,
}: {
  signal:
    MarketSignal;

  lineage?:
    RadarEvidenceLineage;

  selected:
    boolean;

  onSelect:
    () => void;
}) {
  return (
    <button
      type="button"
      className={`radar-signal-card ${
        selected
          ? "selected"
          : ""
      }`}
      onClick={
        onSelect
      }
    >
      <div className="signal-card-top">
        <div className="signal-badges">
          <span
            className={`signal-direction ${directionClass(
              signal.direction,
            )}`}
          >
            {
              signal.direction
            }
          </span>

          <span className="signal-category">
            {formatLabel(
              signal.category,
            )}
          </span>

          {lineage ? (
            <EpistemicBadge
              state={
                lineage.epistemicState
              }
            />
          ) : null}
        </div>

        <div
          className={`signal-score ${scoreClass(
            signal,
          )}`}
        >
          <strong>
            {
              signal.score
                ?.score ??
              0
            }
          </strong>

          <span>
            {
              signal.score
                ?.classification ??
              "LOW"
            }
          </span>
        </div>
      </div>

      <h3>
        {signal.title}
      </h3>

      <p>
        {signal.summary}
      </p>

      <div className="signal-card-footer">
        <span>
          {formatLabel(
            signal.urgency,
          )}
        </span>

        <span>
          {
            lineage
              ?.independentSourceCount ??
            signal.evidence
              .length
          }{" "}
          SOURCE
          {(
            lineage
              ?.independentSourceCount ??
            signal.evidence
              .length
          ) === 1
            ? ""
            : "S"}
        </span>

        {signal.decisionRequired ? (
          <strong>
            CEO REQUIRED
          </strong>
        ) : signal.experimentCandidate ? (
          <strong className="experiment">
            EXPERIMENT
          </strong>
        ) : (
          <span>
            MONITOR
          </span>
        )}
      </div>
    </button>
  );
}

function FactorBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const width =
    Math.max(
      0,
      Math.min(
        100,
        value,
      ),
    );

  return (
    <div className="factor-row">
      <div className="factor-row-heading">
        <span>
          {label}
        </span>

        <strong>
          {Math.round(
            value,
          )}
        </strong>
      </div>

      <div className="factor-track">
        <div
          className="factor-fill"
          style={{
            width:
              `${width}%`,
          }}
        />
      </div>
    </div>
  );
}

function ConfidenceMeter({
  confidence,
  freshness,
}: {
  confidence:
    number;

  freshness:
    number;
}) {
  return (
    <div className="confidence-grid">
      <div className="confidence-block">
        <div>
          <span>
            CLAIM CONFIDENCE
          </span>

          <strong>
            {confidence}%
          </strong>
        </div>

        <div className="confidence-track">
          <div
            style={{
              width:
                `${confidence}%`,
            }}
          />
        </div>
      </div>

      <div className="confidence-block">
        <div>
          <span>
            FRESHNESS
          </span>

          <strong>
            {freshness}%
          </strong>
        </div>

        <div className="confidence-track freshness">
          <div
            style={{
              width:
                `${freshness}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function IntelligenceLineage({
  lineage,
  sources,
}: {
  lineage:
    RadarEvidenceLineage;

  sources:
    RadarSourceNode[];
}) {
  const evidenceSources =
    lineage.sourceIds
      .map(
        (
          id,
        ) =>
          sources.find(
            (
              source,
            ) =>
              source.id ===
              id,
          ),
      )
      .filter(
        (
          source,
        ): source is RadarSourceNode =>
          Boolean(
            source,
          ),
      );

  return (
    <section className="lineage-section">
      <div className="lineage-heading">
        <div>
          <span className="system-label">
            INTELLIGENCE LINEAGE
          </span>

          <h3>
            Evidence →
            judgment
          </h3>
        </div>

        <EpistemicBadge
          state={
            lineage.epistemicState
          }
        />
      </div>

      <div className="lineage-flow">
        <article className="lineage-node">
          <span>
            01 · OBSERVATION
          </span>

          <p>
            {
              lineage.observation
            }
          </p>
        </article>

        <div className="lineage-arrow">
          ↓
        </div>

        <article className="lineage-node">
          <span>
            02 · CLAIM
          </span>

          <p>
            {
              lineage.claim
            }
          </p>
        </article>

        <div className="lineage-arrow">
          ↓
        </div>

        <article className="lineage-node">
          <div className="lineage-node-top">
            <span>
              03 ·
              CORROBORATION
            </span>

            <strong>
              {
                lineage.independentSourceCount
              }{" "}
              INDEPENDENT
            </strong>
          </div>

          <div className="lineage-sources">
            {evidenceSources.map(
              (
                source,
              ) => (
                <div
                  key={
                    source.id
                  }
                >
                  <span
                    className={`source-health-dot ${healthClass(
                      source.status,
                    )}`}
                  />

                  <strong>
                    {
                      source.name
                    }
                  </strong>

                  <small>
                    {
                      source.trust
                    }
                    % TRUST
                  </small>
                </div>
              ),
            )}
          </div>
        </article>

        <div className="lineage-arrow">
          ↓
        </div>

        <article className="lineage-node inference">
          <span>
            04 ·
            INTERPRETATION
          </span>

          <p>
            {
              lineage.interpretation
            }
          </p>
        </article>

        <div className="lineage-arrow">
          ↓
        </div>

        <article className="lineage-node implication">
          <span>
            05 · WARPBUILD
            IMPLICATION
          </span>

          <p>
            {
              lineage.implication
            }
          </p>
        </article>

        <div className="lineage-arrow">
          ↓
        </div>

        <article className="lineage-node action">
          <div className="lineage-node-top">
            <span>
              06 · PROPOSED
              ACTION
            </span>

            <strong>
              {lineage.humanReviewRequired
                ? "HUMAN REVIEW"
                : "SYSTEM ACTIONABLE"}
            </strong>
          </div>

          <p>
            {
              lineage.proposedAction
            }
          </p>
        </article>
      </div>

      <ConfidenceMeter
        confidence={
          lineage.confidence
        }
        freshness={
          lineage.freshness
        }
      />
    </section>
  );
}

function SignalInspector({
  signal,
  lineage,
  sources,
}: {
  signal:
    MarketSignal;

  lineage?:
    RadarEvidenceLineage;

  sources:
    RadarSourceNode[];
}) {
  const factors =
    signal.score
      ?.factors ??
    signal.factors;

  const factorRows = [
    [
      "Strategic fit",
      factors.strategicFit,
    ],
    [
      "Commercial impact",
      factors.commercialImpact,
    ],
    [
      "Product impact",
      factors.productImpact,
    ],
    [
      "Time sensitivity",
      factors.timeSensitivity,
    ],
    [
      "Evidence strength",
      factors.evidenceStrength,
    ],
    [
      "Competitive intensity",
      factors.competitiveIntensity,
    ],
    [
      "Actionability",
      factors.actionability,
    ],
  ] as const;

  return (
    <aside className="radar-inspector">
      <div className="inspector-header">
        <div>
          <span className="system-label">
            INTELLIGENCE
            INSPECTOR
          </span>

          <h2>
            {signal.title}
          </h2>

          {lineage ? (
            <div className="inspector-epistemic">
              <EpistemicBadge
                state={
                  lineage.epistemicState
                }
              />

              <span>
                {
                  lineage.independentSourceCount
                }{" "}
                independent
                source
                {lineage.independentSourceCount ===
                1
                  ? ""
                  : "s"}
              </span>
            </div>
          ) : null}
        </div>

        <div
          className={`inspector-score ${scoreClass(
            signal,
          )}`}
        >
          <strong>
            {
              signal.score
                ?.score ??
              0
            }
          </strong>

          <span>
            RADAR SCORE
          </span>
        </div>
      </div>

      {lineage ? (
        <IntelligenceLineage
          lineage={
            lineage
          }
          sources={
            sources
          }
        />
      ) : null}

      <section className="inspector-section">
        <span className="system-label">
          WHY THIS MATTERS
        </span>

        <p className="inspector-copy">
          {
            signal.whyItMatters
          }
        </p>
      </section>

      <section className="inspector-section">
        <span className="system-label">
          SYSTEM
          RECOMMENDATION
        </span>

        <p className="recommendation-copy">
          {
            signal.recommendedAction
          }
        </p>

        <div className="action-strip">
          <span>
            {formatLabel(
              signal.recommendedActionType,
            )}
          </span>

          <span>
            {signal.decisionRequired
              ? "HUMAN DECISION"
              : "SYSTEM ACTIONABLE"}
          </span>
        </div>
      </section>

      <section className="inspector-section">
        <div className="section-heading-row">
          <span className="system-label">
            SCORE
            DECOMPOSITION
          </span>

          <strong>
            {
              signal.score
                ?.confidence ??
              0
            }
            % CONFIDENCE
          </strong>
        </div>

        <div className="factor-list">
          {factorRows.map(
            ([
              label,
              value,
            ]) => (
              <FactorBar
                key={
                  label
                }
                label={
                  label
                }
                value={
                  value
                }
              />
            ),
          )}
        </div>
      </section>

      <section className="inspector-section">
        <span className="system-label">
          AFFECTED SYSTEMS
        </span>

        <div className="impact-tags">
          {signal.impactAreas.map(
            (
              area,
            ) => (
              <span
                key={
                  area
                }
              >
                {formatLabel(
                  area,
                )}
              </span>
            ),
          )}
        </div>
      </section>

      <section className="inspector-section">
        <div className="section-heading-row">
          <span className="system-label">
            ORIGINAL SIGNAL
            EVIDENCE
          </span>

          <strong>
            {
              signal.evidence
                .length
            }{" "}
            ITEM
            {signal.evidence
              .length ===
            1
              ? ""
              : "S"}
          </strong>
        </div>

        <div className="evidence-list">
          {signal.evidence.map(
            (
              evidence,
            ) => (
              <article
                className="evidence-card"
                key={
                  evidence.id
                }
              >
                <div className="evidence-top">
                  <span>
                    {
                      evidence.sourceType
                    }
                  </span>

                  <strong>
                    {Math.round(
                      evidence.reliability *
                        100,
                    )}
                    % TRUST
                  </strong>
                </div>

                <h4>
                  {
                    evidence.title
                  }
                </h4>

                <p>
                  {
                    evidence.excerpt
                  }
                </p>

                <div className="evidence-meta">
                  <span>
                    {
                      evidence.sourceName
                    }
                  </span>

                  <span>
                    {evidence.isSynthetic
                      ? "SYNTHETIC / DEMO"
                      : "OBSERVED"}
                  </span>
                </div>
              </article>
            ),
          )}
        </div>
      </section>
    </aside>
  );
}

export function MarketRadarConsole() {
  const [
    snapshot,
    setSnapshot,
  ] =
    useState<
      MarketRadarSnapshot | null
    >(null);

  const [
    state,
    setState,
  ] =
    useState<LoadState>(
      "LOADING",
    );

  const [
    selectedId,
    setSelectedId,
  ] =
    useState<
      string | null
    >(null);

  useEffect(
    () => {
      let active =
        true;

      async function load() {
        try {
          const response =
            await fetch(
              "/api/radar",
              {
                cache:
                  "no-store",
              },
            );

          if (
            !response.ok
          ) {
            throw new Error(
              "Radar request failed.",
            );
          }

          const result =
            (await response.json()) as MarketRadarSnapshot;

          if (!active) {
            return;
          }

          setSnapshot(
            result,
          );

          setSelectedId(
            result
              .attention[0]
              ?.id ??
              result
                .signals[0]
                ?.id ??
              null,
          );

          setState(
            "READY",
          );
        } catch {
          if (
            active
          ) {
            setState(
              "ERROR",
            );
          }
        }
      }

      void load();

      return () => {
        active =
          false;
      };
    },
    [],
  );

  const selectedSignal =
    useMemo(
      () =>
        snapshot?.signals.find(
          (
            signal,
          ) =>
            signal.id ===
            selectedId,
        ) ??
        snapshot
          ?.signals[0] ??
        null,
      [
        snapshot,
        selectedId,
      ],
    );

  const selectedLineage =
    useMemo(
      () =>
        snapshot
          ?.intelligence
          .lineage.find(
            (
              lineage,
            ) =>
              lineage.signalId ===
              selectedSignal?.id,
          ),
      [
        snapshot,
        selectedSignal,
      ],
    );

  const lineageBySignal =
    useMemo(
      () =>
        new Map(
          snapshot
            ?.intelligence
            .lineage.map(
              (
                lineage,
              ) => [
                lineage.signalId,
                lineage,
              ],
            ) ??
            [],
        ),
      [
        snapshot,
      ],
    );

  if (
    state ===
    "LOADING"
  ) {
    return (
      <div className="radar-state-card">
        <span className="radar-loader" />
        MARKET RADAR IS
        PROCESSING EXTERNAL
        INTELLIGENCE
      </div>
    );
  }

  if (
    state ===
      "ERROR" ||
    !snapshot ||
    !selectedSignal
  ) {
    return (
      <div className="radar-state-card error">
        Market Radar could
        not load the
        intelligence
        snapshot.
      </div>
    );
  }

  const healthySources =
    snapshot.intelligence
      .sources.filter(
        (
          source,
        ) =>
          source.status ===
          "HEALTHY",
      ).length;

  const corroboratedClaims =
    snapshot.intelligence
      .lineage.filter(
        (
          lineage,
        ) =>
          lineage.epistemicState ===
          "CORROBORATED",
      ).length;

  return (
    <div className="radar-console">
      <section className="radar-command-strip">
        <div className="radar-live">
          <span className="live-dot" />

          <div>
            <strong>
              MARKET RADAR
              ONLINE
            </strong>

            <span>
              Source → observation
              → claim →
              corroboration →
              judgment
            </span>
          </div>
        </div>

        <div className="radar-generated">
          <span>
            INTELLIGENCE
            MODE
          </span>

          <strong>
            {
              snapshot
                .intelligence
                .mode
            }
          </strong>
        </div>
      </section>

      <section className="radar-metrics">
        <RadarMetric
          label="SIGNALS"
          value={
            snapshot.metrics
              .signalCount
          }
          detail="ranked intelligence objects"
        />

        <RadarMetric
          label="SOURCES"
          value={
            snapshot
              .intelligence
              .sources
              .length
          }
          detail={`${healthySources} healthy source nodes`}
        />

        <RadarMetric
          label="CORROBORATED"
          value={
            corroboratedClaims
          }
          detail="multi-source claims"
        />

        <RadarMetric
          label="OPPORTUNITIES"
          value={
            snapshot.metrics
              .opportunityCount
          }
          detail="positive strategic signals"
        />

        <RadarMetric
          label="EXPERIMENTS"
          value={
            snapshot.metrics
              .experimentCandidateCount
          }
          detail="candidate hypotheses"
        />

        <RadarMetric
          label="CONFIDENCE"
          value={`${Math.round(
            snapshot.metrics
              .averageConfidence,
          )}%`}
          detail="average signal confidence"
        />
      </section>

      <SourceNetwork
        snapshot={
          snapshot
        }
      />

      <section className="radar-main-grid">
        <div className="radar-primary">
          <div className="radar-section-heading">
            <div>
              <span>
                EXECUTIVE
                RADAR
              </span>

              <h2>
                What changed —
                and why it
                matters
              </h2>
            </div>

            <p>
              Signals are ranked
              separately from their
              epistemic state. A
              high-impact hypothesis
              is not automatically a
              verified fact.
            </p>
          </div>

          <div className="signal-list">
            {snapshot.signals.map(
              (
                signal,
              ) => (
                <SignalCard
                  key={
                    signal.id
                  }
                  signal={
                    signal
                  }
                  lineage={
                    lineageBySignal.get(
                      signal.id,
                    )
                  }
                  selected={
                    selectedSignal.id ===
                    signal.id
                  }
                  onSelect={() =>
                    setSelectedId(
                      signal.id,
                    )
                  }
                />
              ),
            )}
          </div>
        </div>

        <SignalInspector
          signal={
            selectedSignal
          }
          lineage={
            selectedLineage
          }
          sources={
            snapshot
              .intelligence
              .sources
          }
        />
      </section>

      <section className="radar-lower-grid">
        <div className="radar-panel trend-panel">
          <div className="panel-heading">
            <div>
              <span>
                STRATEGIC
                THEMES
              </span>

              <h2>
                Signals become
                trends
              </h2>
            </div>

            <strong>
              {
                snapshot
                  .trends
                  .length
              }{" "}
              ACTIVE
            </strong>
          </div>

          <div className="trend-list">
            {snapshot.trends.map(
              (
                trend,
                index,
              ) => (
                <article
                  className="trend-card"
                  key={
                    trend.id
                  }
                >
                  <div className="trend-index">
                    {String(
                      index +
                        1,
                    ).padStart(
                      2,
                      "0",
                    )}
                  </div>

                  <div className="trend-body">
                    <div className="trend-top">
                      <span
                        className={`signal-direction ${directionClass(
                          trend.direction,
                        )}`}
                      >
                        {
                          trend.direction
                        }
                      </span>

                      <span>
                        MOMENTUM{" "}
                        {Math.round(
                          trend.momentum,
                        )}
                      </span>

                      <span>
                        CONFIDENCE{" "}
                        {Math.round(
                          trend.confidence,
                        )}
                        %
                      </span>
                    </div>

                    <h3>
                      {
                        trend.title
                      }
                    </h3>

                    <p>
                      {
                        trend.thesis
                      }
                    </p>

                    <div className="trend-implication">
                      <span>
                        IMPLICATION
                      </span>

                      <p>
                        {
                          trend.implication
                        }
                      </p>
                    </div>

                    <div className="trend-action">
                      <span>
                        NEXT SYSTEM
                        ACTION
                      </span>

                      <strong>
                        {
                          trend.recommendedAction
                        }
                      </strong>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>
        </div>

        <div className="radar-panel attention-panel">
          <div className="panel-heading">
            <div>
              <span>
                ATTENTION
                QUEUE
              </span>

              <h2>
                What needs a
                human
              </h2>
            </div>

            <strong className="attention-count">
              {
                snapshot.metrics
                  .decisionCount
              }{" "}
              CEO
            </strong>
          </div>

          <div className="attention-list">
            {snapshot.attention.map(
              (
                signal,
              ) => {
                const lineage =
                  lineageBySignal.get(
                    signal.id,
                  );

                return (
                  <button
                    type="button"
                    key={
                      signal.id
                    }
                    onClick={() => {
                      setSelectedId(
                        signal.id,
                      );

                      window.scrollTo(
                        {
                          top: 420,
                          behavior:
                            "smooth",
                        },
                      );
                    }}
                  >
                    <div>
                      <span>
                        {
                          signal
                            .score
                            ?.classification ??
                          "WATCH"
                        }
                      </span>

                      {lineage ? (
                        <EpistemicBadge
                          state={
                            lineage.epistemicState
                          }
                        />
                      ) : null}
                    </div>

                    <strong>
                      {
                        signal.title
                      }
                    </strong>

                    <p>
                      {
                        signal.recommendedAction
                      }
                    </p>

                    <footer>
                      <span>
                        SCORE{" "}
                        {
                          signal
                            .score
                            ?.score ??
                          0
                        }
                      </span>

                      <span>
                        {signal.decisionRequired
                          ? "CEO REQUIRED"
                          : signal.experimentCandidate
                            ? "EXPERIMENT CANDIDATE"
                            : "SYSTEM REVIEW"}
                      </span>
                    </footer>
                  </button>
                );
              },
            )}
          </div>
        </div>
      </section>

      <section className="radar-system-boundary">
        <div>
          <span>
            INTELLIGENCE
            BOUNDARY
          </span>

          <strong>
            Impact score is not
            truth confidence.
          </strong>
        </div>

        <div>
          <p>
            {
              snapshot.disclaimer
            }
          </p>

          <div className="boundary-legend">
            <EpistemicBadge
              state="OBSERVED"
            />

            <span>
              direct source
              observation
            </span>

            <EpistemicBadge
              state="CORROBORATED"
            />

            <span>
              supported by
              independent
              sources
            </span>

            <EpistemicBadge
              state="INFERRED"
            />

            <span>
              evidence-backed
              interpretation
            </span>

            <EpistemicBadge
              state="MODELED"
            />

            <span>
              hypothesis /
              scenario
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}