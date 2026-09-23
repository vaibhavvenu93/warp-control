import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DEMO_ACCOUNT_ID,
  DEMO_CORRELATION_ID,
} from "@/data/demo/revenue-scenario";

import {
  buildRevenueDemo,
} from "@/services/control-plane";

describe(
  "Revenue Intelligence Control Plane",
  () => {
    it(
      "executes the full signal-to-agent pipeline",
      async () => {
        const snapshot =
          await buildRevenueDemo();

        expect(
          snapshot.account.id,
        ).toBe(
          DEMO_ACCOUNT_ID,
        );

        expect(
          snapshot.warpScore.score,
        ).toBeGreaterThanOrEqual(
          55,
        );

        expect(
          snapshot.opportunity,
        ).not.toBeNull();

        expect(
          snapshot.agentRuns,
        ).toHaveLength(1);

        expect(
          snapshot.agentRuns[0]
            .agent,
        ).toBe(
          "REVENUE_INTELLIGENCE",
        );
      },
    );

    it(
      "preserves one correlation chain across the control plane",
      async () => {
        const snapshot =
          await buildRevenueDemo();

        expect(
          snapshot.telemetry
            .correlationId,
        ).toBe(
          DEMO_CORRELATION_ID,
        );

        expect(
          snapshot.events.length,
        ).toBeGreaterThanOrEqual(
          4,
        );

        expect(
          snapshot.events.every(
            (event) =>
              event.correlationId ===
              DEMO_CORRELATION_ID,
          ),
        ).toBe(true);

        expect(
          snapshot.agentRuns.every(
            (run) =>
              run.input
                .correlationId ===
              DEMO_CORRELATION_ID,
          ),
        ).toBe(true);
      },
    );

    it(
      "creates a computed WarpScore with provenance",
      async () => {
        const snapshot =
          await buildRevenueDemo();

        expect(
          snapshot.warpScore
            .components.length,
        ).toBeGreaterThan(0);

        expect(
          snapshot.warpScore
            .version,
        ).toBe(
          "1.0.0",
        );

        expect(
          snapshot.warpScore
            .confidence,
        ).toBeGreaterThan(0);

        expect(
          snapshot.evidence.some(
            (evidence) =>
              evidence.type ===
              "MODELED",
          ),
        ).toBe(true);

        expect(
          snapshot.evidence.some(
            (evidence) =>
              evidence.type ===
              "ASSUMED",
          ),
        ).toBe(true);
      },
    );

    it(
      "creates an explainable commercial opportunity",
      async () => {
        const snapshot =
          await buildRevenueDemo();

        expect(
          snapshot.opportunity,
        ).not.toBeNull();

        expect(
          snapshot.opportunity!
            .estimatedACV,
        ).toBeGreaterThan(0);

        expect(
          snapshot.opportunity!
            .probability,
        ).toBeGreaterThan(0);

        expect(
          snapshot.opportunity!
            .expectedValue,
        ).toBeGreaterThan(0);

        expect(
          snapshot.opportunity!
            .evidenceIds.length,
        ).toBeGreaterThan(0);
      },
    );

    it(
      "records agent observability metadata",
      async () => {
        const snapshot =
          await buildRevenueDemo();

        const run =
          snapshot.agentRuns[0];

        expect(
          run.toolsCalled,
        ).toContain(
          "warp_score",
        );

        expect(
          run.toolsCalled,
        ).toContain(
          "opportunity_engine",
        );

        expect(
          run.confidence,
        ).toBeGreaterThan(0);

        expect(
          run.completedAt,
        ).toBeDefined();

        expect(
          run.latencyMs,
        ).toBeDefined();
      },
    );

    it(
      "surfaces human judgment when policy requires it",
      async () => {
        const snapshot =
          await buildRevenueDemo();

        const requiresHuman =
          snapshot.agentRuns.some(
            (run) =>
              run.status ===
              "REQUIRES_HUMAN",
          );

        if (
          requiresHuman
        ) {
          expect(
            snapshot.decisions.some(
              (decision) =>
                decision.status ===
                "REQUIRES_HUMAN",
            ),
          ).toBe(true);

          expect(
            snapshot.telemetry
              .humanReviewCount,
          ).toBeGreaterThan(0);
        } else {
          expect(
            snapshot.agentRuns[0]
              .status,
          ).toBe(
            "COMPLETED",
          );
        }
      },
    );

    it(
      "never presents the demo scenario as verified WarpBuild customer data",
      async () => {
        const snapshot =
          await buildRevenueDemo();

        expect(
          snapshot.scenario.mode,
        ).toBe(
          "DETERMINISTIC_DEMO",
        );

        expect(
          snapshot.scenario
            .disclaimer,
        ).toContain(
          "Synthetic demonstration account",
        );

        expect(
          snapshot.evidence.some(
            (evidence) =>
              evidence.type ===
              "ASSUMED",
          ),
        ).toBe(true);
      },
    );
  },
);