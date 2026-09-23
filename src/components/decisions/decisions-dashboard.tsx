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
