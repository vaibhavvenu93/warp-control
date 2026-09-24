import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildAttentionQueue,
} from "@/domain/operations/attention-engine";

import type {
  AttentionEngineInput,
} from "@/domain/operations/attention-engine";

const NOW =
  "2026-09-24T12:00:00.000Z";

function baseInput(): AttentionEngineInput {
  return {
    now: NOW,

    owners: [
      {
        id: "owner-ceo",
        name: "CEO",
        role: "CEO",
        isExecutive: true,
      },
      {
        id: "owner-growth",
        name: "Growth Lead",
        role: "Growth",
      },
    ],

    goals: [],

    metrics: [],

    workstreams: [
      {
        id: "ws-growth",
        title: "Enterprise GTM",
        description:
          "Build enterprise motion.",
        type: "GTM",
        status: "ACTIVE",
        priority: "HIGH",
        ownerId:
          "owner-growth",
        goalIds: [],
        commitmentIds: [],
        dependencyIds: [],
        issueIds: [],
        lastUpdatedAt:
          "2026-09-23T12:00:00.000Z",
      },
    ],

    commitments: [],

    dependencies: [],

    issues: [],
  };
}

describe(
  "CEO attention engine",
  () => {
    it(
      "returns no attention items for healthy operating state",
      () => {
        expect(
          buildAttentionQueue(
            baseInput(),
          ),
        ).toEqual([]);
      },
    );

    it(
      "surfaces overdue commitments",
      () => {
        const input =
          baseInput();

        input.commitments.push({
          id: "commitment-demo",
          title:
            "Ship enterprise onboarding",
          workstreamId:
            "ws-growth",
          goalIds: [],
          ownerId:
            "owner-growth",
          status:
            "IN_PROGRESS",
          priority: "HIGH",
          createdAt:
            "2026-09-10T00:00:00.000Z",
          dueAt:
            "2026-09-20T00:00:00.000Z",
          updatedAt:
            "2026-09-23T00:00:00.000Z",
          dependencyIds: [],
          issueIds: [],
        });

        const queue =
          buildAttentionQueue(
            input,
          );

        expect(queue).toHaveLength(
          1,
        );

        expect(
          queue[0].reasons,
        ).toContain(
          "COMMITMENT_OVERDUE",
        );

        expect(
          queue[0].action,
        ).toBe("FOLLOW_UP");
      },
    );

    it(
      "escalates a commitment that is both blocked and overdue",
      () => {
        const input =
          baseInput();

        input.commitments.push({
          id:
            "commitment-blocked",
          title:
            "Complete security review",
          workstreamId:
            "ws-growth",
          goalIds: [],
          ownerId:
            "owner-growth",
          status: "BLOCKED",
          priority: "HIGH",
          createdAt:
            "2026-09-10T00:00:00.000Z",
          dueAt:
            "2026-09-20T00:00:00.000Z",
          updatedAt:
            "2026-09-23T00:00:00.000Z",
          dependencyIds: [],
          issueIds: [],
        });

        const [item] =
          buildAttentionQueue(
            input,
          );

        expect(
          item.action,
        ).toBe("ESCALATE");

        expect(
          item.humanReviewRequired,
        ).toBe(true);

        expect(
          item.reasons,
        ).toContain(
          "COMMITMENT_BLOCKED",
        );

        expect(
          item.reasons,
        ).toContain(
          "COMMITMENT_OVERDUE",
        );
      },
    );

    it(
      "delegates an ownerless commitment",
      () => {
        const input =
          baseInput();

        input.commitments.push({
          id:
            "commitment-ownerless",
          title:
            "Prepare pricing analysis",
          workstreamId:
            "ws-growth",
          goalIds: [],
          status:
            "IN_PROGRESS",
          priority:
            "MEDIUM",
          createdAt:
            "2026-09-20T00:00:00.000Z",
          dueAt:
            "2026-09-30T00:00:00.000Z",
          updatedAt:
            "2026-09-23T00:00:00.000Z",
          dependencyIds: [],
          issueIds: [],
        });

        const [item] =
          buildAttentionQueue(
            input,
          );

        expect(
          item.action,
        ).toBe("DELEGATE");

        expect(
          item.reasons,
        ).toContain(
          "OWNER_MISSING",
        );
      },
    );

    it(
      "routes a decision-required issue to DECIDE",
      () => {
        const input =
          baseInput();

        input.issues.push({
          id: "issue-pricing",
          title:
            "Approve enterprise pricing test",
          description:
            "Pricing test requires executive approval.",
          type: "DECISION",
          status: "OPEN",
          priority:
            "CRITICAL",
          ownerId: "owner-ceo",
          goalIds: [],
          workstreamIds: [
            "ws-growth",
          ],
          commitmentIds: [],
          dependencyIds: [],
          openedAt:
            "2026-09-23T00:00:00.000Z",
          updatedAt:
            "2026-09-23T12:00:00.000Z",
          decisionRequired: true,
        });

        const [item] =
          buildAttentionQueue(
            input,
          );

        expect(
          item.action,
        ).toBe("DECIDE");

        expect(
          item.decisionRequired,
        ).toBe(true);

        expect(
          item.humanReviewRequired,
        ).toBe(true);

        expect(
          item.reasons,
        ).toContain(
          "DECISION_REQUIRED",
        );
      },
    );

    it(
      "surfaces blocked dependencies",
      () => {
        const input =
          baseInput();

        input.dependencies.push({
          id: "dep-security",
          title:
            "Security evidence",
          status: "BLOCKED",
          priority: "HIGH",
          ownerId:
            "owner-growth",
          targetWorkstreamId:
            "ws-growth",
          requiredBy:
            "2026-09-30T00:00:00.000Z",
          updatedAt:
            "2026-09-23T00:00:00.000Z",
        });

        const [item] =
          buildAttentionQueue(
            input,
          );

        expect(
          item.reasons,
        ).toContain(
          "DEPENDENCY_BLOCKED",
        );

        expect(
          item.action,
        ).toBe("FOLLOW_UP");
      },
    );

    it(
      "escalates blocked dependencies after their required date",
      () => {
        const input =
          baseInput();

        input.dependencies.push({
          id: "dep-security",
          title:
            "Security evidence",
          status: "BLOCKED",
          priority: "MEDIUM",
          ownerId:
            "owner-growth",
          targetWorkstreamId:
            "ws-growth",
          requiredBy:
            "2026-09-20T00:00:00.000Z",
          updatedAt:
            "2026-09-23T00:00:00.000Z",
        });

        const [item] =
          buildAttentionQueue(
            input,
          );

        expect(
          item.action,
        ).toBe("ESCALATE");

        expect(
          item.priority,
        ).toBe("HIGH");
      },
    );

    it(
      "surfaces metrics explicitly behind plan",
      () => {
        const input =
          baseInput();

        input.metrics.push({
          id: "metric-pipeline",
          name:
            "Qualified pipeline",
          unit: "CURRENCY",
          direction: "INCREASE",
          currentValue: 200000,
          targetValue: 1000000,
          status: "BEHIND",
          ownerId:
            "owner-growth",
          updatedAt:
            "2026-09-23T00:00:00.000Z",
        });

        const [item] =
          buildAttentionQueue(
            input,
          );

        expect(
          item.reasons,
        ).toContain(
          "METRIC_BEHIND",
        );
      },
    );

    it(
      "surfaces off-track goals",
      () => {
        const input =
          baseInput();

        input.goals.push({
          id: "goal-growth",
          title:
            "Build enterprise motion",
          description:
            "Establish repeatable enterprise GTM.",
          status: "ACTIVE",
          priority: "HIGH",
          ownerId:
            "owner-growth",
          startAt:
            "2026-09-01T00:00:00.000Z",
          targetAt:
            "2026-12-31T00:00:00.000Z",
          metricIds: [],
          workstreamIds: [
            "ws-growth",
          ],
          health:
            "OFF_TRACK",
          lastUpdatedAt:
            "2026-09-23T00:00:00.000Z",
        });

        const [item] =
          buildAttentionQueue(
            input,
          );

        expect(
          item.reasons,
        ).toContain(
          "GOAL_OFF_TRACK",
        );

        expect(
          item.action,
        ).toBe("ESCALATE");
      },
    );

    it(
      "sorts critical decision boundaries above lower priority follow-ups",
      () => {
        const input =
          baseInput();

        input.metrics.push({
          id: "metric-demo",
          name: "Demo metric",
          unit: "NUMBER",
          direction: "INCREASE",
          status: "BEHIND",
          ownerId:
            "owner-growth",
        });

        input.issues.push({
          id:
            "issue-critical",
          title:
            "Critical decision",
          description:
            "Requires CEO judgment.",
          type: "DECISION",
          status: "OPEN",
          priority:
            "CRITICAL",
          ownerId: "owner-ceo",
          goalIds: [],
          workstreamIds: [],
          commitmentIds: [],
          dependencyIds: [],
          openedAt:
            "2026-09-23T00:00:00.000Z",
          updatedAt:
            "2026-09-23T12:00:00.000Z",
          decisionRequired: true,
        });

        const queue =
          buildAttentionQueue(
            input,
          );

        expect(
          queue[0].issueId,
        ).toBe(
          "issue-critical",
        );

        expect(
          queue[0].action,
        ).toBe("DECIDE");
      },
    );
  },
);