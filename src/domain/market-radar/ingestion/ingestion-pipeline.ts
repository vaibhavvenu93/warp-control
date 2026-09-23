import type {
  ObservationRepository,
} from "@/repositories/market-radar/observation-repository";

import {
  calculateFreshness,
  isStaleObservation,
} from "./freshness-policy";

import {
  normalizeObservation,
} from "./observation-normalizer";

import type {
  ExternalSourceAdapter,
  IngestionBatchResult,
  MarketObservation,
  ObservationRejection,
  RawObservation,
} from "./observation-types";

function isValidDate(
  value: string,
): boolean {
  return Number.isFinite(
    new Date(
      value,
    ).getTime(),
  );
}

function validateRawObservation(
  raw: RawObservation,
  expectedSourceId: string,
): string | null {
  if (
    !raw.externalId?.trim()
  ) {
    return (
      "Observation externalId is required."
    );
  }

  if (
    raw.sourceId !==
    expectedSourceId
  ) {
    return (
      `Observation sourceId "${raw.sourceId}" does not match adapter source "${expectedSourceId}".`
    );
  }

  if (
    !raw.title?.trim()
  ) {
    return (
      "Observation title is required."
    );
  }

  if (
    !raw.body?.trim()
  ) {
    return (
      "Observation body is required."
    );
  }

  if (
    !raw.observedAt ||
    !isValidDate(
      raw.observedAt,
    )
  ) {
    return (
      "Observation observedAt must be a valid timestamp."
    );
  }

  if (
    raw.publishedAt &&
    !isValidDate(
      raw.publishedAt,
    )
  ) {
    return (
      "Observation publishedAt must be a valid timestamp when supplied."
    );
  }

  return null;
}

export interface IngestionPipelineOptions {
  rejectStale?: boolean;
}

export class MarketObservationIngestionPipeline {
  constructor(
    private readonly repository:
      ObservationRepository,

    private readonly options:
      IngestionPipelineOptions = {
        rejectStale: false,
      },
  ) {}

  async ingest(
    adapter:
      ExternalSourceAdapter,
    now: string,
  ): Promise<IngestionBatchResult> {
    const startedAt =
      now;

    if (
      !adapter.source.enabled
    ) {
      return {
        sourceId:
          adapter.source.id,

        startedAt,
        completedAt:
          now,

        received: 0,
        accepted: 0,
        duplicates: 0,
        stale: 0,
        rejected: 0,

        observations: [],
        rejections: [],
      };
    }

    const rawObservations =
      await adapter.fetch({
        now,
      });

    const accepted:
      MarketObservation[] =
        [];

    const rejections:
      ObservationRejection[] =
        [];

    let duplicates = 0;
    let stale = 0;

    for (
      const raw
      of rawObservations
    ) {
      const validationError =
        validateRawObservation(
          raw,
          adapter.source.id,
        );

      if (
        validationError
      ) {
        rejections.push({
          externalId:
            raw.externalId,
          sourceId:
            raw.sourceId,
          reason:
            validationError,
        });

        continue;
      }

      const normalized =
        normalizeObservation(
          raw,
          adapter.source,
          now,
        );

      normalized.freshness =
        calculateFreshness(
          normalized.publishedAt ??
            normalized.observedAt,
          now,
        );

      const existing =
        this.repository
          .getByFingerprint(
            normalized.fingerprint,
          );

      if (existing) {
        duplicates += 1;
        continue;
      }

      if (
        isStaleObservation(
          normalized.freshness,
        )
      ) {
        stale += 1;

        normalized.state =
          "STALE";

        if (
          this.options
            .rejectStale
        ) {
          continue;
        }
      }

      this.repository.save(
        normalized,
      );

      accepted.push(
        normalized,
      );
    }

    return {
      sourceId:
        adapter.source.id,

      startedAt,

      completedAt:
        now,

      received:
        rawObservations.length,

      accepted:
        accepted.length,

      duplicates,

      stale,

      rejected:
        rejections.length,

      observations:
        accepted,

      rejections,
    };
  }
}