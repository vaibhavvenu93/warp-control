import type {
  EvidenceRef,
} from "@/domain/types";

import type {
  CommunicationClaim,
  CommunicationSource,
} from "@/domain/communications/types";

export const COMMUNICATIONS_DEMO_NOW =
  "2026-09-24T12:00:00.000Z";

export const COMMUNICATIONS_DEMO_DISCLAIMER =
  "Deterministic demonstration scenario for the WARP / CONTROL Chief of Staff operating system. Claims, operating state, candidate state, commercial state and company metrics shown here are modeled examples unless explicitly backed by public evidence. They are not representations of WarpBuild's actual internal performance, customers, revenue, team, investors or plans.";

export const communicationsDemoEvidence: EvidenceRef[] =
  [
    {
      id: "evidence-operating-health",
      type: "MODELED",
      source:
        "Company Operating System Demo",
      capturedAt:
        COMMUNICATIONS_DEMO_NOW,
      claim:
        "The modeled company operating health requires executive attention.",
      confidence: 100,
    },

    {
      id: "evidence-security-boundary",
      type: "MODELED",
      source:
        "Company Operating System Demo",
      capturedAt:
        COMMUNICATIONS_DEMO_NOW,
      claim:
        "Enterprise readiness is blocked by an unresolved security evidence boundary.",
      confidence: 100,
    },

    {
      id: "evidence-ci-economics",
      type: "MODELED",
      source:
        "CI Economics Demo",
      capturedAt:
        COMMUNICATIONS_DEMO_NOW,
      claim:
        "The modeled CI economics validation workstream is on track.",
      confidence: 100,
    },

    {
      id: "evidence-gtm-learning",
      type: "MODELED",
      source:
        "Experiment Control Plane Demo",
      capturedAt:
        COMMUNICATIONS_DEMO_NOW,
      claim:
        "The modeled GTM learning system has produced decision-grade learning.",
      confidence: 100,
    },

    {
      id: "evidence-talent-technical-gtm",
      type: "MODELED",
      source:
        "Talent Control Plane Demo",
      capturedAt:
        COMMUNICATIONS_DEMO_NOW,
      claim:
        "The modeled Technical GTM hiring search has a healthy pipeline.",
      confidence: 100,
    },

    {
      id: "evidence-talent-security",
      type: "MODELED",
      source:
        "Talent Control Plane Demo",
      capturedAt:
        COMMUNICATIONS_DEMO_NOW,
      claim:
        "The modeled enterprise security capability remains constrained.",
      confidence: 100,
    },

    {
      id: "evidence-pricing-decision",
      type: "MODELED",
      source:
        "Decision Engine Demo",
      capturedAt:
        COMMUNICATIONS_DEMO_NOW,
      claim:
        "The modeled pricing experiment requires executive boundary-setting.",
      confidence: 100,
    },

    {
      id: "evidence-revenue-assumption",
      type: "ASSUMED",
      source:
        "Unverified Demo Assumption",
      capturedAt:
        COMMUNICATIONS_DEMO_NOW,
      claim:
        "Enterprise revenue increased materially this month.",
      confidence: 35,
    },

    {
      id: "evidence-public-positioning",
      type: "PUBLIC",
      source:
        "WarpBuild public product positioning",
      capturedAt:
        COMMUNICATIONS_DEMO_NOW,
      claim:
        "WarpBuild publicly positions its CI infrastructure around faster software development workflows.",
      confidence: 95,
    },
  ];

export const communicationsDemoSources: CommunicationSource[] =
  [
    {
      id: "source-operations",
      label:
        "Company Operating System",
      description:
        "Modeled goals, workstreams, dependencies, issues and CEO attention.",
      evidenceType: "MODELED",
      evidence:
        communicationsDemoEvidence.filter(
          (item) =>
            item.source ===
            "Company Operating System Demo",
        ),
      capturedAt:
        COMMUNICATIONS_DEMO_NOW,
    },

    {
      id: "source-economics",
      label: "CI Economics",
      description:
        "Modeled developer and CI economics.",
      evidenceType: "MODELED",
      evidence:
        communicationsDemoEvidence.filter(
          (item) =>
            item.source ===
            "CI Economics Demo",
        ),
      capturedAt:
        COMMUNICATIONS_DEMO_NOW,
    },

    {
      id: "source-experiments",
      label:
        "Experiment Control Plane",
      description:
        "Modeled experiment state and learning.",
      evidenceType: "MODELED",
      evidence:
        communicationsDemoEvidence.filter(
          (item) =>
            item.source ===
            "Experiment Control Plane Demo",
        ),
      capturedAt:
        COMMUNICATIONS_DEMO_NOW,
    },

    {
      id: "source-talent",
      label:
        "Talent Control Plane",
      description:
        "Modeled capability and hiring state.",
      evidenceType: "MODELED",
      evidence:
        communicationsDemoEvidence.filter(
          (item) =>
            item.source ===
            "Talent Control Plane Demo",
        ),
      capturedAt:
        COMMUNICATIONS_DEMO_NOW,
    },

    {
      id: "source-decisions",
      label: "Decision Engine",
      description:
        "Modeled decisions requiring executive judgment.",
      evidenceType: "MODELED",
      evidence:
        communicationsDemoEvidence.filter(
          (item) =>
            item.source ===
            "Decision Engine Demo",
        ),
      capturedAt:
        COMMUNICATIONS_DEMO_NOW,
    },

    {
      id: "source-public",
      label:
        "Public company evidence",
      description:
        "Publicly supportable company/product positioning.",
      evidenceType: "PUBLIC",
      evidence:
        communicationsDemoEvidence.filter(
          (item) =>
            item.type === "PUBLIC",
        ),
      capturedAt:
        COMMUNICATIONS_DEMO_NOW,
    },
  ];

function claim(
  input: Partial<CommunicationClaim> &
    Pick<
      CommunicationClaim,
      | "id"
      | "statement"
      | "section"
      | "evidenceIds"
      | "sourceIds"
      | "evidenceTypes"
      | "audience"
    >,
): CommunicationClaim {
  return {
    state:
      "NEEDS_EVIDENCE",
    risk: "MEDIUM",
    confidence: 0,
    confidenceLevel: "LOW",
    humanReviewRequired:
      false,
    reason:
      "Pending deterministic claim validation.",
    createdAt:
      COMMUNICATIONS_DEMO_NOW,
    ...input,
  };
}

export const communicationsDemoClaims: CommunicationClaim[] =
  [
    claim({
      id: "claim-operating-health",
      statement:
        "The modeled operating plan currently requires executive attention.",
      section:
        "EXECUTIVE_SUMMARY",
      evidenceIds: [
        "evidence-operating-health",
      ],
      sourceIds: [
        "source-operations",
      ],
      evidenceTypes: [
        "MODELED",
      ],
      audience: [
        "CEO",
        "LEADERSHIP",
        "TEAM",
      ],
    }),

    claim({
      id: "claim-security-risk",
      statement:
        "Enterprise readiness is constrained by the modeled security evidence boundary.",
      section: "RISKS",
      evidenceIds: [
        "evidence-security-boundary",
      ],
      sourceIds: [
        "source-operations",
      ],
      evidenceTypes: [
        "MODELED",
      ],
      audience: [
        "CEO",
        "LEADERSHIP",
        "TEAM",
      ],
    }),

    claim({
      id: "claim-ci-progress",
      statement:
        "CI economics validation remains on track in the modeled operating plan.",
      section: "PROGRESS",
      evidenceIds: [
        "evidence-ci-economics",
      ],
      sourceIds: [
        "source-economics",
      ],
      evidenceTypes: [
        "MODELED",
      ],
      audience: [
        "CEO",
        "LEADERSHIP",
        "TEAM",
      ],
    }),

    claim({
      id: "claim-gtm-learning",
      statement:
        "The modeled GTM learning loop has generated decision-grade learning.",
      section: "COMMERCIAL",
      evidenceIds: [
        "evidence-gtm-learning",
      ],
      sourceIds: [
        "source-experiments",
      ],
      evidenceTypes: [
        "MODELED",
      ],
      audience: [
        "CEO",
        "LEADERSHIP",
        "TEAM",
      ],
    }),

    claim({
      id: "claim-technical-gtm-pipeline",
      statement:
        "The modeled Technical GTM search currently has a healthy candidate pipeline.",
      section: "PEOPLE",
      evidenceIds: [
        "evidence-talent-technical-gtm",
      ],
      sourceIds: [
        "source-talent",
      ],
      evidenceTypes: [
        "MODELED",
      ],
      audience: [
        "CEO",
        "LEADERSHIP",
        "TEAM",
      ],
    }),

    claim({
      id: "claim-security-capability",
      statement:
        "The modeled enterprise security capability remains constrained and requires intervention.",
      section: "PEOPLE",
      evidenceIds: [
        "evidence-talent-security",
      ],
      sourceIds: [
        "source-talent",
      ],
      evidenceTypes: [
        "MODELED",
      ],
      audience: [
        "CEO",
        "LEADERSHIP",
      ],
    }),

    claim({
      id: "claim-pricing-decision",
      statement:
        "Executive judgment is required to define the boundary for the modeled pricing experiment.",
      section: "DECISIONS",
      evidenceIds: [
        "evidence-pricing-decision",
      ],
      sourceIds: [
        "source-decisions",
      ],
      evidenceTypes: [
        "MODELED",
      ],
      audience: [
        "CEO",
        "LEADERSHIP",
      ],
      humanReviewRequired:
        true,
    }),

    claim({
      id: "claim-public-positioning",
      statement:
        "WarpBuild publicly positions its CI infrastructure around faster software development workflows.",
      section: "PRODUCT",
      evidenceIds: [
        "evidence-public-positioning",
      ],
      sourceIds: [
        "source-public",
      ],
      evidenceTypes: [
        "PUBLIC",
      ],
      audience: [
        "CEO",
        "LEADERSHIP",
        "TEAM",
        "INVESTOR",
        "CUSTOMER",
        "PUBLIC",
      ],
      humanReviewRequired:
        true,
    }),

    claim({
      id: "claim-investor-revenue",
      statement:
        "Enterprise revenue increased materially this month.",
      section: "COMMERCIAL",
      evidenceIds: [
        "evidence-revenue-assumption",
      ],
      sourceIds: [],
      evidenceTypes: [
        "ASSUMED",
      ],
      audience: [
        "INVESTOR",
      ],
      humanReviewRequired:
        true,
    }),

    claim({
      id: "claim-unsupported-customer-growth",
      statement:
        "Enterprise customer adoption accelerated this month.",
      section: "COMMERCIAL",
      evidenceIds: [],
      sourceIds: [],
      evidenceTypes: [],
      audience: [
        "INVESTOR",
        "PUBLIC",
      ],
      humanReviewRequired:
        true,
    }),
  ];