import { DomainEvent } from "@/domain/types";

import { createDomainEvent } from "@/events/create-event";
import { EventBus } from "@/events/event-bus";

import { calculateWarpScore } from "@/intelligence/scoring/warp-score";

import { RevenueRepository } from "@/repositories/revenue-repository";

interface SignalDetectedPayload
  extends Record<string, unknown> {
  signalId: string;
}

const QUALIFIED_THRESHOLD = 55;
const HIGH_PRIORITY_THRESHOLD = 70;

export class RevenueIntelligenceService {
  constructor(
    private readonly repository: RevenueRepository,
    private readonly eventBus: EventBus,
    private readonly now: () => Date = () => new Date(),
  ) {}

  register(): () => void {
    return this.eventBus.subscribe<SignalDetectedPayload>(
      "SIGNAL_DETECTED",
      (event) =>
        this.handleSignalDetected(event),
    );
  }

  async handleSignalDetected(
    event: DomainEvent<SignalDetectedPayload>,
  ): Promise<void> {
    const accountId =
      event.aggregateId;

    const [
      account,
      signals,
      evidence,
      previousScore,
    ] = await Promise.all([
      this.repository.getAccount(accountId),
      this.repository.getSignalsForAccount(
        accountId,
      ),
      this.repository.getEvidenceForAccount(
        accountId,
      ),
      this.repository.getWarpScore(accountId),
    ]);

    if (!account) {
      return;
    }

    const nextScore =
      calculateWarpScore({
        account,
        signals,
        evidence,
        now: this.now(),
      });

    await this.repository.saveWarpScore(
      nextScore,
    );

    const previousValue =
      previousScore?.score ?? 0;

    if (
      previousValue !==
      nextScore.score
    ) {
      await this.eventBus.publish(
        createDomainEvent({
          type:
            "WARP_SCORE_CHANGED",

          aggregateType:
            "ACCOUNT",

          aggregateId:
            accountId,

          payload: {
            accountId,

            previousScore:
              previousValue,

            nextScore:
              nextScore.score,

            classification:
              nextScore.classification,

            confidence:
              nextScore.confidence,

            version:
              nextScore.version,
          },

          source: "SYSTEM",

          correlationId:
            event.correlationId,

          causationId:
            event.id,

          occurredAt:
            this.now().toISOString(),
        }),
      );
    }

    const crossedQualifiedThreshold =
      previousValue <
        QUALIFIED_THRESHOLD &&
      nextScore.score >=
        QUALIFIED_THRESHOLD;

    if (
      crossedQualifiedThreshold
    ) {
      await this.eventBus.publish(
        createDomainEvent({
          type:
            "ACCOUNT_QUALIFIED",

          aggregateType:
            "ACCOUNT",

          aggregateId:
            accountId,

          payload: {
            accountId,

            warpScore:
              nextScore.score,

            score:
              nextScore.score,

            confidence:
              nextScore.confidence,

            classification:
              nextScore.classification,
          },

          source: "SYSTEM",

          correlationId:
            event.correlationId,

          causationId:
            event.id,

          occurredAt:
            this.now().toISOString(),
        }),
      );
    }

    const crossedHighPriorityThreshold =
      previousValue <
        HIGH_PRIORITY_THRESHOLD &&
      nextScore.score >=
        HIGH_PRIORITY_THRESHOLD;

    if (
      crossedHighPriorityThreshold
    ) {
      await this.eventBus.publish(
        createDomainEvent({
          type:
            "DECISION_REQUIRED",

          aggregateType:
            "ACCOUNT",

          aggregateId:
            accountId,

          payload: {
            accountId,

            decision:
              "Review high-priority WarpBuild account",

            score:
              nextScore.score,

            confidence:
              nextScore.confidence,

            classification:
              nextScore.classification,

            reason:
              "Account crossed the high-priority WarpScore threshold.",
          },

          source: "SYSTEM",

          correlationId:
            event.correlationId,

          causationId:
            event.id,

          occurredAt:
            this.now().toISOString(),
        }),
      );
    }
  }
}