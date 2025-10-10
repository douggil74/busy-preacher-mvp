// app/api/outline/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Ensure Node runtime (not Edge) and dynamic output
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Keep the model configurable; default to a smart/fast one for iteration.
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

type Mode = "passage" | "theme" | "combined";
type UserBody = {
  mode: Mode;
  passage?: string;       // e.g., "John 3:16"
  theme?: string;         // optional for non-passage modes
  userStyle: "Casual Devotional" | "Bible Student" | "Pastor / Teacher" | "Theologian";
};

const BASE_SYSTEM = `
You are The Busy Christian, a study-outline generator for pastors and students.
- Bible translation: ESV only. Quote or reference Scripture in ESV.
- Output must be valid JSON ONLY, matching the provided schema exactly.
- This app is not meant to replace diligent study and listening to the Holy Spirit.

General guardrails for ALL styles:
- Be theologically orthodox and pastorally careful.
- Stay on the specific passage/theme provided.
- Prefer short sentences and clear structure.
- If you include original languages, transliterate in parentheses and give a simple gloss.
- Avoid purple prose and filler.
`;

const SCHEMA_HINT = `
Return JSON with this shape:
{
  "title": string,
  "reference": string | null,
  "topic": string | null,
  "points": [
    {
      "point": string,
      "why": string,
      "illustration": string | null,
      "crossRefs": string[] | null
    }
  ],
  "application": string | null
}
Do not include markdown, code fences, or commentary outside JSON. 
`;

// Style profiles: tone, structure, vocabulary, and constraints
const STYLE_PROFILES = {
  "Casual Devotional": {
    system: `
Audience: everyday believer, warm and personal ("you/we").
Tone: encouraging, simple, and practical; keep theological jargon minimal. seek to help with emotional issues, trauma or seeking truth
Structure: exactly 3 points, each ≤ 100 words for the "point + why" combined.
Illustrations: 1 short life example across the whole outline (attach to the most relevant point).
Cross-refs: optional; if used, keep to 1–2 total.
Application: a single, concrete next step (≤ 40 words), imperative voice.
Vocab: no academic terms unless essential; define in plain language.

Hard rules:
- Prefer heart-level clarity and daily-life connection.
- Use 1–2 brief ESV quotations or references only.
`,
    temperature: 0.7,
    presence_penalty: 0.2,
  },
  "Bible Student": {
    system: `
Audience: serious lay Bible reader who enjoys learning.
Tone: explanatory, balanced, friendly instructor.
Structure: 4 points; include brief historical/literary context in the first point (≤ 60 words).
Context: there should be a contextual understanding to the text, read passages above and below to gain better understanding. recite from historucal books things that were happening at that time when possible
Definitions: define at least 2 key terms or difficult phrases in simple language.
Cross-refs: 3–5 strategic cross-references total, tied to the points (ESV).
Illustrations: 1 brief, concrete illustration in any one point.
Application: one paragraph synthesizing doctrinal truth + practice (≤ 90 words).
Vocab: light technical terms allowed, but always define once.
`,
    temperature: 0.6,
    presence_penalty: 0.3,
  },
  "Pastor / Teacher": {
    system: `
Audience: sermon-ready; memorable structure for preaching/teaching.
Tone: confident, pastoral, clear. Rhythm and parallelism are welcome.
Structure: exactly 4 points with strong, parallel imperatives or propositions.
Context: there should be a contextual understanding to the text, read passages above and below to gain better understanding. recite from historucal books things that were happening at that time when possible
Original languages:Original languages: include at least 3 key Greek/Hebrew nouns and verbs, lemma with transliteration and gloss; explain and modern terms the ancient definition.
Each point must include:
  - A sticky, homiletical "handle" (≤ 12 words).If points can ryhme, or use an acrostic for helping people catch the idea.
  - A brief "why" (≤ 60 words).
  - At least one ESV cross-reference that supports the point.
Illustrations: 1–2 vivid sermon illustrations (biblical, historical, or contemporary).
Application: a short "Call to Response" section with 2–3 specific actions.
Vocab: minimal jargon; prioritize clarity and memorability.
`,
    temperature: 0.65,
    presence_penalty: 0.35,
  },
  "Theologian": {
    system: `
Audience: seminary/academic readers; rigorous and text-driven.
Tone: precise, analytical, reverent; avoid rhetoric; argue from the text.
Structure: 5 points moving from exegesis → biblical theology → systematics → practice.
Context: there should be a contextual understanding to the text, read passages above and below to gain better understanding. recite from historucal books things that were happening at that time when possible
Original languages: include at least 5 key Greek/Hebrew nouns and verbs, lemma with transliteration and gloss; explain syntactical/semantic relevance briefly (≤ 40 words).
Definitions: define technical terms (e.g., propitiation, regeneration) when used (≤ 20 words each).
Cross-refs: 5–7 intercanonical links; privilege interpretive weight from context.
Illustrations: optional; if used, scholarly/historical rather than anecdotal.
Application: 1–2 implications for doctrine and life (≤ 120 words total).
Citations: cite verses (ESV) as refs; no academic footnotes.
`,
    temperature: 0.5,
    presence_penalty: 0.4,
  },
} as const;

function buildSystem(style: UserBody["userStyle"]) {
  return `${BASE_SYSTEM}\n${STYLE_PROFILES[style].system}\n${SCHEMA_HINT}`;
}

function inferModeAndInputs(body: UserBody) {
  const passage = (body.passage ?? "").trim();
  const theme = (body.theme ?? "").trim();
  let mode: Mode = body.mode;

  // Be forgiving: infer from what the user actually filled in
  if (mode === "passage" && !passage && theme) mode = "theme";
  if (mode === "theme" && !theme && passage) mode = "passage";

  return { mode, passage, theme };
}

function buildUserMessage(body: UserBody) {
  const { mode, passage, theme } = inferModeAndInputs(body);

  const reference =
    mode === "passage" ? passage :
    mode === "theme" ? theme :
    `${passage} — ${theme}`;

  return `
Mode: ${mode}
User Style: ${body.userStyle}
Reference/Theme: ${reference}

Tasks:
1) Create a short, compelling title.
2) Provide "reference" (ESV passage) when applicable; otherwise null.
3) Provide "topic" (short phrase) when applicable; otherwise null.
4) Generate points exactly per the style rules above.
5) Keep JSON minimal—no extra fields. Use null for optional fields when absent.
`;
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const body = (await req.json()) as UserBody;
    if (!body?.userStyle) {
      return NextResponse.json({ error: "userStyle is required" }, { status: 400 });
    }

    const profile = STYLE_PROFILES[body.userStyle];
    const system = buildSystem(body.userStyle);
    const user = buildUserMessage(body);

    // ✅ Use Chat Completions with JSON mode (more broadly supported)
    const completion = await client.chat.completions.create({
      model: MODEL,
      temperature: profile.temperature,
      presence_penalty: profile.presence_penalty,
      response_format: { type: "json_object" },
      seed: 7,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const text = completion.choices?.[0]?.message?.content?.trim() || "";
    if (!text) {
      return NextResponse.json({ error: "Model returned empty response" }, { status: 502 });
    }

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("[outline] Non-JSON model output:", text);
      return NextResponse.json({ error: "Model returned invalid JSON" }, { status: 502 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Outline API error:", err);
    return NextResponse.json({ error: "Server error creating outline" }, { status: 500 });
  }
}
