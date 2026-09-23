import type {
  EvidenceRequirement,
  QueryEntityHint,
  QueryIntent,
  QueryPlan,
  QueryPlannerOptions,
  RetrievalStrategy,
} from "@/domain/knowledge/query/types";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "do",
  "does",
  "for",
  "from",
  "how",
  "i",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "our",
  "should",
  "the",
  "this",
  "to",
  "we",
  "what",
  "which",
  "with",
  "would",
]);

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s$.-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const unique = <T>(values: T[]) => [...new Set(values)];

const includesAny = (query: string, terms: string[]) =>
  terms.some((term) => query.includes(term));

function hasDecisionLanguage(query: string) {
  return includesAny(query, [
    "should we",
    "approve",
    "pursue",
    "decision",
    "recommend",
    "priority",
    "prioritize",
  ]);
}

function detectIntent(query: string): QueryIntent {
  /*
   * Intent precedence matters.
   *
   * Specific business domains are evaluated before generic decision
   * language so questions such as "Which experiment should we run?"
   * remain experiment-analysis queries.
   */

  if (
    includesAny(query, [
      "experiment",
      "hypothesis",
      "portfolio",
      "kill criteria",
      "run next",
    ])
  ) {
    return "EXPERIMENT_ANALYSIS";
  }

  /*
   * Account context takes precedence over generic economics because
   * account questions should retrieve the complete account evidence
   * graph rather than economics in isolation.
   *
   * Explicit decision language upgrades the account query to
   * DECISION_SUPPORT.
   */
  if (
    includesAny(query, [
      "northstar",
      "account",
      "customer",
      "prospect",
      "buyer",
      "buying committee",
      "acv",
    ])
  ) {
    if (hasDecisionLanguage(query)) {
      return "DECISION_SUPPORT";
    }

    return "ACCOUNT_INTELLIGENCE";
  }

  if (
    includesAny(query, [
      "economics",
      "roi",
      "payback",
      "gross margin",
      "margin",
      "developer time",
      "ci cost",
      "value",
      "price",
      "pricing",
    ])
  ) {
    return "ECONOMIC_ANALYSIS";
  }

  if (
    includesAny(query, [
      "market",
      "competitor",
      "competitive",
      "trend",
      "industry",
    ])
  ) {
    return "MARKET_RESEARCH";
  }

  if (
    includesAny(query, [
      "brief",
      "ceo brief",
      "what changed",
      "today",
      "attention",
    ])
  ) {
    return "EXECUTIVE_BRIEF";
  }

  if (hasDecisionLanguage(query)) {
    return "DECISION_SUPPORT";
  }

  if (
    query.startsWith("what ") ||
    query.startsWith("who ") ||
    query.startsWith("when ") ||
    query.startsWith("where ") ||
    query.startsWith("which ")
  ) {
    return "FACT_LOOKUP";
  }

  return "UNKNOWN";
}

function detectEntityHints(query: string): QueryEntityHint[] {
  const hints: QueryEntityHint[] = [];

  const knownEntities: Array<{
    aliases: string[];
    value: string;
    types: QueryEntityHint["entityTypes"];
  }> = [
    {
      aliases: ["warpbuild", "warp build"],
      value: "WarpBuild",
      types: ["COMPANY"],
    },
    {
      aliases: ["warpbuild ci", "warp build ci", "ci"],
      value: "WarpBuild CI",
      types: ["PRODUCT"],
    },
    {
      aliases: ["helios"],
      value: "Helios",
      types: ["PRODUCT"],
    },
    {
      aliases: ["northstar", "northstar labs"],
      value: "Northstar Labs",
      types: ["ACCOUNT"],
    },
    {
      aliases: [
        "revenue intelligence agent",
        "revenue agent",
      ],
      value: "Revenue Intelligence Agent",
      types: ["AGENT"],
    },
    {
      aliases: [
        "experiment analyst",
        "experiment analyst agent",
      ],
      value: "Experiment Analyst",
      types: ["AGENT"],
    },
    {
      aliases: [
        "ci economics",
        "developer economics",
      ],
      value: "CI Economics",
      types: ["METRIC"],
    },
    {
      aliases: ["experiment portfolio"],
      value: "Experiment Portfolio",
      types: ["EXPERIMENT"],
    },
  ];

  for (const entity of knownEntities) {
    if (
      entity.aliases.some((alias) =>
        query.includes(alias),
      )
    ) {
      hints.push({
        value: entity.value,
        normalizedValue: normalize(entity.value),
        entityTypes: entity.types,
        confidence: 0.95,
      });
    }
  }

  /*
   * A specific product match can also match the company alias
   * "warpbuild". Deduplicate semantically identical hints while
   * preserving genuinely different entities.
   */
  return hints.filter(
    (hint, index, allHints) =>
      allHints.findIndex(
        (candidate) =>
          candidate.value === hint.value &&
          candidate.entityTypes.join("|") ===
            hint.entityTypes.join("|"),
      ) === index,
  );
}

function strategiesForIntent(
  intent: QueryIntent,
): RetrievalStrategy[] {
  switch (intent) {
    case "FACT_LOOKUP":
      return ["LEXICAL", "ENTITY", "CLAIM"];

    case "DECISION_SUPPORT":
      return [
        "ENTITY",
        "CLAIM",
        "GRAPH",
        "LEXICAL",
        "HYBRID",
      ];

    case "ACCOUNT_INTELLIGENCE":
      return [
        "ENTITY",
        "CLAIM",
        "GRAPH",
        "HYBRID",
      ];

    case "ECONOMIC_ANALYSIS":
      return [
        "CLAIM",
        "ENTITY",
        "LEXICAL",
        "HYBRID",
      ];

    case "EXPERIMENT_ANALYSIS":
      return [
        "ENTITY",
        "CLAIM",
        "GRAPH",
        "HYBRID",
      ];

    case "MARKET_RESEARCH":
      return [
        "LEXICAL",
        "ENTITY",
        "CLAIM",
        "HYBRID",
      ];

    case "EXECUTIVE_BRIEF":
      return [
        "CLAIM",
        "GRAPH",
        "ENTITY",
        "HYBRID",
      ];

    default:
      return ["LEXICAL", "HYBRID"];
  }
}

function evidenceRequirementsForIntent(
  intent: QueryIntent,
): EvidenceRequirement[] {
  switch (intent) {
    case "DECISION_SUPPORT":
      return [
        "INTERNAL_FACT",
        "CONNECTED_DATA",
        "MODELED_ANALYSIS",
        "DECISION_CONTEXT",
        "UNKNOWN_RESOLUTION",
      ];

    case "ACCOUNT_INTELLIGENCE":
      return [
        "INTERNAL_FACT",
        "CONNECTED_DATA",
        "MODELED_ANALYSIS",
        "UNKNOWN_RESOLUTION",
      ];

    case "ECONOMIC_ANALYSIS":
      return [
        "MODELED_ANALYSIS",
        "INTERNAL_FACT",
      ];

    case "EXPERIMENT_ANALYSIS":
      return [
        "MODELED_ANALYSIS",
        "DECISION_CONTEXT",
        "UNKNOWN_RESOLUTION",
      ];

    case "MARKET_RESEARCH":
      return [
        "PUBLIC_FACT",
        "MODELED_ANALYSIS",
      ];

    case "EXECUTIVE_BRIEF":
      return [
        "INTERNAL_FACT",
        "CONNECTED_DATA",
        "DECISION_CONTEXT",
        "UNKNOWN_RESOLUTION",
      ];

    case "FACT_LOOKUP":
      return [
        "PUBLIC_FACT",
        "INTERNAL_FACT",
      ];

    default:
      return [
        "PUBLIC_FACT",
        "INTERNAL_FACT",
        "UNKNOWN_RESOLUTION",
      ];
  }
}

function extractTerms(query: string) {
  return unique(
    normalize(query)
      .split(" ")
      .filter((term) => term.length > 1)
      .filter((term) => !STOP_WORDS.has(term)),
  );
}

function requiresHumanJudgment(
  intent: QueryIntent,
) {
  return (
    intent === "DECISION_SUPPORT" ||
    intent === "EXPERIMENT_ANALYSIS" ||
    intent === "EXECUTIVE_BRIEF"
  );
}

export class QueryPlanner {
  private readonly now: () => string;

  private readonly createId: () => string;

  constructor(options: QueryPlannerOptions = {}) {
    this.now =
      options.now ??
      (() => new Date().toISOString());

    this.createId =
      options.createId ??
      (() =>
        `query-plan-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`);
  }

  plan(query: string): QueryPlan {
    const normalizedQuery = normalize(query);

    if (!normalizedQuery) {
      throw new Error("Query cannot be empty.");
    }

    const intent = detectIntent(normalizedQuery);

    const entityHints =
      detectEntityHints(normalizedQuery);

    const strategies =
      strategiesForIntent(intent);

    const evidenceRequirements =
      evidenceRequirementsForIntent(intent);

    const humanJudgment =
      requiresHumanJudgment(intent);

    const rationale = [
      `Detected intent: ${intent}.`,
      `Selected ${strategies.length} retrieval strategies.`,
      entityHints.length > 0
        ? `Detected ${entityHints.length} known entity hint(s).`
        : "No known entity hints detected.",
      humanJudgment
        ? "The query can affect a business decision and retains a human judgment boundary."
        : "The query can be answered as an evidence retrieval task.",
    ];

    return {
      id: this.createId(),
      query,
      normalizedQuery,
      intent,
      strategies,
      entityHints,
      evidenceRequirements,

      filters: {
        entityTypes: unique(
          entityHints.flatMap(
            (hint) => hint.entityTypes,
          ),
        ),
        sourceTypes: [],
        provenance: [],
        includeUnknowns: true,
        includeModeled: true,
      },

      terms: extractTerms(normalizedQuery),

      requiresHumanJudgment: humanJudgment,

      rationale,

      createdAt: this.now(),
    };
  }
}