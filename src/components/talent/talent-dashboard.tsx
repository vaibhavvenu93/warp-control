"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  CandidateEvidence,
  CapabilityAssessment,
  CapabilityGap,
  HiringAttentionItem,
  HiringPipelineHealth,
  HiringSearch,
  TalentCandidate,
  TalentSnapshot,
} from "@/domain/talent/types";

import "./talent-dashboard.css";

interface TalentDashboardProps {
  snapshot: TalentSnapshot;
}

function humanize(
  value: string,
): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

function formatDate(
  value?: string,
): string {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
    },
  ).format(
    new Date(value),
  );
}

function formatDateTime(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(
    new Date(value),
  );
}

function healthClass(
  health: string,
): string {
  switch (health) {
    case "ON_TRACK":
      return "isHealthy";

    case "WATCH":
      return "isWatch";

    case "AT_RISK":
      return "isRisk";

    case "OFF_TRACK":
      return "isCritical";

    default:
      return "isNeutral";
  }
}

function priorityClass(
  priority: string,
): string {
  switch (priority) {
    case "CRITICAL":
      return "isCritical";

    case "HIGH":
      return "isRisk";

    case "MEDIUM":
      return "isWatch";

    default:
      return "isNeutral";
  }
}

function assessmentClass(
  assessment: string,
): string {
  switch (assessment) {
    case "STRONG":
      return "isHealthy";

    case "POSITIVE":
      return "isPositive";

    case "MIXED":
      return "isWatch";

    case "WEAK":
      return "isRisk";

    default:
      return "isNeutral";
  }
}

function stageClass(
  stage: string,
): string {
  switch (stage) {
    case "FINAL":
    case "OFFER":
      return "isDecision";

    case "DEEP_DIVE":
    case "WORK_SAMPLE":
      return "isPositive";

    case "SCREEN":
      return "isWatch";

    default:
      return "isNeutral";
  }
}

function getOwnerName(
  snapshot: TalentSnapshot,
  ownerId?: string,
): string {
  if (!ownerId) {
    return "Unassigned";
  }

  return (
    snapshot.owners.find(
      (owner) =>
        owner.id === ownerId,
    )?.name ?? ownerId
  );
}

function getAssessment(
  snapshot: TalentSnapshot,
  gapId: string,
): CapabilityAssessment | undefined {
  return snapshot.capabilityAssessments.find(
    (assessment) =>
      assessment.capabilityGapId ===
      gapId,
  );
}

function getSearch(
  snapshot: TalentSnapshot,
  gapId: string,
): HiringSearch | undefined {
  return snapshot.searches.find(
    (search) =>
      search.capabilityGapId ===
      gapId &&
      search.status === "ACTIVE",
  );
}

function getPipelineHealth(
  snapshot: TalentSnapshot,
  searchId: string,
): HiringPipelineHealth | undefined {
  return snapshot.pipelineHealth.find(
    (health) =>
      health.searchId ===
      searchId,
  );
}

function getCandidateEvidence(
  snapshot: TalentSnapshot,
  candidateId: string,
): CandidateEvidence[] {
  return snapshot.evidence.filter(
    (evidence) =>
      evidence.candidateId ===
      candidateId,
  );
}

function activeCandidateCount(
  snapshot: TalentSnapshot,
  searchId: string,
): number {
  return snapshot.candidates.filter(
    (candidate) =>
      candidate.searchId ===
        searchId &&
      ![
        "HIRED",
        "REJECTED",
        "WITHDRAWN",
      ].includes(candidate.stage),
  ).length;
}

function CapabilityCard({
  gap,
  snapshot,
}: {
  gap: CapabilityGap;
  snapshot: TalentSnapshot;
}) {
  const assessment =
    getAssessment(
      snapshot,
      gap.id,
    );

  const search =
    getSearch(
      snapshot,
      gap.id,
    );

  const mitigation =
    typeof gap.metadata
      ?.mitigation === "string"
      ? gap.metadata.mitigation
      : undefined;

  const path =
    gap.status === "MITIGATED"
      ? "MITIGATE"
      : search
        ? "HIRE"
        : "ASSESS";

  return (
    <article className="talentCapabilityCard">
      <div className="talentCardTopline">
        <div className="talentBadgeRow">
          <span
            className={`talentBadge ${priorityClass(
              gap.priority,
            )}`}
          >
            {gap.priority}
          </span>

          <span
            className={`talentBadge ${healthClass(
              assessment?.health ??
                "UNKNOWN",
            )}`}
          >
            {humanize(
              assessment?.health ??
                "UNKNOWN",
            )}
          </span>
        </div>

        <span className="talentScore">
          {assessment?.score ?? 0}
          <small>/100</small>
        </span>
      </div>

      <h3>{gap.capability}</h3>

      <p className="talentCardDescription">
        {gap.description}
      </p>

      <div className="talentCapabilityPath">
        <div>
          <span className="talentMicroLabel">
            CAPABILITY PATH
          </span>

          <strong
            className={
              path === "HIRE"
                ? "pathHire"
                : path ===
                    "MITIGATE"
                  ? "pathMitigate"
                  : ""
            }
          >
            {path}
          </strong>
        </div>

        <div className="talentPathArrow">
          →
        </div>

        <div>
          <span className="talentMicroLabel">
            EXECUTION
          </span>

          <strong>
            {path === "MITIGATE"
              ? mitigation ??
                "System / process"
              : search?.roleTitle ??
                "Needs review"}
          </strong>
        </div>
      </div>

      <div className="talentWhyBlock">
        <span className="talentMicroLabel">
          WHY NOW
        </span>

        <p>{gap.whyNow}</p>
      </div>

      <div className="talentWhyBlock">
        <span className="talentMicroLabel">
          BUSINESS IMPACT
        </span>

        <p>
          {gap.businessImpact}
        </p>
      </div>

      <div className="talentCardFooter">
        <div>
          <span>Owner</span>
          <strong>
            {getOwnerName(
              snapshot,
              gap.ownerId,
            )}
          </strong>
        </div>

        <div>
          <span>
            Active search
          </span>
          <strong>
            {search ? "Yes" : "No"}
          </strong>
        </div>

        <div>
          <span>
            Active candidates
          </span>
          <strong>
            {search
              ? activeCandidateCount(
                  snapshot,
                  search.id,
                )
              : 0}
          </strong>
        </div>
      </div>

      {assessment && (
        <div className="talentAssessmentReason">
          <span className="talentMicroLabel">
            SYSTEM ASSESSMENT
          </span>

          <p>
            {assessment.reasons.join(
              " ",
            )}
          </p>

          <span className="talentRecommendation">
            {humanize(
              assessment.recommendedAction,
            )}
          </span>
        </div>
      )}
    </article>
  );
}

function AttentionCard({
  item,
  index,
  snapshot,
}: {
  item: HiringAttentionItem;
  index: number;
  snapshot: TalentSnapshot;
}) {
  return (
    <article className="talentAttentionCard">
      <div className="talentAttentionNumber">
        {String(
          index + 1,
        ).padStart(2, "0")}
      </div>

      <div className="talentAttentionBody">
        <div className="talentAttentionMeta">
          <span
            className={`talentBadge ${priorityClass(
              item.priority,
            )}`}
          >
            {item.priority}
          </span>

          <span className="talentActionBadge">
            {item.action}
          </span>

          {item.decisionRequired && (
            <span className="talentHumanBadge">
              HUMAN JUDGMENT
            </span>
          )}
        </div>

        <h3>{item.title}</h3>

        <p>
          {item.summary}
        </p>

        <div className="talentAttentionGrid">
          <div>
            <span className="talentMicroLabel">
              WHY NOW
            </span>

            <p>{item.whyNow}</p>
          </div>

          <div>
            <span className="talentMicroLabel">
              NEXT ACTION
            </span>

            <p>
              {
                item.recommendedAction
              }
            </p>
          </div>
        </div>
      </div>

      <div className="talentAttentionOwner">
        <span>OWNER</span>

        <strong>
          {getOwnerName(
            snapshot,
            item.ownerId,
          )}
        </strong>

        <small>
          {item.dueAt
            ? formatDate(
                item.dueAt,
              )
            : item.decisionRequired
              ? "Decision queue"
              : "Open"}
        </small>
      </div>
    </article>
  );
}

function PipelineCard({
  search,
  snapshot,
}: {
  search: HiringSearch;
  snapshot: TalentSnapshot;
}) {
  const health =
    getPipelineHealth(
      snapshot,
      search.id,
    );

  const candidates =
    snapshot.candidates.filter(
      (candidate) =>
        candidate.searchId ===
        search.id,
    );

  return (
    <article className="talentPipelineCard">
      <div className="talentPipelineHeader">
        <div>
          <div className="talentBadgeRow">
            <span
              className={`talentBadge ${priorityClass(
                search.priority,
              )}`}
            >
              {search.priority}
            </span>

            <span
              className={`talentBadge ${healthClass(
                health?.health ??
                  "UNKNOWN",
              )}`}
            >
              {humanize(
                health?.health ??
                  "UNKNOWN",
              )}
            </span>
          </div>

          <h3>
            {search.roleTitle}
          </h3>
        </div>

        <div className="talentPipelineScore">
          <strong>
            {health?.score ?? 0}
          </strong>

          <span>
            PIPELINE HEALTH
          </span>
        </div>
      </div>

      <div className="talentPipelineSummary">
        <div>
          <span>Active</span>
          <strong>
            {health?.activeCandidates ??
              0}
          </strong>
        </div>

        <div>
          <span>
            Target depth
          </span>
          <strong>
            {
              search.targetPipelineDepth
            }
          </strong>
        </div>

        <div>
          <span>
            Final / offer
          </span>
          <strong>
            {health?.finalStageCandidates ??
              0}
          </strong>
        </div>

        <div>
          <span>Stale</span>
          <strong>
            {health?.staleCandidates ??
              0}
          </strong>
        </div>
      </div>

      <div className="talentPipelineFlow">
        {health?.stageCounts.map(
          (stage) => (
            <div
              className="talentPipelineStage"
              key={stage.stage}
            >
              <span>
                {humanize(
                  stage.stage,
                )}
              </span>

              <strong>
                {stage.count}
              </strong>
            </div>
          ),
        )}
      </div>

      <div className="talentCandidateMiniList">
        {candidates.map(
          (candidate) => (
            <div
              className="talentCandidateMini"
              key={candidate.id}
            >
              <div>
                <strong>
                  {
                    candidate.displayName
                  }
                </strong>

                <span>
                  {humanize(
                    candidate.recommendation,
                  )}
                </span>
              </div>

              <span
                className={`talentStage ${stageClass(
                  candidate.stage,
                )}`}
              >
                {humanize(
                  candidate.stage,
                )}
              </span>
            </div>
          ),
        )}
      </div>

      {health && (
        <div className="talentPipelineReasons">
          <span className="talentMicroLabel">
            OPERATING DIAGNOSIS
          </span>

          {health.reasons.map(
            (reason) => (
              <p key={reason}>
                {reason}
              </p>
            ),
          )}
        </div>
      )}

      <div className="talentPipelineFooter">
        <span>
          Opened{" "}
          {formatDate(
            search.openedAt,
          )}
        </span>

        <span>
          Target{" "}
          {formatDate(
            search.targetHireAt,
          )}
        </span>

        <span>
          Owner{" "}
          {getOwnerName(
            snapshot,
            search.ownerId,
          )}
        </span>
      </div>
    </article>
  );
}

function CandidateInspector({
  candidate,
  snapshot,
}: {
  candidate: TalentCandidate;
  snapshot: TalentSnapshot;
}) {
  const search =
    snapshot.searches.find(
      (item) =>
        item.id ===
        candidate.searchId,
    );

  const evidence =
    getCandidateEvidence(
      snapshot,
      candidate.id,
    );

  return (
    <div className="talentCandidateInspector">
      <div className="talentInspectorTop">
        <div>
          <span className="talentEyebrow">
            CANDIDATE EVIDENCE
          </span>

          <h3>
            {candidate.displayName}
          </h3>

          <p>
            {search?.roleTitle}
          </p>
        </div>

        <span
          className={`talentStage ${stageClass(
            candidate.stage,
          )}`}
        >
          {humanize(
            candidate.stage,
          )}
        </span>
      </div>

      {candidate.humanDecisionRequired && (
        <div className="talentHumanBoundary">
          <span>
            HUMAN DECISION BOUNDARY
          </span>

          <strong>
            Evidence can inform this decision. The system does not make the hire.
          </strong>
        </div>
      )}

      <div className="talentInspectorColumns">
        <div>
          <span className="talentMicroLabel">
            STRENGTHS
          </span>

          {candidate.strengths.length >
          0 ? (
            candidate.strengths.map(
              (item) => (
                <p
                  className="talentEvidenceBullet positive"
                  key={item}
                >
                  + {item}
                </p>
              ),
            )
          ) : (
            <p className="talentEmpty">
              No validated strengths recorded yet.
            </p>
          )}
        </div>

        <div>
          <span className="talentMicroLabel">
            OPEN QUESTIONS
          </span>

          {candidate.openQuestions
            .length > 0 ? (
            candidate.openQuestions.map(
              (item) => (
                <p
                  className="talentEvidenceBullet question"
                  key={item}
                >
                  ? {item}
                </p>
              ),
            )
          ) : (
            <p className="talentEmpty">
              No open questions recorded.
            </p>
          )}
        </div>

        <div>
          <span className="talentMicroLabel">
            RISKS
          </span>

          {candidate.risks.length >
          0 ? (
            candidate.risks.map(
              (item) => (
                <p
                  className="talentEvidenceBullet risk"
                  key={item}
                >
                  ! {item}
                </p>
              ),
            )
          ) : (
            <p className="talentEmpty">
              No explicit risks recorded.
            </p>
          )}
        </div>
      </div>

      <div className="talentEvidenceStack">
        <div className="talentEvidenceHeader">
          <span>
            INTERVIEW EVIDENCE
          </span>

          <span>
            {evidence.length} records
          </span>
        </div>

        {evidence.length === 0 ? (
          <div className="talentNoEvidence">
            Evidence has not yet been captured for this candidate. The system will not infer an assessment from absence.
          </div>
        ) : (
          evidence.map(
            (item) => (
              <article
                className="talentEvidenceRecord"
                key={item.id}
              >
                <div className="talentEvidenceRecordTop">
                  <strong>
                    {item.dimension}
                  </strong>

                  <span
                    className={`talentBadge ${assessmentClass(
                      item.assessment,
                    )}`}
                  >
                    {item.assessment}
                  </span>
                </div>

                <p>
                  {item.observation}
                </p>

                <div className="talentEvidenceMeta">
                  <span>
                    {humanize(
                      item.source,
                    )}
                  </span>

                  <span>
                    {formatDate(
                      item.observedAt,
                    )}
                  </span>

                  {item.interviewer && (
                    <span>
                      {item.interviewer}
                    </span>
                  )}
                </div>
              </article>
            ),
          )
        )}
      </div>

      <div className="talentInspectorFooter">
        <div>
          <span>Recommendation</span>
          <strong>
            {humanize(
              candidate.recommendation,
            )}
          </strong>
        </div>

        <div>
          <span>Owner</span>
          <strong>
            {getOwnerName(
              snapshot,
              candidate.ownerId,
            )}
          </strong>
        </div>

        <div>
          <span>Updated</span>
          <strong>
            {formatDate(
              candidate.updatedAt,
            )}
          </strong>
        </div>
      </div>
    </div>
  );
}

export default function TalentDashboard({
  snapshot,
}: TalentDashboardProps) {
  const firstDecisionCandidate =
    snapshot.candidates.find(
      (candidate) =>
        candidate.humanDecisionRequired,
    );

  const [selectedCandidateId, setSelectedCandidateId] =
    useState(
      firstDecisionCandidate?.id ??
        snapshot.candidates[0]
          ?.id ??
        "",
    );

  const selectedCandidate =
    useMemo(
      () =>
        snapshot.candidates.find(
          (candidate) =>
            candidate.id ===
            selectedCandidateId,
        ) ??
        snapshot.candidates[0],
      [
        selectedCandidateId,
        snapshot.candidates,
      ],
    );

  const unresolvedGaps =
    snapshot.capabilityGaps.filter(
      (gap) =>
        gap.status !== "CLOSED",
    );

  const hirePaths =
    unresolvedGaps.filter(
      (gap) =>
        Boolean(
          getSearch(
            snapshot,
            gap.id,
          ),
        ),
    ).length;

  const mitigationPaths =
    unresolvedGaps.filter(
      (gap) =>
        gap.status ===
        "MITIGATED",
    ).length;

  return (
    <main className="talentPage">
      <section className="talentHero">
        <div className="talentHeroCopy">
          <span className="talentEyebrow">
            WARP / CONTROL · TALENT INTELLIGENCE
          </span>

          <h1>
            Build the capability.
            <br />
            <span>
              Not the headcount.
            </span>
          </h1>

          <p>
            Start with the capability the company needs. Decide whether the answer is a hire, a system, automation or operating redesign. Then govern the hiring path with evidence.
          </p>
        </div>

        <div className="talentHeroSystem">
          <div className="talentSystemStatus">
            <span className="talentLiveDot" />

            DETERMINISTIC DEMO
          </div>

          <strong>
            Capability-first talent control
          </strong>

          <p>
            Architecture is live. Company and candidate state is modeled.
          </p>

          <div className="talentSystemFlow">
            <span>CAPABILITY</span>
            <b>→</b>
            <span>PATH</span>
            <b>→</b>
            <span>EVIDENCE</span>
            <b>→</b>
            <span>JUDGMENT</span>
          </div>
        </div>
      </section>

      <section className="talentBoundary">
        <div>
          <span className="talentEyebrow">
            INTELLIGENCE BOUNDARY
          </span>

          <p>
            {snapshot.disclaimer}
          </p>
        </div>

        <span className="talentGenerated">
          Generated{" "}
          {formatDateTime(
            snapshot.generatedAt,
          )}
        </span>
      </section>

      <section className="talentMetrics">
        <article>
          <span>
            Capability gaps
          </span>
          <strong>
            {
              snapshot.metrics
                .capabilityGaps
            }
          </strong>
          <small>
            active or mitigated
          </small>
        </article>

        <article>
          <span>
            Active searches
          </span>
          <strong>
            {
              snapshot.metrics
                .activeSearches
            }
          </strong>
          <small>
            deliberate hire paths
          </small>
        </article>

        <article>
          <span>
            Active candidates
          </span>
          <strong>
            {
              snapshot.metrics
                .activeCandidates
            }
          </strong>
          <small>
            across modeled searches
          </small>
        </article>

        <article>
          <span>
            At-risk searches
          </span>
          <strong>
            {
              snapshot.metrics
                .searchesAtRisk
            }
          </strong>
          <small>
            require intervention
          </small>
        </article>

        <article>
          <span>
            CEO decisions
          </span>
          <strong>
            {
              snapshot.metrics
                .humanDecisions
            }
          </strong>
          <small>
            human judgment required
          </small>
        </article>
      </section>

      <section className="talentSection">
        <div className="talentSectionHeader">
          <div>
            <span className="talentEyebrow">
              01 · CAPABILITY MAP
            </span>

            <h2>
              Should we hire at all?
            </h2>

            <p>
              Separate capability requirements from headcount requests before opening a role.
            </p>
          </div>

          <div className="talentSectionSignal">
            <div>
              <strong>
                {hirePaths}
              </strong>
              <span>
                HIRE PATHS
              </span>
            </div>

            <div>
              <strong>
                {mitigationPaths}
              </strong>
              <span>
                MITIGATED
              </span>
            </div>
          </div>
        </div>

        <div className="talentCapabilityGrid">
          {snapshot.capabilityGaps.map(
            (gap) => (
              <CapabilityCard
                key={gap.id}
                gap={gap}
                snapshot={snapshot}
              />
            ),
          )}
        </div>

        <div className="talentPrinciple">
          <span>
            OPERATING PRINCIPLE
          </span>

          <strong>
            Capability gap ≠ automatic headcount.
          </strong>

          <p>
            The system first asks whether the gap can be mitigated through tooling, automation, process or clearer ownership. Hiring becomes one execution path—not the default.
          </p>
        </div>
      </section>

      <section className="talentSection">
        <div className="talentSectionHeader">
          <div>
            <span className="talentEyebrow">
              02 · CEO HIRING ATTENTION
            </span>

            <h2>
              Where does judgment matter?
            </h2>

            <p>
              Deterministic operating rules surface decisions, stale execution and shallow pipelines without pretending to make the hiring decision.
            </p>
          </div>

          <div className="talentAttentionCount">
            <strong>
              {
                snapshot.attention
                  .length
              }
            </strong>

            <span>
              ITEMS SURFACED
            </span>
          </div>
        </div>

        <div className="talentAttentionList">
          {snapshot.attention.map(
            (item, index) => (
              <AttentionCard
                key={item.id}
                item={item}
                index={index}
                snapshot={snapshot}
              />
            ),
          )}
        </div>
      </section>

      <section className="talentSection">
        <div className="talentSectionHeader">
          <div>
            <span className="talentEyebrow">
              03 · PIPELINE INTELLIGENCE
            </span>

            <h2>
              Search health, not recruiter activity.
            </h2>

            <p>
              Depth, stage distribution, staleness and decision boundaries are evaluated against the capability the search exists to acquire.
            </p>
          </div>
        </div>

        <div className="talentPipelineGrid">
          {snapshot.searches.map(
            (search) => (
              <PipelineCard
                key={search.id}
                search={search}
                snapshot={snapshot}
              />
            ),
          )}
        </div>
      </section>

      <section className="talentSection">
        <div className="talentSectionHeader">
          <div>
            <span className="talentEyebrow">
              04 · CANDIDATE EVIDENCE
            </span>

            <h2>
              Evidence before opinion.
            </h2>

            <p>
              Interview observations remain visible, unresolved questions remain unresolved, and missing evidence is never converted into synthetic certainty.
            </p>
          </div>
        </div>

        <div className="talentEvidenceWorkspace">
          <aside className="talentCandidateRail">
            <div className="talentCandidateRailHeader">
              <span>
                CANDIDATES
              </span>

              <strong>
                {
                  snapshot.candidates
                    .length
                }
              </strong>
            </div>

            {snapshot.candidates.map(
              (candidate) => {
                const search =
                  snapshot.searches.find(
                    (item) =>
                      item.id ===
                      candidate.searchId,
                  );

                return (
                  <button
                    type="button"
                    key={candidate.id}
                    className={`talentCandidateButton ${
                      selectedCandidate?.id ===
                      candidate.id
                        ? "isSelected"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedCandidateId(
                        candidate.id,
                      )
                    }
                  >
                    <div>
                      <strong>
                        {
                          candidate.displayName
                        }
                      </strong>

                      <span>
                        {
                          search?.roleTitle
                        }
                      </span>
                    </div>

                    <span
                      className={`talentStage ${stageClass(
                        candidate.stage,
                      )}`}
                    >
                      {humanize(
                        candidate.stage,
                      )}
                    </span>
                  </button>
                );
              },
            )}
          </aside>

          {selectedCandidate && (
            <CandidateInspector
              candidate={
                selectedCandidate
              }
              snapshot={snapshot}
            />
          )}
        </div>
      </section>

      <section className="talentOperatingConnection">
        <div>
          <span className="talentEyebrow">
            05 · OPERATING CONNECTION
          </span>

          <h2>
            Hiring is part of the company operating system.
          </h2>

          <p>
            Talent does not live in a separate recruiting universe. Capability requirements originate in company goals and workstreams, pipeline failures become operating exceptions, and only genuine judgment reaches the CEO.
          </p>
        </div>

        <div className="talentOperatingFlow">
          <div>
            <span>01</span>
            <strong>
              COMPANY GOAL
            </strong>
          </div>

          <b>→</b>

          <div>
            <span>02</span>
            <strong>
              CAPABILITY GAP
            </strong>
          </div>

          <b>→</b>

          <div>
            <span>03</span>
            <strong>
              HIRE / MITIGATE
            </strong>
          </div>

          <b>→</b>

          <div>
            <span>04</span>
            <strong>
              EVIDENCE
            </strong>
          </div>

          <b>→</b>

          <div>
            <span>05</span>
            <strong>
              HUMAN JUDGMENT
            </strong>
          </div>

          <b>→</b>

          <div>
            <span>06</span>
            <strong>
              OUTCOME
            </strong>
          </div>
        </div>
      </section>

      <footer className="talentFooter">
        <span>
          WARP / CONTROL
        </span>

        <p>
          Capability → path → search → evidence → judgment → outcome
        </p>

        <span>
          TALENT INTELLIGENCE
        </span>
      </footer>
    </main>
  );
}