import {
  assessCapabilityPortfolio,
} from "@/domain/talent/capacity-engine";

import {
  buildHiringAttention,
  calculatePipelineHealth,
} from "@/domain/talent/pipeline-engine";

import type {
  TalentMetrics,
  TalentSnapshot,
} from "@/domain/talent/types";

import {
  TALENT_DEMO_CANDIDATES,
  TALENT_DEMO_DISCLAIMER,
  TALENT_DEMO_EVIDENCE,
  TALENT_DEMO_GAPS,
  TALENT_DEMO_NOW,
  TALENT_DEMO_OWNERS,
  TALENT_DEMO_SEARCHES,
} from "@/data/demo/talent/talent-plan";

import {
  InMemoryTalentRepository,
  type TalentRepository,
} from "@/repositories/talent/talent-repository";

export interface BuildTalentSnapshotOptions {
  now?: string;
  repository?: TalentRepository;
}

async function seedDemoRepository(
  repository: TalentRepository,
): Promise<void> {
  for (
    const owner of
    TALENT_DEMO_OWNERS
  ) {
    await repository.saveOwner(
      owner,
    );
  }

  for (
    const gap of
    TALENT_DEMO_GAPS
  ) {
    await repository.saveCapabilityGap(
      gap,
    );
  }

  for (
    const search of
    TALENT_DEMO_SEARCHES
  ) {
    await repository.saveSearch(
      search,
    );
  }

  for (
    const candidate of
    TALENT_DEMO_CANDIDATES
  ) {
    await repository.saveCandidate(
      candidate,
    );
  }

  for (
    const evidence of
    TALENT_DEMO_EVIDENCE
  ) {
    await repository.saveEvidence(
      evidence,
    );
  }
}

function buildMetrics(
  snapshot: Omit<
    TalentSnapshot,
    | "metrics"
    | "disclaimer"
  >,
): TalentMetrics {
  return {
    capabilityGaps:
      snapshot.capabilityGaps.filter(
        (gap) =>
          gap.status !==
          "CLOSED",
      ).length,

    activeSearches:
      snapshot.searches.filter(
        (search) =>
          search.status ===
          "ACTIVE",
      ).length,

    activeCandidates:
      snapshot.candidates.filter(
        (candidate) =>
          ![
            "HIRED",
            "REJECTED",
            "WITHDRAWN",
          ].includes(
            candidate.stage,
          ),
      ).length,

    finalStageCandidates:
      snapshot.candidates.filter(
        (candidate) =>
          candidate.stage ===
            "FINAL" ||
          candidate.stage ===
            "OFFER",
      ).length,

    searchesAtRisk:
      snapshot.pipelineHealth.filter(
        (health) =>
          [
            "AT_RISK",
            "OFF_TRACK",
          ].includes(
            health.health,
          ),
      ).length,

    humanDecisions:
      snapshot.attention.filter(
        (item) =>
          item.decisionRequired,
      ).length,
  };
}

export async function buildTalentDemo(
  options:
    BuildTalentSnapshotOptions = {},
): Promise<TalentSnapshot> {
  const now =
    options.now ??
    TALENT_DEMO_NOW;

  const repository =
    options.repository ??
    new InMemoryTalentRepository();

  await seedDemoRepository(
    repository,
  );

  const stored =
    await repository.getSnapshot();

  const capabilityAssessments =
    assessCapabilityPortfolio(
      stored.capabilityGaps,
      stored.searches,
      stored.candidates,
    );

  const pipelineHealth =
    stored.searches.map(
      (search) =>
        calculatePipelineHealth({
          search,
          candidates:
            stored.candidates,
          now,
        }),
    );

  const attention =
    buildHiringAttention({
      searches:
        stored.searches,
      candidates:
        stored.candidates,
      pipelineHealth,
      now,
    });

  const baseSnapshot = {
    generatedAt: now,

    owners: stored.owners,

    capabilityGaps:
      stored.capabilityGaps,

    searches:
      stored.searches,

    candidates:
      stored.candidates,

    evidence:
      stored.evidence,

    capabilityAssessments,

    pipelineHealth,

    attention,
  };

  return {
    ...baseSnapshot,
    metrics:
      buildMetrics(
        baseSnapshot,
      ),
    disclaimer:
      TALENT_DEMO_DISCLAIMER,
  };
}