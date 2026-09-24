import type {
  MetricStatus,
  OperatingCommitment,
  OperatingDependency,
  OperatingGoal,
  OperatingHealth,
  OperatingHealthBreakdown,
  OperatingIssue,
  OperatingMetric,
  OperatingOwner,
  OperatingWorkstream,
} from "@/domain/operations/types";

const DAY_MS =
  24 * 60 * 60 * 1000;

export interface OperatingHealthInput {
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

function clamp(
  value: number,
  minimum = 0,
  maximum = 100,
): number {
  return Math.max(
    minimum,
    Math.min(maximum, value),
  );
}

function parseTime(
  value?: string,
): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed =
    new Date(value).getTime();

  if (
    Number.isNaN(parsed)
  ) {
    return undefined;
  }

  return parsed;
}

function isPastDue(
  dueAt: string,
  now: string,
): boolean {
  const due =
    parseTime(dueAt);

  const current =
    parseTime(now);

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
  const updated =
    parseTime(updatedAt);

  const current =
    parseTime(now);

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

function healthFromScore(
  score: number,
): OperatingHealth {
  if (score >= 85) {
    return "ON_TRACK";
  }

  if (score >= 70) {
    return "WATCH";
  }

  if (score >= 50) {
    return "AT_RISK";
  }

  return "OFF_TRACK";
}

function metricIsBehind(
  status?: MetricStatus,
): boolean {
  return (
    status === "BEHIND"
  );
}

function hasKnownOwner(
  ownerId: string | undefined,
  owners: OperatingOwner[],
): boolean {
  if (!ownerId) {
    return false;
  }

  return owners.some(
    (owner) =>
      owner.id === ownerId,
  );
}

function countMissingOwners(
  input: OperatingHealthInput,
): number {
  const {
    owners,
    goals,
    metrics,
    workstreams,
    commitments,
    dependencies,
    issues,
  } = input;

  const goalCount =
    goals.filter(
      (goal) =>
        goal.status === "ACTIVE" &&
        !hasKnownOwner(
          goal.ownerId,
          owners,
        ),
    ).length;

  const metricCount =
    metrics.filter(
      (metric) =>
        !hasKnownOwner(
          metric.ownerId,
          owners,
        ),
    ).length;

  const workstreamCount =
    workstreams.filter(
      (workstream) =>
        workstream.status ===
          "ACTIVE" &&
        !hasKnownOwner(
          workstream.ownerId,
          owners,
        ),
    ).length;

  const commitmentCount =
    commitments.filter(
      (commitment) =>
        commitment.status !==
          "DONE" &&
        commitment.status !==
          "CANCELLED" &&
        !hasKnownOwner(
          commitment.ownerId,
          owners,
        ),
    ).length;

  const dependencyCount =
    dependencies.filter(
      (dependency) =>
        dependency.status !==
          "RESOLVED" &&
        !hasKnownOwner(
          dependency.ownerId,
          owners,
        ),
    ).length;

  const issueCount =
    issues.filter(
      (issue) =>
        issue.status !==
          "RESOLVED" &&
        issue.status !==
          "ACCEPTED" &&
        !hasKnownOwner(
          issue.ownerId,
          owners,
        ),
    ).length;

  return (
    goalCount +
    metricCount +
    workstreamCount +
    commitmentCount +
    dependencyCount +
    issueCount
  );
}

function countStaleUpdates(
  input: OperatingHealthInput,
): number {
  const staleAfterDays =
    input.staleAfterDays ?? 7;

  const goalCount =
    input.goals.filter(
      (goal) =>
        goal.status === "ACTIVE" &&
        isStale(
          goal.lastUpdatedAt,
          input.now,
          staleAfterDays,
        ),
    ).length;

  const metricCount =
    input.metrics.filter(
      (metric) =>
        isStale(
          metric.updatedAt ??
            metric.measuredAt,
          input.now,
          staleAfterDays,
        ),
    ).length;

  const workstreamCount =
    input.workstreams.filter(
      (workstream) =>
        workstream.status ===
          "ACTIVE" &&
        isStale(
          workstream.lastUpdatedAt,
          input.now,
          staleAfterDays,
        ),
    ).length;

  const commitmentCount =
    input.commitments.filter(
      (commitment) =>
        commitment.status !==
          "DONE" &&
        commitment.status !==
          "CANCELLED" &&
        isStale(
          commitment.updatedAt,
          input.now,
          staleAfterDays,
        ),
    ).length;

  const dependencyCount =
    input.dependencies.filter(
      (dependency) =>
        dependency.status !==
          "RESOLVED" &&
        isStale(
          dependency.updatedAt,
          input.now,
          staleAfterDays,
        ),
    ).length;

  const issueCount =
    input.issues.filter(
      (issue) =>
        issue.status !==
          "RESOLVED" &&
        issue.status !==
          "ACCEPTED" &&
        isStale(
          issue.updatedAt,
          input.now,
          staleAfterDays,
        ),
    ).length;

  return (
    goalCount +
    metricCount +
    workstreamCount +
    commitmentCount +
    dependencyCount +
    issueCount
  );
}

export function calculateOperatingHealth(
  input: OperatingHealthInput,
): OperatingHealthBreakdown {
  const overdueCommitments =
    input.commitments.filter(
      (commitment) =>
        commitment.status !==
          "DONE" &&
        commitment.status !==
          "CANCELLED" &&
        isPastDue(
          commitment.dueAt,
          input.now,
        ),
    ).length;

  const blockedCommitments =
    input.commitments.filter(
      (commitment) =>
        commitment.status ===
        "BLOCKED",
    ).length;

  const blockedDependencies =
    input.dependencies.filter(
      (dependency) =>
        dependency.status ===
        "BLOCKED",
    ).length;

  const openCriticalIssues =
    input.issues.filter(
      (issue) =>
        issue.priority ===
          "CRITICAL" &&
        issue.status !==
          "RESOLVED" &&
        issue.status !==
          "ACCEPTED",
    ).length;

  const behindMetrics =
    input.metrics.filter(
      (metric) =>
        metricIsBehind(
          metric.status,
        ),
    ).length;

  const missingOwners =
    countMissingOwners(input);

  const staleUpdates =
    countStaleUpdates(input);

  /**
   * This is deliberately deterministic.
   *
   * We are not asking an LLM to decide
   * whether the company is healthy.
   *
   * The score is an explainable operating
   * heuristic that can later be tuned using
   * real company behaviour.
   */
  const penalty =
    overdueCommitments * 8 +
    blockedCommitments * 10 +
    blockedDependencies * 9 +
    openCriticalIssues * 18 +
    behindMetrics * 7 +
    missingOwners * 4 +
    staleUpdates * 3;

  const score =
    clamp(100 - penalty);

  const reasons: string[] = [];

  if (openCriticalIssues > 0) {
    reasons.push(
      `${openCriticalIssues} critical issue${
        openCriticalIssues === 1
          ? ""
          : "s"
      } open`,
    );
  }

  if (blockedCommitments > 0) {
    reasons.push(
      `${blockedCommitments} blocked commitment${
        blockedCommitments === 1
          ? ""
          : "s"
      }`,
    );
  }

  if (overdueCommitments > 0) {
    reasons.push(
      `${overdueCommitments} overdue commitment${
        overdueCommitments === 1
          ? ""
          : "s"
      }`,
    );
  }

  if (blockedDependencies > 0) {
    reasons.push(
      `${blockedDependencies} blocked dependenc${
        blockedDependencies === 1
          ? "y"
          : "ies"
      }`,
    );
  }

  if (behindMetrics > 0) {
    reasons.push(
      `${behindMetrics} metric${
        behindMetrics === 1
          ? ""
          : "s"
      } behind target`,
    );
  }

  if (missingOwners > 0) {
    reasons.push(
      `${missingOwners} active operating object${
        missingOwners === 1
          ? ""
          : "s"
      } without a valid owner`,
    );
  }

  if (staleUpdates > 0) {
    reasons.push(
      `${staleUpdates} stale operating update${
        staleUpdates === 1
          ? ""
          : "s"
      }`,
    );
  }

  if (reasons.length === 0) {
    reasons.push(
      "No material operating exceptions detected.",
    );
  }

  return {
    health:
      healthFromScore(score),

    score,

    reasons,

    overdueCommitments,
    blockedCommitments,
    blockedDependencies,
    openCriticalIssues,
    behindMetrics,
    missingOwners,
    staleUpdates,
  };
}