// app/api/lexplain/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { surface } = (await req.json()) as { surface?: string };
    if (!surface || typeof surface !== "string" || !surface.trim()) {
      return NextResponse.json({ error: "Missing surface word." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Still respond gracefully without breaking UI
      return NextResponse.json({
        lemma: "—",
        strongs: "—",
        plain: "OpenAI not configured.",
      });
    }

    const openai = new OpenAI({ apiKey });

    const sys =
      "You are a concise biblical languages assistant. Given a surface word from an ESV passage, infer its likely original-language lemma, Strong’s number (if commonly associated), and provide a 1–2 sentence layperson explanation. If uncertain, say 'approx.' before the lemma.";

    const prompt = `Surface word: "${surface}"
Return EXACT JSON with keys: lemma, strongs, plain`;

    const out = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = out.choices[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {};
    }

    return NextResponse.json({
      lemma: parsed.lemma || "—",
      strongs: parsed.strongs || "—",
      plain: parsed.plain || "No explanation.",
    });
  } catch {
    return NextResponse.json({ lemma: "—", strongs: "—", plain: "No explanation." });
  }
}