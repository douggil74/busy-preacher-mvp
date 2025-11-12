// app/api/word-study/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { surface, lemma, strongs, book } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        usage: "Additional context unavailable (OpenAI not configured).",
        references: [],
      });
    }

    const openai = new OpenAI({ apiKey });

    const language = strongs?.startsWith('H') ? 'Hebrew' : 'Greek';
    const testament = language === 'Hebrew' ? 'Old Testament' : 'New Testament';

    const prompt = `You are a biblical scholar providing detailed word study information.

Word: ${lemma} (${strongs})
Surface form: ${surface}
Language: ${language}
Testament: ${testament}
${book ? `Book: ${book}` : ''}

Provide a comprehensive word study with the following sections:

1. USAGE: How this word is typically used in Scripture. Include:
   - Common contexts where it appears
   - Theological themes associated with it
   - How its meaning evolved or varied across different biblical books
   (3-4 sentences, 60-80 words)

2. ETYMOLOGY: Brief word origin and linguistic background
   (2-3 sentences, 40-50 words)

3. REFERENCES: List 3-5 key Bible verses where this word appears significantly.
   Format each as: "Book Chapter:Verse - Brief context"
   Example: "John 3:16 - God's love for the world"

4. RELATED: List 2-3 related words with their Strong's numbers
   Format: [{"word": "lemma", "strongs": "G/H####"}]

Return ONLY valid JSON with these exact keys:
{
  "usage": "...",
  "etymology": "...",
  "references": ["...", "..."],
  "relatedWords": [{"word": "...", "strongs": "..."}]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: "You are a biblical languages expert providing accurate, scholarly word study information. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    let parsed: any = {};

    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {};
    }

    return NextResponse.json({
      usage: parsed.usage || "Detailed usage information unavailable.",
      etymology: parsed.etymology || "",
      references: Array.isArray(parsed.references) ? parsed.references : [],
      relatedWords: Array.isArray(parsed.relatedWords) ? parsed.relatedWords : [],
    });

  } catch (err) {
    console.error("Word study error:", err);
    return NextResponse.json(
      {
        usage: "Unable to load detailed study at this time.",
        etymology: "",
        references: [],
        relatedWords: [],
      },
      { status: 200 }
    );
  }
}
