import type {
  ConfidenceLevel,
  EvidenceRef,
} from "@/domain/types";

/**
 * Company Operating System
 *
 * This domain models the mechanics required to run the company:
 *
 * Goal
 *   -> Metric
 *   -> Workstream
 *   -> Commitment
 *   -> Dependency
 *   -> Issue
 *   -> Follow-up
 *   -> CEO attention / decision
 *
 * It deliberately separates operating facts from recommendations.
 */

export type OperatingHealth =
  | "ON_TRACK"
  | "WATCH"
  | "AT_RISK"
  | "OFF_TRACK"
  | "UNKNOWN";

export type OperatingPriority =
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW";

export type GoalStatus =
  | "ACTIVE"
  | "ACHIEVED"
  | "PAUSED"
  | "CANCELLED";

export type MetricDirection =
  | "INCREASE"
  | "DECREASE"
  | "MAINTAIN";

export type MetricStatus =
  | "AHEAD"
  | "ON_TRACK"
  | "WATCH"
  | "BEHIND"
  | "UNKNOWN";

export type WorkstreamType =
  | "PRODUCT"
  | "ENGINEERING"
  | "GROWTH"
  | "GTM"
  | "CUSTOMER"
  | "FINANCE"
  | "HIRING"
  | "LEGAL"
  | "VENDOR"
  | "SECURITY"
  | "INFRASTRUCTURE"
  | "STRATEGY"
  | "COMMUNICATIONS"
  | "OTHER";

export type WorkstreamStatus =
  | "ACTIVE"
  | "BLOCKED"
  | "PAUSED"
  | "COMPLETE";

export type CommitmentStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "DONE"
  | "CANCELLED";

export type DependencyStatus =
  | "HEALTHY"
  | "WATCH"
  | "BLOCKED"
  | "RESOLVED";

export type OperatingIssueType =
  | "RISK"
  | "BLOCKER"
  | "SLIPPAGE"
  | "DEPENDENCY"
  | "CAPACITY"
  | "OWNERSHIP"
  | "DATA_GAP"
  | "PROCESS"
  | "DECISION";

export type OperatingIssueStatus =
  | "OPEN"
  | "INVESTIGATING"
  | "MITIGATING"
  | "RESOLVED"
  | "ACCEPTED";

export type FollowUpStatus =
  | "OPEN"
  | "DONE"
  | "OVERDUE"
  | "CANCELLED";

export type CadenceType =
  | "DAILY"
  | "WEEKLY"
  | "BIWEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "EVENT_DRIVEN";

export type ReviewType =
  | "COMPANY"
  | "PRODUCT"
  | "ENGINEERING"
  | "GROWTH"
  | "GTM"
  | "CUSTOMER"
  | "FINANCE"
  | "HIRING"
  | "SECURITY"
  | "INVESTOR"
  | "OTHER";

export type AttentionAction =
  | "MONITOR"
  | "FOLLOW_UP"
  | "DELEGATE"
  | "ESCALATE"
  | "DECIDE";

export type AttentionReason =
  | "GOAL_OFF_TRACK"
  | "METRIC_BEHIND"
  | "COMMITMENT_OVERDUE"
  | "COMMITMENT_BLOCKED"
  | "DEPENDENCY_BLOCKED"
  | "ISSUE_CRITICAL"
  | "OWNER_MISSING"
  | "UPDATE_STALE"
  | "DECISION_REQUIRED"
  | "MULTIPLE_FAILURES";

export interface OperatingOwner {
  id: string;
  name: string;
  role: string;
  function?: string;
  isExecutive?: boolean;
}

export interface OperatingMetric {
  id: string;
  name: string;
  description?: string;

  unit:
    | "NUMBER"
    | "PERCENT"
    | "CURRENCY"
    | "DAYS"
    | "HOURS"
    | "MINUTES"
    | "RATIO"
    | "TEXT";

  direction: MetricDirection;

  currentValue?: number;
  targetValue?: number;
  baselineValue?: number;

  status?: MetricStatus;
  health?: OperatingHealth;

  ownerId?: string;

  measuredAt?: string;
  updatedAt?: string;

  evidence?: EvidenceRef[];

  confidence?: ConfidenceLevel;

  metadata?: Record<string, unknown>;
}

export interface OperatingGoal {
  id: string;
  title: string;
  description: string;

  status: GoalStatus;
  priority: OperatingPriority;

  ownerId?: string;

  startAt: string;
  targetAt: string;

  metricIds: string[];
  workstreamIds: string[];

  health?: OperatingHealth;

  lastUpdatedAt?: string;

  evidence?: EvidenceRef[];

  metadata?: Record<string, unknown>;
}

export interface OperatingWorkstream {
  id: string;
  title: string;
  description: string;

  type: WorkstreamType;
  status: WorkstreamStatus;
  priority: OperatingPriority;

  ownerId?: string;

  goalIds: string[];
  commitmentIds: string[];
  dependencyIds: string[];
  issueIds: string[];

  health?: OperatingHealth;

  lastUpdatedAt?: string;

  metadata?: Record<string, unknown>;
}

export interface OperatingCommitment {
  id: string;
  title: string;
  description?: string;

  workstreamId: string;
  goalIds: string[];

  ownerId?: string;

  status: CommitmentStatus;
  priority: OperatingPriority;

  createdAt: string;
  dueAt: string;
  completedAt?: string;
  updatedAt?: string;

  dependencyIds: string[];
  issueIds: string[];

  health?: OperatingHealth;

  evidence?: EvidenceRef[];

  metadata?: Record<string, unknown>;
}

export interface OperatingDependency {
  id: string;
  title: string;
  description?: string;

  status: DependencyStatus;
  priority: OperatingPriority;

  ownerId?: string;

  sourceWorkstreamId?: string;
  targetWorkstreamId?: string;

  requiredBy?: string;
  updatedAt?: string;

  health?: OperatingHealth;

  evidence?: EvidenceRef[];

  metadata?: Record<string, unknown>;
}

export interface OperatingIssue {
  id: string;
  title: string;
  description: string;

  type: OperatingIssueType;
  status: OperatingIssueStatus;
  priority: OperatingPriority;

  ownerId?: string;

  goalIds: string[];
  workstreamIds: string[];
  commitmentIds: string[];
  dependencyIds: string[];

  openedAt: string;
  targetResolutionAt?: string;
  resolvedAt?: string;
  updatedAt?: string;

  decisionRequired: boolean;
  decisionId?: string;

  health?: OperatingHealth;

  evidence?: EvidenceRef[];

  metadata?: Record<string, unknown>;
}

export interface OperatingFollowUp {
  id: string;
  title: string;

  ownerId?: string;

  status: FollowUpStatus;
  priority: OperatingPriority;

  createdAt: string;
  dueAt: string;
  completedAt?: string;

  goalId?: string;
  workstreamId?: string;
  commitmentId?: string;
  issueId?: string;

  evidence?: EvidenceRef[];

  metadata?: Record<string, unknown>;
}

export interface OperatingCadence {
  id: string;
  title: string;
  description: string;

  cadence: CadenceType;
  reviewType: ReviewType;

  ownerId?: string;

  participantIds: string[];

  metricIds: string[];
  goalIds: string[];
  workstreamIds: string[];

  enabled: boolean;

  metadata?: Record<string, unknown>;
}

export interface OperatingReview {
  id: string;
  cadenceId: string;

  reviewType: ReviewType;

  startedAt: string;
  completedAt?: string;

  health: OperatingHealth;

  goalIds: string[];
  metricIds: string[];
  workstreamIds: string[];
  issueIds: string[];
  attentionItemIds: string[];

  summary: string;

  metadata?: Record<string, unknown>;
}

export interface OperatingAttentionItem {
  id: string;

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

  surfacedAt: string;
  dueAt?: string;

  businessImpact: string;
  whyNow: string;

  recommendedAction: string;

  humanReviewRequired: boolean;
  decisionRequired: boolean;

  confidence: number;

  evidence?: EvidenceRef[];

  metadata?: Record<string, unknown>;
}

export interface OperatingHealthBreakdown {
  health: OperatingHealth;

  score: number;

  reasons: string[];

  overdueCommitments: number;
  blockedCommitments: number;
  blockedDependencies: number;
  openCriticalIssues: number;
  behindMetrics: number;
  missingOwners: number;
  staleUpdates: number;
}

export interface CompanyOperatingSnapshot {
  generatedAt: string;

  owners: OperatingOwner[];
  goals: OperatingGoal[];
  metrics: OperatingMetric[];
  workstreams: OperatingWorkstream[];
  commitments: OperatingCommitment[];
  dependencies: OperatingDependency[];
  issues: OperatingIssue[];
  followUps: OperatingFollowUp[];
  cadences: OperatingCadence[];

  attention: OperatingAttentionItem[];

  health: OperatingHealthBreakdown;

  disclaimer: string;
}