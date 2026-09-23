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
