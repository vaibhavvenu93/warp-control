import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildLabExperiment,
} from "./lab-control-plane";

describe("lab control plane", () => {
  it("starts without invented benchmark results", () => {
    const experiment =
      buildLabExperiment();

    expect(
      experiment.baseline.state,
    ).toBe("NOT_MEASURED");

    expect(
      experiment.candidate.state,
    ).toBe("NOT_MEASURED");
  });

  it("keeps the comparison pending", () => {
    const experiment =
      buildLabExperiment();

    expect(
      experiment.comparison.state,
    ).toBe("PENDING");
  });

  it("does not claim a speedup", () => {
    const experiment =
      buildLabExperiment();

    expect(
      experiment.comparison
        .totalSpeedupMultiple,
    ).toBeNull();

    expect(
      experiment.comparison
        .totalImprovementPercent,
    ).toBeNull();
  });

  it("does not invent developer time savings", () => {
    const experiment =
      buildLabExperiment();

    expect(
      experiment.developerFeedbackModel
        .estimatedTeamHoursSavedPerMonth,
    ).toBeNull();
  });

  it("uses the actual experiment repository", () => {
    const experiment =
      buildLabExperiment();

    expect(experiment.repository).toBe(
      "vaibhavvenu93/warp-control",
    );
  });

  it("preserves experiment limitations", () => {
    const experiment =
      buildLabExperiment();

    expect(
      experiment.limitations.length,
    ).toBeGreaterThanOrEqual(4);
  });

  it("explicitly refuses a premature performance conclusion", () => {
    const experiment =
      buildLabExperiment();

    expect(
      experiment.conclusion,
    ).toContain("refuses to claim");
  });
});