import type {
  CandidateStage,
  HiringAttentionItem,
  HiringPipelineHealth,
  HiringSearch,
  TalentCandidate,
} from "@/domain/talent/types";

const DAY_MS =
  24 * 60 * 60 * 1000;

const ACTIVE_STAGES:
  CandidateStage[] = [
    "SOURCED",
    "SCREEN",
    "DEEP_DIVE",
    "WORK_SAMPLE",
    "FINAL",
    "OFFER",
  ];

function parseTime(
  value: string,
): number {
  return new Date(
    value,
  ).getTime();
}

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

function daysBetween(
  earlier: string,
  later: string,
): number {
  return (
    parseTime(later) -
    parseTime(earlier)
  ) / DAY_MS;
}

function isActiveCandidate(
  candidate: TalentCandidate,
): boolean {
  return ACTIVE_STAGES.includes(
    candidate.stage,
  );
}

function priorityRank(
  priority:
    HiringAttentionItem["priority"],
): number {
  const rank = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  return rank[priority];
}

export interface PipelineHealthInput {
  search: HiringSearch;
  candidates: TalentCandidate[];
  now: string;
  staleAfterDays?: number;
}

export function calculatePipelineHealth({
  search,
  candidates,
  now,
  staleAfterDays = 7,
}: PipelineHealthInput): HiringPipelineHealth {
  const relevant =
    candidates.filter(
      (candidate) =>
        candidate.searchId ===
        search.id,
    );

  const active =
    relevant.filter(
      isActiveCandidate,
    );

  const staleCandidates =
    active.filter(
      (candidate) =>
        daysBetween(
          candidate.updatedAt,
          now,
        ) >
        staleAfterDays,
    ).length;

  const finalStageCandidates =
    active.filter(
      (candidate) =>
        candidate.stage ===
          "FINAL" ||
        candidate.stage ===
          "OFFER",
    ).length;

  const stageCounts =
    ACTIVE_STAGES.map(
      (stage) => ({
        stage,
        count:
          relevant.filter(
            (candidate) =>
              candidate.stage ===
              stage,
          ).length,
      }),
    );

  const reasons: string[] = [];

  let penalty = 0;

  const depthGap =
    Math.max(
      0,
      search.targetPipelineDepth -
        active.length,
    );

  if (depthGap > 0) {
    penalty +=
      depthGap * 10;

    reasons.push(
      `Pipeline is ${depthGap} candidate${
        depthGap === 1
          ? ""
          : "s"
      } below target depth.`,
    );
  }

  if (
    staleCandidates > 0
  ) {
    penalty +=
      staleCandidates * 8;

    reasons.push(
      `${staleCandidates} active candidate${
        staleCandidates === 1
          ? ""
          : "s"
      } have stale pipeline updates.`,
    );
  }

  if (
    search.status ===
      "ACTIVE" &&
    active.length === 0
  ) {
    penalty += 25;

    reasons.push(
      "Active search has no active candidates.",
    );
  }

  if (
    search.priority ===
      "CRITICAL" &&
    finalStageCandidates === 0
  ) {
    penalty += 10;

    reasons.push(
      "Critical search has no candidate at final or offer stage.",
    );
  }

  if (
    reasons.length === 0
  ) {
    reasons.push(
      "Pipeline has sufficient active depth and current updates.",
    );
  }

  const score = clamp(
    100 - penalty,
  );

  let health:
    HiringPipelineHealth["health"];

  if (score >= 85) {
    health = "ON_TRACK";
  } else if (
    score >= 70
  ) {
    health = "WATCH";
  } else if (
    score >= 50
  ) {
    health = "AT_RISK";
  } else {
    health = "OFF_TRACK";
  }

  return {
    searchId: search.id,
    health,
    score,
    activeCandidates:
      active.length,
    targetPipelineDepth:
      search.targetPipelineDepth,
    stageCounts,
    finalStageCandidates,
    staleCandidates,
    reasons,
  };
}

export interface HiringAttentionInput {
  searches: HiringSearch[];
  candidates: TalentCandidate[];
  pipelineHealth:
    HiringPipelineHealth[];
  now: string;
  staleAfterDays?: number;
}

export function buildHiringAttention({
  searches,
  candidates,
  pipelineHealth,
  now,
  staleAfterDays = 7,
}: HiringAttentionInput): HiringAttentionItem[] {
  const attention:
    HiringAttentionItem[] = [];

  for (const search of searches) {
    if (
      search.status !== "ACTIVE"
    ) {
      continue;
    }

    const health =
      pipelineHealth.find(
        (item) =>
          item.searchId ===
          search.id,
      );

    if (
      health &&
      [
        "AT_RISK",
        "OFF_TRACK",
      ].includes(
        health.health,
      )
    ) {
      attention.push({
        id:
          `talent-attention-pipeline-${search.id}`,
        title:
          `Pipeline needs intervention: ${search.roleTitle}`,
        summary:
          "The active search is below its declared operating threshold.",
        priority:
          search.priority ===
          "CRITICAL"
            ? "CRITICAL"
            : "HIGH",
        action: "SOURCE",
        reasons: [
          "PIPELINE_TOO_SHALLOW",
        ],
        surfacedAt: now,
        searchId:
          search.id,
        ownerId:
          search.ownerId,
        whyNow:
          health.reasons.join(
            " ",
          ),
        businessImpact:
          "An unresolved capability gap can delay the workstream it is intended to support.",
        recommendedAction:
          "Increase qualified pipeline depth and review sourcing conversion before changing the hiring plan.",
        humanReviewRequired:
          false,
        decisionRequired:
          false,
        confidence: 96,
      });
    }
  }

  for (const candidate of candidates) {
    if (
      !isActiveCandidate(
        candidate,
      )
    ) {
      continue;
    }

    const search =
      searches.find(
        (item) =>
          item.id ===
          candidate.searchId,
      );

    if (!search) {
      continue;
    }

    if (
      candidate
        .humanDecisionRequired
    ) {
      attention.push({
        id:
          `talent-attention-decision-${candidate.id}`,
        title:
          `Hiring decision required: ${candidate.displayName}`,
        summary:
          `${candidate.displayName} has reached a human hiring boundary for ${search.roleTitle}.`,
        priority:
          candidate.stage ===
            "OFFER"
            ? "CRITICAL"
            : "HIGH",
        action: "DECIDE",
        reasons: [
          candidate.stage ===
          "OFFER"
            ? "OFFER_DECISION"
            : "FINAL_STAGE_DECISION",
        ],
        surfacedAt: now,
        searchId:
          search.id,
        candidateId:
          candidate.id,
        ownerId:
          candidate.ownerId ??
          search.ownerId,
        whyNow:
          "The system can organize evidence and unresolved questions, but the hiring judgment remains human.",
        businessImpact:
          "A delayed executive hiring decision can stall the search and increase candidate-loss risk.",
        recommendedAction:
          "Review candidate evidence, open questions and role requirements before recording the decision.",
        humanReviewRequired:
          true,
        decisionRequired:
          true,
        confidence: 99,
      });
    }

    const stale =
      daysBetween(
        candidate.updatedAt,
        now,
      ) >
      staleAfterDays;

    if (stale) {
      attention.push({
        id:
          `talent-attention-stale-${candidate.id}`,
        title:
          `Candidate follow-up overdue: ${candidate.displayName}`,
        summary:
          "An active candidate has not received a current pipeline update.",
        priority: "MEDIUM",
        action:
          "FOLLOW_UP",
        reasons: [
          "CANDIDATE_STALE",
        ],
        surfacedAt: now,
        searchId:
          search.id,
        candidateId:
          candidate.id,
        ownerId:
          candidate.ownerId ??
          search.ownerId,
        whyNow:
          `Candidate state has been unchanged for more than ${staleAfterDays} days.`,
        businessImpact:
          "Slow follow-through can reduce candidate conversion and create avoidable hiring latency.",
        recommendedAction:
          "Confirm candidate status, record the next action and reset the pipeline checkpoint.",
        humanReviewRequired:
          false,
        decisionRequired:
          false,
        confidence: 97,
      });
    }
  }

  return attention.sort(
    (a, b) => {
      const priorityDelta =
        priorityRank(
          b.priority,
        ) -
        priorityRank(
          a.priority,
        );

      if (
        priorityDelta !== 0
      ) {
        return priorityDelta;
      }

      if (
        a.decisionRequired !==
        b.decisionRequired
      ) {
        return a
          .decisionRequired
          ? -1
          : 1;
      }

      return a.id.localeCompare(
        b.id,
      );
    },
  );
}