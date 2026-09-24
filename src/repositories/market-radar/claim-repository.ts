import type {
  MarketClaim,
} from "@/domain/market-radar/claims/claim-types";

export interface ClaimRepository {
  save(
    claim: MarketClaim,
  ): void;

  get(
    id: string,
  ):
    | MarketClaim
    | undefined;

  getByFingerprint(
    fingerprint: string,
  ):
    | MarketClaim
    | undefined;

  getBySubject(
    normalizedSubject: string,
  ): MarketClaim[];

  getAll():
    MarketClaim[];

  count(): number;

  clear(): void;
}

export class InMemoryClaimRepository
  implements ClaimRepository {
  private readonly claims =
    new Map<
      string,
      MarketClaim
    >();

  private readonly fingerprintIndex =
    new Map<
      string,
      string
    >();

  save(
    claim: MarketClaim,
  ): void {
    this.claims.set(
      claim.id,
      claim,
    );

    this.fingerprintIndex.set(
      claim.fingerprint,
      claim.id,
    );
  }

  get(
    id: string,
  ):
    | MarketClaim
    | undefined {
    return this.claims.get(
      id,
    );
  }

  getByFingerprint(
    fingerprint: string,
  ):
    | MarketClaim
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

  getBySubject(
    normalizedSubject: string,
  ): MarketClaim[] {
    const subject =
      normalizedSubject
        .trim()
        .toLowerCase();

    return this.getAll().filter(
      (claim) =>
        claim.normalizedSubject ===
        subject,
    );
  }

  getAll():
    MarketClaim[] {
    return Array.from(
      this.claims.values(),
    ).sort(
      (
        left,
        right,
      ) =>
        right.confidence -
        left.confidence,
    );
  }

  count(): number {
    return this.claims.size;
  }

  clear(): void {
    this.claims.clear();
    this.fingerprintIndex.clear();
  }
}