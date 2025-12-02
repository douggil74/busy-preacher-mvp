"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Determine night/day at module level for instant render
const getIsNight = () => {
  if (typeof window === 'undefined') return false;
  const hour = new Date().getHours();
  return hour < 6 || hour >= 20;
};

export default function SplashPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');
  const isNight = getIsNight();

  useEffect(() => {
    // Prevent keyboard from appearing on iOS during splash
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // Check destination
    const hasCompletedOnboarding = localStorage.getItem("onboarding_completed") === "true";
    const destination = hasCompletedOnboarding ? "/home" : "/onboarding";

    // Smooth timing: fade in (0.8s) -> hold (2s) -> fade out (0.8s) -> navigate
    const holdTimer = setTimeout(() => setPhase('hold'), 200);
    const exitTimer = setTimeout(() => setPhase('exit'), 2800);
    const navTimer = setTimeout(() => router.push(destination), 3600);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(navTimer);
    };
  }, [router]);

  return (
    <main
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: isNight
          ? 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
          : 'linear-gradient(180deg, #7dd3fc 0%, #bae6fd 40%, #f0f9ff 100%)',
        pointerEvents: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        margin: 0,
        padding: 0,
      }}
    >
      {/* Background scene */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="sunGlow" cx="50%" cy="30%" r="40%">
              <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#FCD34D" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="moonGlow" cx="50%" cy="30%" r="35%">
              <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
            </radialGradient>
            <filter id="cloudBlur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
          </defs>

          {isNight ? (
            <>
              {/* Night sky with stars */}
              {[...Array(30)].map((_, i) => (
                <circle
                  key={i}
                  cx={20 + (i * 13) % 360}
                  cy={40 + (i * 47) % 300}
                  r={0.8 + (i % 3) * 0.5}
                  fill="#FEF3C7"
                  opacity={0.4 + (i % 4) * 0.15}
                  className="animate-twinkle"
                  style={{ animationDelay: `${i * 0.1}s`, animationDuration: `${2 + (i % 3)}s` }}
                />
              ))}

              {/* Crescent moon */}
              <circle cx="320" cy="120" r="60" fill="url(#moonGlow)" />
              <circle cx="320" cy="120" r="35" fill="#FEF9C3" />
              <circle cx="335" cy="115" r="30" fill="#0f172a" />
            </>
          ) : (
            <>
              {/* Daytime sun */}
              <circle cx="200" cy="100" r="120" fill="url(#sunGlow)" />
              <circle cx="200" cy="100" r="50" fill="#FDE68A" opacity="0.9" />
              <circle cx="200" cy="100" r="35" fill="#FEF3C7" />

              {/* Fluffy clouds */}
              {[
                { x: 50, y: 180, scale: 1 },
                { x: 280, y: 220, scale: 0.8 },
                { x: 150, y: 280, scale: 0.6 },
              ].map((cloud, i) => (
                <g key={i} transform={`translate(${cloud.x}, ${cloud.y}) scale(${cloud.scale})`} className="animate-drift" style={{ animationDelay: `${i * 2}s` }}>
                  <ellipse cx="0" cy="0" rx="50" ry="25" fill="#FFF" opacity="0.9" />
                  <ellipse cx="-30" cy="5" rx="35" ry="20" fill="#FFF" opacity="0.85" />
                  <ellipse cx="35" cy="5" rx="40" ry="22" fill="#FFF" opacity="0.85" />
                  <ellipse cx="10" cy="-10" rx="30" ry="18" fill="#FFF" opacity="0.9" />
                </g>
              ))}
            </>
          )}
        </svg>
      </div>

      {/* Logo and text container - absolutely centered */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: phase === 'enter'
            ? 'translate(-50%, -50%) scale(0.95)'
            : phase === 'hold'
            ? 'translate(-50%, -50%) scale(1)'
            : 'translate(-50%, -52%) scale(1.02)',
          opacity: phase === 'enter' ? 0.7 : phase === 'hold' ? 1 : 0,
          transition: 'all 0.8s ease-out',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        {/* Logo with glow */}
        <div className="relative mb-6">
          <div
            className="absolute inset-0 rounded-full blur-2xl"
            style={{
              background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)',
              transform: 'scale(1.8)',
            }}
          />
          <Image
            src="/logo.webp"
            alt="The Busy Christian"
            width={160}
            height={160}
            priority
            className="relative select-none"
            style={{
              filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.5))',
            }}
          />
        </div>

        {/* App name */}
        <h1
          className={`${playfair.className} text-center`}
          style={{
            color: isNight ? "#FEF3C7" : "#1e293b",
            letterSpacing: "0.03em",
            textShadow: isNight
              ? "0 2px 20px rgba(0,0,0,0.5)"
              : "0 2px 10px rgba(255,255,255,0.8)",
          }}
        >
          <span className="block text-lg font-normal opacity-70">the</span>
          <span className="block text-3xl font-bold -mt-1">Busy Christian</span>
        </h1>

        {/* Subtle loading dots */}
        <div className="mt-8 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full animate-pulse ${isNight ? 'bg-amber-200/60' : 'bg-slate-600/40'}`}
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.2); }
        }
        @keyframes drift {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(15px); }
        }
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        .animate-drift {
          animation: drift 8s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
