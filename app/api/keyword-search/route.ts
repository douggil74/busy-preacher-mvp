// app/api/keyword-search/route.ts
import { NextRequest, NextResponse } from "next/server";

const ESV_API_KEY = process.env.ESV_API_KEY;
const ESV_API_URL = "https://api.esv.org/v3/passage/search/";

export async function POST(req: NextRequest) {
  try {
    const { keyword } = await req.json();

    if (!keyword || typeof keyword !== "string") {
      return NextResponse.json(
        { error: "Keyword is required" },
        { status: 400 }
      );
    }

    if (!ESV_API_KEY) {
      return NextResponse.json(
        { error: "ESV API key not configured" },
        { status: 500 }
      );
    }

    // Search ESV API for keyword
    const response = await fetch(
      `${ESV_API_URL}?q=${encodeURIComponent(keyword)}&page-size=20`,
      {
        headers: {
          Authorization: `Token ${ESV_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to search ESV API");
    }

    const data = await response.json();
    
    // Format results
    const results = data.results?.map((result: any) => ({
      reference: result.reference,
      preview: result.content
        ? result.content.substring(0, 150).replace(/\s+/g, ' ').trim() + "..."
        : "No preview available",
    })) || [];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Keyword search error:", error);
    return NextResponse.json(
      { error: "Failed to search Scripture" },
      { status: 500 }
    );
  }
}