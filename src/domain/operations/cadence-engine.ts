import type {
  OperatingAttentionItem,
  OperatingCadence,
  OperatingGoal,
  OperatingHealthBreakdown,
  OperatingIssue,
  OperatingMetric,
  OperatingReview,
  OperatingWorkstream,
  ReviewType,
} from "@/domain/operations/types";

export interface OperatingReviewInput {
  cadence: OperatingCadence;

  goals: OperatingGoal[];
  metrics: OperatingMetric[];
  workstreams: OperatingWorkstream[];
  issues: OperatingIssue[];
  attention: OperatingAttentionItem[];

  health: OperatingHealthBreakdown;

  now: string;

  reviewId?: string;
}

function relevantGoals(
  cadence: OperatingCadence,
  goals: OperatingGoal[],
): OperatingGoal[] {
  if (
    cadence.goalIds.length === 0
  ) {
    return goals;
  }

  return goals.filter(
    (goal) =>
      cadence.goalIds.includes(
        goal.id,
      ),
  );
}

function relevantMetrics(
  cadence: OperatingCadence,
  metrics: OperatingMetric[],
): OperatingMetric[] {
  if (
    cadence.metricIds.length === 0
  ) {
    return metrics;
  }

  return metrics.filter(
    (metric) =>
      cadence.metricIds.includes(
        metric.id,
      ),
  );
}

function relevantWorkstreams(
  cadence: OperatingCadence,
  workstreams: OperatingWorkstream[],
): OperatingWorkstream[] {
  if (
    cadence.workstreamIds.length ===
    0
  ) {
    return workstreams;
  }

  return workstreams.filter(
    (workstream) =>
      cadence.workstreamIds.includes(
        workstream.id,
      ),
  );
}

function relevantIssues(
  workstreams: OperatingWorkstream[],
  issues: OperatingIssue[],
): OperatingIssue[] {
  const workstreamIds =
    new Set(
      workstreams.map(
        (workstream) =>
          workstream.id,
      ),
    );

  return issues.filter(
    (issue) =>
      issue.workstreamIds.length ===
        0 ||
      issue.workstreamIds.some(
        (id) =>
          workstreamIds.has(id),
      ),
  );
}

function relevantAttention(
  goals: OperatingGoal[],
  metrics: OperatingMetric[],
  workstreams: OperatingWorkstream[],
  attention: OperatingAttentionItem[],
): OperatingAttentionItem[] {
  const goalIds =
    new Set(
      goals.map(
        (goal) => goal.id,
      ),
    );

  const metricIds =
    new Set(
      metrics.map(
        (metric) =>
          metric.id,
      ),
    );

  const workstreamIds =
    new Set(
      workstreams.map(
        (workstream) =>
          workstream.id,
      ),
    );

  return attention.filter(
    (item) =>
      (
        item.goalId &&
        goalIds.has(item.goalId)
      ) ||
      (
        item.metricId &&
        metricIds.has(
          item.metricId,
        )
      ) ||
      (
        item.workstreamId &&
        workstreamIds.has(
          item.workstreamId,
        )
      ) ||
      (
        !item.goalId &&
        !item.metricId &&
        !item.workstreamId
      ),
  );
}

function buildReviewSummary(
  reviewType: ReviewType,
  health: OperatingHealthBreakdown,
  attention: OperatingAttentionItem[],
): string {
  const decisionCount =
    attention.filter(
      (item) =>
        item.decisionRequired,
    ).length;

  const escalationCount =
    attention.filter(
      (item) =>
        item.action ===
          "ESCALATE",
    ).length;

  const parts = [
    `${reviewType} review`,
    `operating health ${health.health.toLowerCase().replaceAll("_", " ")}`,
    `${attention.length} attention item${
      attention.length === 1
        ? ""
        : "s"
    }`,
  ];

  if (decisionCount > 0) {
    parts.push(
      `${decisionCount} decision${
        decisionCount === 1
          ? ""
          : "s"
      } required`,
    );
  }

  if (escalationCount > 0) {
    parts.push(
      `${escalationCount} escalation${
        escalationCount === 1
          ? ""
          : "s"
      }`,
    );
  }

  return `${parts.join(
    " · ",
  )}.`;
}

export function buildOperatingReview(
  input: OperatingReviewInput,
): OperatingReview {
  if (!input.cadence.enabled) {
    throw new Error(
      `Cannot run disabled cadence ${input.cadence.id}.`,
    );
  }

  const goals =
    relevantGoals(
      input.cadence,
      input.goals,
    );

  const metrics =
    relevantMetrics(
      input.cadence,
      input.metrics,
    );

  const workstreams =
    relevantWorkstreams(
      input.cadence,
      input.workstreams,
    );

  const issues =
    relevantIssues(
      workstreams,
      input.issues,
    );

  const attention =
    relevantAttention(
      goals,
      metrics,
      workstreams,
      input.attention,
    );

  return {
    id:
      input.reviewId ??
      `review-${input.cadence.id}-${input.now}`,

    cadenceId:
      input.cadence.id,

    reviewType:
      input.cadence.reviewType,

    startedAt:
      input.now,

    completedAt:
      input.now,

    health:
      input.health.health,

    goalIds:
      goals.map(
        (goal) => goal.id,
      ),

    metricIds:
      metrics.map(
        (metric) => metric.id,
      ),

    workstreamIds:
      workstreams.map(
        (workstream) =>
          workstream.id,
      ),

    issueIds:
      issues.map(
        (issue) => issue.id,
      ),

    attentionItemIds:
      attention.map(
        (item) => item.id,
      ),

    summary:
      buildReviewSummary(
        input.cadence.reviewType,
        input.health,
        attention,
      ),

    metadata: {
      operatingScore:
        input.health.score,

      decisionCount:
        attention.filter(
          (item) =>
            item.decisionRequired,
        ).length,

      escalationCount:
        attention.filter(
          (item) =>
            item.action ===
            "ESCALATE",
        ).length,

      humanReviewCount:
        attention.filter(
          (item) =>
            item.humanReviewRequired,
        ).length,
    },
  };
}