import type {
  BrainCitation,
} from "@/domain/brain/types";

import type {
  ExecutiveAssertion,
  ExecutiveBlock,
  ExecutiveSynthesisPlan,
  SupportValidationResult,
  SupportViolation,
} from "@/domain/brain/synthesis/types";

function expectedCitationState(
  assertion:
    ExecutiveAssertion,
):
  | BrainCitation["state"]
  | undefined {
  switch (
    assertion.support
  ) {
    case "SUPPORTED":
      return "KNOWN";

    case "MODELED":
      return "MODELED";

    case "INFERRED":
      return "INFERRED";

    case "UNKNOWN":
      return "UNKNOWN";

    case "POLICY":
    default:
      return undefined;
  }
}

function validateAssertion(
  block: ExecutiveBlock,
  assertion:
    ExecutiveAssertion,
  citations:
    Map<string, BrainCitation>,
): SupportViolation[] {
  const violations:
    SupportViolation[] = [];

  if (
    assertion.support ===
    "POLICY"
  ) {
    return violations;
  }

  if (
    assertion.citationIds
      .length === 0
  ) {
    violations.push({
      assertionId:
        assertion.id,

      blockId:
        block.id,

      reason:
        "MISSING_CITATION",

      message:
        `Assertion "${assertion.id}" is factual but has no supporting citation.`,
    });

    return violations;
  }

  const expectedState =
    expectedCitationState(
      assertion,
    );

  for (
    const citationId
    of assertion.citationIds
  ) {
    const citation =
      citations.get(
        citationId,
      );

    if (!citation) {
      violations.push({
        assertionId:
          assertion.id,

        blockId:
          block.id,

        reason:
          "UNKNOWN_CITATION",

        message:
          `Assertion "${assertion.id}" references unknown citation "${citationId}".`,
      });

      continue;
    }

    if (
      expectedState &&
      citation.state !==
        expectedState
    ) {
      violations.push({
        assertionId:
          assertion.id,

        blockId:
          block.id,

        reason:
          "STATE_MISMATCH",

        message:
          `Assertion "${assertion.id}" is marked ${assertion.support} but citation "${citationId}" is ${citation.state}.`,
      });
    }
  }

  return violations;
}

export class ExecutiveSupportValidator {
  validate(
    plan:
      ExecutiveSynthesisPlan,
  ): SupportValidationResult {
    const citations =
      new Map(
        plan.citations.map(
          (citation) => [
            citation.id,
            citation,
          ],
        ),
      );

    const violations:
      SupportViolation[] = [];

    let checkedAssertions = 0;
    let policyAssertions = 0;

    for (
      const block
      of plan.blocks
    ) {
      for (
        const assertion
        of block.assertions
      ) {
        checkedAssertions += 1;

        if (
          assertion.support ===
          "POLICY"
        ) {
          policyAssertions += 1;
        }

        violations.push(
          ...validateAssertion(
            block,
            assertion,
            citations,
          ),
        );
      }
    }

    const violatedIds =
      new Set(
        violations.map(
          (violation) =>
            violation.assertionId,
        ),
      );

    return {
      valid:
        violations.length ===
        0,

      checkedAssertions,

      supportedAssertions:
        checkedAssertions -
        violatedIds.size,

      policyAssertions,

      violations,
    };
  }
}