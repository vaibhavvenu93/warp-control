import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  ClaimValidationResult,
  CommunicationClaim,
} from "@/domain/communications/types";

import {
  buildCommunicationBrief,
  renderBriefText,
} from "@/domain/communications/brief-engine";

const now =
  "2026-09-24T12:00:00.000Z";

function claim(
  id: string,
  statement: string,
  section: CommunicationClaim["section"],
  audience: CommunicationClaim["audience"],
): CommunicationClaim {
  return {
    id,
    statement,
    section,
    evidenceIds: [
      `evidence-${id}`,
    ],
    sourceIds: [
      `source-${id}`,
    ],
    evidenceTypes: [
      "INTERNAL",
    ],
    state: "SUPPORTED",
    risk: "MEDIUM",
    confidence: 90,
    confidenceLevel: "HIGH",
    audience,
    humanReviewRequired: false,
    reason: "test",
    createdAt: now,
  };
}

function validation(
  claimId: string,
  overrides: Partial<ClaimValidationResult> = {},
): ClaimValidationResult {
  return {
    claimId,
    state: "SUPPORTED",
    risk: "MEDIUM",
    confidence: 90,
    confidenceLevel: "HIGH",
    evidenceCount: 1,
    independentSourceCount: 1,
    hasPublicEvidence: false,
    hasConnectedEvidence: false,
    hasInternalEvidence: true,
    hasModeledEvidence: false,
    hasAssumedEvidence: false,
    allowedAudiences: [
      "CEO",
      "LEADERSHIP",
      "TEAM",
      "INVESTOR",
      "CUSTOMER",
      "PUBLIC",
    ],
    humanReviewRequired: false,
    reasons: [
      "Supported.",
    ],
    ...overrides,
  };
}

describe(
  "communication brief engine",
  () => {
    it(
      "assembles claims for the requested audience",
      () => {
        const claims = [
          claim(
            "claim-1",
            "Operating health requires attention.",
            "EXECUTIVE_SUMMARY",
            ["CEO"],
          ),
          claim(
            "claim-2",
            "Team update.",
            "PROGRESS",
            ["TEAM"],
          ),
        ];

        const result =
          buildCommunicationBrief({
            id: "brief-1",
            title:
              "CEO Operating Brief",
            type: "CEO_BRIEF",
            purpose:
              "OPERATING_REVIEW",
            audience: "CEO",
            generatedAt: now,
            claims,
            validations: [
              validation(
                "claim-1",
              ),
              validation(
                "claim-2",
              ),
            ],
            disclaimer: "Demo",
          });

        expect(
          result.brief.claimIds,
        ).toEqual([
          "claim-1",
        ]);
      },
    );

    it(
      "removes blocked claims from the assembled brief",
      () => {
        const claims = [
          claim(
            "claim-1",
            "Unsupported external statement.",
            "PROGRESS",
            ["INVESTOR"],
          ),
        ];

        const result =
          buildCommunicationBrief({
            id: "brief-1",
            title:
              "Investor Update",
            type:
              "INVESTOR_UPDATE",
            purpose:
              "INVESTOR_REPORTING",
            audience:
              "INVESTOR",
            generatedAt: now,
            claims,
            validations: [
              validation(
                "claim-1",
                {
                  state:
                    "BLOCKED",
                  allowedAudiences:
                    [],
                  humanReviewRequired:
                    true,
                },
              ),
            ],
            disclaimer: "Demo",
          });

        expect(
          result.brief.claimIds,
        ).toHaveLength(0);

        expect(
          result.brief
            .blockedClaimIds,
        ).toEqual([
          "claim-1",
        ]);
      },
    );

    it(
      "requires human approval for investor communication",
      () => {
        const claims = [
          claim(
            "claim-1",
            "Supported progress.",
            "PROGRESS",
            ["INVESTOR"],
          ),
        ];

        const result =
          buildCommunicationBrief({
            id: "brief-1",
            title:
              "Investor Update",
            type:
              "INVESTOR_UPDATE",
            purpose:
              "INVESTOR_REPORTING",
            audience:
              "INVESTOR",
            generatedAt: now,
            claims,
            validations: [
              validation(
                "claim-1",
              ),
            ],
            disclaimer: "Demo",
          });

        expect(
          result.brief
            .humanApprovalRequired,
        ).toBe(true);

        expect(
          result.brief
            .approvalState,
        ).toBe(
          "REVIEW_REQUIRED",
        );
      },
    );

    it(
      "creates sections in deterministic order",
      () => {
        const claims = [
          claim(
            "risk",
            "Risk.",
            "RISKS",
            ["CEO"],
          ),
          claim(
            "summary",
            "Summary.",
            "EXECUTIVE_SUMMARY",
            ["CEO"],
          ),
        ];

        const result =
          buildCommunicationBrief({
            id: "brief-1",
            title: "Brief",
            type: "CEO_BRIEF",
            purpose:
              "OPERATING_REVIEW",
            audience: "CEO",
            generatedAt: now,
            claims,
            validations: [
              validation("risk"),
              validation(
                "summary",
              ),
            ],
            disclaimer: "Demo",
          });

        expect(
          result.sections.map(
            (section) =>
              section.type,
          ),
        ).toEqual([
          "EXECUTIVE_SUMMARY",
          "RISKS",
        ]);
      },
    );

    it(
      "renders only claims included in the brief",
      () => {
        const claims = [
          claim(
            "claim-1",
            "Included statement.",
            "PROGRESS",
            ["CEO"],
          ),
          claim(
            "claim-2",
            "Other audience.",
            "PROGRESS",
            ["TEAM"],
          ),
        ];

        const result =
          buildCommunicationBrief({
            id: "brief-1",
            title: "CEO Brief",
            type: "CEO_BRIEF",
            purpose:
              "OPERATING_REVIEW",
            audience: "CEO",
            generatedAt: now,
            claims,
            validations: [
              validation(
                "claim-1",
              ),
              validation(
                "claim-2",
              ),
            ],
            disclaimer: "Demo",
          });

        const text =
          renderBriefText(
            result.brief,
            result.sections,
            claims,
          );

        expect(text).toContain(
          "Included statement.",
        );

        expect(text).not.toContain(
          "Other audience.",
        );
      },
    );
  },
);