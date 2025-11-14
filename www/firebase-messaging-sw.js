// public/firebase-messaging-sw.js
// Service Worker for Firebase Cloud Messaging (Push Notifications)

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// ⚠️ WARNING: These keys should match your .env.local file EXACTLY
// This is the CORRECTED config that matches your .env.local
firebase.initializeApp({
  apiKey: "AIzaSyDg5gmuadL8jX01gX9Ww3oxx-j4mpMDdOY",
  authDomain: "thebusychristian-app.firebaseapp.com",
  projectId: "thebusychristian-app",
  storageBucket: "thebusychristian-app.firebasestorage.app",
  messagingSenderId: "689195108551",
  appId: "1:689195108551:web:e90ce2cbf79db3ab5456e2"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message:', payload);

  const title = payload.notification?.title || 'New Prayer Request';
  const body  = payload.notification?.body  || 'Someone needs prayer';

  const options = {
    body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: payload.data?.type || 'prayer-notification',
    requireInteraction: true,
    data: { url: payload.data?.url || '/prayer', ...payload.data },
    actions: [
      { action: 'open', title: '🙏 View & Pray', icon: '/icons/pray-action.png' },
      { action: 'close', title: 'Close', icon: '/icons/close-action.png' }
    ]
  };

  // Show browser notification
  self.registration.showNotification(title, options);

  // 🔊 Try to play your MP3 sound immediately
  try {
    const audio = new Audio('/prayer-sound.mp3');
    audio.play().catch(() => {});
  } catch (err) {
    console.warn('Audio playback failed:', err);
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);
  event.notification.close();

  if (event.action === 'close') return;

  const urlToOpen = event.notification.data?.url || '/prayer';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(urlToOpen);
    })
  );

  // 🔊 Replay sound when user taps notification
  try {
    const audio = new Audio('/prayer-sound.mp3');
    audio.play().catch(() => {});
  } catch {}
});

// Fallback for generic push
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const payload = event.data.json();
    console.log('[firebase-messaging-sw.js] Push payload:', payload);
  } catch (error) {
    console.error('[firebase-messaging-sw.js] Push error:', error);
  }
});

self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Activated');
  event.waitUntil(clients.claim());
});

self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Installed');
  self.skipWaiting();
});

console.log('[firebase-messaging-sw.js] Ready and listening');