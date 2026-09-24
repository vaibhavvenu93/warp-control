import {
  buildAttentionQueue,
} from "@/domain/operations/attention-engine";

import {
  buildOperatingReview,
} from "@/domain/operations/cadence-engine";

import {
  calculateOperatingHealth,
} from "@/domain/operations/health-engine";

import type {
  CompanyOperatingSnapshot,
  OperatingReview,
} from "@/domain/operations/types";

import {
  OPERATING_DEMO_DISCLAIMER,
  OPERATING_DEMO_NOW,
  OPERATING_DEMO_PLAN,
} from "@/data/demo/operations/operating-plan";

import {
  InMemoryOperatingRepository,
} from "@/repositories/operations/operating-repository";

import type {
  OperatingRepository,
  OperatingRepositorySnapshot,
} from "@/repositories/operations/operating-repository";

export interface CompanyOperatingSystemOptions {
  now?: string;
  disclaimer?: string;
}

async function seedRepository(
  repository: OperatingRepository,
  seed: OperatingRepositorySnapshot,
): Promise<void> {
  for (const owner of seed.owners) {
    await repository.saveOwner(
      owner,
    );
  }

  for (const goal of seed.goals) {
    await repository.saveGoal(
      goal,
    );
  }

  for (const metric of seed.metrics) {
    await repository.saveMetric(
      metric,
    );
  }

  for (
    const workstream of
    seed.workstreams
  ) {
    await repository.saveWorkstream(
      workstream,
    );
  }

  for (
    const commitment of
    seed.commitments
  ) {
    await repository.saveCommitment(
      commitment,
    );
  }

  for (
    const dependency of
    seed.dependencies
  ) {
    await repository.saveDependency(
      dependency,
    );
  }

  for (const issue of seed.issues) {
    await repository.saveIssue(
      issue,
    );
  }

  for (
    const followUp of
    seed.followUps
  ) {
    await repository.saveFollowUp(
      followUp,
    );
  }

  for (
    const cadence of
    seed.cadences
  ) {
    await repository.saveCadence(
      cadence,
    );
  }
}

export class CompanyOperatingSystem {
  constructor(
    private readonly repository:
      OperatingRepository,

    private readonly options:
      CompanyOperatingSystemOptions = {},
  ) {}

  async getSnapshot():
    Promise<CompanyOperatingSnapshot> {
    const state =
      await this.repository.getSnapshot();

    const now =
      this.options.now ??
      new Date().toISOString();

    const health =
      calculateOperatingHealth({
        owners: state.owners,
        goals: state.goals,
        metrics: state.metrics,
        workstreams:
          state.workstreams,
        commitments:
          state.commitments,
        dependencies:
          state.dependencies,
        issues: state.issues,
        now,
      });

    const attention =
      buildAttentionQueue({
        owners: state.owners,
        goals: state.goals,
        metrics: state.metrics,
        workstreams:
          state.workstreams,
        commitments:
          state.commitments,
        dependencies:
          state.dependencies,
        issues: state.issues,
        now,
      });

    return {
      generatedAt: now,

      owners: state.owners,
      goals: state.goals,
      metrics: state.metrics,
      workstreams:
        state.workstreams,
      commitments:
        state.commitments,
      dependencies:
        state.dependencies,
      issues: state.issues,
      followUps:
        state.followUps,
      cadences:
        state.cadences,

      attention,

      health,

      disclaimer:
        this.options.disclaimer ??
        "Operating data is provided by the configured repository.",
    };
  }

  async runCadence(
    cadenceId: string,
  ): Promise<OperatingReview> {
    const snapshot =
      await this.getSnapshot();

    const cadence =
      snapshot.cadences.find(
        (item) =>
          item.id === cadenceId,
      );

    if (!cadence) {
      throw new Error(
        `Operating cadence ${cadenceId} was not found.`,
      );
    }

    return buildOperatingReview({
      cadence,

      goals:
        snapshot.goals,

      metrics:
        snapshot.metrics,

      workstreams:
        snapshot.workstreams,

      issues:
        snapshot.issues,

      attention:
        snapshot.attention,

      health:
        snapshot.health,

      now:
        snapshot.generatedAt,
    });
  }
}

export async function buildOperatingDemo():
  Promise<CompanyOperatingSystem> {
  const repository =
    new InMemoryOperatingRepository();

  await seedRepository(
    repository,
    OPERATING_DEMO_PLAN,
  );

  return new CompanyOperatingSystem(
    repository,
    {
      now: OPERATING_DEMO_NOW,
      disclaimer:
        OPERATING_DEMO_DISCLAIMER,
    },
  );
}