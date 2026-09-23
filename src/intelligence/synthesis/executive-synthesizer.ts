import type {
  BrainAnswerSection,
  BrainCitation,
  BrainSynthesisInput,
  BrainSynthesisOutput,
} from "@/domain/brain/types";

import type {
  ExecutiveAssertion,
  ExecutiveBlock,
  ExecutiveSynthesisPlan,
  ValidatedExecutiveSynthesis,
} from "@/domain/brain/synthesis/types";

import {
  ExecutiveSupportValidator,
} from "@/intelligence/synthesis/support-validator";

function citationsByState(
  citations: BrainCitation[],
  state: BrainCitation["state"],
): BrainCitation[] {
  return citations.filter(
    (citation) =>
      citation.state === state,
  );
}

function assertionsFromCitations(
  prefix: string,
  citations: BrainCitation[],
  support: ExecutiveAssertion["support"],
): ExecutiveAssertion[] {
  return citations.map(
    (
      citation,
      index,
    ): ExecutiveAssertion => ({
      id: `${prefix}-${index + 1}`,
      text: citation.statement,
      citationIds: [
        citation.id,
      ],
      support,
    }),
  );
}

function policyAssertion(
  id: string,
  text: string,
): ExecutiveAssertion {
  return {
    id,
    text,
    citationIds: [],
    support: "POLICY",
  };
}

function block(
  input: ExecutiveBlock,
): ExecutiveBlock {
  return input;
}

function headlineFor(
  input: BrainSynthesisInput,
): string {
  switch (
    input.answerability.status
  ) {
    case "HUMAN_JUDGMENT_REQUIRED":
      return "Evidence supports decision review; final judgment remains human.";

    case "ANSWERABLE_WITH_CAVEATS":
      return "The evidence supports an answer with material caveats.";

    case "ANSWERABLE":
      return "The available evidence supports a direct answer.";

    case "CONFLICTING_EVIDENCE":
      return "Conflicting evidence must be reconciled before a conclusion is formed.";

    case "INSUFFICIENT_EVIDENCE":
    default:
      return "There is not enough reliable evidence to answer this question.";
  }
}

function modeFor(
  input: BrainSynthesisInput,
): ExecutiveSynthesisPlan["mode"] {
  switch (
    input.answerability.status
  ) {
    case "ANSWERABLE":
      return "DIRECT";

    case "ANSWERABLE_WITH_CAVEATS":
      return "CAVEATED";

    case "HUMAN_JUDGMENT_REQUIRED":
      return "HUMAN_DECISION_SUPPORT";

    case "CONFLICTING_EVIDENCE":
      return "CONFLICT";

    case "INSUFFICIENT_EVIDENCE":
    default:
      return "ABSTAIN";
  }
}

function answerSectionKind(
  type: ExecutiveBlock["type"],
): BrainAnswerSection["kind"] {
  switch (type) {
    case "MODELED":
      return "MODELED";

    case "BLIND_SPOT":
      return "UNKNOWN";

    case "DECISION":
    case "SYSTEM_BOUNDARY":
      return "DECISION_BOUNDARY";

    case "EVIDENCE_REQUIRED":
      return "NEXT_ACTION";

    case "SITUATION":
      return "SUMMARY";

    case "KNOWN":
    case "INFERRED":
    case "WHY_IT_MATTERS":
    default:
      return "EVIDENCE";
  }
}

export class ExecutiveSynthesizer {
  private readonly validator =
    new ExecutiveSupportValidator();

  createPlan(
    input: BrainSynthesisInput,
  ): ValidatedExecutiveSynthesis {
    const known =
      citationsByState(
        input.citations,
        "KNOWN",
      );

    const modeled =
      citationsByState(
        input.citations,
        "MODELED",
      );

    const inferred =
      citationsByState(
        input.citations,
        "INFERRED",
      );

    const unknown =
      citationsByState(
        input.citations,
        "UNKNOWN",
      );

    const blocks:
      ExecutiveBlock[] = [];

    if (
      input.answerability.status ===
      "INSUFFICIENT_EVIDENCE"
    ) {
      blocks.push(
        block({
          id: "block-situation",
          type: "SITUATION",
          label: "Situation",
          severity: "WARNING",
          assertions: [
            policyAssertion(
              "assertion-insufficient",
              "The Company Brain does not have enough reliable evidence to answer this question.",
            ),
          ],
        }),
      );
    } else if (
      input.answerability.status ===
      "CONFLICTING_EVIDENCE"
    ) {
      blocks.push(
        block({
          id: "block-situation",
          type: "SITUATION",
          label: "Situation",
          severity: "CRITICAL",
          assertions: [
            policyAssertion(
              "assertion-conflict",
              "The retrieved evidence contains unresolved contradictions and should not be collapsed into one conclusion.",
            ),
          ],
        }),
      );
    } else {
      blocks.push(
        block({
          id: "block-situation",
          type: "SITUATION",
          label: "Situation",
          severity:
            input.answerability
              .humanJudgmentRequired
              ? "DECISION"
              : "INFO",
          assertions: [
            policyAssertion(
              "assertion-situation",
              input.answerability
                .humanJudgmentRequired
                ? "The evidence is sufficient to support a decision review, but not to make the final business decision autonomously."
                : "The retrieved evidence meets the current answerability threshold.",
            ),
          ],
        }),
      );
    }

    if (known.length > 0) {
      blocks.push(
        block({
          id: "block-known",
          type: "KNOWN",
          label: "What we know",
          severity: "INFO",
          assertions:
            assertionsFromCitations(
              "assertion-known",
              known,
              "SUPPORTED",
            ),
        }),
      );
    }

    if (modeled.length > 0) {
      blocks.push(
        block({
          id: "block-modeled",
          type: "MODELED",
          label: "Modeled analysis",
          severity: "OPPORTUNITY",
          assertions:
            assertionsFromCitations(
              "assertion-modeled",
              modeled,
              "MODELED",
            ),
        }),
      );
    }

    if (inferred.length > 0) {
      blocks.push(
        block({
          id: "block-inferred",
          type: "INFERRED",
          label: "What is inferred",
          severity: "WARNING",
          assertions:
            assertionsFromCitations(
              "assertion-inferred",
              inferred,
              "INFERRED",
            ),
        }),
      );
    }

    if (unknown.length > 0) {
      blocks.push(
        block({
          id: "block-unknown",
          type: "BLIND_SPOT",
          label: "Critical blind spots",
          severity: "WARNING",
          assertions:
            assertionsFromCitations(
              "assertion-unknown",
              unknown,
              "UNKNOWN",
            ),
        }),
      );
    }

    if (
      input.answerability
        .requiredEvidence
        .length > 0
    ) {
      blocks.push(
        block({
          id:
            "block-required-evidence",
          type:
            "EVIDENCE_REQUIRED",
          label:
            "Evidence required next",
          severity:
            "WARNING",
          assertions:
            input.answerability
              .requiredEvidence
              .map(
                (
                  requirement,
                  index,
                ): ExecutiveAssertion =>
                  policyAssertion(
                    `assertion-evidence-${index + 1}`,
                    requirement,
                  ),
              ),
        }),
      );
    }

    if (
      input.answerability
        .humanJudgmentRequired
    ) {
      blocks.push(
        block({
          id: "block-decision",
          type: "DECISION",
          label: "CEO required",
          severity: "DECISION",
          assertions: [
            policyAssertion(
              "assertion-decision",
              "Review the evidence, resolve the material unknowns where necessary, and make the final business decision.",
            ),
          ],
        }),
      );
    }

    blocks.push(
      block({
        id:
          "block-system-boundary",
        type:
          "SYSTEM_BOUNDARY",
        label:
          "System boundary",
        severity:
          "INFO",
        assertions: [
          policyAssertion(
            "assertion-system-boundary",
            input.answerability
              .humanJudgmentRequired
              ? "The Company Brain can retrieve, rank, structure and explain the evidence. It cannot make the final human-governed decision."
              : input.answerability
                    .policy
                    .mayAnswer
                ? "The Company Brain may synthesize the retrieved evidence, subject to the disclosed provenance and caveats."
                : "The Company Brain must abstain from a substantive conclusion until the evidence threshold is met.",
          ),
        ],
      }),
    );

    const plan:
      ExecutiveSynthesisPlan = {
        mode:
          modeFor(input),

        headline:
          headlineFor(input),

        confidence:
          input.answerability
            .confidence,

        blocks,

        citations:
          input.citations,

        caveats:
          input.answerability
            .caveats,

        unresolvedQuestions:
          input.answerability
            .unresolvedQuestions,

        requiredEvidence:
          input.answerability
            .requiredEvidence,

        humanJudgmentRequired:
          input.answerability
            .humanJudgmentRequired,
      };

    return {
      plan,

      validation:
        this.validator.validate(
          plan,
        ),
    };
  }

  synthesize(
    input: BrainSynthesisInput,
  ): BrainSynthesisOutput {
    const {
      plan,
      validation,
    } =
      this.createPlan(input);

    if (!validation.valid) {
      return {
        mode: "ABSTAIN",

        headline:
          "Executive synthesis failed grounding validation.",

        answer:
          "The Company Brain blocked the response because one or more factual assertions were not correctly grounded in retrieved evidence.",

        sections: [
          {
            id:
              "section-grounding-failure",

            title:
              "Grounding failure",

            content:
              validation.violations
                .map(
                  (violation) =>
                    violation.message,
                )
                .join(" "),

            citationIds: [],

            kind:
              "DECISION_BOUNDARY",
          },
        ],

        usedCitationIds: [],
      };
    }

    const factualBlocks:
      ExecutiveBlock[] =
      plan.blocks.filter(
        (candidate) =>
          candidate.assertions.some(
            (assertion) =>
              assertion.support !==
              "POLICY",
          ),
      );

    const answer =
      factualBlocks
        .flatMap(
          (candidate) =>
            candidate.assertions,
        )
        .filter(
          (assertion) =>
            assertion.support !==
            "UNKNOWN",
        )
        .map(
          (assertion) =>
            assertion.text,
        )
        .join(" ");

    const sections:
      BrainAnswerSection[] =
      plan.blocks.map(
        (
          candidate,
        ): BrainAnswerSection => {
          const citationIds:
            string[] = [
              ...new Set<string>(
                candidate.assertions
                  .flatMap(
                    (assertion) =>
                      assertion
                        .citationIds,
                  ),
              ),
            ];

          return {
            id:
              candidate.id,

            title:
              candidate.label,

            content:
              candidate.assertions
                .map(
                  (assertion) =>
                    assertion.text,
                )
                .join(" "),

            citationIds,

            kind:
              answerSectionKind(
                candidate.type,
              ),
          };
        },
      );

    const usedCitationIds:
      string[] = [
        ...new Set<string>(
          sections.flatMap(
            (section) =>
              section.citationIds,
          ),
        ),
      ];

    return {
      mode:
        plan.mode,

      headline:
        plan.headline,

      answer:
        answer ||
        (
          plan.mode ===
            "ABSTAIN"
            ? "The evidence threshold has not been met."
            : plan.mode ===
                "CONFLICT"
              ? "Conflicting evidence requires reconciliation before synthesis."
              : "The evidence has been structured for review."
        ),

      sections,

      usedCitationIds,
    };
  }
}