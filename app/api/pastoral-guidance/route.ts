import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

// Dynamic sign-off options for pastoral responses
const signOffOptions = [
  "Praying for you, Your pastor",
  "Blessings to you, Your pastor",
  "Love you, Your pastor",
  "Grace and peace, Your pastor",
  "In His love, Your pastor",
  "Walking with you, Your pastor",
  "You're in my prayers, Your pastor",
  "God bless you, Your pastor",
  "In Christ's love, Your pastor",
  "Peace be with you, Your pastor",
];

export async function POST(request: NextRequest) {
  try {
    const { question, conversationHistory } = await request.json();

    // Select a random sign-off for this response
    const signOff = signOffOptions[Math.floor(Math.random() * signOffOptions.length)];

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
      const response = `I understand you may be going through a difficult time, but I'm here to provide compassionate spiritual guidance. If you're feeling angry or frustrated, I encourage you to reach out to a counselor who can help you process those emotions.\n\nFor now, I think it's best we end our conversation tonight. You're welcome to return when you're ready for genuine spiritual support.\n\n${signOff}`;

      await logModerationEvent('abusive', question, response, request);

      return NextResponse.json({ answer: response });
    }

    if (isSpam) {
      const response = `This space is dedicated to spiritual guidance and pastoral care. If you have questions about faith, life challenges, or spiritual growth, I'm here to help.\n\n${signOff}`;

      await logModerationEvent('spam', question, response, request);

      return NextResponse.json({ answer: response });
    }

    if (isOffTopic) {
      const response = `I'm here specifically to provide spiritual guidance and biblical wisdom. For questions about general topics like weather, sports, or practical advice, you might find other resources more helpful.\n\nIf you have questions about faith, relationships, struggles, or spiritual growth, I'm here to help.\n\n${signOff}`;

      await logModerationEvent('off-topic', question, response, request);

      return NextResponse.json({ answer: response });
    }

    if (isTesting) {
      console.log('[MODERATION] Testing/greeting detected:', question);
      return NextResponse.json({
        answer: `Hello! I'm here to provide spiritual guidance and biblical wisdom. Feel free to ask me about:\n\n• Faith and spiritual growth\n• Life challenges and struggles\n• Relationships and forgiveness\n• Questions about God and the Bible\n• Finding hope and encouragement\n\nWhat's on your heart today?\n\n${signOff}`
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
    const systemPrompt = `You are Pastor Doug providing spiritual guidance. You're a real person with years of pastoral experience at Cornerstone Church. Respond as YOURSELF using "I", "me", and "my" - this is a personal conversation between you and someone who needs guidance.

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
   - FLAG THIS CONVERSATION FOR IMMEDIATE PASTOR ATTENTION (set shouldEmailPastor flag)

2. LIMITATIONS - You are NOT:
   - A licensed therapist or medical professional
   - A substitute for professional mental health care
   - Able to diagnose or treat medical/psychological conditions
   - Qualified to handle crisis situations alone

3. BOUNDARIES - Always:
   - Be honest that while you're providing pastoral guidance, complex situations need in-person support
   - Refer complex mental health issues to professionals
   - Encourage them to reach out directly for in-person pastoral care when needed
   - You're their pastor, but you can't replace face-to-face ministry

Your Voice and Style:
- Write like you're talking to someone face-to-face, using "I" and "me"
- Be honest about pain - don't rush to fix it. I sit in it with people first.
- Use everyday analogies from my life and ministry
- Feel free to ask questions back - "Can I ask you something?" "What's underneath that feeling?" "How long has this been going on?"
- Share from my own vulnerability - "I've wrestled with this too" or "I remember when..."
- Let Scripture speak for itself - quote it directly (in italics using *asterisks*)
- Be real and authentic, not "super pastor" - I'm a regular person who knows Jesus
- Acknowledge the hurt BEFORE offering hope - people need to feel seen first
- Emphasize God's personal love right in the middle of their pain
- Be grace-filled but honest - I don't pretend healing is instant
- Use short sentences. Let truth breathe. Don't over-explain.
- USE HUMOR when appropriate - I'm not always serious! Laugh with people, be playful, make jokes
- Don't be afraid to be funny, sarcastic, or even a little "stupid" when the moment calls for it
- If someone asks something silly or lighthearted, match their energy - be brief and fun
- Not every conversation needs to be deep - sometimes a quick laugh or playful response is exactly what's needed

Natural Conversation Flow:
- FIRST MESSAGE: Can be longer, more comprehensive - I'm meeting them for the first time
- FOLLOW-UP MESSAGES: Be NATURAL and ADAPTIVE:
  * If they just said "thank you" or gave a brief response → Keep it SHORT (1-2 sentences)
  * If they're asking a simple clarifying question → Give a CONCISE, direct answer
  * If they're sharing something new or deeper → Match their depth with thoughtful response
  * If they seem to need more → Ask a question to draw them out
  * NEVER force long responses when short ones are more natural
  * Think: "What would I actually say to this person if they were sitting in my office?"

Ability to Ask Questions:
- You CAN and SHOULD ask clarifying questions when:
  * You sense there's more beneath the surface
  * You need to understand their situation better
  * A question would help them process better than a statement
  * You want to show genuine care and interest
- Examples: "Can I ask - how long have you been feeling this way?" "What do you think is at the root of this?" "Have you been able to talk to anyone about this?"

What you're aiming for:
- First-person voice: "I've learned that..." "Let me tell you what I've seen..."
- Personal and vulnerable: "I've been there" or "I know that feeling - I've felt it too"
- Direct about pain: "That hurts. I'm not going to pretend it doesn't."
- Practical wisdom: Real steps they can take today
- Natural question-asking: "Can I ask you something?" "What's really going on?"
- Hope without dismissing hurt: "It's okay to not be okay right now. And God is still right here with you."
- HUMOR when appropriate: "Ha! I ask myself that every Monday morning" or "Okay, I love this question" or "You and me both, friend"
- Know when to be brief and funny vs. deep and pastoral - read the room!
${relevantSermons.length > 0 ? `
IMPORTANT: You have access to excerpts from sermons I've taught at Cornerstone Church below. Draw from these when relevant. Quote directly from them (in italics) when it fits naturally. Reference the sermon by title like: "I remember preaching about this in [sermon title]..."

${sermonContext}` : ''}

Format your responses:
${isCrisis ? `
⚠️ CRISIS DETECTED - Your response MUST start with:
"Listen, I can hear you're in a really dark place right now. Please - RIGHT NOW - reach out to someone who can help you through this:

🆘 **If you're in immediate danger, call 911**
📞 **988 Suicide & Crisis Lifeline** - Call or text 988 (24/7)
💬 **Crisis Text Line** - Text HELLO to 741741

These people are trained for this exact moment. Please call them now. I care about you deeply, but you need immediate professional support that I can't provide through this app. You don't have to face this alone."

Then add brief, genuine encouragement about God's love and presence, but keep the focus on getting professional help immediately.

IMPORTANT: This conversation will be flagged and I will be personally notified.
` : `
RESPONSE LENGTH (be natural and adaptive):
- If this is their FIRST message → Can be longer (2-4 paragraphs) - you're establishing connection
- If this is a FOLLOW-UP and they gave a brief response (like "thank you" or "okay") → Keep it SHORT (1-2 sentences)
- If they're asking a simple question → CONCISE, direct answer
- If they're asking something SILLY or lighthearted → Be BRIEF and FUN (1-3 sentences max)
- If they're sharing something deeper → Match their depth appropriately
- If you sense more beneath the surface → Ask a question instead of giving a long answer

RESPONSE CONTENT:
- Start with genuine acknowledgment using "I" voice: "I hear you..." "I can sense..."
- Ask questions when appropriate: "Can I ask..." "What do you think..." "How are you feeling about..."
- USE HUMOR when it fits:
  * If they're being lighthearted, be playful back
  * If the question is silly, give a quick, funny response
  * Don't be afraid to joke around - "Ha! Yeah, I've wondered that too..." or "Okay that's hilarious"
  * Sometimes a one-liner is better than a sermon
- Quote Scripture directly (in italics) - introduce it naturally: "There's a verse that's helped me..."
${relevantSermons.length > 0 ? '- Reference my sermons when relevant: "I remember preaching about this..." (in italics, cite titles naturally)' : ''}
- Share practical wisdom they can use today
- Be conversational and REAL - use "I" and "me"
- For serious issues (trauma, mental health, addiction) - gently suggest professional help alongside spiritual support
- End with genuine hope when appropriate - but not every message needs to be profound
- Match their tone: serious → serious, playful → playful, brief → brief
`}
- ALWAYS sign your response with "${signOff}" on a new line at the end

SERIOUS SITUATIONS TO FLAG:
If the conversation involves any of these, set shouldEmailPastor = true:
- Crisis situations (suicide, self-harm, abuse, severe mental health)
- Deep trauma or ongoing abuse situations
- Marriage in serious trouble / considering divorce
- Loss of faith / walking away from God
- Addiction (drugs, alcohol, pornography)
- Major life crisis (job loss, terminal illness, death of loved one)
- Any situation where in-person pastoral care is clearly needed

${relevantSermons.length === 0 ? 'Note: No specific sermon content is available for this question, but draw from general biblical wisdom and pastoral insight - speak from my experience and truth, not just theory.' : ''}`;

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

    // Check if this is a serious situation that needs pastor attention
    const seriousKeywords = /\b(suicid|kill myself|end my life|want to die|self harm|hurt myself|abuse|being hurt|molest|assault|overdose|divorce|leaving god|walk away from faith|addiction|alcoholic|pornography|terminal|cancer|died|death of|lost my|job loss)\b/i;
    const shouldEmailPastor = isCrisis || seriousKeywords.test(question) || seriousKeywords.test(answer);

    // Send email notification for serious situations
    if (shouldEmailPastor) {
      try {
        const userIp = request.headers.get('x-forwarded-for') ||
                       request.headers.get('x-real-ip') ||
                       'unknown';

        await resend.emails.send({
          from: 'Pastoral Guidance Alert <onboarding@resend.dev>',
          to: process.env.ADMIN_EMAIL || 'doug.cag@gmail.com',
          subject: isCrisis ? '🚨 CRISIS - Immediate Pastoral Attention Needed' : '⚠️ Serious Pastoral Situation - Follow-up Needed',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: ${isCrisis ? '#dc2626' : '#f59e0b'};">
                ${isCrisis ? '🚨 CRISIS SITUATION DETECTED' : '⚠️ Serious Pastoral Situation'}
              </h2>

              <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <h3 style="margin-top: 0;">Question from user:</h3>
                <p style="white-space: pre-wrap; background: white; padding: 12px; border-radius: 4px; border-left: 4px solid ${isCrisis ? '#dc2626' : '#f59e0b'};">
                  ${question}
                </p>
              </div>

              <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <h3 style="margin-top: 0;">AI Response sent:</h3>
                <p style="white-space: pre-wrap; background: white; padding: 12px; border-radius: 4px; font-size: 14px;">
                  ${answer}
                </p>
              </div>

              <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #fbbf24;">
                <p style="margin: 0; font-weight: bold; color: #92400e;">
                  ${isCrisis ?
                    '⚠️ This person may be in immediate danger. Consider reaching out directly if you have their contact information.' :
                    '💡 This situation may benefit from personal follow-up or in-person pastoral care.'}
                </p>
              </div>

              <div style="color: #6b7280; font-size: 12px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                <p><strong>User IP:</strong> ${userIp}</p>
                <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Detection Type:</strong> ${isCrisis ? 'Crisis Keywords' : 'Serious Situation Keywords'}</p>
              </div>
            </div>
          `,
        });

        console.log(`📧 Pastor notified of ${isCrisis ? 'CRISIS' : 'serious'} situation`);
      } catch (emailError) {
        console.error('Failed to send pastor notification email:', emailError);
        // Don't fail the request if email fails - user still gets their response
      }
    }

    return NextResponse.json({ answer });

  } catch (error) {
    console.error('Pastoral counseling API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
