// app/api/guidance-feedback/route.ts
// API for collecting user feedback on AI responses to improve empathy

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { logId, messageId, sessionId, rating, comment } = await req.json();

    // rating: 1 = thumbs up, -1 = thumbs down, 0 = neutral/skipped

    // Try to update by logId first
    if (logId) {
      const { error } = await supabase
        .from('guidance_logs')
        .update({
          feedback_rating: rating,
          feedback_comment: comment || null,
          feedback_at: new Date().toISOString(),
        })
        .eq('id', logId);

      if (!error) {
        console.log(`✅ Feedback recorded for log ${logId}: rating=${rating}`);
        return NextResponse.json({ success: true });
      }
    }

    // If no logId or update failed, try by messageId and sessionId
    if (messageId && sessionId) {
      const { error } = await supabase
        .from('guidance_logs')
        .update({
          feedback_rating: rating,
          feedback_comment: comment || null,
          feedback_at: new Date().toISOString(),
        })
        .eq('message_id', messageId)
        .eq('session_id', sessionId);

      if (!error) {
        console.log(`✅ Feedback recorded for message ${messageId}: rating=${rating}`);
        return NextResponse.json({ success: true });
      }
    }

    // If we can't find the log, store feedback separately
    const { error: insertError } = await supabase
      .from('feedback_orphans')
      .insert({
        message_id: messageId,
        session_id: sessionId,
        rating: rating,
        comment: comment || null,
        created_at: new Date().toISOString(),
      });

    // If orphans table doesn't exist, just log it
    if (insertError) {
      console.log(`📝 Feedback received but couldn't store: rating=${rating}, messageId=${messageId}`);
    }

    return NextResponse.json({ success: true, orphaned: true });
  } catch (error) {
    console.error('Feedback error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// GET - Fetch feedback analytics
export async function GET(req: Request) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');

    const since = new Date();
    since.setDate(since.getDate() - days);

    // Get feedback stats
    const { data: logs, error } = await supabase
      .from('guidance_logs')
      .select('feedback_rating, emotion_detected, subject, created_at')
      .not('feedback_rating', 'is', null)
      .gte('created_at', since.toISOString());

    if (error) {
      console.error('Error fetching feedback:', error);
      return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
    }

    // Calculate stats
    const stats = {
      total: logs?.length || 0,
      positive: logs?.filter(l => l.feedback_rating === 1).length || 0,
      negative: logs?.filter(l => l.feedback_rating === -1).length || 0,
      byEmotion: {} as Record<string, { positive: number; negative: number; total: number }>,
      bySubject: {} as Record<string, { positive: number; negative: number; total: number }>,
    };

    // Group by emotion
    logs?.forEach(log => {
      const emotion = log.emotion_detected || 'unknown';
      if (!stats.byEmotion[emotion]) {
        stats.byEmotion[emotion] = { positive: 0, negative: 0, total: 0 };
      }
      stats.byEmotion[emotion].total++;
      if (log.feedback_rating === 1) stats.byEmotion[emotion].positive++;
      if (log.feedback_rating === -1) stats.byEmotion[emotion].negative++;

      // Group by subject
      const subject = log.subject || 'General';
      if (!stats.bySubject[subject]) {
        stats.bySubject[subject] = { positive: 0, negative: 0, total: 0 };
      }
      stats.bySubject[subject].total++;
      if (log.feedback_rating === 1) stats.bySubject[subject].positive++;
      if (log.feedback_rating === -1) stats.bySubject[subject].negative++;
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Feedback analytics error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
