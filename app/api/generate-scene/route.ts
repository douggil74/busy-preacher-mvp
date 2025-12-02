import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const systemPrompt = `You are an SVG artist creating beautiful, minimalist weather/nature scenes for a Christian Bible study app header.

IMPORTANT RULES:
1. Output ONLY valid SVG code - no markdown, no explanation, no backticks
2. SVG must have viewBox="0 0 800 200" and preserveAspectRatio="xMidYMid slice"
3. Use soft, calming colors appropriate for a devotional app
4. Keep designs simple and elegant - avoid clutter
5. Include subtle animations using CSS within <style> tags if appropriate
6. Do NOT include any text or words in the SVG
7. Make sure the scene works on both light and dark backgrounds
8. Use gradients and soft edges for a modern look

The SVG will be displayed as a header banner (800x200), so design accordingly with the main visual interest in the center-top area.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create an SVG scene for: ${prompt}` }
      ],
      max_tokens: 4000,
      temperature: 0.7,
    });

    let svgContent = response.choices[0]?.message?.content || '';

    // Clean up the response - remove markdown code blocks if present
    svgContent = svgContent
      .replace(/```svg\n?/gi, '')
      .replace(/```xml\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim();

    // Validate it starts with <svg
    if (!svgContent.startsWith('<svg')) {
      // Try to extract SVG from the response
      const svgMatch = svgContent.match(/<svg[\s\S]*<\/svg>/i);
      if (svgMatch) {
        svgContent = svgMatch[0];
      } else {
        return NextResponse.json({ error: 'Failed to generate valid SVG' }, { status: 500 });
      }
    }

    return NextResponse.json({ svg: svgContent });
  } catch (error: any) {
    console.error('Error generating scene:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate scene' },
      { status: 500 }
    );
  }
}
