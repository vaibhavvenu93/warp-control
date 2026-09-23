import {
  CIEconomicsInputs,
} from "@/domain/economics/types";

import {
  buildSensitivityScenarios,
  calculateCIEconomics,
} from "@/domain/economics/ci-economics";

import {
  demoAccount,
} from "@/data/demo/revenue-scenario";

export type EconomicAssumptionProvenance =
  | "PUBLIC"
  | "MODELED"
  | "ASSUMED"
  | "CONNECTED"
  | "MEASURED";

export interface EconomicAssumption {
  key: keyof CIEconomicsInputs;

  label: string;

  value: number;

  unit: string;

  provenance:
    EconomicAssumptionProvenance;

  rationale: string;

  confidence: number;
}

export const demoEconomicInputs:
  CIEconomicsInputs = {
    developers:
      demoAccount.engineering
        .estimatedDevelopers ?? 180,

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

    warpBuildAnnualPrice:
      demoAccount.commercial
        .estimatedACV ?? 120_000,

    warpBuildInfrastructureCostRate:
      0.28,

    productiveRecoveryRate:
      0.35,
  };

export const demoEconomicAssumptions:
  EconomicAssumption[] = [
    {
      key: "developers",

      label:
        "Estimated developers",

      value:
        demoEconomicInputs.developers,

      unit: "developers",

      provenance: "MODELED",

      rationale:
        "Inherited from the synthetic Northstar engineering-footprint model.",

      confidence: 72,
    },

    {
      key:
        "buildsPerDeveloperPerDay",

      label:
        "Builds per developer / day",

      value:
        demoEconomicInputs
          .buildsPerDeveloperPerDay,

      unit: "builds",

      provenance: "ASSUMED",

      rationale:
        "Demonstration assumption until repository and CI telemetry are connected.",

      confidence: 55,
    },

    {
      key:
        "averageBuildMinutes",

      label:
        "Average CI duration",

      value:
        demoEconomicInputs
          .averageBuildMinutes,

      unit: "minutes",

      provenance: "ASSUMED",

      rationale:
        "Demonstration baseline until measured workflow-duration data is available.",

      confidence: 50,
    },

    {
      key:
        "workingDaysPerYear",

      label:
        "Working days / year",

      value:
        demoEconomicInputs
          .workingDaysPerYear,

      unit: "days",

      provenance: "MODELED",

      rationale:
        "Planning assumption used to annualize engineering activity.",

      confidence: 85,
    },

    {
      key:
        "engineerFullyLoadedCostPerYear",

      label:
        "Fully loaded engineer cost",

      value:
        demoEconomicInputs
          .engineerFullyLoadedCostPerYear,

      unit: "USD / year",

      provenance: "MODELED",

      rationale:
        "Economic model assumption rather than verified Northstar compensation data.",

      confidence: 60,
    },

    {
      key:
        "currentComputeCostPerMinute",

      label:
        "Current CI compute cost",

      value:
        demoEconomicInputs
          .currentComputeCostPerMinute,

      unit: "USD / minute",

      provenance: "ASSUMED",

      rationale:
        "Placeholder compute-rate assumption pending billing or CI-provider data.",

      confidence: 45,
    },

    {
      key:
        "developerBlockingRate",

      label:
        "Developer blocking rate",

      value:
        demoEconomicInputs
          .developerBlockingRate,

      unit: "ratio",

      provenance: "ASSUMED",

      rationale:
        "Models the share of CI runtime that actively blocks developer feedback rather than running asynchronously or without immediate human dependency.",

      confidence: 45,
    },

    {
      key:
        "speedupMultiplier",

      label:
        "WarpBuild speedup",

      value:
        demoEconomicInputs
          .speedupMultiplier,

      unit: "x",

      provenance: "ASSUMED",

      rationale:
        "Scenario input only. This is not presented as a measured WarpBuild result.",

      confidence: 40,
    },

    {
      key:
        "adoptionRate",

      label:
        "Eligible CI adoption",

      value:
        demoEconomicInputs
          .adoptionRate,

      unit: "ratio",

      provenance: "MODELED",

      rationale:
        "Models the share of eligible CI workload assumed to move to the accelerated path.",

      confidence: 60,
    },

    {
      key:
        "aiCodingMultiplier",

      label:
        "AI coding throughput multiplier",

      value:
        demoEconomicInputs
          .aiCodingMultiplier,

      unit: "x",

      provenance: "MODELED",

      rationale:
        "Models additional validation demand as AI-assisted development increases code throughput.",

      confidence: 55,
    },

    {
      key:
        "warpBuildAnnualPrice",

      label:
        "Modeled WarpBuild ACV",

      value:
        demoEconomicInputs
          .warpBuildAnnualPrice,

      unit: "USD / year",

      provenance: "MODELED",

      rationale:
        "Inherited from the synthetic opportunity model; not presented as WarpBuild pricing.",

      confidence: 50,
    },

    {
      key:
        "warpBuildInfrastructureCostRate",

      label:
        "Infrastructure cost rate",

      value:
        demoEconomicInputs
          .warpBuildInfrastructureCostRate,

      unit: "ratio",

      provenance: "ASSUMED",

      rationale:
        "Demonstration assumption used to expose gross-margin sensitivity.",

      confidence: 35,
    },

    {
      key:
        "productiveRecoveryRate",

      label:
        "Productive time recovery",

      value:
        demoEconomicInputs
          .productiveRecoveryRate,

      unit: "ratio",

      provenance: "MODELED",

      rationale:
        "Conservatively assumes only part of blocking CI time converts into economically productive engineering time.",

      confidence: 55,
    },
  ];

export const demoEconomicResult =
  calculateCIEconomics(
    demoEconomicInputs,
  );

export const demoEconomicSensitivity =
  buildSensitivityScenarios(
    demoEconomicInputs,
  );