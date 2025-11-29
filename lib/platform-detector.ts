/**
 * Platform Detection Utility
 * Detects if user is accessing from iOS app vs web browser
 */

export function isFromIOSApp(): boolean {
  if (typeof window === 'undefined') return false;

  // Check if running in Capacitor native app (NOT just if Capacitor JS is loaded)
  // @ts-ignore - Capacitor global
  const capacitor = window.Capacitor;

  // Capacitor.isNativePlatform() returns true ONLY when running in native iOS/Android
  // It returns false when running in a regular web browser, even if Capacitor JS is bundled
  const isNativeApp = capacitor?.isNativePlatform?.() === true;

  // Also check platform - 'ios' or 'android' means native, 'web' means browser
  const nativePlatform = capacitor?.getPlatform?.();
  const isNativePlatformByName = nativePlatform === 'ios' || nativePlatform === 'android';

  // Check user agent for custom app identifier
  const hasAppUserAgent =
    navigator.userAgent.includes('Capacitor') ||
    navigator.userAgent.includes('The Busy Christian App');

  // Check URL parameter (as backup)
  const urlParams = new URLSearchParams(window.location.search);
  const fromApp = urlParams.get('source') === 'ios-app';

  return isNativeApp || isNativePlatformByName || hasAppUserAgent || fromApp;
}

export function isPaidAppUser(): boolean {
  // With RevenueCat, iOS users don't pay upfront - they subscribe via in-app purchase
  // This now returns false, subscription status is checked via RevenueCat
  return false;
}

export function shouldShowPaywall(): boolean {
  // Web users see paywall, app users don't
  return !isPaidAppUser();
}

export function getPlatform(): 'ios-app' | 'web' {
  return isFromIOSApp() ? 'ios-app' : 'web';
}
