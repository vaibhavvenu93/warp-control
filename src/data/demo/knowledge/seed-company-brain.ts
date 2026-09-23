import {
  demoKnowledgeChunks,
  demoKnowledgeClaims,
  demoKnowledgeDocuments,
  demoKnowledgeEntities,
  demoKnowledgeEvidence,
  demoKnowledgeRelations,
  demoKnowledgeSources,
} from "@/data/demo/knowledge/company-brain-corpus";

import {
  KnowledgeRepository,
} from "@/repositories/knowledge/knowledge-repository";

export async function seedCompanyBrain(
  repository:
    KnowledgeRepository,
): Promise<void> {
  for (
    const source of
    demoKnowledgeSources
  ) {
    await repository.saveSource(
      source,
    );
  }

  for (
    const document of
    demoKnowledgeDocuments
  ) {
    await repository.saveDocument(
      document,
    );
  }

  for (
    const chunk of
    demoKnowledgeChunks
  ) {
    await repository.saveChunk(
      chunk,
    );
  }

  for (
    const entity of
    demoKnowledgeEntities
  ) {
    await repository.saveEntity(
      entity,
    );
  }

  for (
    const relation of
    demoKnowledgeRelations
  ) {
    await repository.saveRelation(
      relation,
    );
  }

  for (
    const claim of
    demoKnowledgeClaims
  ) {
    await repository.saveClaim(
      claim,
    );
  }

  for (
    const evidence of
    demoKnowledgeEvidence
  ) {
    await repository.saveEvidence(
      evidence,
    );
  }
}