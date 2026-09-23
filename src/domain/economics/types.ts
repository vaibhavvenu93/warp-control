export interface CIEconomicsInputs {
  developers: number;
  buildsPerDeveloperPerDay: number;
  averageBuildMinutes: number;
  workingDaysPerYear: number;

  engineerFullyLoadedCostPerYear: number;

  currentComputeCostPerMinute: number;

  developerBlockingRate: number;

  speedupMultiplier: number;
  adoptionRate: number;

  aiCodingMultiplier: number;

  warpBuildAnnualPrice: number;

  warpBuildInfrastructureCostRate: number;

  productiveRecoveryRate: number;
}

export interface CIBaselineEconomics {
  annualBuilds: number;
  annualCIMinutes: number;
  annualComputeCost: number;

  annualBlockingCIMinutes: number;

  annualDeveloperWaitHours: number;
  annualDeveloperWaitCost: number;
}

export interface WarpBuildScenario {
  effectiveBuildMinutes: number;

  annualMinutesSaved: number;
  annualHoursSaved: number;

  recoverableEngineeringHours: number;
  recoveredProductivityValue: number;

  warpBuildComputeMinutes: number;
  estimatedWarpBuildInfrastructureCost: number;
}

export interface CommercialEconomics {
  customerAnnualValue: number;

  warpBuildAnnualPrice: number;

  customerNetAnnualValue: number;

  roiMultiple: number;
  roiPercent: number;

  paybackMonths: number;

  valueCaptureRate: number;

  grossProfit: number;
  grossMarginPercent: number;

  breakEvenAnnualPrice: number;
}

export interface CIEconomicsResult {
  baseline: CIBaselineEconomics;

  scenario: WarpBuildScenario;

  commercial: CommercialEconomics;

  assumptions: CIEconomicsInputs;

  methodologyVersion: string;
}

export type SensitivityScenarioName =
  | "CONSERVATIVE"
  | "BASE"
  | "AGGRESSIVE";

export interface SensitivityScenario {
  name: SensitivityScenarioName;

  inputs: CIEconomicsInputs;

  result: CIEconomicsResult;
}