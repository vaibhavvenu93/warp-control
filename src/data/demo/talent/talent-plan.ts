import type {
  CandidateEvidence,
  CapabilityGap,
  HiringSearch,
  TalentCandidate,
  TalentOwner,
} from "@/domain/talent/types";

export const TALENT_DEMO_NOW =
  "2026-09-24T12:00:00.000Z";

export const TALENT_DEMO_DISCLAIMER =
  "Talent Control is running a deterministic demonstration scenario designed around the responsibilities of the WarpBuild Chief of Staff role. Capability gaps, searches, candidates, interview evidence and hiring conditions shown here are modeled examples. They are not claims about WarpBuild's actual team, open roles, candidates, headcount plan or hiring decisions.";

export const TALENT_DEMO_OWNERS:
  TalentOwner[] = [
    {
      id: "owner-ceo",
      name: "CEO",
      role: "CEO",
      isExecutive: true,
    },
    {
      id: "owner-cos",
      name:
        "Chief of Staff",
      role:
        "Chief of Staff",
    },
    {
      id: "owner-product",
      name: "Product",
      role:
        "Product owner",
    },
  ];

export const TALENT_DEMO_GAPS:
  CapabilityGap[] = [
    {
      id: "gap-technical-gtm",
      capability:
        "Enterprise technical GTM",
      description:
        "Translate developer and infrastructure pain into rigorous technical discovery, commercial qualification and enterprise learning.",
      status:
        "SEARCH_ACTIVE",
      priority: "HIGH",
      whyNow:
        "The modeled enterprise motion requires technical discovery depth without separating GTM from product learning.",
      businessImpact:
        "Better discovery can improve qualification, product feedback and enterprise conversion quality.",
      ownerId: "owner-cos",
      relatedGoalIds: [
        "goal-gtm-learning",
      ],
      relatedWorkstreamIds: [
        "ws-gtm-learning",
      ],
      desiredBy:
        "2026-10-31T00:00:00.000Z",
      metadata: {
        demo: true,
      },
    },

    {
      id:
        "gap-enterprise-readiness",
      capability:
        "Enterprise security and readiness",
      description:
        "Build the capability to answer security, procurement and enterprise-readiness questions with validated evidence.",
      status:
        "SEARCH_ACTIVE",
      priority:
        "CRITICAL",
      whyNow:
        "The modeled operating plan currently treats enterprise-readiness evidence as a blocker.",
      businessImpact:
        "Unresolved security and procurement evidence can slow or prevent enterprise adoption.",
      ownerId: "owner-cos",
      relatedGoalIds: [
        "goal-enterprise-readiness",
      ],
      relatedWorkstreamIds: [
        "ws-enterprise-readiness",
      ],
      desiredBy:
        "2026-10-15T00:00:00.000Z",
      metadata: {
        demo: true,
      },
    },

    {
      id:
        "gap-operating-leverage",
      capability:
        "AI-native operating leverage",
      description:
        "Increase cross-functional execution capacity through systems, automation and explicit operating ownership.",
      status: "MITIGATED",
      priority: "HIGH",
      whyNow:
        "The modeled company operating system is designed to reduce coordination overhead without defaulting to additional headcount.",
      businessImpact:
        "Operating leverage can preserve founder attention and improve execution throughput.",
      ownerId: "owner-cos",
      relatedGoalIds: [],
      relatedWorkstreamIds: [],
      metadata: {
        demo: true,
        mitigation:
          "Company Operating System",
      },
    },
  ];

export const TALENT_DEMO_SEARCHES:
  HiringSearch[] = [
    {
      id:
        "search-technical-gtm",
      roleTitle:
        "Technical GTM / Growth Lead",
      capabilityGapId:
        "gap-technical-gtm",
      status: "ACTIVE",
      priority: "HIGH",
      ownerId: "owner-cos",
      openedAt:
        "2026-09-12T00:00:00.000Z",
      targetHireAt:
        "2026-10-31T00:00:00.000Z",
      updatedAt:
        "2026-09-24T08:00:00.000Z",
      targetPipelineDepth: 4,
      candidateIds: [
        "candidate-a",
        "candidate-b",
        "candidate-c",
        "candidate-d",
      ],
      relatedGoalIds: [
        "goal-gtm-learning",
      ],
      relatedWorkstreamIds: [
        "ws-gtm-learning",
      ],
      metadata: {
        demo: true,
      },
    },

    {
      id:
        "search-enterprise-readiness",
      roleTitle:
        "Enterprise Security / Readiness Operator",
      capabilityGapId:
        "gap-enterprise-readiness",
      status: "ACTIVE",
      priority:
        "CRITICAL",
      ownerId: "owner-cos",
      openedAt:
        "2026-09-10T00:00:00.000Z",
      targetHireAt:
        "2026-10-15T00:00:00.000Z",
      updatedAt:
        "2026-09-20T00:00:00.000Z",
      targetPipelineDepth: 4,
      candidateIds: [
        "candidate-e",
      ],
      relatedGoalIds: [
        "goal-enterprise-readiness",
      ],
      relatedWorkstreamIds: [
        "ws-enterprise-readiness",
      ],
      metadata: {
        demo: true,
      },
    },
  ];

export const TALENT_DEMO_CANDIDATES:
  TalentCandidate[] = [
    {
      id: "candidate-a",
      displayName:
        "Candidate A",
      searchId:
        "search-technical-gtm",
      stage: "FINAL",
      recommendation:
        "HUMAN_REVIEW",
      enteredStageAt:
        "2026-09-22T00:00:00.000Z",
      updatedAt:
        "2026-09-24T08:00:00.000Z",
      ownerId: "owner-ceo",
      evidenceIds: [
        "evidence-a-1",
        "evidence-a-2",
        "evidence-a-3",
      ],
      strengths: [
        "Strong technical discovery structure",
        "Clear developer empathy",
      ],
      openQuestions: [
        "Can the candidate independently build a repeatable enterprise motion?",
      ],
      risks: [
        "Limited evidence on pricing ownership",
      ],
      humanDecisionRequired:
        true,
      metadata: {
        demo: true,
      },
    },

    {
      id: "candidate-b",
      displayName:
        "Candidate B",
      searchId:
        "search-technical-gtm",
      stage: "DEEP_DIVE",
      recommendation:
        "ADVANCE",
      enteredStageAt:
        "2026-09-23T00:00:00.000Z",
      updatedAt:
        "2026-09-23T18:00:00.000Z",
      ownerId: "owner-cos",
      evidenceIds: [
        "evidence-b-1",
      ],
      strengths: [
        "Strong infrastructure category knowledge",
      ],
      openQuestions: [
        "Operating range outside sales",
      ],
      risks: [],
      humanDecisionRequired:
        false,
      metadata: {
        demo: true,
      },
    },

    {
      id: "candidate-c",
      displayName:
        "Candidate C",
      searchId:
        "search-technical-gtm",
      stage: "SCREEN",
      recommendation:
        "UNASSESSED",
      enteredStageAt:
        "2026-09-23T00:00:00.000Z",
      updatedAt:
        "2026-09-23T00:00:00.000Z",
      ownerId: "owner-cos",
      evidenceIds: [],
      strengths: [],
      openQuestions: [
        "Technical depth",
        "Developer-tool experience",
      ],
      risks: [],
      humanDecisionRequired:
        false,
      metadata: {
        demo: true,
      },
    },

    {
      id: "candidate-d",
      displayName:
        "Candidate D",
      searchId:
        "search-technical-gtm",
      stage: "SOURCED",
      recommendation:
        "UNASSESSED",
      enteredStageAt:
        "2026-09-24T00:00:00.000Z",
      updatedAt:
        "2026-09-24T00:00:00.000Z",
      ownerId: "owner-cos",
      evidenceIds: [],
      strengths: [],
      openQuestions: [],
      risks: [],
      humanDecisionRequired:
        false,
      metadata: {
        demo: true,
      },
    },

    {
      id: "candidate-e",
      displayName:
        "Candidate E",
      searchId:
        "search-enterprise-readiness",
      stage: "SCREEN",
      recommendation:
        "HOLD",
      enteredStageAt:
        "2026-09-12T00:00:00.000Z",
      updatedAt:
        "2026-09-12T00:00:00.000Z",
      ownerId: "owner-cos",
      evidenceIds: [
        "evidence-e-1",
      ],
      strengths: [
        "Enterprise process familiarity",
      ],
      openQuestions: [
        "Hands-on security evidence depth",
      ],
      risks: [
        "Pipeline state is stale",
      ],
      humanDecisionRequired:
        false,
      metadata: {
        demo: true,
      },
    },
  ];

export const TALENT_DEMO_EVIDENCE:
  CandidateEvidence[] = [
    {
      id: "evidence-a-1",
      candidateId:
        "candidate-a",
      dimension:
        "Technical discovery",
      observation:
        "Modeled interview evidence indicates a structured approach to diagnosing developer workflow and CI pain.",
      assessment:
        "STRONG",
      source:
        "MODELED_DEMO",
      observedAt:
        "2026-09-23T12:00:00.000Z",
      interviewer:
        "Modeled interview panel",
      metadata: {
        demo: true,
      },
    },

    {
      id: "evidence-a-2",
      candidateId:
        "candidate-a",
      dimension:
        "Developer empathy",
      observation:
        "Modeled evidence suggests the candidate can translate infrastructure performance into developer experience.",
      assessment:
        "POSITIVE",
      source:
        "MODELED_DEMO",
      observedAt:
        "2026-09-23T12:30:00.000Z",
      interviewer:
        "Modeled interview panel",
      metadata: {
        demo: true,
      },
    },

    {
      id: "evidence-a-3",
      candidateId:
        "candidate-a",
      dimension:
        "Commercial ownership",
      observation:
        "Modeled evidence remains incomplete on independently owning pricing and packaging decisions.",
      assessment:
        "UNKNOWN",
      source:
        "MODELED_DEMO",
      observedAt:
        "2026-09-23T13:00:00.000Z",
      interviewer:
        "Modeled interview panel",
      metadata: {
        demo: true,
      },
    },

    {
      id: "evidence-b-1",
      candidateId:
        "candidate-b",
      dimension:
        "Infrastructure category",
      observation:
        "Modeled interview evidence indicates strong familiarity with infrastructure buying and developer-tool categories.",
      assessment:
        "STRONG",
      source:
        "MODELED_DEMO",
      observedAt:
        "2026-09-23T16:00:00.000Z",
      interviewer:
        "Modeled interview panel",
      metadata: {
        demo: true,
      },
    },

    {
      id: "evidence-e-1",
      candidateId:
        "candidate-e",
      dimension:
        "Enterprise readiness",
      observation:
        "Modeled evidence suggests familiarity with enterprise procurement, while security-evidence depth remains unvalidated.",
      assessment:
        "MIXED",
      source:
        "MODELED_DEMO",
      observedAt:
        "2026-09-12T12:00:00.000Z",
      interviewer:
        "Modeled interview panel",
      metadata: {
        demo: true,
      },
    },
  ];