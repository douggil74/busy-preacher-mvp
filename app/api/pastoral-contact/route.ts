import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { sessionId, firstName, email, phone } = await req.json();

    if (!sessionId || !firstName || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if conversation already exists
    const { data: existing } = await supabaseAdmin
      .from('pastoral_conversations')
      .select('id')
      .eq('session_id', sessionId)
      .single();

    if (existing) {
      // Update existing conversation with contact info
      const { error } = await supabaseAdmin
        .from('pastoral_conversations')
        .update({
          contact_email: email,
          contact_phone: phone || null,
          contact_provided_at: new Date().toISOString(),
        })
        .eq('session_id', sessionId);

      if (error) throw error;
    } else {
      // Create new conversation with contact info
      const { error } = await supabaseAdmin
        .from('pastoral_conversations')
        .insert({
          session_id: sessionId,
          first_name: firstName,
          contact_email: email,
          contact_phone: phone || null,
          contact_provided_at: new Date().toISOString(),
        });

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving contact info:', error);
    return NextResponse.json(
      { error: 'Failed to save contact information' },
      { status: 500 }
    );
  }
}
