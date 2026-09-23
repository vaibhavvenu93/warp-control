import {
  KnowledgeChunk,
  KnowledgeClaim,
  KnowledgeDocument,
  KnowledgeEntity,
  KnowledgeEvidence,
  KnowledgeRelation,
  KnowledgeSnapshot,
  KnowledgeSource,
} from "@/domain/knowledge/types";

export interface KnowledgeRepository {
  saveSource(
    source: KnowledgeSource,
  ): Promise<void>;

  saveDocument(
    document:
      KnowledgeDocument,
  ): Promise<void>;

  saveChunk(
    chunk: KnowledgeChunk,
  ): Promise<void>;

  saveEntity(
    entity: KnowledgeEntity,
  ): Promise<void>;

  saveRelation(
    relation:
      KnowledgeRelation,
  ): Promise<void>;

  saveClaim(
    claim: KnowledgeClaim,
  ): Promise<void>;

  saveEvidence(
    evidence:
      KnowledgeEvidence,
  ): Promise<void>;

  getSource(
    id: string,
  ): Promise<
    KnowledgeSource | undefined
  >;

  getDocument(
    id: string,
  ): Promise<
    KnowledgeDocument | undefined
  >;

  getEntity(
    id: string,
  ): Promise<
    KnowledgeEntity | undefined
  >;

  getClaim(
    id: string,
  ): Promise<
    KnowledgeClaim | undefined
  >;

  getClaimsByEntity(
    entityId: string,
  ): Promise<
    KnowledgeClaim[]
  >;

  getRelationsByEntity(
    entityId: string,
  ): Promise<
    KnowledgeRelation[]
  >;

  getChunks():
    Promise<KnowledgeChunk[]>;

  getSnapshot():
    Promise<KnowledgeSnapshot>;
}

export class InMemoryKnowledgeRepository
  implements
    KnowledgeRepository
{
  private readonly sources =
    new Map<
      string,
      KnowledgeSource
    >();

  private readonly documents =
    new Map<
      string,
      KnowledgeDocument
    >();

  private readonly chunks =
    new Map<
      string,
      KnowledgeChunk
    >();

  private readonly entities =
    new Map<
      string,
      KnowledgeEntity
    >();

  private readonly relations =
    new Map<
      string,
      KnowledgeRelation
    >();

  private readonly claims =
    new Map<
      string,
      KnowledgeClaim
    >();

  private readonly evidence =
    new Map<
      string,
      KnowledgeEvidence
    >();

  async saveSource(
    source: KnowledgeSource,
  ): Promise<void> {
    this.sources.set(
      source.id,
      source,
    );
  }

  async saveDocument(
    document:
      KnowledgeDocument,
  ): Promise<void> {
    this.documents.set(
      document.id,
      document,
    );
  }

  async saveChunk(
    chunk: KnowledgeChunk,
  ): Promise<void> {
    this.chunks.set(
      chunk.id,
      chunk,
    );
  }

  async saveEntity(
    entity: KnowledgeEntity,
  ): Promise<void> {
    this.entities.set(
      entity.id,
      entity,
    );
  }

  async saveRelation(
    relation:
      KnowledgeRelation,
  ): Promise<void> {
    this.relations.set(
      relation.id,
      relation,
    );
  }

  async saveClaim(
    claim: KnowledgeClaim,
  ): Promise<void> {
    this.claims.set(
      claim.id,
      claim,
    );
  }

  async saveEvidence(
    evidence:
      KnowledgeEvidence,
  ): Promise<void> {
    this.evidence.set(
      evidence.id,
      evidence,
    );
  }

  async getSource(
    id: string,
  ): Promise<
    KnowledgeSource | undefined
  > {
    return this.sources.get(id);
  }

  async getDocument(
    id: string,
  ): Promise<
    KnowledgeDocument | undefined
  > {
    return this.documents.get(id);
  }

  async getEntity(
    id: string,
  ): Promise<
    KnowledgeEntity | undefined
  > {
    return this.entities.get(id);
  }

  async getClaim(
    id: string,
  ): Promise<
    KnowledgeClaim | undefined
  > {
    return this.claims.get(id);
  }

  async getClaimsByEntity(
    entityId: string,
  ): Promise<
    KnowledgeClaim[]
  > {
    return Array.from(
      this.claims.values(),
    ).filter(
      (claim) =>
        claim.entityIds.includes(
          entityId,
        ),
    );
  }

  async getRelationsByEntity(
    entityId: string,
  ): Promise<
    KnowledgeRelation[]
  > {
    return Array.from(
      this.relations.values(),
    ).filter(
      (relation) =>
        relation.fromEntityId ===
          entityId ||
        relation.toEntityId ===
          entityId,
    );
  }

  async getChunks():
    Promise<KnowledgeChunk[]> {
    return Array.from(
      this.chunks.values(),
    );
  }

  async getSnapshot():
    Promise<KnowledgeSnapshot> {
    return {
      sources:
        Array.from(
          this.sources.values(),
        ),

      documents:
        Array.from(
          this.documents.values(),
        ),

      chunks:
        Array.from(
          this.chunks.values(),
        ),

      graph: {
        entities:
          Array.from(
            this.entities.values(),
          ),

        relations:
          Array.from(
            this.relations.values(),
          ),

        claims:
          Array.from(
            this.claims.values(),
          ),

        evidence:
          Array.from(
            this.evidence.values(),
          ),
      },
    };
  }
}