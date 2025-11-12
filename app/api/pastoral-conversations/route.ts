import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Retrieve all conversations (for admin panel)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const flaggedOnly = searchParams.get('flaggedOnly') === 'true';
    const hasContact = searchParams.get('hasContact') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabaseAdmin
      .from('pastoral_conversations')
      .select(`
        *,
        message_count:pastoral_messages(count),
        latest_message:pastoral_messages(message, created_at, sender, flagged_serious)
      `)
      .order('last_activity', { ascending: false })
      .limit(limit);

    // Also get the latest message for each conversation
    const { data: conversations, error } = await query;

    if (error) throw error;

    // Process to get the actual latest message
    const processedConversations = await Promise.all(
      (conversations || []).map(async (conv: any) => {
        const { data: latestMsg } = await supabaseAdmin
          .from('pastoral_messages')
          .select('message, created_at, sender, flagged_serious')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const { data: unreadCount } = await supabaseAdmin
          .from('pastoral_messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('sender', 'user')
          .eq('read_by_pastor', false);

        return {
          ...conv,
          latest_message: latestMsg,
          unread_count: unreadCount || 0,
        };
      })
    );

    // Apply filters
    let filtered = processedConversations;

    if (flaggedOnly) {
      filtered = filtered.filter(c => c.latest_message?.flagged_serious);
    }

    if (hasContact) {
      filtered = filtered.filter(c => c.contact_email);
    }

    return NextResponse.json({
      conversations: filtered,
      total: filtered.length,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

// POST - Create or update a conversation
export async function POST(req: Request) {
  try {
    const { sessionId, firstName } = await req.json();

    if (!sessionId || !firstName) {
      return NextResponse.json(
        { error: 'sessionId and firstName required' },
        { status: 400 }
      );
    }

    // Check if conversation already exists
    const { data: existing } = await supabaseAdmin
      .from('pastoral_conversations')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (existing) {
      // Update last activity
      await supabaseAdmin
        .from('pastoral_conversations')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', existing.id);

      return NextResponse.json({ conversation: existing });
    }

    // Create new conversation
    const { data: newConv, error } = await supabaseAdmin
      .from('pastoral_conversations')
      .insert({
        session_id: sessionId,
        first_name: firstName,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ conversation: newConv });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
