import {
  DomainEvent,
  DomainEventType,
} from "@/domain/types";

interface CreateEventInput<T> {
  type: DomainEventType;

  aggregateType: DomainEvent["aggregateType"];
  aggregateId: string;

  payload: T;

  source: DomainEvent["source"];

  correlationId?: string;
  causationId?: string;

  occurredAt?: string;
  id?: string;
}

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function createDomainEvent<
  T extends Record<string, unknown>,
>({
  type,
  aggregateType,
  aggregateId,
  payload,
  source,
  correlationId,
  causationId,
  occurredAt,
  id,
}: CreateEventInput<T>): DomainEvent<T> {
  const eventId = id ?? createId("evt");

  return {
    id: eventId,
    type,
    aggregateType,
    aggregateId,
    payload,
    occurredAt: occurredAt ?? new Date().toISOString(),
    correlationId:
      correlationId ?? createId("correlation"),
    causationId,
    source,
  };
}