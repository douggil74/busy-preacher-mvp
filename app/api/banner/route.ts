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

    return NextResponse.json(banner);
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
    const { message, active } = body;

    ensureDataDir();

    const banner = {
      message: message || '',
      active: active !== undefined ? active : true,
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
