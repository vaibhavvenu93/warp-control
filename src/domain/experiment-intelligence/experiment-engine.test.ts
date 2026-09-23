import {
  describe,
  expect,
  it,
} from "vitest";

import {
  evaluateExperiment,
  EXPERIMENT_ENGINE_VERSION,
  rankExperiments,
} from "@/domain/experiment-intelligence/experiment-engine";

import {
  ExperimentCandidate,
} from "@/domain/experiment-intelligence/types";

const strongExperiment:
  ExperimentCandidate = {
    id: "exp-ci-roi-calculator",

    title:
      "CI ROI calculator",

    hypothesis:
      "Showing engineering teams the economic cost of CI latency will increase qualified enterprise conversations.",

    owner: "Growth",

    category: "CONVERSION",

    estimatedAnnualImpact:
      300_000,

    estimatedCost: 15_000,

    executionDays: 10,

    learningDays: 14,

    confidence: 78,

    strategicRelevance: 95,

    reversibility: 90,

    metrics: [
      {
        id: "metric-qualified-demo",

        name:
          "Qualified demo conversion",

        direction:
          "INCREASE",

        baseline: 0.08,

        target: 0.12,

        unit: "rate",
      },
    ],

    dependencies: [
      {
        id: "dep-calculator",

        name:
          "Economics calculator",

        status: "READY",

        critical: true,
      },
    ],

    evidence: [
      {
        id: "ev-economics",

        type: "MODELED",

        confidence: 80,
      },

      {
        id: "ev-customer",

        type: "CONNECTED",

        confidence: 85,
      },
    ],
  };

describe(
  "experiment decision engine",
  () => {
    it(
      "evaluates a strong experiment",
      () => {
        const result =
          evaluateExperiment(
            strongExperiment,
          );

        expect(
          result.score,
        ).toBeGreaterThan(70);

        expect(
          result.decision,
        ).toBe("RUN");
      },
    );

    it(
      "calculates positive expected value",
      () => {
        const result =
          evaluateExperiment(
            strongExperiment,
          );

        expect(
          result.expectedValue,
        ).toBe(219_000);
      },
    );

    it(
      "weights evidence provenance",
      () => {
        const result =
          evaluateExperiment(
            strongExperiment,
          );

        expect(
          result.evidenceQuality,
        ).toBeGreaterThan(60);

        expect(
          result.evidenceQuality,
        ).toBeLessThan(90);
      },
    );

    it(
      "holds an experiment with a blocked critical dependency",
      () => {
        const result =
          evaluateExperiment({
            ...strongExperiment,

            dependencies: [
              {
                id: "dep-blocked",

                name:
                  "Billing instrumentation",

                status:
                  "BLOCKED",

                critical: true,
              },
            ],
          });

        expect(
          result.decision,
        ).toBe("HOLD");
      },
    );

    it(
      "requests evidence when provenance is too weak",
      () => {
        const result =
          evaluateExperiment({
            ...strongExperiment,

            evidence: [
              {
                id: "ev-assumed",

                type: "ASSUMED",

                confidence: 50,
              },
            ],
          });

        expect(
          result.decision,
        ).toBe(
          "NEEDS_EVIDENCE",
        );
      },
    );

    it(
      "holds experiments without measurable success criteria",
      () => {
        const result =
          evaluateExperiment({
            ...strongExperiment,

            metrics: [],
          });

        expect(
          result.decision,
        ).toBe("HOLD");
      },
    );

    it(
      "kills weak uneconomic experiments",
      () => {
        const result =
          evaluateExperiment({
            ...strongExperiment,

            estimatedAnnualImpact:
              5_000,

            estimatedCost:
              40_000,

            confidence: 20,

            strategicRelevance:
              15,

            reversibility: 20,

            learningDays: 55,

            evidence: [
              {
                id: "ev-public",

                type: "PUBLIC",

                confidence: 70,
              },
            ],
          });

        expect(
          result.decision,
        ).toBe("KILL");
      },
    );

    it(
      "ranks stronger experiments first",
      () => {
        const weaker:
          ExperimentCandidate = {
            ...strongExperiment,

            id: "exp-weaker",

            estimatedAnnualImpact:
              40_000,

            strategicRelevance:
              45,

            confidence: 50,
          };

        const ranked =
          rankExperiments([
            weaker,
            strongExperiment,
          ]);

        expect(
          ranked[0]
            .experimentId,
        ).toBe(
          strongExperiment.id,
        );
      },
    );

    it(
      "exposes methodology version",
      () => {
        const result =
          evaluateExperiment(
            strongExperiment,
          );

        expect(
          result.methodologyVersion,
        ).toBe(
          EXPERIMENT_ENGINE_VERSION,
        );
      },
    );
  },
);