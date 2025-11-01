// public/firebase-messaging-sw.js
// Service Worker for Firebase Cloud Messaging (Push Notifications)

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in service worker
// IMPORTANT: Replace these with your actual Firebase config values

firebase.initializeApp({
  apiKey: "AIzaSyDg5gmuadL8jX0lgX9Ww3oxx-j4mpMUdOY",
  authDomain: "thebusychristian-app.firebaseapp.com",
  projectId: "thebusychristian-app",
  storageBucket: "thebusychristian-app.firebasestorage.app",
  messagingSenderId: "689195108551",
  appId: "1:689195108551:web:e90ce2cbf79db3ab5456e2"
});
const messaging = firebase.messaging();

// Handle background messages (when app is not in focus)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  // Extract notification data
  const notificationTitle = payload.notification?.title || 'New Prayer Request';
  const notificationOptions = {
    body: payload.notification?.body || 'Someone needs prayer',
    icon: '/icon-192x192.png', // Your app icon (add to public folder)
    badge: '/badge-72x72.png',   // Small badge icon (add to public folder)
    tag: payload.data?.type || 'prayer-notification',
    requireInteraction: true, // Keeps notification visible until user interacts
    data: {
      url: payload.data?.url || '/prayer',
      ...payload.data
    },
    actions: [
      {
        action: 'open',
        title: '🙏 View & Pray',
        icon: '/icons/pray-action.png' // Optional action icon
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/close-action.png' // Optional action icon
      }
    ]
  };

  // Show the notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);

  event.notification.close();

  // Handle different actions
  if (event.action === 'close') {
    // User clicked "Close" - do nothing
    return;
  }

  // Default action or "open" action
  const urlToOpen = event.notification.data?.url || '/prayer';

  // Open the app or focus existing window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        // If not open, open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle push event (alternative to onBackgroundMessage)
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Push event received:', event);

  if (!event.data) {
    console.log('[firebase-messaging-sw.js] Push event has no data');
    return;
  }

  try {
    const payload = event.data.json();
    console.log('[firebase-messaging-sw.js] Push payload:', payload);

    // Let onBackgroundMessage handle it
    // This event listener is here as a fallback
  } catch (error) {
    console.error('[firebase-messaging-sw.js] Error parsing push data:', error);
  }
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker activated');
  event.waitUntil(clients.claim());
});

// Handle service worker installation
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker installed');
  self.skipWaiting();
});

// Log when service worker is ready
console.log('[firebase-messaging-sw.js] Service Worker script loaded');