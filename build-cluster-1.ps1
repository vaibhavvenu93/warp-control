$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================"
Write-Host "   WARP / CONTROL - CLUSTER 1 BUILDER"
Write-Host "========================================"
Write-Host ""

$requiredDirs = @(
    "src/components/layout",
    "src/components/ui",
    "src/components/pulse",
    "src/components/decisions",
    "src/data",
    "src/types",
    "src/lib",
    "src/app/pulse",
    "src/app/decisions",
    "src/app/growth",
    "src/app/gtm",
    "src/app/accounts",
    "src/app/economics",
    "src/app/experiments",
    "src/app/agents",
    "src/app/brain",
    "src/app/radar",
    "src/app/operations",
    "src/app/talent",
    "src/app/communications",
    "src/app/lab",
    "src/app/day-zero"
)

foreach ($dir in $requiredDirs) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

Write-Host "[1/7] Directories verified"

@'
export type EvidenceType =
  | "PUBLIC"
  | "MODELED"
  | "ASSUMED"
  | "CONNECTED"
  | "LIVE";

export type Severity = "critical" | "high" | "medium" | "low";
export type Trend = "up" | "down" | "flat";

export interface Metric {
  label: string;
  value: string;
  change?: string;
  trend?: Trend;
  evidence: EvidenceType;
  description?: string;
}

export interface PulseItem {
  id: string;
  category:
    | "Revenue"
    | "Product"
    | "Customer"
    | "Infrastructure"
    | "Growth"
    | "Organisation";
  title: string;
  summary: string;
  severity: Severity;
  evidence: EvidenceType;
  confidence: number;
  action?: string;
}

export interface Decision {
  id: string;
  title: string;
  whyNow: string;
  evidence: string[];
  upside: string;
  downside: string;
  confidence: number;
  missing: string;
  status: "CEO REQUIRED" | "INVESTIGATING" | "APPROVED";
  evidenceType: EvidenceType;
}
'@ | Set-Content -Encoding utf8 "src/types/control.ts"

Write-Host "[2/7] Core types created"

@'
import { Decision, Metric, PulseItem } from "@/types/control";

export const headlineMetrics: Metric[] = [
  {
    label: "Revenue",
    value: "$—",
    change: "Connect billing",
    trend: "flat",
    evidence: "ASSUMED",
    description: "Internal revenue data is intentionally not fabricated.",
  },
  {
    label: "Active customers",
    value: "—",
    change: "Connect CRM",
    trend: "flat",
    evidence: "ASSUMED",
    description: "Customer count requires internal access.",
  },
  {
    label: "CI consumption",
    value: "—",
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
'@ | Set-Content -Encoding utf8 "src/data/control.ts"

Write-Host "[3/7] Intelligence data created"

@'
import { EvidenceType } from "@/types/control";

const styles: Record<EvidenceType, string> = {
  PUBLIC: "badge badge-public",
  MODELED: "badge badge-modeled",
  ASSUMED: "badge badge-assumed",
  CONNECTED: "badge badge-connected",
  LIVE: "badge badge-live",
};

export function EvidenceBadge({ type }: { type: EvidenceType }) {
  return <span className={styles[type]}>{type}</span>;
}
'@ | Set-Content -Encoding utf8 "src/components/ui/evidence-badge.tsx"

@'
import Link from "next/link";
import {
  Activity,
  BrainCircuit,
  Building2,
  ChartNoAxesCombined,
  CircleDollarSign,
  FlaskConical,
  Gauge,
  GitBranch,
  Radar,
  Scale,
  Search,
  Sparkles,
  Target,
  Users,
  Waypoints,
  Zap,
} from "lucide-react";

const sections = [
  {
    label: "CONTROL",
    items: [
      { href: "/", label: "Pulse", icon: Activity },
      { href: "/decisions", label: "Decisions", icon: Scale },
    ],
  },
  {
    label: "REVENUE",
    items: [
      { href: "/growth", label: "Growth", icon: ChartNoAxesCombined },
      { href: "/gtm", label: "GTM Engine", icon: Target },
      { href: "/accounts", label: "Accounts", icon: Building2 },
      { href: "/experiments", label: "Experiments", icon: FlaskConical },
    ],
  },
  {
    label: "MODEL",
    items: [{ href: "/economics", label: "Economics", icon: CircleDollarSign }],
  },
  {
    label: "INTELLIGENCE",
    items: [
      { href: "/agents", label: "Agents", icon: Waypoints },
      { href: "/brain", label: "Company Brain", icon: BrainCircuit },
      { href: "/radar", label: "Market Radar", icon: Radar },
    ],
  },
  {
    label: "COMPANY",
    items: [
      { href: "/operations", label: "Operations", icon: Gauge },
      { href: "/talent", label: "Talent", icon: Users },
      { href: "/communications", label: "Communications", icon: Sparkles },
    ],
  },
  {
    label: "PROOF",
    items: [
      { href: "/lab", label: "WarpBuild Lab", icon: GitBranch },
      { href: "/day-zero", label: "Day Zero", icon: Zap },
    ],
  },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">W</div>
        <div>
          <strong>WARP / CONTROL</strong>
          <span>CEO operating system</span>
        </div>
      </div>

      <nav className="nav">
        {sections.map((section) => (
          <div className="nav-section" key={section.label}>
            <div className="nav-label">{section.label}</div>
            {section.items.map(({ href, label, icon: Icon }) => (
              <Link className="nav-item" href={href} key={href}>
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <Link href="/lab" className="warp-badge">
          <span className="live-dot" />
          BUILT & TESTED ON WARPBUILD
        </Link>
      </div>
    </aside>
  );
}

export function Topbar() {
  return (
    <header className="topbar">
      <button className="command">
        <Search size={16} />
        <span>Ask WARP / CONTROL anything</span>
        <kbd>⌘ K</kbd>
      </button>

      <div className="topbar-right">
        <span className="system-status">
          <span className="live-dot" />
          SYSTEM ONLINE
        </span>
        <span className="avatar">SO</span>
      </div>
    </header>
  );
}
'@ | Set-Content -Encoding utf8 "src/components/layout/shell.tsx"

Write-Host "[4/7] Application shell created"

@'
import { EvidenceBadge } from "@/components/ui/evidence-badge";
import { brief, headlineMetrics, pulseItems } from "@/data/control";
import {
  ArrowRight,
  Bot,
  ChevronRight,
  Clock3,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";

export function PulseDashboard() {
  return (
    <div className="page">
      <section className="hero">
        <div>
          <div className="eyebrow">CEO BRIEF · MONDAY 08:00</div>
          <h1>Good morning, Surya.</h1>
          <p className="hero-copy">
            Here&apos;s what changed across WarpBuild and what deserves your
            attention.
          </p>
        </div>

        <button className="primary-button">
          Start CEO brief <ArrowRight size={16} />
        </button>
      </section>

      <section className="brief-grid">
        <div className="brief-stat">
          <strong>{brief.materialChanges}</strong>
          <span>material changes</span>
        </div>
        <div className="brief-stat urgent">
          <strong>{brief.decisionsRequired}</strong>
          <span>decisions required</span>
        </div>
        <div className="brief-stat">
          <strong>{brief.accountsMoving}</strong>
          <span>accounts moving</span>
        </div>
        <div className="brief-stat warning">
          <strong>{brief.experimentsAtRisk}</strong>
          <span>experiment at risk</span>
        </div>
        <div className="read-time">
          <Clock3 size={16} />
          {brief.readTime} to get caught up
        </div>
      </section>

      <div className="section-heading">
        <div>
          <div className="eyebrow">COMPANY PULSE</div>
          <h2>Operating snapshot</h2>
        </div>
        <span className="muted">Internal metrics remain unclaimed until connected.</span>
      </div>

      <section className="metric-grid">
        {headlineMetrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <div className="card-top">
              <span>{metric.label}</span>
              <EvidenceBadge type={metric.evidence} />
            </div>
            <strong className="metric-value">{metric.value}</strong>
            <div className="metric-change">{metric.change}</div>
            <p>{metric.description}</p>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <div>
          <div className="section-heading compact">
            <div>
              <div className="eyebrow">ATTENTION QUEUE</div>
              <h2>What changed?</h2>
            </div>
            <Link href="/decisions" className="text-link">
              View decisions <ChevronRight size={14} />
            </Link>
          </div>

          <div className="signal-list">
            {pulseItems.map((item) => (
              <article className="signal-card" key={item.id}>
                <div className={`severity severity-${item.severity}`} />
                <div className="signal-main">
                  <div className="signal-meta">
                    <span>{item.id}</span>
                    <span>·</span>
                    <span>{item.category}</span>
                    <EvidenceBadge type={item.evidence} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <div className="signal-footer">
                    <span>Confidence {item.confidence}%</span>
                    <button>{item.action} →</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="right-rail">
          <div className="rail-card decision-rail">
            <div className="rail-icon">
              <TriangleAlert size={18} />
            </div>
            <div className="eyebrow">CEO REQUIRED</div>
            <h3>2 decisions are waiting for judgment.</h3>
            <p>
              WARP / CONTROL has assembled the evidence, assumptions and missing
              information.
            </p>
            <Link href="/decisions" className="secondary-button">
              Open decision queue
            </Link>
          </div>

          <div className="rail-card">
            <div className="rail-icon">
              <Bot size={18} />
            </div>
            <div className="eyebrow">AGENT ACTIVITY</div>
            <h3>11 investigations completed</h3>
            <div className="agent-row">
              <span>Market Radar</span>
              <span>4</span>
            </div>
            <div className="agent-row">
              <span>Account Intelligence</span>
              <span>3</span>
            </div>
            <div className="agent-row">
              <span>CI Economics</span>
              <span>2</span>
            </div>
            <div className="agent-row">
              <span>Customer Voice</span>
              <span>2</span>
            </div>
            <EvidenceBadge type="MODELED" />
          </div>
        </aside>
      </section>
    </div>
  );
}
'@ | Set-Content -Encoding utf8 "src/components/pulse/pulse-dashboard.tsx"

@'
import { EvidenceBadge } from "@/components/ui/evidence-badge";
import { decisions } from "@/data/control";
import { ArrowRight, CircleHelp, ShieldCheck } from "lucide-react";

export function DecisionsDashboard() {
  return (
    <div className="page">
      <section className="page-header">
        <div>
          <div className="eyebrow">CONTROL / DECISIONS</div>
          <h1>Decision queue</h1>
          <p>
            Evidence before opinion. Assumptions are explicit. Judgment stays
            human.
          </p>
        </div>
        <div className="decision-summary">
          <strong>2</strong>
          <span>open decisions</span>
        </div>
      </section>

      <div className="decision-list">
        {decisions.map((decision) => (
          <article className="decision-card" key={decision.id}>
            <div className="decision-card-header">
              <div>
                <div className="signal-meta">
                  <span>{decision.id}</span>
                  <span className="status-pill">{decision.status}</span>
                  <EvidenceBadge type={decision.evidenceType} />
                </div>
                <h2>{decision.title}</h2>
              </div>
              <div className="confidence-ring">
                <strong>{decision.confidence}%</strong>
                <span>confidence</span>
              </div>
            </div>

            <div className="decision-columns">
              <div>
                <div className="eyebrow">WHY NOW</div>
                <p>{decision.whyNow}</p>

                <div className="eyebrow space-top">EVIDENCE</div>
                <ul className="evidence-list">
                  {decision.evidence.map((item) => (
                    <li key={item}>
                      <ShieldCheck size={15} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="decision-economics">
                <div>
                  <span>Potential upside</span>
                  <p>{decision.upside}</p>
                </div>
                <div>
                  <span>Risk / downside</span>
                  <p>{decision.downside}</p>
                </div>
                <div className="missing-box">
                  <CircleHelp size={16} />
                  <div>
                    <span>Missing information</span>
                    <p>{decision.missing}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="decision-actions">
              <button className="secondary-button">Need more evidence</button>
              <button className="secondary-button">Reject</button>
              <button className="primary-button">
                Approve experiment <ArrowRight size={15} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
'@ | Set-Content -Encoding utf8 "src/components/decisions/decisions-dashboard.tsx"

Write-Host "[5/7] Pulse + Decisions created"

@'
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar, Topbar } from "@/components/layout/shell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WARP / CONTROL",
  description: "AI-native CEO & Chief of Staff operating system for WarpBuild",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${mono.variable}`}>
        <div className="app-shell">
          <Sidebar />
          <div className="workspace">
            <Topbar />
            <main>{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
'@ | Set-Content -Encoding utf8 "src/app/layout.tsx"

@'
import { PulseDashboard } from "@/components/pulse/pulse-dashboard";

export default function Home() {
  return <PulseDashboard />;
}
'@ | Set-Content -Encoding utf8 "src/app/page.tsx"

@'
import { DecisionsDashboard } from "@/components/decisions/decisions-dashboard";

export default function DecisionsPage() {
  return <DecisionsDashboard />;
}
'@ | Set-Content -Encoding utf8 "src/app/decisions/page.tsx"

$placeholders = @{
  "growth" = @("Growth", "Where does the next dollar of durable growth come from?", "Growth hypotheses, PLG, expansion and the Next `$1M engine land in Cluster 2.")
  "gtm" = @("GTM Engine", "Signal → Account → Person → Problem → Experiment → Revenue.", "The GTM engineering system lands in Cluster 2.")
  "accounts" = @("Accounts", "Customer and prospect intelligence.", "WarpScore, buying committees and account economics land in Cluster 2.")
  "economics" = @("Economics", "Customer ROI meets WarpBuild unit economics.", "Developer count, CI demand, AI multiplier, pricing, margin and LTV land in Cluster 3.")
  "experiments" = @("Experiments", "Turn assumptions into evidence.", "Growth, product, pricing and GTM experimentation lands in Cluster 3.")
  "agents" = @("Agents", "AI does the recurring work. Humans keep judgment.", "Multi-agent orchestration lands in Cluster 4.")
  "brain" = @("Company Brain", "Why do we know what we know?", "Company memory, evidence and knowledge graph land in Cluster 4.")
  "radar" = @("Market Radar", "Continuously observe the market around WarpBuild.", "Competitors, ecosystem, customer and technology signals land in Cluster 4.")
  "operations" = @("Operations", "Run the company cadence without dropping balls.", "Vendors, legal, finance and recurring workflows land in Cluster 5.")
  "talent" = @("Talent", "Build the team with operating discipline.", "Hiring pipelines and recruiting economics land in Cluster 5.")
  "communications" = @("Communications", "Turn company truth into clear communication.", "Investor updates and external briefs land in Cluster 5.")
  "lab" = @("WarpBuild Lab", "This application becomes the experiment.", "Real GitHub vs WarpBuild CI measurements land in Cluster 6.")
  "day-zero" = @("Day Zero", "Do the job before getting the job.", "The final application narrative lands in Cluster 6.")
}

foreach ($route in $placeholders.Keys) {
    $title = $placeholders[$route][0]
    $subtitle = $placeholders[$route][1]
    $description = $placeholders[$route][2]

    $content = @"
export default function Page() {
  return (
    <div className="page">
      <section className="placeholder-page">
        <div className="eyebrow">WARP / CONTROL</div>
        <h1>$title</h1>
        <p className="placeholder-lead">$subtitle</p>
        <div className="coming-card">
          <span>MODULE ARCHITECTED</span>
          <p>$description</p>
        </div>
      </section>
    </div>
  );
}
"@

    $content | Set-Content -Encoding utf8 "src/app/$route/page.tsx"
}

Write-Host "[6/7] Routes created"

@'
@import "tailwindcss";

:root {
  --bg: #07090d;
  --panel: #0d1117;
  --panel-2: #11161d;
  --panel-3: #151b23;
  --line: #202832;
  --line-soft: #171e26;
  --text: #f4f7fb;
  --muted: #8d98a7;
  --muted-2: #626d7b;
  --accent: #f36b35;
  --accent-soft: rgba(243, 107, 53, 0.12);
  --green: #38d996;
  --green-soft: rgba(56, 217, 150, 0.1);
  --yellow: #eabf55;
  --red: #ff6b6b;
  --blue: #70a5ff;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  min-height: 100%;
  background: var(--bg);
  color: var(--text);
}

body {
  font-family: var(--font-inter), Arial, sans-serif;
}

button,
a {
  font: inherit;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  cursor: pointer;
}

.app-shell {
  display: grid;
  grid-template-columns: 244px minmax(0, 1fr);
  min-height: 100vh;
}

.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  width: 244px;
  border-right: 1px solid var(--line);
  background: #090c11;
  display: flex;
  flex-direction: column;
  z-index: 20;
}

.brand {
  height: 76px;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0 20px;
  border-bottom: 1px solid var(--line);
}

.brand-mark {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  background: var(--accent);
  color: white;
  font-weight: 900;
  border-radius: 7px;
}

.brand strong {
  display: block;
  font-size: 12px;
  letter-spacing: 0.08em;
}

.brand span {
  display: block;
  color: var(--muted-2);
  font-size: 10px;
  margin-top: 3px;
}

.nav {
  padding: 18px 12px 90px;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 20px;
}

.nav-label {
  color: #4f5a67;
  font-family: var(--font-mono), monospace;
  font-size: 9px;
  letter-spacing: 0.15em;
  padding: 0 9px 7px;
}

.nav-item {
  height: 34px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #8994a2;
  border-radius: 6px;
  padding: 0 9px;
  font-size: 12px;
  transition: 150ms ease;
}

.nav-item:hover {
  background: var(--panel-2);
  color: white;
}

.sidebar-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 13px;
  background: #090c11;
  border-top: 1px solid var(--line);
}

.warp-badge {
  min-height: 40px;
  border: 1px solid #26303b;
  border-radius: 7px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 10px;
  color: #9aa6b4;
  font-size: 9px;
  letter-spacing: 0.04em;
}

.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 10px rgba(56, 217, 150, 0.65);
}

.workspace {
  grid-column: 2;
  min-width: 0;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 34px;
  border-bottom: 1px solid var(--line);
  background: rgba(7, 9, 13, 0.9);
  backdrop-filter: blur(16px);
}

.command {
  width: min(440px, 48vw);
  height: 38px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 11px;
  border: 1px solid var(--line);
  background: var(--panel);
  border-radius: 7px;
  color: var(--muted);
  text-align: left;
}

.command span {
  flex: 1;
}

kbd {
  border: 1px solid #2b3541;
  border-radius: 4px;
  color: #657180;
  padding: 2px 6px;
  font-size: 10px;
}

.topbar-right,
.system-status {
  display: flex;
  align-items: center;
  gap: 10px;
}

.system-status {
  color: #667280;
  font-family: var(--font-mono), monospace;
  font-size: 9px;
  letter-spacing: 0.08em;
}

.avatar {
  width: 31px;
  height: 31px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #171e26;
  border: 1px solid #29333e;
  color: #aab4c0;
  font-size: 10px;
}

.page {
  max-width: 1460px;
  margin: 0 auto;
  padding: 44px 42px 80px;
}

.hero,
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  margin-bottom: 30px;
}

.eyebrow {
  font-family: var(--font-mono), monospace;
  color: #687483;
  font-size: 9px;
  letter-spacing: 0.14em;
  font-weight: 700;
}

h1 {
  font-size: clamp(32px, 4vw, 52px);
  letter-spacing: -0.045em;
  line-height: 1;
  margin: 11px 0;
}

h2 {
  font-size: 20px;
  letter-spacing: -0.025em;
  margin: 5px 0 0;
}

h3 {
  font-size: 15px;
  line-height: 1.4;
  letter-spacing: -0.015em;
}

p {
  color: var(--muted);
  line-height: 1.6;
}

.hero-copy {
  margin: 0;
  max-width: 610px;
}

.primary-button,
.secondary-button {
  min-height: 38px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 14px;
  font-weight: 700;
  font-size: 11px;
}

.primary-button {
  background: var(--accent);
  color: white;
  border: 1px solid var(--accent);
}

.primary-button:hover {
  filter: brightness(1.08);
}

.secondary-button {
  background: #121820;
  border: 1px solid #29333e;
  color: #bac3ce;
}

.brief-grid {
  border: 1px solid var(--line);
  background: var(--panel);
  border-radius: 9px;
  display: grid;
  grid-template-columns: repeat(4, 1fr) 1.35fr;
  margin-bottom: 46px;
  overflow: hidden;
}

.brief-stat,
.read-time {
  min-height: 86px;
  padding: 18px;
  border-right: 1px solid var(--line);
}

.brief-stat strong {
  display: block;
  font-size: 25px;
  margin-bottom: 7px;
}

.brief-stat span,
.read-time {
  color: var(--muted);
  font-size: 11px;
}

.brief-stat.urgent strong {
  color: var(--accent);
}

.brief-stat.warning strong {
  color: var(--yellow);
}

.read-time {
  border-right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin: 0 0 15px;
}

.section-heading.compact {
  margin-top: 38px;
}

.muted {
  color: #596573;
  font-size: 10px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.metric-card {
  min-height: 168px;
  padding: 17px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 8px;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #818c99;
  font-size: 11px;
}

.metric-value {
  display: block;
  margin: 23px 0 6px;
  font-size: 27px;
  letter-spacing: -0.04em;
}

.metric-change {
  color: #b1bac5;
  font-size: 10px;
}

.metric-card p {
  color: #596573;
  font-size: 10px;
  margin: 13px 0 0;
}

.badge {
  display: inline-flex;
  align-items: center;
  height: 18px;
  border-radius: 4px;
  padding: 0 6px;
  font-family: var(--font-mono), monospace;
  font-size: 7px;
  font-weight: 800;
  letter-spacing: 0.07em;
  border: 1px solid;
}

.badge-public {
  color: var(--blue);
  border-color: rgba(112, 165, 255, 0.25);
  background: rgba(112, 165, 255, 0.07);
}

.badge-modeled {
  color: #c79cff;
  border-color: rgba(199, 156, 255, 0.24);
  background: rgba(199, 156, 255, 0.07);
}

.badge-assumed {
  color: var(--yellow);
  border-color: rgba(234, 191, 85, 0.25);
  background: rgba(234, 191, 85, 0.07);
}

.badge-connected,
.badge-live {
  color: var(--green);
  border-color: rgba(56, 217, 150, 0.25);
  background: var(--green-soft);
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 18px;
}

.signal-list {
  display: grid;
  gap: 8px;
}

.signal-card {
  position: relative;
  display: flex;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 8px;
  overflow: hidden;
}

.severity {
  width: 3px;
  flex: 0 0 3px;
}

.severity-high {
  background: var(--accent);
}

.severity-medium {
  background: var(--yellow);
}

.severity-low {
  background: #536172;
}

.severity-critical {
  background: var(--red);
}

.signal-main {
  padding: 16px 17px;
  flex: 1;
}

.signal-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
  color: #5f6b78;
  font-family: var(--font-mono), monospace;
  font-size: 8px;
}

.signal-card h3 {
  margin: 9px 0 4px;
}

.signal-card p {
  margin: 0;
  font-size: 11px;
}

.signal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 13px;
  color: #687482;
  font-size: 9px;
}

.signal-footer button {
  border: 0;
  background: transparent;
  color: #b2bdc9;
  font-size: 9px;
}

.text-link {
  display: flex;
  align-items: center;
  color: #8995a3;
  font-size: 10px;
}

.right-rail {
  margin-top: 38px;
  display: grid;
  align-content: start;
  gap: 10px;
}

.rail-card {
  padding: 18px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 8px;
}

.decision-rail {
  background:
    radial-gradient(circle at top right, rgba(243, 107, 53, 0.12), transparent 45%),
    var(--panel);
}

.rail-icon {
  width: 31px;
  height: 31px;
  display: grid;
  place-items: center;
  background: var(--panel-3);
  border: 1px solid var(--line);
  border-radius: 6px;
  color: var(--accent);
  margin-bottom: 20px;
}

.rail-card h3 {
  font-size: 17px;
  margin: 9px 0;
}

.rail-card p {
  font-size: 10px;
}

.rail-card .secondary-button {
  margin-top: 10px;
  width: 100%;
}

.agent-row {
  display: flex;
  justify-content: space-between;
  padding: 9px 0;
  border-bottom: 1px solid var(--line-soft);
  color: #7e8a98;
  font-size: 10px;
}

.rail-card .badge {
  margin-top: 13px;
}

.page-header p {
  max-width: 650px;
  margin-bottom: 0;
}

.decision-summary {
  min-width: 130px;
  padding: 14px 17px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 8px;
}

.decision-summary strong,
.decision-summary span {
  display: block;
}

.decision-summary strong {
  font-size: 24px;
}

.decision-summary span {
  color: var(--muted);
  font-size: 9px;
  margin-top: 3px;
}

.decision-list {
  display: grid;
  gap: 14px;
}

.decision-card {
  padding: 22px;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: var(--panel);
}

.decision-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--line);
}

.decision-card-header h2 {
  max-width: 850px;
  font-size: 22px;
  margin-top: 11px;
}

.status-pill {
  color: var(--accent);
}

.confidence-ring {
  min-width: 86px;
  text-align: right;
}

.confidence-ring strong,
.confidence-ring span {
  display: block;
}

.confidence-ring strong {
  font-size: 20px;
}

.confidence-ring span {
  color: #65717f;
  font-size: 8px;
  margin-top: 3px;
}

.decision-columns {
  display: grid;
  grid-template-columns: 1.3fr 0.7fr;
  gap: 45px;
  padding: 22px 0;
}

.decision-columns p {
  font-size: 11px;
}

.space-top {
  margin-top: 23px;
}

.evidence-list {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 9px;
}

.evidence-list li {
  display: flex;
  gap: 8px;
  color: #929eab;
  font-size: 10px;
}

.evidence-list svg {
  color: var(--green);
  flex: 0 0 auto;
}

.decision-economics {
  display: grid;
  gap: 12px;
}

.decision-economics > div {
  padding: 13px;
  background: var(--panel-2);
  border: 1px solid var(--line);
  border-radius: 6px;
}

.decision-economics span {
  color: #707c8a;
  font-size: 9px;
}

.decision-economics p {
  margin: 4px 0 0;
}

.missing-box {
  display: flex;
  gap: 9px;
}

.missing-box svg {
  color: var(--yellow);
  margin-top: 2px;
  flex: 0 0 auto;
}

.decision-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 17px;
  border-top: 1px solid var(--line);
}

.placeholder-page {
  min-height: calc(100vh - 180px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 720px;
}

.placeholder-lead {
  font-size: 18px;
  max-width: 650px;
}

.coming-card {
  margin-top: 25px;
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--panel);
}

.coming-card span {
  color: var(--accent);
  font-family: var(--font-mono), monospace;
  font-size: 8px;
  letter-spacing: 0.1em;
}

.coming-card p {
  margin-bottom: 0;
  font-size: 11px;
}

@media (max-width: 1050px) {
  .metric-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .right-rail {
    grid-template-columns: repeat(2, 1fr);
    margin-top: 0;
  }

  .brief-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .read-time {
    grid-column: span 2;
  }
}

@media (max-width: 760px) {
  .app-shell {
    display: block;
  }

  .sidebar {
    display: none;
  }

  .workspace {
    width: 100%;
  }

  .topbar {
    padding: 0 18px;
  }

  .page {
    padding: 30px 18px 60px;
  }

  .hero,
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .metric-grid,
  .right-rail,
  .decision-columns {
    grid-template-columns: 1fr;
  }

  .brief-grid {
    grid-template-columns: 1fr 1fr;
  }

  .system-status {
    display: none;
  }

  .command {
    width: 70vw;
  }
}
'@ | Set-Content -Encoding utf8 "src/app/globals.css"

Write-Host "[7/7] Design system created"

Write-Host ""
Write-Host "========================================"
Write-Host "   CLUSTER 1 COMPLETE"
Write-Host "========================================"
Write-Host ""
Write-Host "Built:"
Write-Host "  - WARP / CONTROL application shell"
Write-Host "  - CEO Pulse"
Write-Host "  - Decision Intelligence"
Write-Host "  - Evidence architecture"
Write-Host "  - Full product navigation"
Write-Host "  - Future module routes"
Write-Host ""
Write-Host "Next: npm run dev"
Write-Host ""
