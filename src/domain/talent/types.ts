import type {
  EvidenceRef,
} from "@/domain/types";

import type {
  OperatingHealth,
  OperatingPriority,
} from "@/domain/operations/types";

export type CapabilityGapStatus =
  | "OPEN"
  | "SEARCH_ACTIVE"
  | "MITIGATED"
  | "CLOSED";

export type HiringSearchStatus =
  | "PLANNED"
  | "ACTIVE"
  | "PAUSED"
  | "FILLED"
  | "CANCELLED";

export type CandidateStage =
  | "SOURCED"
  | "SCREEN"
  | "DEEP_DIVE"
  | "WORK_SAMPLE"
  | "FINAL"
  | "OFFER"
  | "HIRED"
  | "REJECTED"
  | "WITHDRAWN";

export type CandidateRecommendation =
  | "ADVANCE"
  | "HOLD"
  | "REJECT"
  | "HUMAN_REVIEW"
  | "UNASSESSED";

export type EvidenceAssessment =
  | "STRONG"
  | "POSITIVE"
  | "MIXED"
  | "WEAK"
  | "UNKNOWN";

export type HiringAttentionAction =
  | "MONITOR"
  | "SOURCE"
  | "FOLLOW_UP"
  | "ESCALATE"
  | "DECIDE";

export type HiringAttentionReason =
  | "CAPABILITY_GAP_CRITICAL"
  | "PIPELINE_TOO_SHALLOW"
  | "PIPELINE_STALE"
  | "CANDIDATE_STALE"
  | "FINAL_STAGE_DECISION"
  | "OFFER_DECISION"
  | "EVIDENCE_CONFLICT"
  | "MISSING_EVIDENCE"
  | "SEARCH_BLOCKED"
  | "OWNER_MISSING";

export interface TalentOwner {
  id: string;
  name: string;
  role: string;
  isExecutive?: boolean;
}

export interface CapabilityGap {
  id: string;

  capability: string;
  description: string;

  status: CapabilityGapStatus;
  priority: OperatingPriority;

  whyNow: string;
  businessImpact: string;

  ownerId?: string;

  relatedGoalIds: string[];
  relatedWorkstreamIds: string[];

  desiredBy?: string;

  evidence?: EvidenceRef[];

  metadata?: Record<string, unknown>;
}

export interface HiringSearch {
  id: string;

  roleTitle: string;
  capabilityGapId: string;

  status: HiringSearchStatus;
  priority: OperatingPriority;

  ownerId?: string;

  openedAt: string;
  targetHireAt?: string;
  updatedAt?: string;

  targetPipelineDepth: number;

  candidateIds: string[];

  relatedGoalIds: string[];
  relatedWorkstreamIds: string[];

  metadata?: Record<string, unknown>;
}

export interface CandidateEvidence {
  id: string;

  candidateId: string;

  dimension: string;
  observation: string;

  assessment: EvidenceAssessment;

  source:
    | "APPLICATION"
    | "SCREEN"
    | "INTERVIEW"
    | "WORK_SAMPLE"
    | "REFERENCE"
    | "MODELED_DEMO";

  observedAt: string;

  interviewer?: string;

  evidence?: EvidenceRef[];

  metadata?: Record<string, unknown>;
}

export interface TalentCandidate {
  id: string;

  displayName: string;

  searchId: string;

  stage: CandidateStage;

  recommendation: CandidateRecommendation;

  enteredStageAt: string;
  updatedAt: string;

  ownerId?: string;

  evidenceIds: string[];

  strengths: string[];
  openQuestions: string[];
  risks: string[];

  humanDecisionRequired: boolean;

  metadata?: Record<string, unknown>;
}

export interface PipelineStageCount {
  stage: CandidateStage;
  count: number;
}

export interface HiringPipelineHealth {
  searchId: string;

  health: OperatingHealth;
  score: number;

  activeCandidates: number;
  targetPipelineDepth: number;

  stageCounts: PipelineStageCount[];

  finalStageCandidates: number;
  staleCandidates: number;

  reasons: string[];
}

export interface CapabilityAssessment {
  capabilityGapId: string;

  health: OperatingHealth;
  score: number;

  reasons: string[];

  activeSearches: number;
  activeCandidates: number;

  recommendedAction:
    | "MONITOR"
    | "OPEN_SEARCH"
    | "DEEPEN_PIPELINE"
    | "EXECUTIVE_REVIEW";
}

export interface HiringAttentionItem {
  id: string;

  title: string;
  summary: string;

  priority: OperatingPriority;
  action: HiringAttentionAction;

  reasons: HiringAttentionReason[];

  surfacedAt: string;
  dueAt?: string;

  capabilityGapId?: string;
  searchId?: string;
  candidateId?: string;

  ownerId?: string;

  whyNow: string;
  businessImpact: string;
  recommendedAction: string;

  humanReviewRequired: boolean;
  decisionRequired: boolean;

  confidence: number;

  evidence?: EvidenceRef[];

  metadata?: Record<string, unknown>;
}

export interface TalentMetrics {
  capabilityGaps: number;
  activeSearches: number;
  activeCandidates: number;
  finalStageCandidates: number;
  searchesAtRisk: number;
  humanDecisions: number;
}

export interface TalentSnapshot {
  generatedAt: string;

  owners: TalentOwner[];

  capabilityGaps: CapabilityGap[];
  searches: HiringSearch[];

  candidates: TalentCandidate[];
  evidence: CandidateEvidence[];

  capabilityAssessments: CapabilityAssessment[];
  pipelineHealth: HiringPipelineHealth[];

  attention: HiringAttentionItem[];

  metrics: TalentMetrics;

  disclaimer: string;
}