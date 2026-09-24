import type {
  CommunicationApproval,
  CommunicationBrief,
  CommunicationClaim,
  CommunicationSection,
  CommunicationSource,
} from "@/domain/communications/types";

export interface CommunicationsRepositorySnapshot {
  sources: CommunicationSource[];
  claims: CommunicationClaim[];
  sections: CommunicationSection[];
  briefs: CommunicationBrief[];
  approvals: CommunicationApproval[];
}

export interface CommunicationsRepository {
  getSnapshot(): Promise<CommunicationsRepositorySnapshot>;

  saveSource(
    source: CommunicationSource,
  ): Promise<void>;

  saveClaim(
    claim: CommunicationClaim,
  ): Promise<void>;

  saveSection(
    section: CommunicationSection,
  ): Promise<void>;

  saveBrief(
    brief: CommunicationBrief,
  ): Promise<void>;

  saveApproval(
    approval: CommunicationApproval,
  ): Promise<void>;

  getBrief(
    id: string,
  ): Promise<
    CommunicationBrief | undefined
  >;
}

export class InMemoryCommunicationsRepository
  implements CommunicationsRepository
{
  private sources =
    new Map<
      string,
      CommunicationSource
    >();

  private claims =
    new Map<
      string,
      CommunicationClaim
    >();

  private sections =
    new Map<
      string,
      CommunicationSection
    >();

  private briefs =
    new Map<
      string,
      CommunicationBrief
    >();

  private approvals =
    new Map<
      string,
      CommunicationApproval
    >();

  constructor(
    seed?: Partial<CommunicationsRepositorySnapshot>,
  ) {
    for (
      const source of
      seed?.sources ?? []
    ) {
      this.sources.set(
        source.id,
        structuredClone(source),
      );
    }

    for (
      const claim of
      seed?.claims ?? []
    ) {
      this.claims.set(
        claim.id,
        structuredClone(claim),
      );
    }

    for (
      const section of
      seed?.sections ?? []
    ) {
      this.sections.set(
        section.id,
        structuredClone(section),
      );
    }

    for (
      const brief of
      seed?.briefs ?? []
    ) {
      this.briefs.set(
        brief.id,
        structuredClone(brief),
      );
    }

    for (
      const approval of
      seed?.approvals ?? []
    ) {
      this.approvals.set(
        approval.id,
        structuredClone(
          approval,
        ),
      );
    }
  }

  async getSnapshot(): Promise<CommunicationsRepositorySnapshot> {
    return structuredClone({
      sources: [
        ...this.sources.values(),
      ],

      claims: [
        ...this.claims.values(),
      ],

      sections: [
        ...this.sections.values(),
      ],

      briefs: [
        ...this.briefs.values(),
      ],

      approvals: [
        ...this.approvals.values(),
      ],
    });
  }

  async saveSource(
    source: CommunicationSource,
  ): Promise<void> {
    this.sources.set(
      source.id,
      structuredClone(source),
    );
  }

  async saveClaim(
    claim: CommunicationClaim,
  ): Promise<void> {
    this.claims.set(
      claim.id,
      structuredClone(claim),
    );
  }

  async saveSection(
    section: CommunicationSection,
  ): Promise<void> {
    this.sections.set(
      section.id,
      structuredClone(section),
    );
  }

  async saveBrief(
    brief: CommunicationBrief,
  ): Promise<void> {
    this.briefs.set(
      brief.id,
      structuredClone(brief),
    );
  }

  async saveApproval(
    approval: CommunicationApproval,
  ): Promise<void> {
    this.approvals.set(
      approval.id,
      structuredClone(approval),
    );
  }

  async getBrief(
    id: string,
  ): Promise<
    CommunicationBrief | undefined
  > {
    const brief =
      this.briefs.get(id);

    return brief
      ? structuredClone(brief)
      : undefined;
  }
}