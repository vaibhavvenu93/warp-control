import type {
  MarketObservation,
} from "@/domain/market-radar/ingestion/observation-types";

import type {
  ClaimCandidate,
  ClaimExtractionResult,
  MarketClaimType,
} from "./claim-types";

function normalize(
  value: string,
): string {
  return value
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(
  value: string,
  terms: string[],
): boolean {
  const lower =
    value.toLowerCase();

  return terms.some(
    (term) =>
      lower.includes(
        term.toLowerCase(),
      ),
  );
}

function inferClaimType(
  observation: MarketObservation,
): MarketClaimType {
  const text =
    `${observation.title} ${observation.body}`;

  if (
    observation.categories.includes(
      "PRICING",
    ) ||
    includesAny(text, [
      "pricing",
      "price",
      "plan",
      "package",
    ])
  ) {
    return "PRICING_CHANGE";
  }

  if (
    observation.categories.includes(
      "HIRING",
    ) ||
    includesAny(text, [
      "hiring",
      "hire",
      "career",
      "job",
    ])
  ) {
    return "HIRING_SIGNAL";
  }

  if (
    observation.categories.includes(
      "SECURITY",
    ) ||
    includesAny(text, [
      "security",
      "soc 2",
      "compliance",
      "enterprise security",
    ])
  ) {
    return "SECURITY_SIGNAL";
  }

  if (
    observation.categories.includes(
      "CAPITAL",
    ) ||
    includesAny(text, [
      "funding",
      "raised",
      "financing",
      "series",
    ])
  ) {
    return "CAPITAL_SIGNAL";
  }

  if (
    observation.categories.includes(
      "PARTNERSHIP",
    ) ||
    includesAny(text, [
      "partner",
      "partnership",
      "integration",
    ])
  ) {
    return "PARTNERSHIP_SIGNAL";
  }

  if (
    observation.categories.includes(
      "CUSTOMER",
    )
  ) {
    return "CUSTOMER_SIGNAL";
  }

  if (
    observation.categories.includes(
      "DEVELOPER_ECOSYSTEM",
    ) ||
    observation.categories.includes(
      "OPEN_SOURCE",
    )
  ) {
    return "ECOSYSTEM_CHANGE";
  }

  if (
    observation.categories.includes(
      "AI_ENGINEERING",
    ) ||
    observation.categories.includes(
      "CI_INFRASTRUCTURE",
    )
  ) {
    return "TECHNOLOGY_CHANGE";
  }

  if (
    observation.categories.includes(
      "PRODUCT",
    )
  ) {
    return "PRODUCT_CHANGE";
  }

  return "GENERAL_OBSERVATION";
}

function chooseSubject(
  observation: MarketObservation,
): string {
  const company =
    observation.entities.find(
      (entity) =>
        entity.type ===
        "COMPANY",
    );

  if (company) {
    return company.name;
  }

  const product =
    observation.entities.find(
      (entity) =>
        entity.type ===
        "PRODUCT",
    );

  if (product) {
    return product.name;
  }

  return observation.sourceName;
}

function predicateForType(
  type: MarketClaimType,
): string {
  switch (type) {
    case "PRODUCT_CHANGE":
      return "has a product-related observation";

    case "PRICING_CHANGE":
      return "has a pricing-related observation";

    case "POSITIONING_CHANGE":
      return "has a positioning-related observation";

    case "COMPANY_ANNOUNCEMENT":
      return "has a company announcement";

    case "CUSTOMER_SIGNAL":
      return "has a customer-related observation";

    case "TECHNOLOGY_CHANGE":
      return "has a technology-related observation";

    case "ECOSYSTEM_CHANGE":
      return "has an ecosystem-related observation";

    case "HIRING_SIGNAL":
      return "has a hiring-related observation";

    case "SECURITY_SIGNAL":
      return "has a security-related observation";

    case "CAPITAL_SIGNAL":
      return "has a capital-related observation";

    case "PARTNERSHIP_SIGNAL":
      return "has a partnership-related observation";

    default:
      return "has an observed market update";
  }
}

export function extractClaimsFromObservation(
  observation: MarketObservation,
): ClaimExtractionResult {
  const warnings: string[] =
    [];

  if (
    observation.state ===
    "STALE"
  ) {
    warnings.push(
      "Observation is stale and should not independently drive a strategic recommendation.",
    );
  }

  if (
    observation.provenance ===
    "MODELED" ||
    observation.provenance ===
    "ASSUMED"
  ) {
    warnings.push(
      "Observation is not direct public evidence.",
    );
  }

  const subject =
    normalize(
      chooseSubject(
        observation,
      ),
    );

  const type =
    inferClaimType(
      observation,
    );

  /*
   * Important epistemic boundary:
   *
   * We do not convert the observation into a stronger
   * factual statement than the source supports.
   *
   * The observation title/body remains the object of
   * the claim. Later systems may infer implications,
   * but those implications are not facts.
   */
  const object =
    normalize(
      observation.title,
    );

  const predicate =
    predicateForType(type);

  const candidate:
    ClaimCandidate = {
      type,

      subject,

      predicate,

      object,

      statement:
        `${subject} ${predicate}: ${object}.`,

      categories: [
        ...observation.categories,
      ],

      metadata: {
        observationTitle:
          observation.title,

        observationState:
          observation.state,

        sourceKind:
          observation.sourceKind,

        extractionMethod:
          "DETERMINISTIC_RULES_V1",
      },
    };

  return {
    observationId:
      observation.id,

    candidates: [
      candidate,
    ],

    warnings,
  };
}