import type {
  CandidateEvidence,
  CapabilityGap,
  HiringSearch,
  TalentCandidate,
  TalentOwner,
} from "@/domain/talent/types";

export interface TalentRepositorySnapshot {
  owners: TalentOwner[];
  capabilityGaps: CapabilityGap[];
  searches: HiringSearch[];
  candidates: TalentCandidate[];
  evidence: CandidateEvidence[];
}

export interface TalentRepository {
  saveOwner(
    owner: TalentOwner,
  ): Promise<void>;

  saveCapabilityGap(
    gap: CapabilityGap,
  ): Promise<void>;

  saveSearch(
    search: HiringSearch,
  ): Promise<void>;

  saveCandidate(
    candidate: TalentCandidate,
  ): Promise<void>;

  saveEvidence(
    evidence: CandidateEvidence,
  ): Promise<void>;

  getCapabilityGap(
    id: string,
  ): Promise<
    CapabilityGap | undefined
  >;

  getSearch(
    id: string,
  ): Promise<
    HiringSearch | undefined
  >;

  getCandidate(
    id: string,
  ): Promise<
    TalentCandidate | undefined
  >;

  getCandidatesBySearch(
    searchId: string,
  ): Promise<TalentCandidate[]>;

  getEvidenceByCandidate(
    candidateId: string,
  ): Promise<CandidateEvidence[]>;

  getSnapshot():
    Promise<TalentRepositorySnapshot>;
}

function clone<T>(
  value: T,
): T {
  return structuredClone(
    value,
  );
}

export class InMemoryTalentRepository
  implements TalentRepository
{
  private owners =
    new Map<
      string,
      TalentOwner
    >();

  private capabilityGaps =
    new Map<
      string,
      CapabilityGap
    >();

  private searches =
    new Map<
      string,
      HiringSearch
    >();

  private candidates =
    new Map<
      string,
      TalentCandidate
    >();

  private evidence =
    new Map<
      string,
      CandidateEvidence
    >();

  async saveOwner(
    owner: TalentOwner,
  ): Promise<void> {
    this.owners.set(
      owner.id,
      clone(owner),
    );
  }

  async saveCapabilityGap(
    gap: CapabilityGap,
  ): Promise<void> {
    this.capabilityGaps.set(
      gap.id,
      clone(gap),
    );
  }

  async saveSearch(
    search: HiringSearch,
  ): Promise<void> {
    this.searches.set(
      search.id,
      clone(search),
    );
  }

  async saveCandidate(
    candidate: TalentCandidate,
  ): Promise<void> {
    this.candidates.set(
      candidate.id,
      clone(candidate),
    );
  }

  async saveEvidence(
    evidence:
      CandidateEvidence,
  ): Promise<void> {
    this.evidence.set(
      evidence.id,
      clone(evidence),
    );
  }

  async getCapabilityGap(
    id: string,
  ): Promise<
    CapabilityGap | undefined
  > {
    const value =
      this.capabilityGaps.get(
        id,
      );

    return value
      ? clone(value)
      : undefined;
  }

  async getSearch(
    id: string,
  ): Promise<
    HiringSearch | undefined
  > {
    const value =
      this.searches.get(id);

    return value
      ? clone(value)
      : undefined;
  }

  async getCandidate(
    id: string,
  ): Promise<
    TalentCandidate | undefined
  > {
    const value =
      this.candidates.get(
        id,
      );

    return value
      ? clone(value)
      : undefined;
  }

  async getCandidatesBySearch(
    searchId: string,
  ): Promise<TalentCandidate[]> {
    return Array.from(
      this.candidates.values(),
    )
      .filter(
        (candidate) =>
          candidate.searchId ===
          searchId,
      )
      .map(clone);
  }

  async getEvidenceByCandidate(
    candidateId: string,
  ): Promise<CandidateEvidence[]> {
    return Array.from(
      this.evidence.values(),
    )
      .filter(
        (item) =>
          item.candidateId ===
          candidateId,
      )
      .map(clone);
  }

  async getSnapshot():
    Promise<TalentRepositorySnapshot> {
    return {
      owners: Array.from(
        this.owners.values(),
      ).map(clone),

      capabilityGaps:
        Array.from(
          this.capabilityGaps.values(),
        ).map(clone),

      searches: Array.from(
        this.searches.values(),
      ).map(clone),

      candidates:
        Array.from(
          this.candidates.values(),
        ).map(clone),

      evidence: Array.from(
        this.evidence.values(),
      ).map(clone),
    };
  }
}