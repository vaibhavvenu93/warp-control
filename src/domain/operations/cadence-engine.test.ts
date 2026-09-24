import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildOperatingReview,
} from "@/domain/operations/cadence-engine";

import type {
  OperatingAttentionItem,
  OperatingCadence,
  OperatingGoal,
  OperatingHealthBreakdown,
  OperatingIssue,
  OperatingMetric,
  OperatingWorkstream,
} from "@/domain/operations/types";

const NOW =
  "2026-09-24T12:00:00.000Z";

const health:
  OperatingHealthBreakdown = {
    health: "WATCH",
    score: 78,
    reasons: [
      "1 critical issue open",
    ],
    overdueCommitments: 0,
    blockedCommitments: 0,
    blockedDependencies: 0,
    openCriticalIssues: 1,
    behindMetrics: 0,
    missingOwners: 0,
    staleUpdates: 0,
  };

const cadence:
  OperatingCadence = {
    id: "cadence-company",
    title:
      "Weekly company operating review",
    description:
      "Review goals, metrics and operating exceptions.",
    cadence: "WEEKLY",
    reviewType: "COMPANY",
    ownerId: "owner-ceo",
    participantIds: [
      "owner-ceo",
    ],
    metricIds: [
      "metric-growth",
    ],
    goalIds: [
      "goal-growth",
    ],
    workstreamIds: [
      "ws-growth",
    ],
    enabled: true,
  };

function attentionItem(
  overrides: Partial<OperatingAttentionItem> = {},
): OperatingAttentionItem {
  return {
    id: "attention-demo",
    title:
      "Decision required",
    summary:
      "Executive judgment required.",
    priority: "CRITICAL",
    action: "DECIDE",
    reasons: [
      "DECISION_REQUIRED",
    ],
    surfacedAt: NOW,
    businessImpact:
      "Execution is waiting.",
    whyNow:
      "A human boundary was reached.",
    recommendedAction:
      "Review the evidence.",
    humanReviewRequired: true,
    decisionRequired: true,
    confidence: 98,
    ...overrides,
  };
}

interface CadenceTestInput {
  cadence: OperatingCadence;
  goals: OperatingGoal[];
  metrics: OperatingMetric[];
  workstreams: OperatingWorkstream[];
  issues: OperatingIssue[];
  attention: OperatingAttentionItem[];
  health: OperatingHealthBreakdown;
  now: string;
  reviewId: string;
}

function baseInput(): CadenceTestInput {
  return {
    cadence,

    goals: [
      {
        id: "goal-growth",
        title:
          "Build enterprise motion",
        description:
          "Create repeatable enterprise GTM.",
        status: "ACTIVE",
        priority: "HIGH",
        ownerId:
          "owner-ceo",
        startAt:
          "2026-09-01T00:00:00.000Z",
        targetAt:
          "2026-12-31T00:00:00.000Z",
        metricIds: [
          "metric-growth",
        ],
        workstreamIds: [
          "ws-growth",
        ],
      },
    ],

    metrics: [
      {
        id: "metric-growth",
        name:
          "Qualified pipeline",
        unit: "CURRENCY",
        direction: "INCREASE",
        status: "ON_TRACK",
        ownerId:
          "owner-ceo",
      },
    ],

    workstreams: [
      {
        id: "ws-growth",
        title:
          "Enterprise GTM",
        description:
          "Build enterprise GTM.",
        type: "GTM",
        status: "ACTIVE",
        priority: "HIGH",
        ownerId:
          "owner-ceo",
        goalIds: [
          "goal-growth",
        ],
        commitmentIds: [],
        dependencyIds: [],
        issueIds: [
          "issue-growth",
        ],
      },
    ],

    issues: [
      {
        id: "issue-growth",
        title:
          "Pricing decision",
        description:
          "Pricing needs judgment.",
        type: "DECISION",
        status: "OPEN",
        priority: "CRITICAL",
        ownerId:
          "owner-ceo",
        goalIds: [
          "goal-growth",
        ],
        workstreamIds: [
          "ws-growth",
        ],
        commitmentIds: [],
        dependencyIds: [],
        openedAt: NOW,
        decisionRequired: true,
      },
    ],

    attention: [
      attentionItem({
        goalId:
          "goal-growth",
        workstreamId:
          "ws-growth",
        issueId:
          "issue-growth",
      }),
    ],

    health,

    now: NOW,

    reviewId:
      "review-company-demo",
  };
}

describe(
  "operating cadence engine",
  () => {
    it(
      "builds a deterministic company review",
      () => {
        const review =
          buildOperatingReview(
            baseInput(),
          );

        expect(
          review.id,
        ).toBe(
          "review-company-demo",
        );

        expect(
          review.reviewType,
        ).toBe("COMPANY");

        expect(
          review.health,
        ).toBe("WATCH");

        expect(
          review.goalIds,
        ).toEqual([
          "goal-growth",
        ]);

        expect(
          review.metricIds,
        ).toEqual([
          "metric-growth",
        ]);

        expect(
          review.workstreamIds,
        ).toEqual([
          "ws-growth",
        ]);
      },
    );

    it(
      "includes relevant operating issues",
      () => {
        const review =
          buildOperatingReview(
            baseInput(),
          );

        expect(
          review.issueIds,
        ).toContain(
          "issue-growth",
        );
      },
    );

    it(
      "includes relevant CEO attention",
      () => {
        const review =
          buildOperatingReview(
            baseInput(),
          );

        expect(
          review.attentionItemIds,
        ).toContain(
          "attention-demo",
        );

        expect(
          review.metadata?.decisionCount,
        ).toBe(1);
      },
    );

    it(
      "produces an executive-readable summary",
      () => {
        const review =
          buildOperatingReview(
            baseInput(),
          );

        expect(
          review.summary,
        ).toContain(
          "COMPANY review",
        );

        expect(
          review.summary,
        ).toContain(
          "1 decision required",
        );
      },
    );

    it(
      "filters unrelated goals and workstreams from a scoped cadence",
      () => {
        const input =
          baseInput();

        input.goals.push({
          id: "goal-other",
          title:
            "Other goal",
          description:
            "Unrelated.",
          status: "ACTIVE",
          priority: "LOW",
          startAt:
            "2026-09-01T00:00:00.000Z",
          targetAt:
            "2026-12-31T00:00:00.000Z",
          metricIds: [],
          workstreamIds: [
            "ws-other",
          ],
        });

        input.workstreams.push({
          id: "ws-other",
          title:
            "Other work",
          description:
            "Unrelated.",
          type: "OTHER",
          status: "ACTIVE",
          priority: "LOW",
          goalIds: [
            "goal-other",
          ],
          commitmentIds: [],
          dependencyIds: [],
          issueIds: [],
        });

        const review =
          buildOperatingReview(
            input,
          );

        expect(
          review.goalIds,
        ).not.toContain(
          "goal-other",
        );

        expect(
          review.workstreamIds,
        ).not.toContain(
          "ws-other",
        );
      },
    );

    it(
      "refuses to execute a disabled operating cadence",
      () => {
        const input =
          baseInput();

        input.cadence = {
          ...input.cadence,
          enabled: false,
        };

        expect(() =>
          buildOperatingReview(
            input,
          ),
        ).toThrow(
          "Cannot run disabled cadence",
        );
      },
    );
  },
);