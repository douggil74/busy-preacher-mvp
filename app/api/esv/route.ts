// app/api/esv/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { passage } = await req.json();
    if (!passage || typeof passage !== "string") {
      return NextResponse.json({ error: "Missing passage" }, { status: 400 });
    }

    const apiKey = process.env.ESV_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ESV_API_KEY is not set" }, { status: 500 });
    }

    const qs = new URLSearchParams({
      q: passage.trim(),
      "include-passage-references": "false",
      "include-verse-numbers": "false",
      "include-footnotes": "false",
      "include-short-copyright": "false",
      "include-headings": "false",
      "indent-paragraphs": "0",
      "indent-poetry": "0",
      "line-length": "0",
    });

    const resp = await fetch(`https://api.esv.org/v3/passage/text/?${qs.toString()}`, {
      headers: { Authorization: `Token ${apiKey}` },
      cache: "no-store",
    });

    if (!resp.ok) {
      if (resp.status === 401) return NextResponse.json({ error: "ESV auth failed (401)." }, { status: 401 });
      if (resp.status === 429) return NextResponse.json({ error: "ESV rate limited (429)." }, { status: 429 });
      const txt = await resp.text();
      return NextResponse.json({ error: `ESV error ${resp.status}: ${txt}` }, { status: 500 });
    }

    const json = (await resp.json()) as { passages?: string[] };
    const text = (json.passages ?? []).join("\n").trim();
    if (!text) return NextResponse.json({ error: "No passage text found." }, { status: 404 });

    return NextResponse.json({ passage: passage.trim(), text });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unexpected error" }, { status: 500 });
  }
}
