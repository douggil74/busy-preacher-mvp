import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const { reference, translations } = await request.json();

    if (!reference) {
      return NextResponse.json({ error: "Reference required" }, { status: 400 });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });

    const translationContext = Object.entries(translations || {})
      .filter(([_, text]) => text && typeof text === 'string')
      .map(([version, text]) => `${version}: ${text}`)
      .join("\n\n");

    const prompt = `Provide thoughtful commentary on ${reference}.

Translations:
${translationContext}

Include:
1. Historical/cultural context
2. Key theological themes
3. Practical application
4. Translation differences (if any)

Be warm, accessible, and encouraging while maintaining accuracy.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a knowledgeable Bible scholar providing insightful, accessible commentary."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const commentary = completion.choices[0]?.message?.content || "Unable to generate commentary.";

    return NextResponse.json({ commentary, reference });
  } catch (error) {
    console.error("Commentary error:", error);
    return NextResponse.json({ error: "Failed to generate commentary" }, { status: 500 });
  }
}
