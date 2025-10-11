// app/api/piper-sermons/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Sermon {
  title: string;
  date: string;
  scripture: string;
  url: string;
  type: "message" | "article" | "light-truth";
  author: string;
}

// This would scrape or use Desiring God's Scripture index
// For now, we'll use their URL pattern
function buildDesiringGodSearchUrl(passage: string): string {
  // Desiring God has a scripture index at: https://www.desiringgod.org/scripture/john
  // We can search by book
  const bookMatch = passage.match(/^(\d?\s?[A-Za-z]+)/);
  if (!bookMatch) return "";
  
  const book = bookMatch[1].trim().toLowerCase().replace(/\s+/g, "-");
  return `https://www.desiringgod.org/scripture/${book}`;
}

async function fetchDesiringGodSermons(passage: string): Promise<Sermon[]> {
  try {
    // In production, you would:
    // 1. Fetch the scripture index page for the book
    // 2. Parse HTML to find sermons matching the passage
    // 3. Return structured data
    
    // For now, return the search URL and metadata
    const searchUrl = buildDesiringGodSearchUrl(passage);
    
    if (!searchUrl) {
      return [];
    }

    // Mock data structure - in production, scrape real data
    return [
      {
        title: `Resources on ${passage}`,
        date: "Various",
        scripture: passage,
        url: searchUrl,
        type: "message",
        author: "John Piper & Team",
      },
    ];
  } catch (error) {
    console.error("Error fetching Desiring God sermons:", error);
    return [];
  }
}

// Curated teacher list for YouTube filtering
const TRUSTED_TEACHERS = [
  "John Piper",
  "R.C. Sproul",
  "Tim Keller",
  "John MacArthur",
  "Alistair Begg",
  "Paul Washer",
  "Voddie Baucham",
];

export async function POST(req: NextRequest) {
  try {
    const { passage } = await req.json();

    if (!passage) {
      return NextResponse.json({ error: "Passage reference required" }, { status: 400 });
    }

    // Fetch Desiring God resources
    const sermons = await fetchDesiringGodSermons(passage);

    return NextResponse.json({
      passage,
      sermons,
      desiringGodUrl: buildDesiringGodSearchUrl(passage),
      trustedTeachers: TRUSTED_TEACHERS,
    });
  } catch (error: any) {
    console.error("Piper Sermons API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch sermons" },
      { status: 500 }
    );
  }
}