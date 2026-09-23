import type {
  KnowledgeProvenance,
  KnowledgeSourceType,
} from "@/domain/knowledge/types";

import type {
  MarketSignalCategory,
} from "@/domain/market-radar/types";

export type ExternalSourceKind =
  | "WEBSITE"
  | "GITHUB"
  | "NEWS"
  | "BLOG"
  | "CHANGELOG"
  | "DOCUMENTATION"
  | "PRICING_PAGE"
  | "CAREERS"
  | "RSS"
  | "API";

export type ObservationState =
  | "OBSERVED"
  | "NORMALIZED"
  | "DUPLICATE"
  | "STALE"
  | "REJECTED";

export type FreshnessBand =
  | "FRESH"
  | "RECENT"
  | "AGING"
  | "STALE";

export type ObservationEntityType =
  | "COMPANY"
  | "PRODUCT"
  | "TECHNOLOGY"
  | "MARKET"
  | "PERSON"
  | "REPOSITORY"
  | "PRICING"
  | "CUSTOMER"
  | "CONCEPT";

export interface ExternalSourceDefinition {
  id: string;
  name: string;
  kind: ExternalSourceKind;
  sourceType: KnowledgeSourceType;
  provenance: KnowledgeProvenance;
  uri: string;
  description: string;
  trustScore: number;
  enabled: boolean;
  pollingEligible: boolean;
  tags: string[];
  metadata: Record<string, unknown>;
}

export interface RawObservation {
  externalId: string;
  sourceId: string;
  sourceName: string;
  sourceUri: string;

  title: string;
  body: string;

  canonicalUri?: string;

  publishedAt?: string;
  observedAt: string;

  author?: string;

  categories: MarketSignalCategory[];

  entities: Array<{
    name: string;
    type: ObservationEntityType;
  }>;

  metadata: Record<string, unknown>;
}

export interface ObservationFreshness {
  ageHours: number;
  score: number;
  band: FreshnessBand;
}

export interface MarketObservation {
  id: string;
  fingerprint: string;

  externalId: string;

  sourceId: string;
  sourceName: string;
  sourceKind: ExternalSourceKind;
  sourceUri: string;

  title: string;
  body: string;

  canonicalUri: string;

  publishedAt?: string;
  observedAt: string;
  ingestedAt: string;

  author?: string;

  categories: MarketSignalCategory[];

  entities: Array<{
    name: string;
    normalizedName: string;
    type: ObservationEntityType;
  }>;

  provenance: KnowledgeProvenance;
  trustScore: number;

  freshness: ObservationFreshness;

  state: ObservationState;

  metadata: Record<string, unknown>;
}

export interface ObservationRejection {
  externalId?: string;
  sourceId?: string;
  reason: string;
}

export interface IngestionBatchResult {
  sourceId: string;

  startedAt: string;
  completedAt: string;

  received: number;
  accepted: number;
  duplicates: number;
  stale: number;
  rejected: number;

  observations: MarketObservation[];

  rejections: ObservationRejection[];
}

export interface SourceAdapterContext {
  now: string;
}

export interface ExternalSourceAdapter {
  readonly source: ExternalSourceDefinition;

  fetch(
    context: SourceAdapterContext,
  ): Promise<RawObservation[]>;
}