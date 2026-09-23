import {
  EvidenceType,
} from "@/domain/types";

export type ExperimentDecision =
  | "RUN"
  | "HOLD"
  | "NEEDS_EVIDENCE"
  | "KILL";

export type ExperimentMetricDirection =
  | "INCREASE"
  | "DECREASE";

export interface ExperimentMetric {
  id: string;

  name: string;

  direction:
    ExperimentMetricDirection;

  baseline: number;

  target: number;

  unit: string;
}

export interface ExperimentDependency {
  id: string;

  name: string;

  status:
    | "READY"
    | "PARTIAL"
    | "BLOCKED";

  critical: boolean;
}

export interface ExperimentEvidenceInput {
  id: string;

  type: EvidenceType;

  confidence: number;
}

export interface ExperimentCandidate {
  id: string;

  title: string;

  hypothesis: string;

  owner: string;

  category:
    | "ACQUISITION"
    | "ACTIVATION"
    | "CONVERSION"
    | "PRICING"
    | "EXPANSION"
    | "PRODUCT"
    | "RETENTION";

  estimatedAnnualImpact: number;

  estimatedCost: number;

  executionDays: number;

  learningDays: number;

  confidence: number;

  strategicRelevance: number;

  reversibility: number;

  metrics: ExperimentMetric[];

  dependencies: ExperimentDependency[];

  evidence: ExperimentEvidenceInput[];
}

export interface ExperimentScoreComponent {
  name: string;

  rawScore: number;

  weight: number;

  contribution: number;

  explanation: string;
}

export interface ExperimentDecisionGate {
  name: string;

  status:
    | "PASS"
    | "WARN"
    | "FAIL";

  explanation: string;
}

export interface ExperimentEvaluation {
  experimentId: string;

  score: number;

  decision: ExperimentDecision;

  expectedValue: number;

  expectedLearningDays: number;

  evidenceQuality: number;

  components:
    ExperimentScoreComponent[];

  gates: ExperimentDecisionGate[];

  reasons: string[];

  methodologyVersion: string;
}