import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateAdminRequest } from '@/lib/serverAuth';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface OneDriveFile {
  id: string;
  name: string;
  '@microsoft.graph.downloadUrl': string;
  size: number;
}

export async function POST(request: NextRequest) {
  // 🔒 SECURITY: Validate admin authentication
  const authError = await validateAdminRequest(request);
  if (authError) return authError;

  try {
    const { accessToken, folderId } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'OneDrive access token is required' },
        { status: 400 }
      );
    }

    // Fetch files from OneDrive folder
    const folderPath = folderId || 'root:/Sermons';
    const filesUrl = `https://graph.microsoft.com/v1.0/me/drive/${folderPath}:/children`;

    const filesResponse = await fetch(filesUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!filesResponse.ok) {
      const error = await filesResponse.text();
      return NextResponse.json(
        { error: 'Failed to fetch OneDrive files', details: error },
        { status: filesResponse.status }
      );
    }

    const filesData = await filesResponse.json();
    const files: OneDriveFile[] = filesData.value || [];

    // Filter for text and document files
    const sermonFiles = files.filter(file =>
      file.name.match(/\.(txt|doc|docx|pdf)$/i) && file.size > 0
    );

    if (sermonFiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No sermon files found',
        imported: 0,
        skipped: 0,
      });
    }

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Process each file
    for (const file of sermonFiles) {
      try {
        console.log(`Processing: ${file.name}`);

        // Download file content
        const contentResponse = await fetch(file['@microsoft.graph.downloadUrl']);
        if (!contentResponse.ok) {
          errors.push(`Failed to download: ${file.name}`);
          skipped++;
          continue;
        }

        let content = await contentResponse.text();

        // Extract metadata from filename (e.g., "2020-03-15 Walking by Faith.txt")
        const dateMatch = file.name.match(/(\d{4}-\d{2}-\d{2})/);
        const titleMatch = file.name.replace(/\.(txt|doc|docx|pdf)$/i, '').replace(/^\d{4}-\d{2}-\d{2}\s*/, '');

        const title = titleMatch || file.name;
        const date = dateMatch ? dateMatch[1] : null;

        // Try to extract scripture reference from content (first 500 chars)
        const scriptureMatch = content.substring(0, 500).match(/(?:Scripture|Text|Passage):\s*([^\n]+)/i);
        const scripture_reference = scriptureMatch ? scriptureMatch[1].trim() : null;

        // Limit content length for embedding
        const contentForEmbedding = content.substring(0, 8000);

        // Generate summary from first paragraph
        const firstParagraph = content.split('\n\n')[0];
        const summary = firstParagraph.length > 500
          ? firstParagraph.substring(0, 500) + '...'
          : firstParagraph;

        // Generate embedding
        const embeddingResponse = await openai.embeddings.create({
          model: 'text-embedding-ada-002',
          input: `${title}\n\n${summary}\n\n${contentForEmbedding}`,
        });

        const embedding = embeddingResponse.data[0].embedding;

        // Check if sermon already exists
        const { data: existing } = await supabaseAdmin
          .from('sermons')
          .select('id')
          .eq('title', title)
          .single();

        if (existing) {
          console.log(`Skipping duplicate: ${title}`);
          skipped++;
          continue;
        }

        // Insert sermon
        const { error: insertError } = await supabaseAdmin
          .from('sermons')
          .insert({
            title,
            date,
            scripture_reference,
            content,
            summary,
            embedding,
            topics: [], // Could extract keywords here
          });

        if (insertError) {
          errors.push(`Failed to save: ${title} - ${insertError.message}`);
          skipped++;
        } else {
          imported++;
          console.log(`✓ Imported: ${title}`);
        }

      } catch (fileError) {
        console.error(`Error processing ${file.name}:`, fileError);
        errors.push(`Error with ${file.name}: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`);
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${imported} sermons, skipped ${skipped}`,
      imported,
      skipped,
      total: sermonFiles.length,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('OneDrive import error:', error);
    return NextResponse.json(
      { error: 'Failed to import from OneDrive', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
