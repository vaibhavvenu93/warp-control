import type {
  KnowledgeProvenance,
} from "@/domain/knowledge/types";

import type {
  MarketSignalCategory,
} from "@/domain/market-radar/types";

import type {
  ObservationEntityType,
} from "@/domain/market-radar/ingestion/observation-types";

export type MarketClaimType =
  | "PRODUCT_CHANGE"
  | "PRICING_CHANGE"
  | "POSITIONING_CHANGE"
  | "COMPANY_ANNOUNCEMENT"
  | "CUSTOMER_SIGNAL"
  | "TECHNOLOGY_CHANGE"
  | "ECOSYSTEM_CHANGE"
  | "HIRING_SIGNAL"
  | "SECURITY_SIGNAL"
  | "CAPITAL_SIGNAL"
  | "PARTNERSHIP_SIGNAL"
  | "GENERAL_OBSERVATION";

export type ClaimEpistemicState =
  | "OBSERVED"
  | "CORROBORATED"
  | "CONTESTED"
  | "SUPERSEDED";

export type ClaimStrength =
  | "WEAK"
  | "MODERATE"
  | "STRONG"
  | "VERY_STRONG";

export interface MarketClaimEvidence {
  observationId: string;
  sourceId: string;
  sourceName: string;
  sourceUri: string;
  provenance: KnowledgeProvenance;
  trustScore: number;
  freshnessScore: number;
  observedAt: string;
}

export interface MarketClaim {
  id: string;
  fingerprint: string;

  type: MarketClaimType;

  subject: string;
  normalizedSubject: string;

  predicate: string;
  object: string;

  statement: string;

  categories: MarketSignalCategory[];

  entities: Array<{
    name: string;
    normalizedName: string;
    type: ObservationEntityType;
  }>;

  evidence: MarketClaimEvidence[];

  epistemicState: ClaimEpistemicState;
  strength: ClaimStrength;

  confidence: number;

  firstObservedAt: string;
  lastObservedAt: string;

  createdAt: string;
  updatedAt: string;

  metadata: Record<string, unknown>;
}

export interface ClaimCandidate {
  type: MarketClaimType;

  subject: string;
  predicate: string;
  object: string;

  statement: string;

  categories: MarketSignalCategory[];

  metadata?: Record<string, unknown>;
}

export interface ClaimExtractionResult {
  observationId: string;
  candidates: ClaimCandidate[];
  warnings: string[];
}

export interface ClaimTriangulation {
  claimId: string;

  evidenceCount: number;
  independentSourceCount: number;

  averageTrust: number;
  averageFreshness: number;

  confidence: number;
  strength: ClaimStrength;

  epistemicState: ClaimEpistemicState;

  sourceIds: string[];
}