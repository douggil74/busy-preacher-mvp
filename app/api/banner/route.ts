import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const bannerFilePath = path.join(process.cwd(), 'data', 'banner.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Check if banner should be shown based on schedule
function isWithinSchedule(banner: any): boolean {
  if (!banner.active) return false;

  const now = new Date();

  // Check start time
  if (banner.startTime) {
    const startDate = new Date(banner.startTime);
    if (now < startDate) return false;
  }

  // Check end time
  if (banner.endTime) {
    const endDate = new Date(banner.endTime);
    if (now > endDate) return false;
  }

  return true;
}

// GET - Read current banner
export async function GET() {
  try {
    ensureDataDir();

    if (!fs.existsSync(bannerFilePath)) {
      return NextResponse.json({
        message: '',
        active: false,
        id: '',
        updatedAt: new Date().toISOString(),
      });
    }

    const data = fs.readFileSync(bannerFilePath, 'utf-8');
    const banner = JSON.parse(data);

    // Check if within schedule - override active status
    const isScheduleActive = isWithinSchedule(banner);

    return NextResponse.json({
      ...banner,
      active: isScheduleActive,
      // Also return the raw schedule data for admin display
      scheduledActive: banner.active,
    });
  } catch (error) {
    console.error('Error reading banner:', error);
    return NextResponse.json(
      { error: 'Failed to read banner' },
      { status: 500 }
    );
  }
}

// POST - Set banner
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, active, startTime, endTime } = body;

    ensureDataDir();

    const banner = {
      message: message || '',
      active: active !== undefined ? active : true,
      startTime: startTime || null, // ISO string or null
      endTime: endTime || null, // ISO string or null
      id: `banner_${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(bannerFilePath, JSON.stringify(banner, null, 2));

    return NextResponse.json({
      success: true,
      banner,
    });
  } catch (error) {
    console.error('Error setting banner:', error);
    return NextResponse.json(
      { error: 'Failed to set banner' },
      { status: 500 }
    );
  }
}
