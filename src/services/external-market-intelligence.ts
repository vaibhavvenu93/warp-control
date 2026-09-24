import type {
  ExternalSourceAdapter,
  ExternalSourceDefinition,
} from "@/domain/market-radar/ingestion/observation-types";

import {
  MarketClaimPipeline,
} from "@/domain/market-radar/claims/claim-pipeline";

import type {
  MarketClaim,
} from "@/domain/market-radar/claims/claim-types";

import type {
  ObservationRepository,
} from "@/repositories/market-radar/observation-repository";

import type {
  ClaimRepository,
} from "@/repositories/market-radar/claim-repository";

import type {
  SourceHealthRepository,
} from "@/repositories/market-radar/source-health-repository";

import type {
  KnowledgeRepository,
} from "@/repositories/knowledge/knowledge-repository";

import {
  MarketSourceExecutor,
} from "@/services/market-source-executor";

import {
  MarketKnowledgeBridge,
} from "@/intelligence/market-radar/knowledge-bridge";

export interface ExternalMarketIntelligenceResult {
  sourceId: string;

  observationsAccepted: number;

  observationsRejected: number;

  claimsCreated: number;

  claimsUpdated: number;

  knowledgeClaimsSynced: number;

  knownClaims: number;

  inferredClaims: number;

  sourceHealthStatus:
    | string
    | undefined;

  claims: MarketClaim[];
}

export interface ExternalMarketIntelligenceOptions {
  now?: () => Date;

  rejectStale?: boolean;
}

export class ExternalMarketIntelligence {
  private readonly now:
    () => Date;

  private readonly executor:
    MarketSourceExecutor;

  private readonly claimPipeline:
    MarketClaimPipeline;

  private readonly bridge:
    MarketKnowledgeBridge;

  constructor(
    private readonly observationRepository:
      ObservationRepository,

    claimRepository:
      ClaimRepository,

    healthRepository:
      SourceHealthRepository,

    knowledgeRepository:
      KnowledgeRepository,

    options:
      ExternalMarketIntelligenceOptions = {},
  ) {
    this.now =
      options.now ??
      (() => new Date());

    this.executor =
      new MarketSourceExecutor(
        observationRepository,
        healthRepository,
        {
          now:
            this.now,

          rejectStale:
            options.rejectStale,
        },
      );

    this.claimPipeline =
      new MarketClaimPipeline(
        claimRepository,
      );

    this.bridge =
      new MarketKnowledgeBridge(
        knowledgeRepository,
      );
  }

  async investigate(
    adapter:
      ExternalSourceAdapter,

    source:
      ExternalSourceDefinition,
  ): Promise<
    ExternalMarketIntelligenceResult
  > {
    if (
      adapter.source.id !==
      source.id
    ) {
      throw new Error(
        "Adapter source does not match the registered source definition.",
      );
    }

    const execution =
      await this.executor
        .execute(
          adapter,
        );

    const observations =
      this.observationRepository
        .getBySource(
          source.id,
        );

    const now =
      this.now()
        .toISOString();

    const claimResult =
      this.claimPipeline
        .process(
          observations,
          now,
        );

    const uniqueClaims =
      Array.from(
        new Map(
          claimResult.claims.map(
            (claim) => [
              claim.id,
              claim,
            ],
          ),
        ).values(),
      );

    const bridgeResult =
      await this.bridge.sync({
        claims:
          uniqueClaims,

        sources: [
          source,
        ],

        syncedAt:
          now,
      });

    return {
      sourceId:
        source.id,

      observationsAccepted:
        execution.ingestion
          .accepted,

      observationsRejected:
        execution.ingestion
          .rejected,

      claimsCreated:
        claimResult
          .createdClaims,

      claimsUpdated:
        claimResult
          .updatedClaims,

      knowledgeClaimsSynced:
        bridgeResult
          .claimCount,

      knownClaims:
        bridgeResult
          .knownCount,

      inferredClaims:
        bridgeResult
          .inferredCount,

      sourceHealthStatus:
        execution.health
          ?.status,

      claims:
        uniqueClaims,
    };
  }
}