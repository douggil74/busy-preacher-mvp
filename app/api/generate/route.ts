import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { checkRateLimit, getIdentifier, RATE_LIMITS, rateLimitResponse } from '@/lib/rateLimit';

export const runtime = "edge";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

type Body = {
  passage?: string;
  theme?: string;
  audience?: string;
};

export async function POST(req: NextRequest) {
  try {
    // Rate limiting - 10 requests per minute (AI generation - most expensive)
    const identifier = getIdentifier(req);
    const rateLimit = checkRateLimit({
      ...RATE_LIMITS.AI_GENERATION,
      identifier,
    });
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit.resetIn);
    }

    const body = (await req.json()) as Body;

    if (!body.passage && !body.theme) {
      return NextResponse.json(
        { error: "Provide either 'passage' or 'theme'." },
        { status: 400 }
      );
    }

    const userPrompt = `
      Passage: ${body.passage || "N/A"}
      Theme: ${body.theme || "N/A"}
      Audience: ${body.audience || "N/A"}

      Generate a sermon outline with:
      - Title
      - Big Idea
      - Summary of passage
      - 3 main points (with sub-points if helpful)
      - Historical context
      - Modern application
      - Closing encouragement
    `;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: userPrompt }],
    });

    const outline = completion.choices[0]?.message?.content?.trim();

    return NextResponse.json(
      {
        ok: true,
        passage: body.passage,
        theme: body.theme,
        audience: body.audience,
        outline,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Use POST with JSON body at this endpoint." },
    { status: 405 }
  );
}
