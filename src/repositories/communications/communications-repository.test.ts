import {
  describe,
  expect,
  it,
} from "vitest";

import {
  InMemoryCommunicationsRepository,
} from "@/repositories/communications/communications-repository";

import type {
  CommunicationBrief,
  CommunicationClaim,
} from "@/domain/communications/types";

const now =
  "2026-09-24T12:00:00.000Z";

function brief(): CommunicationBrief {
  return {
    id: "brief-1",
    title: "CEO Brief",
    type: "CEO_BRIEF",
    purpose:
      "OPERATING_REVIEW",
    audience: "CEO",
    generatedAt: now,
    sectionIds: [],
    claimIds: [],
    blockedClaimIds: [],
    reviewRequiredClaimIds: [],
    approvalState: "DRAFT",
    humanApprovalRequired:
      false,
    summary: "Summary",
    disclaimer: "Demo",
  };
}

function claim(): CommunicationClaim {
  return {
    id: "claim-1",
    statement: "Statement",
    section:
      "EXECUTIVE_SUMMARY",
    evidenceIds: [],
    sourceIds: [],
    evidenceTypes: [],
    state:
      "NEEDS_EVIDENCE",
    risk: "MEDIUM",
    confidence: 0,
    confidenceLevel: "LOW",
    audience: ["CEO"],
    humanReviewRequired:
      false,
    reason: "test",
    createdAt: now,
  };
}

describe(
  "communications repository",
  () => {
    it(
      "stores and retrieves briefs",
      async () => {
        const repository =
          new InMemoryCommunicationsRepository();

        await repository.saveBrief(
          brief(),
        );

        expect(
          await repository.getBrief(
            "brief-1",
          ),
        ).toEqual(brief());
      },
    );

    it(
      "stores claims",
      async () => {
        const repository =
          new InMemoryCommunicationsRepository();

        await repository.saveClaim(
          claim(),
        );

        const snapshot =
          await repository.getSnapshot();

        expect(
          snapshot.claims,
        ).toHaveLength(1);
      },
    );

    it(
      "returns defensive copies",
      async () => {
        const repository =
          new InMemoryCommunicationsRepository(
            {
              briefs: [brief()],
            },
          );

        const first =
          await repository.getSnapshot();

        first.briefs[0].title =
          "Mutated";

        const second =
          await repository.getSnapshot();

        expect(
          second.briefs[0].title,
        ).toBe("CEO Brief");
      },
    );

    it(
      "stores approval history",
      async () => {
        const repository =
          new InMemoryCommunicationsRepository();

        await repository.saveApproval({
          id: "approval-1",
          briefId: "brief-1",
          state: "APPROVED",
          reviewer: "CEO",
          createdAt: now,
        });

        const snapshot =
          await repository.getSnapshot();

        expect(
          snapshot.approvals,
        ).toHaveLength(1);
      },
    );
  },
);