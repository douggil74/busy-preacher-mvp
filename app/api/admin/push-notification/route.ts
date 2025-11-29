/**
 * Admin Push Notification API
 * Sends push notifications to all registered iOS devices
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminMessaging } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { title, body, data } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    // Get all FCM tokens from Firestore
    const tokensSnapshot = await adminDb.collection('fcm_tokens')
      .where('enabled', '==', true)
      .get();

    if (tokensSnapshot.empty) {
      return NextResponse.json({
        success: true,
        message: 'No devices registered for notifications',
        sent: 0,
        failed: 0,
      });
    }

    const tokens: string[] = [];
    tokensSnapshot.forEach(doc => {
      const tokenData = doc.data();
      if (tokenData.token) {
        tokens.push(tokenData.token);
      }
    });

    if (tokens.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No valid tokens found',
        sent: 0,
        failed: 0,
      });
    }

    // Send to all tokens using sendEachForMulticast
    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      tokens,
      apns: {
        payload: {
          aps: {
            alert: {
              title,
              body,
            },
            badge: 1,
            sound: 'default',
          },
        },
      },
    };

    const response = await adminMessaging.sendEachForMulticast(message);

    // Remove invalid tokens
    const invalidTokens: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const errorCode = resp.error?.code;
        if (
          errorCode === 'messaging/invalid-registration-token' ||
          errorCode === 'messaging/registration-token-not-registered'
        ) {
          invalidTokens.push(tokens[idx]);
        }
      }
    });

    // Clean up invalid tokens
    if (invalidTokens.length > 0) {
      const batch = adminDb.batch();
      const invalidTokensSnapshot = await adminDb.collection('fcm_tokens')
        .where('token', 'in', invalidTokens.slice(0, 10)) // Firestore limits 'in' to 10
        .get();

      invalidTokensSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    }

    // Log the notification
    await adminDb.collection('notification_logs').add({
      title,
      body,
      data: data || {},
      sentAt: new Date().toISOString(),
      totalTokens: tokens.length,
      successCount: response.successCount,
      failureCount: response.failureCount,
      invalidTokensRemoved: invalidTokens.length,
    });

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${response.successCount} device(s)`,
      sent: response.successCount,
      failed: response.failureCount,
      invalidRemoved: invalidTokens.length,
    });

  } catch (error: any) {
    console.error('Push notification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send notification' },
      { status: 500 }
    );
  }
}

// GET - Get notification stats and recent logs
export async function GET() {
  try {
    // Count registered devices
    const tokensSnapshot = await adminDb.collection('fcm_tokens')
      .where('enabled', '==', true)
      .get();

    // Get recent notification logs
    const logsSnapshot = await adminDb.collection('notification_logs')
      .orderBy('sentAt', 'desc')
      .limit(5)
      .get();

    const logs: any[] = [];
    logsSnapshot.forEach(doc => {
      logs.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json({
      registeredDevices: tokensSnapshot.size,
      recentNotifications: logs,
    });

  } catch (error: any) {
    console.error('Error getting notification stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get stats' },
      { status: 500 }
    );
  }
}
