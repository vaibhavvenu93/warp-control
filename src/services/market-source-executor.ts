import type {
  ExternalSourceAdapter,
  IngestionBatchResult,
} from "@/domain/market-radar/ingestion/observation-types";

import type {
  ObservationRepository,
} from "@/repositories/market-radar/observation-repository";

import type {
  SourceHealthRepository,
} from "@/repositories/market-radar/source-health-repository";

import {
  MarketObservationIngestionPipeline,
} from "@/domain/market-radar/ingestion/ingestion-pipeline";

import {
  MonitoredSourceAdapter,
} from "@/domain/market-radar/adapters/monitored-adapter";

export interface MarketSourceExecutionResult {
  sourceId: string;

  ingestion:
    IngestionBatchResult;

  health:
    ReturnType<
      SourceHealthRepository[
        "get"
      ]
    >;
}

export interface MarketSourceExecutorOptions {
  now?: () => Date;

  rejectStale?: boolean;
}

export class MarketSourceExecutor {
  private readonly now:
    () => Date;

  private readonly pipeline:
    MarketObservationIngestionPipeline;

  constructor(
    observationRepository:
      ObservationRepository,

    private readonly healthRepository:
      SourceHealthRepository,

    options:
      MarketSourceExecutorOptions = {},
  ) {
    this.now =
      options.now ??
      (() => new Date());

    this.pipeline =
      new MarketObservationIngestionPipeline(
        observationRepository,
        {
          rejectStale:
            options.rejectStale ??
            false,
        },
      );
  }

  async execute(
    adapter:
      ExternalSourceAdapter,
  ): Promise<
    MarketSourceExecutionResult
  > {
    const monitored =
      new MonitoredSourceAdapter(
        adapter,
        this.healthRepository,
        {
          now:
            this.now,
        },
      );

    const now =
      this.now().toISOString();

    const ingestion =
      await this.pipeline.ingest(
        monitored,
        now,
      );

    return {
      sourceId:
        adapter.source.id,

      ingestion,

      health:
        this.healthRepository.get(
          adapter.source.id,
        ),
    };
  }
}