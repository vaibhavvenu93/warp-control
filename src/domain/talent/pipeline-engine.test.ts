import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildHiringAttention,
  calculatePipelineHealth,
} from "@/domain/talent/pipeline-engine";

import type {
  HiringSearch,
  TalentCandidate,
} from "@/domain/talent/types";

const NOW =
  "2026-09-24T12:00:00.000Z";

const search:
  HiringSearch = {
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
    targetPipelineDepth: 3,
    candidateIds: [],
    relatedGoalIds: [],
    relatedWorkstreamIds: [],
  };

function candidate(
  overrides:
    Partial<TalentCandidate> = {},
): TalentCandidate {
  return {
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
    ...overrides,
  };
}

describe(
  "talent pipeline engine",
  () => {
    it(
      "calculates healthy pipeline depth",
      () => {
        const candidates = [
          candidate({
            id: "candidate-1",
          }),
          candidate({
            id: "candidate-2",
            stage:
              "DEEP_DIVE",
          }),
          candidate({
            id: "candidate-3",
            stage: "FINAL",
          }),
        ];

        const result =
          calculatePipelineHealth({
            search,
            candidates,
            now: NOW,
          });

        expect(
          result.score,
        ).toBe(100);

        expect(
          result.health,
        ).toBe(
          "ON_TRACK",
        );

        expect(
          result.activeCandidates,
        ).toBe(3);
      },
    );

    it(
      "penalizes shallow pipeline depth",
      () => {
        const result =
          calculatePipelineHealth({
            search,
            candidates: [
              candidate(),
            ],
            now: NOW,
          });

        expect(
          result.score,
        ).toBe(80);

        expect(
          result.health,
        ).toBe("WATCH");
      },
    );

    it(
      "detects stale candidates",
      () => {
        const result =
          calculatePipelineHealth({
            search: {
              ...search,
              targetPipelineDepth:
                1,
            },
            candidates: [
              candidate({
                updatedAt:
                  "2026-09-10T00:00:00.000Z",
              }),
            ],
            now: NOW,
          });

        expect(
          result.staleCandidates,
        ).toBe(1);

        expect(
          result.score,
        ).toBe(92);
      },
    );

    it(
      "detects an empty active search",
      () => {
        const result =
          calculatePipelineHealth({
            search,
            candidates: [],
            now: NOW,
          });

        expect(
          result.score,
        ).toBe(45);

        expect(
          result.health,
        ).toBe(
          "OFF_TRACK",
        );
      },
    );

    it(
      "surfaces final-stage human decisions",
      () => {
        const finalCandidate =
          candidate({
            stage: "FINAL",
            humanDecisionRequired:
              true,
          });

        const health =
          calculatePipelineHealth({
            search: {
              ...search,
              targetPipelineDepth:
                1,
            },
            candidates: [
              finalCandidate,
            ],
            now: NOW,
          });

        const attention =
          buildHiringAttention({
            searches: [
              {
                ...search,
                targetPipelineDepth:
                  1,
              },
            ],
            candidates: [
              finalCandidate,
            ],
            pipelineHealth: [
              health,
            ],
            now: NOW,
          });

        expect(
          attention.some(
            (item) =>
              item.action ===
              "DECIDE",
          ),
        ).toBe(true);

        expect(
          attention.find(
            (item) =>
              item.action ===
              "DECIDE",
          )?.decisionRequired,
        ).toBe(true);
      },
    );

    it(
      "surfaces stale candidate follow-up",
      () => {
        const staleCandidate =
          candidate({
            updatedAt:
              "2026-09-10T00:00:00.000Z",
          });

        const health =
          calculatePipelineHealth({
            search: {
              ...search,
              targetPipelineDepth:
                1,
            },
            candidates: [
              staleCandidate,
            ],
            now: NOW,
          });

        const attention =
          buildHiringAttention({
            searches: [
              {
                ...search,
                targetPipelineDepth:
                  1,
              },
            ],
            candidates: [
              staleCandidate,
            ],
            pipelineHealth: [
              health,
            ],
            now: NOW,
          });

        expect(
          attention.some(
            (item) =>
              item.reasons.includes(
                "CANDIDATE_STALE",
              ),
          ),
        ).toBe(true);
      },
    );

    it(
      "surfaces shallow at-risk search pipeline",
      () => {
        const shallowSearch = {
          ...search,
          priority:
            "CRITICAL" as const,
          targetPipelineDepth: 5,
        };

        const candidates = [
          candidate(),
        ];

        const health =
          calculatePipelineHealth({
            search:
              shallowSearch,
            candidates,
            now: NOW,
          });

        const attention =
          buildHiringAttention({
            searches: [
              shallowSearch,
            ],
            candidates,
            pipelineHealth: [
              health,
            ],
            now: NOW,
          });

        expect(
          attention.some(
            (item) =>
              item.reasons.includes(
                "PIPELINE_TOO_SHALLOW",
              ),
          ),
        ).toBe(true);
      },
    );
  },
);