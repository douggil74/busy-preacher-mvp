// app/api/youtube-videos/route.ts

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const passage = searchParams.get('passage');

    if (!passage) {
      return NextResponse.json(
        { error: 'Passage parameter is required', videos: [], count: 0 },
        { status: 400 }
      );
    }

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

    if (!YOUTUBE_API_KEY) {
      console.error('YouTube API key is not configured in environment variables');
      return NextResponse.json(
        { 
          error: 'YouTube API key not configured',
          videos: [], 
          count: 0,
          passage 
        },
        { status: 200 }
      );
    }

    // Desiring God channel ID for more accurate results
    const DESIRING_GOD_CHANNEL_ID = 'UCFVsc0fL_wPV7vnLsk5LFjQ';

    // Parse passage for better search
    const bookChapter = passage.split(':')[0]; // e.g., "John 14" from "John 14:6"
    
    // Priority search queries - passage first, then teacher
    const queries = [
      `${passage} sermon`,
      `${passage} John Piper`,
      `${passage} Michael Heiser`,
      `${passage} David Jeremiah`,
      `${bookChapter} exposition`,
      `${passage} bible study`,
      `${passage} Voddie Baucham`,
    ];

    let allVideos: any[] = [];

    // First, try searching the Desiring God channel specifically
    try {
      const channelSearchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
      channelSearchUrl.searchParams.append('part', 'snippet');
      channelSearchUrl.searchParams.append('channelId', DESIRING_GOD_CHANNEL_ID);
      channelSearchUrl.searchParams.append('q', passage);
      channelSearchUrl.searchParams.append('type', 'video');
      channelSearchUrl.searchParams.append('maxResults', '10');
      channelSearchUrl.searchParams.append('order', 'relevance');
      channelSearchUrl.searchParams.append('key', YOUTUBE_API_KEY);

      const channelResponse = await fetch(channelSearchUrl.toString());
      
      if (channelResponse.ok) {
        const channelData = await channelResponse.json();
        if (channelData.items && Array.isArray(channelData.items)) {
          allVideos = [...channelData.items];
        }
      }
    } catch (error) {
      console.error('Error searching Desiring God channel:', error);
    }

    // If we don't have enough videos, do broader searches
    if (allVideos.length < 5) {
      for (const query of queries) {
        try {
          const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
          searchUrl.searchParams.append('part', 'snippet');
          searchUrl.searchParams.append('q', query);
          searchUrl.searchParams.append('type', 'video');
          searchUrl.searchParams.append('maxResults', '5');
          searchUrl.searchParams.append('videoDefinition', 'high');
          searchUrl.searchParams.append('order', 'relevance');
          searchUrl.searchParams.append('key', YOUTUBE_API_KEY);

          const response = await fetch(searchUrl.toString());
          
          if (response.ok) {
            const data = await response.json();
            if (data.items && Array.isArray(data.items)) {
              allVideos = [...allVideos, ...data.items];
            }
          }
        } catch (queryError) {
          console.error(`Failed to fetch for query "${query}":`, queryError);
        }
      }
    }

    // Filter for trusted Bible teaching channels
    const targetChannels = [
      'desiring god',
      'desiringgod',
      'john piper',
      'voddie baucham',
      'michael heiser',
      'dr. michael heiser',
      'the naked bible',
      'david jeremiah',
      'dr. david jeremiah',
      'turning point',
      'logos bible software',
      'ligonier',
      'gospel coalition',
      'tim keller',
      '9marks',
      'the master\'s seminary',
      'grace to you'
    ];

    const filteredVideos = allVideos.filter(video => {
      if (!video.snippet || !video.id || !video.id.videoId) return false;
      
      const channelTitle = (video.snippet.channelTitle || '').toLowerCase();
      const title = (video.snippet.title || '').toLowerCase();
      
      // Check if from trusted channel
      const isTrustedChannel = targetChannels.some(channel => 
        channelTitle.includes(channel)
      );

      // Check if title contains passage reference
      const passageWords = passage.toLowerCase().split(/[\s:]+/);
      const titleContainsPassage = passageWords.some(word => 
        word.length > 2 && title.includes(word)
      );
      
      return isTrustedChannel && (titleContainsPassage || title.includes('sermon') || title.includes('exposition'));
    });

    // Remove duplicates
    const uniqueVideos = Array.from(
      new Map(filteredVideos.map(v => [v.id.videoId, v])).values()
    );

    // Get video details (duration, views)
    if (uniqueVideos.length > 0) {
      try {
        const videoIds = uniqueVideos.slice(0, 15).map(v => v.id.videoId).join(',');
        const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
        detailsUrl.searchParams.append('part', 'contentDetails,statistics');
        detailsUrl.searchParams.append('id', videoIds);
        detailsUrl.searchParams.append('key', YOUTUBE_API_KEY);

        const detailsResponse = await fetch(detailsUrl.toString());
        
        if (detailsResponse.ok) {
          const detailsData = await detailsResponse.json();

          const videosWithDetails = uniqueVideos.slice(0, 15).map(video => {
            const details = detailsData.items?.find((d: any) => d.id === video.id.videoId);
            return {
              id: video.id.videoId,
              title: video.snippet.title || 'Untitled Video',
              description: video.snippet.description || '',
              channelTitle: video.snippet.channelTitle || '',
              publishedAt: video.snippet.publishedAt || new Date().toISOString(),
              thumbnail: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url || '',
              duration: details?.contentDetails?.duration || 'PT0M0S',
              viewCount: details?.statistics?.viewCount || '0',
            };
          });

          // Sort by relevance (combination of views and recency)
          const topVideos = videosWithDetails
            .filter(v => v.id && v.title)
            .sort((a, b) => {
              const viewsA = parseInt(a.viewCount) || 0;
              const viewsB = parseInt(b.viewCount) || 0;
              return viewsB - viewsA;
            })
            .slice(0, 5); // Return top 5 instead of just 2

          return NextResponse.json({
            passage,
            videos: topVideos,
            count: topVideos.length,
          });
        }
      } catch (detailsError) {
        console.error('Error fetching video details:', detailsError);
      }
    }

    // If no videos found, return empty array
    return NextResponse.json({
      passage,
      videos: [],
      count: 0,
    });

  } catch (error) {
    console.error('Error in youtube-videos API route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch videos',
        videos: [],
        count: 0,
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 200 }
    );
  }
}