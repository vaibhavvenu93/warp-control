import { DomainEvent } from "@/domain/types";

export interface EventStore {
  append(event: DomainEvent): Promise<void>;
  getAll(): Promise<DomainEvent[]>;
  getByAggregate(
    aggregateType: DomainEvent["aggregateType"],
    aggregateId: string,
  ): Promise<DomainEvent[]>;
  getByCorrelationId(correlationId: string): Promise<DomainEvent[]>;
  clear(): Promise<void>;
}

export class InMemoryEventStore implements EventStore {
  private events: DomainEvent[] = [];

  async append(event: DomainEvent): Promise<void> {
    this.events.push(structuredClone(event));
  }

  async getAll(): Promise<DomainEvent[]> {
    return structuredClone(this.events);
  }

  async getByAggregate(
    aggregateType: DomainEvent["aggregateType"],
    aggregateId: string,
  ): Promise<DomainEvent[]> {
    return structuredClone(
      this.events.filter(
        (event) =>
          event.aggregateType === aggregateType &&
          event.aggregateId === aggregateId,
      ),
    );
  }

  async getByCorrelationId(
    correlationId: string,
  ): Promise<DomainEvent[]> {
    return structuredClone(
      this.events.filter(
        (event) => event.correlationId === correlationId,
      ),
    );
  }

  async clear(): Promise<void> {
    this.events = [];
  }
}