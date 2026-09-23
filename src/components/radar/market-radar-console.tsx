"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  MarketRadarSnapshot,
  MarketSignal,
} from "@/domain/market-radar/types";

import "./market-radar.css";

type LoadState = "LOADING" | "READY" | "ERROR";

function formatLabel(value: string): string {
  return value.replaceAll("_", " ");
}

function scoreClass(signal: MarketSignal): string {
  return signal.score?.classification.toLowerCase() ?? "low";
}

function directionClass(
  direction: MarketSignal["direction"],
): string {
  return direction.toLowerCase();
}

function RadarMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
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

function SignalCard({
  signal,
  selected,
  onSelect,
}: {
  signal: MarketSignal;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`radar-signal-card ${selected ? "selected" : ""}`}
      onClick={onSelect}
    >
      <div className="signal-card-top">
        <div className="signal-badges">
          <span
            className={`signal-direction ${directionClass(
              signal.direction,
            )}`}
          >
            {signal.direction}
          </span>

          <span className="signal-category">
            {formatLabel(signal.category)}
          </span>
        </div>

        <div className={`signal-score ${scoreClass(signal)}`}>
          <strong>{signal.score?.score ?? 0}</strong>
          <span>{signal.score?.classification ?? "LOW"}</span>
        </div>
      </div>

      <h3>{signal.title}</h3>
      <p>{signal.summary}</p>

      <div className="signal-card-footer">
        <span>{formatLabel(signal.urgency)}</span>
        <span>{signal.evidence.length} EVIDENCE</span>

        {signal.decisionRequired ? (
          <strong>CEO REQUIRED</strong>
        ) : signal.experimentCandidate ? (
          <strong className="experiment">EXPERIMENT</strong>
        ) : (
          <span>MONITOR</span>
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
  const width = Math.max(0, Math.min(100, value));

  return (
    <div className="factor-row">
      <div className="factor-row-heading">
        <span>{label}</span>
        <strong>{Math.round(value)}</strong>
      </div>

      <div className="factor-track">
        <div
          className="factor-fill"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function SignalInspector({
  signal,
}: {
  signal: MarketSignal;
}) {
  const factors = signal.score?.factors ?? signal.factors;

  const factorRows = [
    ["Strategic fit", factors.strategicFit],
    ["Commercial impact", factors.commercialImpact],
    ["Product impact", factors.productImpact],
    ["Time sensitivity", factors.timeSensitivity],
    ["Evidence strength", factors.evidenceStrength],
    ["Competitive intensity", factors.competitiveIntensity],
    ["Actionability", factors.actionability],
  ] as const;

  return (
    <aside className="radar-inspector">
      <div className="inspector-header">
        <div>
          <span className="system-label">SIGNAL INSPECTOR</span>
          <h2>{signal.title}</h2>
        </div>

        <div className={`inspector-score ${scoreClass(signal)}`}>
          <strong>{signal.score?.score ?? 0}</strong>
          <span>RADAR SCORE</span>
        </div>
      </div>

      <section className="inspector-section">
        <span className="system-label">WHY THIS MATTERS</span>
        <p className="inspector-copy">{signal.whyItMatters}</p>
      </section>

      <section className="inspector-section">
        <span className="system-label">SYSTEM RECOMMENDATION</span>

        <p className="recommendation-copy">
          {signal.recommendedAction}
        </p>

        <div className="action-strip">
          <span>{formatLabel(signal.recommendedActionType)}</span>
          <span>
            {signal.decisionRequired
              ? "HUMAN DECISION"
              : "SYSTEM ACTIONABLE"}
          </span>
        </div>
      </section>

      <section className="inspector-section">
        <div className="section-heading-row">
          <span className="system-label">SCORE DECOMPOSITION</span>
          <strong>{signal.score?.confidence ?? 0}% CONFIDENCE</strong>
        </div>

        <div className="factor-list">
          {factorRows.map(([label, value]) => (
            <FactorBar key={label} label={label} value={value} />
          ))}
        </div>
      </section>

      <section className="inspector-section">
        <span className="system-label">AFFECTED SYSTEMS</span>

        <div className="impact-tags">
          {signal.impactAreas.map((area) => (
            <span key={area}>{formatLabel(area)}</span>
          ))}
        </div>
      </section>

      <section className="inspector-section">
        <div className="section-heading-row">
          <span className="system-label">EVIDENCE</span>
          <strong>{signal.evidence.length} SOURCES</strong>
        </div>

        <div className="evidence-list">
          {signal.evidence.map((evidence) => (
            <article className="evidence-card" key={evidence.id}>
              <div className="evidence-top">
                <span>{evidence.sourceType}</span>
                <strong>
                  {Math.round(evidence.reliability * 100)}% TRUST
                </strong>
              </div>

              <h4>{evidence.title}</h4>
              <p>{evidence.excerpt}</p>

              <div className="evidence-meta">
                <span>{evidence.sourceName}</span>
                <span>
                  {evidence.isSynthetic
                    ? "SYNTHETIC / DEMO"
                    : "OBSERVED"}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </aside>
  );
}

export function MarketRadarConsole() {
  const [snapshot, setSnapshot] =
    useState<MarketRadarSnapshot | null>(null);

  const [state, setState] =
    useState<LoadState>("LOADING");

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/radar", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Radar request failed.");
        }

        const result =
          (await response.json()) as MarketRadarSnapshot;

        if (!active) {
          return;
        }

        setSnapshot(result);
        setSelectedId(
          result.attention[0]?.id ??
            result.signals[0]?.id ??
            null,
        );
        setState("READY");
      } catch {
        if (active) {
          setState("ERROR");
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  const selectedSignal = useMemo(
    () =>
      snapshot?.signals.find(
        (signal) => signal.id === selectedId,
      ) ??
      snapshot?.signals[0] ??
      null,
    [snapshot, selectedId],
  );

  if (state === "LOADING") {
    return (
      <div className="radar-state-card">
        <span className="radar-loader" />
        MARKET RADAR IS PROCESSING EXTERNAL INTELLIGENCE
      </div>
    );
  }

  if (state === "ERROR" || !snapshot || !selectedSignal) {
    return (
      <div className="radar-state-card error">
        Market Radar could not load the intelligence snapshot.
      </div>
    );
  }

  return (
    <div className="radar-console">
      <section className="radar-command-strip">
        <div className="radar-live">
          <span className="live-dot" />

          <div>
            <strong>MARKET RADAR ONLINE</strong>
            <span>
              Signal normalization → relevance scoring → strategic
              synthesis
            </span>
          </div>
        </div>

        <div className="radar-generated">
          <span>INTELLIGENCE MODE</span>
          <strong>DEMO / MODELED</strong>
        </div>
      </section>

      <section className="radar-metrics">
        <RadarMetric
          label="SIGNALS"
          value={snapshot.metrics.signalCount}
          detail="normalized intelligence objects"
        />

        <RadarMetric
          label="HIGH PRIORITY"
          value={
            snapshot.metrics.criticalCount +
            snapshot.metrics.highPriorityCount
          }
          detail="requiring active attention"
        />

        <RadarMetric
          label="OPPORTUNITIES"
          value={snapshot.metrics.opportunityCount}
          detail="positive strategic signals"
        />

        <RadarMetric
          label="THREATS"
          value={snapshot.metrics.threatCount}
          detail="competitive exposure"
        />

        <RadarMetric
          label="EXPERIMENTS"
          value={snapshot.metrics.experimentCandidateCount}
          detail="candidate hypotheses"
        />

        <RadarMetric
          label="CONFIDENCE"
          value={`${Math.round(
            snapshot.metrics.averageConfidence,
          )}%`}
          detail="average evidence confidence"
        />
      </section>

      <section className="radar-main-grid">
        <div className="radar-primary">
          <div className="radar-section-heading">
            <div>
              <span>EXECUTIVE RADAR</span>
              <h2>What changed — and why it matters</h2>
            </div>

            <p>
              Signals are ranked by strategic relevance, commercial
              impact, evidence quality and actionability.
            </p>
          </div>

          <div className="signal-list">
            {snapshot.signals.map((signal) => (
              <SignalCard
                key={signal.id}
                signal={signal}
                selected={selectedSignal.id === signal.id}
                onSelect={() => setSelectedId(signal.id)}
              />
            ))}
          </div>
        </div>

        <SignalInspector signal={selectedSignal} />
      </section>

      <section className="radar-lower-grid">
        <div className="radar-panel trend-panel">
          <div className="panel-heading">
            <div>
              <span>STRATEGIC THEMES</span>
              <h2>Signals become trends</h2>
            </div>

            <strong>{snapshot.trends.length} ACTIVE</strong>
          </div>

          <div className="trend-list">
            {snapshot.trends.map((trend, index) => (
              <article className="trend-card" key={trend.id}>
                <div className="trend-index">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="trend-body">
                  <div className="trend-top">
                    <span
                      className={`signal-direction ${directionClass(
                        trend.direction,
                      )}`}
                    >
                      {trend.direction}
                    </span>

                    <span>
                      MOMENTUM {Math.round(trend.momentum)}
                    </span>

                    <span>
                      CONFIDENCE {Math.round(trend.confidence)}%
                    </span>
                  </div>

                  <h3>{trend.title}</h3>
                  <p>{trend.thesis}</p>

                  <div className="trend-implication">
                    <span>IMPLICATION</span>
                    <p>{trend.implication}</p>
                  </div>

                  <div className="trend-action">
                    <span>NEXT SYSTEM ACTION</span>
                    <strong>{trend.recommendedAction}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="radar-panel attention-panel">
          <div className="panel-heading">
            <div>
              <span>ATTENTION QUEUE</span>
              <h2>What needs a human</h2>
            </div>

            <strong className="attention-count">
              {snapshot.metrics.decisionCount} CEO
            </strong>
          </div>

          <div className="attention-list">
            {snapshot.attention.map((signal) => (
              <button
                type="button"
                key={signal.id}
                onClick={() => {
                  setSelectedId(signal.id);

                  window.scrollTo({
                    top: 300,
                    behavior: "smooth",
                  });
                }}
              >
                <div>
                  <span>
                    {signal.score?.classification ?? "WATCH"}
                  </span>
                  <span>
                    {formatLabel(signal.recommendedActionType)}
                  </span>
                </div>

                <strong>{signal.title}</strong>
                <p>{signal.recommendedAction}</p>

                <footer>
                  <span>SCORE {signal.score?.score ?? 0}</span>
                  <span>
                    {signal.decisionRequired
                      ? "CEO REQUIRED"
                      : signal.experimentCandidate
                        ? "EXPERIMENT CANDIDATE"
                        : "SYSTEM REVIEW"}
                  </span>
                </footer>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="radar-system-boundary">
        <div>
          <span>INTELLIGENCE BOUNDARY</span>
          <strong>
            Market Radar does not turn modeled scenarios into facts.
          </strong>
        </div>

        <p>{snapshot.disclaimer}</p>
      </section>
    </div>
  );
}