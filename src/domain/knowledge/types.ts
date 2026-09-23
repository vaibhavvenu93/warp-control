export type KnowledgeState =
  | "KNOWN"
  | "INFERRED"
  | "MODELED"
  | "UNKNOWN";

export type KnowledgeSourceType =
  | "PUBLIC_WEB"
  | "CONNECTED_SYSTEM"
  | "INTERNAL_DOCUMENT"
  | "CONTROL_PLANE"
  | "MODELED_ANALYSIS"
  | "HUMAN_INPUT";

export type KnowledgeProvenance =
  | "PUBLIC"
  | "CONNECTED"
  | "INTERNAL"
  | "MODELED"
  | "ASSUMED";

export type KnowledgeEntityType =
  | "COMPANY"
  | "ACCOUNT"
  | "PERSON"
  | "PRODUCT"
  | "EXPERIMENT"
  | "DECISION"
  | "AGENT"
  | "METRIC"
  | "MARKET"
  | "TECHNOLOGY"
  | "CONCEPT";

export type KnowledgeRelationType =
  | "USES"
  | "OWNS"
  | "RELATES_TO"
  | "SUPPORTS"
  | "CONTRADICTS"
  | "DEPENDS_ON"
  | "GENERATED_BY"
  | "TARGETS"
  | "MEASURES"
  | "INFORMS";

export interface KnowledgeSource {
  id: string;
  name: string;
  type: KnowledgeSourceType;
  provenance: KnowledgeProvenance;
  description: string;
  uri?: string;
  trustScore: number;
  connected: boolean;
  readOnly: boolean;
  lastSyncedAt?: string;
  metadata: Record<
    string,
    unknown
  >;
}

export interface KnowledgeDocument {
  id: string;
  sourceId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  effectiveAt?: string;
  expiresAt?: string;
  tags: string[];
  entityIds: string[];
  metadata: Record<
    string,
    unknown
  >;
}

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  sourceId: string;
  ordinal: number;
  content: string;
  tokenEstimate: number;
  entityIds: string[];
  tags: string[];
  createdAt: string;
}

export interface KnowledgeEntity {
  id: string;
  type: KnowledgeEntityType;
  name: string;
  aliases: string[];
  description?: string;
  attributes: Record<
    string,
    unknown
  >;
}

export interface KnowledgeRelation {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  type: KnowledgeRelationType;
  description?: string;
  evidenceIds: string[];
  confidence: number;
}

export interface KnowledgeClaim {
  id: string;
  statement: string;
  state: KnowledgeState;
  provenance: KnowledgeProvenance;
  confidence: number;
  sourceId: string;
  documentId?: string;
  chunkId?: string;
  entityIds: string[];
  observedAt: string;
  validFrom?: string;
  validUntil?: string;
  supersedesClaimId?: string;
  metadata: Record<
    string,
    unknown
  >;
}

export interface KnowledgeEvidence {
  id: string;
  claimId: string;
  sourceId: string;
  documentId?: string;
  chunkId?: string;
  excerpt: string;
  reliability: number;
  observedAt: string;
}

export interface KnowledgeGraph {
  entities: KnowledgeEntity[];
  relations: KnowledgeRelation[];
  claims: KnowledgeClaim[];
  evidence: KnowledgeEvidence[];
}

export interface KnowledgeSnapshot {
  sources: KnowledgeSource[];
  documents: KnowledgeDocument[];
  chunks: KnowledgeChunk[];
  graph: KnowledgeGraph;
}