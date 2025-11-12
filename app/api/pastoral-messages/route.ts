import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Retrieve messages for a conversation
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const conversationId = searchParams.get('conversationId');

    if (!sessionId && !conversationId) {
      return NextResponse.json(
        { error: 'sessionId or conversationId required' },
        { status: 400 }
      );
    }

    // Get conversation
    let conversation;
    if (sessionId) {
      const { data } = await supabaseAdmin
        .from('pastoral_conversations')
        .select('*')
        .eq('session_id', sessionId)
        .single();
      conversation = data;
    } else {
      const { data } = await supabaseAdmin
        .from('pastoral_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();
      conversation = data;
    }

    if (!conversation) {
      return NextResponse.json({
        conversation: null,
        messages: [],
        hasUnread: false,
      });
    }

    // Get messages for this conversation
    const { data: messages, error } = await supabaseAdmin
      .from('pastoral_messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Mark messages from pastor as read by user
    if (sessionId) {
      await supabaseAdmin
        .from('pastoral_messages')
        .update({ read_by_user: true })
        .eq('conversation_id', conversation.id)
        .eq('sender', 'pastor')
        .eq('read_by_user', false);

      // Clear unread flag
      await supabaseAdmin
        .from('pastoral_conversations')
        .update({ has_unread_from_pastor: false })
        .eq('id', conversation.id);
    }

    return NextResponse.json({
      conversation,
      messages: messages || [],
      hasUnread: conversation.has_unread_from_pastor,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Send a message (from user or pastor)
export async function POST(req: Request) {
  try {
    const { sessionId, conversationId, message, sender, isAiResponse, flaggedSerious } = await req.json();

    if (!message || !sender) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get or create conversation
    let convId = conversationId;

    if (sessionId && !convId) {
      // Check if conversation exists
      const { data: existing } = await supabaseAdmin
        .from('pastoral_conversations')
        .select('id')
        .eq('session_id', sessionId)
        .single();

      if (existing) {
        convId = existing.id;
      }
    }

    if (!convId) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Insert message
    const { data, error } = await supabaseAdmin
      .from('pastoral_messages')
      .insert({
        conversation_id: convId,
        sender,
        message,
        is_ai_response: isAiResponse || false,
        flagged_serious: flaggedSerious || false,
        read_by_user: sender === 'user', // User's own messages are auto-read
        read_by_pastor: sender === 'pastor', // Pastor's own messages are auto-read
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, message: data });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
