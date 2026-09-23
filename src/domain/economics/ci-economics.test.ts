import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildSensitivityScenarios,
  calculateCIEconomics,
  CI_ECONOMICS_VERSION,
} from "@/domain/economics/ci-economics";

import {
  CIEconomicsInputs,
} from "@/domain/economics/types";

const baseInputs: CIEconomicsInputs =
  {
    developers: 180,

    buildsPerDeveloperPerDay: 4,

    averageBuildMinutes: 12,

    workingDaysPerYear: 230,

    engineerFullyLoadedCostPerYear:
      180_000,

    currentComputeCostPerMinute:
  0.008,

developerBlockingRate: 0.4,

speedupMultiplier: 5,

    adoptionRate: 0.8,

    aiCodingMultiplier: 1.35,

    warpBuildAnnualPrice: 120_000,

    warpBuildInfrastructureCostRate:
      0.28,

    productiveRecoveryRate: 0.35,
  };

describe(
  "CI economics engine",
  () => {
    it(
      "calculates annual CI demand",
      () => {
        const result =
          calculateCIEconomics(
            baseInputs,
          );

        expect(
          result.baseline
            .annualBuilds,
        ).toBe(223_560);

        expect(
          result.baseline
            .annualCIMinutes,
        ).toBe(2_682_720);
      },
    );

    it(
  "models only blocking CI time as developer wait exposure",
  () => {
    const result =
      calculateCIEconomics(
        baseInputs,
      );

    expect(
      result.baseline
        .annualBlockingCIMinutes,
    ).toBe(1_073_088);

    expect(
      result.baseline
        .annualDeveloperWaitHours,
    ).toBe(17_884.8);
  },
);

    it(
      "calculates the accelerated build duration",
      () => {
        const result =
          calculateCIEconomics(
            baseInputs,
          );

        expect(
          result.scenario
            .effectiveBuildMinutes,
        ).toBe(2.4);
      },
    );

    it(
      "calculates adopted CI minutes saved",
      () => {
        const result =
          calculateCIEconomics(
            baseInputs,
          );

        expect(
          result.scenario
            .annualMinutesSaved,
       ).toBe(686_776.32);
      },
    );

    it(
      "creates positive customer economics",
      () => {
        const result =
          calculateCIEconomics(
            baseInputs,
          );

        expect(
          result.commercial
            .customerAnnualValue,
        ).toBeGreaterThan(0);

        expect(
          result.commercial
            .customerNetAnnualValue,
        ).toBeGreaterThan(0);

        expect(
          result.commercial
            .roiMultiple,
        ).toBeGreaterThan(1);
      },
    );

    it(
      "calculates gross margin from modeled infrastructure cost",
      () => {
        const result =
          calculateCIEconomics(
            baseInputs,
          );

        expect(
          result.commercial
            .grossProfit,
        ).toBe(86_400);

        expect(
          result.commercial
            .grossMarginPercent,
        ).toBe(72);
      },
    );

    it(
      "returns the methodology version",
      () => {
        const result =
          calculateCIEconomics(
            baseInputs,
          );

        expect(
          result.methodologyVersion,
        ).toBe(
          CI_ECONOMICS_VERSION,
        );
      },
    );

    it(
      "rejects invalid adoption rates",
      () => {
        expect(() =>
          calculateCIEconomics({
            ...baseInputs,
            adoptionRate: 1.2,
          }),
        ).toThrow();
      },
    );

    it(
      "builds ordered sensitivity scenarios",
      () => {
        const scenarios =
          buildSensitivityScenarios(
            baseInputs,
          );

        expect(
          scenarios.map(
            (scenario) =>
              scenario.name,
          ),
        ).toEqual([
          "CONSERVATIVE",
          "BASE",
          "AGGRESSIVE",
        ]);

        expect(
          scenarios[0].result
            .commercial
            .customerAnnualValue,
        ).toBeLessThan(
          scenarios[1].result
            .commercial
            .customerAnnualValue,
        );

        expect(
          scenarios[1].result
            .commercial
            .customerAnnualValue,
        ).toBeLessThan(
          scenarios[2].result
            .commercial
            .customerAnnualValue,
        );
      },
    );
  },
);