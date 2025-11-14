"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

// Add keyframes for glow animation - MORE INTENSE
const glowKeyframes = `
  @keyframes glow {
    0%, 100% {
      filter: drop-shadow(0 0 30px rgba(255,215,0,0.8))
              drop-shadow(0 0 60px rgba(255,215,0,0.6))
              drop-shadow(0 0 90px rgba(255,215,0,0.4))
              drop-shadow(0 0 120px rgba(255,215,0,0.2));
    }
    50% {
      filter: drop-shadow(0 0 50px rgba(255,215,0,1))
              drop-shadow(0 0 80px rgba(255,215,0,0.8))
              drop-shadow(0 0 120px rgba(255,215,0,0.6))
              drop-shadow(0 0 160px rgba(255,215,0,0.4));
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
  const [checked, setChecked] = useState(false);
  const [visible, setVisible] = useState(true);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("splash-shown");
    if (seen) {
      router.replace("/home");
      return;
    }

    sessionStorage.setItem("splash-shown", "true");
    setChecked(true);

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

    const textTimer = setTimeout(() => setShowText(true), 400);
    const fadeTimer = setTimeout(() => setVisible(false), 3000);
    const navTimer = setTimeout(() => router.push("/home"), 4500);

    return () => {
      clearInterval(keyboardInterval);
      clearTimeout(textTimer);
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [router]);

  if (!checked) return null;

  return (
    <>
      <style>{glowKeyframes}</style>
      <main
        className={`flex flex-col items-center justify-center h-[100svh] w-full ${playfair.className}`}
        style={{
          backgroundColor: "#0f1729",
          color: "white",
          overflow: "hidden",
          margin: 0,
          padding: 0,
          animation: visible ? 'none' : 'fadeOutZoom 1.5s ease-in-out forwards',
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
        <h2
          className={`text-3xl font-semibold mb-8 text-center transition-opacity duration-700 ${
            showText ? "opacity-100" : "opacity-0"
          }`}
          style={{
            color: "#FFD700",
            letterSpacing: "0.05em",
            textShadow: "0 0 10px rgba(255,215,0,0.25)",
          }}
        >
          Welcome to the
        </h2>

        <div
          style={{
            animation: visible ? 'glow 1.5s ease-in-out infinite' : 'none',
            transition: 'all 1.5s ease-in-out',
          }}
        >
          <Image
            src="/logo.webp"
            alt="The Busy Christian"
            width={240}
            height={240}
            priority
            className="select-none"
            style={{
              transition: "transform 1.5s ease-in-out",
              transform: visible ? "scale(1) rotate(0deg)" : "scale(1.3) rotate(8deg)",
            }}
          />
        </div>

        <h1
          className={`text-2xl font-semibold mt-6 text-center transition-opacity duration-700 ${
            showText ? "opacity-100" : "opacity-0"
          }`}
          style={{
            color: "white",
            letterSpacing: "0.05em",
            textShadow: "0 0 10px rgba(255,255,255,0.25)",
          }}
        >
          The Busy Christian
        </h1>
      </div>
    </main>
    </>
  );
}
