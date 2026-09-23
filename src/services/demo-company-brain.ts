import {
  seedCompanyBrain,
} from "@/data/demo/knowledge/seed-company-brain";

import {
  InMemoryKnowledgeRepository,
} from "@/repositories/knowledge/knowledge-repository";

import {
  CompanyBrain,
} from "@/services/company-brain";

const DEMO_NOW =
  "2026-09-23T12:00:00.000Z";

export interface DemoCompanyBrainEnvironment {
  brain: CompanyBrain;
  repository:
    InMemoryKnowledgeRepository;
}

let environmentPromise:
  Promise<DemoCompanyBrainEnvironment>
  | undefined;

async function createEnvironment():
  Promise<DemoCompanyBrainEnvironment> {
  const repository =
    new InMemoryKnowledgeRepository();

  await seedCompanyBrain(
    repository,
  );

  const brain =
    new CompanyBrain(
      repository,
      {
        now: () =>
          DEMO_NOW,

        createId: (() => {
          let counter = 0;

          return () => {
            counter += 1;

            return `brain-demo-${counter}`;
          };
        })(),

        createCorrelationId:
          (() => {
            let counter = 0;

            return () => {
              counter += 1;

              return `corr-brain-demo-${counter}`;
            };
          })(),
      },
    );

  return {
    brain,
    repository,
  };
}

export async function
getDemoCompanyBrainEnvironment():
  Promise<DemoCompanyBrainEnvironment> {
  if (!environmentPromise) {
    environmentPromise =
      createEnvironment();
  }

  return environmentPromise;
}

export async function
getDemoCompanyBrain():
  Promise<CompanyBrain> {
  const environment =
    await getDemoCompanyBrainEnvironment();

  return environment.brain;
}