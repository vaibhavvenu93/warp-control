import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  EvidenceRef,
} from "@/domain/types";

import type {
  CommunicationClaim,
} from "@/domain/communications/types";

import {
  validateCommunicationClaim,
} from "@/domain/communications/claim-validator";

const now =
  "2026-09-24T12:00:00.000Z";

function claim(
  overrides: Partial<CommunicationClaim> = {},
): CommunicationClaim {
  return {
    id: "claim-1",
    statement:
      "Enterprise readiness requires additional security evidence.",
    section: "RISKS",
    evidenceIds: [],
    sourceIds: [],
    evidenceTypes: [],
    state: "NEEDS_EVIDENCE",
    risk: "MEDIUM",
    confidence: 0,
    confidenceLevel: "LOW",
    audience: ["CEO"],
    humanReviewRequired: false,
    reason: "test",
    createdAt: now,
    ...overrides,
  };
}

function evidence(
  overrides: Partial<EvidenceRef> = {},
): EvidenceRef {
  return {
    id: "evidence-1",
    type: "INTERNAL",
    source:
      "Company Operating System",
    capturedAt: now,
    claim:
      "Enterprise readiness workstream is blocked by security evidence requirements.",
    confidence: 90,
    ...overrides,
  };
}

describe(
  "communication claim validator",
  () => {
    it(
      "marks factual internal evidence as supported",
      () => {
        const result =
          validateCommunicationClaim({
            claim: claim({
              evidenceIds: [
                "evidence-1",
              ],
            }),
            evidence: [
              evidence(),
            ],
          });

        expect(
          result.state,
        ).toBe("SUPPORTED");

        expect(
          result.hasInternalEvidence,
        ).toBe(true);
      },
    );

    it(
      "marks modeled-only evidence as modeled for internal audiences",
      () => {
        const result =
          validateCommunicationClaim({
            claim: claim({
              evidenceIds: [
                "evidence-1",
              ],
            }),
            evidence: [
              evidence({
                type: "MODELED",
              }),
            ],
          });

        expect(
          result.state,
        ).toBe("MODELED");
      },
    );

    it(
      "requires evidence when none is linked",
      () => {
        const result =
          validateCommunicationClaim({
            claim: claim(),
            evidence: [],
          });

        expect(
          result.state,
        ).toBe(
          "NEEDS_EVIDENCE",
        );
      },
    );

    it(
      "does not treat assumed evidence as established fact",
      () => {
        const result =
          validateCommunicationClaim({
            claim: claim({
              evidenceIds: [
                "evidence-1",
              ],
            }),
            evidence: [
              evidence({
                type: "ASSUMED",
              }),
            ],
          });

        expect(
          result.state,
        ).toBe(
          "NEEDS_EVIDENCE",
        );
      },
    );

    it(
      "blocks modeled claims for investors",
      () => {
        const result =
          validateCommunicationClaim({
            claim: claim({
              audience: [
                "INVESTOR",
              ],
              evidenceIds: [
                "evidence-1",
              ],
            }),
            evidence: [
              evidence({
                type: "MODELED",
              }),
            ],
          });

        expect(
          result.state,
        ).toBe("BLOCKED");
      },
    );

    it(
      "blocks assumed claims for public communication",
      () => {
        const result =
          validateCommunicationClaim({
            claim: claim({
              audience: ["PUBLIC"],
              evidenceIds: [
                "evidence-1",
              ],
            }),
            evidence: [
              evidence({
                type: "ASSUMED",
              }),
            ],
          });

        expect(
          result.state,
        ).toBe("BLOCKED");
      },
    );

    it(
      "allows supported factual claims for investors",
      () => {
        const result =
          validateCommunicationClaim({
            claim: claim({
              audience: [
                "INVESTOR",
              ],
              evidenceIds: [
                "evidence-1",
              ],
            }),
            evidence: [
              evidence({
                type: "INTERNAL",
              }),
            ],
          });

        expect(
          result.state,
        ).toBe("SUPPORTED");

        expect(
          result.allowedAudiences,
        ).toContain(
          "INVESTOR",
        );
      },
    );

    it(
      "requires human review for high-risk external claims",
      () => {
        const result =
          validateCommunicationClaim({
            claim: claim({
              audience: ["PUBLIC"],
              evidenceIds: [
                "evidence-1",
              ],
            }),
            evidence: [
              evidence({
                type: "PUBLIC",
              }),
            ],
          });

        expect(
          result.humanReviewRequired,
        ).toBe(true);
      },
    );

    it(
      "adds confidence when independent sources corroborate",
      () => {
        const result =
          validateCommunicationClaim({
            claim: claim({
              evidenceIds: [
                "evidence-1",
                "evidence-2",
              ],
            }),
            evidence: [
              evidence({
                id: "evidence-1",
                source:
                  "Operating System",
                confidence: 80,
              }),
              evidence({
                id: "evidence-2",
                source:
                  "Connected Finance",
                confidence: 80,
              }),
            ],
          });

        expect(
          result.independentSourceCount,
        ).toBe(2);

        expect(
          result.confidence,
        ).toBeGreaterThan(80);
      },
    );
  },
);