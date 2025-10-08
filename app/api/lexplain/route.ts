// app/api/lexplain/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { surface } = (await req.json()) as { surface?: string };
    const cleaned = String(surface ?? "").trim();
    if (!cleaned) {
      return NextResponse.json({ error: "Missing surface word." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // AI not configured — still return something usable
      return NextResponse.json({
        lemma: cleaned.toLowerCase(),
        strongs: "—",
        plain: "OpenAI not configured. (This is a fallback explanation.)",
      });
    }

    const openai = new OpenAI({ apiKey });

    const sys =
      "You are a precise, pastoral biblical-languages explainer for lay readers. " +
      "Given a surface word from an English Bible (ESV), infer the most likely original-language lemma " +
      "(Greek or Hebrew), include the Strong's number if commonly associated, and give a 1–2 sentence, " +
      "warm, plain-English explanation for today. If uncertain, prefix the lemma with 'approx.'.";

    const prompt =
      `Surface word: "${cleaned}"\n\n` +
      "Return EXACT JSON with keys: lemma, strongs, plain\n" +
      `Example: {"lemma":"logos","strongs":"G3056","plain":"Often 'word/message'; in John 1 points to Christ as God's self-revelation."}`;

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

    // Hard guarantees so UI never shows blanks
    const lemma =
      typeof parsed.lemma === "string" && parsed.lemma.trim()
        ? parsed.lemma.trim()
        : cleaned.toLowerCase();
    const strongs =
      typeof parsed.strongs === "string" && parsed.strongs.trim()
        ? parsed.strongs.trim()
        : "—";
    const plain =
      typeof parsed.plain === "string" && parsed.plain.trim()
        ? parsed.plain.trim()
        : "A simple explanation is unavailable for this term right now.";

    return NextResponse.json({ lemma, strongs, plain });
  } catch {
    return NextResponse.json(
      { lemma: "—", strongs: "—", plain: "No explanation." },
      { status: 200 }
    );
  }
}