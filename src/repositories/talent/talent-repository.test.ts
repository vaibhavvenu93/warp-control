import {
  describe,
  expect,
  it,
} from "vitest";

import {
  InMemoryTalentRepository,
} from "@/repositories/talent/talent-repository";

describe(
  "talent repository",
  () => {
    it(
      "stores and retrieves capability gaps",
      async () => {
        const repository =
          new InMemoryTalentRepository();

        await repository.saveCapabilityGap(
          {
            id: "gap-1",
            capability:
              "Technical GTM",
            description:
              "Technical discovery.",
            status: "OPEN",
            priority: "HIGH",
            whyNow:
              "Needed now.",
            businessImpact:
              "Supports enterprise motion.",
            relatedGoalIds: [],
            relatedWorkstreamIds:
              [],
          },
        );

        const result =
          await repository.getCapabilityGap(
            "gap-1",
          );

        expect(
          result?.capability,
        ).toBe(
          "Technical GTM",
        );
      },
    );

    it(
      "returns candidates by search",
      async () => {
        const repository =
          new InMemoryTalentRepository();

        await repository.saveCandidate(
          {
            id: "candidate-1",
            displayName:
              "Candidate A",
            searchId:
              "search-1",
            stage: "SCREEN",
            recommendation:
              "UNASSESSED",
            enteredStageAt:
              "2026-09-23T00:00:00.000Z",
            updatedAt:
              "2026-09-23T00:00:00.000Z",
            evidenceIds: [],
            strengths: [],
            openQuestions: [],
            risks: [],
            humanDecisionRequired:
              false,
          },
        );

        const result =
          await repository.getCandidatesBySearch(
            "search-1",
          );

        expect(
          result,
        ).toHaveLength(1);
      },
    );

    it(
      "returns evidence by candidate",
      async () => {
        const repository =
          new InMemoryTalentRepository();

        await repository.saveEvidence(
          {
            id: "evidence-1",
            candidateId:
              "candidate-1",
            dimension:
              "Operating judgment",
            observation:
              "Strong structured response.",
            assessment:
              "STRONG",
            source:
              "MODELED_DEMO",
            observedAt:
              "2026-09-23T00:00:00.000Z",
          },
        );

        const result =
          await repository.getEvidenceByCandidate(
            "candidate-1",
          );

        expect(
          result,
        ).toHaveLength(1);
      },
    );

    it(
      "protects stored state from external mutation",
      async () => {
        const repository =
          new InMemoryTalentRepository();

        const candidate = {
          id: "candidate-1",
          displayName:
            "Candidate A",
          searchId:
            "search-1",
          stage:
            "SCREEN" as const,
          recommendation:
            "UNASSESSED" as const,
          enteredStageAt:
            "2026-09-23T00:00:00.000Z",
          updatedAt:
            "2026-09-23T00:00:00.000Z",
          evidenceIds: [],
          strengths: [
            "Original",
          ],
          openQuestions: [],
          risks: [],
          humanDecisionRequired:
            false,
        };

        await repository.saveCandidate(
          candidate,
        );

        candidate.strengths.push(
          "Mutated",
        );

        const stored =
          await repository.getCandidate(
            "candidate-1",
          );

        expect(
          stored?.strengths,
        ).toEqual([
          "Original",
        ]);
      },
    );

    it(
      "returns a complete snapshot",
      async () => {
        const repository =
          new InMemoryTalentRepository();

        await repository.saveOwner(
          {
            id: "owner-cos",
            name:
              "Chief of Staff",
            role:
              "Chief of Staff",
          },
        );

        const snapshot =
          await repository.getSnapshot();

        expect(
          snapshot.owners,
        ).toHaveLength(1);

        expect(
          snapshot.searches,
        ).toHaveLength(0);
      },
    );
  },
);