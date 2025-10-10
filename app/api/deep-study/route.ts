// app/api/deep-study/route.ts
import { NextRequest, NextResponse } from "next/server";

const BIBLE_API_BASE = "https://bible-api.com";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json({ error: "Missing reference parameter" }, { status: 400 });
    }

    console.log("=== Deep Study Request ===");
    console.log("Reference:", reference);

    // Normalize reference - convert periods to colons
    const normalizedReference = reference.replace(/(\d+)\.(\d+)/g, '$1:$2');
    console.log("Normalized reference:", normalizedReference);

    // Fetch from bible-api.com - only accurate translations
    const translations = {
      KJV: "kjv",
      WEB: "web",
      ASV: "asv"
    };

    const translationsData: Record<string, any> = {};

    // Fetch all translations in parallel for speed
    const fetchPromises = Object.entries(translations).map(async ([name, code]) => {
      try {
        const url = `${BIBLE_API_BASE}/${encodeURIComponent(normalizedReference)}?translation=${code}`;
        console.log(`Fetching ${name}: ${url}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error(`Failed to fetch ${name}: ${response.status}`);
          return [name, {
            error: true,
            text: `Unable to load ${name}`
          }];
        }
        
        const data = await response.json();
        console.log(`${name} fetched successfully`);
        
        return [name, {
          text: data.text || data.verses?.map((v: any) => v.text).join(' ') || "No text available",
          book: data.book_name || normalizedReference.split(' ')[0]
        }];
      } catch (error) {
        console.error(`Error fetching ${name}:`, error);
        return [name, {
          error: true,
          text: `Error loading ${name}`
        }];
      }
    });

    // Wait for all translations to complete
    const results = await Promise.all(fetchPromises);
    results.forEach(([name, data]) => {
      translationsData[name as string] = data;
    });

    // Start AI commentary fetch (but don't wait for it)
    let aiCommentary = null;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (openaiApiKey) {
      // Fetch AI commentary with a shorter timeout
      const aiPromise = Promise.race([
        fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini", // Faster model
            messages: [
              {
                role: "system",
                content: "You are a biblical scholar. Provide concise commentary with historical context and practical application."
              },
              {
                role: "user",
                content: `Brief commentary on ${normalizedReference} (max 300 words).`
              }
            ],
            max_tokens: 400, // Reduced from 500
            temperature: 0.7,
          }),
        }).then(res => res.json()),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI timeout')), 8000) // 8 second timeout
        )
      ]);

      try {
        const aiData = await aiPromise as any;
        aiCommentary = {
          commentary: aiData.choices?.[0]?.message?.content || "Commentary generation timed out"
        };
      } catch (error) {
        console.log("AI commentary skipped or timed out");
        aiCommentary = {
          commentary: "AI commentary unavailable - Bible verses loaded successfully!"
        };
      }
    }

    // Create study links
    const studyLinks = {
      bibleHub: `https://biblehub.com/${normalizedReference.toLowerCase().replace(/\s+/g, '_').replace(/:/g, '-')}.htm`,
      blueLetterBible: `https://www.blueletterbible.org/search/search.cfm?Criteria=${encodeURIComponent(normalizedReference)}`,
      studyLight: `https://www.studylight.org/desk/?q=${encodeURIComponent(normalizedReference)}`
    };

    // Check if it's a chapter request (no verse number)
    const isChapter = !normalizedReference.includes(':');

    return NextResponse.json({
      reference: normalizedReference,
      parsed: {
        isChapter
      },
      translations: translationsData,
      commentaries: {
        adamClarke: null,
        ai: aiCommentary
      },
      studyLinks,
      isChapter
    });

  } catch (error: any) {
    console.error("Deep Study API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}