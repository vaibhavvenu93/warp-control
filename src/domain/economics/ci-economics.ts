import {
  CIEconomicsInputs,
  CIEconomicsResult,
  SensitivityScenario,
} from "@/domain/economics/types";

export const CI_ECONOMICS_VERSION =
  "1.1.0";

function assertPositive(
  name: string,
  value: number,
): void {
  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    throw new Error(
      `${name} must be greater than zero.`,
    );
  }
}

function assertRate(
  name: string,
  value: number,
): void {
  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1
  ) {
    throw new Error(
      `${name} must be between 0 and 1.`,
    );
  }
}

function round(
  value: number,
  decimals = 2,
): number {
  const multiplier =
    10 ** decimals;

  return (
    Math.round(
      (value + Number.EPSILON) *
        multiplier,
    ) / multiplier
  );
}

export function validateCIEconomicsInputs(
  inputs: CIEconomicsInputs,
): void {
  assertPositive(
    "developers",
    inputs.developers,
  );

  assertPositive(
    "buildsPerDeveloperPerDay",
    inputs.buildsPerDeveloperPerDay,
  );

  assertPositive(
    "averageBuildMinutes",
    inputs.averageBuildMinutes,
  );

  assertPositive(
    "workingDaysPerYear",
    inputs.workingDaysPerYear,
  );

  assertPositive(
    "engineerFullyLoadedCostPerYear",
    inputs.engineerFullyLoadedCostPerYear,
  );

  assertPositive(
    "currentComputeCostPerMinute",
    inputs.currentComputeCostPerMinute,
  );

  assertRate(
    "developerBlockingRate",
    inputs.developerBlockingRate,
  );

  assertPositive(
    "speedupMultiplier",
    inputs.speedupMultiplier,
  );

  if (
    inputs.speedupMultiplier < 1
  ) {
    throw new Error(
      "speedupMultiplier must be at least 1.",
    );
  }

  assertRate(
    "adoptionRate",
    inputs.adoptionRate,
  );

  assertPositive(
    "aiCodingMultiplier",
    inputs.aiCodingMultiplier,
  );

  assertPositive(
    "warpBuildAnnualPrice",
    inputs.warpBuildAnnualPrice,
  );

  assertRate(
    "warpBuildInfrastructureCostRate",
    inputs.warpBuildInfrastructureCostRate,
  );

  assertRate(
    "productiveRecoveryRate",
    inputs.productiveRecoveryRate,
  );
}

export function calculateCIEconomics(
  inputs: CIEconomicsInputs,
): CIEconomicsResult {
  validateCIEconomicsInputs(
    inputs,
  );

  const annualBuilds =
    inputs.developers *
    inputs.buildsPerDeveloperPerDay *
    inputs.workingDaysPerYear *
    inputs.aiCodingMultiplier;

  const annualCIMinutes =
    annualBuilds *
    inputs.averageBuildMinutes;

  const annualComputeCost =
    annualCIMinutes *
    inputs.currentComputeCostPerMinute;

  /*
   * Not every CI minute represents a
   * developer actively waiting.
   *
   * Some CI execution is asynchronous,
   * background work, or occurs while an
   * engineer has moved to another task.
   */
  const annualBlockingCIMinutes =
    annualCIMinutes *
    inputs.developerBlockingRate;

  const annualDeveloperWaitHours =
    annualBlockingCIMinutes / 60;

  const engineerHourlyCost =
    inputs.engineerFullyLoadedCostPerYear /
    (inputs.workingDaysPerYear * 8);

  const annualDeveloperWaitCost =
    annualDeveloperWaitHours *
    engineerHourlyCost;

  const effectiveBuildMinutes =
    inputs.averageBuildMinutes /
    inputs.speedupMultiplier;

  const minutesSavedPerBuild =
    inputs.averageBuildMinutes -
    effectiveBuildMinutes;

  /*
   * Economic time savings apply only to
   * adopted workloads that are actually
   * blocking developer feedback.
   */
  const annualMinutesSaved =
    annualBuilds *
    minutesSavedPerBuild *
    inputs.adoptionRate *
    inputs.developerBlockingRate;

  const annualHoursSaved =
    annualMinutesSaved / 60;

  /*
   * Even blocking time saved does not
   * convert 1:1 into productive output.
   */
  const recoverableEngineeringHours =
    annualHoursSaved *
    inputs.productiveRecoveryRate;

  const recoveredProductivityValue =
    recoverableEngineeringHours *
    engineerHourlyCost;

  const warpBuildComputeMinutes =
    annualBuilds *
    effectiveBuildMinutes *
    inputs.adoptionRate;

  /*
   * This remains a modeled infrastructure
   * cost assumption. It is not WarpBuild
   * internal cost data.
   */
  const estimatedWarpBuildInfrastructureCost =
    inputs.warpBuildAnnualPrice *
    inputs.warpBuildInfrastructureCostRate;

  const customerAnnualValue =
    recoveredProductivityValue;

  const customerNetAnnualValue =
    customerAnnualValue -
    inputs.warpBuildAnnualPrice;

  const roiMultiple =
    customerAnnualValue /
    inputs.warpBuildAnnualPrice;

  const roiPercent =
    (
      customerNetAnnualValue /
      inputs.warpBuildAnnualPrice
    ) * 100;

  const paybackMonths =
    customerAnnualValue > 0
      ? (
          inputs.warpBuildAnnualPrice /
          customerAnnualValue
        ) * 12
      : Number.POSITIVE_INFINITY;

  const valueCaptureRate =
    customerAnnualValue > 0
      ? inputs.warpBuildAnnualPrice /
        customerAnnualValue
      : 0;

  const grossProfit =
    inputs.warpBuildAnnualPrice -
    estimatedWarpBuildInfrastructureCost;

  const grossMarginPercent =
    (
      grossProfit /
      inputs.warpBuildAnnualPrice
    ) * 100;

  const breakEvenAnnualPrice =
    customerAnnualValue;

  return {
    baseline: {
      annualBuilds:
        round(annualBuilds),

      annualCIMinutes:
        round(annualCIMinutes),

      annualComputeCost:
        round(annualComputeCost),

      annualBlockingCIMinutes:
        round(
          annualBlockingCIMinutes,
        ),

      annualDeveloperWaitHours:
        round(
          annualDeveloperWaitHours,
        ),

      annualDeveloperWaitCost:
        round(
          annualDeveloperWaitCost,
        ),
    },

    scenario: {
      effectiveBuildMinutes:
        round(
          effectiveBuildMinutes,
        ),

      annualMinutesSaved:
        round(
          annualMinutesSaved,
        ),

      annualHoursSaved:
        round(
          annualHoursSaved,
        ),

      recoverableEngineeringHours:
        round(
          recoverableEngineeringHours,
        ),

      recoveredProductivityValue:
        round(
          recoveredProductivityValue,
        ),

      warpBuildComputeMinutes:
        round(
          warpBuildComputeMinutes,
        ),

      estimatedWarpBuildInfrastructureCost:
        round(
          estimatedWarpBuildInfrastructureCost,
        ),
    },

    commercial: {
      customerAnnualValue:
        round(
          customerAnnualValue,
        ),

      warpBuildAnnualPrice:
        round(
          inputs.warpBuildAnnualPrice,
        ),

      customerNetAnnualValue:
        round(
          customerNetAnnualValue,
        ),

      roiMultiple:
        round(roiMultiple),

      roiPercent:
        round(roiPercent),

      paybackMonths:
        round(paybackMonths),

      valueCaptureRate:
        round(
          valueCaptureRate * 100,
        ),

      grossProfit:
        round(grossProfit),

      grossMarginPercent:
        round(
          grossMarginPercent,
        ),

      breakEvenAnnualPrice:
        round(
          breakEvenAnnualPrice,
        ),
    },

    assumptions: {
      ...inputs,
    },

    methodologyVersion:
      CI_ECONOMICS_VERSION,
  };
}

export function buildSensitivityScenarios(
  baseInputs: CIEconomicsInputs,
): SensitivityScenario[] {
  const conservative: CIEconomicsInputs =
    {
      ...baseInputs,

      speedupMultiplier:
        Math.max(
          1,
          baseInputs.speedupMultiplier *
            0.65,
        ),

      adoptionRate:
        Math.max(
          0,
          baseInputs.adoptionRate *
            0.75,
        ),

      developerBlockingRate:
        Math.max(
          0,
          baseInputs.developerBlockingRate *
            0.75,
        ),

      productiveRecoveryRate:
        Math.max(
          0,
          baseInputs.productiveRecoveryRate *
            0.7,
        ),

      aiCodingMultiplier:
        Math.max(
          1,
          baseInputs.aiCodingMultiplier *
            0.9,
        ),
    };

  const aggressive: CIEconomicsInputs =
    {
      ...baseInputs,

      speedupMultiplier:
        baseInputs.speedupMultiplier *
        1.25,

      adoptionRate:
        Math.min(
          1,
          baseInputs.adoptionRate *
            1.1,
        ),

      developerBlockingRate:
        Math.min(
          1,
          baseInputs.developerBlockingRate *
            1.15,
        ),

      productiveRecoveryRate:
        Math.min(
          1,
          baseInputs.productiveRecoveryRate *
            1.15,
        ),

      aiCodingMultiplier:
        baseInputs.aiCodingMultiplier *
        1.15,
    };

  return [
    {
      name: "CONSERVATIVE",
      inputs: conservative,
      result:
        calculateCIEconomics(
          conservative,
        ),
    },

    {
      name: "BASE",
      inputs: {
        ...baseInputs,
      },
      result:
        calculateCIEconomics(
          baseInputs,
        ),
    },

    {
      name: "AGGRESSIVE",
      inputs: aggressive,
      result:
        calculateCIEconomics(
          aggressive,
        ),
    },
  ];
}