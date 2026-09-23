import type {
  KnowledgeEntityType,
  KnowledgeProvenance,
  KnowledgeRelationType,
  KnowledgeSourceType,
  KnowledgeState,
} from "@/domain/knowledge/types";

export interface BrainSourceView {
  id: string;
  name: string;
  type: KnowledgeSourceType;
  provenance: KnowledgeProvenance;
  description: string;
  trustScore: number;
  connected: boolean;
  readOnly: boolean;
  lastSyncedAt?: string;
  documentCount: number;
  claimCount: number;
  evidenceCount: number;
}

export interface BrainLineageView {
  claimId: string;
  statement: string;
  state: KnowledgeState;
  provenance: KnowledgeProvenance;
  confidence: number;

  evidence?: {
    id: string;
    excerpt: string;
    reliability: number;
    observedAt: string;
  };

  document?: {
    id: string;
    title: string;
    tags: string[];
  };

  source: {
    id: string;
    name: string;
    type: KnowledgeSourceType;
    provenance:
      KnowledgeProvenance;
    trustScore: number;
    connected: boolean;
  };

  entityIds: string[];
  requiredEvidence: string[];
}

export interface BrainGraphNode {
  id: string;
  name: string;
  type: KnowledgeEntityType;
  description?: string;
}

export interface BrainGraphEdge {
  id: string;
  from: string;
  to: string;
  type: KnowledgeRelationType;
  description?: string;
  confidence: number;
  evidenceIds: string[];
}

export interface BrainBlindSpot {
  claimId: string;
  statement: string;
  confidence: number;
  entityIds: string[];
  requiredEvidence: string[];
  sourceId: string;
}

export interface BrainIntelligenceSnapshot {
  generatedAt: string;

  summary: {
    sourceCount: number;
    connectedSourceCount: number;
    documentCount: number;
    chunkCount: number;
    entityCount: number;
    relationCount: number;
    claimCount: number;
    evidenceCount: number;
    averageSourceTrust: number;
    averageEvidenceReliability: number;
  };

  knowledgeStates: Record<
    KnowledgeState,
    number
  >;

  provenance: Record<
    KnowledgeProvenance,
    number
  >;

  sources: BrainSourceView[];

  lineage: BrainLineageView[];

  graph: {
    nodes: BrainGraphNode[];
    edges: BrainGraphEdge[];
  };

  blindSpots: BrainBlindSpot[];
}