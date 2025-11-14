"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Always show the animated web splash page with glow effects
    router.replace("/splash");
  }, [router]);

  // Show dark background immediately while redirecting (no white flash)
  return (
    <div style={{
      backgroundColor: '#0f1729',
      width: '100vw',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0
    }} />
  );
}
