"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Check if running in Capacitor (iOS/Android native app)
    const isCapacitor = typeof window !== 'undefined' &&
      (window as any).Capacitor !== undefined;

    if (isCapacitor) {
      // Native app already has splash screen, go straight to home
      router.replace("/home");
    } else {
      // Web browser, show web splash page
      router.replace("/splash");
    }
  }, [router]);

  return null;
}
