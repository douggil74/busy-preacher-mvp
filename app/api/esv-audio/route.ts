// app/api/esv-audio/route.ts
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
    });

    const resp = await fetch(`https://api.esv.org/v3/passage/audio/?${qs.toString()}`, {
      headers: { Authorization: `Token ${apiKey}` },
      cache: "no-store",
    });

    if (!resp.ok) {
      if (resp.status === 401) return NextResponse.json({ error: "ESV auth failed (401)." }, { status: 401 });
      if (resp.status === 429) return NextResponse.json({ error: "ESV rate limited (429)." }, { status: 429 });
      const txt = await resp.text();
      return NextResponse.json({ error: `ESV error ${resp.status}: ${txt}` }, { status: 500 });
    }

    // ESV API returns a direct MP3 URL in the response
    const audioBlob = await resp.blob();
    
    // Return the audio as a blob that can be played
    return new NextResponse(audioBlob, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unexpected error" }, { status: 500 });
  }
}