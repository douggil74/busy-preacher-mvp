import OpenAI from "openai";
import { NextResponse } from "next/server";

// ✝️ Define available tone profiles (you can later move this to /config/studyStyles.ts)
const studyStyles = {
  "Casual Devotional": {
    tonePrompt:
      "Write in a warm, encouraging, and conversational tone. Focus on personal reflection, God's love, and how Scripture applies to daily life. Avoid deep academic or theological jargon.",
  },
  "Theologian": {
    tonePrompt:
      "Write in a thoughtful, analytical tone with moderate use of theological terminology. Highlight historical context, doctrinal depth, and exegetical precision. Use Scripture to interpret Scripture.",
  },
  "Pastoral": {
    tonePrompt:
      "Write in a shepherding tone that comforts, exhorts, and guides. Balance doctrine with empathy. Focus on faith, obedience, and encouragement for Christian living.",
  },
  "Academic": {
    tonePrompt:
      "Use a scholarly tone with structured logic and references to biblical context. Be precise and detailed, suitable for sermon prep or teaching.",
  },
};

// 📖 Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mode, passage, theme, userStyle } = body;

    // 🧠 Determine tone profile
    const style =
      studyStyles[userStyle as keyof typeof studyStyles] ||
      studyStyles["Casual Devotional"];

    // 🏗️ Build AI prompt
    const systemPrompt = `
You are "The Busy Christian" — a faithful, creative AI that generates accurate and spiritually grounded Bible study outlines.
Write in the tone described below:
${style.tonePrompt}
When generating outlines:
- Stay faithful to the ESV Bible text.
- Organize clearly with points, subpoints, and application.
- Include relevant cross-references and illustrations.
- Be concise yet insightful.
`;

    let userPrompt = "";

    if (mode === "passage" && passage) {
      userPrompt = `Generate a Bible study outline for ${passage}. Include 3-5 main points, supporting explanations, a short illustration idea, and a modern application.`;
    } else if (mode === "theme" && theme) {
      userPrompt = `Generate a thematic Bible study on the topic "${theme}". Include 3-5 main points with relevant Scripture references and a final application.`;
    } else if (mode === "combined" && passage && theme) {
      userPrompt = `Create a combined Bible study outline for ${passage} around the theme "${theme}". Emphasize the connection between text and theme, include cross-references, and conclude with an application.`;
    } else {
      return NextResponse.json(
        { error: "Invalid input. Must include a passage, theme, or both." },
        { status: 400 }
      );
    }

    // 🔮 Generate outline
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const outline = completion.choices[0].message?.content?.trim() ?? "";

    return NextResponse.json(
      {
        outline,
        styleUsed: userStyle || "Casual Devotional",
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Error generating outline:", err);
    return NextResponse.json(
      { error: "Failed to generate outline.", details: err.message },
      { status: 500 }
    );
  }
}
