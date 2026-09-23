import {
  createKnowledgeSource,
} from "@/domain/knowledge/source-registry";

import type {
  KnowledgeSource,
} from "@/domain/knowledge/types";

import type {
  ExternalSourceDefinition,
} from "./observation-types";

function assertTrustScore(
  value: number,
): void {
  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1
  ) {
    throw new Error(
      "External source trustScore must be between 0 and 1.",
    );
  }
}

export function createExternalSource(
  input: ExternalSourceDefinition,
): ExternalSourceDefinition {
  assertTrustScore(
    input.trustScore,
  );

  if (!input.id.trim()) {
    throw new Error(
      "External source id is required.",
    );
  }

  if (!input.name.trim()) {
    throw new Error(
      "External source name is required.",
    );
  }

  if (!input.uri.trim()) {
    throw new Error(
      "External source uri is required.",
    );
  }

  return {
    ...input,
    tags: [...input.tags],
    metadata: {
      ...input.metadata,
    },
  };
}

export function externalSourceToKnowledgeSource(
  source: ExternalSourceDefinition,
): KnowledgeSource {
  return createKnowledgeSource({
    id: source.id,
    name: source.name,
    type: source.sourceType,
    provenance:
      source.provenance,
    description:
      source.description,
    uri: source.uri,
    trustScore:
      source.trustScore,
    connected: true,
    readOnly: true,
    metadata: {
      externalSourceKind:
        source.kind,
      pollingEligible:
        source.pollingEligible,
      enabled:
        source.enabled,
      tags:
        source.tags,
      ...source.metadata,
    },
  });
}

export class ExternalSourceRegistry {
  private readonly sources =
    new Map<
      string,
      ExternalSourceDefinition
    >();

  register(
    source: ExternalSourceDefinition,
  ): void {
    if (
      this.sources.has(
        source.id,
      )
    ) {
      throw new Error(
        `External source "${source.id}" is already registered.`,
      );
    }

    this.sources.set(
      source.id,
      createExternalSource(
        source,
      ),
    );
  }

  upsert(
    source: ExternalSourceDefinition,
  ): void {
    this.sources.set(
      source.id,
      createExternalSource(
        source,
      ),
    );
  }

  get(
    id: string,
  ): ExternalSourceDefinition | undefined {
    return this.sources.get(
      id,
    );
  }

  require(
    id: string,
  ): ExternalSourceDefinition {
    const source =
      this.get(id);

    if (!source) {
      throw new Error(
        `Unknown external source "${id}".`,
      );
    }

    return source;
  }

  getAll():
    ExternalSourceDefinition[] {
    return Array.from(
      this.sources.values(),
    );
  }

  getEnabled():
    ExternalSourceDefinition[] {
    return this.getAll().filter(
      (source) =>
        source.enabled,
    );
  }

  getPollingEligible():
    ExternalSourceDefinition[] {
    return this.getEnabled().filter(
      (source) =>
        source.pollingEligible,
    );
  }

  toKnowledgeSources():
    KnowledgeSource[] {
    return this.getAll().map(
      externalSourceToKnowledgeSource,
    );
  }
}