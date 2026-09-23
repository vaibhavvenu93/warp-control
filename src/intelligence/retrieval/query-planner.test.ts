import { describe, expect, it } from "vitest";

import { QueryPlanner } from "@/intelligence/retrieval/query-planner";

const planner = new QueryPlanner({
  now: () => "2026-09-23T12:00:00.000Z",
  createId: () => "query-plan-test-001",
});

describe("company brain query planner", () => {
  it("creates deterministic query metadata", () => {
    const plan = planner.plan("What is WarpBuild?");

    expect(plan.id).toBe("query-plan-test-001");
    expect(plan.createdAt).toBe("2026-09-23T12:00:00.000Z");
    expect(plan.normalizedQuery).toBe("what is warpbuild");
  });

  it("upgrades an account question to decision support when explicit decision language is present", () => {
    const plan = planner.plan(
      "Should we pursue Northstar Labs as an enterprise account?",
    );

    expect(plan.intent).toBe("DECISION_SUPPORT");
    expect(plan.requiresHumanJudgment).toBe(true);
    expect(plan.strategies).toContain("GRAPH");
    expect(plan.strategies).toContain("CLAIM");
    expect(plan.evidenceRequirements).toContain(
      "UNKNOWN_RESOLUTION",
    );
  });

  it("detects known entities", () => {
    const plan = planner.plan(
      "What do we know about Northstar Labs and WarpBuild CI?",
    );

    expect(
      plan.entityHints.map((hint) => hint.value),
    ).toContain("Northstar Labs");

    expect(
      plan.entityHints.map((hint) => hint.value),
    ).toContain("WarpBuild CI");
  });

  it("uses account intelligence when economics are requested for a specific account", () => {
    const plan = planner.plan(
      "What is the ROI and payback of WarpBuild CI for Northstar?",
    );

    expect(plan.intent).toBe("ACCOUNT_INTELLIGENCE");
    expect(plan.evidenceRequirements).toContain(
      "MODELED_ANALYSIS",
    );

    expect(
      plan.entityHints.map((hint) => hint.value),
    ).toContain("Northstar Labs");
  });

  it("plans standalone economic questions as economic analysis", () => {
    const plan = planner.plan(
      "What are the CI economics, gross margin and developer time value?",
    );

    expect(plan.intent).toBe("ECONOMIC_ANALYSIS");
    expect(plan.strategies).toContain("CLAIM");
    expect(plan.evidenceRequirements).toContain(
      "MODELED_ANALYSIS",
    );
  });

  it("gives experiment-domain intent precedence over generic decision language", () => {
    const plan = planner.plan(
      "Which experiment should we run next?",
    );

    expect(plan.intent).toBe("EXPERIMENT_ANALYSIS");
    expect(plan.requiresHumanJudgment).toBe(true);
    expect(plan.strategies).toContain("GRAPH");

    expect(plan.evidenceRequirements).toContain(
      "UNKNOWN_RESOLUTION",
    );
  });

  it("does not confuse ordinary software tests with business experiments", () => {
    const plan = planner.plan(
      "What tests does WarpBuild CI run?",
    );

    expect(plan.intent).not.toBe("EXPERIMENT_ANALYSIS");
  });

  it("plans market research using public evidence", () => {
    const plan = planner.plan(
      "What are the major CI market and competitor trends?",
    );

    expect(plan.intent).toBe("MARKET_RESEARCH");
    expect(plan.evidenceRequirements).toContain("PUBLIC_FACT");
    expect(plan.strategies).toContain("LEXICAL");
  });

  it("extracts useful retrieval terms and removes stop words", () => {
    const plan = planner.plan(
      "Should we pursue Northstar Labs as an enterprise account?",
    );

    expect(plan.terms).toContain("northstar");
    expect(plan.terms).toContain("labs");
    expect(plan.terms).toContain("enterprise");
    expect(plan.terms).toContain("account");

    expect(plan.terms).not.toContain("should");
    expect(plan.terms).not.toContain("we");
  });

  it("includes unknown-resolution evidence for decision support", () => {
    const plan = planner.plan(
      "Should we approve the Northstar opportunity?",
    );

    expect(plan.intent).toBe("DECISION_SUPPORT");

    expect(plan.evidenceRequirements).toContain(
      "UNKNOWN_RESOLUTION",
    );

    expect(plan.requiresHumanJudgment).toBe(true);
  });

  it("falls back safely for an unclassified query", () => {
    const plan = planner.plan(
      "Explain the relationship between these ideas",
    );

    expect(plan.intent).toBe("UNKNOWN");
    expect(plan.strategies).toContain("LEXICAL");
    expect(plan.strategies).toContain("HYBRID");
    expect(plan.filters.includeUnknowns).toBe(true);
  });

  it("rejects empty queries", () => {
    expect(() => planner.plan("   ")).toThrow(
      "Query cannot be empty.",
    );
  });
});