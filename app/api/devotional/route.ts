// app/api/devotional/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    // Get today's date or a specific date from query params
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');
    
    const today = dateParam ? new Date(dateParam) : new Date();
    
    // 🛡️ Safe fetch wrapper with fallback
    let data: any = null;

    try {
      const response = await fetch(
        "https://www.ourmanna.com/api/v1/get/?format=json&order=daily",
        {
          headers: {
            Accept: "application/json",
          },
          next: { revalidate: 3600 }, // Cache for 1 hour
        }
      );

      // Check if response is actually JSON
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        console.warn("⚠️ Devotional API returned non-JSON content:", text.slice(0, 100));
        data = null;
      }
    } catch (err) {
      console.error("❌ External devotional API failed:", err);
      data = null;
    }

    if (!data || !data.verse?.details) {
      // Fallback devotional if external API fails
      return NextResponse.json({
        success: true,
        date: format(today, "MMMM d, yyyy"),
        devotional: {
          title: "Trust in the Lord",
          content:
            "Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
          scripture: "Proverbs 3:5-6",
          author: "Daily Encouragement",
          source: "The Busy Christian",
        },
      });
    }

    // Success case - return the devotional from API
    return NextResponse.json({
      success: true,
      date: format(today, "MMMM d, yyyy"),
      devotional: {
        title: data.verse.details.title || "Daily Devotional",
        content: data.verse.details.text || "",
        scripture: data.verse.details.reference || "",
        author: "Our Daily Bread",
        source: "OurManna.com",
      },
    });

  } catch (error) {
    console.error("Error fetching devotional:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch devotional",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}