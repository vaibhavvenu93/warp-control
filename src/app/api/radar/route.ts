import {
  NextResponse,
} from "next/server";

import {
  buildMarketRadarSnapshot,
} from "@/services/market-radar";

export async function GET() {
  try {
    const snapshot =
      buildMarketRadarSnapshot();

    return NextResponse.json(
      snapshot,
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
          "Market Radar could not generate the intelligence snapshot.",
      },
      {
        status: 500,
      },
    );
  }
}