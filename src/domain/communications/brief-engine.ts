import type {
  ClaimValidationResult,
  CommunicationAudience,
  CommunicationBrief,
  CommunicationClaim,
  CommunicationPurpose,
  CommunicationSection,
  CommunicationSectionType,
  CommunicationType,
} from "@/domain/communications/types";

export interface BuildBriefInput {
  id: string;

  title: string;

  type: CommunicationType;
  purpose: CommunicationPurpose;
  audience: CommunicationAudience;

  generatedAt: string;

  claims: CommunicationClaim[];
  validations: ClaimValidationResult[];

  periodStart?: string;
  periodEnd?: string;

  disclaimer: string;
}

const SECTION_ORDER: CommunicationSectionType[] =
  [
    "EXECUTIVE_SUMMARY",
    "WHAT_CHANGED",
    "PROGRESS",
    "COMMERCIAL",
    "PRODUCT",
    "OPERATIONS",
    "PEOPLE",
    "MARKET",
    "DECISIONS",
    "RISKS",
    "NEXT_STEPS",
    "ASKS",
    "OTHER",
  ];

function sectionTitle(
  type: CommunicationSectionType,
): string {
  const titles: Record<
    CommunicationSectionType,
    string
  > = {
    EXECUTIVE_SUMMARY:
      "Executive Summary",
    WHAT_CHANGED: "What Changed",
    PROGRESS: "Progress",
    COMMERCIAL: "Commercial",
    PRODUCT: "Product",
    OPERATIONS: "Operations",
    PEOPLE: "People",
    MARKET: "Market",
    DECISIONS:
      "Decisions Required",
    RISKS: "Risks & Unknowns",
    NEXT_STEPS: "Next Steps",
    ASKS: "Asks",
    OTHER: "Other",
  };

  return titles[type];
}

function buildSections(
  claims: CommunicationClaim[],
): CommunicationSection[] {
  return SECTION_ORDER.flatMap(
    (type, order) => {
      const sectionClaims =
        claims.filter(
          (claim) =>
            claim.section === type,
        );

      if (
        sectionClaims.length === 0
      ) {
        return [];
      }

      return [
        {
          id: `section-${type.toLowerCase()}`,
          type,
          title:
            sectionTitle(type),
          claimIds:
            sectionClaims.map(
              (claim) =>
                claim.id,
            ),
          order,
        },
      ];
    },
  );
}

function validationMap(
  validations: ClaimValidationResult[],
): Map<
  string,
  ClaimValidationResult
> {
  return new Map(
    validations.map(
      (validation) => [
        validation.claimId,
        validation,
      ],
    ),
  );
}

export function buildCommunicationBrief({
  id,
  title,
  type,
  purpose,
  audience,
  generatedAt,
  claims,
  validations,
  periodStart,
  periodEnd,
  disclaimer,
}: BuildBriefInput): {
  brief: CommunicationBrief;
  sections: CommunicationSection[];
} {
  const byClaim =
    validationMap(validations);

  const audienceClaims =
    claims.filter(
      (claim) =>
        claim.audience.includes(
          audience,
        ),
    );

  const blockedClaimIds =
    audienceClaims
      .filter((claim) => {
        const validation =
          byClaim.get(claim.id);

        return (
          !validation ||
          validation.state ===
            "BLOCKED" ||
          !validation.allowedAudiences.includes(
            audience,
          )
        );
      })
      .map(
        (claim) => claim.id,
      );

  const usableClaims =
    audienceClaims.filter(
      (claim) =>
        !blockedClaimIds.includes(
          claim.id,
        ),
    );

  const reviewRequiredClaimIds =
    usableClaims
      .filter((claim) => {
        const validation =
          byClaim.get(claim.id);

        return (
          validation
            ?.humanReviewRequired ??
          true
        );
      })
      .map(
        (claim) => claim.id,
      );

  const sections =
    buildSections(
      usableClaims,
    );

  const supportedCount =
    usableClaims.filter(
      (claim) =>
        byClaim.get(claim.id)
          ?.state ===
        "SUPPORTED",
    ).length;

  const modeledCount =
    usableClaims.filter(
      (claim) =>
        byClaim.get(claim.id)
          ?.state === "MODELED",
    ).length;

  const summary =
    `${usableClaims.length} claims assembled for ${audience.toLowerCase()} communication. ` +
    `${supportedCount} supported, ${modeledCount} modeled, ` +
    `${blockedClaimIds.length} blocked by the communication boundary.`;

  const humanApprovalRequired =
    audience === "INVESTOR" ||
    audience === "CUSTOMER" ||
    audience === "PUBLIC" ||
    reviewRequiredClaimIds.length >
      0;

  const brief: CommunicationBrief =
    {
      id,
      title,
      type,
      purpose,
      audience,

      generatedAt,
      periodStart,
      periodEnd,

      sectionIds:
        sections.map(
          (section) =>
            section.id,
        ),

      claimIds:
        usableClaims.map(
          (claim) =>
            claim.id,
        ),

      blockedClaimIds,
      reviewRequiredClaimIds,

      approvalState:
        humanApprovalRequired
          ? "REVIEW_REQUIRED"
          : "DRAFT",

      humanApprovalRequired,

      summary,

      disclaimer,
    };

  return {
    brief,
    sections,
  };
}

export function renderBriefText(
  brief: CommunicationBrief,
  sections: CommunicationSection[],
  claims: CommunicationClaim[],
): string {
  const claimById =
    new Map(
      claims.map(
        (claim) => [
          claim.id,
          claim,
        ],
      ),
    );

  const orderedSections =
    sections
      .filter(
        (section) =>
          brief.sectionIds.includes(
            section.id,
          ),
      )
      .sort(
        (a, b) =>
          a.order - b.order,
      );

  const body =
    orderedSections
      .map((section) => {
        const lines =
          section.claimIds
            .map(
              (claimId) =>
                claimById.get(
                  claimId,
                ),
            )
            .filter(
              (
                claim,
              ): claim is CommunicationClaim =>
                Boolean(claim),
            )
            .map(
              (claim) =>
                `- ${claim.statement}`,
            );

        return [
          section.title,
          ...lines,
        ].join("\n");
      })
      .join("\n\n");

  return [
    brief.title,
    "",
    body,
    "",
    `Boundary: ${brief.disclaimer}`,
  ].join("\n");
}