import {
  describe,
  expect,
  it,
} from "vitest";

import {
  AgentDefinition,
  InMemoryAgentRunRepository,
} from "@/agents/contracts/agent";

import { EventBus } from "@/events/event-bus";
import { InMemoryEventStore } from "@/events/event-store";

import { AgentRuntime } from "./agent-runtime";

interface TestInput
  extends Record<string, unknown> {
  accountId: string;
}

interface TestOutput
  extends Record<string, unknown> {
  recommendation: string;
}

function createAgent(
  requiresHumanReview = false,
): AgentDefinition<TestInput, TestOutput> {
  return {
    name: "REVENUE_INTELLIGENCE",

    version: "1.0.0",

    description:
      "Test revenue intelligence agent.",

    async execute() {
      return {
        output: {
          recommendation:
            "Run technical founder outreach.",
        },

        confidence: 88,

        evidenceIds: ["ev-001"],

        toolsCalled: [
          "account_lookup",
          "warp_score",
        ],

        requiresHumanReview,

        reasoningSummary:
          "The account has strong CI pain, engineering intensity and buying intent.",

        warnings: [],
      };
    },
  };
}

function createRuntime(
  requiresHumanReview = false,
) {
  const eventStore =
    new InMemoryEventStore();

  const eventBus =
    new EventBus(eventStore);

  const runRepository =
    new InMemoryAgentRunRepository();

  let timeIndex = 0;

  const times = [
    new Date(
      "2026-09-23T10:00:00.000Z",
    ),
    new Date(
      "2026-09-23T10:00:00.250Z",
    ),
  ];

  const runtime =
    new AgentRuntime(
      runRepository,
      eventBus,
      {
        now: () =>
          times[
            Math.min(
              timeIndex++,
              times.length - 1,
            )
          ],

        createRunId: () =>
          "run-test-001",
      },
    );

  return {
    eventStore,
    eventBus,
    runRepository,
    runtime,
    agent: createAgent(
      requiresHumanReview,
    ),
  };
}

describe("AgentRuntime", () => {
  it("records a successful agent execution", async () => {
    const {
      runtime,
      agent,
      runRepository,
    } = createRuntime();

    await runtime.execute({
      agent,

      trigger: "OPPORTUNITY_CREATED",

      execution: {
        input: {
          accountId: "acc-001",
        },

        context: {
          correlationId: "corr-001",
          causationId: "evt-001",
          accountId: "acc-001",
          opportunityId: "opp-001",
          evidence: [],
        },
      },
    });

    const run =
      await runRepository.getById(
        "run-test-001",
      );

    expect(run).not.toBeNull();

    expect(run!.status).toBe(
      "COMPLETED",
    );

    expect(run!.confidence).toBe(88);

    expect(run!.toolsCalled).toEqual([
      "account_lookup",
      "warp_score",
    ]);

    expect(run!.latencyMs).toBe(250);
  });

  it("persists an inspectable reasoning summary without requiring hidden chain-of-thought", async () => {
    const {
      runtime,
      agent,
      runRepository,
    } = createRuntime();

    await runtime.execute({
      agent,

      trigger: "OPPORTUNITY_CREATED",

      execution: {
        input: {
          accountId: "acc-001",
        },

        context: {
          correlationId: "corr-002",
          accountId: "acc-001",
          evidence: [],
        },
      },
    });

    const run =
      await runRepository.getById(
        "run-test-001",
      );

    expect(
      run!.output?.reasoningSummary,
    ).toContain(
      "strong CI pain",
    );
  });

  it("emits AGENT_RUN_COMPLETED with correlation preserved", async () => {
    const {
      runtime,
      agent,
      eventStore,
    } = createRuntime();

    await runtime.execute({
      agent,

      trigger: "OPPORTUNITY_CREATED",

      execution: {
        input: {
          accountId: "acc-001",
        },

        context: {
          correlationId:
            "corr-agent-chain",

          causationId:
            "evt-opportunity",

          accountId: "acc-001",

          evidence: [],
        },
      },
    });

    const events =
      await eventStore.getByCorrelationId(
        "corr-agent-chain",
      );

    const completed =
      events.find(
        (event) =>
          event.type ===
          "AGENT_RUN_COMPLETED",
      );

    expect(completed).toBeDefined();

    expect(
      completed!.causationId,
    ).toBe("evt-opportunity");
  });

  it("creates a human review state when the agent requests approval", async () => {
    const {
      runtime,
      agent,
      runRepository,
    } = createRuntime(true);

    await runtime.execute({
      agent,

      trigger: "OPPORTUNITY_CREATED",

      execution: {
        input: {
          accountId: "acc-001",
        },

        context: {
          correlationId: "corr-review",
          accountId: "acc-001",
          evidence: [],
        },
      },
    });

    const run =
      await runRepository.getById(
        "run-test-001",
      );

    expect(run!.status).toBe(
      "REQUIRES_HUMAN",
    );

    expect(
      run!.output?.requiresHumanReview,
    ).toBe(true);
  });

  it("records failures and emits AGENT_RUN_FAILED", async () => {
    const eventStore =
      new InMemoryEventStore();

    const eventBus =
      new EventBus(eventStore);

    const runRepository =
      new InMemoryAgentRunRepository();

    const runtime =
      new AgentRuntime(
        runRepository,
        eventBus,
        {
          now: () =>
            new Date(
              "2026-09-23T10:00:00.000Z",
            ),

          createRunId: () =>
            "run-failed",
        },
      );

    const failingAgent: AgentDefinition<
      TestInput,
      TestOutput
    > = {
      name: "REVENUE_INTELLIGENCE",
      version: "1.0.0",
      description: "Failing test agent",

      async execute() {
        throw new Error(
          "Model provider unavailable",
        );
      },
    };

    await expect(
      runtime.execute({
        agent: failingAgent,

        trigger:
          "OPPORTUNITY_CREATED",

        execution: {
          input: {
            accountId: "acc-001",
          },

          context: {
            correlationId:
              "corr-failure",

            causationId:
              "evt-opportunity",

            accountId:
              "acc-001",

            evidence: [],
          },
        },
      }),
    ).rejects.toThrow(
      "Model provider unavailable",
    );

    const run =
      await runRepository.getById(
        "run-failed",
      );

    expect(run!.status).toBe(
      "FAILED",
    );

    expect(run!.error).toBe(
      "Model provider unavailable",
    );

    const events =
      await eventStore.getByCorrelationId(
        "corr-failure",
      );

    expect(
      events.some(
        (event) =>
          event.type ===
          "AGENT_RUN_FAILED",
      ),
    ).toBe(true);
  });
});