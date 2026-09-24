"use client";

import { useMemo, useState } from "react";
import type {
  ClaimValidationResult,
  CommunicationBrief,
  CommunicationClaim,
  CommunicationSection,
  CommunicationsSnapshot,
} from "@/domain/communications/types";

import "./communications-dashboard.css";

interface CommunicationsDashboardProps {
  snapshot: CommunicationsSnapshot;
}

type BriefId =
  | "brief-ceo-weekly"
  | "brief-team-weekly"
  | "brief-investor-demo"
  | "brief-external-demo";

const BRIEF_LABELS: Record<
  BriefId,
  {
    eyebrow: string;
    label: string;
    description: string;
  }
> = {
  "brief-ceo-weekly": {
    eyebrow: "INTERNAL",
    label: "CEO Brief",
    description:
      "What changed, what needs attention and where executive judgment is required.",
  },
  "brief-team-weekly": {
    eyebrow: "INTERNAL",
    label: "Team Update",
    description:
      "A governed operating update for company alignment.",
  },
  "brief-investor-demo": {
    eyebrow: "EXTERNAL",
    label: "Investor Update",
    description:
      "Only externally supportable claims survive the evidence boundary.",
  },
  "brief-external-demo": {
    eyebrow: "EXTERNAL",
    label: "External Narrative",
    description:
      "Public communication constrained by evidence and human approval.",
  },
};

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function validationFor(
  claimId: string,
  validations: ClaimValidationResult[],
) {
  return validations.find(
    (validation) =>
      validation.claimId === claimId,
  );
}

function claimFor(
  claimId: string,
  claims: CommunicationClaim[],
) {
  return claims.find(
    (claim) => claim.id === claimId,
  );
}

function StatusBadge({
  state,
}: {
  state: string;
}) {
  return (
    <span
      className={`comms-status comms-status--${state.toLowerCase()}`}
    >
      {titleCase(state)}
    </span>
  );
}

function BriefSelector({
  briefs,
  activeBriefId,
  onSelect,
}: {
  briefs: CommunicationBrief[];
  activeBriefId: string;
  onSelect: (id: BriefId) => void;
}) {
  return (
    <div className="comms-brief-selector">
      {briefs.map((brief) => {
        const config =
          BRIEF_LABELS[brief.id as BriefId];

        if (!config) {
          return null;
        }

        const active =
          brief.id === activeBriefId;

        return (
          <button
            key={brief.id}
            type="button"
            className={`comms-brief-option ${
              active
                ? "comms-brief-option--active"
                : ""
            }`}
            onClick={() =>
              onSelect(brief.id as BriefId)
            }
          >
            <div className="comms-brief-option__top">
              <span className="comms-micro">
                {config.eyebrow}
              </span>

              <span
                className={`comms-dot ${
                  brief.humanApprovalRequired
                    ? "comms-dot--review"
                    : "comms-dot--ready"
                }`}
              />
            </div>

            <strong>{config.label}</strong>

            <p>{config.description}</p>

            <div className="comms-brief-option__footer">
              <span>
                {brief.claimIds.length} claims
              </span>

              <span>
                {brief.blockedClaimIds.length} blocked
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ClaimRow({
  claim,
  validation,
  selected,
  onSelect,
}: {
  claim: CommunicationClaim;
  validation?: ClaimValidationResult;
  selected: boolean;
  onSelect: () => void;
}) {
  const state =
    validation?.state ?? claim.state;

  return (
    <button
      type="button"
      className={`comms-claim-row ${
        selected
          ? "comms-claim-row--selected"
          : ""
      }`}
      onClick={onSelect}
    >
      <div className="comms-claim-row__rail">
        <span
          className={`comms-claim-marker comms-claim-marker--${state.toLowerCase()}`}
        />
      </div>

      <div className="comms-claim-row__body">
        <p>{claim.statement}</p>

        <div className="comms-claim-row__meta">
          <StatusBadge state={state} />

          <span>
            {validation?.confidence ?? claim.confidence}%
            confidence
          </span>

          {validation?.humanReviewRequired && (
            <span>Human review</span>
          )}
        </div>
      </div>
    </button>
  );
}

function ClaimInspector({
  claim,
  validation,
  snapshot,
}: {
  claim?: CommunicationClaim;
  validation?: ClaimValidationResult;
  snapshot: CommunicationsSnapshot;
}) {
  if (!claim) {
    return (
      <aside className="comms-inspector">
        <div className="comms-empty">
          Select a claim to inspect its evidence.
        </div>
      </aside>
    );
  }

  const evidence = snapshot.sources.flatMap(
    (source) =>
      source.evidence
        .filter((item) =>
          claim.evidenceIds.includes(item.id),
        )
        .map((item) => ({
          ...item,
          sourceLabel: source.label,
        })),
  );

  return (
    <aside className="comms-inspector">
      <div className="comms-inspector__header">
        <div>
          <span className="comms-micro">
            CLAIM INSPECTOR
          </span>
          <h3>Why can we say this?</h3>
        </div>

        <StatusBadge
          state={
            validation?.state ?? claim.state
          }
        />
      </div>

      <div className="comms-inspector__statement">
        “{claim.statement}”
      </div>

      <div className="comms-inspector__grid">
        <div>
          <span>Confidence</span>
          <strong>
            {validation?.confidence ??
              claim.confidence}
            %
          </strong>
        </div>

        <div>
          <span>Risk</span>
          <strong>
            {validation?.risk ?? claim.risk}
          </strong>
        </div>

        <div>
          <span>Evidence</span>
          <strong>
            {validation?.evidenceCount ?? 0}
          </strong>
        </div>

        <div>
          <span>Sources</span>
          <strong>
            {validation?.independentSourceCount ??
              0}
          </strong>
        </div>
      </div>

      <div className="comms-inspector__section">
        <span className="comms-micro">
          COMMUNICATION BOUNDARY
        </span>

        <div className="comms-boundary-list">
          {validation?.allowedAudiences.length ? (
            validation.allowedAudiences.map(
              (audience) => (
                <span key={audience}>
                  {titleCase(audience)}
                </span>
              ),
            )
          ) : (
            <span className="comms-boundary-list__blocked">
              No audience cleared
            </span>
          )}
        </div>
      </div>

      <div className="comms-inspector__section">
        <span className="comms-micro">
          VALIDATION REASON
        </span>

        <div className="comms-reasons">
          {(validation?.reasons ?? [
            claim.reason,
          ]).map((reason) => (
            <p key={reason}>{reason}</p>
          ))}
        </div>
      </div>

      <div className="comms-inspector__section">
        <span className="comms-micro">
          EVIDENCE LINEAGE
        </span>

        {evidence.length ? (
          <div className="comms-evidence-list">
            {evidence.map((item) => (
              <div
                className="comms-evidence"
                key={item.id}
              >
                <div className="comms-evidence__top">
                  <StatusBadge
                    state={item.type}
                  />

                  <span>
                    {item.confidence}%
                  </span>
                </div>

                <strong>
                  {item.sourceLabel}
                </strong>

                <p>{item.claim}</p>

                <span className="comms-evidence__date">
                  Captured{" "}
                  {formatDate(item.capturedAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="comms-no-evidence">
            No evidence attached.
          </div>
        )}
      </div>

      <div className="comms-human-boundary">
        <span className="comms-micro">
          HUMAN DECISION BOUNDARY
        </span>

        <strong>
          Evidence informs. Humans approve.
        </strong>

        <p>
          WARP / CONTROL can assemble,
          validate and challenge the
          communication. It does not silently
          convert inference into company truth.
        </p>
      </div>
    </aside>
  );
}

function GeneratedBrief({
  brief,
  sections,
  claims,
  validations,
  selectedClaimId,
  onSelectClaim,
}: {
  brief: CommunicationBrief;
  sections: CommunicationSection[];
  claims: CommunicationClaim[];
  validations: ClaimValidationResult[];
  selectedClaimId?: string;
  onSelectClaim: (id: string) => void;
}) {
  const briefSections = sections
    .filter((section) =>
      brief.sectionIds.includes(section.id),
    )
    .sort((a, b) => a.order - b.order);

  return (
    <div className="comms-generated">
      <div className="comms-generated__header">
        <div>
          <span className="comms-micro">
            GENERATED COMMUNICATION
          </span>

          <h2>{brief.title}</h2>

          <p>{brief.summary}</p>
        </div>

        <div className="comms-approval-state">
          <span>Approval state</span>
          <strong>
            {titleCase(brief.approvalState)}
          </strong>
        </div>
      </div>

      <div className="comms-generated__meta">
        <span>
          Audience{" "}
          <strong>
            {titleCase(brief.audience)}
          </strong>
        </span>

        <span>
          Purpose{" "}
          <strong>
            {titleCase(brief.purpose)}
          </strong>
        </span>

        <span>
          Generated{" "}
          <strong>
            {formatDate(brief.generatedAt)}
          </strong>
        </span>
      </div>

      <div className="comms-document">
        {briefSections.map((section) => (
          <section
            className="comms-document-section"
            key={section.id}
          >
            <div className="comms-document-section__heading">
              <span>
                {String(section.order + 1).padStart(
                  2,
                  "0",
                )}
              </span>

              <h3>{section.title}</h3>
            </div>

            <div className="comms-document-section__claims">
              {section.claimIds.map(
                (claimId) => {
                  const claim = claimFor(
                    claimId,
                    claims,
                  );

                  if (!claim) {
                    return null;
                  }

                  return (
                    <ClaimRow
                      key={claim.id}
                      claim={claim}
                      validation={validationFor(
                        claim.id,
                        validations,
                      )}
                      selected={
                        selectedClaimId ===
                        claim.id
                      }
                      onSelect={() =>
                        onSelectClaim(claim.id)
                      }
                    />
                  );
                },
              )}
            </div>
          </section>
        ))}
      </div>

      {brief.humanApprovalRequired && (
        <div className="comms-approval-gate">
          <div>
            <span className="comms-micro">
              APPROVAL GATE
            </span>

            <strong>
              Human approval required before
              release.
            </strong>

            <p>
              External communication never
              publishes automatically. The
              system prepares the evidence and
              identifies what requires judgment.
            </p>
          </div>

          <div className="comms-approval-gate__action">
            HUMAN REVIEW
          </div>
        </div>
      )}
    </div>
  );
}

export default function CommunicationsDashboard({
  snapshot,
}: CommunicationsDashboardProps) {
  const availableBriefs =
    snapshot.briefs.filter((brief) =>
      Object.prototype.hasOwnProperty.call(
        BRIEF_LABELS,
        brief.id,
      ),
    );

  const initialBrief =
    availableBriefs[0];

  const [activeBriefId, setActiveBriefId] =
    useState<BriefId>(
      (initialBrief?.id ??
        "brief-ceo-weekly") as BriefId,
    );

  const activeBrief = useMemo(
    () =>
      availableBriefs.find(
        (brief) =>
          brief.id === activeBriefId,
      ) ?? availableBriefs[0],
    [availableBriefs, activeBriefId],
  );

  const firstClaimId =
    activeBrief?.claimIds[0];

  const [selectedClaimId, setSelectedClaimId] =
    useState<string | undefined>(
      firstClaimId,
    );

  const selectedClaim =
    snapshot.claims.find(
      (claim) =>
        claim.id === selectedClaimId,
    );

  const selectedValidation =
    selectedClaim
      ? validationFor(
          selectedClaim.id,
          snapshot.validations,
        )
      : undefined;

  function selectBrief(id: BriefId) {
    setActiveBriefId(id);

    const brief =
      availableBriefs.find(
        (item) => item.id === id,
      );

    setSelectedClaimId(
      brief?.claimIds[0],
    );
  }

  const blockedClaims =
    snapshot.validations
      .filter(
        (validation) =>
          validation.state === "BLOCKED",
      )
      .map((validation) => ({
        validation,
        claim: snapshot.claims.find(
          (claim) =>
            claim.id ===
            validation.claimId,
        ),
      }))
      .filter(
        (
          item,
        ): item is {
          validation: ClaimValidationResult;
          claim: CommunicationClaim;
        } => Boolean(item.claim),
      );

  return (
    <main className="communications-page">
      <section className="comms-hero">
        <div className="comms-hero__copy">
          <span className="comms-kicker">
            EXECUTIVE COMMUNICATIONS
          </span>

          <h1>
            Turn company state into
            communication you can stand
            behind.
          </h1>

          <p>
            WARP / CONTROL assembles executive
            communication from governed company
            evidence, validates every claim,
            blocks unsupported statements and
            preserves human judgment where it
            belongs.
          </p>
        </div>

        <div className="comms-hero__architecture">
          <span className="comms-micro">
            COMMUNICATION CONTROL PLANE
          </span>

          <div className="comms-architecture-flow">
            <span>Company state</span>
            <i>→</i>
            <span>Claim</span>
            <i>→</i>
            <span>Evidence</span>
            <i>→</i>
            <span>Audience</span>
            <i>→</i>
            <strong>Human approval</strong>
          </div>

          <p>
            Architecture is live. Company state
            shown in this module is a governed
            demonstration unless explicitly
            supported by public evidence.
          </p>
        </div>
      </section>

      <section className="comms-boundary-banner">
        <div>
          <span className="comms-micro">
            INTELLIGENCE BOUNDARY
          </span>

          <strong>
            Demo state is not WarpBuild company
            truth.
          </strong>
        </div>

        <p>{snapshot.disclaimer}</p>
      </section>

      <section className="comms-metrics">
        <div>
          <span>Total claims</span>
          <strong>
            {snapshot.metrics.totalClaims}
          </strong>
        </div>

        <div>
          <span>Supported</span>
          <strong>
            {snapshot.metrics.supportedClaims}
          </strong>
        </div>

        <div>
          <span>Modeled</span>
          <strong>
            {snapshot.metrics.modeledClaims}
          </strong>
        </div>

        <div>
          <span>Needs evidence</span>
          <strong>
            {snapshot.metrics.needsEvidenceClaims}
          </strong>
        </div>

        <div>
          <span>Blocked</span>
          <strong>
            {snapshot.metrics.blockedClaims}
          </strong>
        </div>

        <div>
          <span>Human review</span>
          <strong>
            {snapshot.metrics.humanReviewClaims}
          </strong>
        </div>
      </section>

      <section className="comms-section">
        <div className="comms-section-heading">
          <div>
            <span className="comms-kicker">
              COMMUNICATION CONTROL
            </span>

            <h2>
              One company state. Different
              communication boundaries.
            </h2>
          </div>

          <p>
            Select an audience. The underlying
            state does not change; what the
            system is permitted to say does.
          </p>
        </div>

        <BriefSelector
          briefs={availableBriefs}
          activeBriefId={
            activeBrief?.id ?? ""
          }
          onSelect={selectBrief}
        />
      </section>

      {activeBrief && (
        <section className="comms-workspace">
          <GeneratedBrief
            brief={activeBrief}
            sections={snapshot.sections}
            claims={snapshot.claims}
            validations={snapshot.validations}
            selectedClaimId={selectedClaimId}
            onSelectClaim={setSelectedClaimId}
          />

          <ClaimInspector
            claim={selectedClaim}
            validation={selectedValidation}
            snapshot={snapshot}
          />
        </section>
      )}

      <section className="comms-section">
        <div className="comms-section-heading">
          <div>
            <span className="comms-kicker">
              COMMUNICATION FIREWALL
            </span>

            <h2>
              What the system refused to say.
            </h2>
          </div>

          <p>
            A useful executive AI system must be
            able to abstain. These claims failed
            the evidence boundary.
          </p>
        </div>

        <div className="comms-blocked-grid">
          {blockedClaims.map(
            ({ claim, validation }) => (
              <article
                className="comms-blocked-card"
                key={claim.id}
              >
                <div className="comms-blocked-card__top">
                  <StatusBadge state="BLOCKED" />

                  <span>
                    {validation.confidence}%
                    confidence
                  </span>
                </div>

                <h3>
                  “{claim.statement}”
                </h3>

                <div className="comms-blocked-card__reason">
                  {validation.reasons.map(
                    (reason) => (
                      <p key={reason}>
                        {reason}
                      </p>
                    ),
                  )}
                </div>

                <div className="comms-blocked-card__footer">
                  <span>
                    Evidence{" "}
                    {validation.evidenceCount}
                  </span>

                  <span>
                    Sources{" "}
                    {
                      validation.independentSourceCount
                    }
                  </span>

                  <strong>
                    NOT RELEASED
                  </strong>
                </div>
              </article>
            ),
          )}
        </div>
      </section>

      <section className="comms-system-flow">
        <div className="comms-section-heading">
          <div>
            <span className="comms-kicker">
              EVIDENCE PIPELINE
            </span>

            <h2>
              Communication is the final layer,
              not the source of truth.
            </h2>
          </div>

          <p>
            The writing layer sits downstream of
            company intelligence. It cannot
            promote a weak assumption into a
            stronger fact.
          </p>
        </div>

        <div className="comms-system-flow__track">
          {[
            [
              "01",
              "Company systems",
              "Goals, experiments, GTM, economics, market and talent.",
            ],
            [
              "02",
              "Evidence",
              "Public, connected, internal, modeled or assumed.",
            ],
            [
              "03",
              "Claim",
              "A precise statement proposed for communication.",
            ],
            [
              "04",
              "Validation",
              "Support, confidence, risk and corroboration checked.",
            ],
            [
              "05",
              "Audience",
              "Different evidence boundaries by communication context.",
            ],
            [
              "06",
              "Human approval",
              "Judgment remains with the accountable operator.",
            ],
          ].map(
            ([number, title, copy]) => (
              <div
                className="comms-system-node"
                key={number}
              >
                <span>{number}</span>
                <strong>{title}</strong>
                <p>{copy}</p>
              </div>
            ),
          )}
        </div>
      </section>

      <section className="comms-history">
        <div className="comms-section-heading">
          <div>
            <span className="comms-kicker">
              COMMUNICATION HISTORY
            </span>

            <h2>
              A reviewable record of what the
              company said.
            </h2>
          </div>

          <p>
            Briefs preserve audience, claims,
            blocked statements and approval
            requirements for later review.
          </p>
        </div>

        <div className="comms-history-table">
          <div className="comms-history-row comms-history-row--head">
            <span>Communication</span>
            <span>Audience</span>
            <span>Claims</span>
            <span>Blocked</span>
            <span>Approval</span>
          </div>

          {availableBriefs.map((brief) => (
            <button
              type="button"
              className="comms-history-row"
              key={brief.id}
              onClick={() =>
                selectBrief(
                  brief.id as BriefId,
                )
              }
            >
              <strong>{brief.title}</strong>

              <span>
                {titleCase(brief.audience)}
              </span>

              <span>
                {brief.claimIds.length}
              </span>

              <span>
                {brief.blockedClaimIds.length}
              </span>

              <StatusBadge
                state={brief.approvalState}
              />
            </button>
          ))}
        </div>
      </section>

      <footer className="comms-footer">
        <span>WARP / CONTROL</span>

        <p>
          Company Brain knows → operating systems
          compute → agents investigate → decisions
          escalate → communications explain.
        </p>
      </footer>
    </main>
  );
}