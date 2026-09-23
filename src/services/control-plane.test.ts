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

const EXPERIMENT_CORRELATION_ID =
  "corr-experiment-demo-001";

describe(
  "Company Intelligence Control Plane",
  () => {
    it(
      "executes revenue and experiment intelligence through the shared control plane",
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
        ).toHaveLength(2);

        expect(
          snapshot.agentRuns.map(
            (run) => run.agent,
          ),
        ).toEqual(
          expect.arrayContaining([
            "REVENUE_INTELLIGENCE",
            "EXPERIMENT_ANALYST",
          ]),
        );

        expect(
          snapshot.telemetry
            .agentRunCount,
        ).toBe(2);
      },
    );

    it(
      "preserves independent revenue and experiment correlation chains",
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
          snapshot.telemetry
            .correlationIds,
        ).toEqual(
          expect.arrayContaining([
            DEMO_CORRELATION_ID,
            EXPERIMENT_CORRELATION_ID,
          ]),
        );

        const revenueEvents =
          snapshot.events.filter(
            (event) =>
              event.correlationId ===
              DEMO_CORRELATION_ID,
          );

        const experimentEvents =
          snapshot.events.filter(
            (event) =>
              event.correlationId ===
              EXPERIMENT_CORRELATION_ID,
          );

        expect(
          revenueEvents.length,
        ).toBeGreaterThanOrEqual(
          4,
        );

        expect(
          experimentEvents.length,
        ).toBeGreaterThanOrEqual(
          2,
        );

        expect(
          revenueEvents.every(
            (event) =>
              event.correlationId ===
              DEMO_CORRELATION_ID,
          ),
        ).toBe(true);

        expect(
          experimentEvents.every(
            (event) =>
              event.correlationId ===
              EXPERIMENT_CORRELATION_ID,
          ),
        ).toBe(true);

        const revenueRun =
          snapshot.agentRuns.find(
            (run) =>
              run.agent ===
              "REVENUE_INTELLIGENCE",
          );

        const experimentRun =
          snapshot.agentRuns.find(
            (run) =>
              run.agent ===
              "EXPERIMENT_ANALYST",
          );

        expect(
          revenueRun,
        ).toBeDefined();

        expect(
          experimentRun,
        ).toBeDefined();

        expect(
          revenueRun!.input
            .correlationId,
        ).toBe(
          DEMO_CORRELATION_ID,
        );

        expect(
          experimentRun!.input
            .correlationId,
        ).toBe(
          EXPERIMENT_CORRELATION_ID,
        );
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
      "records observability metadata for both agents",
      async () => {
        const snapshot =
          await buildRevenueDemo();

        const revenueRun =
          snapshot.agentRuns.find(
            (run) =>
              run.agent ===
              "REVENUE_INTELLIGENCE",
          );

        const experimentRun =
          snapshot.agentRuns.find(
            (run) =>
              run.agent ===
              "EXPERIMENT_ANALYST",
          );

        expect(
          revenueRun,
        ).toBeDefined();

        expect(
          experimentRun,
        ).toBeDefined();

        expect(
          revenueRun!.toolsCalled,
        ).toContain(
          "warp_score",
        );

        expect(
          revenueRun!.toolsCalled,
        ).toContain(
          "opportunity_engine",
        );

        expect(
          experimentRun!
            .toolsCalled,
        ).toContain(
          "experiment_decision_engine",
        );

        expect(
          experimentRun!
            .toolsCalled,
        ).toContain(
          "portfolio_optimizer",
        );

        expect(
          experimentRun!
            .toolsCalled,
        ).toContain(
          "evidence_graph",
        );

        for (
          const run of
          snapshot.agentRuns
        ) {
          expect(
            run.confidence,
          ).toBeGreaterThan(0);

          expect(
            run.completedAt,
          ).toBeDefined();

          expect(
            run.latencyMs,
          ).toBeDefined();
        }
      },
    );

    it(
      "surfaces human judgment from revenue and experiment policy boundaries",
      async () => {
        const snapshot =
          await buildRevenueDemo();

        const humanRuns =
          snapshot.agentRuns.filter(
            (run) =>
              run.status ===
              "REQUIRES_HUMAN",
          );

        expect(
          humanRuns.length,
        ).toBeGreaterThanOrEqual(
          1,
        );

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
        ).toBe(
          humanRuns.length,
        );

        expect(
          snapshot.telemetry
            .decisionCount,
        ).toBe(
          snapshot.decisions.length,
        );

        const experimentDecision =
          snapshot.decisions.find(
            (decision) =>
              decision.agent ===
              "EXPERIMENT_ANALYST",
          );

        expect(
          experimentDecision,
        ).toBeDefined();

        expect(
          experimentDecision!
            .source,
        ).toBe(
          "AGENT",
        );

        expect(
          experimentDecision!
            .correlationId,
        ).toBe(
          EXPERIMENT_CORRELATION_ID,
        );
      },
    );

    it(
      "projects experiment portfolio approval without duplicating the agent decision",
      async () => {
        const snapshot =
          await buildRevenueDemo();

        const experimentRuns =
          snapshot.agentRuns.filter(
            (run) =>
              run.agent ===
              "EXPERIMENT_ANALYST" &&
              run.status ===
              "REQUIRES_HUMAN",
          );

        const experimentDecisions =
          snapshot.decisions.filter(
            (decision) =>
              decision.agent ===
              "EXPERIMENT_ANALYST",
          );

        expect(
          experimentRuns,
        ).toHaveLength(1);

        expect(
          experimentDecisions,
        ).toHaveLength(1);

        expect(
          experimentDecisions[0]
            .title.length,
        ).toBeGreaterThan(0);

        expect(
          experimentDecisions[0]
            .reason.length,
        ).toBeGreaterThan(0);
      },
    );

    it(
      "records experiment agent and decision events in the shared event store",
      async () => {
        const snapshot =
          await buildRevenueDemo();

        const experimentEvents =
          snapshot.events.filter(
            (event) =>
              event.correlationId ===
              EXPERIMENT_CORRELATION_ID,
          );

        expect(
          experimentEvents.some(
            (event) =>
              event.type ===
              "AGENT_RUN_COMPLETED",
          ),
        ).toBe(true);

        expect(
          experimentEvents.some(
            (event) =>
              event.type ===
              "DECISION_REQUIRED",
          ),
        ).toBe(true);

        const decisionEvent =
          experimentEvents.find(
            (event) =>
              event.type ===
              "DECISION_REQUIRED",
          );

        expect(
          decisionEvent,
        ).toBeDefined();

        expect(
          decisionEvent!.source,
        ).toBe(
          "AGENT",
        );

        expect(
          decisionEvent!.payload
            .decisionType,
        ).toBe(
          "EXPERIMENT_PORTFOLIO_APPROVAL",
        );
      },
    );

    it(
      "never presents the demo scenario as verified WarpBuild customer or experiment data",
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
          snapshot.scenario
            .disclaimer,
        ).toContain(
          "no WarpBuild customer",
        );

        expect(
          snapshot.scenario
            .disclaimer,
        ).toContain(
          "experiment-performance data",
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