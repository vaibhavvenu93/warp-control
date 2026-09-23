import {
  EvidenceRef,
  Opportunity,
} from "@/domain/types";

import {
  RevenueIntelligenceInput,
  revenueIntelligenceAgent,
} from "@/agents/revenue-intelligence-agent";

import { AgentRuntime } from "@/agents/runtime/agent-runtime";

import { createDomainEvent } from "@/events/create-event";
import {
  EventBus,
  EventHandler,
} from "@/events/event-bus";

import { generateOpportunity } from "@/intelligence/recommendations/opportunity-engine";

import { OpportunityRepository } from "@/repositories/opportunity-repository";
import { RevenueRepository } from "@/repositories/revenue-repository";

export interface AccountQualifiedPayload
  extends Record<string, unknown> {
  accountId: string;
  warpScore: number;
  classification: string;
}

export class OpportunityOrchestrator {
  private unsubscribe?: () => void;

  constructor(
    private readonly revenueRepository: RevenueRepository,

    private readonly opportunityRepository: OpportunityRepository,

    private readonly eventBus: EventBus,

    private readonly agentRuntime: AgentRuntime,

    private readonly now: () => Date = () =>
      new Date(),
  ) {}

  register(): () => void {
    if (this.unsubscribe) {
      return this.unsubscribe;
    }

    const handler: EventHandler<
      AccountQualifiedPayload
    > = async (event) => {
      await this.handleAccountQualified(
        event,
      );
    };

    this.unsubscribe =
      this.eventBus.subscribe(
        "ACCOUNT_QUALIFIED",
        handler,
      );

    return () => {
      this.unsubscribe?.();
      this.unsubscribe = undefined;
    };
  }

  private async handleAccountQualified(
    event: Parameters<
      EventHandler<AccountQualifiedPayload>
    >[0],
  ): Promise<void> {
    const accountId =
      event.payload.accountId;

    const account =
      await this.revenueRepository.getAccount(
        accountId,
      );

    if (!account) {
      return;
    }

    const warpScore =
      await this.revenueRepository.getWarpScore(
        accountId,
      );

    if (!warpScore) {
      return;
    }

    const signals =
      await this.revenueRepository.getSignalsForAccount(
        accountId,
      );

    const evidence =
      await this.revenueRepository.getEvidenceForAccount(
        accountId,
      );

    const generated =
      generateOpportunity({
        account,
        signals,
        evidence,
        warpScore,
        now: this.now(),
      });

    await this.opportunityRepository.save(
      generated.opportunity,
    );

    const opportunityEvent =
      createDomainEvent({
        type: "OPPORTUNITY_CREATED",

        aggregateType:
          "OPPORTUNITY",

        aggregateId:
          generated.opportunity.id,

        payload: {
          opportunityId:
            generated.opportunity.id,

          accountId,

          estimatedACV:
            generated.opportunity
              .estimatedACV,

          probability:
            generated.opportunity
              .probability,

          expectedValue:
            generated.opportunity
              .expectedValue,

          recommendedMotion:
            generated.opportunity
              .recommendedMotion,

          confidence:
            generated.opportunity
              .confidence,
        },

        source:
  "SYSTEM",

        correlationId:
          event.correlationId,

        causationId: event.id,

        occurredAt:
          this.now().toISOString(),
      });

    await this.eventBus.publish(
      opportunityEvent,
    );

    const agentInput: RevenueIntelligenceInput =
      {
        account,

        opportunity:
          generated.opportunity,

        warpScore,

        missingInformation:
          generated.explanation
            .missingInformation,

        scoreDrivers:
          generated.explanation
            .scoreDrivers,

        supportingSignals:
          generated.explanation
            .supportingSignals,
      };

    await this.agentRuntime.execute({
      agent:
        revenueIntelligenceAgent,

      trigger:
        "OPPORTUNITY_CREATED",

      execution: {
        input: agentInput,

        context: {
          correlationId:
            event.correlationId,

          causationId:
            opportunityEvent.id,

          accountId,

          opportunityId:
            generated.opportunity.id,

          evidence:
            this.resolveOpportunityEvidence(
              generated.opportunity,
              evidence,
            ),

          metadata: {
            opportunityEngineVersion:
              generated.explanation
                .engineVersion,

            primaryProblem:
              generated.explanation
                .primaryProblem,
          },
        },
      },
    });
  }

  private resolveOpportunityEvidence(
    opportunity: Opportunity,
    evidence: EvidenceRef[],
  ): EvidenceRef[] {
    const ids = new Set(
      opportunity.evidenceIds,
    );

    return evidence.filter(
      (item) => ids.has(item.id),
    );
  }
}