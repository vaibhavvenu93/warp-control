import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createExternalSource,
  ExternalSourceRegistry,
  externalSourceToKnowledgeSource,
} from "./source-registry";

function source() {
  return createExternalSource({
    id: "source-test",
    name: "Test Source",
    kind: "WEBSITE",
    sourceType:
      "PUBLIC_WEB",
    provenance:
      "PUBLIC",
    uri:
      "https://example.com",
    description:
      "Test external source.",
    trustScore:
      0.85,
    enabled: true,
    pollingEligible:
      true,
    tags: ["test"],
    metadata: {},
  });
}

describe(
  "ExternalSourceRegistry",
  () => {
    it(
      "registers a source",
      () => {
        const registry =
          new ExternalSourceRegistry();

        registry.register(
          source(),
        );

        expect(
          registry.require(
            "source-test",
          ).name,
        ).toBe(
          "Test Source",
        );
      },
    );

    it(
      "rejects duplicate registration",
      () => {
        const registry =
          new ExternalSourceRegistry();

        registry.register(
          source(),
        );

        expect(() =>
          registry.register(
            source(),
          ),
        ).toThrow(
          /already registered/,
        );
      },
    );

    it(
      "filters enabled polling sources",
      () => {
        const registry =
          new ExternalSourceRegistry();

        registry.register(
          source(),
        );

        expect(
          registry
            .getPollingEligible(),
        ).toHaveLength(1);
      },
    );

    it(
      "maps an external source into Company Brain source semantics",
      () => {
        const mapped =
          externalSourceToKnowledgeSource(
            source(),
          );

        expect(
          mapped.type,
        ).toBe(
          "PUBLIC_WEB",
        );

        expect(
          mapped.provenance,
        ).toBe("PUBLIC");

        expect(
          mapped.trustScore,
        ).toBe(0.85);

        expect(
          mapped.readOnly,
        ).toBe(true);
      },
    );

    it(
      "rejects invalid trust scores",
      () => {
        expect(() =>
          createExternalSource({
            ...source(),
            id:
              "invalid-source",
            trustScore:
              1.5,
          }),
        ).toThrow(
          /between 0 and 1/,
        );
      },
    );
  },
);