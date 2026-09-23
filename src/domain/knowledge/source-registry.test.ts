import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createKnowledgeSource,
  KnowledgeSourceRegistry,
  provenanceReliability,
} from "@/domain/knowledge/source-registry";

describe(
  "knowledge source registry",
  () => {
    it(
      "maps provenance to deterministic reliability",
      () => {
        expect(
          provenanceReliability(
            "INTERNAL",
          ),
        ).toBe(1);

        expect(
          provenanceReliability(
            "CONNECTED",
          ),
        ).toBe(0.95);

        expect(
          provenanceReliability(
            "PUBLIC",
          ),
        ).toBe(0.85);

        expect(
          provenanceReliability(
            "MODELED",
          ),
        ).toBe(0.6);

        expect(
          provenanceReliability(
            "ASSUMED",
          ),
        ).toBe(0.35);
      },
    );

    it(
      "uses provenance reliability as default trust",
      () => {
        const source =
          createKnowledgeSource({
            id: "source-test",
            name: "Test",
            type:
              "MODELED_ANALYSIS",
            provenance:
              "MODELED",
            description:
              "Test source",
          });

        expect(
          source.trustScore,
        ).toBe(0.6);
      },
    );

    it(
      "rejects invalid trust scores",
      () => {
        expect(() =>
          createKnowledgeSource({
            id: "source-test",
            name: "Test",
            type:
              "PUBLIC_WEB",
            provenance:
              "PUBLIC",
            description:
              "Test source",
            trustScore: 1.2,
          }),
        ).toThrow();
      },
    );

    it(
      "registers and retrieves sources",
      () => {
        const registry =
          new KnowledgeSourceRegistry();

        const source =
          createKnowledgeSource({
            id: "source-test",
            name: "Test",
            type:
              "CONNECTED_SYSTEM",
            provenance:
              "CONNECTED",
            description:
              "Test source",
            connected: true,
          });

        registry.register(
          source,
        );

        expect(
          registry.require(
            "source-test",
          ),
        ).toEqual(source);

        expect(
          registry.getConnected(),
        ).toHaveLength(1);
      },
    );

    it(
      "rejects duplicate registration",
      () => {
        const registry =
          new KnowledgeSourceRegistry();

        const source =
          createKnowledgeSource({
            id: "source-test",
            name: "Test",
            type:
              "INTERNAL_DOCUMENT",
            provenance:
              "INTERNAL",
            description:
              "Test source",
          });

        registry.register(
          source,
        );

        expect(() =>
          registry.register(
            source,
          ),
        ).toThrow(
          /already registered/,
        );
      },
    );

    it(
      "fails explicitly for unknown required sources",
      () => {
        const registry =
          new KnowledgeSourceRegistry();

        expect(() =>
          registry.require(
            "missing",
          ),
        ).toThrow(
          /Unknown knowledge source/,
        );
      },
    );
  },
);