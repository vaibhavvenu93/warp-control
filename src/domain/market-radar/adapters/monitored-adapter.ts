import type {
  ExternalSourceAdapter,
  RawObservation,
  SourceAdapterContext,
} from "@/domain/market-radar/ingestion/observation-types";

import type {
  SourceHealthRepository,
} from "@/repositories/market-radar/source-health-repository";

export interface MonitoredAdapterOptions {
  now?: () => Date;

  createAttemptId?:
    () => string;
}

export class MonitoredSourceAdapter
  implements ExternalSourceAdapter {
  readonly source;

  private readonly now:
    () => Date;

  private readonly createAttemptId:
    () => string;

  constructor(
    private readonly adapter:
      ExternalSourceAdapter,

    private readonly healthRepository:
      SourceHealthRepository,

    options:
      MonitoredAdapterOptions = {},
  ) {
    this.source =
      adapter.source;

    this.now =
      options.now ??
      (() => new Date());

    this.createAttemptId =
      options
        .createAttemptId ??
      (() =>
        `fetch-${crypto.randomUUID()}`);
  }

  async fetch(
    context:
      SourceAdapterContext,
  ): Promise<
    RawObservation[]
  > {
    const started =
      this.now();

    try {
      const observations =
        await this.adapter.fetch(
          context,
        );

      const completed =
        this.now();

      this.healthRepository.record(
        this.source,
        {
          id:
            this.createAttemptId(),

          sourceId:
            this.source.id,

          sourceName:
            this.source.name,

          sourceKind:
            this.source.kind,

          startedAt:
            started.toISOString(),

          completedAt:
            completed.toISOString(),

          latencyMs:
            Math.max(
              0,
              completed.getTime() -
                started.getTime(),
            ),

          success: true,

          observationsReceived:
            observations.length,
        },
      );

      return observations;
    } catch (error) {
      const completed =
        this.now();

      const message =
        error instanceof Error
          ? error.message
          : "Unknown external source failure.";

      this.healthRepository.record(
        this.source,
        {
          id:
            this.createAttemptId(),

          sourceId:
            this.source.id,

          sourceName:
            this.source.name,

          sourceKind:
            this.source.kind,

          startedAt:
            started.toISOString(),

          completedAt:
            completed.toISOString(),

          latencyMs:
            Math.max(
              0,
              completed.getTime() -
                started.getTime(),
            ),

          success: false,

          observationsReceived: 0,

          error:
            message,
        },
      );

      throw error;
    }
  }
}