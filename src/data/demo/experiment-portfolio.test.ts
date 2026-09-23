import {
  describe,
  expect,
  it,
} from "vitest";

import {
  demoExperimentEvaluations,
  demoExperimentPortfolio,
  demoExperimentSummary,
} from "@/data/demo/experiment-portfolio";

describe(
  "demo experiment portfolio",
  () => {
    it(
      "contains a multi-experiment portfolio",
      () => {
        expect(
          demoExperimentPortfolio,
        ).toHaveLength(7);

        expect(
          demoExperimentEvaluations,
        ).toHaveLength(7);
      },
    );

    it(
      "ranks the portfolio by experiment score",
      () => {
        for (
          let index = 1;
          index <
          demoExperimentEvaluations.length;
          index += 1
        ) {
          expect(
            demoExperimentEvaluations[
              index - 1
            ].score,
          ).toBeGreaterThanOrEqual(
            demoExperimentEvaluations[
              index
            ].score,
          );
        }
      },
    );

    it(
      "produces at least one run decision",
      () => {
        expect(
          demoExperimentSummary.run,
        ).toBeGreaterThan(0);
      },
    );

    it(
      "holds blocked enterprise pricing",
      () => {
        const pricing =
          demoExperimentEvaluations.find(
            (item) =>
              item.experimentId ===
              "exp-enterprise-pricing",
          );

        expect(pricing).toBeDefined();

        expect(
          pricing?.decision,
        ).toBe("HOLD");
      },
    );

    it(
      "kills the weak paid-search experiment",
      () => {
        const paid =
          demoExperimentEvaluations.find(
            (item) =>
              item.experimentId ===
              "exp-generic-paid-search",
          );

        expect(paid).toBeDefined();

        expect(
          paid?.decision,
        ).toBe("KILL");
      },
    );

    it(
      "requires stronger evidence for the security experiment",
      () => {
        const security =
          demoExperimentEvaluations.find(
            (item) =>
              item.experimentId ===
              "exp-security-enterprise",
          );

        expect(security).toBeDefined();

        expect(
          security?.decision,
        ).toBe(
          "NEEDS_EVIDENCE",
        );
      },
    );

    it(
      "calculates portfolio expected value",
      () => {
        expect(
          demoExperimentSummary
            .modeledExpectedValue,
        ).toBeGreaterThan(0);
      },
    );

    it(
      "preserves all four possible decision states across the portfolio",
      () => {
        const decisions =
          new Set(
            demoExperimentEvaluations.map(
              (item) =>
                item.decision,
            ),
          );

        expect(
          decisions.has("RUN"),
        ).toBe(true);

        expect(
          decisions.has("HOLD"),
        ).toBe(true);

        expect(
          decisions.has(
            "NEEDS_EVIDENCE",
          ),
        ).toBe(true);

        expect(
          decisions.has("KILL"),
        ).toBe(true);
      },
    );
  },
);