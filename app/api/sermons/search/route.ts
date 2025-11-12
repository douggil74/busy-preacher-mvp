import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 5, threshold = 0.7 } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Generate embedding for the search query using direct fetch
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: query,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!embeddingResponse.ok) {
      throw new Error(`OpenAI API error: ${embeddingResponse.statusText}`);
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Search for similar sermons using the match_sermons function
    const { data, error } = await supabaseAdmin.rpc('match_sermons', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
    });

    if (error) {
      console.error('Supabase search error:', error);
      return NextResponse.json(
        { error: 'Failed to search sermons', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sermons: data,
      count: data.length,
    });

  } catch (error) {
    console.error('Sermon search error:', error);
    return NextResponse.json(
      { error: 'Failed to search sermons', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
