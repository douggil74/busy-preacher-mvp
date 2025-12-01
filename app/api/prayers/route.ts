import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    // Get active prayers for moderation
    const snapshot = await adminDb.collection('prayer_requests')
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const prayers = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.userName || 'Anonymous',
        request: data.request || '',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        status: data.status || 'active',
        category: data.category,
        isAnonymous: data.isAnonymous,
        heartCount: data.heartCount || 0,
        flagCount: data.flagCount || 0,
        crisisDetected: data.crisisDetected || false,
      };
    });

    return NextResponse.json({ prayers });
  } catch (error: any) {
    console.error('Error fetching prayers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch prayers' },
      { status: 500 }
    );
  }
}
