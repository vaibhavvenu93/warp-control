import {
  describe,
  expect,
  it,
} from "vitest";

import {
  InMemoryAgentRunRepository,
} from "@/agents/contracts/agent";

import {
  EventBus,
} from "@/events/event-bus";

import {
  InMemoryEventStore,
} from "@/events/event-store";

import {
  ExperimentOrchestrator,
  findExperimentDecisionEvents,
} from "@/services/experiment-orchestrator";

function createHarness() {
  const eventStore =
    new InMemoryEventStore();

  const eventBus =
    new EventBus(
      eventStore,
    );

  const agentRuns =
    new InMemoryAgentRunRepository();

  const timestamps = [
    new Date(
      "2026-09-23T12:00:00.000Z",
    ),

    new Date(
      "2026-09-23T12:00:00.025Z",
    ),

    new Date(
      "2026-09-23T12:00:00.050Z",
    ),
  ];

  let timestampIndex = 0;

  const now = () => {
    const value =
      timestamps[
        Math.min(
          timestampIndex,
          timestamps.length - 1,
        )
      ];

    timestampIndex += 1;

    return value;
  };

  const orchestrator =
    new ExperimentOrchestrator(
      eventBus,
      agentRuns,
      {
        now,

        createDecisionId:
          () =>
            "decision-experiment-demo-001",
      },
    );

  return {
    eventStore,
    eventBus,
    agentRuns,
    orchestrator,
  };
}

describe(
  "experiment orchestrator",
  () => {
    it(
      "optimizes and analyzes the experiment portfolio",
      async () => {
        const {
          orchestrator,
        } =
          createHarness();

        const result =
          await orchestrator.analyze({
            correlationId:
              "corr-experiment-demo",
          });

        expect(
          result.portfolio
            .selectedCount,
        ).toBeGreaterThan(0);

        expect(
          result.analysis
            .selectedCount,
        ).toBe(
          result.portfolio
            .selectedCount,
        );

        expect(
          result.analysis
            .modeledExpectedValue,
        ).toBe(
          result.portfolio
            .modeledExpectedValue,
        );
      },
    );

    it(
      "executes through the shared agent runtime",
      async () => {
        const {
          orchestrator,
          agentRuns,
        } =
          createHarness();

        await orchestrator.analyze({
          correlationId:
            "corr-runtime",
        });

        const runs =
          await agentRuns.getByAgent(
            "EXPERIMENT_ANALYST",
          );

        expect(runs).toHaveLength(1);

        expect(
          runs[0].status,
        ).toBe(
          "REQUIRES_HUMAN",
        );

        expect(
          runs[0].toolsCalled,
        ).toEqual([
          "experiment_decision_engine",
          "portfolio_optimizer",
          "evidence_graph",
        ]);
      },
    );

    it(
      "emits an agent completion event",
      async () => {
        const {
          orchestrator,
          eventStore,
        } =
          createHarness();

        await orchestrator.analyze({
          correlationId:
            "corr-agent-event",
        });

        const events =
          await eventStore.getAll();

        const agentEvent =
          events.find(
            (event) =>
              event.type ===
              "AGENT_RUN_COMPLETED",
          );

        expect(
          agentEvent,
        ).toBeDefined();

        expect(
          agentEvent?.correlationId,
        ).toBe(
          "corr-agent-event",
        );

        expect(
          agentEvent?.payload
            .agent,
        ).toBe(
          "EXPERIMENT_ANALYST",
        );
      },
    );

    it(
      "emits a CEO decision event when human approval is required",
      async () => {
        const {
          orchestrator,
          eventStore,
        } =
          createHarness();

        const result =
          await orchestrator.analyze({
            correlationId:
              "corr-decision",
          });

        const events =
          await eventStore.getAll();

        const decisions =
          findExperimentDecisionEvents(
            events,
          );

        expect(
          result
            .requiresHumanReview,
        ).toBe(true);

        expect(
          decisions,
        ).toHaveLength(1);

        expect(
          decisions[0].id,
        ).toBe(
          "decision-experiment-demo-001",
        );

        expect(
          decisions[0].payload
            .decisionType,
        ).toBe(
          "EXPERIMENT_PORTFOLIO_APPROVAL",
        );
      },
    );

    it(
      "preserves correlation and causation lineage",
      async () => {
        const {
          orchestrator,
          eventStore,
        } =
          createHarness();

        await orchestrator.analyze({
          correlationId:
            "corr-lineage",

          causationId:
            "evt-growth-review-001",
        });

        const events =
          await eventStore.getAll();

        expect(
          events.every(
            (event) =>
              event.correlationId ===
              "corr-lineage",
          ),
        ).toBe(true);

        const agentEvent =
          events.find(
            (event) =>
              event.type ===
              "AGENT_RUN_COMPLETED",
          );

        expect(
          agentEvent
            ?.causationId,
        ).toBe(
          "evt-growth-review-001",
        );

        const decisionEvent =
          findExperimentDecisionEvents(
            events,
          )[0];

        expect(
          decisionEvent
            .causationId,
        ).toBe(
          "evt-growth-review-001",
        );
      },
    );

    it(
      "records portfolio economics in the decision event",
      async () => {
        const {
          orchestrator,
          eventStore,
        } =
          createHarness();

        const result =
          await orchestrator.analyze({
            correlationId:
              "corr-economics",
          });

        const events =
          await eventStore.getAll();

        const decision =
          findExperimentDecisionEvents(
            events,
          )[0];

        expect(
          decision.payload
            .allocatedBudget,
        ).toBe(
          result.portfolio
            .allocatedBudget,
        );

        expect(
          decision.payload
            .modeledExpectedValue,
        ).toBe(
          result.portfolio
            .modeledExpectedValue,
        );

        expect(
          decision.payload
            .expectedPortfolioROI,
        ).toBe(
          result.portfolio
            .expectedPortfolioROI,
        );
      },
    );

    it(
      "surfaces evidence requests instead of silently approving uncertain experiments",
      async () => {
        const {
          orchestrator,
        } =
          createHarness();

        const result =
          await orchestrator.analyze({
            correlationId:
              "corr-evidence",
          });

        expect(
          result.analysis
            .evidenceRequests
            .length,
        ).toBeGreaterThan(0);

        expect(
          result.analysis
            .blockedExperiments,
        ).toContain(
          "exp-enterprise-pricing",
        );

        expect(
          result.analysis
            .killedExperiments,
        ).toContain(
          "exp-generic-paid-search",
        );
      },
    );

    it(
      "produces deterministic portfolio decisions for deterministic inputs",
      async () => {
        const first =
          createHarness();

        const second =
          createHarness();

        const firstResult =
          await first.orchestrator.analyze({
            correlationId:
              "corr-deterministic",
          });

        const secondResult =
          await second.orchestrator.analyze({
            correlationId:
              "corr-deterministic",
          });

        expect(
          secondResult.portfolio,
        ).toEqual(
          firstResult.portfolio,
        );

        expect(
          secondResult.analysis,
        ).toEqual(
          firstResult.analysis,
        );
      },
    );
  },
);