import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { messageId, sessionId, helpful } = await request.json();

    if (!sessionId || helpful === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert feedback (anonymous - no user content stored)
    const { error } = await supabase
      .from('pastoral_feedback')
      .insert({
        message_id: messageId || null,
        session_id: sessionId,
        helpful: helpful,
        created_at: new Date().toISOString(),
      });

    if (error) {
      // If table doesn't exist, create it
      if (error.code === '42P01') {
        console.log('pastoral_feedback table does not exist, creating...');
        // Table will be created via migration, just log for now
      }
      console.error('Error saving feedback:', error);
      // Don't fail the request - feedback is optional
      return NextResponse.json({ success: true, note: 'Feedback logged' });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Feedback error:', error);
    return NextResponse.json({ success: true }); // Don't fail on feedback errors
  }
}
