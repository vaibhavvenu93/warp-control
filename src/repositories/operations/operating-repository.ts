import type {
  OperatingCadence,
  OperatingCommitment,
  OperatingDependency,
  OperatingFollowUp,
  OperatingGoal,
  OperatingIssue,
  OperatingMetric,
  OperatingOwner,
  OperatingWorkstream,
} from "@/domain/operations/types";

export interface OperatingRepositorySnapshot {
  owners: OperatingOwner[];
  goals: OperatingGoal[];
  metrics: OperatingMetric[];
  workstreams: OperatingWorkstream[];
  commitments: OperatingCommitment[];
  dependencies: OperatingDependency[];
  issues: OperatingIssue[];
  followUps: OperatingFollowUp[];
  cadences: OperatingCadence[];
}

export interface OperatingRepository {
  saveOwner(
    owner: OperatingOwner,
  ): Promise<void>;

  saveGoal(
    goal: OperatingGoal,
  ): Promise<void>;

  saveMetric(
    metric: OperatingMetric,
  ): Promise<void>;

  saveWorkstream(
    workstream: OperatingWorkstream,
  ): Promise<void>;

  saveCommitment(
    commitment: OperatingCommitment,
  ): Promise<void>;

  saveDependency(
    dependency: OperatingDependency,
  ): Promise<void>;

  saveIssue(
    issue: OperatingIssue,
  ): Promise<void>;

  saveFollowUp(
    followUp: OperatingFollowUp,
  ): Promise<void>;

  saveCadence(
    cadence: OperatingCadence,
  ): Promise<void>;

  getOwner(
    id: string,
  ): Promise<OperatingOwner | undefined>;

  getGoal(
    id: string,
  ): Promise<OperatingGoal | undefined>;

  getMetric(
    id: string,
  ): Promise<OperatingMetric | undefined>;

  getWorkstream(
    id: string,
  ): Promise<OperatingWorkstream | undefined>;

  getCommitment(
    id: string,
  ): Promise<OperatingCommitment | undefined>;

  getDependency(
    id: string,
  ): Promise<OperatingDependency | undefined>;

  getIssue(
    id: string,
  ): Promise<OperatingIssue | undefined>;

  getFollowUp(
    id: string,
  ): Promise<OperatingFollowUp | undefined>;

  getCadence(
    id: string,
  ): Promise<OperatingCadence | undefined>;

  getSnapshot():
    Promise<OperatingRepositorySnapshot>;
}

function clone<T>(
  value: T,
): T {
  return structuredClone(value);
}

export class InMemoryOperatingRepository
  implements OperatingRepository
{
  private readonly owners =
    new Map<
      string,
      OperatingOwner
    >();

  private readonly goals =
    new Map<
      string,
      OperatingGoal
    >();

  private readonly metrics =
    new Map<
      string,
      OperatingMetric
    >();

  private readonly workstreams =
    new Map<
      string,
      OperatingWorkstream
    >();

  private readonly commitments =
    new Map<
      string,
      OperatingCommitment
    >();

  private readonly dependencies =
    new Map<
      string,
      OperatingDependency
    >();

  private readonly issues =
    new Map<
      string,
      OperatingIssue
    >();

  private readonly followUps =
    new Map<
      string,
      OperatingFollowUp
    >();

  private readonly cadences =
    new Map<
      string,
      OperatingCadence
    >();

  async saveOwner(
    owner: OperatingOwner,
  ): Promise<void> {
    this.owners.set(
      owner.id,
      clone(owner),
    );
  }

  async saveGoal(
    goal: OperatingGoal,
  ): Promise<void> {
    this.goals.set(
      goal.id,
      clone(goal),
    );
  }

  async saveMetric(
    metric: OperatingMetric,
  ): Promise<void> {
    this.metrics.set(
      metric.id,
      clone(metric),
    );
  }

  async saveWorkstream(
    workstream: OperatingWorkstream,
  ): Promise<void> {
    this.workstreams.set(
      workstream.id,
      clone(workstream),
    );
  }

  async saveCommitment(
    commitment: OperatingCommitment,
  ): Promise<void> {
    this.commitments.set(
      commitment.id,
      clone(commitment),
    );
  }

  async saveDependency(
    dependency: OperatingDependency,
  ): Promise<void> {
    this.dependencies.set(
      dependency.id,
      clone(dependency),
    );
  }

  async saveIssue(
    issue: OperatingIssue,
  ): Promise<void> {
    this.issues.set(
      issue.id,
      clone(issue),
    );
  }

  async saveFollowUp(
    followUp: OperatingFollowUp,
  ): Promise<void> {
    this.followUps.set(
      followUp.id,
      clone(followUp),
    );
  }

  async saveCadence(
    cadence: OperatingCadence,
  ): Promise<void> {
    this.cadences.set(
      cadence.id,
      clone(cadence),
    );
  }

  async getOwner(
    id: string,
  ): Promise<OperatingOwner | undefined> {
    const value =
      this.owners.get(id);

    return value
      ? clone(value)
      : undefined;
  }

  async getGoal(
    id: string,
  ): Promise<OperatingGoal | undefined> {
    const value =
      this.goals.get(id);

    return value
      ? clone(value)
      : undefined;
  }

  async getMetric(
    id: string,
  ): Promise<OperatingMetric | undefined> {
    const value =
      this.metrics.get(id);

    return value
      ? clone(value)
      : undefined;
  }

  async getWorkstream(
    id: string,
  ): Promise<OperatingWorkstream | undefined> {
    const value =
      this.workstreams.get(id);

    return value
      ? clone(value)
      : undefined;
  }

  async getCommitment(
    id: string,
  ): Promise<OperatingCommitment | undefined> {
    const value =
      this.commitments.get(id);

    return value
      ? clone(value)
      : undefined;
  }

  async getDependency(
    id: string,
  ): Promise<OperatingDependency | undefined> {
    const value =
      this.dependencies.get(id);

    return value
      ? clone(value)
      : undefined;
  }

  async getIssue(
    id: string,
  ): Promise<OperatingIssue | undefined> {
    const value =
      this.issues.get(id);

    return value
      ? clone(value)
      : undefined;
  }

  async getFollowUp(
    id: string,
  ): Promise<OperatingFollowUp | undefined> {
    const value =
      this.followUps.get(id);

    return value
      ? clone(value)
      : undefined;
  }

  async getCadence(
    id: string,
  ): Promise<OperatingCadence | undefined> {
    const value =
      this.cadences.get(id);

    return value
      ? clone(value)
      : undefined;
  }

  async getSnapshot():
    Promise<OperatingRepositorySnapshot> {
    return {
      owners: clone(
        [...this.owners.values()],
      ),

      goals: clone(
        [...this.goals.values()],
      ),

      metrics: clone(
        [...this.metrics.values()],
      ),

      workstreams: clone(
        [...this.workstreams.values()],
      ),

      commitments: clone(
        [...this.commitments.values()],
      ),

      dependencies: clone(
        [...this.dependencies.values()],
      ),

      issues: clone(
        [...this.issues.values()],
      ),

      followUps: clone(
        [...this.followUps.values()],
      ),

      cadences: clone(
        [...this.cadences.values()],
      ),
    };
  }
}