import type {
  KnowledgeClaim,
  KnowledgeSnapshot,
} from "@/domain/knowledge/types";

import type {
  BrainAskOptions,
  BrainCitation,
  BrainExecutionStep,
  BrainResponse,
  BrainSynthesizer,
} from "@/domain/brain/types";

import type {
  KnowledgeRepository,
} from "@/repositories/knowledge/knowledge-repository";

import {
  QueryPlanner,
} from "@/intelligence/retrieval/query-planner";

import {
  RetrievalEngine,
} from "@/intelligence/retrieval/retrieval-engine";

import {
  AnswerabilityGate,
} from "@/intelligence/retrieval/answerability-gate";

import {
  ExecutiveSynthesizer,
} from "@/intelligence/synthesis/executive-synthesizer";

const DEFAULT_NOW =
  "2026-09-23T12:00:00.000Z";

function citationId(
  claimId: string,
): string {
  return `citation-${claimId}`;
}

function citationForClaim(
  claim: KnowledgeClaim,
  snapshot: KnowledgeSnapshot,
): BrainCitation {
  const evidence =
    snapshot.graph.evidence.find(
      (item) =>
        item.claimId === claim.id,
    );

  return {
    id:
      citationId(claim.id),

    claimId:
      claim.id,

    evidenceId:
      evidence?.id,

    sourceId:
      claim.sourceId,

    statement:
      claim.statement,

    excerpt:
      evidence?.excerpt,

    state:
      claim.state,

    provenance:
      claim.provenance,

    confidence:
      claim.confidence,

    documentId:
      claim.documentId,

    chunkId:
      claim.chunkId,
  };
}

export interface CompanyBrainOptions {
  now?: () => string;

  createId?: () => string;

  createCorrelationId?:
    () => string;

  synthesizer?:
    BrainSynthesizer;
}

export class CompanyBrain {
  private readonly planner:
    QueryPlanner;

  private readonly retrieval:
    RetrievalEngine;

  private readonly gate:
    AnswerabilityGate;

  private readonly synthesizer:
    BrainSynthesizer;

  private readonly now:
    () => string;

  private readonly createId:
    () => string;

  private readonly createCorrelationId:
    () => string;

  constructor(
    private readonly repository:
      KnowledgeRepository,

    options:
      CompanyBrainOptions = {},
  ) {
    this.now =
      options.now ??
      (() => DEFAULT_NOW);

    this.createId =
      options.createId ??
      (() =>
        `brain-${Date.now()}`);

    this.createCorrelationId =
      options
        .createCorrelationId ??
      (() =>
        `corr-brain-${Date.now()}`);

    this.planner =
      new QueryPlanner({
        now:
          this.now,

        createId:
          this.createId,
      });

    this.retrieval =
      new RetrievalEngine({
        maxCandidates: 20,
        minimumScore: 0,
      });

    this.gate =
      new AnswerabilityGate();

    this.synthesizer =
      options.synthesizer ??
      new ExecutiveSynthesizer();
  }

  async ask(
    question: string,
    options:
      BrainAskOptions = {},
  ): Promise<BrainResponse> {
    const createdAt =
      this.now();

    const correlationId =
      options.correlationId ??
      this.createCorrelationId();

    const execution:
      BrainExecutionStep[] = [];

    const planStartedAt =
      this.now();

    const plan =
      this.planner.plan(
        question,
      );

    execution.push({
      stage:
        "QUERY_PLANNING",

      status:
        "SUCCESS",

      message:
        `Query classified as ${plan.intent}.`,

      startedAt:
        planStartedAt,

      completedAt:
        this.now(),

      metadata: {
        queryPlanId:
          plan.id,

        intent:
          plan.intent,

        strategies:
          plan.strategies,

        entityHints:
          plan.entityHints,

        evidenceRequirements:
          plan.evidenceRequirements,

        requiresHumanJudgment:
          plan.requiresHumanJudgment,
      },
    });

    const snapshot =
      await this.repository
        .getSnapshot();

    const retrievalStartedAt =
      this.now();

    const context =
      this.retrieval.retrieve(
        snapshot,
        plan,
      );

    execution.push({
      stage:
        "RETRIEVAL",

      status:
        context.candidates
          .length > 0
          ? "SUCCESS"
          : "WARNING",

      message:
        `Retrieved ${context.candidates.length} ranked candidate(s) and ${context.claims.length} claim(s).`,

      startedAt:
        retrievalStartedAt,

      completedAt:
        this.now(),

      metadata: {
        candidateCount:
          context.summary
            .candidateCount,

        selectedCount:
          context.summary
            .selectedCount,

        claimCount:
          context.claims.length,

        evidenceCount:
          context.evidence
            .length,

        unknownCount:
          context.summary
            .unknownCount,

        modeledCount:
          context.summary
            .modeledCount,

        contradictionCount:
          context.summary
            .contradictionCount,
      },
    });

    const gateStartedAt =
      this.now();

    const assessment =
      this.gate.assess(
        context,
      );

    execution.push({
      stage:
        "ANSWERABILITY",

      status:
        assessment.status ===
          "INSUFFICIENT_EVIDENCE" ||
        assessment.status ===
          "CONFLICTING_EVIDENCE"
          ? "BLOCKED"
          : assessment
                .caveats
                .length > 0
            ? "WARNING"
            : "SUCCESS",

      message:
        `Answerability status: ${assessment.status} at ${Math.round(assessment.confidence * 100)}% confidence.`,

      startedAt:
        gateStartedAt,

      completedAt:
        this.now(),

      metadata: {
        status:
          assessment.status,

        confidence:
          assessment.confidence,

        factors:
          assessment.factors,

        humanJudgmentRequired:
          assessment
            .humanJudgmentRequired,

        mayAnswer:
          assessment.policy
            .mayAnswer,

        mayRecommend:
          assessment.policy
            .mayRecommend,
      },
    });

    const citations =
      context.claims.map(
        (claim) =>
          citationForClaim(
            claim,
            snapshot,
          ),
      );

    const synthesisStartedAt =
      this.now();

    const synthesis =
      this.synthesizer.synthesize({
        question,

        intent:
          plan.intent,

        answerability:
          assessment,

        citations,
      });

    execution.push({
      stage:
        "SYNTHESIS",

      status:
        synthesis.mode ===
          "ABSTAIN" ||
        synthesis.mode ===
          "CONFLICT"
          ? "BLOCKED"
          : assessment.caveats
                .length > 0
            ? "WARNING"
            : "SUCCESS",

      message:
        `Synthesis completed in ${synthesis.mode} mode.`,

      startedAt:
        synthesisStartedAt,

      completedAt:
        this.now(),

      metadata: {
        mode:
          synthesis.mode,

        citationCount:
          citations.length,

        usedCitationIds:
          synthesis
            .usedCitationIds,
      },
    });

    execution.push({
      stage:
        "COMPLETE",

      status:
        synthesis.mode ===
          "ABSTAIN" ||
        synthesis.mode ===
          "CONFLICT"
          ? "BLOCKED"
          : "SUCCESS",

      message:
        "Company Brain execution completed.",

      startedAt:
        createdAt,

      completedAt:
        this.now(),

      metadata: {
        correlationId,
      },
    });

    return {
      id:
        this.createId(),

      question,

      createdAt,

      intent:
        plan.intent,

      mode:
        synthesis.mode,

      answerabilityStatus:
        assessment.status,

      confidence:
        assessment.confidence,

      headline:
        synthesis.headline,

      answer:
        synthesis.answer,

      sections:
        synthesis.sections,

      citations,

      caveats:
        assessment.caveats,

      unresolvedQuestions:
        assessment
          .unresolvedQuestions,

      requiredEvidence:
        assessment
          .requiredEvidence,

      policy: {
        mayAnswer:
          assessment.policy
            .mayAnswer,

        mayRecommend:
          assessment.policy
            .mayRecommend,

        humanJudgmentRequired:
          assessment
            .humanJudgmentRequired,
      },

      execution: {
        correlationId,

        steps:
          execution,

        queryPlanId:
          plan.id,

        retrievedCandidateCount:
          context.summary
            .candidateCount,

        selectedCandidateCount:
          context.summary
            .selectedCount,

        claimCount:
          context.claims.length,

        evidenceCount:
          context.evidence
            .length,

        retrievalTraceStages:
          context.trace.map(
            (step) =>
              step.stage,
          ),
      },
    };
  }
}