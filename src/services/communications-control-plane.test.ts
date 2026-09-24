import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildCommunicationsDemo,
} from "@/services/communications-control-plane";

describe(
  "communications control plane",
  () => {
    it(
      "builds the governed demo",
      async () => {
        const controlPlane =
          await buildCommunicationsDemo();

        const snapshot =
          await controlPlane.getSnapshot();

        expect(
          snapshot.claims.length,
        ).toBeGreaterThan(0);

        expect(
          snapshot.briefs.length,
        ).toBe(4);
      },
    );

    it(
      "validates every communication claim",
      async () => {
        const controlPlane =
          await buildCommunicationsDemo();

        const snapshot =
          await controlPlane.getSnapshot();

        expect(
          snapshot.validations,
        ).toHaveLength(
          snapshot.claims.length,
        );
      },
    );

    it(
      "keeps modeled internal claims explicitly modeled",
      async () => {
        const controlPlane =
          await buildCommunicationsDemo();

        const snapshot =
          await controlPlane.getSnapshot();

        const validation =
          snapshot.validations.find(
            (item) =>
              item.claimId ===
              "claim-operating-health",
          );

        expect(
          validation?.state,
        ).toBe("MODELED");
      },
    );

    it(
      "supports the public positioning claim",
      async () => {
        const controlPlane =
          await buildCommunicationsDemo();

        const snapshot =
          await controlPlane.getSnapshot();

        const validation =
          snapshot.validations.find(
            (item) =>
              item.claimId ===
              "claim-public-positioning",
          );

        expect(
          validation?.state,
        ).toBe("SUPPORTED");
      },
    );

    it(
      "blocks assumed investor revenue claims",
      async () => {
        const controlPlane =
          await buildCommunicationsDemo();

        const snapshot =
          await controlPlane.getSnapshot();

        const validation =
          snapshot.validations.find(
            (item) =>
              item.claimId ===
              "claim-investor-revenue",
          );

        expect(
          validation?.state,
        ).toBe("BLOCKED");
      },
    );

    it(
      "blocks unsupported external growth claims",
      async () => {
        const controlPlane =
          await buildCommunicationsDemo();

        const snapshot =
          await controlPlane.getSnapshot();

        const validation =
          snapshot.validations.find(
            (item) =>
              item.claimId ===
              "claim-unsupported-customer-growth",
          );

        expect(
          validation?.state,
        ).toBe("BLOCKED");
      },
    );

    it(
      "keeps unsupported claims out of investor brief content",
      async () => {
        const controlPlane =
          await buildCommunicationsDemo();

        const snapshot =
          await controlPlane.getSnapshot();

        const investor =
          snapshot.briefs.find(
            (brief) =>
              brief.id ===
              "brief-investor-demo",
          );

        expect(
          investor,
        ).toBeDefined();

        expect(
          investor?.claimIds,
        ).toContain(
          "claim-public-positioning",
        );

        expect(
          investor?.claimIds,
        ).not.toContain(
          "claim-investor-revenue",
        );

        expect(
          investor?.claimIds,
        ).not.toContain(
          "claim-unsupported-customer-growth",
        );
      },
    );

    it(
      "records blocked claims on investor brief",
      async () => {
        const controlPlane =
          await buildCommunicationsDemo();

        const snapshot =
          await controlPlane.getSnapshot();

        const investor =
          snapshot.briefs.find(
            (brief) =>
              brief.id ===
              "brief-investor-demo",
          );

        expect(
          investor
            ?.blockedClaimIds,
        ).toContain(
          "claim-investor-revenue",
        );
      },
    );

    it(
      "renders the CEO brief",
      async () => {
        const controlPlane =
          await buildCommunicationsDemo();

        const rendered =
          await controlPlane.renderBrief(
            "brief-ceo-weekly",
          );

        expect(rendered).toContain(
          "CEO Weekly Operating Brief",
        );

        expect(rendered).toContain(
          "Executive Summary",
        );
      },
    );

    it(
      "requires approval for external communication",
      async () => {
        const controlPlane =
          await buildCommunicationsDemo();

        const snapshot =
          await controlPlane.getSnapshot();

        const external =
          snapshot.briefs.find(
            (brief) =>
              brief.id ===
              "brief-external-demo",
          );

        expect(
          external
            ?.humanApprovalRequired,
        ).toBe(true);
      },
    );

    it(
      "can approve a brief with no blocked claims",
      async () => {
        const controlPlane =
          await buildCommunicationsDemo();

        const approved =
          await controlPlane.approveBrief(
            "brief-ceo-weekly",
            "CEO",
          );

        expect(
          approved.approvalState,
        ).toBe("APPROVED");
      },
    );

    it(
      "reports communication governance metrics",
      async () => {
        const controlPlane =
          await buildCommunicationsDemo();

        const snapshot =
          await controlPlane.getSnapshot();

        expect(
          snapshot.metrics
            .totalClaims,
        ).toBe(
          snapshot.claims.length,
        );

        expect(
          snapshot.metrics
            .blockedClaims,
        ).toBeGreaterThan(0);

        expect(
          snapshot.metrics
            .modeledClaims,
        ).toBeGreaterThan(0);
      },
    );
  },
);