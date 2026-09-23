import { Decision, Metric, PulseItem } from "@/types/control";

export const headlineMetrics: Metric[] = [
  {
    label: "Revenue",
    value: "$â€”",
    change: "Connect billing",
    trend: "flat",
    evidence: "ASSUMED",
    description: "Internal revenue data is intentionally not fabricated.",
  },
  {
    label: "Active customers",
    value: "â€”",
    change: "Connect CRM",
    trend: "flat",
    evidence: "ASSUMED",
    description: "Customer count requires internal access.",
  },
  {
    label: "CI consumption",
    value: "â€”",
    change: "Connect usage",
    trend: "flat",
    evidence: "ASSUMED",
    description: "Runner consumption becomes live after integration.",
  },
  {
    label: "Open experiments",
    value: "12",
    change: "3 need review",
    trend: "up",
    evidence: "MODELED",
    description: "Demonstration experiment portfolio.",
  },
];

export const pulseItems: PulseItem[] = [
  {
    id: "SIG-041",
    category: "Growth",
    title: "AI-native engineering may be an emerging ICP",
    summary:
      "Agentic coding increases code-generation velocity. The operating hypothesis is that validation and CI demand rise with it.",
    severity: "high",
    evidence: "MODELED",
    confidence: 74,
    action: "Open GTM experiment",
  },
  {
    id: "SIG-038",
    category: "Customer",
    title: "Expansion should be modeled from usage, not logos",
    summary:
      "Repository growth, runner consumption and architecture complexity can become earlier expansion indicators than account size alone.",
    severity: "medium",
    evidence: "MODELED",
    confidence: 81,
    action: "Inspect accounts",
  },
  {
    id: "SIG-035",
    category: "Infrastructure",
    title: "CI economics need workload-level visibility",
    summary:
      "Revenue without compute, storage and runner-class contribution obscures which workloads create durable gross profit.",
    severity: "medium",
    evidence: "MODELED",
    confidence: 88,
    action: "Open economics",
  },
  {
    id: "SIG-029",
    category: "Organisation",
    title: "Recurring research is an agent candidate",
    summary:
      "Market monitoring, account enrichment and weekly synthesis can be delegated while keeping judgment and approvals human.",
    severity: "low",
    evidence: "MODELED",
    confidence: 92,
    action: "Inspect agents",
  },
];

export const decisions: Decision[] = [
  {
    id: "DEC-014",
    title: "Should WarpBuild test an explicit AI-native engineering GTM motion?",
    whyNow:
      "AI coding tools may increase iteration frequency and therefore increase the economic importance of fast CI.",
    evidence: [
      "Coding-agent adoption is changing software-development workflows.",
      "WarpBuild already solves a feedback-loop problem inside engineering teams.",
      "The thesis can be tested cheaply before creating a dedicated vertical.",
    ],
    upside: "Potential new high-intensity ICP and differentiated category narrative.",
    downside: "Messaging could be premature if AI adoption does not translate into materially higher CI demand.",
    confidence: 71,
    missing: "Internal usage segmented by AI-native vs traditional engineering teams.",
    status: "CEO REQUIRED",
    evidenceType: "MODELED",
  },
  {
    id: "DEC-011",
    title: "Which account signal should trigger enterprise intervention?",
    whyNow:
      "A product-led motion needs a clear point where usage becomes valuable enough for a human sales intervention.",
    evidence: [
      "Repository expansion can indicate organisational adoption.",
      "Runner-minute acceleration can indicate workload consolidation.",
      "BYOC/security requirements may reveal enterprise intent.",
    ],
    upside: "Higher sales efficiency and better expansion timing.",
    downside: "Poor thresholds can create unnecessary sales touches.",
    confidence: 66,
    missing: "Historical conversion by usage threshold.",
    status: "INVESTIGATING",
    evidenceType: "MODELED",
  },
];

export const brief = {
  materialChanges: 4,
  decisionsRequired: 2,
  accountsMoving: 3,
  experimentsAtRisk: 1,
  readTime: "3m 42s",
};
