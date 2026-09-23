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
