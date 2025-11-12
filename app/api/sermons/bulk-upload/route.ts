import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateAdminRequest } from '@/lib/serverAuth';
import OpenAI from 'openai';
import mammoth from 'mammoth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  // 🔒 SECURITY: Validate admin authentication
  const authError = await validateAdminRequest(request);
  if (authError) return authError;

  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log(`Processing file: ${file.name} (${file.size} bytes)`);

    // Extract text content based on file type
    let content = '';
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.txt')) {
      // Plain text file
      content = await file.text();
    } else if (fileName.endsWith('.docx')) {
      // Modern Word document (.docx) - use mammoth to extract text
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        content = result.value;

        if (result.messages && result.messages.length > 0) {
          console.log('Mammoth messages:', result.messages);
        }
      } catch (mammothError) {
        console.error('Mammoth extraction error:', mammothError);
        return NextResponse.json(
          { skipped: true, reason: 'Failed to extract text from .docx file. File may be corrupted.' },
          { status: 200 }
        );
      }
    } else if (fileName.endsWith('.doc')) {
      // Legacy Word format (.doc) - not supported by mammoth
      return NextResponse.json(
        { skipped: true, reason: 'Legacy .doc format not supported. Please convert to .docx or .txt' },
        { status: 200 }
      );
    } else {
      // Unsupported file type (shouldn't happen due to frontend filtering)
      return NextResponse.json(
        { skipped: true, reason: 'Unsupported file type' },
        { status: 200 }
      );
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { skipped: true, reason: 'Empty file or no text content' },
        { status: 200 }
      );
    }

    // Extract metadata from filename
    // Expected format: "YYYY-MM-DD Sermon Title.txt" or just "Sermon Title.txt"
    const dateMatch = file.name.match(/(\d{4}-\d{2}-\d{2})/);
    const titleMatch = file.name
      .replace(/\.(txt|doc|docx)$/i, '') // Remove extension
      .replace(/^\d{4}-\d{2}-\d{2}\s*/, '') // Remove date prefix if present
      .trim();

    const title = titleMatch || file.name.replace(/\.(txt|doc|docx)$/i, '');
    const date = dateMatch ? dateMatch[1] : null;

    // Try to extract scripture reference from first 500 characters
    const scriptureMatch = content.substring(0, 500).match(/(?:Scripture|Text|Passage|Reference):\s*([^\n]+)/i);
    const scripture_reference = scriptureMatch ? scriptureMatch[1].trim() : null;

    // Generate summary from first paragraph or first 500 characters
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    const firstParagraph = paragraphs[0] || content.substring(0, 500);
    const summary = firstParagraph.length > 500
      ? firstParagraph.substring(0, 500) + '...'
      : firstParagraph;

    // Limit content length for embedding (OpenAI has token limits)
    const contentForEmbedding = content.substring(0, 8000);

    // Check if sermon with this title already exists
    const { data: existing } = await supabaseAdmin
      .from('sermons')
      .select('id')
      .eq('title', title)
      .single();

    if (existing) {
      console.log(`Skipping duplicate: ${title}`);
      return NextResponse.json(
        { skipped: true, reason: 'Duplicate title already exists' },
        { status: 200 }
      );
    }

    // Generate embedding using OpenAI
    console.log(`Generating embedding for: ${title}`);
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: `${title}\n\n${summary}\n\n${contentForEmbedding}`,
    });

    const embedding = embeddingResponse.data[0].embedding;

    // Insert sermon into database
    console.log(`Inserting sermon: ${title}`);
    const { error: insertError } = await supabaseAdmin
      .from('sermons')
      .insert({
        title,
        date,
        scripture_reference,
        content,
        summary,
        embedding,
        topics: [], // Could extract keywords here in the future
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save sermon to database', details: insertError.message },
        { status: 500 }
      );
    }

    console.log(`✓ Successfully imported: ${title}`);
    return NextResponse.json({
      success: true,
      title,
      date,
      contentLength: content.length,
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
