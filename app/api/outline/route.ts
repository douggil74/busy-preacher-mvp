// app/api/outline/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { mode, passage, theme } = await req.json() as {
      mode: "passage" | "theme";
      passage?: string;
      theme?: string;
    };

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not set." },
        { status: 500 }
      );
    }

    if (mode === "passage" && !passage) {
      return NextResponse.json({ error: "Missing passage." }, { status: 400 });
    }
    if (mode === "theme" && !theme) {
      return NextResponse.json({ error: "Missing theme." }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const sys =
      "You are a precise sermon-outline assistant for evangelical pastors. You return tight, faithful, practical outlines for preaching/teaching. Use ESV context.";

    const user =
      mode === "passage"
        ? `Create an outline for the ESV passage: "${passage}". 
Return JSON with:
{
  "title": "string",                      // concise title
  "source": "passage",
  "reference": "${passage}",
  "points": [
    {
      "point": "string (succinct main point, faithful to the text)",
      "why": "string (why this matters / pastoral weight)",
      "illustration": "string (short, modern, vivid; avoid cliches)",
      "crossRefs": ["Book chap:verses", "..."]  // 1-3 cross-refs
    },
    { ... }, { ... }                      // exactly 3 points total
  ],
  "application": "string (modern, pastoral, specific next steps)"
}`
        : `Create an outline for the theme: "${theme}" (use Bible faithfully).
Return JSON with:
{
  "title": "string",
  "source": "theme",
  "topic": "${theme}",
  "points": [
    {
      "point": "string (succinct doctrinal/pastoral point)",
      "why": "string (why this matters now)",
      "illustration": "string (short, modern, vivid; avoid cliches)",
      "crossRefs": ["Book chap:verses", "..."]
    },
    { ... }, { ... }                      // exactly 3 points total
  ],
  "application": "string (modern, pastoral, specific next steps)"
}`;

    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    });

    const raw = resp.choices[0]?.message?.content ?? "{}";
    let data: any = {};
    try {
      data = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Malformed outline response." }, { status: 500 });
    }

    // Light validation
    if (!data?.points || !Array.isArray(data.points) || data.points.length !== 3) {
      return NextResponse.json({ error: "Outline must include exactly 3 points." }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unexpected error" }, { status: 500 });
  }
}