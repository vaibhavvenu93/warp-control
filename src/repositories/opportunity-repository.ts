import { Opportunity } from "@/domain/types";

export interface OpportunityRepository {
  save(
    opportunity: Opportunity,
  ): Promise<void>;

  getById(
    opportunityId: string,
  ): Promise<Opportunity | null>;

  getByAccountId(
    accountId: string,
  ): Promise<Opportunity[]>;

  getAll(): Promise<Opportunity[]>;
}

export class InMemoryOpportunityRepository
  implements OpportunityRepository
{
  private readonly opportunities =
    new Map<string, Opportunity>();

  async save(
    opportunity: Opportunity,
  ): Promise<void> {
    this.opportunities.set(
      opportunity.id,
      structuredClone(opportunity),
    );
  }

  async getById(
    opportunityId: string,
  ): Promise<Opportunity | null> {
    const opportunity =
      this.opportunities.get(
        opportunityId,
      );

    return opportunity
      ? structuredClone(opportunity)
      : null;
  }

  async getByAccountId(
    accountId: string,
  ): Promise<Opportunity[]> {
    return [
      ...this.opportunities.values(),
    ]
      .filter(
        (opportunity) =>
          opportunity.accountId ===
          accountId,
      )
      .map((opportunity) =>
        structuredClone(opportunity),
      );
  }

  async getAll(): Promise<
    Opportunity[]
  > {
    return [
      ...this.opportunities.values(),
    ].map((opportunity) =>
      structuredClone(opportunity),
    );
  }
}