import type {
  KnowledgeEntityType,
  KnowledgeProvenance,
  KnowledgeSourceType,
} from "@/domain/knowledge/types";

export type QueryIntent =
  | "FACT_LOOKUP"
  | "DECISION_SUPPORT"
  | "ACCOUNT_INTELLIGENCE"
  | "ECONOMIC_ANALYSIS"
  | "EXPERIMENT_ANALYSIS"
  | "MARKET_RESEARCH"
  | "EXECUTIVE_BRIEF"
  | "UNKNOWN";

export type RetrievalStrategy =
  | "LEXICAL"
  | "ENTITY"
  | "CLAIM"
  | "GRAPH"
  | "HYBRID";

export type EvidenceRequirement =
  | "PUBLIC_FACT"
  | "INTERNAL_FACT"
  | "CONNECTED_DATA"
  | "MODELED_ANALYSIS"
  | "DECISION_CONTEXT"
  | "UNKNOWN_RESOLUTION";

export interface QueryEntityHint {
  value: string;
  normalizedValue: string;
  entityTypes: KnowledgeEntityType[];
  confidence: number;
}

export interface QueryFilters {
  entityTypes: KnowledgeEntityType[];
  sourceTypes: KnowledgeSourceType[];
  provenance: KnowledgeProvenance[];
  includeUnknowns: boolean;
  includeModeled: boolean;
}

export interface QueryPlan {
  id: string;
  query: string;
  normalizedQuery: string;
  intent: QueryIntent;
  strategies: RetrievalStrategy[];
  entityHints: QueryEntityHint[];
  evidenceRequirements: EvidenceRequirement[];
  filters: QueryFilters;
  terms: string[];
  requiresHumanJudgment: boolean;
  rationale: string[];
  createdAt: string;
}

export interface QueryPlannerOptions {
  now?: () => string;
  createId?: () => string;
}