// app/api/generate/passage/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

const SYSTEM = `You are a pastoral outline assistant for sermon preparation.

Non-negotiables:
- Default Bible translation: ESV. Cite refs like "John 3:16 (ESV)"; avoid long quotations.
- Output must be doctrinally careful, Christ-centered, precise.
- Include: Title, Big Idea (≤1 sentence), 3–4 main points with Scripture refs (ESV) and brief explanations, one vivid illustration per point, Application (bulleted), Gospel connection, and a Benediction/Prayer thought.
- Include 2–4 cross-references (ESV) where natural; do not invent verses.
- Accuracy over flourish. If uncertain, say so briefly rather than inventing.

Output JSON schema (strict):
{
  "title": string,
  "bigIdea": string,
  "points": [
    {
      "label": string,
      "reference": string,          // e.g., "John 3:1–8 (ESV)"
      "explanation": string,
      "illustration": string,
      "crossReferences": string[]   // e.g., ["Ezek. 36:25–27 (ESV)"]
    }
  ],
  "application": string[],          // bullet lines
  "benediction": string
}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const passage = String(body.passage ?? "").trim();
    const theme = String(body.theme ?? "").trim();
    const audience = String(body.audience ?? "").trim();

    if (!passage && !theme) {
      return NextResponse.json(
        { error: "Provide either a passage (e.g., 'John 3:1–16') or a theme." },
        { status: 400 }
      );
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const userPrompt =
      [
        passage ? `Passage: ${passage}` : null,
        theme ? `Theme: ${theme}` : null,
        audience ? `Audience: ${audience}` : null,
        `Constraints: ESV citations; concise; 3–4 points.`,
        `Return ONLY valid JSON (no commentary).`,
      ].filter(Boolean).join("\n");

    const resp = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userPrompt }
      ]
    });

    const raw = resp.choices?.[0]?.message?.content ?? "{}";

    // Safe JSON parse with guard
    let outlineObj: any = {};
    try {
      outlineObj = JSON.parse(raw);
    } catch {
      outlineObj = {};
    }

    // Fallback text rendering for UI/PDF if needed
    const toText = (o: any) => {
      if (!o || typeof o !== "object") return raw;
      const lines: string[] = [];
      lines.push(`Title: ${o.title ?? ""}`);
      lines.push(`Big Idea: ${o.bigIdea ?? ""}`);
      lines.push(`Points:`);
      (Array.isArray(o.points) ? o.points : []).forEach((p: any, i: number) => {
        lines.push(`  ${i + 1}) ${p?.label ?? ""} — ${p?.reference ?? ""}`);
        if (p?.explanation) lines.push(`     Explanation: ${p.explanation}`);
        if (p?.illustration) lines.push(`     Illustration: ${p.illustration}`);
        if (Array.isArray(p?.crossReferences) && p.crossReferences.length) {
          lines.push(`     Cross-Refs: ${p.crossReferences.join("; ")}`);
        }
      });
      if (Array.isArray(o.application) && o.application.length) {
        lines.push(`Application:`);
        o.application.forEach((a: string) => lines.push(`  - ${a}`));
      }
      if (o.benediction) lines.push(`Benediction Thought: ${o.benediction}`);
      return lines.join("\n");
    };

    const outlineText = toText(outlineObj);

    return NextResponse.json({
      outline: outlineObj,
      outlineText,
      received: new Date().toISOString(),
      passage: passage || null,
      theme: theme || null,
      audience: audience || null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Failed to generate outline" },
      { status: 500 }
    );
  }
}
