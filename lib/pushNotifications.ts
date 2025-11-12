/**
 * Push Notifications Service for iOS
 * Integrates Capacitor Push Notifications with Firebase Cloud Messaging
 */

import { PushNotifications, PushNotificationSchema, Token, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private token: string | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * Initialize push notifications
   * Call this on app startup
   */
  async initialize(): Promise<void> {
    if (!isNative || this.isInitialized) {
      console.log('Push notifications: Not native platform or already initialized');
      return;
    }

    try {
      // Request permission
      const permissionResult = await PushNotifications.requestPermissions();
      
      if (permissionResult.receive === 'granted') {
        // Register with Apple Push Notification service
        await PushNotifications.register();

        // Listen for registration success
        await PushNotifications.addListener('registration', (token: Token) => {
          console.log('Push registration success, token:', token.value);
          this.token = token.value;
          this.onTokenReceived(token.value);
        });

        // Listen for registration errors
        await PushNotifications.addListener('registrationError', (error: any) => {
          console.error('Push registration error:', error);
        });

        // Listen for push notifications received while app is in foreground
        await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
          console.log('Push notification received:', notification);
          this.onNotificationReceived(notification);
        });

        // Listen for notification actions (user tapped notification)
        await PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
          console.log('Push notification action performed:', notification);
          this.onNotificationOpened(notification);
        });

        this.isInitialized = true;
        console.log('Push notifications initialized successfully');
      } else {
        console.log('Push notification permission not granted');
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  /**
   * Get current FCM token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Check if notifications are enabled
   */
  async checkPermissions(): Promise<boolean> {
    if (!isNative) return false;
    
    const permissionResult = await PushNotifications.checkPermissions();
    return permissionResult.receive === 'granted';
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (!isNative) return false;

    const permissionResult = await PushNotifications.requestPermissions();
    return permissionResult.receive === 'granted';
  }

  /**
   * Get list of delivered notifications
   */
  async getDeliveredNotifications(): Promise<PushNotificationSchema[]> {
    if (!isNative) return [];

    const result = await PushNotifications.getDeliveredNotifications();
    return result.notifications;
  }

  /**
   * Remove specific delivered notifications
   */
  async removeDeliveredNotifications(ids: string[]): Promise<void> {
    if (!isNative) return;

    await PushNotifications.removeDeliveredNotifications({
      notifications: ids.map(id => ({ id }))
    });
  }

  /**
   * Remove all delivered notifications
   */
  async removeAllDeliveredNotifications(): Promise<void> {
    if (!isNative) return;

    await PushNotifications.removeAllDeliveredNotifications();
  }

  /**
   * Called when FCM token is received
   * Override this or add your own handler to send token to your backend
   */
  private async onTokenReceived(token: string): Promise<void> {
    console.log('FCM Token received:', token);
    
    // TODO: Send token to your backend server
    // Example: await sendTokenToServer(token);
    
    // You can also store it in Firebase Firestore for the user
    try {
      // Store token in localStorage/preferences for later use
      const storage = (await import('./storage')).default;
      await storage.setItem('fcm-token', token);
    } catch (error) {
      console.error('Error storing FCM token:', error);
    }
  }

  /**
   * Called when notification is received while app is in foreground
   */
  private onNotificationReceived(notification: PushNotificationSchema): void {
    console.log('Notification received in foreground:', notification);
    
    // You can show a custom in-app notification here
    // or update your app's state based on the notification
  }

  /**
   * Called when user taps on a notification
   */
  private onNotificationOpened(notification: ActionPerformed): void {
    console.log('Notification opened:', notification);
    
    // Handle navigation based on notification data
    const data = notification.notification.data;
    
    if (data?.route) {
      // Navigate to specific route
      console.log('Navigate to:', data.route);
      // window.location.href = data.route;
    }
  }

  /**
   * Clean up listeners (call on app shutdown)
   */
  async cleanup(): Promise<void> {
    if (!isNative) return;

    await PushNotifications.removeAllListeners();
    this.isInitialized = false;
  }
}

// Export singleton instance
export const pushNotificationService = PushNotificationService.getInstance();

// Export convenience functions
export const initializePushNotifications = () => pushNotificationService.initialize();
export const getPushToken = () => pushNotificationService.getToken();
export const checkNotificationPermissions = () => pushNotificationService.checkPermissions();
export const requestNotificationPermissions = () => pushNotificationService.requestPermissions();
