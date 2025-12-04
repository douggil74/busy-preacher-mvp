/**
 * Native Features Utility
 * Provides native iOS functionality via Capacitor
 */

import { isFromIOSApp } from './platform-detector';

// Types for haptic feedback
type ImpactStyle = 'heavy' | 'medium' | 'light';
type NotificationType = 'success' | 'warning' | 'error';

/**
 * Trigger haptic feedback on iOS
 * Falls back silently on web
 */
export async function triggerHaptic(type: 'impact' | 'notification' | 'selection' = 'impact', options?: {
  style?: ImpactStyle;
  notificationType?: NotificationType;
}): Promise<void> {
  if (!isFromIOSApp()) return;

  try {
    const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics');

    switch (type) {
      case 'impact':
        const impactStyle = options?.style || 'medium';
        await Haptics.impact({
          style: impactStyle === 'heavy' ? ImpactStyle.Heavy :
                 impactStyle === 'light' ? ImpactStyle.Light :
                 ImpactStyle.Medium
        });
        break;
      case 'notification':
        const notifType = options?.notificationType || 'success';
        await Haptics.notification({
          type: notifType === 'error' ? NotificationType.Error :
                notifType === 'warning' ? NotificationType.Warning :
                NotificationType.Success
        });
        break;
      case 'selection':
        await Haptics.selectionStart();
        await Haptics.selectionChanged();
        await Haptics.selectionEnd();
        break;
    }
  } catch (error) {
    console.debug('Haptics not available:', error);
  }
}

/**
 * Quick haptic feedback for button taps
 */
export async function hapticTap(): Promise<void> {
  return triggerHaptic('impact', { style: 'light' });
}

/**
 * Medium haptic feedback for important actions
 */
export async function hapticMedium(): Promise<void> {
  return triggerHaptic('impact', { style: 'medium' });
}

/**
 * Heavy haptic feedback for significant actions
 */
export async function hapticHeavy(): Promise<void> {
  return triggerHaptic('impact', { style: 'heavy' });
}

/**
 * Success haptic feedback
 */
export async function hapticSuccess(): Promise<void> {
  return triggerHaptic('notification', { notificationType: 'success' });
}

/**
 * Error haptic feedback
 */
export async function hapticError(): Promise<void> {
  return triggerHaptic('notification', { notificationType: 'error' });
}

/**
 * Selection changed haptic feedback
 */
export async function hapticSelection(): Promise<void> {
  return triggerHaptic('selection');
}

/**
 * Native share functionality
 */
export async function nativeShare(options: {
  title?: string;
  text?: string;
  url?: string;
  dialogTitle?: string;
}): Promise<boolean> {
  if (!isFromIOSApp()) {
    // Fallback to Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: options.title,
          text: options.text,
          url: options.url,
        });
        return true;
      } catch (error) {
        console.debug('Web share cancelled or failed:', error);
        return false;
      }
    }
    return false;
  }

  try {
    const { Share } = await import('@capacitor/share');
    await Share.share({
      title: options.title,
      text: options.text,
      url: options.url,
      dialogTitle: options.dialogTitle || 'Share',
    });
    return true;
  } catch (error) {
    console.debug('Native share failed:', error);
    return false;
  }
}

/**
 * Set status bar style (iOS only)
 */
export async function setStatusBarStyle(style: 'dark' | 'light'): Promise<void> {
  if (!isFromIOSApp()) return;

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({
      style: style === 'dark' ? Style.Dark : Style.Light
    });
  } catch (error) {
    console.debug('StatusBar not available:', error);
  }
}

/**
 * Hide/show status bar (iOS only)
 */
export async function setStatusBarVisible(visible: boolean): Promise<void> {
  if (!isFromIOSApp()) return;

  try {
    const { StatusBar } = await import('@capacitor/status-bar');
    if (visible) {
      await StatusBar.show();
    } else {
      await StatusBar.hide();
    }
  } catch (error) {
    console.debug('StatusBar not available:', error);
  }
}

/**
 * Open URL in native browser
 */
export async function openInBrowser(url: string): Promise<void> {
  if (!isFromIOSApp()) {
    window.open(url, '_blank');
    return;
  }

  try {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url });
  } catch (error) {
    console.debug('Browser plugin failed, falling back:', error);
    window.open(url, '_blank');
  }
}

/**
 * Check if app is in foreground
 */
export async function isAppActive(): Promise<boolean> {
  if (!isFromIOSApp()) return true;

  try {
    const { App } = await import('@capacitor/app');
    const state = await App.getState();
    return state.isActive;
  } catch (error) {
    return true;
  }
}

/**
 * Get app info (version, build, etc.)
 */
export async function getAppInfo(): Promise<{
  name: string;
  id: string;
  build: string;
  version: string;
} | null> {
  if (!isFromIOSApp()) return null;

  try {
    const { App } = await import('@capacitor/app');
    return await App.getInfo();
  } catch (error) {
    return null;
  }
}
