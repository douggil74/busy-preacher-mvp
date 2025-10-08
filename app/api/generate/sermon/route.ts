import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const { scripture = "", theme = "", audience = "" } = await req.json();

    const client = new OpenAI({ apiKey: key });
    const r = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Create a concise sermon outline.
Scripture: ${scripture}
Theme: ${theme}
Audience: ${audience}
Return JSON with keys: title, bigIdea, points (array of 3 strings), application (2-4 bullets).`
        }
      ],
      temperature: 0.7,
    });

    const text = r.choices[0]?.message?.content?.trim() || "";
    return NextResponse.json({ text });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
