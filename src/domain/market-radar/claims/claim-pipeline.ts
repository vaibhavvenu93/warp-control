import type {
  MarketObservation,
} from "@/domain/market-radar/ingestion/observation-types";

import type {
  ClaimRepository,
} from "@/repositories/market-radar/claim-repository";

import {
  extractClaimsFromObservation,
} from "./claim-extractor";

import {
  buildClaimFingerprint,
  createMarketClaim,
  mergeClaimEvidence,
} from "./claim-engine";

import type {
  MarketClaim,
} from "./claim-types";

export interface ClaimPipelineResult {
  processedObservations: number;
  createdClaims: number;
  updatedClaims: number;

  claims: MarketClaim[];

  warnings: Array<{
    observationId: string;
    messages: string[];
  }>;
}

export class MarketClaimPipeline {
  constructor(
    private readonly repository:
      ClaimRepository,
  ) {}

  process(
    observations:
      MarketObservation[],
    now: string,
  ): ClaimPipelineResult {
    const claims:
      MarketClaim[] = [];

    const warnings:
      ClaimPipelineResult["warnings"] =
        [];

    let createdClaims = 0;
    let updatedClaims = 0;

    for (
      const observation
      of observations
    ) {
      const extraction =
        extractClaimsFromObservation(
          observation,
        );

      if (
        extraction.warnings.length >
        0
      ) {
        warnings.push({
          observationId:
            observation.id,

          messages:
            extraction.warnings,
        });
      }

      for (
        const candidate
        of extraction.candidates
      ) {
        const fingerprint =
          buildClaimFingerprint(
            candidate,
          );

        const existing =
          this.repository
            .getByFingerprint(
              fingerprint,
            );

        if (existing) {
          const updated =
            mergeClaimEvidence(
              existing,
              observation,
              now,
            );

          this.repository.save(
            updated,
          );

          claims.push(
            updated,
          );

          updatedClaims += 1;

          continue;
        }

        const claim =
          createMarketClaim(
            candidate,
            observation,
            now,
          );

        this.repository.save(
          claim,
        );

        claims.push(
          claim,
        );

        createdClaims += 1;
      }
    }

    return {
      processedObservations:
        observations.length,

      createdClaims,

      updatedClaims,

      claims,

      warnings,
    };
  }
}