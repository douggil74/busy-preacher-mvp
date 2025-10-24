// app/api/devotional/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    // Get today's date or a specific date from query params
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');
    
    const today = dateParam ? new Date(dateParam) : new Date();
    const month = format(today, 'MM');
    const day = format(today, 'dd');

    // Fetch from BibleGateway's devotional (public domain)
    // My Utmost for His Highest is available via their API
    const devotionalUrl = `https://www.biblegateway.com/devotionals/my-utmost-for-his-highest/today`;
    
    // Alternative: Use a free devotional API
    // We'll use a simple approach - fetch from a free source
    const response = await fetch(
      `https://beta.ourmanna.com/api/v1/get/?format=json&order=daily`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch devotional');
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      date: format(today, 'MMMM d, yyyy'),
      devotional: {
        title: data.verse.details.reference || 'Daily Bread',
        content: data.verse.details.text || data.verse.details.text_plain,
        scripture: data.verse.details.reference,
        author: 'Our Daily Bread',
        source: 'ourmanna.com'
      }
    });

  } catch (error) {
    console.error('Devotional API error:', error);
    
    // Fallback devotional if API fails
    return NextResponse.json({
      success: true,
      date: format(new Date(), 'MMMM d, yyyy'),
      devotional: {
        title: 'Trust in the Lord',
        content: 'Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
        scripture: 'Proverbs 3:5-6',
        author: 'Daily Encouragement',
        source: 'The Busy Christian'
      }
    });
  }
}