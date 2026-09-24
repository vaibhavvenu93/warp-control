import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  MarketClaim,
} from "@/domain/market-radar/claims/claim-types";

import {
  InMemoryClaimRepository,
} from "./claim-repository";

function makeClaim(
  id: string,
  confidence: number,
): MarketClaim {
  return {
    id,

    fingerprint:
      `fingerprint-${id}`,

    type:
      "GENERAL_OBSERVATION",

    subject:
      "WarpBuild",

    normalizedSubject:
      "warpbuild",

    predicate:
      "has an observed market update",

    object:
      id,

    statement:
      `WarpBuild has an observed market update: ${id}.`,

    categories: [],

    entities: [],

    evidence: [],

    epistemicState:
      "OBSERVED",

    strength:
      "MODERATE",

    confidence,

    firstObservedAt:
      "2026-09-23T10:00:00.000Z",

    lastObservedAt:
      "2026-09-23T10:00:00.000Z",

    createdAt:
      "2026-09-23T12:00:00.000Z",

    updatedAt:
      "2026-09-23T12:00:00.000Z",

    metadata: {},
  };
}

describe(
  "InMemoryClaimRepository",
  () => {
    it(
      "stores claims",
      () => {
        const repository =
          new InMemoryClaimRepository();

        repository.save(
          makeClaim(
            "claim-1",
            70,
          ),
        );

        expect(
          repository.count(),
        ).toBe(1);
      },
    );

    it(
      "indexes claims by fingerprint",
      () => {
        const repository =
          new InMemoryClaimRepository();

        const item =
          makeClaim(
            "claim-1",
            70,
          );

        repository.save(
          item,
        );

        expect(
          repository
            .getByFingerprint(
              item.fingerprint,
            )
            ?.id,
        ).toBe(
          "claim-1",
        );
      },
    );

    it(
      "returns claims ordered by confidence",
      () => {
        const repository =
          new InMemoryClaimRepository();

        repository.save(
          makeClaim(
            "claim-low",
            40,
          ),
        );

        repository.save(
          makeClaim(
            "claim-high",
            90,
          ),
        );

        expect(
          repository
            .getAll()[0]
            .id,
        ).toBe(
          "claim-high",
        );
      },
    );

    it(
      "finds claims by normalized subject",
      () => {
        const repository =
          new InMemoryClaimRepository();

        repository.save(
          makeClaim(
            "claim-1",
            70,
          ),
        );

        expect(
          repository
            .getBySubject(
              "WARPBUILD",
            ),
        ).toHaveLength(1);
      },
    );
  },
);