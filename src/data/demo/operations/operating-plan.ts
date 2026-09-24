import type {
  OperatingRepositorySnapshot,
} from "@/repositories/operations/operating-repository";

export const OPERATING_DEMO_NOW =
  "2026-09-24T12:00:00.000Z";

export const OPERATING_DEMO_DISCLAIMER =
  "Company Operating System is running a deterministic demonstration scenario designed around the responsibilities of the WarpBuild Chief of Staff role. Goals, metrics, owners, commitments, blockers, deadlines and operating conditions shown here are modeled examples, not claims about WarpBuild's actual internal plans, performance, team, revenue, customers or company state.";

export const OPERATING_DEMO_PLAN:
  OperatingRepositorySnapshot = {
    owners: [
      {
        id: "owner-ceo",
        name: "CEO",
        role: "CEO",
        function: "Executive",
        isExecutive: true,
      },

      {
        id: "owner-cos",
        name: "Chief of Staff",
        role: "Chief of Staff",
        function: "Operations",
        isExecutive: false,
      },

      {
        id: "owner-growth",
        name: "Growth",
        role: "Growth Owner",
        function: "Growth",
      },

      {
        id: "owner-product",
        name: "Product",
        role: "Product Owner",
        function: "Product",
      },
    ],

    goals: [
      {
        id:
          "goal-enterprise-readiness",

        title:
          "Validate enterprise readiness",

        description:
          "Modeled goal: determine which product, security and commercial capabilities most strongly affect enterprise adoption.",

        status: "ACTIVE",
        priority: "HIGH",

        ownerId:
          "owner-cos",

        startAt:
          "2026-09-01T00:00:00.000Z",

        targetAt:
          "2026-10-31T00:00:00.000Z",

        metricIds: [
          "metric-enterprise-evidence",
        ],

        workstreamIds: [
          "ws-enterprise",
        ],

        health: "AT_RISK",

        lastUpdatedAt:
          "2026-09-23T16:00:00.000Z",

        metadata: {
          scenario:
            "DETERMINISTIC_DEMO",
        },
      },

      {
        id:
          "goal-value-narrative",

        title:
          "Validate CI economic value narrative",

        description:
          "Modeled goal: translate faster CI into an evidence-backed developer and engineering economics narrative.",

        status: "ACTIVE",
        priority: "HIGH",

        ownerId:
          "owner-product",

        startAt:
          "2026-09-01T00:00:00.000Z",

        targetAt:
          "2026-10-15T00:00:00.000Z",

        metricIds: [
          "metric-value-tests",
        ],

        workstreamIds: [
          "ws-economics",
        ],

        health: "ON_TRACK",

        lastUpdatedAt:
          "2026-09-24T08:00:00.000Z",

        metadata: {
          scenario:
            "DETERMINISTIC_DEMO",
        },
      },

      {
        id:
          "goal-gtm-learning",

        title:
          "Build a repeatable GTM learning loop",

        description:
          "Modeled goal: turn account signals, experiments and customer evidence into a repeatable commercial learning system.",

        status: "ACTIVE",
        priority: "HIGH",

        ownerId:
          "owner-growth",

        startAt:
          "2026-09-01T00:00:00.000Z",

        targetAt:
          "2026-11-30T00:00:00.000Z",

        metricIds: [
          "metric-gtm-experiments",
        ],

        workstreamIds: [
          "ws-gtm",
        ],

        health: "WATCH",

        lastUpdatedAt:
          "2026-09-23T14:00:00.000Z",

        metadata: {
          scenario:
            "DETERMINISTIC_DEMO",
        },
      },
    ],

    metrics: [
      {
        id:
          "metric-enterprise-evidence",

        name:
          "Enterprise readiness evidence areas validated",

        description:
          "Modeled count of enterprise adoption assumptions supported by usable evidence.",

        unit: "NUMBER",
        direction: "INCREASE",

        baselineValue: 0,
        currentValue: 2,
        targetValue: 5,

        status: "BEHIND",

        ownerId:
          "owner-cos",

        measuredAt:
          "2026-09-24T08:00:00.000Z",

        updatedAt:
          "2026-09-24T08:00:00.000Z",

        metadata: {
          scenario:
            "DETERMINISTIC_DEMO",
        },
      },

      {
        id:
          "metric-value-tests",

        name:
          "CI value hypotheses tested",

        description:
          "Modeled number of developer economics hypotheses tested through the experiment system.",

        unit: "NUMBER",
        direction: "INCREASE",

        baselineValue: 0,
        currentValue: 3,
        targetValue: 5,

        status: "ON_TRACK",

        ownerId:
          "owner-product",

        measuredAt:
          "2026-09-24T08:00:00.000Z",

        updatedAt:
          "2026-09-24T08:00:00.000Z",

        metadata: {
          scenario:
            "DETERMINISTIC_DEMO",
        },
      },

      {
        id:
          "metric-gtm-experiments",

        name:
          "GTM experiments with decision-grade learning",

        description:
          "Modeled count of commercial experiments producing evidence strong enough to inform a next action.",

        unit: "NUMBER",
        direction: "INCREASE",

        baselineValue: 0,
        currentValue: 2,
        targetValue: 6,

        status: "WATCH",

        ownerId:
          "owner-growth",

        measuredAt:
          "2026-09-24T08:00:00.000Z",

        updatedAt:
          "2026-09-24T08:00:00.000Z",

        metadata: {
          scenario:
            "DETERMINISTIC_DEMO",
        },
      },
    ],

    workstreams: [
      {
        id: "ws-enterprise",

        title:
          "Enterprise readiness",

        description:
          "Modeled workstream covering security evidence, procurement friction and enterprise adoption requirements.",

        type: "STRATEGY",
        status: "BLOCKED",
        priority: "HIGH",

        ownerId:
          "owner-cos",

        goalIds: [
          "goal-enterprise-readiness",
        ],

        commitmentIds: [
          "commit-security-map",
          "commit-enterprise-interviews",
        ],

        dependencyIds: [
          "dep-security-evidence",
        ],

        issueIds: [
          "issue-security-boundary",
        ],

        health: "AT_RISK",

        lastUpdatedAt:
          "2026-09-23T16:00:00.000Z",

        metadata: {
          scenario:
            "DETERMINISTIC_DEMO",
        },
      },

      {
        id: "ws-economics",

        title:
          "CI economics validation",

        description:
          "Modeled workstream connecting build performance to developer time, engineering throughput and commercial value.",

        type: "PRODUCT",
        status: "ACTIVE",
        priority: "HIGH",

        ownerId:
          "owner-product",

        goalIds: [
          "goal-value-narrative",
        ],

        commitmentIds: [
          "commit-economics-model",
        ],

        dependencyIds: [],

        issueIds: [],

        health: "ON_TRACK",

        lastUpdatedAt:
          "2026-09-24T08:00:00.000Z",

        metadata: {
          scenario:
            "DETERMINISTIC_DEMO",
        },
      },

      {
        id: "ws-gtm",

        title:
          "GTM learning system",

        description:
          "Modeled workstream connecting ICP intelligence, account signals, experiments and outbound learning.",

        type: "GTM",
        status: "ACTIVE",
        priority: "HIGH",

        ownerId:
          "owner-growth",

        goalIds: [
          "goal-gtm-learning",
        ],

        commitmentIds: [
          "commit-account-loop",
          "commit-pricing-test",
        ],

        dependencyIds: [],

        issueIds: [
          "issue-pricing-test",
        ],

        health: "WATCH",

        lastUpdatedAt:
          "2026-09-23T14:00:00.000Z",

        metadata: {
          scenario:
            "DETERMINISTIC_DEMO",
        },
      },
    ],

    commitments: [
      {
        id:
          "commit-security-map",

        title:
          "Map enterprise security evidence requirements",

        description:
          "Modeled commitment to structure the evidence an enterprise buyer may require.",

        workstreamId:
          "ws-enterprise",

        goalIds: [
          "goal-enterprise-readiness",
        ],

        ownerId:
          "owner-cos",

        status: "BLOCKED",
        priority: "HIGH",

        createdAt:
          "2026-09-10T00:00:00.000Z",

        dueAt:
          "2026-09-22T00:00:00.000Z",

        updatedAt:
          "2026-09-23T16:00:00.000Z",

        dependencyIds: [
          "dep-security-evidence",
        ],

        issueIds: [
          "issue-security-boundary",
        ],

        health: "AT_RISK",

        metadata: {
          scenario:
            "DETERMINISTIC_DEMO",
        },
      },

      {
        id:
          "commit-enterprise-interviews",

        title:
          "Define enterprise discovery interview loop",

        description:
          "Modeled commitment to establish a repeatable customer evidence loop.",

        workstreamId:
          "ws-enterprise",

        goalIds: [
          "goal-enterprise-readiness",
        ],

        ownerId:
          "owner-cos",

        status: "IN_PROGRESS",
        priority: "MEDIUM",

        createdAt:
          "2026-09-18T00:00:00.000Z",

        dueAt:
          "2026-09-29T00:00:00.000Z",

        updatedAt:
          "2026-09-24T07:00:00.000Z",

        dependencyIds: [],
        issueIds: [],

        health: "ON_TRACK",

        metadata: {
          scenario:
            "DETERMINISTIC_DEMO",
        },
      },

      {
        id:
          "commit-economics-model",

        title:
          "Validate CI economics model assumptions",

        description:
          "Modeled commitment to test the assumptions behind developer-time and feedback-loop value calculations.",

        workstreamId:
          "ws-economics",

        goalIds: [
          "goal-value-narrative",
        ],

        ownerId:
          "owner-product",

        status: "IN_PROGRESS",
        priority: "HIGH",

        createdAt:
          "2026-09-15T00:00:00.000Z",

        dueAt:
          "2026-09-30T00:00:00.000Z",

        updatedAt:
          "2026-09-24T08:00:00.000Z",

        dependencyIds: [],
        issueIds: [],

        health: "ON_TRACK",

        metadata: {
          scenario:
            "DETERMINISTIC_DEMO",
        },
      },

      {
        id:
          "commit-account-loop",

        title:
          "Connect account signals to GTM actions",

        description:
          "Modeled commitment to route high-value account intelligence into explicit commercial actions.",

        workstreamId:
          "ws-gtm",

        goalIds: [
          "goal-gtm-learning",
        ],

        ownerId:
          "owner-growth",

        status: "IN_PROGRESS",
        priority: "HIGH",

        createdAt:
          "2026-09-17T00:00:00.000Z",

        dueAt:
          "2026-09-28T00:00:00.000Z",

        updatedAt:
          "2026-09-23T14:00:00.000Z",

        dependencyIds: [],
        issueIds: [],

        health: "ON_TRACK",

        metadata: {
          scenario:
            "DETERMINISTIC_DEMO",
        },
      },

      {
        id:
          "commit-pricing-test",

        title:
          "Define price-performance packaging experiment",

        description:
          "Modeled commitment to convert the pricing hypothesis into a controlled experiment.",

        workstreamId:
          "ws-gtm",

        goalIds: [
          "goal-gtm-learning",
        ],

        ownerId:
          "owner-growth",

        status: "IN_PROGRESS",
        priority: "HIGH",

        createdAt:
          "2026-09-19T00:00:00.000Z",

        dueAt:
          "2026-09-27T00:00:00.000Z",

        updatedAt:
          "2026-09-23T14:00:00.000Z",

        dependencyIds: [],

        issueIds: [
          "issue-pricing-test",
        ],

        health: "WATCH",

        metadata: {
          scenario:
            "DETERMINISTIC_DEMO",
        },
      },
    ],

    dependencies: [
      {
        id:
          "dep-security-evidence",

        title:
          "Security evidence boundary",

        description:
          "Modeled dependency: determine which enterprise security assertions can be supported by evidence before using them commercially.",

        status: "BLOCKED",
        priority: "HIGH",

        ownerId:
          "owner-cos",

        targetWorkstreamId:
          "ws-enterprise",

        requiredBy:
          "2026-09-22T00:00:00.000Z",

        updatedAt:
          "2026-09-23T16:00:00.000Z",

        health: "AT_RISK",

        metadata: {
          scenario:
            "DETERMINISTIC_DEMO",
        },
      },
    ],

    issues: [
      {
        id:
          "issue-security-boundary",

        title:
          "Enterprise security claim boundary needs resolution",

        description:
          "Modeled issue: the operating system should not turn assumed enterprise security capabilities into external claims without validated evidence.",

        type: "DECISION",
        status: "OPEN",
        priority: "CRITICAL",

        ownerId:
          "owner-ceo",

        goalIds: [
          "goal-enterprise-readiness",
        ],

        workstreamIds: [
          "ws-enterprise",
        ],

        commitmentIds: [
          "commit-security-map",
        ],

        dependencyIds: [
          "dep-security-evidence",
        ],

        openedAt:
          "2026-09-23T10:00:00.000Z",

        targetResolutionAt:
          "2026-09-25T18:00:00.000Z",

        updatedAt:
          "2026-09-24T08:00:00.000Z",

        decisionRequired: true,

        health: "OFF_TRACK",

        metadata: {
          scenario:
            "DETERMINISTIC_DEMO",
          humanBoundary:
            "External company claims require verified evidence.",
        },
      },

      {
        id:
          "issue-pricing-test",

        title:
          "Pricing experiment needs executive boundary",

        description:
          "Modeled issue: define the acceptable commercial boundary for a price-performance packaging test before execution.",

        type: "DECISION",
        status: "OPEN",
        priority: "HIGH",

        ownerId:
          "owner-ceo",

        goalIds: [
          "goal-gtm-learning",
        ],

        workstreamIds: [
          "ws-gtm",
        ],

        commitmentIds: [
          "commit-pricing-test",
        ],

        dependencyIds: [],

        openedAt:
          "2026-09-23T12:00:00.000Z",

        targetResolutionAt:
          "2026-09-26T18:00:00.000Z",

        updatedAt:
          "2026-09-24T08:00:00.000Z",

        decisionRequired: true,

        health: "WATCH",

        metadata: {
          scenario:
            "DETERMINISTIC_DEMO",
        },
      },
    ],

    followUps: [
      {
        id:
          "followup-security",

        title:
          "Confirm evidence available for enterprise security claims",

        ownerId:
          "owner-cos",

        status: "OPEN",
        priority: "HIGH",

        createdAt:
          "2026-09-24T08:00:00.000Z",

        dueAt:
          "2026-09-25T12:00:00.000Z",

        goalId:
          "goal-enterprise-readiness",

        workstreamId:
          "ws-enterprise",

        commitmentId:
          "commit-security-map",

        issueId:
          "issue-security-boundary",

        metadata: {
          scenario:
            "DETERMINISTIC_DEMO",
        },
      },

      {
        id:
          "followup-pricing",

        title:
          "Prepare pricing experiment decision brief",

        ownerId:
          "owner-growth",

        status: "OPEN",
        priority: "HIGH",

        createdAt:
          "2026-09-24T08:00:00.000Z",

        dueAt:
          "2026-09-26T12:00:00.000Z",

        goalId:
          "goal-gtm-learning",

        workstreamId:
          "ws-gtm",

        commitmentId:
          "commit-pricing-test",

        issueId:
          "issue-pricing-test",

        metadata: {
          scenario:
            "DETERMINISTIC_DEMO",
        },
      },
    ],

    cadences: [
      {
        id:
          "cadence-company-weekly",

        title:
          "Weekly company operating review",

        description:
          "Modeled CEO and Chief of Staff review of goals, metrics, commitments, blockers and decision boundaries.",

        cadence: "WEEKLY",
        reviewType: "COMPANY",

        ownerId:
          "owner-cos",

        participantIds: [
          "owner-ceo",
          "owner-cos",
        ],

        metricIds: [],

        goalIds: [],

        workstreamIds: [],

        enabled: true,

        metadata: {
          scenario:
            "DETERMINISTIC_DEMO",
        },
      },

      {
        id:
          "cadence-gtm-weekly",

        title:
          "Weekly GTM learning review",

        description:
          "Modeled review of account intelligence, experiments and commercial learning.",

        cadence: "WEEKLY",
        reviewType: "GTM",

        ownerId:
          "owner-growth",

        participantIds: [
          "owner-growth",
          "owner-cos",
        ],

        metricIds: [
          "metric-gtm-experiments",
        ],

        goalIds: [
          "goal-gtm-learning",
        ],

        workstreamIds: [
          "ws-gtm",
        ],

        enabled: true,

        metadata: {
          scenario:
            "DETERMINISTIC_DEMO",
        },
      },

      {
        id:
          "cadence-investor-monthly",

        title:
          "Monthly investor update cycle",

        description:
          "Modeled operating cadence for converting company truth into a concise investor update.",

        cadence: "MONTHLY",
        reviewType: "INVESTOR",

        ownerId:
          "owner-cos",

        participantIds: [
          "owner-ceo",
          "owner-cos",
        ],

        metricIds: [],
        goalIds: [],
        workstreamIds: [],

        enabled: true,

        metadata: {
          scenario:
            "DETERMINISTIC_DEMO",
        },
      },
    ],
  };