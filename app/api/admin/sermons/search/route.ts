/**
 * Admin Sermon Search API
 * Quick search sermons from Supabase
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function GET(req: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({
        sermons: [],
        count: 0,
        message: 'Supabase not configured - sermons feature requires Supabase',
      });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query) {
      // Return recent sermons
      const { data, error } = await supabase
        .from('sermons')
        .select('id, title, date, scripture, content')
        .order('date', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return NextResponse.json({
        sermons: data?.map((s) => ({
          ...s,
          content: s.content?.substring(0, 200) + '...',
        })),
        count: data?.length || 0,
      });
    }

    // Search by title or content
    const { data, error } = await supabase
      .from('sermons')
      .select('id, title, date, scripture, content')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,scripture.ilike.%${query}%`)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json({
      sermons: data?.map((s) => ({
        ...s,
        content: s.content?.substring(0, 200) + '...',
      })),
      count: data?.length || 0,
      query,
    });
  } catch (error) {
    console.error('Error searching sermons:', error);
    return NextResponse.json({ error: 'Failed to search sermons' }, { status: 500 });
  }
}
