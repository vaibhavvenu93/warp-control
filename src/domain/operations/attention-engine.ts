import type {
  AttentionAction,
  AttentionReason,
  OperatingAttentionItem,
  OperatingCommitment,
  OperatingDependency,
  OperatingGoal,
  OperatingIssue,
  OperatingMetric,
  OperatingOwner,
  OperatingPriority,
  OperatingWorkstream,
} from "@/domain/operations/types";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface AttentionEngineInput {
  owners: OperatingOwner[];
  goals: OperatingGoal[];
  metrics: OperatingMetric[];
  workstreams: OperatingWorkstream[];
  commitments: OperatingCommitment[];
  dependencies: OperatingDependency[];
  issues: OperatingIssue[];
  now: string;
  staleAfterDays?: number;
}

interface AttentionCandidate {
  key: string;
  title: string;
  summary: string;

  priority: OperatingPriority;
  action: AttentionAction;

  reasons: AttentionReason[];

  ownerId?: string;

  goalId?: string;
  metricId?: string;
  workstreamId?: string;
  commitmentId?: string;
  dependencyId?: string;
  issueId?: string;

  dueAt?: string;

  businessImpact: string;
  whyNow: string;
  recommendedAction: string;

  humanReviewRequired: boolean;
  decisionRequired: boolean;

  confidence: number;

  metadata?: Record<string, unknown>;
}

function parseTime(
  value?: string,
): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value).getTime();

  return Number.isNaN(parsed)
    ? undefined
    : parsed;
}

function isPastDue(
  dueAt: string,
  now: string,
): boolean {
  const due = parseTime(dueAt);
  const current = parseTime(now);

  if (
    due === undefined ||
    current === undefined
  ) {
    return false;
  }

  return due < current;
}

function isStale(
  updatedAt: string | undefined,
  now: string,
  staleAfterDays: number,
): boolean {
  const updated = parseTime(updatedAt);
  const current = parseTime(now);

  if (
    updated === undefined ||
    current === undefined
  ) {
    return false;
  }

  return (
    current - updated >
    staleAfterDays * DAY_MS
  );
}

function ownerExists(
  ownerId: string | undefined,
  owners: OperatingOwner[],
): boolean {
  if (!ownerId) {
    return false;
  }

  return owners.some(
    (owner) => owner.id === ownerId,
  );
}

function priorityRank(
  priority: OperatingPriority,
): number {
  switch (priority) {
    case "CRITICAL":
      return 4;

    case "HIGH":
      return 3;

    case "MEDIUM":
      return 2;

    case "LOW":
      return 1;
  }
}

function actionRank(
  action: AttentionAction,
): number {
  switch (action) {
    case "DECIDE":
      return 5;

    case "ESCALATE":
      return 4;

    case "DELEGATE":
      return 3;

    case "FOLLOW_UP":
      return 2;

    case "MONITOR":
      return 1;
  }
}

function buildAttentionId(
  key: string,
): string {
  return `attention-${key}`;
}

function uniqueReasons(
  reasons: AttentionReason[],
): AttentionReason[] {
  return [...new Set(reasons)];
}

function makeItem(
  candidate: AttentionCandidate,
  surfacedAt: string,
): OperatingAttentionItem {
  return {
    id: buildAttentionId(
      candidate.key,
    ),

    title: candidate.title,
    summary: candidate.summary,

    priority: candidate.priority,
    action: candidate.action,

    reasons: uniqueReasons(
      candidate.reasons,
    ),

    ownerId: candidate.ownerId,

    goalId: candidate.goalId,
    metricId: candidate.metricId,
    workstreamId:
      candidate.workstreamId,
    commitmentId:
      candidate.commitmentId,
    dependencyId:
      candidate.dependencyId,
    issueId: candidate.issueId,

    surfacedAt,
    dueAt: candidate.dueAt,

    businessImpact:
      candidate.businessImpact,

    whyNow: candidate.whyNow,

    recommendedAction:
      candidate.recommendedAction,

    humanReviewRequired:
      candidate.humanReviewRequired,

    decisionRequired:
      candidate.decisionRequired,

    confidence:
      candidate.confidence,

    metadata:
      candidate.metadata,
  };
}

function commitmentCandidates(
  input: AttentionEngineInput,
): AttentionCandidate[] {
  const staleAfterDays =
    input.staleAfterDays ?? 7;

  return input.commitments.flatMap(
    (commitment) => {
      if (
        commitment.status === "DONE" ||
        commitment.status ===
          "CANCELLED"
      ) {
        return [];
      }

      const reasons:
        AttentionReason[] = [];

      const overdue = isPastDue(
        commitment.dueAt,
        input.now,
      );

      const blocked =
        commitment.status ===
        "BLOCKED";

      const missingOwner =
        !ownerExists(
          commitment.ownerId,
          input.owners,
        );

      const stale = isStale(
        commitment.updatedAt,
        input.now,
        staleAfterDays,
      );

      if (overdue) {
        reasons.push(
          "COMMITMENT_OVERDUE",
        );
      }

      if (blocked) {
        reasons.push(
          "COMMITMENT_BLOCKED",
        );
      }

      if (missingOwner) {
        reasons.push(
          "OWNER_MISSING",
        );
      }

      if (stale) {
        reasons.push(
          "UPDATE_STALE",
        );
      }

      if (reasons.length === 0) {
        return [];
      }

      let action: AttentionAction =
        "FOLLOW_UP";

      let priority =
        commitment.priority;

      let humanReviewRequired =
        false;

      if (
        blocked &&
        overdue
      ) {
        action = "ESCALATE";
        priority = "HIGH";
        humanReviewRequired = true;
      } else if (missingOwner) {
        action = "DELEGATE";
      }

      return [
        {
          key: `commitment-${commitment.id}`,

          title:
            blocked && overdue
              ? `Blocked commitment is overdue: ${commitment.title}`
              : overdue
                ? `Commitment is overdue: ${commitment.title}`
                : blocked
                  ? `Commitment is blocked: ${commitment.title}`
                  : missingOwner
                    ? `Commitment has no accountable owner: ${commitment.title}`
                    : `Commitment update is stale: ${commitment.title}`,

          summary:
            "A delivery commitment has crossed an operating exception threshold.",

          priority,
          action,

          reasons,

          ownerId:
            commitment.ownerId,

          commitmentId:
            commitment.id,

          workstreamId:
            commitment.workstreamId,

          goalId:
            commitment.goalIds[0],

          dueAt:
            commitment.dueAt,

          businessImpact:
            blocked
              ? "Delivery risk can propagate into the linked workstream and company goal."
              : overdue
                ? "A missed commitment can create downstream schedule and execution risk."
                : missingOwner
                  ? "Work without explicit accountability is more likely to stall."
                  : "Stale execution data reduces confidence in the operating plan.",

          whyNow:
            blocked && overdue
              ? "The commitment is both blocked and past its due date."
              : overdue
                ? "The due date has passed without completion."
                : blocked
                  ? "Execution cannot currently progress."
                  : missingOwner
                    ? "No valid owner is attached to an active commitment."
                    : "The commitment has not been updated within the operating freshness window.",

          recommendedAction:
            action === "ESCALATE"
              ? "Confirm the blocker, assign the next intervention and reset the delivery commitment."
              : action ===
                  "DELEGATE"
                ? "Assign one accountable owner and confirm the next checkpoint."
                : "Request an owner update and confirm whether the current commitment remains valid.",

          humanReviewRequired,

          decisionRequired: false,

          confidence: 95,

          metadata: {
            source:
              "OPERATING_COMMITMENT",
          },
        },
      ];
    },
  );
}

function dependencyCandidates(
  input: AttentionEngineInput,
): AttentionCandidate[] {
  return input.dependencies.flatMap(
    (dependency) => {
      if (
        dependency.status !==
        "BLOCKED"
      ) {
        return [];
      }

      const requiredDatePassed =
        dependency.requiredBy
          ? isPastDue(
              dependency.requiredBy,
              input.now,
            )
          : false;

      return [
        {
          key: `dependency-${dependency.id}`,

          title:
            `Blocked dependency: ${dependency.title}`,

          summary:
            "A cross-workstream dependency is preventing or threatening execution.",

          priority:
            requiredDatePassed
              ? "HIGH"
              : dependency.priority,

          action:
            requiredDatePassed
              ? "ESCALATE"
              : "FOLLOW_UP",

          reasons: [
            "DEPENDENCY_BLOCKED",
          ],

          ownerId:
            dependency.ownerId,

          dependencyId:
            dependency.id,

          workstreamId:
            dependency.targetWorkstreamId,

          dueAt:
            dependency.requiredBy,

          businessImpact:
            "Blocked dependencies can create cascading delays across otherwise healthy workstreams.",

          whyNow:
            requiredDatePassed
              ? "The dependency remains blocked after the date it was required."
              : "The dependency is currently blocking execution.",

          recommendedAction:
            "Resolve ownership, identify the unblock path and establish the next explicit checkpoint.",

          humanReviewRequired:
            requiredDatePassed,

          decisionRequired: false,

          confidence: 96,

          metadata: {
            source:
              "OPERATING_DEPENDENCY",
          },
        },
      ];
    },
  );
}

function issueCandidates(
  input: AttentionEngineInput,
): AttentionCandidate[] {
  return input.issues.flatMap(
    (issue) => {
      if (
        issue.status ===
          "RESOLVED" ||
        issue.status ===
          "ACCEPTED"
      ) {
        return [];
      }

      if (
        issue.priority !==
          "CRITICAL" &&
        !issue.decisionRequired
      ) {
        return [];
      }

      const decisionRequired =
        issue.decisionRequired;

      return [
        {
          key: `issue-${issue.id}`,

          title:
            decisionRequired
              ? `Decision required: ${issue.title}`
              : `Critical operating issue: ${issue.title}`,

          summary:
            issue.description,

          priority:
            issue.priority,

          action:
            decisionRequired
              ? "DECIDE"
              : "ESCALATE",

          reasons:
            decisionRequired
              ? [
                  "ISSUE_CRITICAL",
                  "DECISION_REQUIRED",
                ]
              : [
                  "ISSUE_CRITICAL",
                ],

          ownerId:
            issue.ownerId,

          issueId:
            issue.id,

          goalId:
            issue.goalIds[0],

          workstreamId:
            issue.workstreamIds[0],

          commitmentId:
            issue.commitmentIds[0],

          dependencyId:
            issue.dependencyIds[0],

          dueAt:
            issue.targetResolutionAt,

          businessImpact:
            decisionRequired
              ? "Execution is constrained until a human judgment is made."
              : "A critical unresolved issue creates material operating risk.",

          whyNow:
            decisionRequired
              ? "The operating system has reached a human decision boundary."
              : "The issue is unresolved and classified as critical.",

          recommendedAction:
            decisionRequired
              ? "Review the evidence, missing information and trade-offs before recording a decision."
              : "Confirm mitigation ownership, deadline and escalation path.",

          humanReviewRequired: true,

          decisionRequired,

          confidence: 98,

          metadata: {
            source:
              "OPERATING_ISSUE",
            existingDecisionId:
              issue.decisionId,
          },
        },
      ];
    },
  );
}

function metricCandidates(
  input: AttentionEngineInput,
): AttentionCandidate[] {
  return input.metrics.flatMap(
    (metric) => {
      if (
        metric.status !== "BEHIND"
      ) {
        return [];
      }

      return [
        {
          key: `metric-${metric.id}`,

          title:
            `Metric behind plan: ${metric.name}`,

          summary:
            "A tracked operating metric is currently behind its declared plan.",

          priority: "MEDIUM",

          action: "FOLLOW_UP",

          reasons: [
            "METRIC_BEHIND",
          ],

          ownerId:
            metric.ownerId,

          metricId:
            metric.id,

          businessImpact:
            "Persistent metric underperformance may put linked goals at risk.",

          whyNow:
            "The metric is explicitly marked behind plan in the current operating state.",

          recommendedAction:
            "Validate the measurement, identify the driver and define a corrective action or revised target.",

          humanReviewRequired:
            false,

          decisionRequired: false,

          confidence: 90,

          metadata: {
            source:
              "OPERATING_METRIC",
          },
        },
      ];
    },
  );
}

function goalCandidates(
  input: AttentionEngineInput,
): AttentionCandidate[] {
  return input.goals.flatMap(
    (goal) => {
      if (
        goal.status !== "ACTIVE" ||
        (
          goal.health !==
            "AT_RISK" &&
          goal.health !==
            "OFF_TRACK"
        )
      ) {
        return [];
      }

      return [
        {
          key: `goal-${goal.id}`,

          title:
            `Goal requires attention: ${goal.title}`,

          summary:
            "A company goal is explicitly outside its healthy operating state.",

          priority:
            goal.health ===
              "OFF_TRACK"
              ? "HIGH"
              : goal.priority,

          action:
            goal.health ===
              "OFF_TRACK"
              ? "ESCALATE"
              : "FOLLOW_UP",

          reasons: [
            "GOAL_OFF_TRACK",
          ],

          ownerId:
            goal.ownerId,

          goalId:
            goal.id,

          dueAt:
            goal.targetAt,

          businessImpact:
            "A company-level objective may miss its intended outcome without intervention.",

          whyNow:
            `The goal is currently classified ${goal.health}.`,

          recommendedAction:
            "Review the linked metrics, commitments and blockers before changing the plan.",

          humanReviewRequired:
            goal.health ===
            "OFF_TRACK",

          decisionRequired: false,

          confidence: 92,

          metadata: {
            source:
              "OPERATING_GOAL",
          },
        },
      ];
    },
  );
}

export function buildAttentionQueue(
  input: AttentionEngineInput,
): OperatingAttentionItem[] {
  const candidates = [
    ...issueCandidates(input),
    ...commitmentCandidates(input),
    ...dependencyCandidates(input),
    ...metricCandidates(input),
    ...goalCandidates(input),
  ];

  return candidates
    .map((candidate) =>
      makeItem(
        candidate,
        input.now,
      ),
    )
    .sort((a, b) => {
      const priorityDifference =
        priorityRank(b.priority) -
        priorityRank(a.priority);

      if (
        priorityDifference !== 0
      ) {
        return priorityDifference;
      }

      const actionDifference =
        actionRank(b.action) -
        actionRank(a.action);

      if (
        actionDifference !== 0
      ) {
        return actionDifference;
      }

      return a.title.localeCompare(
        b.title,
      );
    });
}