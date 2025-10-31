import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Sync received:', data);
    // future: send to Supabase or PocketBase
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Sync failed:', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
