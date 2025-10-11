// app/api/commentary/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CommentarySource {
  name: string;
  author: string;
  year: string;
  style: string;
  url: string;
}

// Public domain commentaries available via APIs/scraping
const COMMENTARY_SOURCES: Record<string, CommentarySource> = {
  "matthew-henry": {
    name: "Matthew Henry's Concise Commentary",
    author: "Matthew Henry",
    year: "1706",
    style: "Pastoral, practical, beloved classic",
    url: "https://www.biblestudytools.com/commentaries/matthew-henry-concise/",
  },
  "gill": {
    name: "Gill's Exposition of the Bible",
    author: "John Gill",
    year: "1746-1763",
    style: "Thorough, Reformed, detailed",
    url: "https://www.biblestudytools.com/commentaries/gills-exposition-of-the-bible/",
  },
  "barnes": {
    name: "Barnes' Notes on the Bible",
    author: "Albert Barnes",
    year: "1834",
    style: "Clear, practical, accessible",
    url: "https://www.biblestudytools.com/commentaries/barnes-notes/",
  },
};

function parseReference(ref: string): { book: string; chapter: number; verse?: number } | null {
  // Parse "John 3:16" or "John 3" format
  const match = ref.match(/^(\d?\s?[A-Za-z]+)\s+(\d+)(?::(\d+))?/);
  if (!match) return null;

  return {
    book: match[1].trim(),
    chapter: parseInt(match[2]),
    verse: match[3] ? parseInt(match[3]) : undefined,
  };
}

function formatReferenceForUrl(book: string, chapter: number, verse?: number): string {
  // Convert "1 John" to "1-john", "John" to "john"
  const bookSlug = book.toLowerCase().replace(/\s+/g, "-");
  return verse ? `${bookSlug}-${chapter}-${verse}` : `${bookSlug}-${chapter}`;
}

async function fetchBibleStudyTools(passage: string, commentaryType: string): Promise<any> {
  try {
    const parsed = parseReference(passage);
    if (!parsed) {
      return { error: "Could not parse reference" };
    }

    const source = COMMENTARY_SOURCES[commentaryType];
    if (!source) {
      return { error: "Unknown commentary source" };
    }

    const urlSlug = formatReferenceForUrl(parsed.book, parsed.chapter, parsed.verse);
    const fullUrl = `${source.url}${urlSlug}.html`;

    // Note: In production, you'd actually fetch and parse the HTML here
    // For now, return metadata with link
    return {
      source: source.name,
      author: source.author,
      year: source.year,
      style: source.style,
      url: fullUrl,
      passage: passage,
      // In production: parse the actual commentary text from the HTML
      excerpt: `Read the full ${source.name} commentary at the link above.`,
      available: true,
    };
  } catch (error) {
    console.error("Error fetching commentary:", error);
    return { error: "Failed to fetch commentary" };
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json({ error: 'Reference required' }, { status: 400 });
    }

    // Parse the reference
    const parsed = parseReference(reference);
    if (!parsed) {
      return NextResponse.json({ error: 'Invalid reference format' }, { status: 400 });
    }

    // Fetch from multiple sources in parallel
    const commentaries = await Promise.all([
      fetchBibleStudyTools(reference, "matthew-henry"),
      fetchBibleStudyTools(reference, "gill"),
      fetchBibleStudyTools(reference, "barnes"),
    ]);

    // Filter out errors
    const validCommentaries = commentaries.filter(c => !c.error);

    if (validCommentaries.length === 0) {
      return NextResponse.json(
        { error: "No commentaries available for this passage" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      reference,
      commentaries: validCommentaries,
      count: validCommentaries.length,
      success: true
    });

  } catch (error: any) {
    console.error('Commentary API error:', error);
    return NextResponse.json({ 
      error: error?.message || 'Failed to fetch commentary',
      success: false
    }, { status: 500 });
  }
}