import {
  MarketRadarConsole,
} from "@/components/radar/market-radar-console";

export default function Page() {
  return (
    <div className="page radar-page">
      <section className="radar-page-header">
        <div>
          <div className="eyebrow">
            WARP / CONTROL ·
            EXTERNAL INTELLIGENCE
          </div>

          <h1>
            Market Radar
          </h1>

          <p>
            Detect changes outside
            the company, determine
            what matters to
            WarpBuild, expose the
            evidence and route the
            strongest signals into
            decisions, experiments
            and GTM.
          </p>
        </div>

        <div className="radar-header-system">
          <span className="live-dot" />

          <div>
            <strong>
              EXTERNAL
              INTELLIGENCE
            </strong>

            <span>
              Detect → score →
              synthesize → route
            </span>
          </div>
        </div>
      </section>

      <MarketRadarConsole />

      <style>{`
        .radar-page {
          max-width: 1560px;
        }

        .radar-page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 32px;
          margin-bottom: 28px;
        }

        .radar-page-header h1 {
          margin-bottom: 14px;
        }

        .radar-page-header p {
          max-width: 760px;
          margin: 0;
          color: #aeb8c4;
          font-size: 14px;
          line-height: 1.7;
        }

        .radar-header-system {
          min-width: 235px;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 13px 14px;
          border: 1px solid var(--line);
          border-radius: 8px;
          background: var(--panel);
        }

        .radar-header-system strong,
        .radar-header-system span {
          display: block;
        }

        .radar-header-system strong {
          color: #dce3eb;
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.08em;
        }

        .radar-header-system span {
          margin-top: 4px;
          color: #788594;
          font-size: 11px;
        }

        @media (max-width: 800px) {
          .radar-page-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .radar-header-system {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}