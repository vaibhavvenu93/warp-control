import {
  describe,
  expect,
  it,
} from "vitest";

import {
  seedCompanyBrain,
} from "@/data/demo/knowledge/seed-company-brain";

import {
  InMemoryKnowledgeRepository,
} from "@/repositories/knowledge/knowledge-repository";

async function createRepository() {
  const repository =
    new InMemoryKnowledgeRepository();

  await seedCompanyBrain(
    repository,
  );

  return repository;
}

describe(
  "company brain knowledge repository",
  () => {
    it(
      "seeds the deterministic knowledge corpus",
      async () => {
        const repository =
          await createRepository();

        const snapshot =
          await repository.getSnapshot();

        expect(
          snapshot.sources.length,
        ).toBeGreaterThanOrEqual(
          5,
        );

        expect(
          snapshot.documents,
        ).toHaveLength(5);

        expect(
          snapshot.chunks,
        ).toHaveLength(5);

        expect(
          snapshot.graph.entities
            .length,
        ).toBeGreaterThanOrEqual(
          8,
        );

        expect(
          snapshot.graph.claims,
        ).toHaveLength(6);

        expect(
          snapshot.graph.evidence,
        ).toHaveLength(6);
      },
    );

    it(
      "preserves source provenance",
      async () => {
        const repository =
          await createRepository();

        const source =
          await repository.getSource(
            "source-control-plane",
          );

        expect(
          source?.provenance,
        ).toBe("INTERNAL");

        expect(
          source?.trustScore,
        ).toBe(1);
      },
    );

    it(
      "retrieves claims by entity",
      async () => {
        const repository =
          await createRepository();

        const claims =
          await repository.getClaimsByEntity(
            "entity-northstar",
          );

        expect(
          claims.length,
        ).toBeGreaterThanOrEqual(
          4,
        );

        expect(
          claims.some(
            (claim) =>
              claim.id ===
              "claim-northstar-score",
          ),
        ).toBe(true);
      },
    );

    it(
      "represents unknown information explicitly",
      async () => {
        const repository =
          await createRepository();

        const claim =
          await repository.getClaim(
            "claim-procurement-owner",
          );

        expect(
          claim?.state,
        ).toBe("UNKNOWN");

        expect(
          claim?.metadata
            .requiredEvidence,
        ).toEqual([
          "CRM contact data",
          "Account research",
        ]);
      },
    );

    it(
      "does not misrepresent modeled economics as known fact",
      async () => {
        const repository =
          await createRepository();

        const claim =
          await repository.getClaim(
            "claim-ci-value",
          );

        expect(
          claim?.state,
        ).toBe("MODELED");

        expect(
          claim?.provenance,
        ).toBe("MODELED");

        expect(
          claim?.confidence,
        ).toBe(0.6);
      },
    );

    it(
      "retains evidence-backed entity relationships",
      async () => {
        const repository =
          await createRepository();

        const relations =
          await repository.getRelationsByEntity(
            "entity-northstar",
          );

        expect(
          relations.some(
            (relation) =>
              relation.type ===
              "TARGETS",
          ),
        ).toBe(true);

        expect(
          relations.some(
            (relation) =>
              relation.type ===
              "MEASURES",
          ),
        ).toBe(true);

        expect(
          relations.every(
            (relation) =>
              relation
                .evidenceIds
                .length > 0,
          ),
        ).toBe(true);
      },
    );

    it(
      "keeps the synthetic account boundary explicit",
      async () => {
        const repository =
          await createRepository();

        const entity =
          await repository.getEntity(
            "entity-northstar",
          );

        const document =
          await repository.getDocument(
            "doc-northstar-account",
          );

        expect(
          entity?.attributes
            .synthetic,
        ).toBe(true);

        expect(
          document?.metadata
            .synthetic,
        ).toBe(true);

        expect(
          document?.content,
        ).toContain(
          "do not represent a real WarpBuild customer",
        );
      },
    );
  },
);