"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Activity,
  ArrowRight,
  BrainCircuit,
  Building2,
  ChartNoAxesCombined,
  CircleDollarSign,
  Command,
  FlaskConical,
  Gauge,
  Search,
  Scale,
  Sparkles,
  Target,
  Waypoints,
  X,
} from "lucide-react";

import { useRouter } from "next/navigation";

import type {
  BrainResponse,
} from "@/domain/brain/types";

interface CommandDestination {
  href: string;
  label: string;
  description: string;
  keywords: string[];
  icon: typeof Activity;
}

const destinations:
  CommandDestination[] = [
    {
      href: "/",
      label: "Company Pulse",
      description:
        "CEO brief, operating state and attention queue.",
      keywords: [
        "pulse",
        "home",
        "ceo",
        "attention",
        "brief",
      ],
      icon: Activity,
    },
    {
      href: "/decisions",
      label: "Decision Intelligence",
      description:
        "Human decisions, evidence and system recommendations.",
      keywords: [
        "decision",
        "approve",
        "review",
        "human",
      ],
      icon: Scale,
    },
    {
      href: "/growth",
      label: "Growth",
      description:
        "Growth system, channels and acquisition intelligence.",
      keywords: [
        "growth",
        "channel",
        "acquisition",
      ],
      icon: ChartNoAxesCombined,
    },
    {
      href: "/gtm",
      label: "GTM Engine",
      description:
        "Revenue motions, account qualification and GTM orchestration.",
      keywords: [
        "gtm",
        "revenue",
        "sales",
        "pipeline",
      ],
      icon: Target,
    },
    {
      href: "/accounts",
      label: "Accounts",
      description:
        "Account intelligence, evidence and commercial opportunity.",
      keywords: [
        "account",
        "northstar",
        "customer",
        "buyer",
      ],
      icon: Building2,
    },
    {
      href: "/experiments",
      label: "Experiments",
      description:
        "Experiment portfolio, gates and capital allocation.",
      keywords: [
        "experiment",
        "test",
        "hypothesis",
        "portfolio",
      ],
      icon: FlaskConical,
    },
    {
      href: "/economics",
      label: "Economics",
      description:
        "CI economics, customer value and unit economics.",
      keywords: [
        "economics",
        "roi",
        "value",
        "margin",
        "cost",
      ],
      icon: CircleDollarSign,
    },
    {
      href: "/agents",
      label: "Agent Runtime",
      description:
        "Specialist agents, tool use and execution lineage.",
      keywords: [
        "agent",
        "runtime",
        "tools",
        "orchestration",
      ],
      icon: Waypoints,
    },
    {
      href: "/brain",
      label: "Company Brain",
      description:
        "Governed company knowledge, retrieval and provenance.",
      keywords: [
        "brain",
        "knowledge",
        "evidence",
        "source",
      ],
      icon: BrainCircuit,
    },
    {
      href: "/operations",
      label: "Operations",
      description:
        "Operating cadence, dependencies and execution.",
      keywords: [
        "operations",
        "cadence",
        "execution",
      ],
      icon: Gauge,
    },
  ];

const executiveQuestions = [
  "What needs my attention?",
  "Why is Northstar Labs strategic?",
  "What are we assuming?",
  "Which evidence is missing before we make a decision?",
  "What does the CI economics model say?",
  "Which decisions require human judgment?",
];

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

function percent(
  value: number,
): string {
  return `${Math.round(
    value * 100,
  )}%`;
}

function modeTone(
  mode: string,
): string {
  if (
    mode === "DIRECT"
  ) {
    return "global-command-green";
  }

  if (
    mode === "ABSTAIN" ||
    mode === "CONFLICT"
  ) {
    return "global-command-red";
  }

  if (
    mode ===
    "HUMAN_DECISION_SUPPORT"
  ) {
    return "global-command-yellow";
  }

  return "global-command-purple";
}

export function
GlobalCommand() {
  const router =
    useRouter();

  const inputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    query,
    setQuery,
  ] = useState("");

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

  const close =
    useCallback(() => {
      setOpen(false);
      setQuery("");
      setResponse(undefined);
      setError(undefined);
      setLoading(false);
    }, []);

  const openCommand =
    useCallback(() => {
      setOpen(true);
    }, []);

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        (event.ctrlKey ||
          event.metaKey) &&
        event.key.toLowerCase() ===
          "k"
      ) {
        event.preventDefault();

        setOpen(
          (current) =>
            !current,
        );

        return;
      }

      if (
        event.key ===
          "Escape" &&
        open
      ) {
        event.preventDefault();
        close();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [close, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer =
      window.setTimeout(
        () =>
          inputRef.current?.focus(),
        30,
      );

    return () =>
      window.clearTimeout(
        timer,
      );
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const original =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        original;
    };
  }, [open]);

  const filteredDestinations =
    useMemo(() => {
      const normalized =
        query
          .trim()
          .toLowerCase();

      if (!normalized) {
        return destinations.slice(
          0,
          6,
        );
      }

      return destinations
        .filter(
          (destination) => {
            const searchable = [
              destination.label,
              destination.description,
              ...destination.keywords,
            ]
              .join(" ")
              .toLowerCase();

            return searchable.includes(
              normalized,
            );
          },
        )
        .slice(0, 6);
    }, [query]);

  async function askBrain(
    question:
      string = query,
  ) {
    const normalized =
      question.trim();

    if (
      !normalized ||
      loading
    ) {
      return;
    }

    setQuery(normalized);
    setLoading(true);
    setError(undefined);
    setResponse(undefined);

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

            body: JSON.stringify({
              question:
                normalized,
            }),
          },
        );

      const body =
        await request.json();

      if (!request.ok) {
        throw new Error(
          body.error ??
            "The Company Brain could not answer this question.",
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

  function navigate(
    href: string,
  ) {
    close();
    router.push(href);
  }

  function openInBrain() {
    const normalized =
      query.trim();

    close();

    if (!normalized) {
      router.push(
        "/brain",
      );

      return;
    }

    router.push(
      `/brain?q=${encodeURIComponent(
        normalized,
      )}`,
    );
  }

  return (
    <>
      <button
        type="button"
        className="command"
        onClick={
          openCommand
        }
        aria-label="Open WARP CONTROL command centre"
      >
        <Search size={16} />

        <span>
          Ask WARP / CONTROL
          anything
        </span>

        <kbd>
          Ctrl K
        </kbd>
      </button>

      {open && (
        <div
          className="global-command-backdrop"
          role="presentation"
          onMouseDown={
            close
          }
        >
          <section
            className="global-command-modal"
            role="dialog"
            aria-modal="true"
            aria-label="WARP CONTROL global intelligence"
            onMouseDown={(
              event,
            ) =>
              event.stopPropagation()
            }
          >
            <div className="global-command-header">
              <div className="global-command-search">
                <Search
                  size={18}
                />

                <input
                  ref={
                    inputRef
                  }
                  value={
                    query
                  }
                  onChange={(
                    event,
                  ) => {
                    setQuery(
                      event.target
                        .value,
                    );

                    if (
                      response
                    ) {
                      setResponse(
                        undefined,
                      );
                    }

                    if (
                      error
                    ) {
                      setError(
                        undefined,
                      );
                    }
                  }}
                  onKeyDown={(
                    event,
                  ) => {
                    if (
                      event.key ===
                        "Enter"
                    ) {
                      event.preventDefault();

                      void askBrain();
                    }
                  }}
                  placeholder="Ask the company or find anything..."
                />
              </div>

              <button
                type="button"
                className="global-command-close"
                onClick={
                  close
                }
                aria-label="Close command centre"
              >
                <X
                  size={15}
                />
              </button>
            </div>

            <div className="global-command-statusbar">
              <div>
                <span className="live-dot" />

                <strong>
                  COMPANY
                  INTELLIGENCE
                </strong>
              </div>

              <span>
                SEARCH · RETRIEVE
                · GOVERN · ACT
              </span>
            </div>

            {!response &&
              !loading && (
                <div className="global-command-body">
                  <section className="global-command-section">
                    <div className="global-command-section-title">
                      <span>
                        ASK THE
                        COMPANY
                      </span>

                      <small>
                        GOVERNED
                        RETRIEVAL
                      </small>
                    </div>

                    <div className="global-command-questions">
                      {executiveQuestions.map(
                        (
                          question,
                          index,
                        ) => (
                          <button
                            type="button"
                            key={
                              question
                            }
                            onClick={() =>
                              void askBrain(
                                question,
                              )
                            }
                          >
                            <span>
                              0
                              {index +
                                1}
                            </span>

                            <strong>
                              {
                                question
                              }
                            </strong>

                            <ArrowRight
                              size={
                                13
                              }
                            />
                          </button>
                        ),
                      )}
                    </div>
                  </section>

                  <section className="global-command-section">
                    <div className="global-command-section-title">
                      <span>
                        NAVIGATE
                        CONTROL PLANE
                      </span>

                      <small>
                        {
                          filteredDestinations.length
                        }{" "}
                        RESULTS
                      </small>
                    </div>

                    <div className="global-command-destinations">
                      {filteredDestinations.map(
                        (
                          destination,
                        ) => {
                          const Icon =
                            destination.icon;

                          return (
                            <button
                              type="button"
                              key={
                                destination.href
                              }
                              onClick={() =>
                                navigate(
                                  destination.href,
                                )
                              }
                            >
                              <div className="global-command-destination-icon">
                                <Icon
                                  size={
                                    15
                                  }
                                />
                              </div>

                              <div>
                                <strong>
                                  {
                                    destination.label
                                  }
                                </strong>

                                <p>
                                  {
                                    destination.description
                                  }
                                </p>
                              </div>

                              <ArrowRight
                                size={
                                  13
                                }
                              />
                            </button>
                          );
                        },
                      )}

                      {filteredDestinations.length ===
                        0 && (
                        <div className="global-command-no-route">
                          No matching
                          module. Press{" "}
                          <kbd>
                            Enter
                          </kbd>{" "}
                          to ask the
                          Company Brain.
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              )}

            {loading && (
              <div className="global-command-loading">
                <div className="global-command-loading-icon">
                  <BrainCircuit
                    size={21}
                  />
                </div>

                <span>
                  COMPANY BRAIN
                </span>

                <strong>
                  Retrieving
                  evidence...
                </strong>

                <div className="global-command-pipeline">
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
            )}

            {error && (
              <div className="global-command-error">
                <span>
                  BRAIN REQUEST
                  FAILED
                </span>

                <strong>
                  {error}
                </strong>
              </div>
            )}

            {response && (
              <div className="global-command-response">
                <div className="global-command-response-head">
                  <div>
                    <span className="global-command-response-label">
                      EXECUTIVE
                      INTELLIGENCE
                    </span>

                    <h2>
                      {
                        response.headline
                      }
                    </h2>
                  </div>

                  <span
                    className={`global-command-mode ${modeTone(
                      response.mode,
                    )}`}
                  >
                    {
                      response.mode
                    }
                  </span>
                </div>

                <p className="global-command-answer">
                  {
                    response.answer
                  }
                </p>

                <div className="global-command-response-metrics">
                  <div>
                    <span>
                      CONFIDENCE
                    </span>

                    <strong>
                      {percent(
                        response.confidence,
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      ANSWERABILITY
                    </span>

                    <strong>
                      {humanize(
                        response.answerabilityStatus,
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      EVIDENCE
                    </span>

                    <strong>
                      {
                        response.citations
                          .length
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      HUMAN
                      JUDGMENT
                    </span>

                    <strong>
                      {
                        response.policy
                          .humanJudgmentRequired
                          ? "REQUIRED"
                          : "NOT REQUIRED"
                      }
                    </strong>
                  </div>
                </div>

                {response.policy
                  .humanJudgmentRequired && (
                  <div className="global-command-boundary">
                    <Scale
                      size={15}
                    />

                    <div>
                      <span>
                        CEO DECISION
                        BOUNDARY
                      </span>

                      <strong>
                        The system can
                        retrieve,
                        analyze and
                        recommend. The
                        final judgment
                        remains human.
                      </strong>
                    </div>
                  </div>
                )}

                {response.requiredEvidence
                  .length > 0 && (
                  <div className="global-command-evidence-needed">
                    <span>
                      EVIDENCE STILL
                      REQUIRED
                    </span>

                    <div>
                      {response.requiredEvidence.map(
                        (
                          evidence,
                        ) => (
                          <strong
                            key={
                              evidence
                            }
                          >
                            {
                              evidence
                            }
                          </strong>
                        ),
                      )}
                    </div>
                  </div>
                )}

                <div className="global-command-citations">
                  <div className="global-command-section-title">
                    <span>
                      EVIDENCE USED
                    </span>

                    <small>
                      {
                        response.citations
                          .length
                      }{" "}
                      CLAIMS
                    </small>
                  </div>

                  {response.citations
                    .slice(0, 4)
                    .map(
                      (
                        citation,
                      ) => (
                        <div
                          key={
                            citation.id
                          }
                          className="global-command-citation"
                        >
                          <div>
                            <span
                              className={`global-command-citation-state ${modeTone(
                                citation.state ===
                                  "KNOWN"
                                  ? "DIRECT"
                                  : citation.state ===
                                      "UNKNOWN"
                                    ? "ABSTAIN"
                                    : "CAVEATED",
                              )}`}
                            >
                              {
                                citation.state
                              }
                            </span>

                            <small>
                              {
                                citation.provenance
                              }
                              {" · "}
                              {percent(
                                citation.confidence,
                              )}
                            </small>
                          </div>

                          <p>
                            {
                              citation.statement
                            }
                          </p>
                        </div>
                      ),
                    )}
                </div>

                <div className="global-command-response-footer">
                  <div>
                    <Command
                      size={12}
                    />

                    <span>
                      {
                        response.execution
                          .retrievalTraceStages
                          .length
                      }{" "}
                      retrieval
                      stages ·{" "}
                      {
                        response.execution
  .claimCount
                      }{" "}
                      claims
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={
                      openInBrain
                    }
                  >
                    Open in Company
                    Brain
                    <ArrowRight
                      size={13}
                    />
                  </button>
                </div>
              </div>
            )}

            {!response &&
              !loading && (
                <div className="global-command-footer">
                  <span>
                    <kbd>
                      Enter
                    </kbd>{" "}
                    ask Brain
                  </span>

                  <span>
                    <kbd>
                      Esc
                    </kbd>{" "}
                    close
                  </span>

                  <span>
                    <BrainCircuit
                      size={11}
                    />
                    Evidence-backed
                    answers
                  </span>
                </div>
              )}
          </section>
        </div>
      )}

      <style>{`
        .global-command-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 84px 24px 24px;
          background: rgba(2, 5, 8, 0.78);
          backdrop-filter: blur(8px);
        }

        .global-command-modal {
          width: min(760px, 100%);
          max-height: calc(100vh - 112px);
          overflow: hidden;
          border: 1px solid #303945;
          border-radius: 10px;
          background: #090d12;
          box-shadow:
            0 30px 100px rgba(0, 0, 0, 0.6),
            0 0 0 1px rgba(255, 255, 255, 0.015);
        }

        .global-command-header {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 36px;
          align-items: center;
          gap: 10px;
          padding: 13px;
          border-bottom: 1px solid #1d252e;
          background: #0c1117;
        }

        .global-command-search {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
          padding: 0 4px;
          color: #7e8b99;
        }

        .global-command-search input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: #e7ebef;
          font-size: 15px;
          font-family: inherit;
        }

        .global-command-search input::placeholder {
          color: #596572;
        }

        .global-command-close {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          border: 1px solid #252e38;
          border-radius: 6px;
          background: #11171e;
          color: #778492;
          cursor: pointer;
        }

        .global-command-close:hover {
          color: #fff;
          border-color: #3b4652;
        }

        .global-command-statusbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 9px 17px;
          border-bottom: 1px solid #151c24;
          color: #566372;
          font-family: var(--font-mono), monospace;
          font-size: 7px;
          letter-spacing: 0.08em;
        }

        .global-command-statusbar > div {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .global-command-statusbar strong {
          color: #8e9aa7;
          font-size: 7px;
        }

        .global-command-body,
        .global-command-response {
          max-height: calc(100vh - 245px);
          overflow-y: auto;
        }

        .global-command-section {
          padding: 16px;
          border-bottom: 1px solid #171e26;
        }

        .global-command-section-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 10px;
        }

        .global-command-section-title span,
        .global-command-section-title small {
          color: #657280;
          font-family: var(--font-mono), monospace;
          font-size: 7px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .global-command-questions,
        .global-command-destinations {
          display: grid;
          gap: 5px;
        }

        .global-command-questions {
          grid-template-columns: 1fr 1fr;
        }

        .global-command-questions button,
        .global-command-destinations button {
          display: grid;
          align-items: center;
          width: 100%;
          border: 1px solid #1c242d;
          border-radius: 6px;
          background: #0c1117;
          color: #aeb8c2;
          text-align: left;
          cursor: pointer;
        }

        .global-command-questions button {
          grid-template-columns: 24px minmax(0, 1fr) 16px;
          gap: 8px;
          min-height: 48px;
          padding: 9px 11px;
        }

        .global-command-questions button:hover,
        .global-command-destinations button:hover {
          border-color: #394552;
          background: #111820;
        }

        .global-command-questions button > span {
          color: #52606e;
          font-family: var(--font-mono), monospace;
          font-size: 7px;
        }

        .global-command-questions button strong {
          font-size: 9px;
          line-height: 1.45;
        }

        .global-command-questions button svg {
          color: #53606d;
        }

        .global-command-destinations button {
          grid-template-columns: 34px minmax(0, 1fr) 16px;
          gap: 10px;
          padding: 9px;
        }

        .global-command-destination-icon {
          display: grid;
          place-items: center;
          width: 31px;
          height: 31px;
          border: 1px solid #242e38;
          border-radius: 5px;
          color: #84919e;
          background: #11171e;
        }

        .global-command-destinations strong {
          display: block;
          color: #bcc5ce;
          font-size: 9px;
        }

        .global-command-destinations p {
          margin: 3px 0 0;
          color: #667381;
          font-size: 8px;
          line-height: 1.45;
        }

        .global-command-destinations > button > svg {
          color: #4f5c69;
        }

        .global-command-no-route {
          padding: 12px;
          border: 1px dashed #28323d;
          border-radius: 6px;
          color: #697684;
          font-size: 9px;
          text-align: center;
        }

        .global-command-no-route kbd,
        .global-command-footer kbd {
          padding: 2px 5px;
          border: 1px solid #313b46;
          border-radius: 3px;
          color: #929eaa;
          background: #11171e;
          font-family: var(--font-mono), monospace;
          font-size: 7px;
        }

        .global-command-loading {
          display: grid;
          place-items: center;
          min-height: 340px;
          padding: 40px;
          text-align: center;
        }

        .global-command-loading-icon {
          display: grid;
          place-items: center;
          width: 52px;
          height: 52px;
          margin-bottom: 14px;
          border: 1px solid #34404c;
          border-radius: 8px;
          color: #a6b1bc;
          background: #11171e;
        }

        .global-command-loading > span {
          color: #617080;
          font-family: var(--font-mono), monospace;
          font-size: 7px;
          letter-spacing: 0.12em;
        }

        .global-command-loading > strong {
          margin-top: 7px;
          color: #d6dce2;
          font-size: 15px;
        }

        .global-command-pipeline {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 22px;
          color: #51606f;
          font-family: var(--font-mono), monospace;
          font-size: 7px;
        }

        .global-command-pipeline b {
          color: #313b46;
        }

        .global-command-error {
          display: grid;
          gap: 7px;
          padding: 24px;
          color: #ff7777;
        }

        .global-command-error span {
          font-family: var(--font-mono), monospace;
          font-size: 7px;
          letter-spacing: 0.1em;
        }

        .global-command-error strong {
          font-size: 11px;
        }

        .global-command-response {
          padding: 20px;
        }

        .global-command-response-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .global-command-response-label {
          color: #697787;
          font-family: var(--font-mono), monospace;
          font-size: 7px;
          font-weight: 800;
          letter-spacing: 0.1em;
        }

        .global-command-response h2 {
          max-width: 560px;
          margin: 7px 0 0;
          color: #eef1f4;
          font-size: 18px;
          line-height: 1.3;
        }

        .global-command-mode,
        .global-command-citation-state {
          flex: 0 0 auto;
          padding: 4px 6px;
          border: 1px solid currentColor;
          border-radius: 4px;
          font-family: var(--font-mono), monospace;
          font-size: 6px;
          font-weight: 800;
        }

        .global-command-green {
          color: #6fd3a7;
        }

        .global-command-yellow {
          color: #e0b95d;
        }

        .global-command-red {
          color: #ef7777;
        }

        .global-command-purple {
          color: #c38cff;
        }

        .global-command-answer {
          margin: 16px 0;
          color: #9ca8b5;
          font-size: 10px;
          line-height: 1.7;
        }

        .global-command-response-metrics {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border: 1px solid #1f2831;
          border-radius: 6px;
          overflow: hidden;
          background: #1f2831;
          gap: 1px;
        }

        .global-command-response-metrics > div {
          padding: 10px;
          background: #0c1117;
        }

        .global-command-response-metrics span,
        .global-command-response-metrics strong {
          display: block;
        }

        .global-command-response-metrics span {
          color: #596675;
          font-family: var(--font-mono), monospace;
          font-size: 6px;
        }

        .global-command-response-metrics strong {
          margin-top: 5px;
          color: #b9c3cd;
          font-size: 9px;
        }

        .global-command-boundary {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 12px;
          padding: 11px;
          border: 1px solid rgba(224, 185, 93, 0.22);
          border-radius: 6px;
          color: #e0b95d;
          background: rgba(224, 185, 93, 0.035);
        }

        .global-command-boundary span,
        .global-command-boundary strong {
          display: block;
        }

        .global-command-boundary span {
          font-family: var(--font-mono), monospace;
          font-size: 6px;
          letter-spacing: 0.08em;
        }

        .global-command-boundary strong {
          margin-top: 4px;
          color: #9e9273;
          font-size: 8px;
          line-height: 1.5;
        }

        .global-command-evidence-needed {
          margin-top: 12px;
          padding: 11px;
          border: 1px solid #222c36;
          border-radius: 6px;
          background: #0b1016;
        }

        .global-command-evidence-needed > span {
          color: #657281;
          font-family: var(--font-mono), monospace;
          font-size: 6px;
          letter-spacing: 0.08em;
        }

        .global-command-evidence-needed > div {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 7px;
        }

        .global-command-evidence-needed strong {
          padding: 4px 6px;
          border: 1px solid #2b3540;
          border-radius: 4px;
          color: #909ca8;
          font-size: 7px;
          font-weight: 500;
        }

        .global-command-citations {
          display: grid;
          gap: 6px;
          margin-top: 16px;
        }

        .global-command-citation {
          padding: 10px;
          border: 1px solid #1c242d;
          border-radius: 5px;
          background: #0c1117;
        }

        .global-command-citation > div {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .global-command-citation small {
          color: #5f6c79;
          font-family: var(--font-mono), monospace;
          font-size: 6px;
        }

        .global-command-citation p {
          margin: 7px 0 0;
          color: #8d99a6;
          font-size: 8px;
          line-height: 1.5;
        }

        .global-command-response-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-top: 16px;
          padding-top: 13px;
          border-top: 1px solid #1c242d;
        }

        .global-command-response-footer > div {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #596674;
          font-family: var(--font-mono), monospace;
          font-size: 7px;
        }

        .global-command-response-footer button {
          display: flex;
          align-items: center;
          gap: 7px;
          border: 0;
          background: transparent;
          color: #b7c1ca;
          font-size: 8px;
          font-weight: 700;
          cursor: pointer;
        }

        .global-command-response-footer button:hover {
          color: #fff;
        }

        .global-command-footer {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 9px 16px;
          border-top: 1px solid #171e26;
          color: #5c6977;
          font-family: var(--font-mono), monospace;
          font-size: 7px;
        }

        .global-command-footer span {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        @media (max-width: 720px) {
          .global-command-backdrop {
            padding: 55px 10px 10px;
          }

          .global-command-modal {
            max-height: calc(100vh - 65px);
          }

          .global-command-questions {
            grid-template-columns: 1fr;
          }

          .global-command-response-metrics {
            grid-template-columns: 1fr 1fr;
          }

          .global-command-response-head,
          .global-command-response-footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .global-command-statusbar > span {
            display: none;
          }

          .global-command-footer {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </>
  );
}