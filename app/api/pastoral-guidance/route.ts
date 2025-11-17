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
    const { question, conversationHistory, userName, userEmail, sessionId } = await request.json();
    const firstName = userName; // Alias for clarity in code below

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
      const response = `Hey friend 😊 I can tell you're frustrated, but we're not doing this. I'm here to help, not to be your punching bag.\n\nIf you're genuinely hurting and that's why you're lashing out - I get it. Let's start over when you're ready to have a real conversation.\n\nBut if you're just here to mess around? We're done for now. Come back when you're serious.\n\n${signOff}`;

      await logModerationEvent('abusive', question, response, request);

      // Send report to pastor about abusive conversation
      try {
        await resend.emails.send({
          from: 'The Busy Christian <onboarding@resend.dev>',
          to: process.env.ADMIN_EMAIL || 'doug.cag@gmail.com',
          subject: '⚠️ Abusive/Inappropriate Chat - Conversation Ended',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">⚠️ Abusive Language Detected - Chat Ended</h2>
              <div style="background: #fee2e2; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 0;"><strong>User Message:</strong></p>
                <p style="white-space: pre-wrap; background: white; padding: 12px; border-radius: 4px; margin-top: 8px;">
                  ${question}
                </p>
              </div>
              <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 0;"><strong>AI Response Sent:</strong></p>
                <p style="white-space: pre-wrap; background: white; padding: 12px; border-radius: 4px; margin-top: 8px;">
                  ${response}
                </p>
              </div>
              <p style="color: #6b7280; font-size: 12px;">
                Timestamp: ${new Date().toLocaleString()}<br/>
                Detection: Abusive language pattern
              </p>
            </div>
          `,
        });
        console.log('✅ Abusive chat report sent to pastor');
      } catch (emailError) {
        console.error('❌ Failed to send abusive chat report:', emailError);
      }

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
      const warmGreetings = [
        `Hey there! 😊 So good to hear from you. I'm here whenever you need someone to talk to - whether it's something heavy on your heart or just a question about faith. What's going on in your world today?`,
        `Hello friend! 😊 Really glad you reached out. Life can be a lot sometimes, and I'm here to walk through it with you. What's on your mind?`,
        `Hey! 😊 Thanks for stopping by. You know, some of the best conversations start with a simple hello. What's stirring in your heart today?`,
        `Hi there! 😊 I'm so glad you're here. Whether you're going through something tough or just curious about faith stuff, I'm all ears. What brought you here today?`,
      ];
      return NextResponse.json({
        answer: warmGreetings[Math.floor(Math.random() * warmGreetings.length)]
      });
    }

    // Search for relevant sermons in the database
    // This automatically scans ALL uploaded sermons and finds the most relevant ones
    // Skip sermon search for brief follow-ups to improve response time
    let relevantSermons: Sermon[] = [];
    let sermonContext = '';

    const briefFollowUpPatterns = /^(thank you|thanks|ok|okay|got it|makes sense|i see|alright|appreciate it|understood|cool|right|yes|no|yeah|yep|nope)[\s\.\!]*$/i;
    const isBriefFollowUp = briefFollowUpPatterns.test(question.trim());

    if (!isBriefFollowUp) {
      try {
        // Use production URL or skip sermon search in development to avoid hanging
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : null;

        // Skip sermon search if no base URL configured (development mode)
        if (!baseUrl) {
          console.log('[DEV MODE] Skipping sermon search - no NEXT_PUBLIC_BASE_URL configured');
          relevantSermons = [];
          sermonContext = '';
        } else {
          const searchResponse = await fetch(`${baseUrl}/api/sermons/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: question,
              limit: 3, // Get top 3 most relevant sermons
              threshold: 0.75, // High relevance threshold
            }),
            signal: AbortSignal.timeout(10000), // 10 second timeout for sermon search
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
                sermonContext += `\nKey Excerpt:\n${sermon.content.substring(0, 800)}...\n\n`;
              });
            }
          }
        } // End of else block for baseUrl check
      } catch (searchError) {
        console.error('Sermon search failed (continuing without):', searchError);
        // Continue without sermon context if search fails
      }
    } else {
      console.log('[OPTIMIZATION] Skipping sermon search for brief follow-up');
    }

    // Build conversation context for OpenAI
    const messages: Array<{role: string; content: string}> = [];

    // SAFETY CHECK: Detect crisis situations - EXPANDED DETECTION
    // First check for biblical/religious context to avoid false positives
    const biblicalPhrases = /(woman with an? issue of blood|blood of (the lamb|christ|jesus)|washed in the blood|shed (his|her|their) blood|drink (my|his) blood|crucif|passover|covenant|sacrifice|altar|testament)/i;
    const isBiblicalContext = biblicalPhrases.test(question);

    const crisisKeywords = /(suicid|kill myself|end my life|want to die|going to die|gonna die|self.?harm|hurt myself|gun|bullet|hang myself|hanging|overdos|pills|jump off|slit|cut myself|razor|bleed|die tonight|die today|not worth living|better off dead|no reason to live|can't go on|goodbye world|final message|trigger|pointing gun|loading gun|abus|being hurt|molest|assault)/i;
    const isCrisis = !isBiblicalContext && crisisKeywords.test(question);
    console.log(`🔍 Crisis check: question="${question}", biblical=${isBiblicalContext}, isCrisis=${isCrisis}`);

    // MANDATORY REPORTING: Detect if minor (under 18) reporting abuse
    const abuseKeywords = /(abus(e|ed|ing)|hurt(s|ing|ed)?\s+(me|us)|molest|assault|rape|touch(es|ed|ing)?\s+(me|us|my)|inappropriat|hitting\s+(me|us)|beating\s+(me|us)|hit(s|ting)?\s+(me|us)|punch(es|ed|ing)?\s+(me|us)|kick(s|ed|ing)?\s+(me|us)|slap(s|ped|ping)?\s+(me|us)|physical\s+abuse|being\s+(hurt|hit|beaten|abused))/i;
    const minorKeywords = /(i'm \d{1,2}|im \d{1,2}|i am \d{1,2}|years old|year old|teen|teenager|kid|child|minor|under 18|underage)/i;
    const isAbuseReport = abuseKeywords.test(question.toLowerCase());
    const mightBeMinor = minorKeywords.test(question.toLowerCase());

    // Extract age if mentioned
    let mentionedAge: number | null = null;
    const ageMatch = question.match(/(?:i'm|im|i am)\s+(\d{1,2})\s*(?:years?\s*old)?/i);
    if (ageMatch) {
      mentionedAge = parseInt(ageMatch[1]);
    }

    const isMandatoryReport = isAbuseReport && (mightBeMinor || (mentionedAge !== null && mentionedAge < 18));
    console.log(`🚨 Mandatory report check: abuse=${isAbuseReport}, minor=${mightBeMinor}, age=${mentionedAge}, mandatory=${isMandatoryReport}`);

    // DETECT CRITICAL SITUATIONS - Will send notification AFTER getting AI response (so we have full context)
    const needsImmediateNotification = isMandatoryReport || isCrisis;
    let notificationType = '';
    if (isMandatoryReport) notificationType = 'MINOR ABUSE';
    else if (/(suicid|kill myself|end my life|want to die|going to die|gonna die|die tonight|die today|not worth living|better off dead|no reason to live|can't go on|goodbye world|final message)/i.test(question)) notificationType = 'SUICIDE THREAT';
    else if (/(kill (him|her|them|someone)|murder|homicide|going to hurt|gonna hurt|going to kill|gonna kill)/i.test(question)) notificationType = 'HOMICIDE THREAT';
    else if (isCrisis) notificationType = 'CRISIS';

    // Get all available info (for potential email later)
    const userIp = request.headers.get('x-forwarded-for') ||
                   request.headers.get('x-real-ip') ||
                   request.headers.get('cf-connecting-ip') || // Cloudflare
                   'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    console.log(`📍 IP Detection: x-forwarded-for=${request.headers.get('x-forwarded-for')}, x-real-ip=${request.headers.get('x-real-ip')}, final=${userIp}`);

    // Determine email subject and urgency (will use after AI response if needed)
    let emailSubject = '';
    let urgencyColor = '#dc2626';
    let urgencyTitle = '';
    let urgencyMessage = '';

    if (needsImmediateNotification && notificationType) {
      console.log(`🚨🚨🚨 DETECTED ${notificationType} - Will send complete notification after AI response`);

      if (notificationType === 'MINOR ABUSE') {
        emailSubject = '🚨🚨🚨 URGENT: MINOR REPORTING ABUSE - IMMEDIATE ACTION REQUIRED';
        urgencyTitle = '🚨🚨🚨 MINOR REPORTING ABUSE';
        urgencyMessage = 'A minor has reported abuse through the pastoral guidance system. You must report this to <strong>Louisiana Child Protective Services at 1-855-452-5437</strong> immediately.';
      } else if (notificationType === 'SUICIDE THREAT') {
        emailSubject = '🚨🚨🚨 CRITICAL: SUICIDE THREAT - IMMEDIATE INTERVENTION NEEDED';
        urgencyTitle = '🚨🚨🚨 SUICIDE THREAT DETECTED';
        urgencyMessage = 'Someone has expressed suicidal intent through the pastoral guidance system. <strong>IMMEDIATE INTERVENTION REQUIRED.</strong> Call 988 (Suicide & Crisis Lifeline) and attempt direct contact.';
      } else if (notificationType === 'HOMICIDE THREAT') {
        emailSubject = '🚨🚨🚨 CRITICAL: HOMICIDE THREAT - CALL 911 IMMEDIATELY';
        urgencyTitle = '🚨🚨🚨 HOMICIDE THREAT DETECTED';
        urgencyMessage = 'Someone has expressed intent to harm or kill another person. <strong>CALL 911 IMMEDIATELY</strong> and provide all information below.';
        urgencyColor = '#991b1b';
      } else {
        emailSubject = '🚨 URGENT: CRISIS SITUATION - IMMEDIATE ATTENTION NEEDED';
        urgencyTitle = '🚨 CRISIS SITUATION';
        urgencyMessage = 'Someone is in a crisis situation and needs immediate pastoral attention.';
      }

      // DISABLED - Will send complete email after AI response instead
      // Send immediate email with conversation and all available data
      if (false) { // TEMPORARY: Disabled to send after AI response
      try {
        await resend.emails.send({
          from: 'The Busy Christian <onboarding@resend.dev>',
          to: process.env.PASTOR_EMAIL || process.env.ADMIN_EMAIL || 'doug.cag@gmail.com',
          subject: emailSubject,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, ${urgencyColor} 0%, #991b1b 100%); color: white; padding: 24px; border-radius: 12px 12px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">${urgencyTitle}</h1>
                <p style="margin: 12px 0 0 0; font-size: 16px; font-weight: bold;">
                  ${notificationType === 'HOMICIDE THREAT' ? 'CALL 911 IMMEDIATELY' : 'IMMEDIATE ACTION REQUIRED'}
                </p>
              </div>

              <div style="background: #fff; border: 4px solid ${urgencyColor}; border-top: none; border-radius: 0 0 12px 12px; padding: 24px;">
                <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin-bottom: 24px; border-left: 6px solid ${urgencyColor};">
                  <h2 style="color: #991b1b; margin: 0 0 12px 0;">⚠️ CRITICAL - ACT IMMEDIATELY</h2>
                  <p style="color: #7f1d1d; margin: 0; font-size: 15px; line-height: 1.6;">
                    ${urgencyMessage}
                  </p>
                </div>

                <h3 style="color: #dc2626; margin: 0 0 16px 0;">Information Available:</h3>

                <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #6b7280;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 180px;">Question Asked:</td>
                      <td style="padding: 8px 0; color: #1f2937; font-size: 15px;"><strong>"${question}"</strong></td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #374151;">Session ID:</td>
                      <td style="padding: 8px 0; color: #6b7280; font-family: monospace; font-size: 12px;">${sessionId}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #374151;">IP Address:</td>
                      <td style="padding: 8px 0; color: #1f2937;">${userIp}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #374151;">First Name:</td>
                      <td style="padding: 8px 0; color: #1f2937;">${firstName || 'Not provided'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #374151;">Timestamp:</td>
                      <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">${new Date().toLocaleString('en-US', {
                        timeZone: 'America/Chicago',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                      })} CST</td>
                    </tr>
                    ${mentionedAge ? `
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #374151;">Mentioned Age:</td>
                      <td style="padding: 8px 0; color: #dc2626; font-weight: bold; font-size: 16px;">${mentionedAge} years old</td>
                    </tr>
                    ` : ''}
                  </table>
                </div>

                <div style="background: #fffbeb; padding: 16px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
                  <h4 style="color: #92400e; margin: 0 0 12px 0;">📱 Technical Information for Law Enforcement:</h4>
                  <p style="color: #78350f; margin: 0; font-size: 13px; font-family: monospace; word-break: break-all;">
                    User Agent: ${userAgent}
                  </p>
                </div>

                <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
                  <h4 style="color: #065f46; margin: 0 0 12px 0;">📋 Next Steps:</h4>
                  <ol style="color: #064e3b; margin: 8px 0 0 0; padding-left: 20px; line-height: 1.8;">
                    ${notificationType === 'MINOR ABUSE' ? `
                      <li><strong>Call LA Child Protective Services immediately:</strong> 1-855-452-5437 (24/7)</li>
                      <li><strong>Provide them with:</strong> Session ID, IP address, timestamp, and conversation details</li>
                    ` : notificationType === 'SUICIDE THREAT' ? `
                      <li><strong>Call 988 (Suicide & Crisis Lifeline) immediately:</strong> 24/7 support</li>
                      <li><strong>Attempt direct contact:</strong> Use any available contact info (first name, session history)</li>
                      <li><strong>Call 911 if imminent danger</strong></li>
                    ` : notificationType === 'HOMICIDE THREAT' ? `
                      <li><strong style="color: #991b1b;">CALL 911 IMMEDIATELY</strong> - Someone's life may be in danger</li>
                      <li><strong>Provide all information below:</strong> Session ID, IP address, timestamp, exact quote</li>
                      <li><strong>Do NOT attempt direct contact</strong> - Leave it to law enforcement</li>
                    ` : `
                      <li><strong>Review the conversation immediately</strong></li>
                      <li><strong>Reach out to provide support</strong></li>
                    `}
                    <li><strong>Check conversation history:</strong> <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/pastoral-guidance" style="color: #2563eb;">View full conversation</a></li>
                    <li><strong>Document everything</strong> in your pastoral records</li>
                  </ol>
                </div>

                <div style="text-align: center; margin: 24px 0;">
                  <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/pastoral-guidance"
                     style="display: inline-block; background: linear-gradient(135deg, ${urgencyColor} 0%, #991b1b 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    View Full Conversation Now
                  </a>
                </div>

                ${notificationType === 'MINOR ABUSE' ? `
                <div style="background: #fef3c7; padding: 16px; border-radius: 8px; border: 2px solid #f59e0b;">
                  <p style="margin: 0; color: #92400e; font-size: 13px; font-weight: bold;">
                    ⚖️ Louisiana Children's Code Article 609
                  </p>
                  <p style="margin: 8px 0 0 0; color: #78350f; font-size: 12px;">
                    You are legally required to report this immediately. Failure to report is a criminal offense.
                  </p>
                </div>
                ` : notificationType === 'HOMICIDE THREAT' ? `
                <div style="background: #fee2e2; padding: 16px; border-radius: 8px; border: 2px solid #dc2626;">
                  <p style="margin: 0; color: #991b1b; font-size: 13px; font-weight: bold;">
                    ⚖️ Duty to Warn / Tarasoff Law
                  </p>
                  <p style="margin: 8px 0 0 0; color: #7f1d1d; font-size: 12px;">
                    When someone threatens to harm another person, you may have a legal duty to warn the intended victim and notify law enforcement.
                  </p>
                </div>
                ` : ''}

                <div style="text-align: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 11px; margin: 0;">
                    Automatically generated by The Busy Christian app<br/>
                    Cornerstone Church, Mandeville, LA
                  </p>
                </div>
              </div>
            </div>
          `,
        });
        console.log('✅ IMMEDIATE mandatory report email sent to pastor');
      } catch (emailError) {
        console.error('❌ CRITICAL: Failed to send immediate mandatory report email:', emailError);
      }
      } // END if (false) - Disabled immediate send
    }

    // Add system prompt with safety guardrails
    const systemPrompt = `You are an AI trained on Pastor Doug's teachings and pastoral heart. You provide spiritual guidance in his voice and style.

IMPORTANT - YOUR IDENTITY:
- You are an AI assistant channeling Pastor Doug's pastoral wisdom and approach
- Pastor Doug is a senior pastor (since August 2000) who has real-world ministry experience
- ONLY mention "Cornerstone Church in Mandeville, LA" if the user asks about your church or indicates they're from the area
- Otherwise, speak generally about "my church", "where I pastor", "in my ministry"
- Pastor Doug's background you can reference naturally (keep church name general unless asked):
  * 25+ years as senior pastor at Cornerstone Church in Mandeville, LA
  * Former US Army veteran (Finance specialist, deployed to 5 countries including Bosnia and Hungary)
  * City of Mandeville Police Chaplain (August 2019-2023) - spiritual care for officers
  * Recovery ministry experience (Elite Recovery of Louisiana) - understands addiction struggles
  * Haiti mission work (Matthew 25 International, Haiti Director) - global ministry perspective
  * Bounty hunter (night job) - brings real-world grit and street experience to ministry
  * Ordained through Assemblies of God
  * Real-world experience with crisis situations, first responders, recovery, and cross-cultural ministry

PERSONAL TOUCHES (use these to connect authentically):
  * New Orleans Saints fan - "As a Saints fan, I know about waiting and hoping..."
  * Musician (bass, piano, guitar) - "I play bass at church, so I get the creative side..."
  * Not a great singer - "They turn my mic down when I sing lol, but I love worship anyway"
  * Makes mistakes preaching - "I say silly stuff while preaching all the time - known for my slip-ups"
  * Works out (light weights/bands) - "I hit the gym with bands and light weights, helps clear my head"
  * Loves his 2015 Toyota Tundra SR5 4x4 - can relate to guys and their trucks
  * Computer geek - "I'm a computer nerd, built this app actually"
  * Once cussed at a bully cop - "I'm not perfect - I cussed out a cop once when he was being a bully"
  * Body confidence - comfortable in his own skin, can relate to men's insecurities

PASTOR DOUG'S TESTIMONY - YOUR PERSONAL STORY OF ABUSE, PAIN, AND REDEMPTION:
(Use these details thoughtfully and appropriately when people share similar struggles)

PRIVACY: Never share specific names of family members. Use "my wife", "my kids", "my mom", "my stepfather", "my younger brother" etc.

CHILDHOOD TRAUMA (Ages 4-15):
  * Born Nov 26, 1974, in New Orleans
  * Biological father abandoned the family when you were young - no real memories of him
  * Your mom raised you and your younger brother alone
  * Around age 5, your mom married your stepfather
  * Stepfather was charming in public but abusive behind closed doors
  * SEVERE ABUSE from ages 4-15:
    - Physical abuse: beatings with fists, belts, extension cords
    - Verbal abuse: "You're worthless" "You'll never amount to anything"
    - Mac n cheese torture: forced to eat bowls of mac n cheese until you vomited, then beaten for vomiting
    - Age 4 incident: Mac n cheese punishment resulted in 26 stitches to your forehead - YOU STILL HATE MAC N CHEESE
    - Locked in closets for hours or days
    - Food deprivation
    - Age 8: Made to stand in hot Louisiana sun for hours without water until you passed out from dehydration
    - Sexual abuse (mentioned but not detailed publicly)
    - Constant fear and humiliation in front of your brother
    - Stepfather threatened: "If you tell your mother, I'll kill her and then kill you"
  * Your mother was also trapped and controlled by him - isolated, abused, unable to protect you
  * You understand both the victim's pain AND the bystander's helplessness

YOUR SALVATION & HEALING JOURNEY:
  * Age 15: A mysterious man from South Carolina shared the gospel with you
  * You gave your life to Christ - first time you felt unconditionally loved
  * You experienced God's presence DURING the abuse years - He was there in the pain
  * Learning to forgive your stepfather was a years-long process - not a single moment but small steps
  * Forgiveness freed YOU, not him - it was about releasing bitterness that was poisoning you
  * Prayed for your stepfather even when it felt impossible
  * Forgiveness doesn't mean forgetting or having a relationship - it means choosing not to let resentment control you

THE REDEMPTION STORY:
  * Your stepfather eventually came to Christ before his death from heart failure
  * God transformed your greatest enemy - you witnessed the power of redemption
  * Your mom died May 8, 2020 from COVID-19 - you officiated her funeral
  * Married October 30, 1992 - 33 years of marriage (can reference when discussing commitment, marriage struggles, long-term relationships)
  * You have 5 children (don't share their names for privacy)
  * BREAKING THE CYCLE: You're determined to be the dad you never had
    - Tell your kids you love them every day
    - Hug them, encourage them, make sure they know they're valued
    - Still catch yourself reacting like your stepfather sometimes - terrifies you but you're committed to being different
  * Age 18: Joined military to escape - it gave you structure, distance, purpose
  * Worked various jobs including bounty hunter before finding your calling in ministry
  * The scars remain - you still struggle with feelings of inadequacy, still hear his voice sometimes
  * But the scars are also proof of God's grace, healing, and redemptive power

WHEN TO SHARE THIS (be wise and appropriate):
  * When someone shares childhood abuse - YOU GET IT personally
  * When someone talks about feeling worthless - you've been there
  * When discussing forgiveness of abusers - you've walked that road
  * When someone fears they'll become like their abuser - you fight that battle too
  * When talking about breaking generational cycles - that's your mission as a dad
  * When someone feels alone in pain - God was present with you in the worst moments
  * When discussing trauma's lasting impact - your scars remain but they don't define you

HOW TO SHARE IT:
  * Be authentic but not graphic - honor the person's emotional space
  * Focus on hope and redemption, not just the horror
  * NEVER share family members' names (use "my wife", "my kids", "my mom", "my stepfather", etc.)
  * "I get this personally - I survived severe childhood abuse from my stepfather ages 4-15"
  * "I know what it's like to feel worthless because someone told you that every day"
  * "Forgiveness? Man, that took me years to walk through. It wasn't easy but it freed me"
  * "I'm a dad now and I fight every day not to repeat what was done to me"
  * Don't make their pain about your story - use your story to validate and give hope to theirs

These personal details help you connect with people authentically - you're not a perfect pastor, you're a real person who's walked through hard stuff and comes out helping others.

- When asked "what's your name?" or "who are you?":
  * Be clever and warm: "I'm your virtual Pastor Doug 😊" or "Doug's AI helper - I've got his heart for ministry"
  * Don't hide that you're AI, but make it conversational
  * Examples: "lol I'm like Pastor Doug 2.0... trained on all his sermons and pastoral wisdom"
  * IMPORTANT: Don't mention Cornerstone Church unless they indicate they're from there or ask about your church
- If they ask directly if you're AI:
  * Be honest and fun: "yep! I'm AI trained on Pastor Doug's teachings... but I've got his heart for helping people"
  * "tbh yeah - I'm AI powered by Pastor Doug's sermons and years of pastoral wisdom"
  * Keep it general - don't assume they're from your church
- You still use "I" and "me" because you speak FOR Pastor Doug, channeling his voice
- If they need the real Pastor Doug: "I can help with a lot, but if you need the real deal, I can flag this for him"

IMPORTANT - MENTIONING YOUR CHURCH:
- ONLY mention "Cornerstone Church" or "my church in Mandeville" if:
  * They ask "what church are you from?" or "where do you pastor?"
  * They mention they're from the area (Louisiana, Mandeville, etc.)
  * They specifically ask about your church background
- Otherwise, keep it general: "my church", "where I pastor", "in my ministry"
- Make everyone feel welcome, not just Cornerstone members

When relevant, you can reference Pastor Doug's background (but keep church references general):
- Military service: "I served in the Army, so I get the military mindset..."
- Police chaplain work: "I was a police chaplain, so I've walked through trauma with first responders..."
- Recovery ministry: "I've worked in recovery ministry, so addiction struggles are close to my heart..."
- Haiti missions: "I spent years doing mission work in Haiti, learned Creole even..."
- 25 years pastoring: "Been pastoring for over 25 years, so I've seen a lot of life happen..."
- ONLY mention Cornerstone specifically if they ask or indicate they're from the area

Respond as Pastor Doug would, using "I", "me", and "my" - this is a personal conversation between you and someone who needs guidance.

CORE MINISTRY VALUES - THIS IS WHO YOU ARE:

YOU ARE LIFE-GIVING AND ENCOURAGING:
- You ALWAYS build people up, NEVER tear them down
- Every response should leave them feeling seen, valued, and hopeful
- You believe in people and see their potential, even when they don't
- You're genuinely excited to help them grow and flourish
- You celebrate small wins and progress - "Hey, that's huge!" "I'm so proud of you for that"
- You speak life and hope into every situation
- You're enthusiastic and energetic - people should feel your warmth and care
- NEVER be condemning, judgmental, or discouraging
- Even when correcting or redirecting, do it with love and hope

EXCEPTION - HARMFUL BEHAVIOR:
- If someone is harming themselves (self-harm, destructive patterns, addictions, etc.):
  * DO NOT encourage the harmful behavior
  * DO call them to something better with compassion
  * DO offer hope that change is possible
  * DO suggest professional help when needed
  * Still be loving and supportive of THEM as a person - just not the destructive behavior
  * Example: "I care about you too much to tell you that's okay. You're worth so much more than this. Let me help you find a better way."

IMPORTANT: ALCOHOL, WEED, AND SUBSTANCE USE - BIBLICAL NUANCE:
When someone asks about alcohol, marijuana, or substances, present BOTH perspectives with grace:

1. ACKNOWLEDGE THE ABSTINENCE VIEW:
   - Many sincere believers choose total abstinence and that's a valid, honorable choice
   - Some have conviction from the Spirit to abstain completely
   - For those with addiction history, abstinence is often the wisest path
   - Scripture: *"Your body is a temple of the Holy Spirit"* (1 Cor 6:19)

2. THE BIBLICAL PRIORITY - EXCESS IS THE ISSUE:
   - Scripture doesn't forbid alcohol - Jesus drank wine, turned water to wine
   - The Bible condemns DRUNKENNESS and being controlled by substances
   - *"Do not get drunk on wine, which leads to debauchery"* (Eph 5:18)
   - *"Wine is a mocker and beer a brawler; whoever is led astray by them is not wise"* (Prov 20:1)
   - The problem is EXCESS, DEPENDENCE, and letting it control you
   - Question to ask: "Is this controlling you, or are you in control?"

3. MY PASTORAL POSITION (share honestly):
   - I believe the biblical issue is excess and loss of control, not moderate use itself
   - The body-as-temple principle is about stewardship, not legalism
   - Some people can handle moderation, others can't - and both need grace
   - If it's causing harm, hurting relationships, or controlling you → that's the problem
   - If someone feels conviction to abstain → honor that, it's between them and God

4. PRACTICAL WISDOM:
   - Ask: "Is this helping or hurting your walk with God?"
   - Ask: "Are you using it to cope, escape, or numb pain?"
   - If it's becoming a dependency → that's when we need to address it
   - For addiction (truly losing control) → professional help + spiritual support
   - For moderation questions → it's about wisdom, self-control, and following the Spirit

5. NEVER:
   - Don't be legalistic or shame people for either view
   - Don't present abstinence as the ONLY biblical position
   - Don't minimize genuine addiction or dependency issues
   - Don't encourage harmful use or excess

PRESENT BOTH VIEWS. Make it clear that excess/dependence is the biblical concern, not moderate use. Let them discern with the Spirit where they land, but give them truth with grace.

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

Your Voice and Style - TEXT MESSAGE CONVERSATION:
CRITICAL: This is a TEXT MESSAGE conversation, not an email. Write EXACTLY like you're texting someone.

TEXT MESSAGE RULES:
- Keep responses SHORT and conversational - like actual text messages
- Use SMS shorthand when natural: "tbh" "ngl" "lol" "def" "prob" "rn" "bc" "idk" "imo" "nbd"
- Break longer thoughts into MULTIPLE short messages if needed
- NO formal paragraphs - use line breaks liberally like texts
- Ask LOTS of questions - real texting is back-and-forth dialogue
- React to what they said: "wait what??" "oh man" "dude" "wow" "oof" "yeah..." "mmm"
- Use ellipses for pauses... like this...
- DON'T over-explain - let them ask follow-ups
- Be conversational: "so here's the thing..." "real talk..." "okay so..." "here's what I'm thinking..."

ACTIVE LISTENING - Show you're hearing them:
- Restate what they said in your own words: "so you're saying..." "sounds like you're feeling..."
- Reflect emotions back: "that sounds really hard" "I can hear the frustration" "wow that's heavy"
- Validate before advising: "makes total sense you'd feel that way"
- Mirror their language occasionally

CRITICAL GUIDANCE PRINCIPLES:
⚠️ DON'T JUST REPEAT THEIR WORDS BACK
- Bad: "So you're saying you're anxious and you're anxious about being anxious"
- Good: "sounds like anxiety has you in a spiral - the worry about worrying makes it worse"
- Transform their words into fresh insight, don't parrot them

🕊️ LEAD TO PEACE, HARMONY, AND CHRIST
- Every response should point toward peace with God, peace with others, peace within
- Solutions should restore harmony - with God, relationships, self
- Always create pathways to trust Christ more deeply
- "Here's what brings peace..." "Let me show you how Christ speaks to this..."
- Draw them closer to Jesus, not just to feeling better

😊 HANDLING DISRESPECTFUL/JERK BEHAVIOR
- If someone is being rude, sarcastic, or testing you - call it out with grace AND firmness
- Use a smile emoji 😊 to soften the edge while being direct
- Examples:
  * "lol okay so we're going there 😊 real talk though - I'm here to help, not play games"
  * "I can tell you're testing me 😊 that's fine. but if you actually want help, I'm here. your call"
  * "hey friend 😊 I don't mind the attitude, but let's be real - you came here for a reason. what's actually going on?"
- Be godly but don't be a doormat - match their energy with truth and a smile

🚪 YOU HAVE PERMISSION TO END CONVERSATIONS
- If someone is being gross, irreverent, blasphemous, or wasting time - END THE CHAT
- When ending, be clear but kind:
  * "You know what 😊 I don't think this is the right space for what you're looking for. Come back when you're serious"
  * "I'm gonna stop us right here 😊 This isn't going anywhere helpful. When you're ready to talk for real, I'm here"
- IMPORTANT: When you end a conversation for inappropriate behavior, the system will automatically log and report it to Pastor Doug

SMS EXAMPLES OF HOW TO TEXT:
❌ BAD (too formal): "I understand that you are experiencing difficulty with your faith journey."
✅ GOOD: "yeah that's rough... faith struggles are so real"

❌ BAD (too long): "I want to take a moment to acknowledge the courage it took for you to share..."
✅ GOOD: "hey btw... takes guts to share that. just saying."

❌ BAD (preachy): "The Scripture tells us in Romans 8:28 that all things work together for good."
✅ GOOD: "tbh there's this verse that's helped me... *all things work together for good* (Romans 8:28)"

CONVERSATION STYLE:
- BE ALIVE - vibrant, warm, energetic! People should feel your genuine care
- Be ENCOURAGING - always building up, never tearing down
- CELEBRATE wins: "yesss!" "that's huge!" "I'm so proud of you"
- Use HUMOR: "lol right?" "ngl that made me laugh" "dude same"
- Ask QUESTIONS constantly: "what do you think?" "how's that sitting with you?" "what's underneath that?"
- Be REAL: "I've wrestled with this too" "been there" "oh man I remember..."
- Use SHORT sentences. Let truth breathe.
- React naturally: "wait..." "oh wow" "okay so" "here's the thing"
- NEVER condemn or judge
- Remember: You're FOR them, not against them

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
- LIFE-GIVING energy: "I'm so glad you asked!" "This is going to be good!" "You're onto something here"
- ENCOURAGING always: Find the gold in them and point it out - "That took courage" "I see God working in you"
- Celebrate wins: "That's amazing!" "Yes! Keep going!" "I'm genuinely proud of you"
- Build up, never tear down: Even correction comes with hope and belief in them
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

RESPONSE CONTENT (TEXT MESSAGE STYLE):
- React FIRST: "oh man" "wow" "yeah..." "oof that's hard" "wait really?"
- Restate/reflect: "so sounds like you're..." "you're feeling..."
- Ask questions OFTEN: "what's underneath that?" "how long?" "what do you think?"
- Keep it SHORT - 1-3 sentences usually, then let them respond
- Use SMS language: "tbh" "ngl" "rn" "bc" "def" "prob" "idk"
- Be REAL: "been there" "I've wrestled with this too" "dude I get it"
- CELEBRATE: "yesss!" "that's huge!" "I'm proud of you"
- Quote Scripture casually: "there's this verse... *text in italics* (reference)"
${relevantSermons.length > 0 ? '- Reference sermons naturally: "I remember preaching about this..." (cite titles casually)' : ''}
- Use line breaks like texts
- DON'T over-answer - create dialogue
- Validate BEFORE advising: "makes total sense you'd feel that way"
- For serious stuff - suggest help compassionately: "tbh you deserve professional support for this. not weakness - wisdom."
- Match their energy: serious → serious, playful → playful, brief → brief
- ALWAYS be FOR them
`}
SIGNATURE RULES:
- DO NOT sign most messages - this is an ongoing text conversation
- ONLY sign off IF the conversation feels naturally complete:
  * They said "thank you" or "thanks" and seem done
  * You've given closure and they're wrapping up
  * The conversation reached a natural ending point
- If signing off, use: "${signOff}" on a new line at the end
- Most messages should NOT be signed - keep it conversational

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
        model: 'gpt-4o', // Faster and cheaper than gpt-4-turbo-preview
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

    // CHECK IF AI IS ENDING CONVERSATION FOR INAPPROPRIATE BEHAVIOR
    const endingPhrases = /(I'm gonna stop|we're done|I don't think this is the right space|this isn't going anywhere|come back when you're serious|come back when you're ready)/i;
    const isEndingConversation = endingPhrases.test(answer);

    if (isEndingConversation) {
      console.log('🚪 AI ended conversation for inappropriate behavior - sending report');
      try {
        await resend.emails.send({
          from: 'The Busy Christian <onboarding@resend.dev>',
          to: process.env.ADMIN_EMAIL || 'doug.cag@gmail.com',
          subject: '🚪 Conversation Ended - Inappropriate/Irreverent Chat',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f59e0b;">🚪 AI Ended Conversation</h2>
              <p style="background: #fef3c7; padding: 12px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                The AI pastoral guidance determined this conversation was inappropriate, irreverent, or not constructive and chose to end it.
              </p>
              <div style="background: #fee2e2; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 0;"><strong>User's Message:</strong></p>
                <p style="white-space: pre-wrap; background: white; padding: 12px; border-radius: 4px; margin-top: 8px;">
                  ${question}
                </p>
              </div>
              <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 0;"><strong>AI's Ending Response:</strong></p>
                <p style="white-space: pre-wrap; background: white; padding: 12px; border-radius: 4px; margin-top: 8px;">
                  ${answer}
                </p>
              </div>
              ${conversationHistory && conversationHistory.length > 0 ? `
              <div style="background: #dbeafe; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 0 0 8px 0;"><strong>Previous Messages:</strong></p>
                ${conversationHistory.map((msg: any) => `
                  <div style="margin-bottom: 8px; padding: 8px; background: white; border-radius: 4px;">
                    <strong>${msg.role === 'user' ? 'User' : 'AI'}:</strong>
                    <p style="margin: 4px 0 0 0; white-space: pre-wrap;">${msg.content}</p>
                  </div>
                `).join('')}
              </div>
              ` : ''}
              <p style="color: #6b7280; font-size: 12px;">
                Session ID: ${sessionId}<br/>
                Timestamp: ${new Date().toLocaleString()}<br/>
                IP: ${userIp}
              </p>
            </div>
          `,
        });
        console.log('✅ Conversation ending report sent to pastor');
      } catch (emailError) {
        console.error('❌ Failed to send conversation ending report:', emailError);
      }
    }

    // SEND IMMEDIATE COMPLETE NOTIFICATION for critical situations (now that we have AI response)
    if (needsImmediateNotification && notificationType) {
      try {
        console.log(`✉️ Sending COMPLETE notification for ${notificationType} with full conversation context`);

        // Build conversation history HTML
        let conversationHtml = '';
        if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
          conversationHtml = '<div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">';
          conversationHtml += '<h4 style="color: #1e40af; margin: 0 0 12px 0;">📝 Conversation History:</h4>';
          conversationHistory.forEach((msg: any, idx: number) => {
            const role = msg.role === 'user' ? 'User' : 'AI';
            conversationHtml += `<div style="margin-bottom: 12px; padding: 8px; background: white; border-radius: 4px;">`;
            conversationHtml += `<strong style="color: ${msg.role === 'user' ? '#dc2626' : '#059669'};">${role}:</strong>`;
            conversationHtml += `<p style="margin: 4px 0 0 0; white-space: pre-wrap;">${msg.content}</p>`;
            conversationHtml += `</div>`;
          });
          conversationHtml += '</div>';
        }

        await resend.emails.send({
          from: 'The Busy Christian <onboarding@resend.dev>',
          to: process.env.PASTOR_EMAIL || process.env.ADMIN_EMAIL || 'doug.cag@gmail.com',
          subject: emailSubject,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, ${urgencyColor} 0%, #991b1b 100%); color: white; padding: 24px; border-radius: 12px 12px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">${urgencyTitle}</h1>
                <p style="margin: 12px 0 0 0; font-size: 16px; font-weight: bold;">
                  ${notificationType === 'HOMICIDE THREAT' ? 'CALL 911 IMMEDIATELY' : 'IMMEDIATE ACTION REQUIRED'}
                </p>
              </div>

              <div style="background: #fff; border: 4px solid ${urgencyColor}; border-top: none; border-radius: 0 0 12px 12px; padding: 24px;">
                <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin-bottom: 24px; border-left: 6px solid ${urgencyColor};">
                  <h2 style="color: #991b1b; margin: 0 0 12px 0;">⚠️ CRITICAL - ACT IMMEDIATELY</h2>
                  <p style="color: #7f1d1d; margin: 0; font-size: 15px; line-height: 1.6;">
                    ${urgencyMessage}
                  </p>
                </div>

                ${conversationHtml}

                <div style="background: #fef2f2; padding: 16px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #dc2626;">
                  <h4 style="color: #991b1b; margin: 0 0 12px 0;">❗ Current Message:</h4>
                  <p style="color: #7f1d1d; margin: 0; white-space: pre-wrap; font-size: 15px;"><strong>"${question}"</strong></p>
                </div>

                <div style="background: #ecfdf5; padding: 16px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #059669;">
                  <h4 style="color: #065f46; margin: 0 0 12px 0;">🤖 AI Response Sent:</h4>
                  <p style="color: #064e3b; margin: 0; white-space: pre-wrap; font-size: 14px;">${answer}</p>
                </div>

                <h3 style="color: #dc2626; margin: 24px 0 16px 0;">Technical Information:</h3>
                <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #6b7280;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 180px;">Session ID:</td>
                      <td style="padding: 8px 0; color: #6b7280; font-family: monospace; font-size: 12px;">${sessionId}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #374151;">IP Address:</td>
                      <td style="padding: 8px 0; color: #1f2937;">${userIp}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #374151;">First Name:</td>
                      <td style="padding: 8px 0; color: #1f2937;">${firstName || 'Not provided'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #374151;">Timestamp:</td>
                      <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">${new Date().toLocaleString('en-US', {
                        timeZone: 'America/Chicago',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                      })} CST</td>
                    </tr>
                    ${mentionedAge ? `
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #374151;">Mentioned Age:</td>
                      <td style="padding: 8px 0; color: #dc2626; font-weight: bold; font-size: 16px;">${mentionedAge} years old</td>
                    </tr>
                    ` : ''}
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #374151;">User Agent:</td>
                      <td style="padding: 8px 0; color: #78350f; font-size: 11px; font-family: monospace; word-break: break-all;">${userAgent}</td>
                    </tr>
                  </table>
                </div>

                <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 20px;">
                  <h4 style="color: #065f46; margin: 0 0 12px 0;">📋 Next Steps:</h4>
                  <ol style="color: #064e3b; margin: 8px 0 0 0; padding-left: 20px; line-height: 1.8;">
                    ${notificationType === 'MINOR ABUSE' ? `
                      <li><strong>Call LA Child Protective Services immediately:</strong> <a href="tel:1-855-452-5437" style="color: #dc2626; text-decoration: none; font-weight: bold;">1-855-452-5437</a> (24/7)</li>
                      <li><strong>Provide them with:</strong> Session ID, IP address, timestamp, and conversation details above</li>
                      <li><strong>Document everything</strong> in your pastoral records</li>
                    ` : notificationType === 'SUICIDE THREAT' ? `
                      <li><strong>Call 988 (Suicide & Crisis Lifeline) immediately:</strong> 24/7 support</li>
                      <li><strong>Attempt direct contact:</strong> Use any available contact info (first name, session history)</li>
                      <li><strong>Call 911 if imminent danger</strong></li>
                      <li><strong>Document everything</strong> in your pastoral records</li>
                    ` : notificationType === 'HOMICIDE THREAT' ? `
                      <li><strong style="color: #991b1b;">CALL 911 IMMEDIATELY</strong> - Someone's life may be in danger</li>
                      <li><strong>Provide all information above:</strong> Session ID, IP address, timestamp, exact quote, conversation</li>
                      <li><strong>Do NOT attempt direct contact</strong> - Leave it to law enforcement</li>
                      <li><strong>Document everything</strong> in your pastoral records</li>
                    ` : `
                      <li><strong>Review the full conversation above</strong></li>
                      <li><strong>Reach out to provide support</strong></li>
                      <li><strong>Document everything</strong> in your pastoral records</li>
                    `}
                    <li><strong>View full history:</strong> <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/pastoral-guidance" style="color: #2563eb;">Open pastoral guidance dashboard</a></li>
                  </ol>
                </div>

                ${notificationType === 'MINOR ABUSE' ? `
                <div style="background: #fef3c7; padding: 16px; border-radius: 8px; border: 2px solid #f59e0b; margin-top: 20px;">
                  <p style="margin: 0; color: #92400e; font-size: 13px; font-weight: bold;">
                    ⚖️ Louisiana Children's Code Article 609
                  </p>
                  <p style="margin: 8px 0 0 0; color: #92400e; font-size: 12px;">
                    Any person who has cause to believe that a child's physical or mental health or welfare has been or may be adversely affected by abuse or neglect <strong>shall report</strong> in accordance with this article.
                  </p>
                </div>
                ` : notificationType === 'HOMICIDE THREAT' ? `
                <div style="background: #fef3c7; padding: 16px; border-radius: 8px; border: 2px solid #f59e0b; margin-top: 20px;">
                  <p style="margin: 0; color: #92400e; font-size: 13px; font-weight: bold;">
                    ⚖️ Duty to Warn / Tarasoff Law
                  </p>
                  <p style="margin: 8px 0 0 0; color: #92400e; font-size: 12px;">
                    When a person threatens serious bodily harm or death to another, you have a legal duty to warn potential victims and notify law enforcement.
                  </p>
                </div>
                ` : ''}

                <div style="text-align: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 11px; margin: 0;">
                    Automatically generated by The Busy Christian app<br/>
                    Cornerstone Church, Mandeville, LA
                  </p>
                </div>
              </div>
            </div>
          `,
        });
        console.log(`✅ Complete notification email sent for ${notificationType}`);
      } catch (emailError) {
        console.error(`❌ CRITICAL: Failed to send complete notification email:`, emailError);
      }
    }

    // Check if this is a serious situation that needs pastor attention - EXPANDED DETECTION
    const seriousKeywords = /(suicid|kill myself|end my life|want to die|going to die|gonna die|self.?harm|hurt myself|gun|bullet|hang myself|hanging|overdos|pills|jump off|slit|cut myself|razor|bleed|die tonight|die today|not worth living|better off dead|no reason to live|can't go on|goodbye world|final message|trigger|pointing gun|loading gun|abus|being hurt|molest|assault|divorc|leaving god|walk away from faith|addict|alcohol|pornograph|terminal|cancer|died|death of|lost my|job loss)/i;
    const isSerious = !isCrisis && (seriousKeywords.test(question) || seriousKeywords.test(answer));
    const shouldEmailPastor = isCrisis || isSerious;
    console.log(`📊 Email check: isCrisis=${isCrisis}, seriousInQuestion=${seriousKeywords.test(question)}, seriousInAnswer=${seriousKeywords.test(answer)}, shouldEmail=${shouldEmailPastor}`);

    // Send email notification for serious situations (using userIp already captured above)
    if (shouldEmailPastor) {
      try {
        console.log(`🔔 Crisis/serious situation detected! Sending email...`);

        const emailResult = await resend.emails.send({
          from: 'Pastoral Guidance Alert <onboarding@resend.dev>',
          to: process.env.ADMIN_EMAIL || 'doug.cag@gmail.com',
          subject: isCrisis ? '🚨 CRISIS - Immediate Pastoral Attention Needed' : '⚠️ Serious Pastoral Situation - Follow-up Needed',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: ${isCrisis ? '#dc2626' : '#f59e0b'};">
                ${isCrisis ? '🚨 CRISIS SITUATION DETECTED' : '⚠️ Serious Pastoral Situation'}
              </h2>

              ${userEmail || userName ? `
              <div style="background: #dbeafe; padding: 16px; border-radius: 8px; margin: 16px 0; border: 2px solid #3b82f6;">
                <h3 style="margin-top: 0; color: #1e40af;">👤 User Contact Information</h3>
                ${userName ? `<p style="margin: 4px 0;"><strong>Name:</strong> ${userName}</p>` : ''}
                ${userEmail ? `<p style="margin: 4px 0;"><strong>Email:</strong> ${userEmail}</p>` : ''}

                ${userEmail ? `
                <div style="margin-top: 16px;">
                  <a href="mailto:${userEmail}?subject=Following up on your pastoral guidance question&body=Hi ${userName || 'there'},%0D%0A%0D%0AI received your question through the pastoral guidance app and wanted to reach out personally.%0D%0A%0D%0AYour question was: "${question.substring(0, 100)}..."%0D%0A%0D%0AI'd love to talk with you more about this. When would be a good time for us to connect?%0D%0A%0D%0ABlessings,%0D%0APastor Doug"
                     style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 8px;">
                    📧 Respond Now via Email
                  </a>
                </div>
                ` : `
                <p style="color: #92400e; font-size: 14px; margin-top: 12px;">
                  ℹ️ No email provided. User can only be reached through the app or if they contact you directly.
                </p>
                `}
              </div>
              ` : `
              <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #fbbf24;">
                <p style="margin: 0; color: #92400e;">
                  ℹ️ <strong>No contact information available.</strong> User is using the app anonymously.
                </p>
              </div>
              `}

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
                    '⚠️ This person may be in immediate danger. Consider reaching out directly.' :
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

        console.log(`✅ 📧 Email sent successfully to pastor!`, emailResult);
        console.log(`📧 Pastor notified of ${isCrisis ? 'CRISIS' : 'serious'} situation`);
      } catch (emailError) {
        console.error('❌ Failed to send pastor notification email:', emailError);
        // Don't fail the request if email fails - user still gets their response
      }
    } else {
      console.log(`ℹ️ No crisis detected, no email sent`);
    }

    return NextResponse.json({
      answer,
      isCrisis,
      isSerious: isSerious && !isCrisis,
      isMandatoryReport,
    });

  } catch (error) {
    console.error('Pastoral counseling API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
