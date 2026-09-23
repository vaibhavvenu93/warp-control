import {
  Account,
  EvidenceRef,
  Signal,
  WarpScore,
} from "@/domain/types";

export interface RevenueRepository {
  getAccount(accountId: string): Promise<Account | null>;

  getSignalsForAccount(
    accountId: string,
  ): Promise<Signal[]>;

  getEvidenceForAccount(
    accountId: string,
  ): Promise<EvidenceRef[]>;

  getWarpScore(
    accountId: string,
  ): Promise<WarpScore | null>;

  saveWarpScore(score: WarpScore): Promise<void>;
}

export class InMemoryRevenueRepository
  implements RevenueRepository
{
  private accounts = new Map<string, Account>();
  private signals = new Map<string, Signal[]>();
  private evidence = new Map<string, EvidenceRef[]>();
  private scores = new Map<string, WarpScore>();

  seedAccount(account: Account): void {
    this.accounts.set(
      account.id,
      structuredClone(account),
    );
  }

  seedSignals(
    accountId: string,
    signals: Signal[],
  ): void {
    this.signals.set(
      accountId,
      structuredClone(signals),
    );
  }

  seedEvidence(
    accountId: string,
    evidence: EvidenceRef[],
  ): void {
    this.evidence.set(
      accountId,
      structuredClone(evidence),
    );
  }

  async getAccount(
    accountId: string,
  ): Promise<Account | null> {
    const account = this.accounts.get(accountId);

    return account
      ? structuredClone(account)
      : null;
  }

  async getSignalsForAccount(
    accountId: string,
  ): Promise<Signal[]> {
    return structuredClone(
      this.signals.get(accountId) ?? [],
    );
  }

  async getEvidenceForAccount(
    accountId: string,
  ): Promise<EvidenceRef[]> {
    return structuredClone(
      this.evidence.get(accountId) ?? [],
    );
  }

  async getWarpScore(
    accountId: string,
  ): Promise<WarpScore | null> {
    const score = this.scores.get(accountId);

    return score
      ? structuredClone(score)
      : null;
  }

  async saveWarpScore(
    score: WarpScore,
  ): Promise<void> {
    this.scores.set(
      score.accountId,
      structuredClone(score),
    );
  }
}