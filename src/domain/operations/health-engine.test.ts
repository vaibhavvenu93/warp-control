import {
  describe,
  expect,
  it,
} from "vitest";

import {
  calculateOperatingHealth,
} from "@/domain/operations/health-engine";

import type {
  OperatingCommitment,
  OperatingDependency,
  OperatingGoal,
  OperatingIssue,
  OperatingMetric,
  OperatingOwner,
  OperatingWorkstream,
} from "@/domain/operations/types";

const NOW =
  "2026-09-24T12:00:00.000Z";

const owners: OperatingOwner[] = [
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
];

function baseInput() {
  const goals: OperatingGoal[] = [
    {
      id: "goal-growth",
      title:
        "Build repeatable enterprise pipeline",
      description:
        "Create a measurable enterprise growth motion.",
      status: "ACTIVE",
      priority: "HIGH",
      ownerId: "owner-growth",
      startAt:
        "2026-09-01T00:00:00.000Z",
      targetAt:
        "2026-12-31T00:00:00.000Z",
      metricIds: [
        "metric-pipeline",
      ],
      workstreamIds: [
        "workstream-growth",
      ],
      lastUpdatedAt:
        "2026-09-23T12:00:00.000Z",
    },
  ];

  const metrics: OperatingMetric[] = [
    {
      id: "metric-pipeline",
      name:
        "Qualified enterprise pipeline",
      unit: "CURRENCY",
      direction: "INCREASE",
      currentValue: 400000,
      targetValue: 1000000,
      status: "ON_TRACK",
      ownerId: "owner-growth",
      measuredAt:
        "2026-09-23T12:00:00.000Z",
      updatedAt:
        "2026-09-23T12:00:00.000Z",
    },
  ];

  const workstreams:
    OperatingWorkstream[] = [
      {
        id: "workstream-growth",
        title:
          "Enterprise GTM",
        description:
          "Build the enterprise motion.",
        type: "GTM",
        status: "ACTIVE",
        priority: "HIGH",
        ownerId: "owner-growth",
        goalIds: [
          "goal-growth",
        ],
        commitmentIds: [
          "commitment-1",
        ],
        dependencyIds: [],
        issueIds: [],
        lastUpdatedAt:
          "2026-09-23T12:00:00.000Z",
      },
    ];

  const commitments:
    OperatingCommitment[] = [
      {
        id: "commitment-1",
        title:
          "Ship account scoring v1",
        workstreamId:
          "workstream-growth",
        goalIds: [
          "goal-growth",
        ],
        ownerId:
          "owner-growth",
        status:
          "IN_PROGRESS",
        priority:
          "HIGH",
        createdAt:
          "2026-09-20T00:00:00.000Z",
        dueAt:
          "2026-09-30T00:00:00.000Z",
        updatedAt:
          "2026-09-23T12:00:00.000Z",
        dependencyIds: [],
        issueIds: [],
      },
    ];

  const dependencies:
    OperatingDependency[] = [];

  const issues:
    OperatingIssue[] = [];

  return {
    owners,
    goals,
    metrics,
    workstreams,
    commitments,
    dependencies,
    issues,
    now: NOW,
  };
}

describe(
  "Company Operating System health engine",
  () => {
    it(
      "marks a healthy operating system as on track",
      () => {
        const result =
          calculateOperatingHealth(
            baseInput(),
          );

        expect(
          result.health,
        ).toBe("ON_TRACK");

        expect(
          result.score,
        ).toBe(100);

        expect(
          result.reasons,
        ).toContain(
          "No material operating exceptions detected.",
        );
      },
    );

    it(
      "detects overdue commitments",
      () => {
        const input =
          baseInput();

        input.commitments[0] = {
          ...input.commitments[0],
          dueAt:
            "2026-09-20T00:00:00.000Z",
        };

        const result =
          calculateOperatingHealth(
            input,
          );

        expect(
          result.overdueCommitments,
        ).toBe(1);

        expect(
          result.score,
        ).toBe(92);
      },
    );

    it(
      "penalizes blocked commitments",
      () => {
        const input =
          baseInput();

        input.commitments[0] = {
          ...input.commitments[0],
          status: "BLOCKED",
        };

        const result =
          calculateOperatingHealth(
            input,
          );

        expect(
          result.blockedCommitments,
        ).toBe(1);

        expect(
          result.score,
        ).toBe(90);
      },
    );

    it(
      "detects blocked dependencies",
      () => {
        const input =
          baseInput();

        input.dependencies.push({
          id: "dependency-security",
          title:
            "Security review",
          status: "BLOCKED",
          priority: "HIGH",
          ownerId:
            "owner-growth",
          requiredBy:
            "2026-09-28T00:00:00.000Z",
          updatedAt:
            "2026-09-23T12:00:00.000Z",
        });

        const result =
          calculateOperatingHealth(
            input,
          );

        expect(
          result.blockedDependencies,
        ).toBe(1);

        expect(
          result.score,
        ).toBe(91);
      },
    );

    it(
      "treats an unresolved critical issue as a major operating exception",
      () => {
        const input =
          baseInput();

        input.issues.push({
          id: "issue-capacity",
          title:
            "Capacity constraint",
          description:
            "Capacity may block the current operating plan.",
          type: "CAPACITY",
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

        const result =
          calculateOperatingHealth(
            input,
          );

        expect(
          result.openCriticalIssues,
        ).toBe(1);

        expect(
          result.score,
        ).toBe(82);

        expect(
          result.health,
        ).toBe("WATCH");
      },
    );

    it(
      "detects metrics behind target",
      () => {
        const input =
          baseInput();

        input.metrics[0] = {
          ...input.metrics[0],
          status: "BEHIND",
        };

        const result =
          calculateOperatingHealth(
            input,
          );

        expect(
          result.behindMetrics,
        ).toBe(1);

        expect(
          result.score,
        ).toBe(93);
      },
    );

    it(
      "detects missing ownership",
      () => {
        const input =
          baseInput();

        input.commitments[0] = {
          ...input.commitments[0],
          ownerId: undefined,
        };

        const result =
          calculateOperatingHealth(
            input,
          );

        expect(
          result.missingOwners,
        ).toBe(1);

        expect(
          result.score,
        ).toBe(96);
      },
    );

    it(
      "treats an unknown owner as missing ownership",
      () => {
        const input =
          baseInput();

        input.goals[0] = {
          ...input.goals[0],
          ownerId:
            "owner-does-not-exist",
        };

        const result =
          calculateOperatingHealth(
            input,
          );

        expect(
          result.missingOwners,
        ).toBe(1);
      },
    );

    it(
      "detects stale active operating updates",
      () => {
        const input =
          baseInput();

        input.workstreams[0] = {
          ...input.workstreams[0],
          lastUpdatedAt:
            "2026-09-01T00:00:00.000Z",
        };

        const result =
          calculateOperatingHealth(
            input,
          );

        expect(
          result.staleUpdates,
        ).toBe(1);

        expect(
          result.score,
        ).toBe(97);
      },
    );

    it(
      "does not treat completed commitments as overdue",
      () => {
        const input =
          baseInput();

        input.commitments[0] = {
          ...input.commitments[0],
          status: "DONE",
          dueAt:
            "2026-09-20T00:00:00.000Z",
          completedAt:
            "2026-09-19T00:00:00.000Z",
        };

        const result =
          calculateOperatingHealth(
            input,
          );

        expect(
          result.overdueCommitments,
        ).toBe(0);
      },
    );

    it(
      "combines multiple operating failures into an off-track state",
      () => {
        const input =
          baseInput();

        input.commitments[0] = {
          ...input.commitments[0],
          status: "BLOCKED",
          dueAt:
            "2026-09-20T00:00:00.000Z",
          ownerId: undefined,
          updatedAt:
            "2026-09-01T00:00:00.000Z",
        };

        input.metrics[0] = {
          ...input.metrics[0],
          status: "BEHIND",
        };

        input.issues.push({
          id:
            "issue-critical",
          title:
            "Critical operating blocker",
          description:
            "A critical issue requiring executive intervention.",
          type: "BLOCKER",
          status: "OPEN",
          priority:
            "CRITICAL",
          ownerId:
            "owner-ceo",
          goalIds: [
            "goal-growth",
          ],
          workstreamIds: [
            "workstream-growth",
          ],
          commitmentIds: [
            "commitment-1",
          ],
          dependencyIds: [],
          openedAt:
            "2026-09-23T00:00:00.000Z",
          updatedAt:
            "2026-09-23T12:00:00.000Z",
          decisionRequired: true,
        });

        const result =
          calculateOperatingHealth(
            input,
          );

        expect(
          result.overdueCommitments,
        ).toBe(1);

        expect(
          result.blockedCommitments,
        ).toBe(1);

        expect(
          result.behindMetrics,
        ).toBe(1);

        expect(
          result.openCriticalIssues,
        ).toBe(1);

        expect(
          result.missingOwners,
        ).toBe(1);

        expect(
          result.staleUpdates,
        ).toBe(1);

        expect(
          result.score,
        ).toBe(50);

        expect(
          result.health,
        ).toBe("AT_RISK");
      },
    );
  },
);