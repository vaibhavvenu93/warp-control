import {
  CompanyBrainConsole,
} from "@/components/brain/company-brain-console";

import {
  BrainIntelligencePanel,
} from "@/components/brain/brain-intelligence-panel";

export default function Page() {
  return (
    <div className="page brain-page">
      <section className="brain-page-header">
        <div>
          <div className="eyebrow">
            WARP / CONTROL
            · INTELLIGENCE
            LAYER
          </div>

          <h1>
            Company Brain
          </h1>

          <p>
            Ask a business
            question. The system
            retrieves the evidence,
            exposes what is known,
            modeled and unknown,
            evaluates whether it
            can answer, and keeps
            the final human
            decision boundary
            explicit.
          </p>
        </div>

        <div className="brain-architecture-badge">
          <span className="live-dot" />

          <div>
            <strong>
              KNOWLEDGE SYSTEM
            </strong>

            <span>
              Retrieval ·
              provenance ·
              governance
            </span>
          </div>
        </div>
      </section>

      <CompanyBrainConsole />

      <BrainIntelligencePanel />

      <style>{`
        .brain-page {
          max-width: 1560px;
        }

        .brain-page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 32px;
          margin-bottom: 28px;
        }

        .brain-page-header h1 {
          margin-bottom: 14px;
        }

        .brain-page-header p {
          max-width: 760px;
          margin: 0;
          color: #aeb8c4;
          font-size: 14px;
          line-height: 1.7;
        }

        .brain-architecture-badge {
          min-width: 235px;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 13px 14px;
          border: 1px solid var(--line);
          border-radius: 8px;
          background: var(--panel);
        }

        .brain-architecture-badge strong,
        .brain-architecture-badge span {
          display: block;
        }

        .brain-architecture-badge strong {
          color: #dce3eb;
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.08em;
        }

        .brain-architecture-badge span {
          color: #6f7c8a;
          font-size: 9px;
          margin-top: 4px;
        }

        .brain-console {
          display: grid;
          gap: 18px;
        }

        .brain-query-panel {
          border: 1px solid #29323d;
          border-radius: 10px;
          background:
            radial-gradient(
              circle at 85% 0%,
              rgba(243, 107, 53, 0.08),
              transparent 34%
            ),
            #0d1117;
          overflow: hidden;
        }

        .brain-query-label {
          height: 42px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 17px;
          border-bottom: 1px solid var(--line);
          color: #c0cad5;
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.1em;
        }

        .brain-query-label > span:last-child {
          margin-left: auto;
          color: var(--green);
          font-size: 8px;
        }

        .brain-query-form {
          padding: 20px;
        }

        .brain-query-form textarea {
          width: 100%;
          min-height: 92px;
          resize: vertical;
          border: 0;
          outline: 0;
          padding: 0;
          background: transparent;
          color: #f5f7fa;
          font-family: var(--font-inter), Arial, sans-serif;
          font-size: 21px;
          font-weight: 600;
          line-height: 1.45;
          letter-spacing: -0.025em;
        }

        .brain-query-form textarea::placeholder {
          color: #4f5b68;
        }

        .brain-query-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding-top: 16px;
          border-top: 1px solid var(--line-soft);
        }

        .brain-query-actions > span {
          color: #667483;
          font-family: var(--font-mono), monospace;
          font-size: 8px;
          letter-spacing: 0.07em;
        }

        .brain-query-actions button:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .brain-suggestions {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-top: 1px solid var(--line);
        }

        .brain-suggestions button {
          min-height: 68px;
          display: flex;
          align-items: flex-start;
          gap: 9px;
          padding: 13px;
          border: 0;
          border-right: 1px solid var(--line);
          background: rgba(10, 14, 19, 0.65);
          color: #8f9ba9;
          text-align: left;
          font-size: 10px;
          line-height: 1.5;
        }

        .brain-suggestions button:last-child {
          border-right: 0;
        }

        .brain-suggestions button:hover {
          background: #121820;
          color: #d4dbe3;
        }

        .brain-suggestions button span {
          color: #4f5d6c;
          font-family: var(--font-mono), monospace;
          font-size: 8px;
        }

        .brain-empty {
          min-height: 355px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 50px;
          border: 1px solid var(--line);
          border-radius: 10px;
          background: var(--panel);
          text-align: center;
        }

        .brain-empty-mark {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          margin-bottom: 20px;
          border: 1px solid #34404d;
          border-radius: 10px;
          background: #121820;
          color: var(--accent);
          font-family: var(--font-mono), monospace;
          font-weight: 900;
        }

        .brain-empty h2 {
          margin: 10px 0 8px;
          font-size: 25px;
        }

        .brain-empty p {
          max-width: 600px;
          margin: 0;
          color: #8491a0;
          font-size: 12px;
        }

        .brain-empty-pipeline {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 25px;
          color: #596675;
          font-family: var(--font-mono), monospace;
          font-size: 8px;
          letter-spacing: 0.08em;
        }

        .brain-empty-pipeline b {
          color: #37414c;
        }

        .brain-loading,
        .brain-error {
          padding: 18px;
          border: 1px solid var(--line);
          border-radius: 8px;
          background: var(--panel);
        }

        .brain-loading {
          display: flex;
          align-items: center;
          gap: 13px;
          color: #8f9ba8;
          font-family: var(--font-mono), monospace;
          font-size: 9px;
        }

        .brain-loading-line {
          width: 36px;
          height: 2px;
          background: var(--accent);
          animation: brainPulse 1s infinite alternate;
        }

        @keyframes brainPulse {
          from {
            opacity: 0.25;
            transform: scaleX(0.5);
          }

          to {
            opacity: 1;
            transform: scaleX(1);
          }
        }

        .brain-error {
          border-color: rgba(255, 107, 107, 0.3);
          color: #ff8a8a;
          font-size: 11px;
        }

        .brain-result-header {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 130px;
          gap: 30px;
          padding: 25px;
          border: 1px solid var(--line);
          border-radius: 10px 10px 0 0;
          background: var(--panel);
        }

        .brain-result-status {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #718090;
          font-family: var(--font-mono), monospace;
          font-size: 8px;
        }

        .brain-result-header h2 {
          max-width: 900px;
          margin: 13px 0 10px;
          font-size: 25px;
          line-height: 1.25;
        }

        .brain-direct-answer {
          max-width: 970px;
          margin: 0;
          color: #b4bec9;
          font-size: 13px;
          line-height: 1.75;
        }

        .brain-confidence {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-end;
          border-left: 1px solid var(--line);
        }

        .brain-confidence strong {
          color: #fff;
          font-size: 34px;
          letter-spacing: -0.05em;
        }

        .brain-confidence span {
          margin-top: 6px;
          color: #657382;
          font-family: var(--font-mono), monospace;
          font-size: 7px;
          letter-spacing: 0.1em;
        }

        .brain-state,
        .brain-trace-status {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          border: 1px solid currentColor;
          border-radius: 4px;
          padding: 3px 6px;
          font-family: var(--font-mono), monospace;
          font-size: 7px;
          font-weight: 800;
          letter-spacing: 0.06em;
        }

        .brain-tone-green {
          color: var(--green);
        }

        .brain-tone-yellow {
          color: var(--yellow);
        }

        .brain-tone-red {
          color: var(--red);
        }

        .brain-tone-purple {
          color: #c79cff;
        }

        .brain-control-strip {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          border: 1px solid var(--line);
          border-top: 0;
          background: #0a0e13;
        }

        .brain-control-strip > div {
          min-height: 67px;
          padding: 13px 15px;
          border-right: 1px solid var(--line);
        }

        .brain-control-strip > div:last-child {
          border-right: 0;
        }

        .brain-control-strip span,
        .brain-control-strip strong {
          display: block;
        }

        .brain-control-strip span {
          color: #596675;
          font-family: var(--font-mono), monospace;
          font-size: 7px;
          letter-spacing: 0.09em;
        }

        .brain-control-strip strong {
          margin-top: 7px;
          color: #d8dfe7;
          font-size: 11px;
        }

        .brain-attention {
          color: var(--accent) !important;
        }

        .brain-result-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 370px;
          gap: 16px;
          margin-top: 16px;
        }

        .brain-answer-column,
        .brain-evidence-rail {
          display: grid;
          align-content: start;
          gap: 10px;
        }

        .brain-answer-section,
        .brain-rail-panel {
          border: 1px solid var(--line);
          border-radius: 8px;
          background: var(--panel);
        }

        .brain-answer-section {
          padding: 20px;
          border-left: 3px solid #303a46;
        }

        .brain-section-modeled {
          border-left-color: #a47be0;
        }

        .brain-section-unknown {
          border-left-color: var(--yellow);
        }

        .brain-section-decision {
          border-left-color: var(--accent);
        }

        .brain-section-next {
          border-left-color: var(--blue);
        }

        .brain-section-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .brain-section-kind {
          color: #647180;
          font-family: var(--font-mono), monospace;
          font-size: 7px;
          letter-spacing: 0.1em;
        }

        .brain-section-heading h3 {
          margin: 5px 0 0;
          font-size: 17px;
        }

        .brain-source-count {
          color: #697686;
          font-family: var(--font-mono), monospace;
          font-size: 8px;
        }

        .brain-answer-section > p {
          margin: 12px 0 0;
          color: #aeb8c4;
          font-size: 12px;
          line-height: 1.7;
        }

        .brain-section-citations {
          display: grid;
          gap: 7px;
          margin-top: 15px;
        }

        .brain-citation-chip {
          padding: 12px;
          border: 1px solid var(--line-soft);
          border-radius: 6px;
          background: #0a0e13;
        }

        .brain-citation-chip-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #657382;
          font-family: var(--font-mono), monospace;
          font-size: 8px;
        }

        .brain-citation-chip > strong {
          display: block;
          margin-top: 9px;
          color: #c6ced7;
          font-size: 10px;
          line-height: 1.55;
        }

        .brain-citation-meta {
          display: flex;
          gap: 8px;
          margin-top: 9px;
          color: #566372;
          font-family: var(--font-mono), monospace;
          font-size: 7px;
        }

        .brain-rail-panel {
          padding: 17px;
        }

        .brain-rail-panel h3 {
          margin: 7px 0 15px;
          font-size: 16px;
        }

        .brain-governance-panel {
          background:
            radial-gradient(
              circle at top right,
              rgba(243, 107, 53, 0.09),
              transparent 48%
            ),
            var(--panel);
        }

        .brain-policy-row {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 9px 0;
          border-top: 1px solid var(--line-soft);
          color: #7f8c9a;
          font-size: 9px;
        }

        .brain-policy-row strong {
          color: #b8c2cc;
          font-family: var(--font-mono), monospace;
          font-size: 8px;
        }

        .brain-gap-list {
          display: grid;
          gap: 7px;
        }

        .brain-gap-list > div {
          display: grid;
          grid-template-columns: 22px 1fr;
          gap: 8px;
          padding: 10px;
          border: 1px solid var(--line-soft);
          border-radius: 5px;
          background: #0a0e13;
        }

        .brain-gap-list span {
          color: var(--yellow);
          font-family: var(--font-mono), monospace;
          font-size: 8px;
        }

        .brain-gap-list p {
          margin: 0;
          color: #9da8b5;
          font-size: 9px;
          line-height: 1.5;
        }

        .brain-ledger {
          display: grid;
          gap: 8px;
        }

        .brain-ledger-row {
          padding-bottom: 10px;
          border-bottom: 1px solid var(--line-soft);
        }

        .brain-ledger-row:last-child {
          padding-bottom: 0;
          border-bottom: 0;
        }

        .brain-ledger-row > div {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .brain-ledger-row strong {
          color: #768493;
          font-family: var(--font-mono), monospace;
          font-size: 7px;
        }

        .brain-ledger-row p {
          margin: 7px 0 5px;
          color: #aab4bf;
          font-size: 9px;
          line-height: 1.5;
        }

        .brain-ledger-row small {
          color: #53606e;
          font-family: var(--font-mono), monospace;
          font-size: 7px;
        }

        .brain-trace {
          display: grid;
        }

        .brain-trace-row {
          display: grid;
          grid-template-columns: 24px minmax(0, 1fr) auto;
          gap: 8px;
          padding: 10px 0;
          border-top: 1px solid var(--line-soft);
        }

        .brain-trace-index {
          color: #4d5967;
          font-family: var(--font-mono), monospace;
          font-size: 7px;
        }

        .brain-trace-row strong {
          color: #b8c2cd;
          font-size: 9px;
        }

        .brain-trace-row p {
          margin: 3px 0 0;
          color: #687584;
          font-size: 8px;
          line-height: 1.45;
        }

        .brain-trace-status {
          align-self: start;
          font-size: 6px;
        }

        .brain-lineage {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid var(--line);
        }

        .brain-lineage span {
          display: block;
          color: #566270;
          font-family: var(--font-mono), monospace;
          font-size: 7px;
        }

        .brain-lineage code {
          display: block;
          margin-top: 5px;
          overflow-wrap: anywhere;
          color: #8e9aa7;
          font-size: 8px;
        }

        .brain-system-footer {
          display: grid;
          grid-template-columns: 1fr 2fr 0.6fr;
          gap: 1px;
          margin-top: 2px;
          border: 1px solid var(--line);
          border-radius: 7px;
          overflow: hidden;
          background: var(--line);
        }

        .brain-system-footer > div {
          padding: 11px 13px;
          background: #090d12;
        }

        .brain-system-footer span {
          display: block;
          color: #53606e;
          font-family: var(--font-mono), monospace;
          font-size: 7px;
          letter-spacing: 0.08em;
        }

        .brain-system-footer strong,
        .brain-system-footer code {
          display: block;
          margin-top: 5px;
          color: #7f8b99;
          font-size: 8px;
          overflow-wrap: anywhere;
        }


        .brain-intelligence-shell {
          display: grid;
          gap: 16px;
          margin-top: 14px;
          padding-top: 28px;
          border-top: 1px solid var(--line);
        }

        .brain-intelligence-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
        }

        .brain-intelligence-heading h2 {
          margin: 7px 0 8px;
          font-size: 23px;
        }

        .brain-intelligence-heading p {
          max-width: 720px;
          margin: 0;
          color: #7f8c9a;
          font-size: 11px;
          line-height: 1.65;
        }

        .brain-intelligence-health {
          min-width: 155px;
          text-align: right;
        }

        .brain-intelligence-health span,
        .brain-intelligence-health small {
          display: block;
          color: #596675;
          font-family: var(--font-mono), monospace;
          font-size: 7px;
          letter-spacing: 0.08em;
        }

        .brain-intelligence-health strong {
          display: block;
          margin: 5px 0;
          color: #fff;
          font-size: 29px;
        }

        .brain-intelligence-metrics {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          border: 1px solid var(--line);
          border-radius: 8px;
          overflow: hidden;
          background: var(--line);
          gap: 1px;
        }

        .brain-intelligence-metrics > div {
          padding: 13px 14px;
          background: #0a0e13;
        }

        .brain-intelligence-metrics span,
        .brain-intelligence-metrics small {
          display: block;
          color: #596675;
          font-family: var(--font-mono), monospace;
          font-size: 7px;
        }

        .brain-intelligence-metrics strong {
          display: block;
          margin: 6px 0 3px;
          color: #e1e6ec;
          font-size: 19px;
        }

        .brain-intelligence-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 390px;
          gap: 16px;
        }

        .brain-intelligence-main,
        .brain-source-column {
          display: grid;
          align-content: start;
          gap: 12px;
        }

        .brain-knowledge-panel,
        .brain-source-registry,
        .brain-inspector {
          border: 1px solid var(--line);
          border-radius: 8px;
          background: var(--panel);
          padding: 17px;
        }

        .brain-panel-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 14px;
        }

        .brain-panel-title > span {
          color: #687584;
          font-family: var(--font-mono), monospace;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.09em;
        }

        .brain-panel-title > strong {
          color: #8995a2;
          font-family: var(--font-mono), monospace;
          font-size: 8px;
        }

        .brain-state-bars {
          display: grid;
          gap: 10px;
        }

        .brain-state-bar-row {
          display: grid;
          grid-template-columns: 115px minmax(0, 1fr) 42px;
          align-items: center;
          gap: 12px;
        }

        .brain-state-bar-row > div:first-child {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .brain-state-bar-row > div:first-child strong,
        .brain-state-bar-row small {
          color: #6f7c8a;
          font-family: var(--font-mono), monospace;
          font-size: 8px;
        }

        .brain-state-track {
          height: 5px;
          border-radius: 999px;
          background: #151b22;
          overflow: hidden;
        }

        .brain-state-fill {
          height: 100%;
          border-radius: inherit;
          background: currentColor;
        }

        .brain-graph {
          display: grid;
          gap: 8px;
        }

        .brain-graph-edge {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 115px minmax(0, 1fr);
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 1px solid var(--line-soft);
          border-radius: 6px;
          background: #0a0e13;
        }

        .brain-graph-node span,
        .brain-graph-node strong {
          display: block;
        }

        .brain-graph-node span {
          color: #566372;
          font-family: var(--font-mono), monospace;
          font-size: 7px;
        }

        .brain-graph-node strong {
          margin-top: 5px;
          color: #c2cbd4;
          font-size: 10px;
        }

        .brain-graph-relation {
          text-align: center;
          color: #647180;
          font-family: var(--font-mono), monospace;
        }

        .brain-graph-relation span {
          display: block;
          color: var(--accent);
          font-size: 7px;
          font-weight: 800;
        }

        .brain-graph-relation div {
          margin: 3px 0;
          color: #38434f;
          font-size: 9px;
        }

        .brain-graph-relation small {
          color: #5d6977;
          font-size: 7px;
        }

        .brain-blindspots {
          display: grid;
          gap: 8px;
        }

        .brain-blindspot {
          display: grid;
          grid-template-columns: 28px minmax(0, 1fr) auto;
          gap: 10px;
          padding: 12px;
          border: 1px solid rgba(255, 107, 107, 0.18);
          border-radius: 6px;
          background: rgba(255, 107, 107, 0.025);
        }

        .brain-blindspot > span {
          color: var(--red);
          font-family: var(--font-mono), monospace;
          font-size: 8px;
        }

        .brain-blindspot strong {
          color: #bdc6d0;
          font-size: 10px;
        }

        .brain-blindspot p {
          margin: 5px 0 0;
          color: #737f8d;
          font-size: 8px;
        }

        .brain-blindspot code {
          color: #55616e;
          font-size: 7px;
        }

        .brain-panel-empty {
          color: #74808d;
          font-size: 10px;
        }

        .brain-source-list {
          display: grid;
          gap: 6px;
        }

        .brain-source-row {
          width: 100%;
          padding: 11px;
          border: 1px solid var(--line-soft);
          border-radius: 6px;
          background: #0a0e13;
          text-align: left;
        }

        .brain-source-row:hover,
        .brain-source-row.active {
          border-color: #3a4653;
          background: #11171e;
        }

        .brain-source-row.active {
          box-shadow: inset 2px 0 0 var(--accent);
        }

        .brain-source-row > div {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .brain-source-row small {
          color: #5c6875;
          font-family: var(--font-mono), monospace;
          font-size: 7px;
        }

        .brain-source-row > strong {
          display: block;
          margin-top: 8px;
          color: #bfc8d1;
          font-size: 10px;
        }

        .brain-source-row > p {
          margin: 4px 0 0;
          color: #606d7b;
          font-family: var(--font-mono), monospace;
          font-size: 7px;
        }

        .brain-inspector-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .brain-inspector-top h3 {
          margin: 6px 0 0;
          font-size: 16px;
        }

        .brain-inspector-description {
          margin: 12px 0;
          color: #85919f;
          font-size: 9px;
          line-height: 1.6;
        }

        .brain-inspector-metrics {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border: 1px solid var(--line-soft);
          border-radius: 5px;
          overflow: hidden;
        }

        .brain-inspector-metrics > div {
          padding: 9px;
          border-right: 1px solid var(--line-soft);
        }

        .brain-inspector-metrics > div:last-child {
          border-right: 0;
        }

        .brain-inspector-metrics span,
        .brain-inspector-metrics strong {
          display: block;
        }

        .brain-inspector-metrics span {
          color: #53606e;
          font-family: var(--font-mono), monospace;
          font-size: 6px;
        }

        .brain-inspector-metrics strong {
          margin-top: 4px;
          color: #bfc8d2;
          font-size: 11px;
        }

        .brain-inspector-flags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin: 10px 0 17px;
        }

        .brain-inspector-flags span {
          padding: 4px 6px;
          border: 1px solid var(--line-soft);
          border-radius: 4px;
          color: #667382;
          font-family: var(--font-mono), monospace;
          font-size: 6px;
        }

        .brain-inspector-claims {
          display: grid;
          gap: 8px;
        }

        .brain-lineage-card {
          padding: 11px;
          border: 1px solid var(--line-soft);
          border-radius: 6px;
          background: #090d12;
        }

        .brain-lineage-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #63707e;
          font-family: var(--font-mono), monospace;
          font-size: 7px;
        }

        .brain-lineage-card > strong {
          display: block;
          margin: 8px 0 10px;
          color: #b7c0ca;
          font-size: 9px;
          line-height: 1.55;
        }

        .brain-lineage-chain {
          display: flex;
          align-items: center;
          gap: 5px;
          overflow-x: auto;
          padding: 8px;
          border-radius: 4px;
          background: #0d1218;
        }

        .brain-lineage-chain > div {
          min-width: 72px;
        }

        .brain-lineage-chain span,
        .brain-lineage-chain code {
          display: block;
        }

        .brain-lineage-chain span {
          color: #4f5b68;
          font-family: var(--font-mono), monospace;
          font-size: 6px;
        }

        .brain-lineage-chain code {
          margin-top: 3px;
          color: #7e8a97;
          font-size: 6px;
          overflow-wrap: anywhere;
        }

        .brain-lineage-chain b {
          color: #39434e;
          font-size: 8px;
        }

        .brain-evidence-detail,
        .brain-lineage-gap {
          margin-top: 8px;
          padding: 8px;
          border-left: 2px solid #303a45;
          background: #0c1117;
        }

        .brain-evidence-detail span,
        .brain-lineage-gap span {
          display: block;
          color: #5d6977;
          font-family: var(--font-mono), monospace;
          font-size: 6px;
        }

        .brain-evidence-detail p,
        .brain-lineage-gap strong {
          display: block;
          margin: 5px 0 0;
          color: #8f9ba8;
          font-size: 8px;
          line-height: 1.5;
        }

        .brain-lineage-gap {
          border-left-color: var(--yellow);
        }

        .brain-architecture-strip {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 7px;
          padding: 12px;
          border: 1px solid var(--line);
          border-radius: 6px;
          background: #080c11;
          color: #596675;
          font-family: var(--font-mono), monospace;
          font-size: 7px;
          letter-spacing: 0.05em;
        }

        .brain-architecture-strip b {
          color: #343e49;
        }

        @media (max-width: 1100px) {
          .brain-suggestions {
            grid-template-columns: repeat(2, 1fr);
          }

          .brain-result-grid {
            grid-template-columns: 1fr;
          }

          .brain-evidence-rail {
            grid-template-columns: repeat(2, 1fr);
          }

          .brain-intelligence-grid {
            grid-template-columns: 1fr;
          }

          .brain-source-column {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 760px) {
          .brain-page-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .brain-architecture-badge {
            width: 100%;
          }

          .brain-suggestions,
          .brain-control-strip,
          .brain-evidence-rail,
          .brain-system-footer {
            grid-template-columns: 1fr;
          }

          .brain-result-header {
            grid-template-columns: 1fr;
          }

          .brain-confidence {
            align-items: flex-start;
            padding-top: 18px;
            border-top: 1px solid var(--line);
            border-left: 0;
          }

          .brain-control-strip > div {
            border-right: 0;
            border-bottom: 1px solid var(--line);
          }

          .brain-query-form textarea {
            font-size: 17px;
          }

          .brain-empty-pipeline {
            flex-wrap: wrap;
            justify-content: center;
          }

          .brain-intelligence-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .brain-intelligence-health {
            text-align: left;
          }

          .brain-intelligence-metrics,
          .brain-source-column {
            grid-template-columns: 1fr;
          }

          .brain-state-bar-row {
            grid-template-columns: 95px minmax(0, 1fr) 36px;
          }

          .brain-graph-edge {
            grid-template-columns: 1fr;
          }

          .brain-graph-relation {
            text-align: left;
          }

          .brain-inspector-metrics {
            grid-template-columns: repeat(2, 1fr);
          }

          .brain-blindspot {
            grid-template-columns: 24px 1fr;
          }

          .brain-blindspot code {
            grid-column: 2;
          }
        }
      `}</style>
    </div>
  );
}