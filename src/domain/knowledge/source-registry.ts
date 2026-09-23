import {
  KnowledgeProvenance,
  KnowledgeSource,
  KnowledgeSourceType,
} from "@/domain/knowledge/types";

const PROVENANCE_RELIABILITY:
  Record<
    KnowledgeProvenance,
    number
  > = {
    INTERNAL: 1,
    CONNECTED: 0.95,
    PUBLIC: 0.85,
    MODELED: 0.6,
    ASSUMED: 0.35,
  };

export function provenanceReliability(
  provenance:
    KnowledgeProvenance,
): number {
  return PROVENANCE_RELIABILITY[
    provenance
  ];
}

export function createKnowledgeSource(
  input: {
    id: string;
    name: string;
    type: KnowledgeSourceType;
    provenance:
      KnowledgeProvenance;
    description: string;
    uri?: string;
    trustScore?: number;
    connected?: boolean;
    readOnly?: boolean;
    lastSyncedAt?: string;
    metadata?: Record<
      string,
      unknown
    >;
  },
): KnowledgeSource {
  const baseline =
    provenanceReliability(
      input.provenance,
    );

  const trustScore =
    input.trustScore ??
    baseline;

  if (
    trustScore < 0 ||
    trustScore > 1
  ) {
    throw new Error(
      "Knowledge source trustScore must be between 0 and 1.",
    );
  }

  return {
    id: input.id,
    name: input.name,
    type: input.type,
    provenance:
      input.provenance,
    description:
      input.description,
    uri: input.uri,
    trustScore,
    connected:
      input.connected ?? false,
    readOnly:
      input.readOnly ?? true,
    lastSyncedAt:
      input.lastSyncedAt,
    metadata:
      input.metadata ?? {},
  };
}

export class KnowledgeSourceRegistry {
  private readonly sources =
    new Map<
      string,
      KnowledgeSource
    >();

  register(
    source: KnowledgeSource,
  ): void {
    if (
      this.sources.has(
        source.id,
      )
    ) {
      throw new Error(
        `Knowledge source "${source.id}" is already registered.`,
      );
    }

    this.sources.set(
      source.id,
      source,
    );
  }

  upsert(
    source: KnowledgeSource,
  ): void {
    this.sources.set(
      source.id,
      source,
    );
  }

  get(
    id: string,
  ): KnowledgeSource | undefined {
    return this.sources.get(id);
  }

  require(
    id: string,
  ): KnowledgeSource {
    const source =
      this.get(id);

    if (!source) {
      throw new Error(
        `Unknown knowledge source "${id}".`,
      );
    }

    return source;
  }

  getAll():
    KnowledgeSource[] {
    return Array.from(
      this.sources.values(),
    );
  }

  getByProvenance(
    provenance:
      KnowledgeProvenance,
  ): KnowledgeSource[] {
    return this.getAll().filter(
      (source) =>
        source.provenance ===
        provenance,
    );
  }

  getConnected():
    KnowledgeSource[] {
    return this.getAll().filter(
      (source) =>
        source.connected,
    );
  }
}