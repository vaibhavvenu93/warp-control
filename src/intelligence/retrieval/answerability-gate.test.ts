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

import {
  AnswerabilityGate,
} from "@/intelligence/retrieval/answerability-gate";

import type {
  KnowledgeSnapshot,
} from "@/domain/knowledge/types";

describe(
  "company brain answerability gate",
  () => {
    let snapshot:
      KnowledgeSnapshot;

    const planner =
      new QueryPlanner({
        now: () =>
          "2026-09-23T12:00:00.000Z",

        createId: () =>
          "query-plan-answerability-test",
      });

    const retrieval =
      new RetrievalEngine({
        maxCandidates: 20,
        minimumScore: 0,
      });

    const gate =
      new AnswerabilityGate();

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
      "requires human judgment for an account pursuit decision",
      () => {
        const plan =
          planner.plan(
            "Should we pursue Northstar Labs as an enterprise account?",
          );

        const context =
          retrieval.retrieve(
            snapshot,
            plan,
          );

        const assessment =
          gate.assess(context);

        expect(
          assessment.status,
        ).toBe(
          "HUMAN_JUDGMENT_REQUIRED",
        );

        expect(
          assessment
            .humanJudgmentRequired,
        ).toBe(true);

        expect(
          assessment.policy
            .mayRecommend,
        ).toBe(false);
      },
    );

    it(
      "allows evidence to inform a human decision",
      () => {
        const plan =
          planner.plan(
            "Should we pursue Northstar Labs?",
          );

        const assessment =
          gate.assess(
            retrieval.retrieve(
              snapshot,
              plan,
            ),
          );

        expect(
          assessment.policy
            .mayAnswer,
        ).toBe(true);
      },
    );

    it(
      "discloses modeled knowledge",
      () => {
        const plan =
          planner.plan(
            "What is the ROI and payback of WarpBuild CI for Northstar?",
          );

        const assessment =
          gate.assess(
            retrieval.retrieve(
              snapshot,
              plan,
            ),
          );

        expect(
          assessment.evidenceProfile
            .modeled,
        ).toBeGreaterThan(0);

        expect(
          assessment.caveats.some(
            (caveat) =>
              caveat.includes(
                "modeled",
              ),
          ),
        ).toBe(true);

        expect(
          assessment.policy
            .mustDiscloseCaveats,
        ).toBe(true);
      },
    );

    it(
      "preserves unresolved evidence requirements",
      () => {
        const plan =
          planner.plan(
            "Should we approve the Northstar opportunity?",
          );

        const assessment =
          gate.assess(
            retrieval.retrieve(
              snapshot,
              plan,
            ),
          );

        expect(
          assessment
            .unresolvedQuestions
            .length,
        ).toBeGreaterThan(0);

        expect(
          assessment
            .requiredEvidence
            .length,
        ).toBeGreaterThan(0);

        expect(
          assessment.policy
            .mustRequestEvidence,
        ).toBe(true);
      },
    );

    it(
      "produces a bounded confidence score",
      () => {
        const plan =
          planner.plan(
            "What do we know about Northstar Labs?",
          );

        const assessment =
          gate.assess(
            retrieval.retrieve(
              snapshot,
              plan,
            ),
          );

        expect(
          assessment.confidence,
        ).toBeGreaterThanOrEqual(
          0,
        );

        expect(
          assessment.confidence,
        ).toBeLessThanOrEqual(
          1,
        );
      },
    );

    it(
      "exposes the confidence calculation",
      () => {
        const plan =
          planner.plan(
            "What is the CI economics for Northstar?",
          );

        const assessment =
          gate.assess(
            retrieval.retrieve(
              snapshot,
              plan,
            ),
          );

        expect(
          assessment.factors,
        ).toHaveLength(6);

        expect(
          assessment.factors.map(
            (factor) =>
              factor.name,
          ),
        ).toEqual([
          "evidenceCoverage",
          "provenanceStrength",
          "claimConfidence",
          "knowledgeCoverage",
          "unknownResolution",
          "consistency",
        ]);
      },
    );

    it(
      "does not silently treat modeled analysis as observed truth",
      () => {
        const plan =
          planner.plan(
            "What is the CI economics for Northstar?",
          );

        const assessment =
          gate.assess(
            retrieval.retrieve(
              snapshot,
              plan,
            ),
          );

        expect(
          assessment.status,
        ).not.toBe(
          "ANSWERABLE",
        );
      },
    );

    it(
      "refuses to recommend when the planner establishes a human decision boundary",
      () => {
        const plan =
          planner.plan(
            "Which experiment should we run next?",
          );

        const assessment =
          gate.assess(
            retrieval.retrieve(
              snapshot,
              plan,
            ),
          );

        expect(
          assessment
            .humanJudgmentRequired,
        ).toBe(true);

        expect(
          assessment.policy
            .mayRecommend,
        ).toBe(false);
      },
    );

    it(
      "marks an empty knowledge result as insufficient evidence",
      () => {
        const emptySnapshot:
          KnowledgeSnapshot = {
            sources: [],
            documents: [],
            chunks: [],

            graph: {
              entities: [],
              relations: [],
              claims: [],
              evidence: [],
            },
          };

        const plan =
          planner.plan(
            "What is completely unknown?",
          );

        const context =
          retrieval.retrieve(
            emptySnapshot,
            plan,
          );

        const assessment =
          gate.assess(context);

        expect(
          assessment.status,
        ).toBe(
          "INSUFFICIENT_EVIDENCE",
        );

        expect(
          assessment.policy
            .mayAnswer,
        ).toBe(false);

        expect(
          assessment.policy
            .mayRecommend,
        ).toBe(false);
      },
    );

    it(
      "gives stronger provenance more weight than assumed knowledge",
      () => {
        const plan =
          planner.plan(
            "What do we know about Northstar Labs?",
          );

        const context =
          retrieval.retrieve(
            snapshot,
            plan,
          );

        const assessment =
          gate.assess(context);

        const provenanceFactor =
          assessment.factors.find(
            (factor) =>
              factor.name ===
              "provenanceStrength",
          );

        expect(
          provenanceFactor,
        ).toBeDefined();

        expect(
          provenanceFactor?.score,
        ).toBeGreaterThan(
          0.35,
        );
      },
    );
  },
);