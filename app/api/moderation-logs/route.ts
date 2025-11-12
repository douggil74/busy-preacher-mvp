import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateAdminRequest } from '@/lib/serverAuth';

export async function GET(request: NextRequest) {
  // 🔒 SECURITY: Validate admin authentication
  const authError = await validateAdminRequest(request);
  if (authError) return authError;

  try {
    // Fetch moderation logs from last 30 days, most recent first
    const { data: logs, error } = await supabaseAdmin
      .from('moderation_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching moderation logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch logs' },
        { status: 500 }
      );
    }

    // Get stats
    const abusiveCount = logs?.filter(l => l.moderation_type === 'abusive').length || 0;
    const spamCount = logs?.filter(l => l.moderation_type === 'spam').length || 0;
    const offTopicCount = logs?.filter(l => l.moderation_type === 'off-topic').length || 0;

    return NextResponse.json({
      logs: logs || [],
      stats: {
        total: logs?.length || 0,
        abusive: abusiveCount,
        spam: spamCount,
        offTopic: offTopicCount,
      }
    });
  } catch (error) {
    console.error('Moderation logs API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
