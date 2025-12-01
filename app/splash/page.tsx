"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Playfair_Display, Pacifico } from "next/font/google";

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const pacifico = Pacifico({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
});

// Add keyframes for animations
const glowKeyframes = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes logoFadeIn {
    0% {
      opacity: 0;
      transform: scale(0.95);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes logoFadeOut {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(1.05);
    }
  }

  @keyframes fadeOutZoom {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(1.3);
    }
  }
`;

export default function SplashPage() {
  const router = useRouter();
  const [visible, setVisible] = useState(true);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // Prevent keyboard from appearing on iOS during splash
    const preventKeyboard = () => {
      // Blur any focused input
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      // Disable all inputs temporarily
      document.querySelectorAll('input, textarea').forEach((el) => {
        (el as HTMLInputElement).readOnly = true;
      });
    };

    preventKeyboard();
    const keyboardInterval = setInterval(preventKeyboard, 100);

    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem("onboarding_completed") === "true";
    const destination = hasCompletedOnboarding ? "/home" : "/onboarding";

    const textTimer = setTimeout(() => setShowText(true), 200);  // Faster text appear
    const fadeTimer = setTimeout(() => setVisible(false), 2800);
    const navTimer = setTimeout(() => router.push(destination), 4200);

    return () => {
      clearInterval(keyboardInterval);
      clearTimeout(textTimer);
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [router]);

  return (
    <>
      <style>{glowKeyframes}</style>
      <main
        className="flex flex-col items-center justify-center"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: "#0f1729",
          color: "white",
          overflow: "hidden",
          margin: 0,
          padding: 0,
          animation: visible
            ? 'fadeIn 0.6s ease-out forwards'
            : 'fadeOutZoom 1.5s ease-in-out forwards',
          pointerEvents: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
        }}
      >
      <div
        className="flex flex-col items-center justify-center"
        style={{
          textAlign: "center",
        }}
      >
        <div
          style={{
            animation: visible
              ? 'logoFadeIn 1.2s ease-out forwards'
              : 'logoFadeOut 1.5s ease-in-out forwards',
            marginBottom: '1.5rem',
            filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.4)) drop-shadow(0 0 60px rgba(255, 215, 0, 0.2))',
          }}
        >
          <Image
            src="/logo.webp"
            alt="The Busy Christian"
            width={200}
            height={200}
            priority
            className="select-none"
            style={{ display: 'block' }}
          />
        </div>

        <h1
          className={`${playfair.className} text-2xl font-bold text-center transition-opacity duration-700 ${
            showText ? "opacity-100" : "opacity-0"
          }`}
          style={{
            color: "white",
            letterSpacing: "0.05em",
            textShadow: "0 0 10px rgba(255,255,255,0.25)",
            fontWeight: 700,
          }}
        >
          <span style={{ fontSize: '0.7em', fontWeight: 400 }}>the</span> Busy Christian
        </h1>
      </div>
    </main>
    </>
  );
}
