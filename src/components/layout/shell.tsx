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
        <kbd>âŒ˜ K</kbd>
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
