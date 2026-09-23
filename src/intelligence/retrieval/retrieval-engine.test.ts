import {
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

import {
  InMemoryKnowledgeRepository,
} from "@/repositories/knowledge/knowledge-repository";

import {
  seedCompanyBrain,
} from "@/data/demo/knowledge/seed-company-brain";

import {
  QueryPlanner,
} from "@/intelligence/retrieval/query-planner";

import {
  RetrievalEngine,
} from "@/intelligence/retrieval/retrieval-engine";

import type {
  KnowledgeSnapshot,
} from "@/domain/knowledge/types";

describe(
  "company brain retrieval engine",
  () => {
    let snapshot:
      KnowledgeSnapshot;

    const planner =
      new QueryPlanner({
        now: () =>
          "2026-09-23T12:00:00.000Z",

        createId: () =>
          "query-plan-retrieval-test",
      });

    const engine =
      new RetrievalEngine({
        maxCandidates: 20,
        minimumScore: 0,
      });

    beforeEach(
      async () => {
        const repository =
          new InMemoryKnowledgeRepository();

        await seedCompanyBrain(
          repository,
        );

        snapshot =
          await repository.getSnapshot();
      },
    );

    it(
      "retrieves Northstar account intelligence through multiple strategies",
      () => {
        const plan =
          planner.plan(
            "What do we know about Northstar Labs?",
          );

        const context =
          engine.retrieve(
            snapshot,
            plan,
          );

        expect(
          context.entities.some(
            (entity) =>
              entity.id ===
              "entity-northstar",
          ),
        ).toBe(true);

        expect(
          context.claims.length,
        ).toBeGreaterThan(0);

        expect(
          context.trace.some(
            (step) =>
              step.stage ===
              "ENTITY",
          ),
        ).toBe(true);

        expect(
          context.trace.some(
            (step) =>
              step.stage ===
              "CLAIM",
          ),
        ).toBe(true);
      },
    );

    it(
      "preserves modeled claims instead of presenting them as known facts",
      () => {
        const plan =
          planner.plan(
            "What is the ROI and payback of WarpBuild CI for Northstar?",
          );

        const context =
          engine.retrieve(
            snapshot,
            plan,
          );

        expect(
          context.modeledClaims.length,
        ).toBeGreaterThan(0);

        expect(
          context.modeledClaims.some(
            (claim) =>
              claim.provenance ===
              "MODELED",
          ),
        ).toBe(true);
      },
    );

    it(
      "surfaces explicit unknowns for decision support",
      () => {
        const plan =
          planner.plan(
            "Should we pursue Northstar Labs as an enterprise account?",
          );

        const context =
          engine.retrieve(
            snapshot,
            plan,
          );

        expect(
          context.unknownClaims.some(
            (claim) =>
              claim.id ===
              "claim-procurement-owner",
          ),
        ).toBe(true);

        expect(
          context.gaps.some(
            (gap) =>
              gap.claimId ===
              "claim-procurement-owner",
          ),
        ).toBe(true);
      },
    );

    it(
      "turns unknown claims into evidence requests",
      () => {
        const plan =
          planner.plan(
            "Should we approve the Northstar opportunity?",
          );

        const context =
          engine.retrieve(
            snapshot,
            plan,
          );

        const gap =
          context.gaps.find(
            (item) =>
              item.claimId ===
              "claim-procurement-owner",
          );

        expect(gap).toBeDefined();

        expect(
          gap?.requiredEvidence.length,
        ).toBeGreaterThan(0);

        expect(
          gap?.severity,
        ).toBe("HIGH");
      },
    );

    it(
      "collects provenance evidence for retrieved claims",
      () => {
        const plan =
          planner.plan(
            "What do we know about Northstar Labs?",
          );

        const context =
          engine.retrieve(
            snapshot,
            plan,
          );

        expect(
          context.evidence.length,
        ).toBeGreaterThan(0);

        expect(
          context.evidence.every(
            (evidence) =>
              context.claims.some(
                (claim) =>
                  claim.id ===
                  evidence.claimId,
              ),
          ),
        ).toBe(true);
      },
    );

    it(
      "expands the knowledge graph for decision-support queries",
      () => {
        const plan =
          planner.plan(
            "Should we pursue Northstar Labs as an enterprise account?",
          );

        const context =
          engine.retrieve(
            snapshot,
            plan,
          );

        expect(
          context.trace.some(
            (step) =>
              step.stage ===
              "GRAPH",
          ),
        ).toBe(true);

        expect(
          context.relations.length,
        ).toBeGreaterThan(0);
      },
    );

    it(
      "provides transparent score breakdowns for ranked candidates",
      () => {
        const plan =
          planner.plan(
            "What is the CI economics for Northstar?",
          );

        const context =
          engine.retrieve(
            snapshot,
            plan,
          );

        expect(
          context.candidates.length,
        ).toBeGreaterThan(0);

        for (
          const candidate
          of context.candidates
        ) {
          expect(
            candidate.score,
          ).toBeDefined();

          expect(
            candidate.score
              ?.finalScore,
          ).toBeGreaterThanOrEqual(
            0,
          );

          expect(
            candidate.score
              ?.finalScore,
          ).toBeLessThanOrEqual(
            1,
          );
        }
      },
    );

    it(
      "penalizes modeled knowledge relative to equivalent stronger provenance",
      () => {
        const plan =
          planner.plan(
            "What do we know about Northstar Labs?",
          );

        const context =
          engine.retrieve(
            snapshot,
            plan,
          );

        const modeled =
          context.candidates.find(
            (candidate) =>
              candidate.provenance ===
              "MODELED" &&
              candidate.score,
          );

        expect(
          modeled,
        ).toBeDefined();

        expect(
          modeled?.score
            ?.modeledPenalty,
        ).toBe(0.12);
      },
    );

    it(
      "prioritizes unknown resolution when the query can affect a decision",
      () => {
        const plan =
          planner.plan(
            "Should we pursue Northstar Labs?",
          );

        const context =
          engine.retrieve(
            snapshot,
            plan,
          );

        const unknown =
          context.candidates.find(
            (candidate) =>
              candidate.claimId ===
              "claim-procurement-owner",
          );

        expect(
          unknown,
        ).toBeDefined();

        expect(
          unknown?.score
            ?.unknownPriority,
        ).toBe(1);
      },
    );

    it(
      "records a complete retrieval trace",
      () => {
        const plan =
          planner.plan(
            "Should we pursue Northstar Labs?",
          );

        const context =
          engine.retrieve(
            snapshot,
            plan,
          );

        const stages =
          context.trace.map(
            (step) =>
              step.stage,
          );

        expect(stages).toContain(
          "PLAN",
        );

        expect(stages).toContain(
          "ENTITY",
        );

        expect(stages).toContain(
          "CLAIM",
        );

        expect(stages).toContain(
          "GRAPH",
        );

        expect(stages).toContain(
          "RERANK",
        );

        expect(stages).toContain(
          "CONTEXT",
        );
      },
    );

    it(
      "keeps the synthetic account boundary visible in retrieved context",
      () => {
        const plan =
          planner.plan(
            "What do we know about Northstar Labs?",
          );

        const context =
          engine.retrieve(
            snapshot,
            plan,
          );

        const northstar =
          context.entities.find(
            (entity) =>
              entity.id ===
              "entity-northstar",
          );

        expect(
          northstar,
        ).toBeDefined();

        expect(
          northstar?.attributes
            .synthetic,
        ).toBe(true);
      },
    );

    it(
      "returns deterministic ranking for the same snapshot and plan",
      () => {
        const plan =
          planner.plan(
            "What is the CI economics for Northstar?",
          );

        const first =
          engine.retrieve(
            snapshot,
            plan,
          );

        const second =
          engine.retrieve(
            snapshot,
            plan,
          );

        expect(
          first.candidates.map(
            (candidate) =>
              candidate.id,
          ),
        ).toEqual(
          second.candidates.map(
            (candidate) =>
              candidate.id,
          ),
        );

        expect(
          first.candidates.map(
            (candidate) =>
              candidate.score
                ?.finalScore,
          ),
        ).toEqual(
          second.candidates.map(
            (candidate) =>
              candidate.score
                ?.finalScore,
          ),
        );
      },
    );

    it(
      "summarizes evidence state for downstream Company Brain synthesis",
      () => {
        const plan =
          planner.plan(
            "Should we pursue Northstar Labs?",
          );

        const context =
          engine.retrieve(
            snapshot,
            plan,
          );

        expect(
          context.summary
            .candidateCount,
        ).toBeGreaterThanOrEqual(
          context.summary
            .selectedCount,
        );

        expect(
          context.summary
            .evidenceCount,
        ).toBe(
          context.evidence.length,
        );

        expect(
          context.summary
            .unknownCount,
        ).toBe(
          context.unknownClaims
            .length,
        );

        expect(
          context.summary
            .modeledCount,
        ).toBe(
          context.modeledClaims
            .length,
        );
      },
    );
  },
);