import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  Account,
  EvidenceRef,
  Signal,
} from "@/domain/types";

import { createDomainEvent } from "@/events/create-event";
import { EventBus } from "@/events/event-bus";
import { InMemoryEventStore } from "@/events/event-store";

import { InMemoryRevenueRepository } from "@/repositories/revenue-repository";

import { RevenueIntelligenceService } from "./revenue-intelligence";

const NOW = new Date(
  "2026-09-23T10:00:00.000Z",
);

function account(): Account {
  return {
    id: "acc-warp",
    name: "AI Engineering Co",
    domain: "example.com",
    stage: "DISCOVERED",

    profile: {
      employeeCount: 800,
      developerCount: 300,
    },

    engineering: {
      repositories: 100,
      estimatedDevelopers: 250,
      ciProvider: "GitHub Actions",
      cloudProvider: "AWS",
      languages: [
        "TypeScript",
        "Python",
        "Go",
      ],
      frameworks: [
        "Next.js",
        "FastAPI",
      ],
      aiCodingSignals: [
        "AI coding adoption",
      ],
    },

    commercial: {
      estimatedACV: 100_000,
      expansionPotential: 90,
      currentSpendEstimate: 90_000,
    },

    signalIds: [
      "sig-ci",
      "sig-ai",
      "sig-buy",
      "sig-growth",
      "sig-infra",
    ],

    evidenceIds: ["ev-account"],

    createdAt:
      "2026-09-01T10:00:00.000Z",

    updatedAt:
      "2026-09-23T09:00:00.000Z",
  };
}

function evidence(): EvidenceRef[] {
  return [
    {
      id: "ev-account",
      type: "CONNECTED",
      source: "Account enrichment",
      capturedAt:
        "2026-09-22T10:00:00.000Z",
      claim:
        "Engineering profile verified.",
      confidence: 95,
    },

    {
      id: "ev-ci",
      type: "CONNECTED",
      source: "CI telemetry",
      capturedAt:
        "2026-09-23T09:00:00.000Z",
      claim:
        "CI feedback-loop pressure detected.",
      confidence: 96,
    },

    {
      id: "ev-ai",
      type: "PUBLIC",
      source: "Engineering research",
      capturedAt:
        "2026-09-22T09:00:00.000Z",
      claim:
        "AI coding adoption detected.",
      confidence: 90,
    },

    {
      id: "ev-buy",
      type: "INTERNAL",
      source: "Product signal",
      capturedAt:
        "2026-09-23T09:30:00.000Z",
      claim:
        "Buying intent detected.",
      confidence: 98,
    },

    {
      id: "ev-growth",
      type: "PUBLIC",
      source: "Hiring signal",
      capturedAt:
        "2026-09-21T10:00:00.000Z",
      claim:
        "Engineering organisation expanding.",
      confidence: 88,
    },

    {
      id: "ev-infra",
      type: "CONNECTED",
      source: "Infrastructure enrichment",
      capturedAt:
        "2026-09-22T10:00:00.000Z",
      claim:
        "Complex CI infrastructure detected.",
      confidence: 92,
    },
  ];
}

function signals(): Signal[] {
  const base = {
    accountId: "acc-warp",
    direction: "POSITIVE" as const,
    confidence: 95,
    detectedAt:
      "2026-09-23T09:00:00.000Z",
  };

  return [
    {
      ...base,
      id: "sig-ci",
      category: "CI_PAIN",
      title: "CI pressure",
      description:
        "High CI feedback-loop pressure.",
      strength: 100,
      evidenceIds: ["ev-ci"],
    },

    {
      ...base,
      id: "sig-ai",
      category: "AI_ADOPTION",
      title: "AI adoption",
      description:
        "AI-assisted engineering detected.",
      strength: 100,
      evidenceIds: ["ev-ai"],
    },

    {
      ...base,
      id: "sig-buy",
      category: "BUYING_INTENT",
      title: "Buying intent",
      description:
        "Strong product or commercial intent.",
      strength: 100,
      evidenceIds: ["ev-buy"],
    },

    {
      ...base,
      id: "sig-growth",
      category: "GROWTH",
      title: "Engineering growth",
      description:
        "Engineering organisation is growing.",
      strength: 100,
      evidenceIds: ["ev-growth"],
    },

    {
      ...base,
      id: "sig-infra",
      category: "INFRASTRUCTURE",
      title: "Infrastructure complexity",
      description:
        "Complex infrastructure detected.",
      strength: 100,
      evidenceIds: ["ev-infra"],
    },
  ];
}

function setup() {
  const store =
    new InMemoryEventStore();

  const bus =
    new EventBus(store);

  const repository =
    new InMemoryRevenueRepository();

  repository.seedAccount(account());
  repository.seedSignals(
    "acc-warp",
    signals(),
  );
  repository.seedEvidence(
    "acc-warp",
    evidence(),
  );

  const service =
    new RevenueIntelligenceService(
      repository,
      bus,
      () => NOW,
    );

  service.register();

  return {
    store,
    bus,
    repository,
  };
}

describe(
  "RevenueIntelligenceService",
  () => {
    it(
      "recalculates WarpScore when a signal is detected",
      async () => {
        const {
          bus,
          repository,
        } = setup();

        await bus.publish(
          createDomainEvent({
            id: "evt-signal",
            type: "SIGNAL_DETECTED",
            aggregateType: "ACCOUNT",
            aggregateId: "acc-warp",

            payload: {
              signalId: "sig-ci",
            },

            source: "AGENT",
            correlationId:
              "corr-revenue",
            occurredAt:
              NOW.toISOString(),
          }),
        );

        const score =
          await repository.getWarpScore(
            "acc-warp",
          );

        expect(score).not.toBeNull();
        expect(score!.score).toBeGreaterThan(
          55,
        );
      },
    );

    it(
      "emits a score change with preserved causation",
      async () => {
        const {
          bus,
          store,
        } = setup();

        await bus.publish(
          createDomainEvent({
            id: "evt-origin",
            type: "SIGNAL_DETECTED",
            aggregateType: "ACCOUNT",
            aggregateId: "acc-warp",

            payload: {
              signalId: "sig-buy",
            },

            source: "AGENT",
            correlationId:
              "corr-chain",
            occurredAt:
              NOW.toISOString(),
          }),
        );

        const chain =
          await store.getByCorrelationId(
            "corr-chain",
          );

        const scoreChanged =
          chain.find(
            (event) =>
              event.type ===
              "WARP_SCORE_CHANGED",
          );

        expect(
          scoreChanged,
        ).toBeDefined();

        expect(
          scoreChanged!.causationId,
        ).toBe("evt-origin");
      },
    );

    it(
      "qualifies an account when it crosses the qualification threshold",
      async () => {
        const {
          bus,
          store,
        } = setup();

        await bus.publish(
          createDomainEvent({
            id: "evt-qualify",
            type: "SIGNAL_DETECTED",
            aggregateType: "ACCOUNT",
            aggregateId: "acc-warp",

            payload: {
              signalId: "sig-ci",
            },

            source: "AGENT",
            correlationId:
              "corr-qualify",
            occurredAt:
              NOW.toISOString(),
          }),
        );

        const events =
          await store.getByCorrelationId(
            "corr-qualify",
          );

        expect(
          events.some(
            (event) =>
              event.type ===
              "ACCOUNT_QUALIFIED",
          ),
        ).toBe(true);
      },
    );

    it(
      "creates a CEO decision when the account crosses high priority",
      async () => {
        const {
          bus,
          store,
        } = setup();

        await bus.publish(
          createDomainEvent({
            id: "evt-priority",
            type: "SIGNAL_DETECTED",
            aggregateType: "ACCOUNT",
            aggregateId: "acc-warp",

            payload: {
              signalId: "sig-buy",
            },

            source: "AGENT",
            correlationId:
              "corr-priority",
            occurredAt:
              NOW.toISOString(),
          }),
        );

        const events =
          await store.getByCorrelationId(
            "corr-priority",
          );

        const decision =
          events.find(
            (event) =>
              event.type ===
              "DECISION_REQUIRED",
          );

        expect(decision).toBeDefined();
      },
    );

    it(
      "does not repeatedly qualify an account already above threshold",
      async () => {
        const {
          bus,
          store,
        } = setup();

        const first =
          createDomainEvent({
            id: "evt-first",
            type: "SIGNAL_DETECTED",
            aggregateType: "ACCOUNT",
            aggregateId: "acc-warp",
            payload: {
              signalId: "sig-ci",
            },
            source: "AGENT",
            correlationId:
              "corr-first",
            occurredAt:
              NOW.toISOString(),
          });

        await bus.publish(first);

        const second =
          createDomainEvent({
            id: "evt-second",
            type: "SIGNAL_DETECTED",
            aggregateType: "ACCOUNT",
            aggregateId: "acc-warp",
            payload: {
              signalId: "sig-ai",
            },
            source: "AGENT",
            correlationId:
              "corr-second",
            occurredAt:
              NOW.toISOString(),
          });

        await bus.publish(second);

        const all =
          await store.getAll();

        const qualifications =
          all.filter(
            (event) =>
              event.type ===
              "ACCOUNT_QUALIFIED",
          );

        expect(
          qualifications,
        ).toHaveLength(1);
      },
    );

    it(
      "does nothing when the account does not exist",
      async () => {
        const store =
          new InMemoryEventStore();

        const bus =
          new EventBus(store);

        const repository =
          new InMemoryRevenueRepository();

        const service =
          new RevenueIntelligenceService(
            repository,
            bus,
            () => NOW,
          );

        service.register();

        const scoreListener = vi.fn();

        bus.subscribe(
          "WARP_SCORE_CHANGED",
          scoreListener,
        );

        await bus.publish(
          createDomainEvent({
            id: "evt-missing",
            type: "SIGNAL_DETECTED",
            aggregateType: "ACCOUNT",
            aggregateId:
              "does-not-exist",
            payload: {
              signalId: "sig-unknown",
            },
            source: "SYSTEM",
            correlationId:
              "corr-missing",
            occurredAt:
              NOW.toISOString(),
          }),
        );

        expect(
          scoreListener,
        ).not.toHaveBeenCalled();
      },
    );
  },
);