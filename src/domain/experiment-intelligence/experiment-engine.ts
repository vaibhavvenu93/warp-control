import {
  ExperimentCandidate,
  ExperimentDecision,
  ExperimentDecisionGate,
  ExperimentEvaluation,
  ExperimentScoreComponent,
} from "@/domain/experiment-intelligence/types";

import {
  EvidenceType,
} from "@/domain/types";

export const EXPERIMENT_ENGINE_VERSION =
  "1.0.0";

const EVIDENCE_RELIABILITY:
  Record<EvidenceType, number> = {
    INTERNAL: 1,
    CONNECTED: 0.95,
    PUBLIC: 0.85,
    MODELED: 0.6,
    ASSUMED: 0.35,
  };

const WEIGHTS = {
  expectedImpact: 0.22,
  confidence: 0.14,
  strategicRelevance: 0.16,
  evidenceQuality: 0.14,
  speedToLearning: 0.12,
  reversibility: 0.1,
  capitalEfficiency: 0.12,
} as const;

function clamp(
  value: number,
  minimum = 0,
  maximum = 100,
): number {
  return Math.min(
    maximum,
    Math.max(
      minimum,
      value,
    ),
  );
}

function round(
  value: number,
  decimals = 2,
): number {
  const multiplier =
    10 ** decimals;

  return (
    Math.round(
      (value +
        Number.EPSILON) *
        multiplier,
    ) / multiplier
  );
}

function assertPercentage(
  name: string,
  value: number,
): void {
  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value > 100
  ) {
    throw new Error(
      `${name} must be between 0 and 100.`,
    );
  }
}

function validateCandidate(
  experiment:
    ExperimentCandidate,
): void {
  if (
    !experiment.id ||
    !experiment.title ||
    !experiment.hypothesis
  ) {
    throw new Error(
      "Experiment identity and hypothesis are required.",
    );
  }

  if (
    experiment.estimatedAnnualImpact <
      0 ||
    !Number.isFinite(
      experiment.estimatedAnnualImpact,
    )
  ) {
    throw new Error(
      "estimatedAnnualImpact must be zero or greater.",
    );
  }

  if (
    experiment.estimatedCost < 0 ||
    !Number.isFinite(
      experiment.estimatedCost,
    )
  ) {
    throw new Error(
      "estimatedCost must be zero or greater.",
    );
  }

  if (
    experiment.executionDays <= 0 ||
    experiment.learningDays <= 0
  ) {
    throw new Error(
      "Experiment duration must be greater than zero.",
    );
  }

  assertPercentage(
    "confidence",
    experiment.confidence,
  );

  assertPercentage(
    "strategicRelevance",
    experiment.strategicRelevance,
  );

  assertPercentage(
    "reversibility",
    experiment.reversibility,
  );

  for (
    const evidence
    of experiment.evidence
  ) {
    assertPercentage(
      `evidence confidence ${evidence.id}`,
      evidence.confidence,
    );
  }
}

function calculateEvidenceQuality(
  experiment:
    ExperimentCandidate,
): number {
  if (
    experiment.evidence.length ===
    0
  ) {
    return 0;
  }

  const weightedEvidence =
    experiment.evidence.map(
      (evidence) => {
        const reliability =
          EVIDENCE_RELIABILITY[
            evidence.type
          ];

        return (
          evidence.confidence *
          reliability
        );
      },
    );

  return round(
    weightedEvidence.reduce(
      (sum, value) =>
        sum + value,
      0,
    ) /
      weightedEvidence.length,
  );
}

function calculateImpactScore(
  experiment:
    ExperimentCandidate,
): number {
  /*
   * $250k+ annual impact receives
   * the maximum impact score.
   *
   * This is a portfolio-ranking
   * normalization constant, not a
   * claim about WarpBuild economics.
   */
  return clamp(
    (
      experiment.estimatedAnnualImpact /
      250_000
    ) * 100,
  );
}

function calculateLearningScore(
  learningDays: number,
): number {
  /*
   * Faster learning is more valuable.
   * 7 days or fewer scores 100.
   * 60+ days scores 0.
   */
  if (learningDays <= 7) {
    return 100;
  }

  if (learningDays >= 60) {
    return 0;
  }

  return clamp(
    100 -
      (
        (learningDays - 7) /
        (60 - 7)
      ) *
        100,
  );
}

function calculateCapitalEfficiency(
  experiment:
    ExperimentCandidate,
): number {
  if (
    experiment.estimatedCost === 0
  ) {
    return 100;
  }

  const impactCostRatio =
    experiment.estimatedAnnualImpact /
    experiment.estimatedCost;

  /*
   * 10x modeled annual impact /
   * experiment cost receives the
   * maximum score.
   */
  return clamp(
    (impactCostRatio / 10) *
      100,
  );
}

function component(
  name: string,
  rawScore: number,
  weight: number,
  explanation: string,
): ExperimentScoreComponent {
  return {
    name,

    rawScore:
      round(rawScore),

    weight:
      round(weight * 100),

    contribution:
      round(
        rawScore * weight,
      ),

    explanation,
  };
}

function buildDecisionGates(
  experiment:
    ExperimentCandidate,
  evidenceQuality: number,
): ExperimentDecisionGate[] {
  const gates:
    ExperimentDecisionGate[] = [];

  const blockedCritical =
    experiment.dependencies.filter(
      (dependency) =>
        dependency.critical &&
        dependency.status ===
          "BLOCKED",
    );

  gates.push({
    name: "Critical dependencies",

    status:
      blockedCritical.length > 0
        ? "FAIL"
        : "PASS",

    explanation:
      blockedCritical.length > 0
        ? `${blockedCritical.length} critical dependency is blocked.`
        : "No critical dependency is blocked.",
  });

  gates.push({
    name: "Evidence sufficiency",

    status:
      evidenceQuality >= 60
        ? "PASS"
        : evidenceQuality >= 40
          ? "WARN"
          : "FAIL",

    explanation:
      `Evidence quality is ${round(
        evidenceQuality,
      )}/100.`,
  });

  gates.push({
    name: "Measurement readiness",

    status:
      experiment.metrics.length > 0
        ? "PASS"
        : "FAIL",

    explanation:
      experiment.metrics.length > 0
        ? `${experiment.metrics.length} success metric(s) defined.`
        : "No success metric is defined.",
  });

  gates.push({
    name: "Economic exposure",

    status:
      experiment.estimatedCost <=
      50_000
        ? "PASS"
        : experiment.estimatedCost <=
            100_000
          ? "WARN"
          : "FAIL",

    explanation:
      `Modeled experiment cost is $${round(
        experiment.estimatedCost,
      ).toLocaleString(
        "en-US",
      )}.`,
  });

  return gates;
}

function determineDecision(
  score: number,
  gates:
    ExperimentDecisionGate[],
  evidenceQuality: number,
  experiment:
    ExperimentCandidate,
): ExperimentDecision {
  const hasCriticalFailure =
    gates.some(
      (gate) =>
        gate.name ===
          "Critical dependencies" &&
        gate.status === "FAIL",
    );

  const measurementFailure =
    gates.some(
      (gate) =>
        gate.name ===
          "Measurement readiness" &&
        gate.status === "FAIL",
    );

  if (
    hasCriticalFailure ||
    measurementFailure
  ) {
    return "HOLD";
  }

  if (
    evidenceQuality < 40 &&
    experiment.estimatedAnnualImpact >
      0
  ) {
    return "NEEDS_EVIDENCE";
  }

  if (
    score >= 70 &&
    evidenceQuality >= 50
  ) {
    return "RUN";
  }

  if (
    score < 35 &&
    experiment.estimatedAnnualImpact <
      experiment.estimatedCost
  ) {
    return "KILL";
  }

  return "HOLD";
}

export function evaluateExperiment(
  experiment:
    ExperimentCandidate,
): ExperimentEvaluation {
  validateCandidate(
    experiment,
  );

  const evidenceQuality =
    calculateEvidenceQuality(
      experiment,
    );

  const impactScore =
    calculateImpactScore(
      experiment,
    );

  const learningScore =
    calculateLearningScore(
      experiment.learningDays,
    );

  const capitalEfficiency =
    calculateCapitalEfficiency(
      experiment,
    );

  const components = [
    component(
      "Expected impact",
      impactScore,
      WEIGHTS.expectedImpact,
      "Normalized modeled annual impact.",
    ),

    component(
      "Confidence",
      experiment.confidence,
      WEIGHTS.confidence,
      "Confidence in the experiment hypothesis.",
    ),

    component(
      "Strategic relevance",
      experiment.strategicRelevance,
      WEIGHTS.strategicRelevance,
      "Alignment with current company priorities.",
    ),

    component(
      "Evidence quality",
      evidenceQuality,
      WEIGHTS.evidenceQuality,
      "Reliability-weighted provenance supporting the experiment.",
    ),

    component(
      "Speed to learning",
      learningScore,
      WEIGHTS.speedToLearning,
      "How quickly the experiment can reduce uncertainty.",
    ),

    component(
      "Reversibility",
      experiment.reversibility,
      WEIGHTS.reversibility,
      "Ease of reversing the experiment if the hypothesis fails.",
    ),

    component(
      "Capital efficiency",
      capitalEfficiency,
      WEIGHTS.capitalEfficiency,
      "Modeled impact relative to experiment cost.",
    ),
  ];

  const score =
    round(
      components.reduce(
        (
          total,
          item,
        ) =>
          total +
          item.contribution,
        0,
      ),
    );

  const gates =
    buildDecisionGates(
      experiment,
      evidenceQuality,
    );

  const decision =
    determineDecision(
      score,
      gates,
      evidenceQuality,
      experiment,
    );

  const expectedValue =
    round(
      experiment
        .estimatedAnnualImpact *
        (
          experiment.confidence /
          100
        ) -
        experiment.estimatedCost,
    );

  const reasons =
    components
      .slice()
      .sort(
        (a, b) =>
          b.contribution -
          a.contribution,
      )
      .slice(0, 3)
      .map(
        (item) =>
          `${item.name}: ${item.rawScore}/100`,
      );

  return {
    experimentId:
      experiment.id,

    score,

    decision,

    expectedValue,

    expectedLearningDays:
      experiment.learningDays,

    evidenceQuality,

    components,

    gates,

    reasons,

    methodologyVersion:
      EXPERIMENT_ENGINE_VERSION,
  };
}

export function rankExperiments(
  experiments:
    ExperimentCandidate[],
): ExperimentEvaluation[] {
  return experiments
    .map(
      evaluateExperiment,
    )
    .sort(
      (a, b) => {
        if (
          b.score !== a.score
        ) {
          return (
            b.score -
            a.score
          );
        }

        return (
          b.expectedValue -
          a.expectedValue
        );
      },
    );
}