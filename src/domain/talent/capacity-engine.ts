import type {
  CapabilityAssessment,
  CapabilityGap,
  HiringSearch,
  TalentCandidate,
} from "@/domain/talent/types";

function clamp(
  value: number,
  min = 0,
  max = 100,
): number {
  return Math.max(
    min,
    Math.min(max, value),
  );
}

function healthFromScore(
  score: number,
): CapabilityAssessment["health"] {
  if (score >= 85) {
    return "ON_TRACK";
  }

  if (score >= 70) {
    return "WATCH";
  }

  if (score >= 50) {
    return "AT_RISK";
  }

  return "OFF_TRACK";
}

function isActiveSearch(
  search: HiringSearch,
): boolean {
  return search.status === "ACTIVE";
}

function isActiveCandidate(
  candidate: TalentCandidate,
): boolean {
  return ![
    "HIRED",
    "REJECTED",
    "WITHDRAWN",
  ].includes(candidate.stage);
}

export interface CapabilityAssessmentInput {
  gap: CapabilityGap;
  searches: HiringSearch[];
  candidates: TalentCandidate[];
}

export function assessCapabilityGap({
  gap,
  searches,
  candidates,
}: CapabilityAssessmentInput): CapabilityAssessment {
  const relevantSearches =
    searches.filter(
      (search) =>
        search.capabilityGapId ===
        gap.id,
    );

  const activeSearches =
    relevantSearches.filter(
      isActiveSearch,
    );

  const searchIds = new Set(
    activeSearches.map(
      (search) => search.id,
    ),
  );

  const activeCandidates =
    candidates.filter(
      (candidate) =>
        searchIds.has(
          candidate.searchId,
        ) &&
        isActiveCandidate(candidate),
    );

  const reasons: string[] = [];

  /*
   * A mitigated or closed capability gap does not require
   * an active recruiting pipeline.
   *
   * This is important because the Talent Control Plane
   * should distinguish:
   *
   *   capability need
   *        ↓
   *   hire vs system/process/automation mitigation
   *
   * rather than assuming every capability gap requires
   * additional headcount.
   */
  if (
    gap.status === "MITIGATED" ||
    gap.status === "CLOSED"
  ) {
    return {
      capabilityGapId: gap.id,
      health: "ON_TRACK",
      score: 100,
      reasons: [
        gap.status === "MITIGATED"
          ? "Capability gap is currently mitigated without requiring an active hiring search."
          : "Capability gap is closed.",
      ],
      activeSearches:
        activeSearches.length,
      activeCandidates:
        activeCandidates.length,
      recommendedAction:
        "MONITOR",
    };
  }

  let penalty = 0;

  if (
    gap.status === "OPEN" &&
    activeSearches.length === 0
  ) {
    penalty += 35;

    reasons.push(
      "Capability gap has no active search.",
    );
  }

  if (
    gap.status ===
      "SEARCH_ACTIVE" &&
    activeSearches.length === 0
  ) {
    penalty += 30;

    reasons.push(
      "Capability gap is marked search-active but no active search exists.",
    );
  }

  if (
    gap.priority ===
      "CRITICAL" &&
    activeCandidates.length === 0
  ) {
    penalty += 25;

    reasons.push(
      "Critical capability gap has no active candidates.",
    );
  }

  if (
    gap.priority === "HIGH" &&
    activeCandidates.length === 0
  ) {
    penalty += 15;

    reasons.push(
      "High-priority capability gap has no active candidates.",
    );
  }

  if (
    reasons.length === 0
  ) {
    reasons.push(
      "Capability gap has an active execution path.",
    );
  }

  const score = clamp(
    100 - penalty,
  );

  let recommendedAction:
    CapabilityAssessment["recommendedAction"] =
      "MONITOR";

  if (
    activeSearches.length === 0
  ) {
    recommendedAction =
      "OPEN_SEARCH";
  } else if (
    activeCandidates.length === 0
  ) {
    recommendedAction =
      "DEEPEN_PIPELINE";
  } else if (
    gap.priority ===
      "CRITICAL" &&
    score < 70
  ) {
    recommendedAction =
      "EXECUTIVE_REVIEW";
  }

  return {
    capabilityGapId: gap.id,
    health:
      healthFromScore(score),
    score,
    reasons,
    activeSearches:
      activeSearches.length,
    activeCandidates:
      activeCandidates.length,
    recommendedAction,
  };
}

export function assessCapabilityPortfolio(
  gaps: CapabilityGap[],
  searches: HiringSearch[],
  candidates: TalentCandidate[],
): CapabilityAssessment[] {
  return gaps.map((gap) =>
    assessCapabilityGap({
      gap,
      searches,
      candidates,
    }),
  );
}