import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

function bad(msg: string, status = 400) {
  return new NextResponse(msg, { status });
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_KEY.startsWith("sk-")) {
      return bad("Server is missing a valid OPENAI_API_KEY. Add it to .env.local and restart.", 500);
    }

    const { scripture, theme } = (await req.json()) as { scripture?: string; theme?: string };
    const s = (scripture || "").trim();
    const t = (theme || "").trim();

    if (!s && !t) return bad("Provide scripture or theme.", 400);
    if (s.length > 200 || t.length > 150) return bad("Input too long.", 400);

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const system = `You are a careful theological writing assistant for busy preachers and ministry students.
- Produce concise, faithful outlines.
- If a scripture is provided, prioritize exegesis of that passage.
- If only a theme is provided, choose appropriate passages (list references in each point's references array).
- Keep to mainstream, orthodox interpretations (avoid speculative claims).
- Use clear, modern language.
- Keep total length readable on a phone.`;

    const user = `Task: Create a sermon/lesson outline.

Scripture: ${s || "(none)"}
Theme: ${t || "(none)"}

Requirements:
- 3 or 4 points total.
- Each point: heading (short), explanation (2-3 sentences), and references (array of verse refs).
- Include a one-paragraph historical context section.
- Include a one-paragraph modern application section focused on life today.`;

    const schema = {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        bigIdea: { type: "string" },
        passageSummary: { type: "string" },
        points: {
          type: "array",
          minItems: 3,
          maxItems: 4,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              heading: { type: "string" },
              explanation: { type: "string" },
              references: { type: "array", items: { type: "string" }, default: [] },
            },
            required: ["heading", "explanation", "references"],
          },
        },
        historicalContext: { type: "string" },
        modernApplication: { type: "string" },
      },
      required: ["title", "bigIdea", "passageSummary", "points", "historicalContext", "modernApplication"],
    } as const;

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "SermonOutline",
          schema,
          strict: true,
        },
      },
      // 🔥 removed `temperature`
    });

    const raw = (response as any).output_text as string | undefined;
    if (!raw) return bad("Model returned no output. Check your API key & model.", 502);

    const outline = JSON.parse(raw);
    return NextResponse.json({ outline });
  } catch (err: any) {
    const msg = err?.message || "Server error";
    console.error("/api/generate error:", msg);
    return new NextResponse(`Generate failed: ${msg}`, { status: 500 });
  }
}
