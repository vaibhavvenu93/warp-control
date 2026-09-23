import {
  describe,
  expect,
  it,
} from "vitest";

import {
  calculateFreshness,
  isStaleObservation,
} from "./freshness-policy";

const NOW =
  "2026-09-23T12:00:00.000Z";

describe(
  "Market Radar freshness policy",
  () => {
    it(
      "classifies same-day intelligence as fresh",
      () => {
        const result =
          calculateFreshness(
            "2026-09-23T06:00:00.000Z",
            NOW,
          );

        expect(
          result.band,
        ).toBe("FRESH");

        expect(
          result.ageHours,
        ).toBe(6);
      },
    );

    it(
      "classifies recent intelligence correctly",
      () => {
        const result =
          calculateFreshness(
            "2026-09-20T12:00:00.000Z",
            NOW,
          );

        expect(
          result.band,
        ).toBe("RECENT");
      },
    );

    it(
      "classifies older intelligence as aging",
      () => {
        const result =
          calculateFreshness(
            "2026-09-10T12:00:00.000Z",
            NOW,
          );

        expect(
          result.band,
        ).toBe("AGING");
      },
    );

    it(
      "classifies sufficiently old intelligence as stale",
      () => {
        const result =
          calculateFreshness(
            "2026-07-01T12:00:00.000Z",
            NOW,
          );

        expect(
          result.band,
        ).toBe("STALE");

        expect(
          isStaleObservation(
            result,
          ),
        ).toBe(true);
      },
    );

    it(
      "never produces a negative age for future timestamps",
      () => {
        const result =
          calculateFreshness(
            "2026-09-24T12:00:00.000Z",
            NOW,
          );

        expect(
          result.ageHours,
        ).toBe(0);

        expect(
          result.score,
        ).toBe(100);
      },
    );
  },
);