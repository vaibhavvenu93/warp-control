import type {
  BrainAnswerMode,
  BrainCitation,
} from "@/domain/brain/types";

export type ExecutiveBlockType =
  | "SITUATION"
  | "WHY_IT_MATTERS"
  | "KNOWN"
  | "MODELED"
  | "INFERRED"
  | "BLIND_SPOT"
  | "EVIDENCE_REQUIRED"
  | "DECISION"
  | "SYSTEM_BOUNDARY";

export type ExecutiveBlockSeverity =
  | "INFO"
  | "OPPORTUNITY"
  | "WARNING"
  | "CRITICAL"
  | "DECISION";

export interface ExecutiveAssertion {
  id: string;
  text: string;

  citationIds: string[];

  support:
    | "SUPPORTED"
    | "MODELED"
    | "INFERRED"
    | "UNKNOWN"
    | "POLICY";
}

export interface ExecutiveBlock {
  id: string;

  type: ExecutiveBlockType;

  label: string;

  severity: ExecutiveBlockSeverity;

  assertions: ExecutiveAssertion[];
}

export interface ExecutiveSynthesisPlan {
  mode: BrainAnswerMode;

  headline: string;

  confidence: number;

  blocks: ExecutiveBlock[];

  citations: BrainCitation[];

  caveats: string[];

  unresolvedQuestions: string[];

  requiredEvidence: string[];

  humanJudgmentRequired: boolean;
}

export interface SupportViolation {
  assertionId: string;

  blockId: string;

  reason:
    | "MISSING_CITATION"
    | "UNKNOWN_CITATION"
    | "STATE_MISMATCH"
    | "UNSUPPORTED_FACTUAL_ASSERTION";

  message: string;
}

export interface SupportValidationResult {
  valid: boolean;

  checkedAssertions: number;

  supportedAssertions: number;

  policyAssertions: number;

  violations: SupportViolation[];
}

export interface ValidatedExecutiveSynthesis {
  plan: ExecutiveSynthesisPlan;

  validation: SupportValidationResult;
}