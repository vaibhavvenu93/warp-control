import {
  InMemoryAgentRunRepository,
} from "@/agents/contracts/agent";

import { AgentRuntime } from "@/agents/runtime/agent-runtime";

import {
  DEMO_ACCOUNT_ID,
  DEMO_CORRELATION_ID,
  DEMO_NOW,
  demoAccount,
  demoEvidence,
  demoSignals,
} from "@/data/demo/revenue-scenario";

import { createDomainEvent } from "@/events/create-event";
import { EventBus } from "@/events/event-bus";
import { InMemoryEventStore } from "@/events/event-store";

import { InMemoryOpportunityRepository } from "@/repositories/opportunity-repository";
import { InMemoryRevenueRepository } from "@/repositories/revenue-repository";

import {
  buildControlPlaneDecisions,
  ControlPlaneSnapshot,
} from "@/presentation/control-plane-snapshot";

import { OpportunityOrchestrator } from "@/services/opportunity-orchestrator";
import { RevenueIntelligenceService } from "@/services/revenue-intelligence";

export async function buildRevenueDemo(): Promise<ControlPlaneSnapshot> {
  const eventStore =
    new InMemoryEventStore();

  const eventBus =
    new EventBus(
      eventStore,
    );

  const revenueRepository =
    new InMemoryRevenueRepository();

  const opportunityRepository =
    new InMemoryOpportunityRepository();

  const agentRunRepository =
    new InMemoryAgentRunRepository();

  revenueRepository.seedAccount(
    demoAccount,
  );

  revenueRepository.seedSignals(
    DEMO_ACCOUNT_ID,
    demoSignals,
  );

  revenueRepository.seedEvidence(
    DEMO_ACCOUNT_ID,
    demoEvidence,
  );

  const agentRuntime =
    new AgentRuntime(
      agentRunRepository,
      eventBus,
      {
        now: () =>
          DEMO_NOW,

        createRunId: () =>
          "run-demo-revenue-001",
      },
    );

  const revenueIntelligence =
    new RevenueIntelligenceService(
      revenueRepository,
      eventBus,
      () => DEMO_NOW,
    );

  const opportunityOrchestrator =
    new OpportunityOrchestrator(
      revenueRepository,
      opportunityRepository,
      eventBus,
      agentRuntime,
      () => DEMO_NOW,
    );

  const unregisterRevenue =
    revenueIntelligence.register();

  const unregisterOpportunity =
    opportunityOrchestrator.register();

  try {
    await eventBus.publish(
      createDomainEvent({
        id:
          "evt-demo-signal-001",

        type:
          "SIGNAL_DETECTED",

        aggregateType:
          "SIGNAL",

        aggregateId:
          DEMO_ACCOUNT_ID,

        payload: {
          signalId:
            "sig-buying",
        },

        source:
          "INTEGRATION",

        correlationId:
          DEMO_CORRELATION_ID,

        occurredAt:
          DEMO_NOW.toISOString(),
      }),
    );

    const warpScore =
      await revenueRepository.getWarpScore(
        DEMO_ACCOUNT_ID,
      );

    if (!warpScore) {
      throw new Error(
        "Control plane failed to calculate a WarpScore.",
      );
    }

    const opportunities =
      await opportunityRepository.getByAccountId(
        DEMO_ACCOUNT_ID,
      );

    const agentRuns =
      await agentRunRepository.getByCorrelationId(
        DEMO_CORRELATION_ID,
      );

    const events =
      await eventStore.getByCorrelationId(
        DEMO_CORRELATION_ID,
      );

    const decisions =
      buildControlPlaneDecisions(
        events,
        agentRuns,
      );

    return {
      generatedAt:
        DEMO_NOW.toISOString(),

      scenario: {
        name:
          "Revenue Intelligence Control Plane",

        mode:
          "DETERMINISTIC_DEMO",

        disclaimer:
          "Synthetic demonstration account. PUBLIC, MODELED and ASSUMED evidence labels describe provenance; no WarpBuild customer or revenue data is implied.",
      },

      account:
        structuredClone(
          demoAccount,
        ),

      signals:
        structuredClone(
          demoSignals,
        ),

      evidence:
        structuredClone(
          demoEvidence,
        ),

      warpScore,

      opportunity:
        opportunities[0] ??
        null,

      agentRuns,

      decisions,

      events,

      telemetry: {
        eventCount:
          events.length,

        agentRunCount:
          agentRuns.length,

        evidenceCount:
          demoEvidence.length,

        signalCount:
          demoSignals.length,

        humanReviewCount:
          agentRuns.filter(
            (run) =>
              run.status ===
              "REQUIRES_HUMAN",
          ).length,

        correlationId:
          DEMO_CORRELATION_ID,
      },
    };
  } finally {
    unregisterOpportunity();
    unregisterRevenue();
  }
}