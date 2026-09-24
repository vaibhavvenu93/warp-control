import type {
  EvidenceType,
} from "@/domain/types";

export type MarketSignalCategory =
  | "COMPETITOR"
  | "PRODUCT"
  | "PRICING"
  | "CUSTOMER"
  | "DEVELOPER_ECOSYSTEM"
  | "AI_ENGINEERING"
  | "CI_INFRASTRUCTURE"
  | "CAPITAL"
  | "HIRING"
  | "SECURITY"
  | "OPEN_SOURCE"
  | "REGULATION"
  | "PARTNERSHIP";

export type MarketSignalDirection =
  | "OPPORTUNITY"
  | "THREAT"
  | "WATCH"
  | "NEUTRAL";

export type MarketSignalUrgency =
  | "IMMEDIATE"
  | "THIS_WEEK"
  | "THIS_MONTH"
  | "MONITOR";

export type MarketSignalStatus =
  | "NEW"
  | "INVESTIGATING"
  | "ESCALATED"
  | "ARCHIVED";

export type MarketRadarAction =
  | "INVESTIGATE"
  | "CREATE_EXPERIMENT"
  | "CREATE_DECISION"
  | "GTM_ACTION"
  | "UPDATE_MODEL"
  | "MONITOR"
  | "NO_ACTION";

export type MarketRadarImpactArea =
  | "POSITIONING"
  | "PRICING"
  | "PRODUCT"
  | "GTM"
  | "ENTERPRISE_SALES"
  | "ECONOMICS"
  | "INFRASTRUCTURE"
  | "HIRING"
  | "SECURITY"
  | "PARTNERSHIPS"
  | "STRATEGY";

export interface MarketEvidence {
  id: string;
  title: string;
  sourceName: string;
  sourceType: EvidenceType;
  sourceUrl?: string;
  observedAt: string;
  excerpt: string;
  reliability: number;
  isSynthetic: boolean;
}

export interface MarketSignalFactors {
  strategicFit: number;
  commercialImpact: number;
  productImpact: number;
  timeSensitivity: number;
  evidenceStrength: number;
  competitiveIntensity: number;
  actionability: number;
}

export interface MarketSignalScore {
  score: number;
  confidence: number;
  classification:
    | "CRITICAL"
    | "HIGH"
    | "MEDIUM"
    | "LOW";
  factors: MarketSignalFactors;
}

export interface MarketSignal {
  id: string;
  title: string;
  summary: string;
  category: MarketSignalCategory;
  direction: MarketSignalDirection;
  urgency: MarketSignalUrgency;
  status: MarketSignalStatus;
  detectedAt: string;
  entities: string[];
  impactAreas: MarketRadarImpactArea[];
  evidence: MarketEvidence[];
  factors: MarketSignalFactors;
  score?: MarketSignalScore;
  whyItMatters: string;
  recommendedAction: string;
  recommendedActionType: MarketRadarAction;
  decisionRequired: boolean;
  experimentCandidate: boolean;
  tags: string[];
}

export interface MarketTrend {
  id: string;
  title: string;
  thesis: string;
  signalIds: string[];
  direction: MarketSignalDirection;
  momentum: number;
  confidence: number;
  impactAreas: MarketRadarImpactArea[];
  implication: string;
  recommendedAction: string;
}

export interface MarketRadarMetrics {
  signalCount: number;
  criticalCount: number;
  highPriorityCount: number;
  opportunityCount: number;
  threatCount: number;
  decisionCount: number;
  experimentCandidateCount: number;
  averageConfidence: number;
}

/*
 * ------------------------------------------------------------------
 * Intelligence-network presentation types
 * ------------------------------------------------------------------
 *
 * These are intentionally separate from the ingestion domain.
 * The ingestion layer represents what the system actually fetches.
 * This layer represents what an executive needs to understand about
 * source health, provenance and evidence lineage.
 */

export type RadarSourceHealthStatus =
  | "HEALTHY"
  | "DEGRADED"
  | "FAILING"
  | "UNKNOWN";

export type RadarEpistemicState =
  | "OBSERVED"
  | "CORROBORATED"
  | "INFERRED"
  | "MODELED";

export interface RadarSourceNode {
  id: string;
  name: string;
  kind: string;
  status: RadarSourceHealthStatus;
  trust: number;
  latencyMs: number;
  lastObservedAt: string;
  observationCount: number;
  mode:
    | "PUBLIC"
    | "DEMO"
    | "CONNECTED";
}

export interface RadarEvidenceLineage {
  signalId: string;

  epistemicState:
    RadarEpistemicState;

  claim: string;

  observation: string;

  sourceIds: string[];

  independentSourceCount:
    number;

  confidence: number;

  freshness: number;

  interpretation: string;

  implication: string;

  proposedAction: string;

  humanReviewRequired:
    boolean;
}

export interface RadarIntelligenceNetwork {
  mode:
    | "GOVERNED_DEMO"
    | "LIVE";

  cycleStatus:
    | "READY"
    | "PROCESSING"
    | "DEGRADED";

  lastCycleAt: string;

  sources:
    RadarSourceNode[];

  lineage:
    RadarEvidenceLineage[];
}

export interface MarketRadarSnapshot {
  generatedAt: string;
  systemStatus: "ONLINE";
  signals: MarketSignal[];
  trends: MarketTrend[];
  metrics: MarketRadarMetrics;
  attention: MarketSignal[];

  intelligence:
    RadarIntelligenceNetwork;

  disclaimer: string;
}