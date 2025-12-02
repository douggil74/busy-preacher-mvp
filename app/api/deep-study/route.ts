// app/api/deep-study/route.ts
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getIdentifier, RATE_LIMITS, rateLimitResponse } from '@/lib/rateLimit';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BIBLE_API_BASE = "https://bible-api.com";

interface BibleTranslation {
  text: string;
  book?: string;
  error?: string;
}

async function fetchBibleVerse(reference: string, version: string = "kjv"): Promise<BibleTranslation> {
  try {
    const response = await fetch(
      `https://bible-api.com/${encodeURIComponent(reference)}?translation=${version}`
    );
    
    if (!response.ok) {
      return { text: "", error: "Verse not found" };
    }

    const data = await response.json();
    return {
      text: data.text || "",
      book: data.reference || reference,
    };
  } catch (error) {
    console.error(`Error fetching ${version}:`, error);
    return { text: "", error: "Failed to fetch verse" };
  }
}

async function generateAICommentary(reference: string, verseText: string): Promise<string> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    console.error("No OpenAI API key found");
    return "AI commentary unavailable - API key not configured.";
  }

  try {
    console.log("Generating AI commentary for:", reference);
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a knowledgeable Bible scholar providing insightful, practical commentary on Scripture. Provide context-aware insights that help readers understand and apply the passage. Be clear, concise, and encouraging. Format your response in markdown with headers, bold text for emphasis, and bullet points where appropriate."
          },
          {
            role: "user",
            content: `Provide biblical commentary on ${reference}:\n\n"${verseText}"\n\nInclude:\n1. Historical and cultural context\n2. Key themes and meanings\n3. Practical application for modern readers\n4. Connection to broader biblical narrative\n\nKeep it under 400 words.`
          }
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      
      if (response.status === 429) {
        return "AI commentary temporarily unavailable - API rate limit reached. Please try again in a moment.";
      }
      
      if (response.status === 401) {
        return "AI commentary unavailable - Invalid API key.";
      }
      
      return `AI commentary unavailable - API error (${response.status}).`;
    }

    const data = await response.json();
    const commentary = data.choices?.[0]?.message?.content;
    
    if (!commentary) {
      console.error("No commentary in response:", data);
      return "AI commentary generation failed - empty response.";
    }
    
    console.log("AI commentary generated successfully");
    return commentary;
    
  } catch (error: any) {
    console.error("Error generating AI commentary:", error);
    
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return "AI commentary unavailable - request timed out. Please try again.";
    }
    
    return "AI commentary generation failed. Please try again.";
  }
}

function generateStudyLinks(reference: string) {
  const encodedRef = encodeURIComponent(reference);
  return {
    bibleHub: `https://biblehub.com/commentaries/${reference.toLowerCase().replace(/\s+/g, '_')}.htm`,
    blueLetterBible: `https://www.blueletterbible.org/search/search.cfm?Criteria=${encodedRef}`,
    studyLight: `https://www.studylight.org/commentary/${reference.toLowerCase().replace(/\s+/g, '-')}.html`,
  };
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting - 15 requests per minute
    const identifier = getIdentifier(request);
    const rateLimit = checkRateLimit({
      ...RATE_LIMITS.AI_STUDY,
      identifier,
    });
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit.resetIn);
    }

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
      kjv: "kjv",
      web: "web",
      asv: "asv"
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
            text: `Unable to load ${name.toUpperCase()}`
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
          text: `Error loading ${name.toUpperCase()}`
        }];
      }
    });

    // Wait for all translations to complete
    const results = await Promise.all(fetchPromises);
    results.forEach(([name, data]) => {
      translationsData[name as string] = data;
    });

    // Get verse text for AI commentary (use first available translation)
    const verseText = translationsData.kjv?.text || translationsData.web?.text || translationsData.asv?.text || "";
    
    // Generate AI commentary
    let aiCommentary = null;
    if (verseText && !verseText.includes("Unable to load") && !verseText.includes("Error loading")) {
      const commentary = await generateAICommentary(normalizedReference, verseText);
      aiCommentary = {
        commentary,
        source: "GPT-4"
      };
    } else {
      aiCommentary = {
        commentary: "AI commentary unavailable - unable to load Bible text."
      };
    }

    // Create study links
    const studyLinks = {
      bibleHub: `https://biblehub.com/${normalizedReference.toLowerCase().replace(/\s+/g, '_').replace(/:/g, '-')}.htm`,
      blueLetterBible: `https://www.blueletterbible.org/search/search.cfm?Criteria=${encodeURIComponent(normalizedReference)}`,
      studyLight: `https://www.studylight.org/desk/?q=${encodeURIComponent(normalizedReference)}`
    };

    // Check if it's a chapter request (no verse number)
    const isChapter = !normalizedReference.includes(':');

    console.log("=== Response Ready ===");
    console.log("AI Commentary status:", aiCommentary ? "Generated" : "Failed");

    return NextResponse.json({
      reference: normalizedReference,
      parsed: {
        isChapter
      },
      translations: translationsData,
      commentaries: {
        ai: aiCommentary
      },
      studyLinks,
      isChapter,
      success: true
    });

  } catch (error: any) {
    console.error("Deep Study API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}