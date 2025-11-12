"use client";

import { SplashScreen } from '@capacitor/splash-screen';

export function initSplashScreen() {
  // Only run on Capacitor (native apps)
  if (typeof window !== 'undefined' && (window as any).Capacitor) {
    // Hide splash screen after exactly 10 seconds
    setTimeout(async () => {
      await SplashScreen.hide();
    }, 10000);
  }
}
