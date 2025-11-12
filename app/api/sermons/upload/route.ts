import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { title, date, scripture_reference, content, summary, topics, series } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Generate embedding for the sermon content
    console.log('Generating embedding for sermon:', title);
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: `${title}\n\n${summary || ''}\n\n${content}`.substring(0, 8000), // Limit to ~8000 chars
    });

    const embedding = embeddingResponse.data[0].embedding;

    // Insert sermon into database
    const { data, error } = await supabaseAdmin
      .from('sermons')
      .insert({
        title,
        date: date || null,
        scripture_reference: scripture_reference || null,
        content,
        summary: summary || null,
        topics: topics || [],
        series: series || null,
        embedding,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save sermon', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sermon: data,
      message: 'Sermon uploaded successfully'
    });

  } catch (error) {
    console.error('Sermon upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload sermon', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
