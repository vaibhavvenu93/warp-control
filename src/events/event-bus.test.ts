import { describe, expect, it, vi } from "vitest";

import { createDomainEvent } from "./create-event";
import { EventBus } from "./event-bus";
import { InMemoryEventStore } from "./event-store";

describe("EventBus", () => {
  it("persists every published event", async () => {
    const store = new InMemoryEventStore();
    const bus = new EventBus(store);

    const event = createDomainEvent({
      id: "evt-001",
      type: "SIGNAL_DETECTED",
      aggregateType: "ACCOUNT",
      aggregateId: "acc-001",
      payload: {
        signalId: "sig-001",
      },
      source: "SYSTEM",
      correlationId: "corr-001",
      occurredAt: "2026-09-23T10:00:00.000Z",
    });

    await bus.publish(event);

    const events = await store.getAll();

    expect(events).toHaveLength(1);
    expect(events[0]).toEqual(event);
  });

  it("dispatches an event to its subscribers", async () => {
    const store = new InMemoryEventStore();
    const bus = new EventBus(store);

    const handler = vi.fn();

    bus.subscribe("SIGNAL_DETECTED", handler);

    const event = createDomainEvent({
      id: "evt-002",
      type: "SIGNAL_DETECTED",
      aggregateType: "ACCOUNT",
      aggregateId: "acc-001",
      payload: {
        signalId: "sig-002",
      },
      source: "AGENT",
      correlationId: "corr-002",
      occurredAt: "2026-09-23T10:00:00.000Z",
    });

    await bus.publish(event);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(event);
  });

  it("does not dispatch events to unrelated subscribers", async () => {
    const store = new InMemoryEventStore();
    const bus = new EventBus(store);

    const handler = vi.fn();

    bus.subscribe("ACCOUNT_QUALIFIED", handler);

    await bus.publish(
      createDomainEvent({
        id: "evt-003",
        type: "SIGNAL_DETECTED",
        aggregateType: "ACCOUNT",
        aggregateId: "acc-001",
        payload: {},
        source: "SYSTEM",
        correlationId: "corr-003",
        occurredAt: "2026-09-23T10:00:00.000Z",
      }),
    );

    expect(handler).not.toHaveBeenCalled();
  });

  it("supports unsubscribing handlers", async () => {
    const store = new InMemoryEventStore();
    const bus = new EventBus(store);

    const handler = vi.fn();

    const unsubscribe = bus.subscribe(
      "SIGNAL_DETECTED",
      handler,
    );

    expect(
      bus.listenerCount("SIGNAL_DETECTED"),
    ).toBe(1);

    unsubscribe();

    expect(
      bus.listenerCount("SIGNAL_DETECTED"),
    ).toBe(0);

    await bus.publish(
      createDomainEvent({
        id: "evt-004",
        type: "SIGNAL_DETECTED",
        aggregateType: "ACCOUNT",
        aggregateId: "acc-001",
        payload: {},
        source: "SYSTEM",
        correlationId: "corr-004",
        occurredAt: "2026-09-23T10:00:00.000Z",
      }),
    );

    expect(handler).not.toHaveBeenCalled();
  });

  it("reconstructs an aggregate event history", async () => {
    const store = new InMemoryEventStore();
    const bus = new EventBus(store);

    await bus.publish(
      createDomainEvent({
        id: "evt-005",
        type: "ACCOUNT_DISCOVERED",
        aggregateType: "ACCOUNT",
        aggregateId: "acc-target",
        payload: {},
        source: "SYSTEM",
        correlationId: "corr-account",
        occurredAt: "2026-09-23T10:00:00.000Z",
      }),
    );

    await bus.publish(
      createDomainEvent({
        id: "evt-006",
        type: "SIGNAL_DETECTED",
        aggregateType: "ACCOUNT",
        aggregateId: "acc-target",
        payload: {},
        source: "AGENT",
        correlationId: "corr-account",
        causationId: "evt-005",
        occurredAt: "2026-09-23T10:01:00.000Z",
      }),
    );

    await bus.publish(
      createDomainEvent({
        id: "evt-007",
        type: "ACCOUNT_DISCOVERED",
        aggregateType: "ACCOUNT",
        aggregateId: "acc-other",
        payload: {},
        source: "SYSTEM",
        correlationId: "corr-other",
        occurredAt: "2026-09-23T10:02:00.000Z",
      }),
    );

    const history = await store.getByAggregate(
      "ACCOUNT",
      "acc-target",
    );

    expect(history).toHaveLength(2);
    expect(history.map((event) => event.id)).toEqual([
      "evt-005",
      "evt-006",
    ]);
  });

  it("preserves causation across an event chain", async () => {
    const store = new InMemoryEventStore();
    const bus = new EventBus(store);

    const correlationId = "corr-revenue-chain";

    const discovered = createDomainEvent({
      id: "evt-discovered",
      type: "ACCOUNT_DISCOVERED",
      aggregateType: "ACCOUNT",
      aggregateId: "acc-001",
      payload: {},
      source: "SYSTEM",
      correlationId,
      occurredAt: "2026-09-23T10:00:00.000Z",
    });

    const signal = createDomainEvent({
      id: "evt-signal",
      type: "SIGNAL_DETECTED",
      aggregateType: "ACCOUNT",
      aggregateId: "acc-001",
      payload: {},
      source: "AGENT",
      correlationId,
      causationId: discovered.id,
      occurredAt: "2026-09-23T10:01:00.000Z",
    });

    const qualified = createDomainEvent({
      id: "evt-qualified",
      type: "ACCOUNT_QUALIFIED",
      aggregateType: "ACCOUNT",
      aggregateId: "acc-001",
      payload: {
        warpScore: 78,
      },
      source: "SYSTEM",
      correlationId,
      causationId: signal.id,
      occurredAt: "2026-09-23T10:02:00.000Z",
    });

    await bus.publish(discovered);
    await bus.publish(signal);
    await bus.publish(qualified);

    const chain =
      await store.getByCorrelationId(correlationId);

    expect(chain).toHaveLength(3);

    expect(chain[1].causationId).toBe(
      "evt-discovered",
    );

    expect(chain[2].causationId).toBe(
      "evt-signal",
    );
  });
});