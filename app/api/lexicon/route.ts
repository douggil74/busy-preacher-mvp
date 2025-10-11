// app/api/lexicon/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

// Helper to determine source language
function getSourceLanguage(bookName: string): 'Greek' | 'Hebrew' {
  const oldTestamentBooks = [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
    '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther',
    'Job', 'Psalms', 'Psalm', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Song of Songs',
    'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
    'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah',
    'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
  ];
  
  return oldTestamentBooks.includes(bookName) ? 'Hebrew' : 'Greek';
}

export async function POST(req: Request) {
  try {
    const { query, book } = (await req.json()) as { query?: string; book?: string };
    const cleaned = String(query ?? "").trim();
    
    if (!cleaned) {
      return NextResponse.json({ 
        error: "Missing word to look up.",
        needsMoreInfo: true 
      }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        term: cleaned,
        language: book ? getSourceLanguage(book) : undefined,
        strongs: "—",
        definition: "OpenAI not configured.",
        needsMoreInfo: false
      });
    }

    // Determine the correct source language
    const language = book ? getSourceLanguage(book) : null;
    const strongsPrefix = language === 'Hebrew' ? 'H' : 'G';

    const openai = new OpenAI({ apiKey });

    const sys = language
      ? `You are a precise biblical languages assistant. The word is from a ${language} text (${language === 'Hebrew' ? 'Old Testament' : 'New Testament'}). ` +
        `Provide the original ${language} lemma, Strong's number (${strongsPrefix}####), and a 1-2 sentence definition for laypeople. ` +
        `Always specify this is a ${language} word in your response.`
      : "You are a biblical languages assistant. Infer whether this word is from Greek (NT) or Hebrew (OT), provide the lemma, Strong's number, and a brief definition.";

    const prompt = language
      ? `Word: "${cleaned}" (from ${language} text)\nReturn JSON: {language: "${language}", term: "lemma", strongs: "${strongsPrefix}####", definition: "..."}`
      : `Word: "${cleaned}"\nReturn JSON: {language: "Greek" or "Hebrew", term: "lemma", strongs: "G#### or H####", definition: "..."}`;

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
      term: parsed.term || cleaned,
      language: parsed.language || language,
      strongs: parsed.strongs || "—",
      definition: parsed.definition || "No definition available.",
      needsMoreInfo: false
    });
  } catch (e: any) {
    return NextResponse.json({
      error: e?.message || "Lookup failed",
      needsMoreInfo: false
    }, { status: 200 });
  }
}