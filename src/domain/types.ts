export type EvidenceType =
  | "PUBLIC"
  | "CONNECTED"
  | "INTERNAL"
  | "MODELED"
  | "ASSUMED";

export type ConfidenceLevel = "LOW" | "MEDIUM" | "HIGH";

export interface EvidenceRef {
  id: string;
  type: EvidenceType;
  source: string;
  sourceUrl?: string;
  capturedAt: string;
  claim: string;
  confidence: number;
}

export type AccountStage =
  | "DISCOVERED"
  | "RESEARCHING"
  | "QUALIFIED"
  | "ENGAGED"
  | "OPPORTUNITY"
  | "CUSTOMER"
  | "EXPANSION"
  | "DISQUALIFIED";

export interface Account {
  id: string;
  name: string;
  domain: string;

  stage: AccountStage;

  profile: {
    industry?: string;
    employeeCount?: number;
    developerCount?: number;
    headquarters?: string;
    fundingStage?: string;
    estimatedRevenue?: number;
  };

  engineering: {
    repositories?: number;
    estimatedDevelopers?: number;
    ciProvider?: string;
    cloudProvider?: string;
    languages: string[];
    frameworks: string[];
    aiCodingSignals: string[];
  };

  commercial: {
    estimatedACV?: number;
    expansionPotential?: number;
    currentSpendEstimate?: number;
  };

  signalIds: string[];
  evidenceIds: string[];

  createdAt: string;
  updatedAt: string;
}

export type SignalCategory =
  | "ENGINEERING"
  | "CI_PAIN"
  | "AI_ADOPTION"
  | "GROWTH"
  | "HIRING"
  | "INFRASTRUCTURE"
  | "SECURITY"
  | "BUYING_INTENT"
  | "COMPETITOR"
  | "USAGE";

export type SignalDirection = "POSITIVE" | "NEGATIVE" | "NEUTRAL";

export interface Signal {
  id: string;
  accountId: string;

  category: SignalCategory;
  direction: SignalDirection;

  title: string;
  description: string;

  strength: number;
  confidence: number;

  evidenceIds: string[];

  detectedAt: string;
  expiresAt?: string;
}

export interface ScoreComponent {
  key: string;
  label: string;
  rawValue: number;
  normalizedValue: number;
  weight: number;
  contribution: number;
  evidenceIds: string[];
}

export interface WarpScore {
  accountId: string;
  score: number;

  classification:
    | "LOW"
    | "WATCH"
    | "QUALIFIED"
    | "HIGH_PRIORITY"
    | "STRATEGIC";

  components: ScoreComponent[];

  confidence: number;
  calculatedAt: string;
  version: string;
}

export type GTMMotion =
  | "NURTURE"
  | "FOUNDER_OUTBOUND"
  | "TECHNICAL_OUTBOUND"
  | "PLG_INTERVENTION"
  | "ENTERPRISE_SALES"
  | "EXPANSION"
  | "PARTNERSHIP";

export interface Opportunity {
  id: string;
  accountId: string;

  hypothesis: string;
  problem: string;
  recommendedMotion: GTMMotion;

  estimatedACV: number;
  probability: number;
  expectedValue: number;

  score: number;
  confidence: number;

  evidenceIds: string[];
  createdAt: string;
}

export type ExperimentStatus =
  | "DRAFT"
  | "READY"
  | "RUNNING"
  | "PAUSED"
  | "WON"
  | "LOST"
  | "INCONCLUSIVE";

export interface Experiment {
  id: string;
  name: string;

  hypothesis: string;

  accountIds: string[];

  status: ExperimentStatus;

  successMetric: string;
  successThreshold: number;
  failureThreshold?: number;

  expectedImpact: number;
  confidence: number;

  owner: string;

  startedAt?: string;
  endsAt?: string;

  evidenceIds: string[];
}

export type AgentName =
  | "MARKET_RADAR"
  | "ACCOUNT_INTELLIGENCE"
  | "REVENUE_INTELLIGENCE"
  | "CI_ECONOMICS"
  | "CUSTOMER_VOICE"
  | "EXPERIMENT_ANALYST"
  | "EXECUTIVE_BRIEF";

export type AgentRunStatus =
  | "QUEUED"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "REQUIRES_HUMAN";

export interface AgentRun {
  id: string;

  agent: AgentName;
  status: AgentRunStatus;

  trigger: string;

  input: Record<string, unknown>;
  output?: Record<string, unknown>;

  evidenceIds: string[];

  confidence?: number;

  toolsCalled: string[];

  startedAt: string;
  completedAt?: string;

  latencyMs?: number;
  estimatedCostUsd?: number;

  error?: string;
}

export type DomainEventType =
  | "ACCOUNT_DISCOVERED"
  | "SIGNAL_DETECTED"
  | "WARP_SCORE_CHANGED"
  | "ACCOUNT_QUALIFIED"
  | "BUYER_IDENTIFIED"
  | "OPPORTUNITY_CREATED"
  | "EXPERIMENT_STARTED"
  | "EXPERIMENT_COMPLETED"
  | "PIPELINE_STAGE_CHANGED"
  | "CI_USAGE_SPIKE"
  | "DECISION_REQUIRED"
  | "AGENT_RUN_COMPLETED"
  | "AGENT_RUN_FAILED";

export interface DomainEvent<T = Record<string, unknown>> {
  id: string;
  type: DomainEventType;

  aggregateType:
    | "ACCOUNT"
    | "SIGNAL"
    | "OPPORTUNITY"
    | "EXPERIMENT"
    | "AGENT"
    | "DECISION";

  aggregateId: string;

  payload: T;

  occurredAt: string;

  correlationId: string;
  causationId?: string;

  source: "SYSTEM" | "AGENT" | "HUMAN" | "INTEGRATION";
}