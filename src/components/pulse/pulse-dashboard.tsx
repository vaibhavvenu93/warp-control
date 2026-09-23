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

