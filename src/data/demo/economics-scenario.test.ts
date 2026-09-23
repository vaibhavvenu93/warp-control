import {
  describe,
  expect,
  it,
} from "vitest";

import {
  demoEconomicAssumptions,
  demoEconomicInputs,
  demoEconomicResult,
  demoEconomicSensitivity,
} from "@/data/demo/economics-scenario";

describe(
  "deterministic economics scenario",
  () => {
    it(
      "inherits developer count from the account model",
      () => {
        expect(
          demoEconomicInputs
            .developers,
        ).toBe(180);
      },
    );

    it(
      "produces positive economic value",
      () => {
        expect(
          demoEconomicResult
            .commercial
            .customerAnnualValue,
        ).toBeGreaterThan(0);

        expect(
          demoEconomicResult
            .commercial
            .customerNetAnnualValue,
        ).toBeGreaterThan(0);
      },
    );

    it(
      "tracks provenance for every economic input",
      () => {
        expect(
          demoEconomicAssumptions,
        ).toHaveLength(
          Object.keys(
            demoEconomicInputs,
          ).length,
        );

        for (
          const key of Object.keys(
            demoEconomicInputs,
          )
        ) {
          expect(
            demoEconomicAssumptions.some(
              (assumption) =>
                assumption.key === key,
            ),
          ).toBe(true);
        }
      },
    );

    it(
      "does not present the modeled speedup as measured",
      () => {
        const speedup =
          demoEconomicAssumptions.find(
            (assumption) =>
              assumption.key ===
              "speedupMultiplier",
          );

        expect(
          speedup?.provenance,
        ).toBe("ASSUMED");
      },
    );

    it(
      "does not present modeled ACV as verified pricing",
      () => {
        const pricing =
          demoEconomicAssumptions.find(
            (assumption) =>
              assumption.key ===
              "warpBuildAnnualPrice",
          );

        expect(
          pricing?.provenance,
        ).toBe("MODELED");
      },
    );

    it(
      "generates three sensitivity cases",
      () => {
        expect(
          demoEconomicSensitivity.map(
            (scenario) =>
              scenario.name,
          ),
        ).toEqual([
          "CONSERVATIVE",
          "BASE",
          "AGGRESSIVE",
        ]);
      },
    );
  },
);