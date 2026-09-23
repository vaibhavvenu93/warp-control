import {
  beforeEach,
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

import {
  CompanyBrain,
} from "@/services/company-brain";

describe(
  "Company Brain runtime",
  () => {
    let repository:
      InMemoryKnowledgeRepository;

    let brain:
      CompanyBrain;

    let idCounter = 0;

    beforeEach(
      async () => {
        idCounter = 0;

        repository =
          new InMemoryKnowledgeRepository();

        await seedCompanyBrain(
          repository,
        );

        brain =
          new CompanyBrain(
            repository,
            {
              now: () =>
                "2026-09-23T12:00:00.000Z",

              createId: () => {
                idCounter += 1;

                return `brain-test-${idCounter}`;
              },

              createCorrelationId:
                () =>
                  "corr-brain-test-001",
            },
          );
      },
    );

    it(
      "runs the complete governed brain pipeline",
      async () => {
        const response =
          await brain.ask(
            "What do we know about Northstar Labs?",
          );

        expect(
          response.execution.steps.map(
            (step) =>
              step.stage,
          ),
        ).toEqual([
          "QUERY_PLANNING",
          "RETRIEVAL",
          "ANSWERABILITY",
          "SYNTHESIS",
          "COMPLETE",
        ]);

        expect(
          response.execution
            .retrievalTraceStages,
        ).toContain(
          "RERANK",
        );

        expect(
          response.execution
            .retrievalTraceStages,
        ).toContain(
          "CONTEXT",
        );
      },
    );

    it(
      "preserves a human decision boundary",
      async () => {
        const response =
          await brain.ask(
            "Should we pursue Northstar Labs as an enterprise account?",
          );

        expect(
          response.mode,
        ).toBe(
          "HUMAN_DECISION_SUPPORT",
        );

        expect(
          response
            .answerabilityStatus,
        ).toBe(
          "HUMAN_JUDGMENT_REQUIRED",
        );

        expect(
          response.policy
            .humanJudgmentRequired,
        ).toBe(true);

        expect(
          response.policy
            .mayRecommend,
        ).toBe(false);
      },
    );

    it(
      "does not present modeled economics as observed fact",
      async () => {
        const response =
          await brain.ask(
            "What is the CI economics for Northstar?",
          );

        expect(
          response.citations.some(
            (citation) =>
              citation.state ===
                "MODELED" &&
              citation.provenance ===
                "MODELED",
          ),
        ).toBe(true);

        expect(
          response.caveats.some(
            (caveat) =>
              caveat.includes(
                "modeled",
              ),
          ),
        ).toBe(true);
      },
    );

    it(
      "creates claim-level citations",
      async () => {
        const response =
          await brain.ask(
            "What do we know about Northstar Labs?",
          );

        expect(
          response.citations.length,
        ).toBeGreaterThan(0);

        for (
          const citation
          of response.citations
        ) {
          expect(
            citation.claimId,
          ).toBeTruthy();

          expect(
            citation.sourceId,
          ).toBeTruthy();

          expect(
            citation.statement,
          ).toBeTruthy();

          expect(
            citation.confidence,
          ).toBeGreaterThanOrEqual(
            0,
          );

          expect(
            citation.confidence,
          ).toBeLessThanOrEqual(
            1,
          );
        }
      },
    );

    it(
      "links synthesized sections to citations",
      async () => {
        const response =
          await brain.ask(
            "What is the CI economics for Northstar?",
          );

        const citedSections =
          response.sections.filter(
            (section) =>
              section.citationIds
                .length > 0,
          );

        expect(
          citedSections.length,
        ).toBeGreaterThan(0);

        const citationIds =
          response.citations.map(
            (citation) =>
              citation.id,
          );

        for (
          const section
          of citedSections
        ) {
          for (
            const id
            of section.citationIds
          ) {
            expect(
              citationIds,
            ).toContain(id);
          }
        }
      },
    );

    it(
      "surfaces unresolved evidence requirements",
      async () => {
        const response =
          await brain.ask(
            "Should we approve the Northstar opportunity?",
          );

        expect(
          response
            .unresolvedQuestions
            .length,
        ).toBeGreaterThan(0);

        expect(
          response
            .requiredEvidence,
        ).toContain(
          "CRM contact data",
        );

        expect(
          response
            .requiredEvidence,
        ).toContain(
          "Account research",
        );
      },
    );

    it(
      "carries one correlation id across the execution",
      async () => {
        const response =
          await brain.ask(
            "Should we pursue Northstar Labs?",
            {
              correlationId:
                "corr-custom-001",
            },
          );

        expect(
          response.execution
            .correlationId,
        ).toBe(
          "corr-custom-001",
        );

        const complete =
          response.execution.steps.find(
            (step) =>
              step.stage ===
              "COMPLETE",
          );

        expect(
          complete?.metadata
            .correlationId,
        ).toBe(
          "corr-custom-001",
        );
      },
    );

    it(
      "abstains when no knowledge exists",
      async () => {
        const emptyRepository =
          new InMemoryKnowledgeRepository();

        const emptyBrain =
          new CompanyBrain(
            emptyRepository,
            {
              now: () =>
                "2026-09-23T12:00:00.000Z",

              createId: () =>
                "brain-empty-001",

              createCorrelationId:
                () =>
                  "corr-empty-001",
            },
          );

        const response =
          await emptyBrain.ask(
            "What is our position in a completely unknown market?",
          );

        expect(
          response.mode,
        ).toBe(
          "ABSTAIN",
        );

        expect(
          response
            .answerabilityStatus,
        ).toBe(
          "INSUFFICIENT_EVIDENCE",
        );

        expect(
          response.policy
            .mayAnswer,
        ).toBe(false);

        expect(
          response.execution.steps.find(
            (step) =>
              step.stage ===
              "SYNTHESIS",
          )?.status,
        ).toBe(
          "BLOCKED",
        );
      },
    );

    it(
      "does not invent citations when abstaining",
      async () => {
        const emptyRepository =
          new InMemoryKnowledgeRepository();

        const emptyBrain =
          new CompanyBrain(
            emptyRepository,
            {
              now: () =>
                "2026-09-23T12:00:00.000Z",

              createId: () =>
                "brain-empty-002",

              createCorrelationId:
                () =>
                  "corr-empty-002",
            },
          );

        const response =
          await emptyBrain.ask(
            "Who owns procurement at an unknown company?",
          );

        expect(
          response.citations,
        ).toHaveLength(0);

        expect(
          response.sections.some(
            (section) =>
              section.citationIds
                .length > 0,
          ),
        ).toBe(false);
      },
    );

    it(
      "keeps the synthetic Northstar boundary in cited evidence",
      async () => {
        const response =
          await brain.ask(
            "What do we know about Northstar Labs?",
          );

        expect(
          response.citations.some(
            (citation) =>
              citation.statement.includes(
                "Northstar Labs",
              ),
          ),
        ).toBe(true);

        expect(
          response.citations.some(
            (citation) =>
              citation.state ===
              "MODELED",
          ),
        ).toBe(true);
      },
    );

    it(
      "produces deterministic output for the same knowledge state",
      async () => {
        const first =
          await brain.ask(
            "What is the CI economics for Northstar?",
            {
              correlationId:
                "corr-repeat",
            },
          );

        const second =
          await brain.ask(
            "What is the CI economics for Northstar?",
            {
              correlationId:
                "corr-repeat",
            },
          );

        expect(
          first.headline,
        ).toBe(
          second.headline,
        );

        expect(
          first.answer,
        ).toBe(
          second.answer,
        );

        expect(
          first.citations.map(
            (citation) =>
              citation.claimId,
          ),
        ).toEqual(
          second.citations.map(
            (citation) =>
              citation.claimId,
          ),
        );
      },
    );

    it(
      "exposes enough runtime telemetry for inspection",
      async () => {
        const response =
          await brain.ask(
            "Should we pursue Northstar Labs?",
          );

        expect(
          response.execution
            .queryPlanId,
        ).toBeTruthy();

        expect(
          response.execution
            .retrievedCandidateCount,
        ).toBeGreaterThan(0);

        expect(
          response.execution
            .selectedCandidateCount,
        ).toBeGreaterThan(0);

        expect(
          response.execution
            .claimCount,
        ).toBeGreaterThan(0);

        expect(
          response.execution
            .evidenceCount,
        ).toBeGreaterThan(0);
      },
    );
  },
);