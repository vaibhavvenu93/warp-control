import {
  describe,
  expect,
  it,
} from "vitest";

import {
  demoExperimentPortfolio,
} from "@/data/demo/experiment-portfolio";

import {
  optimizePortfolio,
  PORTFOLIO_OPTIMIZER_VERSION,
} from "@/domain/experiment-intelligence/portfolio-optimizer";

describe(
  "experiment portfolio optimizer",
  () => {
    it(
      "selects runnable experiments within budget and capacity",
      () => {
        const result =
          optimizePortfolio(
            demoExperimentPortfolio,
            {
              budget: 50_000,

              maxConcurrentExperiments:
                3,
            },
          );

        expect(
          result.selectedCount,
        ).toBeGreaterThan(0);

        expect(
          result.selectedCount,
        ).toBeLessThanOrEqual(
          3,
        );

        expect(
          result.allocatedBudget,
        ).toBeLessThanOrEqual(
          50_000,
        );

        expect(
          result.selected.every(
            (item) =>
              item.decision ===
              "RUN",
          ),
        ).toBe(true);
      },
    );

    it(
      "never selects experiments rejected by the decision engine",
      () => {
        const result =
          optimizePortfolio(
            demoExperimentPortfolio,
            {
              budget:
                1_000_000,

              maxConcurrentExperiments:
                20,
            },
          );

        const selectedIds =
          new Set(
            result.selected.map(
              (item) =>
                item.experimentId,
            ),
          );

        expect(
          selectedIds.has(
            "exp-enterprise-pricing",
          ),
        ).toBe(false);

        expect(
          selectedIds.has(
            "exp-generic-paid-search",
          ),
        ).toBe(false);

        expect(
          selectedIds.has(
            "exp-security-enterprise",
          ),
        ).toBe(false);
      },
    );

    it(
      "respects a zero budget",
      () => {
        const result =
          optimizePortfolio(
            demoExperimentPortfolio,
            {
              budget: 0,

              maxConcurrentExperiments:
                10,
            },
          );

        expect(
          result.selected,
        ).toHaveLength(0);

        expect(
          result.allocatedBudget,
        ).toBe(0);
      },
    );

    it(
      "respects owner capacity",
      () => {
        const result =
          optimizePortfolio(
            demoExperimentPortfolio,
            {
              budget:
                1_000_000,

              maxConcurrentExperiments:
                10,

              owners: {
                Growth: 1,
              },
            },
          );

        const growthSelected =
          result.selected.filter(
            (item) =>
              item.owner ===
              "Growth",
          );

        expect(
          growthSelected.length,
        ).toBeLessThanOrEqual(
          1,
        );
      },
    );

    it(
      "respects experiment duration constraints",
      () => {
        const result =
          optimizePortfolio(
            demoExperimentPortfolio,
            {
              budget:
                1_000_000,

              maxConcurrentExperiments:
                10,

              maxExecutionDays:
                14,
            },
          );

        const longExperimentSelected =
          result.selected.some(
            (item) => {
              const source =
                demoExperimentPortfolio.find(
                  (experiment) =>
                    experiment.id ===
                    item.experimentId,
                );

              return (
                source !==
                  undefined &&
                source.executionDays >
                  14
              );
            },
          );

        expect(
          longExperimentSelected,
        ).toBe(false);
      },
    );

    it(
      "calculates remaining budget correctly",
      () => {
        const result =
          optimizePortfolio(
            demoExperimentPortfolio,
            {
              budget: 50_000,

              maxConcurrentExperiments:
                3,
            },
          );

        expect(
          result.remainingBudget,
        ).toBe(
          result.totalBudget -
            result.allocatedBudget,
        );
      },
    );

    it(
      "calculates portfolio expected value and ROI",
      () => {
        const result =
          optimizePortfolio(
            demoExperimentPortfolio,
            {
              budget: 50_000,

              maxConcurrentExperiments:
                3,
            },
          );

        expect(
          result.modeledExpectedValue,
        ).toBeGreaterThan(0);

        expect(
          result.expectedPortfolioROI,
        ).toBeGreaterThan(0);
      },
    );

    it(
      "records why experiments were deferred",
      () => {
        const result =
          optimizePortfolio(
            demoExperimentPortfolio,
            {
              budget: 20_000,

              maxConcurrentExperiments:
                1,
            },
          );

        expect(
          result.deferred.length,
        ).toBeGreaterThan(0);

        expect(
          result.deferred.every(
            (item) =>
              Boolean(
                item.reason,
              ),
          ),
        ).toBe(true);
      },
    );

    it(
      "exposes optimizer methodology version",
      () => {
        const result =
          optimizePortfolio(
            demoExperimentPortfolio,
            {
              budget: 50_000,

              maxConcurrentExperiments:
                3,
            },
          );

        expect(
          result.methodologyVersion,
        ).toBe(
          PORTFOLIO_OPTIMIZER_VERSION,
        );
      },
    );

    it(
      "is deterministic for identical inputs",
      () => {
        const constraints = {
          budget: 50_000,

          maxConcurrentExperiments:
            3,
        };

        const first =
          optimizePortfolio(
            demoExperimentPortfolio,
            constraints,
          );

        const second =
          optimizePortfolio(
            demoExperimentPortfolio,
            constraints,
          );

        expect(
          second,
        ).toEqual(first);
      },
    );
  },
);