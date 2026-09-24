import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildOperatingDemo,
} from "@/services/company-operating-system";

describe(
  "Company Operating System",
  () => {
    it(
      "assembles the modeled operating plan into one company snapshot",
      async () => {
        const system =
          await buildOperatingDemo();

        const snapshot =
          await system.getSnapshot();

        expect(
          snapshot.goals.length,
        ).toBeGreaterThan(0);

        expect(
          snapshot.metrics.length,
        ).toBeGreaterThan(0);

        expect(
          snapshot.workstreams.length,
        ).toBeGreaterThan(0);

        expect(
          snapshot.commitments.length,
        ).toBeGreaterThan(0);

        expect(
          snapshot.cadences.length,
        ).toBeGreaterThan(0);
      },
    );

    it(
      "keeps the demo boundary explicit",
      async () => {
        const system =
          await buildOperatingDemo();

        const snapshot =
          await system.getSnapshot();

        expect(
          snapshot.disclaimer,
        ).toContain(
          "deterministic demonstration scenario",
        );

        expect(
          snapshot.disclaimer,
        ).toContain(
          "not claims about WarpBuild",
        );
      },
    );

    it(
      "produces deterministic operating health",
      async () => {
        const system =
          await buildOperatingDemo();

        const first =
          await system.getSnapshot();

        const second =
          await system.getSnapshot();

        expect(
          second.health,
        ).toEqual(
          first.health,
        );

        expect(
          second.generatedAt,
        ).toBe(
          first.generatedAt,
        );
      },
    );

    it(
      "detects the modeled blocked and overdue execution path",
      async () => {
        const system =
          await buildOperatingDemo();

        const snapshot =
          await system.getSnapshot();

        expect(
          snapshot.health
            .blockedCommitments,
        ).toBeGreaterThanOrEqual(1);

        expect(
          snapshot.health
            .overdueCommitments,
        ).toBeGreaterThanOrEqual(1);

        expect(
          snapshot.health
            .blockedDependencies,
        ).toBeGreaterThanOrEqual(1);
      },
    );

    it(
      "surfaces human decision boundaries to CEO attention",
      async () => {
        const system =
          await buildOperatingDemo();

        const snapshot =
          await system.getSnapshot();

        const decisions =
          snapshot.attention.filter(
            (item) =>
              item.action ===
              "DECIDE",
          );

        expect(
          decisions.length,
        ).toBeGreaterThanOrEqual(1);

        expect(
          decisions.every(
            (item) =>
              item.humanReviewRequired,
          ),
        ).toBe(true);

        expect(
          decisions.every(
            (item) =>
              item.decisionRequired,
          ),
        ).toBe(true);
      },
    );

    it(
      "ranks the critical human boundary ahead of ordinary follow-ups",
      async () => {
        const system =
          await buildOperatingDemo();

        const snapshot =
          await system.getSnapshot();

        expect(
          snapshot.attention[0]
            .priority,
        ).toBe("CRITICAL");

        expect(
          snapshot.attention[0]
            .action,
        ).toBe("DECIDE");
      },
    );

    it(
      "runs the weekly company cadence over the operating system",
      async () => {
        const system =
          await buildOperatingDemo();

        const review =
          await system.runCadence(
            "cadence-company-weekly",
          );

        expect(
          review.reviewType,
        ).toBe("COMPANY");

        expect(
          review.goalIds.length,
        ).toBeGreaterThan(0);

        expect(
          review.workstreamIds.length,
        ).toBeGreaterThan(0);

        expect(
          review.attentionItemIds.length,
        ).toBeGreaterThan(0);
      },
    );

    it(
      "runs a scoped GTM cadence without pulling every company goal",
      async () => {
        const system =
          await buildOperatingDemo();

        const review =
          await system.runCadence(
            "cadence-gtm-weekly",
          );

        expect(
          review.reviewType,
        ).toBe("GTM");

        expect(
          review.goalIds,
        ).toEqual([
          "goal-gtm-learning",
        ]);

        expect(
          review.workstreamIds,
        ).toEqual([
          "ws-gtm",
        ]);

        expect(
          review.metricIds,
        ).toEqual([
          "metric-gtm-experiments",
        ]);
      },
    );

    it(
      "fails safely when an unknown cadence is requested",
      async () => {
        const system =
          await buildOperatingDemo();

        await expect(
          system.runCadence(
            "cadence-does-not-exist",
          ),
        ).rejects.toThrow(
          "was not found",
        );
      },
    );
  },
);