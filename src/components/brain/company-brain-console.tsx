"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  BrainAnswerSection,
  BrainCitation,
  BrainResponse,
} from "@/domain/brain/types";

const suggestedQuestions = [
  "Should we pursue the Northstar Labs enterprise opportunity?",
  "What do we know about Northstar Labs?",
  "What is the modeled CI economics for Northstar Labs?",
  "Which evidence is missing before we make a decision?",
];

function percentage(
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

function statusClass(
  status: string,
): string {
  if (
    status === "SUCCESS" ||
    status === "KNOWN"
  ) {
    return "brain-tone-green";
  }

  if (
    status === "BLOCKED" ||
    status === "UNKNOWN" ||
    status === "CONFLICT"
  ) {
    return "brain-tone-red";
  }

  if (
    status === "MODELED" ||
    status === "CAVEATED"
  ) {
    return "brain-tone-purple";
  }

  return "brain-tone-yellow";
}

function sectionTone(
  kind:
    BrainAnswerSection["kind"],
): string {
  switch (kind) {
    case "MODELED":
      return "brain-section-modeled";

    case "UNKNOWN":
      return "brain-section-unknown";

    case "DECISION_BOUNDARY":
      return "brain-section-decision";

    case "NEXT_ACTION":
      return "brain-section-next";

    default:
      return "";
  }
}

function CitationChip({
  citation,
}: {
  citation:
    BrainCitation;
}) {
  return (
    <div className="brain-citation-chip">
      <div className="brain-citation-chip-top">
        <span
          className={`brain-state ${statusClass(
            citation.state,
          )}`}
        >
          {citation.state}
        </span>

        <span>
          {percentage(
            citation.confidence,
          )}
        </span>
      </div>

      <strong>
        {citation.statement}
      </strong>

      <div className="brain-citation-meta">
        <span>
          {citation.provenance}
        </span>

        <span>
          {citation.sourceId}
        </span>
      </div>
    </div>
  );
}

function AnswerSection({
  section,
  citations,
}: {
  section:
    BrainAnswerSection;

  citations:
    BrainCitation[];
}) {
  const linked =
    citations.filter(
      (citation) =>
        section.citationIds.includes(
          citation.id,
        ),
    );

  return (
    <section
      className={`brain-answer-section ${sectionTone(
        section.kind,
      )}`}
    >
      <div className="brain-section-heading">
        <div>
          <span className="brain-section-kind">
            {humanize(
              section.kind,
            )}
          </span>

          <h3>
            {section.title}
          </h3>
        </div>

        {linked.length > 0 && (
          <span className="brain-source-count">
            {linked.length}{" "}
            {linked.length === 1
              ? "source"
              : "sources"}
          </span>
        )}
      </div>

      <p>
        {section.content}
      </p>

      {linked.length > 0 && (
        <div className="brain-section-citations">
          {linked.map(
            (citation) => (
              <CitationChip
                key={
                  citation.id
                }
                citation={
                  citation
                }
              />
            ),
          )}
        </div>
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="brain-empty">
      <div className="brain-empty-mark">
        B
      </div>

      <span className="eyebrow">
        GOVERNED RETRIEVAL
      </span>

      <h2>
        Ask the company,
        not a chatbot.
      </h2>

      <p>
        The Brain retrieves
        evidence, separates
        known facts from modeled
        analysis and unknowns,
        checks whether the
        evidence is sufficient,
        then synthesizes an
        executive answer.
      </p>

      <div className="brain-empty-pipeline">
        <span>
          PLAN
        </span>
        <b>→</b>
        <span>
          RETRIEVE
        </span>
        <b>→</b>
        <span>
          RERANK
        </span>
        <b>→</b>
        <span>
          GOVERN
        </span>
        <b>→</b>
        <span>
          SYNTHESIZE
        </span>
      </div>
    </div>
  );
}

export function
CompanyBrainConsole() {
  const [
    question,
    setQuestion,
  ] = useState(
    suggestedQuestions[0],
  );

  const [
    response,
    setResponse,
  ] =
    useState<
      BrainResponse | undefined
    >();

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | undefined
    >();

  const urlQuestionHandled =
    useRef(false);

  const citationMap =
    useMemo(
      () =>
        new Map(
          response?.citations.map(
            (citation) => [
              citation.id,
              citation,
            ],
          ) ?? [],
        ),
      [response],
    );

  async function ask(
    submittedQuestion:
      string,
  ) {
    const cleanQuestion =
      submittedQuestion.trim();

    if (
      cleanQuestion.length ===
      0
    ) {
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      const request =
        await fetch(
          "/api/brain",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                question:
                  cleanQuestion,
              }),
          },
        );

      const body =
        (await request.json()) as
          | BrainResponse
          | {
              error?: string;
            };

      if (!request.ok) {
        throw new Error(
          "error" in body &&
          body.error
            ? body.error
            : "The Company Brain could not answer this question.",
        );
      }

      setResponse(
        body as BrainResponse,
      );
    } catch (
      caught
    ) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The Company Brain could not answer this question.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (
      urlQuestionHandled.current
    ) {
      return;
    }

    urlQuestionHandled.current =
      true;

    const params =
      new URLSearchParams(
        window.location.search,
      );

    const incomingQuestion =
      params.get("q")?.trim();

    if (!incomingQuestion) {
      return;
    }

    setQuestion(
      incomingQuestion,
    );

    void ask(
      incomingQuestion,
    );
  }, []);

  function submit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    void ask(question);
  }

  return (
    <div className="brain-console">
      <section className="brain-query-panel">
        <div className="brain-query-label">
          <span className="live-dot" />

          COMPANY BRAIN
          <span>
            GOVERNED
          </span>
        </div>

        <form
          onSubmit={
            submit
          }
          className="brain-query-form"
        >
          <textarea
            value={
              question
            }
            onChange={
              (event) =>
                setQuestion(
                  event.target
                    .value,
                )
            }
            placeholder="Ask a question about the company..."
            maxLength={
              1000
            }
          />

          <div className="brain-query-actions">
            <span>
              Evidence-backed
              executive retrieval
            </span>

            <button
              type="submit"
              className="primary-button"
              disabled={
                loading
              }
            >
              {loading
                ? "Reasoning..."
                : "Ask Brain →"}
            </button>
          </div>
        </form>

        <div className="brain-suggestions">
          {suggestedQuestions.map(
            (
              suggestion,
              index,
            ) => (
              <button
                key={
                  suggestion
                }
                type="button"
                onClick={() => {
                  setQuestion(
                    suggestion,
                  );

                  void ask(
                    suggestion,
                  );
                }}
              >
                <span>
                  0{index + 1}
                </span>

                {suggestion}
              </button>
            ),
          )}
        </div>
      </section>

      {error && (
        <div className="brain-error">
          {error}
        </div>
      )}

      {!response &&
        !loading && (
          <EmptyState />
        )}

      {loading && (
        <div className="brain-loading">
          <div className="brain-loading-line" />

          <span>
            Planning query →
            retrieving evidence →
            evaluating
            answerability →
            validating synthesis
          </span>
        </div>
      )}

      {response &&
        !loading && (
          <>
            <section className="brain-result-header">
              <div>
                <div className="brain-result-status">
                  <span
                    className={`brain-state ${statusClass(
                      response.mode,
                    )}`}
                  >
                    {humanize(
                      response.mode,
                    )}
                  </span>

                  <span>
                    {humanize(
                      response.intent,
                    )}
                  </span>
                </div>

                <h2>
                  {
                    response.headline
                  }
                </h2>

                <p className="brain-direct-answer">
                  {
                    response.answer
                  }
                </p>
              </div>

              <div className="brain-confidence">
                <strong>
                  {percentage(
                    response.confidence,
                  )}
                </strong>

                <span>
                  ANSWER
                  CONFIDENCE
                </span>
              </div>
            </section>

            <section className="brain-control-strip">
              <div>
                <span>
                  ANSWERABILITY
                </span>

                <strong>
                  {humanize(
                    response
                      .answerabilityStatus,
                  )}
                </strong>
              </div>

              <div>
                <span>
                  CLAIMS
                </span>

                <strong>
                  {
                    response
                      .execution
                      .claimCount
                  }
                </strong>
              </div>

              <div>
                <span>
                  EVIDENCE
                </span>

                <strong>
                  {
                    response
                      .execution
                      .evidenceCount
                  }
                </strong>
              </div>

              <div>
                <span>
                  RETRIEVED
                </span>

                <strong>
                  {
                    response
                      .execution
                      .selectedCandidateCount
                  }
                  /
                  {
                    response
                      .execution
                      .retrievedCandidateCount
                  }
                </strong>
              </div>

              <div>
                <span>
                  HUMAN REVIEW
                </span>

                <strong
                  className={
                    response
                      .policy
                      .humanJudgmentRequired
                      ? "brain-attention"
                      : ""
                  }
                >
                  {response
                    .policy
                    .humanJudgmentRequired
                    ? "REQUIRED"
                    : "NO"}
                </strong>
              </div>
            </section>

            <div className="brain-result-grid">
              <main className="brain-answer-column">
                {response.sections.map(
                  (section) => (
                    <AnswerSection
                      key={
                        section.id
                      }
                      section={
                        section
                      }
                      citations={
                        response.citations
                      }
                    />
                  ),
                )}
              </main>

              <aside className="brain-evidence-rail">
                <section className="brain-rail-panel brain-governance-panel">
                  <span className="eyebrow">
                    GOVERNANCE
                  </span>

                  <h3>
                    Decision
                    boundary
                  </h3>

                  <div className="brain-policy-row">
                    <span>
                      May answer
                    </span>

                    <strong>
                      {response
                        .policy
                        .mayAnswer
                        ? "YES"
                        : "NO"}
                    </strong>
                  </div>

                  <div className="brain-policy-row">
                    <span>
                      May recommend
                    </span>

                    <strong>
                      {response
                        .policy
                        .mayRecommend
                        ? "YES"
                        : "NO"}
                    </strong>
                  </div>

                  <div className="brain-policy-row">
                    <span>
                      Human judgment
                    </span>

                    <strong
                      className={
                        response
                          .policy
                          .humanJudgmentRequired
                          ? "brain-attention"
                          : ""
                      }
                    >
                      {response
                        .policy
                        .humanJudgmentRequired
                        ? "REQUIRED"
                        : "NOT REQUIRED"}
                    </strong>
                  </div>
                </section>

                {response
                  .requiredEvidence
                  .length >
                  0 && (
                  <section className="brain-rail-panel">
                    <span className="eyebrow">
                      EVIDENCE GAP
                    </span>

                    <h3>
                      What the
                      system needs
                      next
                    </h3>

                    <div className="brain-gap-list">
                      {response
                        .requiredEvidence
                        .map(
                          (
                            requirement,
                            index,
                          ) => (
                            <div
                              key={
                                requirement
                              }
                            >
                              <span>
                                0
                                {index +
                                  1}
                              </span>

                              <p>
                                {
                                  requirement
                                }
                              </p>
                            </div>
                          ),
                        )}
                    </div>
                  </section>
                )}

                <section className="brain-rail-panel">
                  <span className="eyebrow">
                    PROVENANCE
                  </span>

                  <h3>
                    Evidence
                    ledger
                  </h3>

                  <div className="brain-ledger">
                    {response.citations.map(
                      (
                        citation,
                      ) => (
                        <div
                          key={
                            citation.id
                          }
                          className="brain-ledger-row"
                        >
                          <div>
                            <span
                              className={`brain-state ${statusClass(
                                citation.state,
                              )}`}
                            >
                              {
                                citation.state
                              }
                            </span>

                            <strong>
                              {
                                citation.provenance
                              }
                            </strong>
                          </div>

                          <p>
                            {
                              citation.statement
                            }
                          </p>

                          <small>
                            {
                              citation.sourceId
                            }
                            {" · "}
                            {percentage(
                              citation.confidence,
                            )}
                          </small>
                        </div>
                      ),
                    )}
                  </div>
                </section>

                <section className="brain-rail-panel">
                  <span className="eyebrow">
                    EXECUTION TRACE
                  </span>

                  <h3>
                    How this
                    answer was
                    produced
                  </h3>

                  <div className="brain-trace">
                    {response
                      .execution
                      .steps
                      .map(
                        (
                          step,
                          index,
                        ) => (
                          <div
                            key={`${step.stage}-${index}`}
                            className="brain-trace-row"
                          >
                            <span className="brain-trace-index">
                              0
                              {index +
                                1}
                            </span>

                            <div>
                              <strong>
                                {humanize(
                                  step.stage,
                                )}
                              </strong>

                              <p>
                                {
                                  step.message
                                }
                              </p>
                            </div>

                            <span
                              className={`brain-trace-status ${statusClass(
                                step.status,
                              )}`}
                            >
                              {
                                step.status
                              }
                            </span>
                          </div>
                        ),
                      )}
                  </div>

                  <div className="brain-lineage">
                    <span>
                      CORRELATION
                    </span>

                    <code>
                      {
                        response
                          .execution
                          .correlationId
                      }
                    </code>
                  </div>
                </section>
              </aside>
            </div>

            <section className="brain-system-footer">
              <div>
                <span>
                  QUERY PLAN
                </span>

                <code>
                  {
                    response
                      .execution
                      .queryPlanId
                  }
                </code>
              </div>

              <div>
                <span>
                  RETRIEVAL
                  PIPELINE
                </span>

                <strong>
                  {response
                    .execution
                    .retrievalTraceStages
                    .join(
                      " → ",
                    )}
                </strong>
              </div>

              <div>
                <span>
                  CITATIONS
                  RESOLVED
                </span>

                <strong>
                  {
                    citationMap
                      .size
                  }
                </strong>
              </div>
            </section>
          </>
        )}
    </div>
  );
}