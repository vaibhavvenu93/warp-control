import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  Account,
  EvidenceRef,
  Signal,
  WarpScore,
} from "@/domain/types";

import {
  InMemoryAgentRunRepository,
} from "@/agents/contracts/agent";

import { AgentRuntime } from "@/agents/runtime/agent-runtime";

import { createDomainEvent } from "@/events/create-event";
import { EventBus } from "@/events/event-bus";
import { InMemoryEventStore } from "@/events/event-store";

import { InMemoryOpportunityRepository } from "@/repositories/opportunity-repository";
import { InMemoryRevenueRepository } from "@/repositories/revenue-repository";

import { OpportunityOrchestrator } from "./opportunity-orchestrator";

const NOW = new Date(
  "2026-09-23T12:00:00.000Z",
);

function createAccount(): Account {
  return {
    id: "acc-warp-target",

    name: "Velocity AI",

    domain: "velocity.example",

    stage: "QUALIFIED",

    profile: {
      industry:
        "Developer Infrastructure",

      employeeCount: 500,

      developerCount: 200,

      headquarters:
        "San Francisco",

      fundingStage: "Series B",
    },

    engineering: {
      repositories: 80,

      estimatedDevelopers: 200,

      ciProvider:
        "GitHub Actions",

      cloudProvider: "AWS",

      languages: [
        "TypeScript",
        "Go",
        "Python",
      ],

      frameworks: [
        "Next.js",
      ],

      aiCodingSignals: [
        "AI coding adoption",
      ],
    },

    commercial: {
      estimatedACV: 120_000,

      currentSpendEstimate:
        90_000,

      expansionPotential: 90,
    },

    signalIds: [
      "sig-ci",
      "sig-buy",
      "sig-ai",
    ],

    evidenceIds: [
      "ev-profile",
    ],

    createdAt:
      "2026-09-01T00:00:00.000Z",

    updatedAt:
      NOW.toISOString(),
  };
}

function createSignals(): Signal[] {
  return [
    {
      id: "sig-ci",

      accountId:
        "acc-warp-target",

      category: "CI_PAIN",

      direction: "POSITIVE",

      title:
        "CI feedback loop pressure",

      description:
        "Engineering validation is becoming a bottleneck.",

      strength: 96,

      confidence: 95,

      evidenceIds: ["ev-ci"],

      detectedAt:
        NOW.toISOString(),
    },

    {
      id: "sig-buy",

      accountId:
        "acc-warp-target",

      category:
        "BUYING_INTENT",

      direction: "POSITIVE",

      title:
        "Infrastructure evaluation",

      description:
        "Commercial evaluation signal detected.",

      strength: 85,

      confidence: 94,

      evidenceIds: ["ev-buy"],

      detectedAt:
        NOW.toISOString(),
    },

    {
      id: "sig-ai",

      accountId:
        "acc-warp-target",

      category:
        "AI_ADOPTION",

      direction: "POSITIVE",

      title:
        "AI coding adoption",

      description:
        "AI-assisted development is increasing code-generation velocity.",

      strength: 90,

      confidence: 90,

      evidenceIds: ["ev-ai"],

      detectedAt:
        NOW.toISOString(),
    },
  ];
}

function createEvidence(): EvidenceRef[] {
  return [
    {
      id: "ev-profile",

      type: "CONNECTED",

      source:
        "Account enrichment",

      capturedAt:
        NOW.toISOString(),

      claim:
        "Engineering profile verified.",

      confidence: 95,
    },

    {
      id: "ev-ci",

      type: "CONNECTED",

      source:
        "CI intelligence",

      capturedAt:
        NOW.toISOString(),

      claim:
        "CI bottleneck signal verified.",

      confidence: 96,
    },

    {
      id: "ev-buy",

      type: "INTERNAL",

      source:
        "Commercial signal",

      capturedAt:
        NOW.toISOString(),

      claim:
        "Buying intent detected.",

      confidence: 97,
    },

    {
      id: "ev-ai",

      type: "PUBLIC",

      source:
        "Engineering research",

      capturedAt:
        NOW.toISOString(),

      claim:
        "AI coding adoption detected.",

      confidence: 90,
    },
  ];
}

function createWarpScore(): WarpScore {
  return {
    accountId:
      "acc-warp-target",

    score: 82,

    classification:
      "HIGH_PRIORITY",

    confidence: 90,

    components: [
      {
        key: "ciPain",

        label: "CI pain",

        rawValue: 96,

        normalizedValue: 96,

        weight: 0.2,

        contribution: 19.2,

        evidenceIds: ["ev-ci"],
      },

      {
        key:
          "engineeringIntensity",

        label:
          "Engineering intensity",

        rawValue: 90,

        normalizedValue: 90,

        weight: 0.2,

        contribution: 18,

        evidenceIds: [
          "ev-profile",
        ],
      },

      {
        key: "buyingIntent",

        label:
          "Buying intent",

        rawValue: 85,

        normalizedValue: 85,

        weight: 0.15,

        contribution: 12.75,

        evidenceIds: ["ev-buy"],
      },
    ],

    calculatedAt:
      NOW.toISOString(),

    version: "1.0.0",
  };
}

async function createSystem() {
  const eventStore =
    new InMemoryEventStore();

  const eventBus =
    new EventBus(eventStore);

  const revenueRepository =
    new InMemoryRevenueRepository();

  const opportunityRepository =
    new InMemoryOpportunityRepository();

  const agentRunRepository =
    new InMemoryAgentRunRepository();

  const agentRuntime =
    new AgentRuntime(
      agentRunRepository,
      eventBus,
      {
        now: () => NOW,

        createRunId: () =>
          "run-revenue-001",
      },
    );

  const account =
    createAccount();

  revenueRepository.seedAccount(
    account,
  );

  revenueRepository.seedSignals(
    account.id,
    createSignals(),
  );

  revenueRepository.seedEvidence(
    account.id,
    createEvidence(),
  );

  await revenueRepository.saveWarpScore(
    createWarpScore(),
  );

  const orchestrator =
    new OpportunityOrchestrator(
      revenueRepository,
      opportunityRepository,
      eventBus,
      agentRuntime,
      () => NOW,
    );

  orchestrator.register();

  return {
    eventStore,
    eventBus,
    opportunityRepository,
    agentRunRepository,
  };
}

describe(
  "OpportunityOrchestrator",
  () => {
    it(
      "turns ACCOUNT_QUALIFIED into a persisted opportunity",
      async () => {
        const system =
          await createSystem();

        await system.eventBus.publish(
          createDomainEvent({
            id: "evt-qualified",

            type:
              "ACCOUNT_QUALIFIED",

            aggregateType:
              "ACCOUNT",

            aggregateId:
              "acc-warp-target",

            payload: {
              accountId:
                "acc-warp-target",

              warpScore: 82,

              classification:
                "HIGH_PRIORITY",
            },

            source:
              "AGENT",

            correlationId:
              "corr-revenue-001",

            occurredAt:
              NOW.toISOString(),
          }),
        );

        const opportunities =
          await system.opportunityRepository.getByAccountId(
            "acc-warp-target",
          );

        expect(
          opportunities,
        ).toHaveLength(1);

        expect(
          opportunities[0]
            .estimatedACV,
        ).toBe(120_000);

        expect(
  opportunities[0]
    .recommendedMotion,
).toBe(
  "FOUNDER_OUTBOUND",
);
      },
    );

    it(
      "emits OPPORTUNITY_CREATED in the same correlation chain",
      async () => {
        const system =
          await createSystem();

        await system.eventBus.publish(
          createDomainEvent({
            id: "evt-qualified",

            type:
              "ACCOUNT_QUALIFIED",

            aggregateType:
              "ACCOUNT",

            aggregateId:
              "acc-warp-target",

            payload: {
              accountId:
                "acc-warp-target",

              warpScore: 82,

              classification:
                "HIGH_PRIORITY",
            },

            source:
              "AGENT",

            correlationId:
              "corr-revenue-002",

            occurredAt:
              NOW.toISOString(),
          }),
        );

        const events =
          await system.eventStore.getByCorrelationId(
            "corr-revenue-002",
          );

        const opportunityEvent =
          events.find(
            (event) =>
              event.type ===
              "OPPORTUNITY_CREATED",
          );

        expect(
          opportunityEvent,
        ).toBeDefined();

        expect(
          opportunityEvent!
            .causationId,
        ).toBe(
          "evt-qualified",
        );
      },
    );

    it(
      "automatically executes the revenue intelligence agent",
      async () => {
        const system =
          await createSystem();

        await system.eventBus.publish(
          createDomainEvent({
            id: "evt-qualified",

            type:
              "ACCOUNT_QUALIFIED",

            aggregateType:
              "ACCOUNT",

            aggregateId:
              "acc-warp-target",

            payload: {
              accountId:
                "acc-warp-target",

              warpScore: 82,

              classification:
                "HIGH_PRIORITY",
            },

            source:
              "AGENT",

            correlationId:
              "corr-revenue-003",

            occurredAt:
              NOW.toISOString(),
          }),
        );

        const run =
          await system.agentRunRepository.getById(
            "run-revenue-001",
          );

        expect(run).not.toBeNull();

        expect(run!.agent).toBe(
          "REVENUE_INTELLIGENCE",
        );

       expect(run!.status).toBe(
  "REQUIRES_HUMAN",
);

        expect(
          run!.toolsCalled,
        ).toContain(
          "opportunity_engine",
        );
      },
    );

    it(
      "preserves causation from qualification to opportunity to agent completion",
      async () => {
        const system =
          await createSystem();

        await system.eventBus.publish(
          createDomainEvent({
            id: "evt-qualified",

            type:
              "ACCOUNT_QUALIFIED",

            aggregateType:
              "ACCOUNT",

            aggregateId:
              "acc-warp-target",

            payload: {
              accountId:
                "acc-warp-target",

              warpScore: 82,

              classification:
                "HIGH_PRIORITY",
            },

            source:
              "AGENT",

            correlationId:
              "corr-full-chain",

            occurredAt:
              NOW.toISOString(),
          }),
        );

        const events =
          await system.eventStore.getByCorrelationId(
            "corr-full-chain",
          );

        const opportunityEvent =
          events.find(
            (event) =>
              event.type ===
              "OPPORTUNITY_CREATED",
          );

        const agentEvent =
          events.find(
            (event) =>
              event.type ===
              "AGENT_RUN_COMPLETED",
          );

        expect(
          opportunityEvent,
        ).toBeDefined();

        expect(
          agentEvent,
        ).toBeDefined();

        expect(
          opportunityEvent!
            .causationId,
        ).toBe(
          "evt-qualified",
        );

        expect(
          agentEvent!.causationId,
        ).toBe(
          opportunityEvent!.id,
        );
      },
    );

    it(
      "does nothing when the account cannot be resolved",
      async () => {
        const system =
          await createSystem();

        await system.eventBus.publish(
          createDomainEvent({
            type:
              "ACCOUNT_QUALIFIED",

            aggregateType:
              "ACCOUNT",

            aggregateId:
              "missing-account",

            payload: {
              accountId:
                "missing-account",

              warpScore: 90,

              classification:
                "STRATEGIC",
            },

            source:
              "AGENT",

            correlationId:
              "corr-missing",

            occurredAt:
              NOW.toISOString(),
          }),
        );

        const opportunities =
          await system.opportunityRepository.getAll();

        expect(
          opportunities,
        ).toHaveLength(0);
      },
    );
  },
);