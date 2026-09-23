import {
  DomainEvent,
  DomainEventType,
} from "@/domain/types";

import { EventStore } from "./event-store";

export type EventHandler<T = Record<string, unknown>> = (
  event: DomainEvent<T>,
) => Promise<void> | void;

type HandlerRegistry = Map<
  DomainEventType,
  Set<EventHandler>
>;

export class EventBus {
  private handlers: HandlerRegistry = new Map();

  constructor(private readonly eventStore: EventStore) {}

  subscribe<T = Record<string, unknown>>(
    eventType: DomainEventType,
    handler: EventHandler<T>,
  ): () => void {
    const handlers =
      this.handlers.get(eventType) ?? new Set<EventHandler>();

    handlers.add(handler as EventHandler);
    this.handlers.set(eventType, handlers);

    return () => {
      handlers.delete(handler as EventHandler);

      if (handlers.size === 0) {
        this.handlers.delete(eventType);
      }
    };
  }

  async publish<T = Record<string, unknown>>(
    event: DomainEvent<T>,
  ): Promise<void> {
    await this.eventStore.append(
      event as DomainEvent,
    );

    const handlers = this.handlers.get(event.type);

    if (!handlers || handlers.size === 0) {
      return;
    }

    for (const handler of handlers) {
      await handler(event as DomainEvent);
    }
  }

  listenerCount(eventType: DomainEventType): number {
    return this.handlers.get(eventType)?.size ?? 0;
  }
}