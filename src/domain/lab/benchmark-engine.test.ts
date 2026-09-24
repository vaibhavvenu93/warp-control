import {
  describe,
  expect,
  it,
} from "vitest";

import {
  compareBenchmarks,
  modelDeveloperFeedback,
} from "./benchmark-engine";

import type {
  BenchmarkRun,
} from "./types";

function run(
  overrides: Partial<BenchmarkRun> = {},
): BenchmarkRun {
  return {
    id: "run-1",
    provider: "GITHUB_ACTIONS",
    state: "MEASURED",
    repository:
      "vaibhavvenu93/warp-control",
    branch: "cluster-2-revenue-engine",
    commitSha: "abc123",
    runner: "ubuntu-latest",
    capturedAt:
      "2026-09-24T10:00:00.000Z",
    stages: [
      {
        stage: "INSTALL",
        durationMs: 10000,
      },
      {
        stage: "TYPECHECK",
        durationMs: 5000,
      },
      {
        stage: "TEST",
        durationMs: 5000,
      },
      {
        stage: "BUILD",
        durationMs: 10000,
      },
    ],
    totalObservedMs: 30000,
    notes: [],
    ...overrides,
  };
}

describe("compareBenchmarks", () => {
  it("keeps the experiment pending until both providers are measured", () => {
    const baseline = run();

    const candidate = run({
      id: "warp-1",
      provider: "WARPBUILD",
      state: "NOT_MEASURED",
      commitSha: undefined,
      totalObservedMs: null,
      stages: [
        {
          stage: "INSTALL",
          durationMs: null,
        },
        {
          stage: "TYPECHECK",
          durationMs: null,
        },
        {
          stage: "TEST",
          durationMs: null,
        },
        {
          stage: "BUILD",
          durationMs: null,
        },
      ],
    });

    const result =
      compareBenchmarks(
        baseline,
        candidate,
      );

    expect(result.state).toBe(
      "PENDING",
    );

    expect(
      result.totalSpeedupMultiple,
    ).toBeNull();
  });

  it("refuses comparison across different commits", () => {
    const result =
      compareBenchmarks(
        run(),
        run({
          id: "warp-1",
          provider: "WARPBUILD",
          commitSha: "different",
        }),
      );

    expect(result.state).toBe(
      "NOT_COMPARABLE",
    );

    expect(result.limitations).toContain(
      "Runs were not executed against the same commit, so a performance conclusion would be unsafe.",
    );
  });

  it("calculates total improvement for comparable runs", () => {
    const result =
      compareBenchmarks(
        run(),
        run({
          id: "warp-1",
          provider: "WARPBUILD",
          totalObservedMs: 15000,
          stages: [
            {
              stage: "INSTALL",
              durationMs: 5000,
            },
            {
              stage: "TYPECHECK",
              durationMs: 2500,
            },
            {
              stage: "TEST",
              durationMs: 2500,
            },
            {
              stage: "BUILD",
              durationMs: 5000,
            },
          ],
        }),
      );

    expect(result.state).toBe(
      "COMPARABLE",
    );

    expect(
      result.totalImprovementPercent,
    ).toBe(50);

    expect(
      result.totalSpeedupMultiple,
    ).toBe(2);
  });

  it("calculates stage-level deltas", () => {
    const result =
      compareBenchmarks(
        run(),
        run({
          id: "warp-1",
          provider: "WARPBUILD",
          totalObservedMs: 15000,
          stages: [
            {
              stage: "INSTALL",
              durationMs: 5000,
            },
            {
              stage: "TYPECHECK",
              durationMs: 2500,
            },
            {
              stage: "TEST",
              durationMs: 2500,
            },
            {
              stage: "BUILD",
              durationMs: 5000,
            },
          ],
        }),
      );

    const build =
      result.stages.find(
        (stage) =>
          stage.stage === "BUILD",
      );

    expect(
      build?.improvementPercent,
    ).toBe(50);

    expect(
      build?.speedupMultiple,
    ).toBe(2);
  });
});

describe("modelDeveloperFeedback", () => {
  it("does not invent savings before both runs exist", () => {
    const candidate = run({
      provider: "WARPBUILD",
      state: "NOT_MEASURED",
      totalObservedMs: null,
    });

    const result =
      modelDeveloperFeedback(
        run(),
        candidate,
        {
          developers: 20,
          ciRunsPerDeveloperPerDay: 5,
          workingDaysPerMonth: 20,
        },
      );

    expect(
      result.minutesSavedPerRun,
    ).toBeNull();

    expect(
      result.estimatedTeamHoursSavedPerMonth,
    ).toBeNull();
  });

  it("models monthly feedback-loop time only from measured timings", () => {
    const result =
      modelDeveloperFeedback(
        run(),
        run({
          provider: "WARPBUILD",
          totalObservedMs: 15000,
        }),
        {
          developers: 20,
          ciRunsPerDeveloperPerDay: 5,
          workingDaysPerMonth: 20,
        },
      );

    expect(
      result.baselineMinutesPerRun,
    ).toBe(0.5);

    expect(
      result.candidateMinutesPerRun,
    ).toBe(0.25);

    expect(
      result.minutesSavedPerRun,
    ).toBe(0.25);

    expect(
      result.estimatedTeamHoursSavedPerMonth,
    ).toBe(8.33);
  });
});