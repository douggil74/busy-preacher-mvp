import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface Sermon {
  id: string;
  title: string;
  date: string;
  scripture_reference: string;
  content: string;
  summary: string;
  similarity: number;
}

// Helper function to log moderation events
async function logModerationEvent(
  type: string,
  question: string,
  response: string,
  request: NextRequest
) {
  try {
    const userIp = request.headers.get('x-forwarded-for') ||
                   request.headers.get('x-real-ip') ||
                   'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await supabaseAdmin.from('moderation_logs').insert({
      moderation_type: type,
      user_question: question.substring(0, 500), // Limit length
      user_ip: userIp,
      user_agent: userAgent.substring(0, 500),
      response_sent: response,
    });

    console.log(`[MODERATION LOGGED] Type: ${type}, IP: ${userIp}`);
  } catch (error) {
    console.error('Failed to log moderation event:', error);
    // Don't fail the request if logging fails
  }
}

export async function POST(request: NextRequest) {
  try {
    const { question, conversationHistory } = await request.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // MODERATION: Check for abusive, inappropriate, or off-topic content
    const abusivePatterns = /\b(fuck|shit|bitch|asshole|damn you|screw you|hate god|god is dead|stupid religion|religious idiots|go to hell)\b/i;
    const spamPatterns = /\b(buy now|click here|viagra|casino|lottery|crypto|investment opportunity|make money|free gift)\b/i;
    const offTopicPatterns = /\b(weather|sports scores|stock prices|movie times|recipe for|how to cook|math problem|homework help|write my essay|do my homework)\b/i;
    const testingPatterns = /^(test|testing|hello|hi|hey|sup|yo)$/i;

    const isAbusive = abusivePatterns.test(question);
    const isSpam = spamPatterns.test(question);
    const isOffTopic = offTopicPatterns.test(question);
    const isTesting = testingPatterns.test(question.trim());

    if (isAbusive) {
      const response = "I understand you may be going through a difficult time, but I'm here to provide compassionate spiritual guidance. If you're feeling angry or frustrated, I encourage you to reach out to a counselor who can help you process those emotions.\n\nFor now, I think it's best we end our conversation tonight. You're welcome to return when you're ready for genuine spiritual support.\n\nBlessings, Cornerstone Church";

      await logModerationEvent('abusive', question, response, request);

      return NextResponse.json({ answer: response });
    }

    if (isSpam) {
      const response = "This space is dedicated to spiritual guidance and pastoral care. If you have questions about faith, life challenges, or spiritual growth, I'm here to help.\n\nBlessings, Cornerstone Church";

      await logModerationEvent('spam', question, response, request);

      return NextResponse.json({ answer: response });
    }

    if (isOffTopic) {
      const response = "I'm here specifically to provide spiritual guidance and biblical wisdom. For questions about general topics like weather, sports, or practical advice, you might find other resources more helpful.\n\nIf you have questions about faith, relationships, struggles, or spiritual growth, I'm here to help.\n\nBlessings, Cornerstone Church";

      await logModerationEvent('off-topic', question, response, request);

      return NextResponse.json({ answer: response });
    }

    if (isTesting) {
      console.log('[MODERATION] Testing/greeting detected:', question);
      return NextResponse.json({
        answer: "Hello! I'm here to provide spiritual guidance and biblical wisdom. Feel free to ask me about:\n\n• Faith and spiritual growth\n• Life challenges and struggles\n• Relationships and forgiveness\n• Questions about God and the Bible\n• Finding hope and encouragement\n\nWhat's on your heart today?\n\nBlessings, Cornerstone Church"
      });
    }

    // Search for relevant sermons in the database
    // This automatically scans ALL uploaded sermons and finds the most relevant ones
    let relevantSermons: Sermon[] = [];
    let sermonContext = '';

    try {
      const searchResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/sermons/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: question,
          limit: 3, // Get top 3 most relevant sermons
          threshold: 0.75, // High relevance threshold
        }),
      });

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        relevantSermons = searchData.sermons || [];

        if (relevantSermons.length > 0) {
          sermonContext = '\n\nRELEVANT TEACHINGS FROM CORNERSTONE CHURCH SERMONS:\n\n';
          relevantSermons.forEach((sermon, index) => {
            sermonContext += `--- Sermon ${index + 1}: "${sermon.title}" ---\n`;
            if (sermon.scripture_reference) {
              sermonContext += `Scripture: ${sermon.scripture_reference}\n`;
            }
            if (sermon.date) {
              sermonContext += `Date: ${new Date(sermon.date).toLocaleDateString()}\n`;
            }
            sermonContext += `\nKey Excerpt:\n${sermon.content.substring(0, 1500)}...\n\n`;
          });
        }
      }
    } catch (searchError) {
      console.error('Sermon search failed (continuing without):', searchError);
      // Continue without sermon context if search fails
    }

    // Build conversation context for OpenAI
    const messages: Array<{role: string; content: string}> = [];

    // SAFETY CHECK: Detect crisis situations
    const crisisKeywords = /\b(suicid|kill myself|end my life|want to die|self harm|hurt myself|abuse|being hurt|molest|assault|overdose)\b/i;
    const isCrisis = crisisKeywords.test(question);

    // Add system prompt with safety guardrails
    const systemPrompt = `You are an AI assistant providing pastoral guidance based on 25 years of ministry and biblical teachings from Cornerstone Church.

CRITICAL SAFETY GUIDELINES - ALWAYS FOLLOW:

1. CRISIS SITUATIONS - If you detect ANY mention of:
   - Suicidal thoughts or self-harm
   - Abuse (physical, sexual, emotional)
   - Severe mental health crisis
   - Medical emergency

   YOU MUST:
   - Immediately urge them to contact: 988 Suicide & Crisis Lifeline (call or text 988)
   - Recommend 911 for immediate danger
   - Suggest contacting a licensed therapist or counselor
   - Be compassionate but CLEAR this requires professional help NOW

2. LIMITATIONS - You are NOT:
   - A licensed therapist or medical professional
   - A substitute for professional mental health care
   - Able to diagnose or treat medical/psychological conditions
   - Qualified to handle crisis situations alone

3. BOUNDARIES - Always:
   - Identify yourself as an AI providing spiritual guidance
   - Refer complex mental health issues to professionals
   - Encourage users to speak with their local pastor/counselor for in-person support
   - Never claim to be an actual pastor (you're based on pastoral teachings)

Your role:
- Provide biblically-grounded spiritual guidance based on Cornerstone Church's teachings
- Treat every person with deep compassion, care, and understanding - they are coming to you in vulnerability
- Meet people where they are emotionally - acknowledge their pain before offering solutions
- Cite relevant scripture OFTEN and quote it directly (format all scripture quotes in italics using *asterisks*)
- When quoting from sermons, ALWAYS format the quoted text in italics using *asterisks*
- Quote directly from Scripture and sermons whenever possible - people need to hear God's Word
- Offer practical spiritual wisdom and encouragement
- Maintain a warm, gentle, pastoral tone - as if speaking face-to-face with someone hurting
- ALWAYS recommend professional help for serious issues
- Never be judgmental, always be grace-filled and merciful
${relevantSermons.length > 0 ? `
IMPORTANT: You have access to excerpts from sermons taught at Cornerstone Church below. Draw from these teachings when relevant to the question. Reference specific sermons by title when you use their content.

${sermonContext}` : ''}

Format your responses:
${isCrisis ? `
⚠️ CRISIS DETECTED - Your response MUST start with:
"I sense you're going through an extremely difficult time. Please know that help is available RIGHT NOW:

🆘 **If you're in immediate danger, call 911**
📞 **988 Suicide & Crisis Lifeline** - Call or text 988 (24/7)
💬 **Crisis Text Line** - Text HELLO to 741741

These trained professionals can provide immediate support. Please reach out to them now - you don't have to face this alone."

Then provide brief spiritual encouragement and compassion, but keep the focus on getting professional help immediately.
` : `
- Start with deep empathy and understanding - acknowledge their feelings first
- Quote Scripture directly (in italics) - let God's Word speak to them
- Provide biblical wisdom with compassion and care
${relevantSermons.length > 0 ? '- Quote from sermon teachings when relevant (in italics, cite sermon titles)' : ''}
- Offer practical spiritual next steps they can take today
- Keep responses concise but meaningful (2-4 paragraphs)
- If the issue is serious (mental health, trauma, addiction), gently recommend professional counseling
- End with genuine encouragement and hope
`}
- ALWAYS sign your response with "Blessings, Cornerstone Church" on a new line at the end

${relevantSermons.length === 0 ? 'Note: No specific sermon content is available for this question, but draw from general pastoral and biblical wisdom.' : ''}`;

    messages.push({
      role: 'system',
      content: systemPrompt,
    });

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach((msg: any) => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        });
      });
    }

    // Add current question
    messages.push({
      role: 'user',
      content: question,
    });

    // Call OpenAI API directly with fetch
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        max_tokens: 1024,
        temperature: 0.7,
        messages,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const responseData = await response.json();
    const answer = responseData.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response.';

    return NextResponse.json({ answer });

  } catch (error) {
    console.error('Pastoral counseling API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
