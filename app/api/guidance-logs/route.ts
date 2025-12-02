// app/api/guidance-logs/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Auto-detect subject/theme from question content
function detectSubject(question: string): string {
  const q = question.toLowerCase();

  // Check for specific themes
  if (q.includes('anxiet') || q.includes('worry') || q.includes('fear') || q.includes('panic')) return 'Anxiety & Fear';
  if (q.includes('depress') || q.includes('sad') || q.includes('hopeless') || q.includes('empty')) return 'Depression';
  if (q.includes('forgiv') || q.includes('bitter') || q.includes('resent')) return 'Forgiveness';
  if (q.includes('marriage') || q.includes('husband') || q.includes('wife') || q.includes('spouse') || q.includes('divorce')) return 'Marriage';
  if (q.includes('relationship') || q.includes('friend') || q.includes('family') || q.includes('conflict')) return 'Relationships';
  if (q.includes('parent') || q.includes('child') || q.includes('kid') || q.includes('son') || q.includes('daughter')) return 'Parenting';
  if (q.includes('faith') || q.includes('believe') || q.includes('doubt') || q.includes('trust')) return 'Faith & Doubt';
  if (q.includes('prayer') || q.includes('pray')) return 'Prayer';
  if (q.includes('sin') || q.includes('tempt') || q.includes('lust') || q.includes('porn') || q.includes('addict')) return 'Sin & Temptation';
  if (q.includes('grief') || q.includes('loss') || q.includes('death') || q.includes('died') || q.includes('mourn')) return 'Grief & Loss';
  if (q.includes('job') || q.includes('work') || q.includes('career') || q.includes('money') || q.includes('financi')) return 'Work & Finances';
  if (q.includes('purpose') || q.includes('calling') || q.includes('meaning') || q.includes('why am i')) return 'Purpose & Calling';
  if (q.includes('salv') || q.includes('save') || q.includes('heaven') || q.includes('hell') || q.includes('born again')) return 'Salvation';
  if (q.includes('holy spirit') || q.includes('spirit') || q.includes('gift')) return 'Holy Spirit';
  if (q.includes('bible') || q.includes('scripture') || q.includes('verse')) return 'Bible Study';
  if (q.includes('church') || q.includes('worship') || q.includes('service')) return 'Church & Worship';
  if (q.includes('heal') || q.includes('sick') || q.includes('health') || q.includes('illness')) return 'Health & Healing';

  return 'General Spiritual';
}

// Detect emotional state from the message
interface EmotionResult {
  emotion: string;
  intensity: 'low' | 'medium' | 'high';
  needsExtraEmpathy: boolean;
}

function detectEmotion(question: string): EmotionResult {
  const q = question.toLowerCase();

  // High intensity indicators
  const highIntensity = /(can't take it|i can't|so hard|really struggling|desperate|overwhelmed|breaking|falling apart|at my limit|don't know what to do|help me|please help|losing my mind|going crazy|too much|unbearable)/i;
  const isHighIntensity = highIntensity.test(q);

  // Medium intensity indicators
  const mediumIntensity = /(struggling|difficult|hard time|confused|unsure|worried|stressed|anxious|frustrated|hurt|painful|challenging)/i;
  const isMediumIntensity = !isHighIntensity && mediumIntensity.test(q);

  // Emotion detection with priority order
  const emotions: { pattern: RegExp; emotion: string; needsExtraEmpathy: boolean }[] = [
    // Crisis emotions - highest priority
    { pattern: /(suicid|want to die|end my life|kill myself|self.?harm|hurt myself|no reason to live)/i, emotion: 'crisis', needsExtraEmpathy: true },

    // Deep pain emotions
    { pattern: /(grief|griev|mourn|loss|died|death|lost my|passed away)/i, emotion: 'grief', needsExtraEmpathy: true },
    { pattern: /(depress|hopeless|empty|numb|dark|darkness|void)/i, emotion: 'despair', needsExtraEmpathy: true },
    { pattern: /(betray|cheated|affair|unfaithful|backstab)/i, emotion: 'betrayal', needsExtraEmpathy: true },
    { pattern: /(abus|trauma|ptsd|flashback|nightmare)/i, emotion: 'trauma', needsExtraEmpathy: true },
    { pattern: /(lonely|alone|isolated|no one|nobody|by myself)/i, emotion: 'loneliness', needsExtraEmpathy: true },

    // Strong emotions
    { pattern: /(anxiet|anxious|panic|terrified|scared|fearful|worry|worri)/i, emotion: 'anxiety', needsExtraEmpathy: true },
    { pattern: /(angry|anger|furious|rage|mad|pissed|livid|hate)/i, emotion: 'anger', needsExtraEmpathy: false },
    { pattern: /(guilt|guilty|shame|ashamed|regret|remorse)/i, emotion: 'guilt', needsExtraEmpathy: true },
    { pattern: /(confus|lost|unsure|don't know|uncertain|torn)/i, emotion: 'confusion', needsExtraEmpathy: false },
    { pattern: /(frustrat|annoyed|irritat|stuck|stagnant)/i, emotion: 'frustration', needsExtraEmpathy: false },

    // Moderate emotions
    { pattern: /(sad|unhappy|down|blue|melancholy)/i, emotion: 'sadness', needsExtraEmpathy: true },
    { pattern: /(stress|overwhelm|pressure|burden|weight)/i, emotion: 'stress', needsExtraEmpathy: false },
    { pattern: /(disappoint|let down|failed|failure)/i, emotion: 'disappointment', needsExtraEmpathy: true },
    { pattern: /(jealous|envy|envious|covet)/i, emotion: 'jealousy', needsExtraEmpathy: false },

    // Seeking emotions (less negative)
    { pattern: /(doubt|question|wonder|skeptic|uncertain about god|is god real)/i, emotion: 'doubt', needsExtraEmpathy: false },
    { pattern: /(curious|interest|want to know|learn|understand|explain)/i, emotion: 'curiosity', needsExtraEmpathy: false },
    { pattern: /(hope|hoping|wish|pray for|looking for)/i, emotion: 'hope', needsExtraEmpathy: false },

    // Positive emotions
    { pattern: /(grateful|thankful|blessed|appreciat|praise)/i, emotion: 'gratitude', needsExtraEmpathy: false },
    { pattern: /(excit|happy|joy|wonderful|amazing|great news)/i, emotion: 'joy', needsExtraEmpathy: false },
    { pattern: /(peace|calm|serene|content|at rest)/i, emotion: 'peace', needsExtraEmpathy: false },
  ];

  for (const { pattern, emotion, needsExtraEmpathy } of emotions) {
    if (pattern.test(q)) {
      return {
        emotion,
        intensity: isHighIntensity ? 'high' : (isMediumIntensity ? 'medium' : 'low'),
        needsExtraEmpathy: needsExtraEmpathy || isHighIntensity,
      };
    }
  }

  return { emotion: 'neutral', intensity: 'low', needsExtraEmpathy: false };
}

export async function POST(req: Request) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { firstName, question, answer, flagged, sessionId, messageId } = await req.json();

    // Auto-detect subject and emotion
    const subject = detectSubject(question);
    const emotionResult = detectEmotion(question);

    const { data, error } = await supabase
      .from('guidance_logs')
      .insert({
        first_name: firstName || 'Anonymous',
        question: question,
        answer: answer,
        flagged: flagged || false,
        subject: subject,
        is_learning_example: false,
        // New emotion tracking fields
        emotion_detected: emotionResult.emotion,
        emotion_intensity: emotionResult.intensity,
        needs_extra_empathy: emotionResult.needsExtraEmpathy,
        // Feedback fields (set later by user)
        feedback_rating: null,
        feedback_comment: null,
        // Session tracking
        session_id: sessionId || null,
        message_id: messageId || null,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error logging guidance question:', error);
      // Try without new fields if they don't exist yet
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('guidance_logs')
        .insert({
          first_name: firstName || 'Anonymous',
          question: question,
          answer: answer,
          flagged: flagged || false,
          subject: subject,
          is_learning_example: false,
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (fallbackError) {
        return NextResponse.json({ error: 'Failed to log question' }, { status: 500 });
      }
      return NextResponse.json({ success: true, logId: fallbackData?.id, emotion: emotionResult });
    }

    return NextResponse.json({ success: true, logId: data?.id, emotion: emotionResult });
  } catch (error) {
    console.error('Guidance log error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const learningOnly = searchParams.get('learning') === 'true';
    const subject = searchParams.get('subject');

    let query = supabase
      .from('guidance_logs')
      .select('*');

    // Filter for learning examples only
    if (learningOnly) {
      query = query.eq('is_learning_example', true);
    }

    // Filter by subject
    if (subject) {
      query = query.eq('subject', subject);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching guidance logs:', error);
      return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }

    // Also get subject counts for the admin dashboard
    const { data: subjectCounts } = await supabase
      .from('guidance_logs')
      .select('subject')
      .not('subject', 'is', null);

    const subjects: Record<string, number> = {};
    (subjectCounts || []).forEach((row: any) => {
      if (row.subject) {
        subjects[row.subject] = (subjects[row.subject] || 0) + 1;
      }
    });

    return NextResponse.json({
      logs: data || [],
      subjectCounts: subjects
    });
  } catch (error) {
    console.error('Guidance log fetch error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// PATCH - Update a log (mark as learning example, update subject)
export async function PATCH(req: Request) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { id, is_learning_example, subject, improved_answer } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Log ID required' }, { status: 400 });
    }

    const updateData: any = {};
    if (is_learning_example !== undefined) updateData.is_learning_example = is_learning_example;
    if (subject !== undefined) updateData.subject = subject;
    if (improved_answer !== undefined) updateData.improved_answer = improved_answer;

    const { error } = await supabase
      .from('guidance_logs')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating guidance log:', error);
      return NextResponse.json({ error: 'Failed to update log' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Guidance log update error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
