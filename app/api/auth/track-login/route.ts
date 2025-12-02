/**
 * Track Login API
 * Captures IP address and location data on user login
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

interface GeoData {
  city?: string;
  region?: string;
  country?: string;
}

async function getGeoLocation(ip: string): Promise<GeoData> {
  // Skip for localhost/private IPs
  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return { city: 'Local', region: 'Development', country: 'Local' };
  }

  try {
    // Use free ip-api.com service (no API key needed, 45 requests/minute limit)
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=city,regionName,country`);
    if (res.ok) {
      const data = await res.json();
      return {
        city: data.city || '',
        region: data.regionName || '',
        country: data.country || '',
      };
    }
  } catch (error) {
    console.error('Geo lookup failed:', error);
  }

  return {};
}

export async function POST(req: NextRequest) {
  try {
    const { userId, platform } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get IP from headers (works with Vercel and most proxies)
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';

    // Get geolocation
    const geo = await getGeoLocation(ip);
    const locationString = [geo.city, geo.region, geo.country].filter(Boolean).join(', ');

    // Get device/platform info from user-agent
    const userAgent = req.headers.get('user-agent') || '';
    let detectedPlatform = platform || 'web';

    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      detectedPlatform = 'iOS';
    } else if (userAgent.includes('Android')) {
      detectedPlatform = 'Android';
    } else if (userAgent.includes('Mac')) {
      detectedPlatform = 'Mac';
    } else if (userAgent.includes('Windows')) {
      detectedPlatform = 'Windows';
    }

    // Update user document
    const userRef = adminDb.collection('users').doc(userId);
    await userRef.set(
      {
        lastLoginAt: new Date(),
        lastLoginIP: ip,
        lastLoginLocation: locationString || null,
        platform: detectedPlatform,
        deviceInfo: userAgent.substring(0, 200), // Truncate long user agents
      },
      { merge: true }
    );

    return NextResponse.json({ success: true, ip, location: locationString });
  } catch (error) {
    console.error('Error tracking login:', error);
    return NextResponse.json({ error: 'Failed to track login' }, { status: 500 });
  }
}
