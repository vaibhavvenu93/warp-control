import {
  describe,
  expect,
  it,
} from "vitest";

import {
  assessCapabilityGap,
  assessCapabilityPortfolio,
} from "@/domain/talent/capacity-engine";

import type {
  CapabilityGap,
  HiringSearch,
  TalentCandidate,
} from "@/domain/talent/types";

const gap: CapabilityGap = {
  id: "gap-1",
  capability:
    "Enterprise technical GTM",
  description:
    "Technical discovery capability.",
  status: "SEARCH_ACTIVE",
  priority: "HIGH",
  whyNow:
    "Enterprise motion requires it.",
  businessImpact:
    "Improves technical discovery.",
  ownerId: "owner-cos",
  relatedGoalIds: [],
  relatedWorkstreamIds: [],
};

const search: HiringSearch = {
  id: "search-1",
  roleTitle:
    "Technical GTM Lead",
  capabilityGapId:
    "gap-1",
  status: "ACTIVE",
  priority: "HIGH",
  ownerId: "owner-cos",
  openedAt:
    "2026-09-01T00:00:00.000Z",
  targetPipelineDepth: 4,
  candidateIds: [
    "candidate-1",
  ],
  relatedGoalIds: [],
  relatedWorkstreamIds: [],
};

const candidate:
  TalentCandidate = {
    id: "candidate-1",
    displayName:
      "Candidate A",
    searchId: "search-1",
    stage: "SCREEN",
    recommendation:
      "UNASSESSED",
    enteredStageAt:
      "2026-09-22T00:00:00.000Z",
    updatedAt:
      "2026-09-23T00:00:00.000Z",
    ownerId: "owner-cos",
    evidenceIds: [],
    strengths: [],
    openQuestions: [],
    risks: [],
    humanDecisionRequired:
      false,
  };

describe(
  "talent capacity engine",
  () => {
    it(
      "marks a capability with an active search and candidate as healthy",
      () => {
        const result =
          assessCapabilityGap({
            gap,
            searches: [
              search,
            ],
            candidates: [
              candidate,
            ],
          });

        expect(
          result.health,
        ).toBe("ON_TRACK");

        expect(
          result.score,
        ).toBe(100);

        expect(
          result.activeSearches,
        ).toBe(1);

        expect(
          result.activeCandidates,
        ).toBe(1);
      },
    );

    it(
      "detects an open gap with no active search",
      () => {
        const result =
          assessCapabilityGap({
            gap: {
              ...gap,
              status: "OPEN",
            },
            searches: [],
            candidates: [],
          });

        expect(
          result.score,
        ).toBeLessThan(70);

        expect(
          result.recommendedAction,
        ).toBe(
          "OPEN_SEARCH",
        );
      },
    );

    it(
      "detects a high-priority search with no candidates",
      () => {
        const result =
          assessCapabilityGap({
            gap,
            searches: [
              search,
            ],
            candidates: [],
          });

        expect(
          result.score,
        ).toBe(85);

        expect(
          result.recommendedAction,
        ).toBe(
          "DEEPEN_PIPELINE",
        );
      },
    );

    it(
      "penalizes a critical capability with no execution path",
      () => {
        const result =
          assessCapabilityGap({
            gap: {
              ...gap,
              status: "OPEN",
              priority:
                "CRITICAL",
            },
            searches: [],
            candidates: [],
          });

        expect(
          result.score,
        ).toBe(40);

        expect(
          result.health,
        ).toBe(
          "OFF_TRACK",
        );
      },
    );

    it(
      "treats mitigated gaps as healthy",
      () => {
        const result =
          assessCapabilityGap({
            gap: {
              ...gap,
              status:
                "MITIGATED",
            },
            searches: [],
            candidates: [],
          });

        expect(
          result.score,
        ).toBe(100);

        expect(
          result.health,
        ).toBe(
          "ON_TRACK",
        );
      },
    );

    it(
      "assesses an entire capability portfolio",
      () => {
        const result =
          assessCapabilityPortfolio(
            [
              gap,
              {
                ...gap,
                id: "gap-2",
                status: "OPEN",
              },
            ],
            [
              search,
            ],
            [
              candidate,
            ],
          );

        expect(
          result,
        ).toHaveLength(2);

        expect(
          result[0]
            .capabilityGapId,
        ).toBe("gap-1");

        expect(
          result[1]
            .capabilityGapId,
        ).toBe("gap-2");
      },
    );
  },
);