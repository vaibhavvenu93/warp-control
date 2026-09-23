"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  BrainIntelligenceSnapshot,
  BrainLineageView,
  BrainSourceView,
} from "@/domain/brain/intelligence";

function percent(
  value: number,
): string {
  return `${Math.round(
    value * 100,
  )}%`;
}

function humanize(
  value: string,
): string {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}

function stateTone(
  state: string,
): string {
  if (
    state === "KNOWN" ||
    state === "INTERNAL" ||
    state === "CONNECTED"
  ) {
    return "brain-tone-green";
  }

  if (
    state === "UNKNOWN"
  ) {
    return "brain-tone-red";
  }

  if (
    state === "MODELED" ||
    state === "INFERRED"
  ) {
    return "brain-tone-purple";
  }

  return "brain-tone-yellow";
}

function SourceInspector({
  source,
  lineage,
}: {
  source:
    BrainSourceView;

  lineage:
    BrainLineageView[];
}) {
  const claims =
    lineage.filter(
      (item) =>
        item.source.id ===
        source.id,
    );

  return (
    <section className="brain-inspector">
      <div className="brain-inspector-top">
        <div>
          <span className="eyebrow">
            SOURCE INSPECTOR
          </span>

          <h3>
            {source.name}
          </h3>
        </div>

        <span
          className={`brain-state ${stateTone(
            source.provenance,
          )}`}
        >
          {source.provenance}
        </span>
      </div>

      <p className="brain-inspector-description">
        {source.description}
      </p>

      <div className="brain-inspector-metrics">
        <div>
          <span>TRUST</span>
          <strong>
            {percent(
              source.trustScore,
            )}
          </strong>
        </div>

        <div>
          <span>DOCUMENTS</span>
          <strong>
            {source.documentCount}
          </strong>
        </div>

        <div>
          <span>CLAIMS</span>
          <strong>
            {source.claimCount}
          </strong>
        </div>

        <div>
          <span>EVIDENCE</span>
          <strong>
            {source.evidenceCount}
          </strong>
        </div>
      </div>

      <div className="brain-inspector-flags">
        <span>
          {humanize(
            source.type,
          )}
        </span>

        <span>
          {source.connected
            ? "CONNECTED"
            : "NOT CONNECTED"}
        </span>

        <span>
          {source.readOnly
            ? "READ ONLY"
            : "WRITE ENABLED"}
        </span>
      </div>

      <div className="brain-inspector-claims">
        <div className="brain-panel-title">
          <span>
            CLAIM LINEAGE
          </span>

          <strong>
            {claims.length}
          </strong>
        </div>

        {claims.map(
          (item) => (
            <div
              key={
                item.claimId
              }
              className="brain-lineage-card"
            >
              <div className="brain-lineage-card-head">
                <span
                  className={`brain-state ${stateTone(
                    item.state,
                  )}`}
                >
                  {item.state}
                </span>

                <span>
                  {percent(
                    item.confidence,
                  )}
                </span>
              </div>

              <strong>
                {item.statement}
              </strong>

              <div className="brain-lineage-chain">
                <div>
                  <span>
                    CLAIM
                  </span>

                  <code>
                    {item.claimId}
                  </code>
                </div>

                <b>→</b>

                <div>
                  <span>
                    EVIDENCE
                  </span>

                  <code>
                    {item.evidence
                      ?.id ??
                      "NONE"}
                  </code>
                </div>

                <b>→</b>

                <div>
                  <span>
                    DOCUMENT
                  </span>

                  <code>
                    {item.document
                      ?.id ??
                      "NONE"}
                  </code>
                </div>

                <b>→</b>

                <div>
                  <span>
                    SOURCE
                  </span>

                  <code>
                    {item.source.id}
                  </code>
                </div>
              </div>

              {item.evidence && (
                <div className="brain-evidence-detail">
                  <span>
                    EVIDENCE RELIABILITY{" "}
                    {percent(
                      item.evidence
                        .reliability,
                    )}
                  </span>

                  <p>
                    {
                      item.evidence
                        .excerpt
                    }
                  </p>
                </div>
              )}

              {item.requiredEvidence
                .length > 0 && (
                <div className="brain-lineage-gap">
                  <span>
                    REQUIRED TO
                    RESOLVE
                  </span>

                  <strong>
                    {item.requiredEvidence.join(
                      " · ",
                    )}
                  </strong>
                </div>
              )}
            </div>
          ),
        )}
      </div>
    </section>
  );
}

export function
BrainIntelligencePanel() {
  const [
    data,
    setData,
  ] =
    useState<
      BrainIntelligenceSnapshot
      | undefined
    >();

  const [
    selectedSourceId,
    setSelectedSourceId,
  ] =
    useState<
      string | undefined
    >();

  const [
    error,
    setError,
  ] =
    useState<
      string | undefined
    >();

  useEffect(() => {
    let cancelled =
      false;

    async function load() {
      try {
        const response =
          await fetch(
            "/api/brain/intelligence",
            {
              cache:
                "no-store",
            },
          );

        if (!response.ok) {
          throw new Error(
            "Knowledge intelligence request failed.",
          );
        }

        const snapshot =
          (await response.json()) as
            BrainIntelligenceSnapshot;

        if (cancelled) {
          return;
        }

        setData(snapshot);

        setSelectedSourceId(
          snapshot.sources[0]
            ?.id,
        );
      } catch (
        caught
      ) {
        if (cancelled) {
          return;
        }

        setError(
          caught instanceof Error
            ? caught.message
            : "Knowledge intelligence could not be loaded.",
        );
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedSource =
    useMemo(
      () =>
        data?.sources.find(
          (source) =>
            source.id ===
            selectedSourceId,
        ),
      [
        data,
        selectedSourceId,
      ],
    );

  if (error) {
    return (
      <section className="brain-intelligence-shell">
        <div className="brain-error">
          {error}
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="brain-intelligence-shell">
        <div className="brain-loading">
          <div className="brain-loading-line" />

          <span>
            Loading knowledge
            graph and provenance
            registry...
          </span>
        </div>
      </section>
    );
  }

  const stateTotal =
    Object.values(
      data.knowledgeStates,
    ).reduce(
      (sum, value) =>
        sum + value,
      0,
    );

  const entityName =
    new Map(
      data.graph.nodes.map(
        (node) => [
          node.id,
          node.name,
        ],
      ),
    );

  return (
    <section className="brain-intelligence-shell">
      <div className="brain-intelligence-heading">
        <div>
          <span className="eyebrow">
            KNOWLEDGE
            INTELLIGENCE
          </span>

          <h2>
            Evidence architecture
          </h2>

          <p>
            Inspect what the
            Company Brain knows,
            where it came from,
            how reliable it is,
            how entities connect,
            and which missing
            evidence prevents a
            stronger decision.
          </p>
        </div>

        <div className="brain-intelligence-health">
          <span>
            KNOWLEDGE HEALTH
          </span>

          <strong>
            {percent(
              data.summary
                .averageEvidenceReliability,
            )}
          </strong>

          <small>
            AVG EVIDENCE
            RELIABILITY
          </small>
        </div>
      </div>

      <div className="brain-intelligence-metrics">
        <div>
          <span>SOURCES</span>
          <strong>
            {data.summary.sourceCount}
          </strong>
          <small>
            {
              data.summary
                .connectedSourceCount
            }{" "}
            connected
          </small>
        </div>

        <div>
          <span>DOCUMENTS</span>
          <strong>
            {
              data.summary
                .documentCount
            }
          </strong>
          <small>
            {
              data.summary
                .chunkCount
            }{" "}
            indexed chunks
          </small>
        </div>

        <div>
          <span>ENTITIES</span>
          <strong>
            {
              data.summary
                .entityCount
            }
          </strong>
          <small>
            {
              data.summary
                .relationCount
            }{" "}
            graph relations
          </small>
        </div>

        <div>
          <span>CLAIMS</span>
          <strong>
            {
              data.summary
                .claimCount
            }
          </strong>
          <small>
            {
              data.summary
                .evidenceCount
            }{" "}
            evidence objects
          </small>
        </div>

        <div>
          <span>SOURCE TRUST</span>
          <strong>
            {percent(
              data.summary
                .averageSourceTrust,
            )}
          </strong>
          <small>
            average registry
            trust
          </small>
        </div>
      </div>

      <div className="brain-intelligence-grid">
        <div className="brain-intelligence-main">
          <section className="brain-knowledge-panel">
            <div className="brain-panel-title">
              <span>
                KNOWLEDGE STATE
              </span>

              <strong>
                {stateTotal} CLAIMS
              </strong>
            </div>

            <div className="brain-state-bars">
              {Object.entries(
                data.knowledgeStates,
              ).map(
                ([
                  state,
                  count,
                ]) => {
                  const share =
                    stateTotal > 0
                      ? count /
                        stateTotal
                      : 0;

                  return (
                    <div
                      key={
                        state
                      }
                      className="brain-state-bar-row"
                    >
                      <div>
                        <span
                          className={`brain-state ${stateTone(
                            state,
                          )}`}
                        >
                          {state}
                        </span>

                        <strong>
                          {count}
                        </strong>
                      </div>

                      <div className="brain-state-track">
                        <div
                          className={`brain-state-fill ${stateTone(
                            state,
                          )}`}
                          style={{
                            width:
                              `${Math.max(
                                share *
                                  100,
                                count >
                                  0
                                  ? 4
                                  : 0,
                              )}%`,
                          }}
                        />
                      </div>

                      <small>
                        {percent(
                          share,
                        )}
                      </small>
                    </div>
                  );
                },
              )}
            </div>
          </section>

          <section className="brain-knowledge-panel">
            <div className="brain-panel-title">
              <span>
                KNOWLEDGE GRAPH
              </span>

              <strong>
                {
                  data.graph.edges
                    .length
                }{" "}
                RELATIONS
              </strong>
            </div>

            <div className="brain-graph">
              {data.graph.edges.map(
                (edge) => (
                  <div
                    key={
                      edge.id
                    }
                    className="brain-graph-edge"
                  >
                    <div className="brain-graph-node">
                      <span>
                        {data.graph.nodes.find(
                          (node) =>
                            node.id ===
                            edge.from,
                        )?.type ??
                          "ENTITY"}
                      </span>

                      <strong>
                        {entityName.get(
                          edge.from,
                        ) ??
                          edge.from}
                      </strong>
                    </div>

                    <div className="brain-graph-relation">
                      <span>
                        {edge.type}
                      </span>

                      <div>
                        ─────→
                      </div>

                      <small>
                        {percent(
                          edge.confidence,
                        )}
                      </small>
                    </div>

                    <div className="brain-graph-node">
                      <span>
                        {data.graph.nodes.find(
                          (node) =>
                            node.id ===
                            edge.to,
                        )?.type ??
                          "ENTITY"}
                      </span>

                      <strong>
                        {entityName.get(
                          edge.to,
                        ) ??
                          edge.to}
                      </strong>
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>

          <section className="brain-knowledge-panel">
            <div className="brain-panel-title">
              <span>
                BLIND-SPOT
                REGISTER
              </span>

              <strong
                className={
                  data.blindSpots
                    .length > 0
                    ? "brain-attention"
                    : ""
                }
              >
                {
                  data.blindSpots
                    .length
                }{" "}
                OPEN
              </strong>
            </div>

            {data.blindSpots
              .length === 0 ? (
              <p className="brain-panel-empty">
                No unresolved
                knowledge gaps in
                the current
                snapshot.
              </p>
            ) : (
              <div className="brain-blindspots">
                {data.blindSpots.map(
                  (
                    blindSpot,
                    index,
                  ) => (
                    <div
                      key={
                        blindSpot.claimId
                      }
                      className="brain-blindspot"
                    >
                      <span>
                        0
                        {index +
                          1}
                      </span>

                      <div>
                        <strong>
                          {
                            blindSpot.statement
                          }
                        </strong>

                        <p>
                          Resolve
                          with:{" "}
                          {blindSpot.requiredEvidence.join(
                            " · ",
                          ) ||
                            "Human research required"}
                        </p>
                      </div>

                      <code>
                        {
                          blindSpot.claimId
                        }
                      </code>
                    </div>
                  ),
                )}
              </div>
            )}
          </section>
        </div>

        <aside className="brain-source-column">
          <section className="brain-source-registry">
            <div className="brain-panel-title">
              <span>
                SOURCE REGISTRY
              </span>

              <strong>
                {
                  data.sources
                    .length
                }
              </strong>
            </div>

            <div className="brain-source-list">
              {data.sources.map(
                (source) => (
                  <button
                    key={
                      source.id
                    }
                    type="button"
                    className={
                      source.id ===
                      selectedSourceId
                        ? "brain-source-row active"
                        : "brain-source-row"
                    }
                    onClick={() =>
                      setSelectedSourceId(
                        source.id,
                      )
                    }
                  >
                    <div>
                      <span
                        className={`brain-state ${stateTone(
                          source.provenance,
                        )}`}
                      >
                        {
                          source.provenance
                        }
                      </span>

                      <small>
                        {percent(
                          source.trustScore,
                        )}{" "}
                        TRUST
                      </small>
                    </div>

                    <strong>
                      {source.name}
                    </strong>

                    <p>
                      {humanize(
                        source.type,
                      )}
                      {" · "}
                      {source.connected
                        ? "connected"
                        : "offline"}
                    </p>
                  </button>
                ),
              )}
            </div>
          </section>

          {selectedSource && (
            <SourceInspector
              source={
                selectedSource
              }
              lineage={
                data.lineage
              }
            />
          )}
        </aside>
      </div>

      <div className="brain-architecture-strip">
        <span>
          SOURCE REGISTRY
        </span>
        <b>→</b>
        <span>
          DOCUMENTS
        </span>
        <b>→</b>
        <span>
          CHUNKS
        </span>
        <b>→</b>
        <span>
          ENTITIES + CLAIMS
        </span>
        <b>→</b>
        <span>
          EVIDENCE GRAPH
        </span>
        <b>→</b>
        <span>
          HYBRID RETRIEVAL
        </span>
        <b>→</b>
        <span>
          RERANK
        </span>
        <b>→</b>
        <span>
          ANSWERABILITY
        </span>
        <b>→</b>
        <span>
          EXECUTIVE SYNTHESIS
        </span>
      </div>
    </section>
  );
}