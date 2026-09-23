import {
  NextResponse,
} from "next/server";

import {
  buildBrainIntelligenceSnapshot,
} from "@/services/brain-intelligence";

import {
  getDemoCompanyBrainEnvironment,
} from "@/services/demo-company-brain";

const DEMO_NOW =
  "2026-09-23T12:00:00.000Z";

export async function GET() {
  try {
    const environment =
      await getDemoCompanyBrainEnvironment();

    const snapshot =
      await environment.repository
        .getSnapshot();

    const intelligence =
      buildBrainIntelligenceSnapshot(
        snapshot,
        DEMO_NOW,
      );

    return NextResponse.json(
      intelligence,
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "The Company Brain intelligence layer could not be loaded.",
      },
      {
        status: 500,
      },
    );
  }
}