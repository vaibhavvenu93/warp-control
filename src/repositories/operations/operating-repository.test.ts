import {
  describe,
  expect,
  it,
} from "vitest";

import {
  InMemoryOperatingRepository,
} from "@/repositories/operations/operating-repository";

describe(
  "operating repository",
  () => {
    it(
      "stores and retrieves operating entities",
      async () => {
        const repository =
          new InMemoryOperatingRepository();

        await repository.saveOwner({
          id: "owner-1",
          name: "Operator",
          role: "Chief of Staff",
        });

        await repository.saveGoal({
          id: "goal-1",
          title: "Demo goal",
          description:
            "Modeled operating goal.",
          status: "ACTIVE",
          priority: "HIGH",
          ownerId: "owner-1",
          startAt:
            "2026-09-01T00:00:00.000Z",
          targetAt:
            "2026-12-31T00:00:00.000Z",
          metricIds: [],
          workstreamIds: [],
        });

        expect(
          await repository.getOwner(
            "owner-1",
          ),
        ).toMatchObject({
          name: "Operator",
        });

        expect(
          await repository.getGoal(
            "goal-1",
          ),
        ).toMatchObject({
          priority: "HIGH",
        });
      },
    );

    it(
      "upserts entities by id",
      async () => {
        const repository =
          new InMemoryOperatingRepository();

        await repository.saveOwner({
          id: "owner-1",
          name: "First",
          role: "Operator",
        });

        await repository.saveOwner({
          id: "owner-1",
          name: "Updated",
          role: "Operator",
        });

        const snapshot =
          await repository.getSnapshot();

        expect(
          snapshot.owners,
        ).toHaveLength(1);

        expect(
          snapshot.owners[0].name,
        ).toBe("Updated");
      },
    );

    it(
      "returns defensive copies rather than mutable repository state",
      async () => {
        const repository =
          new InMemoryOperatingRepository();

        await repository.saveOwner({
          id: "owner-1",
          name: "Original",
          role: "Operator",
        });

        const owner =
          await repository.getOwner(
            "owner-1",
          );

        if (!owner) {
          throw new Error(
            "Expected owner.",
          );
        }

        owner.name = "Mutated";

        const stored =
          await repository.getOwner(
            "owner-1",
          );

        expect(
          stored?.name,
        ).toBe("Original");
      },
    );

    it(
      "returns a complete repository snapshot",
      async () => {
        const repository =
          new InMemoryOperatingRepository();

        await repository.saveMetric({
          id: "metric-1",
          name: "Demo metric",
          unit: "NUMBER",
          direction: "INCREASE",
          status: "ON_TRACK",
        });

        await repository.saveCadence({
          id: "cadence-1",
          title: "Weekly review",
          description:
            "Operating review.",
          cadence: "WEEKLY",
          reviewType: "COMPANY",
          participantIds: [],
          metricIds: [
            "metric-1",
          ],
          goalIds: [],
          workstreamIds: [],
          enabled: true,
        });

        const snapshot =
          await repository.getSnapshot();

        expect(
          snapshot.metrics,
        ).toHaveLength(1);

        expect(
          snapshot.cadences,
        ).toHaveLength(1);

        expect(
          snapshot.commitments,
        ).toEqual([]);

        expect(
          snapshot.issues,
        ).toEqual([]);
      },
    );
  },
);