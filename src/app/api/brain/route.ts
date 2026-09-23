import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getDemoCompanyBrain,
} from "@/services/demo-company-brain";

const MAX_QUESTION_LENGTH =
  1000;

export async function POST(
  request: NextRequest,
) {
  try {
    const body =
      (await request.json()) as {
        question?: unknown;
      };

    if (
      typeof body.question !==
        "string" ||
      body.question.trim().length ===
        0
    ) {
      return NextResponse.json(
        {
          error:
            "A non-empty question is required.",
        },
        {
          status: 400,
        },
      );
    }

    const question =
      body.question.trim();

    if (
      question.length >
      MAX_QUESTION_LENGTH
    ) {
      return NextResponse.json(
        {
          error:
            `Question must be ${MAX_QUESTION_LENGTH} characters or fewer.`,
        },
        {
          status: 400,
        },
      );
    }

    const brain =
      await getDemoCompanyBrain();

    const response =
      await brain.ask(
        question,
      );

    return NextResponse.json(
      response,
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
          "The Company Brain could not process this request.",
      },
      {
        status: 500,
      },
    );
  }
}