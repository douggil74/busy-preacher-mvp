/**
 * Platform Detection Utility
 * Detects if user is accessing from iOS app vs web browser
 */

export function isFromIOSApp(): boolean {
  if (typeof window === 'undefined') return false;

  // Check if running in Capacitor (iOS app)
  const isCapacitor =
    // @ts-ignore - Capacitor global
    typeof window.Capacitor !== 'undefined' ||
    navigator.userAgent.includes('Capacitor') ||
    navigator.userAgent.includes('The Busy Christian App');

  // Check URL parameter (as backup)
  const urlParams = new URLSearchParams(window.location.search);
  const fromApp = urlParams.get('source') === 'ios-app';

  return isCapacitor || fromApp;
}

export function isPaidAppUser(): boolean {
  // iOS app users paid $2.99 upfront, so they get full access
  return isFromIOSApp();
}

export function shouldShowPaywall(): boolean {
  // Web users see paywall, app users don't
  return !isPaidAppUser();
}

export function getPlatform(): 'ios-app' | 'web' {
  return isFromIOSApp() ? 'ios-app' : 'web';
}
