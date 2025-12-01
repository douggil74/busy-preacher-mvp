import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Prayer ID required' }, { status: 400 });
    }

    // Map approve/reject to active/hidden
    let newStatus = status;
    if (status === 'approved') {
      newStatus = 'active';
    } else if (status === 'rejected') {
      newStatus = 'hidden';
    }

    await adminDb.collection('prayer_requests').doc(id).update({
      status: newStatus,
      needsModeration: false,
      moderatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating prayer:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update prayer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Prayer ID required' }, { status: 400 });
    }

    await adminDb.collection('prayer_requests').doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting prayer:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete prayer' },
      { status: 500 }
    );
  }
}
