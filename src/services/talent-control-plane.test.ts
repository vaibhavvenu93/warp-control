import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildTalentDemo,
} from "@/services/talent-control-plane";

describe(
  "talent control plane",
  () => {
    it(
      "builds the deterministic talent snapshot",
      async () => {
        const snapshot =
          await buildTalentDemo();

        expect(
          snapshot.generatedAt,
        ).toBe(
          "2026-09-24T12:00:00.000Z",
        );

        expect(
          snapshot.capabilityGaps,
        ).toHaveLength(3);

        expect(
          snapshot.searches,
        ).toHaveLength(2);

        expect(
          snapshot.candidates,
        ).toHaveLength(5);
      },
    );

    it(
      "keeps modeled hiring data explicitly bounded",
      async () => {
        const snapshot =
          await buildTalentDemo();

        expect(
          snapshot.disclaimer,
        ).toContain(
          "modeled examples",
        );

        expect(
          snapshot.disclaimer,
        ).toContain(
          "not claims about WarpBuild",
        );
      },
    );

    it(
      "assesses every capability gap",
      async () => {
        const snapshot =
          await buildTalentDemo();

        expect(
          snapshot
            .capabilityAssessments,
        ).toHaveLength(
          snapshot
            .capabilityGaps.length,
        );
      },
    );

    it(
      "calculates health for every hiring search",
      async () => {
        const snapshot =
          await buildTalentDemo();

        expect(
          snapshot.pipelineHealth,
        ).toHaveLength(
          snapshot.searches.length,
        );
      },
    );

    it(
      "identifies the intentionally shallow enterprise-readiness pipeline",
      async () => {
        const snapshot =
          await buildTalentDemo();

        const health =
          snapshot.pipelineHealth.find(
            (item) =>
              item.searchId ===
              "search-enterprise-readiness",
          );

        expect(
          health,
        ).toBeDefined();

        expect(
          [
            "AT_RISK",
            "OFF_TRACK",
          ],
        ).toContain(
          health?.health,
        );
      },
    );

    it(
      "surfaces a human hiring decision",
      async () => {
        const snapshot =
          await buildTalentDemo();

        expect(
          snapshot.attention.some(
            (item) =>
              item.decisionRequired,
          ),
        ).toBe(true);

        expect(
          snapshot.metrics
            .humanDecisions,
        ).toBeGreaterThan(0);
      },
    );

    it(
      "surfaces stale candidate follow-through",
      async () => {
        const snapshot =
          await buildTalentDemo();

        expect(
          snapshot.attention.some(
            (item) =>
              item.reasons.includes(
                "CANDIDATE_STALE",
              ),
          ),
        ).toBe(true);
      },
    );

    it(
      "does not convert the mitigated operating-leverage gap into an active search",
      async () => {
        const snapshot =
          await buildTalentDemo();

        const gap =
          snapshot.capabilityGaps.find(
            (item) =>
              item.id ===
              "gap-operating-leverage",
          );

        const assessment =
          snapshot
            .capabilityAssessments
            .find(
              (item) =>
                item.capabilityGapId ===
                gap?.id,
            );

        expect(
          gap?.status,
        ).toBe(
          "MITIGATED",
        );

        expect(
          assessment?.health,
        ).toBe(
          "ON_TRACK",
        );

        expect(
          assessment
            ?.recommendedAction,
        ).toBe("MONITOR");
      },
    );

    it(
      "produces useful executive metrics",
      async () => {
        const snapshot =
          await buildTalentDemo();

        expect(
          snapshot.metrics
            .activeSearches,
        ).toBe(2);

        expect(
          snapshot.metrics
            .activeCandidates,
        ).toBe(5);

        expect(
          snapshot.metrics
            .finalStageCandidates,
        ).toBe(1);
      },
    );
  },
);