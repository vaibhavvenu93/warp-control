import type {
  ConfidenceLevel,
  EvidenceRef,
  EvidenceType,
} from "@/domain/types";

export type CommunicationAudience =
  | "CEO"
  | "LEADERSHIP"
  | "TEAM"
  | "INVESTOR"
  | "CUSTOMER"
  | "PUBLIC";

export type CommunicationType =
  | "CEO_BRIEF"
  | "LEADERSHIP_BRIEF"
  | "TEAM_UPDATE"
  | "INVESTOR_UPDATE"
  | "CUSTOMER_UPDATE"
  | "EXTERNAL_NARRATIVE";

export type CommunicationPurpose =
  | "OPERATING_REVIEW"
  | "DECISION_SUPPORT"
  | "PROGRESS_UPDATE"
  | "INVESTOR_REPORTING"
  | "ALIGNMENT"
  | "EXTERNAL_COMMUNICATION";

export type ClaimState =
  | "SUPPORTED"
  | "MODELED"
  | "NEEDS_EVIDENCE"
  | "BLOCKED";

export type ClaimRisk =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type ApprovalState =
  | "DRAFT"
  | "REVIEW_REQUIRED"
  | "APPROVED"
  | "REJECTED"
  | "PUBLISHED";

export type CommunicationSectionType =
  | "EXECUTIVE_SUMMARY"
  | "WHAT_CHANGED"
  | "PROGRESS"
  | "COMMERCIAL"
  | "PRODUCT"
  | "OPERATIONS"
  | "PEOPLE"
  | "MARKET"
  | "DECISIONS"
  | "RISKS"
  | "NEXT_STEPS"
  | "ASKS"
  | "OTHER";

export interface CommunicationSource {
  id: string;
  label: string;
  description?: string;

  evidenceType: EvidenceType;

  evidence: EvidenceRef[];

  capturedAt: string;

  metadata?: Record<string, unknown>;
}

export interface CommunicationClaim {
  id: string;

  statement: string;

  section: CommunicationSectionType;

  evidenceIds: string[];

  sourceIds: string[];

  evidenceTypes: EvidenceType[];

  state: ClaimState;
  risk: ClaimRisk;

  confidence: number;
  confidenceLevel: ConfidenceLevel;

  audience: CommunicationAudience[];

  humanReviewRequired: boolean;

  reason: string;

  createdAt: string;

  metadata?: Record<string, unknown>;
}

export interface ClaimValidationResult {
  claimId: string;

  state: ClaimState;
  risk: ClaimRisk;

  confidence: number;
  confidenceLevel: ConfidenceLevel;

  evidenceCount: number;
  independentSourceCount: number;

  hasPublicEvidence: boolean;
  hasConnectedEvidence: boolean;
  hasInternalEvidence: boolean;
  hasModeledEvidence: boolean;
  hasAssumedEvidence: boolean;

  allowedAudiences: CommunicationAudience[];

  humanReviewRequired: boolean;

  reasons: string[];
}

export interface CommunicationSection {
  id: string;

  type: CommunicationSectionType;

  title: string;

  claimIds: string[];

  summary?: string;

  order: number;

  metadata?: Record<string, unknown>;
}

export interface CommunicationBrief {
  id: string;

  title: string;

  type: CommunicationType;
  purpose: CommunicationPurpose;
  audience: CommunicationAudience;

  generatedAt: string;
  periodStart?: string;
  periodEnd?: string;

  sectionIds: string[];
  claimIds: string[];

  blockedClaimIds: string[];
  reviewRequiredClaimIds: string[];

  approvalState: ApprovalState;

  humanApprovalRequired: boolean;

  summary: string;

  disclaimer: string;

  metadata?: Record<string, unknown>;
}

export interface CommunicationApproval {
  id: string;

  briefId: string;

  state: ApprovalState;

  reviewer?: string;

  note?: string;

  createdAt: string;
}

export interface CommunicationMetrics {
  totalClaims: number;
  supportedClaims: number;
  modeledClaims: number;
  needsEvidenceClaims: number;
  blockedClaims: number;
  humanReviewClaims: number;
  publishableClaims: number;
}

export interface CommunicationsSnapshot {
  generatedAt: string;

  sources: CommunicationSource[];

  claims: CommunicationClaim[];

  validations: ClaimValidationResult[];

  sections: CommunicationSection[];

  briefs: CommunicationBrief[];

  approvals: CommunicationApproval[];

  metrics: CommunicationMetrics;

  disclaimer: string;
}