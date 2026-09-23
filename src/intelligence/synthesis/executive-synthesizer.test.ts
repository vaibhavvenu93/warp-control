import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  BrainCitation,
  BrainSynthesisInput,
} from "@/domain/brain/types";

import type {
  ExecutiveSynthesisPlan,
} from "@/domain/brain/synthesis/types";

import {
  ExecutiveSupportValidator,
} from "@/intelligence/synthesis/support-validator";

import {
  ExecutiveSynthesizer,
} from "@/intelligence/synthesis/executive-synthesizer";

function citation(
  overrides:
    Partial<BrainCitation> & {
      id: string;
      claimId: string;
      statement: string;
    },
): BrainCitation {
  return {
    sourceId:
      "source-test",

    state:
      "KNOWN",

    provenance:
      "INTERNAL",

    confidence:
      0.9,

    ...overrides,
  };
}

function input(
  overrides:
    Partial<BrainSynthesisInput> = {},
): BrainSynthesisInput {
  return {
    question:
      "Should we pursue Northstar Labs?",

    intent:
      "DECISION_SUPPORT",

    answerability: {
      status:
        "HUMAN_JUDGMENT_REQUIRED",

      confidence:
        0.7616,

      factors: [],

      reasons: [
        "Human decision required.",
      ],

      caveats: [
        "Modeled evidence is present.",
      ],

      unresolvedQuestions: [
        "The procurement owner for Northstar Labs is unknown.",
      ],

      requiredEvidence: [
        "CRM contact data",
        "Account research",
      ],

      humanJudgmentRequired:
        true,

      evidenceProfile: {
        known: 1,
        inferred: 0,
        modeled: 1,
        unknown: 1,
        public: 0,
        connected: 0,
        internal: 2,
        assumed: 0,
      },

      policy: {
        mayAnswer: true,
        mayRecommend: false,
        mustDiscloseCaveats:
          true,
        mustRequestEvidence:
          true,
      },
    },

    citations: [
      citation({
        id:
          "citation-known",

        claimId:
          "claim-known",

        statement:
          "Revenue Intelligence recommends enterprise discovery for Northstar Labs and requires human review before execution.",

        state:
          "KNOWN",

        provenance:
          "INTERNAL",

        confidence:
          0.7658,
      }),

      citation({
        id:
          "citation-modeled",

        claimId:
          "claim-modeled",

        statement:
          "Northstar Labs has a modeled WarpScore of 90.8 and is classified STRATEGIC in the deterministic demonstration.",

        state:
          "MODELED",

        provenance:
          "MODELED",

        confidence:
          0.7616,
      }),

      citation({
        id:
          "citation-unknown",

        claimId:
          "claim-unknown",

        statement:
          "The procurement owner for Northstar Labs is unknown.",

        state:
          "UNKNOWN",

        provenance:
          "INTERNAL",

        confidence:
          1,
      }),
    ],

    ...overrides,
  };
}

describe(
  "ExecutiveSynthesizer",
  () => {
    const synthesizer =
      new ExecutiveSynthesizer();

    it(
      "creates an executive decision-support structure",
      () => {
        const result =
          synthesizer.createPlan(
            input(),
          );

        expect(
          result.plan.mode,
        ).toBe(
          "HUMAN_DECISION_SUPPORT",
        );

        expect(
          result.plan.blocks.some(
            (block) =>
              block.type ===
              "DECISION",
          ),
        ).toBe(true);

        expect(
          result.plan.blocks.some(
            (block) =>
              block.type ===
              "SYSTEM_BOUNDARY",
          ),
        ).toBe(true);
      },
    );

    it(
      "separates known, modeled and unknown knowledge",
      () => {
        const result =
          synthesizer.createPlan(
            input(),
          );

        expect(
          result.plan.blocks.some(
            (block) =>
              block.type ===
              "KNOWN",
          ),
        ).toBe(true);

        expect(
          result.plan.blocks.some(
            (block) =>
              block.type ===
              "MODELED",
          ),
        ).toBe(true);

        expect(
          result.plan.blocks.some(
            (block) =>
              block.type ===
              "BLIND_SPOT",
          ),
        ).toBe(true);
      },
    );

    it(
      "keeps modeled assertions attached to modeled citations",
      () => {
        const result =
          synthesizer.createPlan(
            input(),
          );

        const modeled =
          result.plan.blocks.find(
            (block) =>
              block.type ===
              "MODELED",
          );

        expect(
          modeled?.assertions[0]
            .support,
        ).toBe(
          "MODELED",
        );

        expect(
          modeled?.assertions[0]
            .citationIds,
        ).toEqual([
          "citation-modeled",
        ]);
      },
    );

    it(
      "turns unknown knowledge into an explicit blind spot",
      () => {
        const result =
          synthesizer.createPlan(
            input(),
          );

        const blindSpot =
          result.plan.blocks.find(
            (block) =>
              block.type ===
              "BLIND_SPOT",
          );

        expect(
          blindSpot?.assertions[0]
            .text,
        ).toContain(
          "procurement owner",
        );

        expect(
          blindSpot?.assertions[0]
            .support,
        ).toBe(
          "UNKNOWN",
        );
      },
    );

    it(
      "preserves required evidence as an executive block",
      () => {
        const result =
          synthesizer.createPlan(
            input(),
          );

        const evidence =
          result.plan.blocks.find(
            (block) =>
              block.type ===
              "EVIDENCE_REQUIRED",
          );

        expect(
          evidence?.assertions.map(
            (assertion) =>
              assertion.text,
          ),
        ).toEqual([
          "CRM contact data",
          "Account research",
        ]);
      },
    );

    it(
      "validates the generated plan",
      () => {
        const result =
          synthesizer.createPlan(
            input(),
          );

        expect(
          result.validation.valid,
        ).toBe(true);

        expect(
          result.validation
            .violations,
        ).toHaveLength(0);
      },
    );

    it(
      "blocks a factual assertion with no citation",
      () => {
        const validator =
          new ExecutiveSupportValidator();

        const plan:
          ExecutiveSynthesisPlan = {
            mode:
              "DIRECT",

            headline:
              "Test",

            confidence:
              0.9,

            citations:
              input().citations,

            caveats: [],

            unresolvedQuestions:
              [],

            requiredEvidence:
              [],

            humanJudgmentRequired:
              false,

            blocks: [
              {
                id:
                  "block-bad",

                type:
                  "KNOWN",

                label:
                  "Known",

                severity:
                  "INFO",

                assertions: [
                  {
                    id:
                      "assertion-bad",

                    text:
                      "Unsupported factual statement.",

                    citationIds:
                      [],

                    support:
                      "SUPPORTED",
                  },
                ],
              },
            ],
          };

        const result =
          validator.validate(
            plan,
          );

        expect(
          result.valid,
        ).toBe(false);

        expect(
          result.violations[0]
            .reason,
        ).toBe(
          "MISSING_CITATION",
        );
      },
    );

    it(
      "blocks references to nonexistent citations",
      () => {
        const validator =
          new ExecutiveSupportValidator();

        const plan:
          ExecutiveSynthesisPlan = {
            mode:
              "DIRECT",

            headline:
              "Test",

            confidence:
              0.9,

            citations:
              input().citations,

            caveats: [],

            unresolvedQuestions:
              [],

            requiredEvidence:
              [],

            humanJudgmentRequired:
              false,

            blocks: [
              {
                id:
                  "block-bad",

                type:
                  "KNOWN",

                label:
                  "Known",

                severity:
                  "INFO",

                assertions: [
                  {
                    id:
                      "assertion-bad",

                    text:
                      "Fact",

                    citationIds: [
                      "citation-does-not-exist",
                    ],

                    support:
                      "SUPPORTED",
                  },
                ],
              },
            ],
          };

        const result =
          validator.validate(
            plan,
          );

        expect(
          result.valid,
        ).toBe(false);

        expect(
          result.violations[0]
            .reason,
        ).toBe(
          "UNKNOWN_CITATION",
        );
      },
    );

    it(
      "detects a modeled claim mislabeled as known",
      () => {
        const validator =
          new ExecutiveSupportValidator();

        const plan:
          ExecutiveSynthesisPlan = {
            mode:
              "DIRECT",

            headline:
              "Test",

            confidence:
              0.9,

            citations:
              input().citations,

            caveats: [],

            unresolvedQuestions:
              [],

            requiredEvidence:
              [],

            humanJudgmentRequired:
              false,

            blocks: [
              {
                id:
                  "block-bad",

                type:
                  "KNOWN",

                label:
                  "Known",

                severity:
                  "INFO",

                assertions: [
                  {
                    id:
                      "assertion-bad",

                    text:
                      "WarpScore is 90.8.",

                    citationIds: [
                      "citation-modeled",
                    ],

                    support:
                      "SUPPORTED",
                  },
                ],
              },
            ],
          };

        const result =
          validator.validate(
            plan,
          );

        expect(
          result.valid,
        ).toBe(false);

        expect(
          result.violations[0]
            .reason,
        ).toBe(
          "STATE_MISMATCH",
        );
      },
    );

    it(
      "allows policy statements without citations",
      () => {
        const result =
          synthesizer.createPlan(
            input(),
          );

        const policyAssertions =
          result.plan.blocks
            .flatMap(
              (block) =>
                block.assertions,
            )
            .filter(
              (assertion) =>
                assertion.support ===
                "POLICY",
            );

        expect(
          policyAssertions.length,
        ).toBeGreaterThan(0);

        expect(
          policyAssertions.every(
            (assertion) =>
              assertion.citationIds
                .length === 0,
          ),
        ).toBe(true);

        expect(
          result.validation.valid,
        ).toBe(true);
      },
    );

    it(
      "produces a grounded BrainSynthesisOutput",
      () => {
        const result =
          synthesizer.synthesize(
            input(),
          );

        expect(
          result.mode,
        ).toBe(
          "HUMAN_DECISION_SUPPORT",
        );

        expect(
          result.usedCitationIds,
        ).toContain(
          "citation-known",
        );

        expect(
          result.usedCitationIds,
        ).toContain(
          "citation-modeled",
        );

        expect(
          result.sections.some(
            (section) =>
              section.title ===
              "Critical blind spots",
          ),
        ).toBe(true);
      },
    );

    it(
      "does not put unknown claims into the synthesized answer body",
      () => {
        const result =
          synthesizer.synthesize(
            input(),
          );

        expect(
          result.answer,
        ).not.toContain(
          "procurement owner for Northstar Labs is unknown",
        );

        expect(
          result.sections.some(
            (section) =>
              section.kind ===
              "UNKNOWN",
          ),
        ).toBe(true);
      },
    );

    it(
      "creates an abstention structure when evidence is insufficient",
      () => {
        const insufficient =
          input({
            citations: [],

            answerability: {
              ...input()
                .answerability,

              status:
                "INSUFFICIENT_EVIDENCE",

              confidence:
                0,

              caveats: [],

              unresolvedQuestions:
                [],

              requiredEvidence:
                [],

              humanJudgmentRequired:
                false,

              evidenceProfile: {
                known: 0,
                inferred: 0,
                modeled: 0,
                unknown: 0,
                public: 0,
                connected: 0,
                internal: 0,
                assumed: 0,
              },

              policy: {
                mayAnswer:
                  false,

                mayRecommend:
                  false,

                mustDiscloseCaveats:
                  false,

                mustRequestEvidence:
                  true,
              },
            },
          });

        const result =
          synthesizer.synthesize(
            insufficient,
          );

        expect(
          result.mode,
        ).toBe(
          "ABSTAIN",
        );

        expect(
          result.usedCitationIds,
        ).toHaveLength(0);
      },
    );
  },
);