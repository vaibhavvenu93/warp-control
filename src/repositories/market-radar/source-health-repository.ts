import type {
  SourceFetchAttempt,
  SourceHealth,
} from "@/domain/market-radar/adapters/source-health";

import {
  applyFetchAttempt,
  emptySourceHealth,
} from "@/domain/market-radar/adapters/source-health";

import type {
  ExternalSourceDefinition,
} from "@/domain/market-radar/ingestion/observation-types";

export interface SourceHealthRepository {
  record(
    source: ExternalSourceDefinition,
    attempt: SourceFetchAttempt,
  ): void;

  get(
    sourceId: string,
  ):
    | SourceHealth
    | undefined;

  getAll():
    SourceHealth[];

  clear(): void;
}

export class InMemorySourceHealthRepository
  implements SourceHealthRepository {
  private readonly health =
    new Map<
      string,
      SourceHealth
    >();

  record(
    source: ExternalSourceDefinition,
    attempt: SourceFetchAttempt,
  ): void {
    const current =
      this.health.get(
        source.id,
      ) ??
      emptySourceHealth(
        source.id,
        source.name,
        source.kind,
      );

    this.health.set(
      source.id,
      applyFetchAttempt(
        current,
        attempt,
      ),
    );
  }

  get(
    sourceId: string,
  ):
    | SourceHealth
    | undefined {
    return this.health.get(
      sourceId,
    );
  }

  getAll():
    SourceHealth[] {
    return Array.from(
      this.health.values(),
    ).sort(
      (
        left,
        right,
      ) =>
        (
          right.lastAttemptAt ??
          ""
        ).localeCompare(
          left.lastAttemptAt ??
            "",
        ),
    );
  }

  clear(): void {
    this.health.clear();
  }
}