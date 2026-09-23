import type {
  KnowledgeProvenance,
  KnowledgeState,
} from "@/domain/knowledge/types";

import type {
  QueryIntent,
} from "@/domain/knowledge/query/types";

import type {
  AnswerabilityAssessment,
  AnswerabilityStatus,
} from "@/intelligence/retrieval/answerability-gate";

export type BrainExecutionStage =
  | "QUERY_PLANNING"
  | "RETRIEVAL"
  | "ANSWERABILITY"
  | "SYNTHESIS"
  | "COMPLETE";

export type BrainAnswerMode =
  | "DIRECT"
  | "CAVEATED"
  | "HUMAN_DECISION_SUPPORT"
  | "ABSTAIN"
  | "CONFLICT";

export interface BrainCitation {
  id: string;

  claimId: string;
  evidenceId?: string;
  sourceId: string;

  statement: string;
  excerpt?: string;

  state: KnowledgeState;
  provenance: KnowledgeProvenance;
  confidence: number;

  documentId?: string;
  chunkId?: string;
}

export interface BrainAnswerSection {
  id: string;

  title: string;
  content: string;

  citationIds: string[];

  kind:
    | "SUMMARY"
    | "EVIDENCE"
    | "MODELED"
    | "UNKNOWN"
    | "DECISION_BOUNDARY"
    | "NEXT_ACTION";
}

export interface BrainExecutionStep {
  stage: BrainExecutionStage;

  status:
    | "SUCCESS"
    | "WARNING"
    | "BLOCKED";

  message: string;

  startedAt: string;
  completedAt: string;

  metadata:
    Record<string, unknown>;
}

export interface BrainSynthesisInput {
  question: string;

  intent: QueryIntent;

  answerability:
    AnswerabilityAssessment;

  citations:
    BrainCitation[];
}

export interface BrainSynthesisOutput {
  mode: BrainAnswerMode;

  headline: string;

  answer: string;

  sections:
    BrainAnswerSection[];

  usedCitationIds: string[];
}

export interface BrainResponse {
  id: string;

  question: string;

  createdAt: string;

  intent: QueryIntent;

  mode: BrainAnswerMode;

  answerabilityStatus:
    AnswerabilityStatus;

  confidence: number;

  headline: string;
  answer: string;

  sections:
    BrainAnswerSection[];

  citations:
    BrainCitation[];

  caveats: string[];

  unresolvedQuestions:
    string[];

  requiredEvidence:
    string[];

  policy: {
    mayAnswer: boolean;
    mayRecommend: boolean;
    humanJudgmentRequired:
      boolean;
  };

  execution: {
    correlationId: string;

    steps:
      BrainExecutionStep[];

    queryPlanId: string;

    retrievedCandidateCount:
      number;

    selectedCandidateCount:
      number;

    claimCount: number;
    evidenceCount: number;

    retrievalTraceStages:
      string[];
  };
}

export interface BrainAskOptions {
  correlationId?: string;
}

export interface BrainSynthesizer {
  synthesize(
    input: BrainSynthesisInput,
  ): BrainSynthesisOutput;
}