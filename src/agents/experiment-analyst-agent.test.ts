import {
  describe,
  expect,
  it,
} from "vitest";

import {
  experimentAnalystAgent,
} from "@/agents/experiment-analyst-agent";

import {
  demoExperimentEvaluations,
  demoExperimentPortfolio,
} from "@/data/demo/experiment-portfolio";

import {
  optimizePortfolio,
} from "@/domain/experiment-intelligence/portfolio-optimizer";

function buildInput() {
  const portfolio =
    optimizePortfolio(
      demoExperimentPortfolio,
      {
        budget: 50_000,

        maxConcurrentExperiments:
          3,

        owners: {
          Growth: 2,
          Revenue: 1,
          CEO: 1,
          Operations: 1,
        },
      },
    );

  return {
    experiments:
      demoExperimentPortfolio,

    evaluations:
      demoExperimentEvaluations,

    portfolio,
  };
}

describe(
  "experiment analyst agent",
  () => {
    it(
      "returns a portfolio recommendation",
      async () => {
        const result =
          await experimentAnalystAgent.execute(
            {
              input:
                buildInput(),

              context: {
                correlationId:
                  "corr-experiment-test",
                evidence: [],
                metadata: {},
              },
            },
          );

        expect(
          result.output
            .portfolioRecommendation,
        ).toContain("Run");

        expect(
          result.output
            .selectedCount,
        ).toBeGreaterThan(0);
      },
    );

    it(
      "requires human review before experiment execution",
      async () => {
        const result =
          await experimentAnalystAgent.execute(
            {
              input:
                buildInput(),

              context: {
                correlationId:
                  "corr-human-review",
                evidence: [],
                metadata: {},
              },
            },
          );

        expect(
          result.requiresHumanReview,
        ).toBe(true);
      },
    );

    it(
      "requests stronger evidence for uncertain experiments",
      async () => {
        const result =
          await experimentAnalystAgent.execute(
            {
              input:
                buildInput(),

              context: {
                correlationId:
                  "corr-evidence",
                evidence: [],
                metadata: {},
              },
            },
          );

        expect(
          result.output
            .evidenceRequests.length,
        ).toBeGreaterThan(0);

        expect(
          result.output
            .evidenceRequests.join(
              " ",
            ),
        ).toContain(
          "Current evidence quality",
        );
      },
    );

    it(
      "identifies held experiments",
      async () => {
        const result =
          await experimentAnalystAgent.execute(
            {
              input:
                buildInput(),

              context: {
                correlationId:
                  "corr-hold",
                evidence: [],
                metadata: {},
              },
            },
          );

        expect(
          result.output
            .blockedExperiments,
        ).toContain(
          "exp-enterprise-pricing",
        );
      },
    );

    it(
      "identifies killed experiments",
      async () => {
        const result =
          await experimentAnalystAgent.execute(
            {
              input:
                buildInput(),

              context: {
                correlationId:
                  "corr-kill",
                evidence: [],
                metadata: {},
              },
            },
          );

        expect(
          result.output
            .killedExperiments,
        ).toContain(
          "exp-generic-paid-search",
        );
      },
    );

    it(
      "exposes agent tools and reasoning summary",
      async () => {
        const result =
          await experimentAnalystAgent.execute(
            {
              input:
                buildInput(),

              context: {
                correlationId:
                  "corr-observability",
                evidence: [],
                metadata: {},
              },
            },
          );

        expect(
          result.toolsCalled,
        ).toEqual([
          "experiment_decision_engine",
          "portfolio_optimizer",
          "evidence_graph",
        ]);

        expect(
          result.reasoningSummary.length,
        ).toBeGreaterThan(20);
      },
    );

    it(
      "preserves portfolio economics",
      async () => {
        const input =
          buildInput();

        const result =
          await experimentAnalystAgent.execute(
            {
              input,

              context: {
                correlationId:
                  "corr-economics",
                evidence: [],
                metadata: {},
              },
            },
          );

        expect(
          result.output
            .allocatedBudget,
        ).toBe(
          input.portfolio
            .allocatedBudget,
        );

        expect(
          result.output
            .modeledExpectedValue,
        ).toBe(
          input.portfolio
            .modeledExpectedValue,
        );

        expect(
          result.output
            .expectedPortfolioROI,
        ).toBe(
          input.portfolio
            .expectedPortfolioROI,
        );
      },
    );

    it(
      "returns a priority experiment",
      async () => {
        const result =
          await experimentAnalystAgent.execute(
            {
              input:
                buildInput(),

              context: {
                correlationId:
                  "corr-priority",
                evidence: [],
                metadata: {},
              },
            },
          );

        expect(
          result.output
            .priorityExperimentId,
        ).not.toBeNull();

        expect(
          result.output
            .nextAction.length,
        ).toBeGreaterThan(20);
      },
    );
  },
);