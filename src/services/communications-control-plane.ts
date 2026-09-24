import {
  buildCommunicationBrief,
  renderBriefText,
} from "@/domain/communications/brief-engine";

import {
  validateCommunicationClaims,
} from "@/domain/communications/claim-validator";

import type {
  CommunicationAudience,
  CommunicationBrief,
  CommunicationMetrics,
  CommunicationPurpose,
  CommunicationsSnapshot,
  CommunicationType,
} from "@/domain/communications/types";

import {
  COMMUNICATIONS_DEMO_DISCLAIMER,
  COMMUNICATIONS_DEMO_NOW,
  communicationsDemoClaims,
  communicationsDemoEvidence,
  communicationsDemoSources,
} from "@/data/demo/communications/communications-scenario";

import {
  InMemoryCommunicationsRepository,
  type CommunicationsRepository,
} from "@/repositories/communications/communications-repository";

export interface GenerateBriefInput {
  id: string;
  title: string;

  type: CommunicationType;
  purpose: CommunicationPurpose;
  audience: CommunicationAudience;

  periodStart?: string;
  periodEnd?: string;
}

function calculateMetrics(
  validations: ReturnType<
    typeof validateCommunicationClaims
  >,
): CommunicationMetrics {
  const supportedClaims =
    validations.filter(
      (item) =>
        item.state ===
        "SUPPORTED",
    ).length;

  const modeledClaims =
    validations.filter(
      (item) =>
        item.state === "MODELED",
    ).length;

  const needsEvidenceClaims =
    validations.filter(
      (item) =>
        item.state ===
        "NEEDS_EVIDENCE",
    ).length;

  const blockedClaims =
    validations.filter(
      (item) =>
        item.state === "BLOCKED",
    ).length;

  const humanReviewClaims =
    validations.filter(
      (item) =>
        item.humanReviewRequired,
    ).length;

  const publishableClaims =
    validations.filter(
      (item) =>
        item.state ===
        "SUPPORTED",
    ).length;

  return {
    totalClaims:
      validations.length,
    supportedClaims,
    modeledClaims,
    needsEvidenceClaims,
    blockedClaims,
    humanReviewClaims,
    publishableClaims,
  };
}

export class CommunicationsControlPlane {
  constructor(
    private readonly repository: CommunicationsRepository,
  ) {}

  async getSnapshot(): Promise<CommunicationsSnapshot> {
    const stored =
      await this.repository.getSnapshot();

    const validations =
      validateCommunicationClaims(
        stored.claims,
        communicationsDemoEvidence,
      );

    return {
      generatedAt:
        COMMUNICATIONS_DEMO_NOW,

      sources:
        stored.sources,

      claims:
        stored.claims,

      validations,

      sections:
        stored.sections,

      briefs:
        stored.briefs,

      approvals:
        stored.approvals,

      metrics:
        calculateMetrics(
          validations,
        ),

      disclaimer:
        COMMUNICATIONS_DEMO_DISCLAIMER,
    };
  }

  async generateBrief(
    input: GenerateBriefInput,
  ): Promise<CommunicationBrief> {
    const stored =
      await this.repository.getSnapshot();

    const validations =
      validateCommunicationClaims(
        stored.claims,
        communicationsDemoEvidence,
      );

    const result =
      buildCommunicationBrief({
        ...input,

        generatedAt:
          COMMUNICATIONS_DEMO_NOW,

        claims: stored.claims,

        validations,

        disclaimer:
          COMMUNICATIONS_DEMO_DISCLAIMER,
      });

    for (
      const section of
      result.sections
    ) {
      await this.repository.saveSection(
        section,
      );
    }

    await this.repository.saveBrief(
      result.brief,
    );

    return result.brief;
  }

  async renderBrief(
    briefId: string,
  ): Promise<string> {
    const stored =
      await this.repository.getSnapshot();

    const brief =
      stored.briefs.find(
        (item) =>
          item.id === briefId,
      );

    if (!brief) {
      throw new Error(
        `Communication brief not found: ${briefId}`,
      );
    }

    return renderBriefText(
      brief,
      stored.sections,
      stored.claims,
    );
  }

  async approveBrief(
    briefId: string,
    reviewer: string,
    note?: string,
  ): Promise<CommunicationBrief> {
    const brief =
      await this.repository.getBrief(
        briefId,
      );

    if (!brief) {
      throw new Error(
        `Communication brief not found: ${briefId}`,
      );
    }

    if (
      brief.blockedClaimIds.length >
      0
    ) {
      throw new Error(
        "Brief cannot be approved while blocked claims remain.",
      );
    }

    const approved: CommunicationBrief =
      {
        ...brief,
        approvalState:
          "APPROVED",
      };

    await this.repository.saveBrief(
      approved,
    );

    await this.repository.saveApproval({
      id: `approval-${briefId}-${Date.now()}`,
      briefId,
      state: "APPROVED",
      reviewer,
      note,
      createdAt:
        COMMUNICATIONS_DEMO_NOW,
    });

    return approved;
  }
}

export async function buildCommunicationsDemo(): Promise<CommunicationsControlPlane> {
  const repository =
    new InMemoryCommunicationsRepository(
      {
        sources:
          communicationsDemoSources,

        claims:
          communicationsDemoClaims,
      },
    );

  const controlPlane =
    new CommunicationsControlPlane(
      repository,
    );

  await controlPlane.generateBrief({
    id: "brief-ceo-weekly",
    title:
      "CEO Weekly Operating Brief",
    type: "CEO_BRIEF",
    purpose:
      "OPERATING_REVIEW",
    audience: "CEO",
    periodStart:
      "2026-09-17T00:00:00.000Z",
    periodEnd:
      COMMUNICATIONS_DEMO_NOW,
  });

  await controlPlane.generateBrief({
    id: "brief-team-weekly",
    title:
      "Team Weekly Update",
    type: "TEAM_UPDATE",
    purpose: "ALIGNMENT",
    audience: "TEAM",
    periodStart:
      "2026-09-17T00:00:00.000Z",
    periodEnd:
      COMMUNICATIONS_DEMO_NOW,
  });

  await controlPlane.generateBrief({
    id: "brief-investor-demo",
    title:
      "Investor Update — Governed Demo",
    type:
      "INVESTOR_UPDATE",
    purpose:
      "INVESTOR_REPORTING",
    audience: "INVESTOR",
    periodStart:
      "2026-09-01T00:00:00.000Z",
    periodEnd:
      COMMUNICATIONS_DEMO_NOW,
  });

  await controlPlane.generateBrief({
    id: "brief-external-demo",
    title:
      "External Narrative — Governed Demo",
    type:
      "EXTERNAL_NARRATIVE",
    purpose:
      "EXTERNAL_COMMUNICATION",
    audience: "PUBLIC",
    periodStart:
      "2026-09-01T00:00:00.000Z",
    periodEnd:
      COMMUNICATIONS_DEMO_NOW,
  });

  return controlPlane;
}