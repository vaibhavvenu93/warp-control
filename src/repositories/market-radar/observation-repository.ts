import type {
  MarketObservation,
} from "@/domain/market-radar/ingestion/observation-types";

export interface ObservationRepository {
  save(
    observation:
      MarketObservation,
  ): void;

  saveMany(
    observations:
      MarketObservation[],
  ): void;

  get(
    id: string,
  ):
    | MarketObservation
    | undefined;

  getByFingerprint(
    fingerprint: string,
  ):
    | MarketObservation
    | undefined;

  getBySource(
    sourceId: string,
  ): MarketObservation[];

  getAll():
    MarketObservation[];

  count(): number;

  clear(): void;
}

export class InMemoryObservationRepository
  implements
    ObservationRepository {
  private readonly observations =
    new Map<
      string,
      MarketObservation
    >();

  private readonly fingerprintIndex =
    new Map<
      string,
      string
    >();

  save(
    observation:
      MarketObservation,
  ): void {
    this.observations.set(
      observation.id,
      observation,
    );

    this.fingerprintIndex.set(
      observation.fingerprint,
      observation.id,
    );
  }

  saveMany(
    observations:
      MarketObservation[],
  ): void {
    for (
      const observation
      of observations
    ) {
      this.save(
        observation,
      );
    }
  }

  get(
    id: string,
  ):
    | MarketObservation
    | undefined {
    return this.observations.get(
      id,
    );
  }

  getByFingerprint(
    fingerprint: string,
  ):
    | MarketObservation
    | undefined {
    const id =
      this.fingerprintIndex.get(
        fingerprint,
      );

    if (!id) {
      return undefined;
    }

    return this.get(id);
  }

  getBySource(
    sourceId: string,
  ): MarketObservation[] {
    return this.getAll().filter(
      (observation) =>
        observation.sourceId ===
        sourceId,
    );
  }

  getAll():
    MarketObservation[] {
    return Array.from(
      this.observations.values(),
    ).sort(
      (
        left,
        right,
      ) =>
        new Date(
          right.observedAt,
        ).getTime() -
        new Date(
          left.observedAt,
        ).getTime(),
    );
  }

  count(): number {
    return (
      this.observations.size
    );
  }

  clear(): void {
    this.observations.clear();
    this.fingerprintIndex.clear();
  }
}