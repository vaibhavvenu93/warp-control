import type {
  KnowledgeClaim,
  KnowledgeEntity,
  KnowledgeEvidence,
  KnowledgeProvenance,
  KnowledgeRelation,
  KnowledgeState,
} from "@/domain/knowledge/types";

import type {
  QueryPlan,
  RetrievalStrategy,
} from "@/domain/knowledge/query/types";

export type RetrievalCandidateType =
  | "CHUNK"
  | "CLAIM"
  | "ENTITY"
  | "RELATION";

export interface RetrievalScoreBreakdown {
  lexical: number;
  entityAffinity: number;
  graphAffinity: number;
  provenanceReliability: number;
  claimConfidence: number;
  unknownPriority: number;
  modeledPenalty: number;
  finalScore: number;
}

export interface RetrievalCandidate {
  id: string;
  type: RetrievalCandidateType;

  title: string;
  content: string;

  entityIds: string[];

  claimId?: string;
  chunkId?: string;
  relationId?: string;

  sourceId?: string;
  evidenceIds: string[];

  state?: KnowledgeState;
  provenance?: KnowledgeProvenance;
  confidence?: number;

  matchedTerms: string[];
  matchedStrategies: RetrievalStrategy[];

  lexicalScore: number;
  entityAffinity: number;
  graphAffinity: number;

  score?: RetrievalScoreBreakdown;

  metadata: Record<string, unknown>;
}

export interface RetrievalTraceStep {
  stage:
    | "PLAN"
    | "LEXICAL"
    | "ENTITY"
    | "CLAIM"
    | "GRAPH"
    | "RERANK"
    | "CONTEXT";

  message: string;

  candidateIds: string[];

  metadata: Record<string, unknown>;
}

export interface RetrievalGap {
  id: string;

  entityIds: string[];
  claimId?: string;

  description: string;

  requiredEvidence: string[];

  severity:
    | "LOW"
    | "MEDIUM"
    | "HIGH";
}

export interface RetrievalContradiction {
  id: string;

  entityIds: string[];
  claimIds: string[];

  description: string;
}

export interface RankedKnowledgeContext {
  queryPlan: QueryPlan;

  candidates: RetrievalCandidate[];

  claims: KnowledgeClaim[];
  entities: KnowledgeEntity[];
  relations: KnowledgeRelation[];
  evidence: KnowledgeEvidence[];

  knownClaims: KnowledgeClaim[];
  inferredClaims: KnowledgeClaim[];
  modeledClaims: KnowledgeClaim[];
  unknownClaims: KnowledgeClaim[];

  gaps: RetrievalGap[];
  contradictions: RetrievalContradiction[];

  trace: RetrievalTraceStep[];

  summary: {
    candidateCount: number;
    selectedCount: number;
    evidenceCount: number;
    unknownCount: number;
    modeledCount: number;
    contradictionCount: number;
  };
}