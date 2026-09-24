import type {
  ExternalSourceKind,
} from "@/domain/market-radar/ingestion/observation-types";

export type SourceHealthStatus =
  | "UNKNOWN"
  | "HEALTHY"
  | "DEGRADED"
  | "FAILING"
  | "DISABLED";

export interface SourceFetchAttempt {
  id: string;

  sourceId: string;
  sourceName: string;
  sourceKind: ExternalSourceKind;

  startedAt: string;
  completedAt: string;

  latencyMs: number;

  success: boolean;

  statusCode?: number;

  observationsReceived: number;

  error?: string;
}

export interface SourceHealth {
  sourceId: string;
  sourceName: string;
  sourceKind: ExternalSourceKind;

  status: SourceHealthStatus;

  totalAttempts: number;
  successfulAttempts: number;
  failedAttempts: number;

  consecutiveFailures: number;

  successRate: number;

  averageLatencyMs: number;

  totalObservationsReceived: number;

  lastAttemptAt?: string;
  lastSuccessfulFetchAt?: string;
  lastFailureAt?: string;

  lastError?: string;
}

function round(
  value: number,
): number {
  return (
    Math.round(
      value * 100,
    ) / 100
  );
}

export function emptySourceHealth(
  sourceId: string,
  sourceName: string,
  sourceKind: ExternalSourceKind,
): SourceHealth {
  return {
    sourceId,
    sourceName,
    sourceKind,

    status:
      "UNKNOWN",

    totalAttempts: 0,
    successfulAttempts: 0,
    failedAttempts: 0,

    consecutiveFailures: 0,

    successRate: 0,

    averageLatencyMs: 0,

    totalObservationsReceived: 0,
  };
}

function healthStatus(
  successfulAttempts: number,
  failedAttempts: number,
  consecutiveFailures: number,
): SourceHealthStatus {
  const total =
    successfulAttempts +
    failedAttempts;

  if (total === 0) {
    return "UNKNOWN";
  }

  if (
    consecutiveFailures >= 3
  ) {
    return "FAILING";
  }

  if (
    consecutiveFailures > 0
  ) {
    return "DEGRADED";
  }

  return "HEALTHY";
}

export function applyFetchAttempt(
  current: SourceHealth,
  attempt: SourceFetchAttempt,
): SourceHealth {
  const totalAttempts =
    current.totalAttempts + 1;

  const successfulAttempts =
    current.successfulAttempts +
    (attempt.success ? 1 : 0);

  const failedAttempts =
    current.failedAttempts +
    (attempt.success ? 0 : 1);

  const consecutiveFailures =
    attempt.success
      ? 0
      : current.consecutiveFailures +
        1;

  const totalLatency =
    current.averageLatencyMs *
      current.totalAttempts +
    attempt.latencyMs;

  const averageLatencyMs =
    totalAttempts === 0
      ? 0
      : round(
          totalLatency /
            totalAttempts,
        );

  return {
    ...current,

    status:
      healthStatus(
        successfulAttempts,
        failedAttempts,
        consecutiveFailures,
      ),

    totalAttempts,

    successfulAttempts,

    failedAttempts,

    consecutiveFailures,

    successRate:
      round(
        successfulAttempts /
          totalAttempts,
      ),

    averageLatencyMs,

    totalObservationsReceived:
      current
        .totalObservationsReceived +
      attempt
        .observationsReceived,

    lastAttemptAt:
      attempt.completedAt,

    lastSuccessfulFetchAt:
      attempt.success
        ? attempt.completedAt
        : current
            .lastSuccessfulFetchAt,

    lastFailureAt:
      attempt.success
        ? current.lastFailureAt
        : attempt.completedAt,

    lastError:
      attempt.success
        ? undefined
        : attempt.error,
  };
}