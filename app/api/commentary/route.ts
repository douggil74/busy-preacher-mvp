// app/api/commentary/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as cheerio from 'cheerio';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CommentarySource {
  name: string;
  author: string;
  year: string;
  style: string;
  url: string;
  selector: string;
}

const COMMENTARY_SOURCES: Record<string, CommentarySource> = {
  "matthew-henry": {
    name: "Matthew Henry's Complete Commentary",
    author: "Matthew Henry",
    year: "1706",
    style: "Pastoral, practical, beloved classic",
    url: "https://www.biblestudytools.com/commentaries/matthew-henry-complete/",
    selector: ".commentary-text, .verse-text, p"
  },
  "gill": {
    name: "Gill's Exposition of the Bible",
    author: "John Gill",
    year: "1746-1763",
    style: "Thorough, Reformed, detailed",
    url: "https://www.biblestudytools.com/commentaries/gills-exposition-of-the-bible/",
    selector: ".commentary-text, .verse-text, p"
  }
};
function parseReference(ref: string): { book: string; chapter: number; verse?: number } | null {
  const match = ref.match(/^(\d?\s?[A-Za-z]+)\s+(\d+)(?::(\d+))?/);
  if (!match) return null;

  return {
    book: match[1].trim(),
    chapter: parseInt(match[2]),
    verse: match[3] ? parseInt(match[3]) : undefined,
  };
}

function formatReferenceForUrl(book: string, chapter: number, verse?: number, commentaryType?: string): string {
  const bookMappings: Record<string, string> = {
    '1 john': 'first-john',
    '2 john': 'second-john',
    '3 john': 'third-john',
    '1 peter': 'first-peter',
    '2 peter': 'second-peter',
    '1 timothy': 'first-timothy',
    '2 timothy': 'second-timothy',
    '1 corinthians': 'first-corinthians',
    '2 corinthians': 'second-corinthians',
    '1 thessalonians': 'first-thessalonians',
    '2 thessalonians': 'second-thessalonians',
    '1 kings': 'first-kings',
    '2 kings': 'second-kings',
    '1 samuel': 'first-samuel',
    '2 samuel': 'second-samuel',
    '1 chronicles': 'first-chronicles',
    '2 chronicles': 'second-chronicles',
    'song of solomon': 'song-of-songs',
  };

  const bookLower = book.toLowerCase();
  const bookSlug = bookMappings[bookLower] || bookLower.replace(/\s+/g, '-');
  
  // Gill uses: book-chapter-verse format (john-3-16)
  if (commentaryType === 'gill' && verse) {
    return `${bookSlug}-${chapter}-${verse}`;
  }
  
  // Matthew Henry uses: book/chapter format (john/3)
  return `${bookSlug}/${chapter}`;
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

const urlSlug = formatReferenceForUrl(parsed.book, parsed.chapter, parsed.verse, commentaryType);
    const fullUrl = `${source.url}${urlSlug}.html`;

    console.log(`Fetching ${source.author} from: ${fullUrl}`);

    // Fetch the actual HTML
    const response = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${source.author}: ${response.status}`);
      return { error: `HTTP ${response.status}` };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract commentary text
    let commentaryText = '';
    
    // Try different selectors based on the site structure
    const possibleSelectors = [
      '.bible-text',
      '.commentary-body',
      '.verse-text',
      'article p',
      '.content p',
      'main p'
    ];

    for (const selector of possibleSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        elements.each((i, el) => {
          const text = $(el).text().trim();
          if (text && text.length > 50) {
            commentaryText += text + '\n\n';
          }
        });
        
        if (commentaryText.length > 100) break;
      }
    }

    // Clean up the text
    commentaryText = commentaryText
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    // Limit length for display
    if (commentaryText.length > 1000) {
      commentaryText = commentaryText.substring(0, 1000) + '...';
    }

    if (!commentaryText || commentaryText.length < 50) {
      return {
        source: source.name,
        author: source.author,
        year: source.year,
        url: fullUrl,
        text: `Commentary available at the link above.`,
        available: true,
        scraped: false
      };
    }

    return {
      source: source.name,
      author: source.author,
      year: source.year,
      url: fullUrl,
      text: commentaryText,
      passage: passage,
      available: true,
      scraped: true
    };

  } catch (error) {
    console.error(`Error fetching ${commentaryType}:`, error);
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

    const parsed = parseReference(reference);
    if (!parsed) {
      return NextResponse.json({ error: 'Invalid reference format' }, { status: 400 });
    }

    console.log(`\n=== Fetching Commentaries for ${reference} ===`);

    const commentaries = await Promise.all([
      fetchBibleStudyTools(reference, "matthew-henry"),
      fetchBibleStudyTools(reference, "gill"),
      fetchBibleStudyTools(reference, "barnes"),
    ]);

    const validCommentaries = commentaries.filter(c => !c.error);

    console.log(`Found ${validCommentaries.length} valid commentaries`);

    if (validCommentaries.length === 0) {
      return NextResponse.json(
        { 
          error: "No commentaries available for this passage",
          reference,
          commentaries: []
        },
        { status: 200 }
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
      reference: request.nextUrl.searchParams.get('reference'),
      commentaries: [],
      success: false
    }, { status: 200 });
  }
}