// app/api/admin/toasts/route.ts
// CRUD API for managing in-app toast messages
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  icon: string;
  trigger: 'welcome_back' | 'streak' | 'milestone' | 'encouragement' | 'random';
  triggerValue?: number; // e.g., streak days, milestone count
  isActive: boolean;
  position: 'top' | 'bottom';
  style: 'minimal' | 'card' | 'glass';
  showChance?: number; // 0-100 for random toasts
  createdAt: string;
  updatedAt: string;
}

// GET - Fetch all toast messages
export async function GET() {
  try {
    const snapshot = await adminDb.collection('toastMessages').orderBy('createdAt', 'desc').get();
    const toasts: ToastMessage[] = [];

    snapshot.forEach((doc) => {
      toasts.push({ id: doc.id, ...doc.data() } as ToastMessage);
    });

    return NextResponse.json({ toasts });
  } catch (error) {
    console.error('Error fetching toasts:', error);
    return NextResponse.json({ error: 'Failed to fetch toasts' }, { status: 500 });
  }
}

// POST - Create a new toast message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const toast: Omit<ToastMessage, 'id'> = {
      title: body.title || 'New Message',
      message: body.message || '',
      icon: body.icon || '💬',
      trigger: body.trigger || 'encouragement',
      triggerValue: body.triggerValue,
      isActive: body.isActive ?? true,
      position: body.position || 'bottom',
      style: body.style || 'card',
      showChance: body.showChance ?? 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection('toastMessages').add(toast);

    return NextResponse.json({
      success: true,
      toast: { id: docRef.id, ...toast }
    });
  } catch (error) {
    console.error('Error creating toast:', error);
    return NextResponse.json({ error: 'Failed to create toast' }, { status: 500 });
  }
}

// PUT - Update a toast message
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Toast ID required' }, { status: 400 });
    }

    updates.updatedAt = new Date().toISOString();

    await adminDb.collection('toastMessages').doc(id).update(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating toast:', error);
    return NextResponse.json({ error: 'Failed to update toast' }, { status: 500 });
  }
}

// DELETE - Remove a toast message
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Toast ID required' }, { status: 400 });
    }

    await adminDb.collection('toastMessages').doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting toast:', error);
    return NextResponse.json({ error: 'Failed to delete toast' }, { status: 500 });
  }
}
