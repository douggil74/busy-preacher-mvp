'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Weather types + holiday themes
type SceneType =
  | 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy' | 'snowy'
  | 'night-clear' | 'night-cloudy' | 'tornado' | 'hurricane' | 'foggy'
  | 'christmas' | 'thanksgiving' | 'easter' | 'new-years' | 'valentines';

interface SceneSettings {
  disabledScenes: SceneType[];
  customOverride: {
    enabled: boolean;
    sceneId: SceneType | null;
    expiresAt: string | null;
    customPrompt: string | null;
  };
}

// Check if today is a holiday
function getHoliday(): SceneType | null {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  // Christmas: Dec 20-26
  if (month === 12 && day >= 20 && day <= 26) return 'christmas';
  // Thanksgiving: 4th Thursday of November (approx Nov 22-28)
  if (month === 11 && day >= 22 && day <= 28) return 'thanksgiving';
  // Easter: Check if within Easter week (simplified - late March/April)
  // New Years: Dec 31 - Jan 2
  if ((month === 12 && day === 31) || (month === 1 && day <= 2)) return 'new-years';
  // Valentine's Day: Feb 13-14
  if (month === 2 && (day === 13 || day === 14)) return 'valentines';
  // Easter: approximate - April 1-20 for simplicity
  if (month === 4 && day >= 1 && day <= 20) return 'easter';

  return null;
}

export default function WeatherHeader() {
  const [scene, setScene] = useState<SceneType>('partly-cloudy');
  const [mounted, setMounted] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    setMounted(true);

    const determineScene = async () => {
      // First, check for admin overrides
      let settings: SceneSettings | null = null;
      try {
        const docRef = doc(db, 'settings', 'scenes');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          settings = docSnap.data() as SceneSettings;
        }
      } catch (err) {
        console.log('No scene settings found, using defaults');
      }

      // Check for active override
      if (settings?.customOverride?.enabled &&
          settings.customOverride.sceneId &&
          settings.customOverride.expiresAt &&
          new Date(settings.customOverride.expiresAt) > new Date()) {
        setScene(settings.customOverride.sceneId);
        setDebugInfo(`Override: ${settings.customOverride.sceneId}`);
        return;
      }

      // Check for holiday (if not disabled)
      const holiday = getHoliday();
      if (holiday && !settings?.disabledScenes?.includes(holiday)) {
        setScene(holiday);
        setDebugInfo(`Holiday: ${holiday}`);
        return;
      }

      // Fetch weather
      try {
        const geoRes = await fetch('https://ipapi.co/json/');
        const geoData = await geoRes.json();

        if (geoData.latitude && geoData.longitude) {
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${geoData.latitude}&longitude=${geoData.longitude}&current=weather_code,is_day`
          );
          const weatherData = await weatherRes.json();

          const code = weatherData.current?.weather_code || 0;
          const isDay = weatherData.current?.is_day === 1;

          let type: SceneType = 'partly-cloudy';

          // WMO Weather interpretation codes
          if (!isDay) {
            if (code >= 95) type = 'stormy';
            else if (code <= 3) type = 'night-clear';
            else type = 'night-cloudy';
          } else if (code === 0) {
            type = 'sunny';
          } else if (code <= 3) {
            type = 'partly-cloudy';
          } else if (code >= 45 && code <= 48) {
            type = 'foggy';
          } else if (code <= 48) {
            type = 'cloudy';
          } else if (code <= 67 || (code >= 80 && code <= 82)) {
            type = 'rainy';
          } else if (code >= 95 && code <= 99) {
            type = 'stormy';
          } else if (code >= 71 && code <= 77) {
            type = 'snowy';
          }

          // Check if this scene is disabled
          if (settings?.disabledScenes?.includes(type)) {
            type = 'partly-cloudy'; // Fallback
            setDebugInfo(`Disabled ${type}, using fallback`);
          } else {
            setDebugInfo(`Weather code: ${code}, isDay: ${isDay}, type: ${type}`);
          }

          setScene(type);
        }
      } catch (err) {
        const hour = new Date().getHours();
        const fallback = hour < 6 || hour >= 20 ? 'night-clear' : 'partly-cloudy';
        setScene(fallback);
        setDebugInfo(`Fallback: ${fallback} (hour: ${hour})`);
      }
    };

    determineScene();
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none rounded-t-2xl"
      style={{ backgroundColor: 'var(--card-bg)' }}
    >
      {/* DEBUG: Weather state indicator - REMOVE IN PRODUCTION */}
      <div className="absolute top-2 left-2 z-50 px-2 py-1 bg-black/50 rounded text-xs text-white/70">
        {scene} {debugInfo && `(${debugInfo})`}
      </div>

      {/* Weather scene */}
      <div className="absolute inset-0">
        <WeatherScene type={scene} />
      </div>

      {/* Gradient fade overlay - fades into card background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, transparent 50%, var(--card-bg) 100%)'
        }}
      />
    </div>
  );
}

// Export for admin preview page
export { WeatherScene };
export type { SceneType };

function WeatherScene({ type }: { type: SceneType }) {
  return (
    <svg
      className="w-full h-full"
      viewBox="0 0 800 200"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {/* Sophisticated gradients */}
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE082" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#FFB300" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FF8F00" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF8E1" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#FFE082" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FFD54F" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="skyDay" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4FC3F7" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#81D4FA" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="skyNight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1A237E" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#311B92" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="skyStormy" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#37474F" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#263238" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ECEFF1" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#B0BEC5" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="darkCloudGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#546E7A" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#37474F" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="christmasTree" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2E7D32" />
          <stop offset="100%" stopColor="#1B5E20" />
        </linearGradient>
        <linearGradient id="easterSunrise" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#FF8A65" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#FFCC80" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FFF8E1" stopOpacity="0.1" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter id="heavyBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      {/* === SUNNY === */}
      {type === 'sunny' && (
        <g>
          {/* Sky gradient */}
          <rect width="800" height="200" fill="url(#skyDay)" />

          {/* Distant clouds catching light */}
          <ellipse cx="100" cy="140" rx="120" ry="30" fill="#FFF" opacity="0.15" filter="url(#heavyBlur)" />
          <ellipse cx="600" cy="150" rx="150" ry="35" fill="#FFF" opacity="0.12" filter="url(#heavyBlur)" />

          {/* Sun with realistic glow */}
          <circle cx="680" cy="60" r="80" fill="url(#sunGlow)" />
          <circle cx="680" cy="60" r="45" fill="#FFE082" opacity="0.6" />
          <circle cx="680" cy="60" r="35" fill="#FFD54F" opacity="0.8" />
          <circle cx="680" cy="60" r="28" fill="#FFCA28" />

          {/* Sun rays with depth */}
          <g className="animate-spin-slow" style={{ transformOrigin: '680px 60px' }}>
            {[...Array(12)].map((_, i) => (
              <line
                key={i}
                x1="680" y1="-10"
                x2="680" y2="20"
                stroke="#FFD54F"
                strokeWidth={4 - (i % 3)}
                strokeLinecap="round"
                opacity={0.4 + (i % 3) * 0.15}
                transform={`rotate(${i * 30} 680 60)`}
              />
            ))}
          </g>

          {/* Soft light clouds */}
          <g className="animate-drift" style={{ animationDelay: '0s' }}>
            <ellipse cx="150" cy="80" rx="80" ry="25" fill="url(#cloudGradient)" opacity="0.4" />
            <ellipse cx="120" cy="75" rx="50" ry="20" fill="#FFF" opacity="0.5" />
          </g>
          <g className="animate-drift" style={{ animationDelay: '3s' }}>
            <ellipse cx="450" cy="100" rx="60" ry="18" fill="url(#cloudGradient)" opacity="0.35" />
          </g>
        </g>
      )}

      {/* === PARTLY CLOUDY === */}
      {type === 'partly-cloudy' && (
        <g>
          <rect width="800" height="200" fill="url(#skyDay)" />

          {/* Sun behind clouds */}
          <circle cx="650" cy="50" r="60" fill="url(#sunGlow)" />
          <circle cx="650" cy="50" r="30" fill="#FFCA28" opacity="0.9" />

          {/* Layered cumulus clouds with depth */}
          <g className="animate-drift-slow" style={{ animationDelay: '0s' }}>
            {/* Back cloud layer */}
            <ellipse cx="200" cy="90" rx="130" ry="45" fill="#B0BEC5" opacity="0.6" />
            {/* Main cloud body */}
            <ellipse cx="180" cy="80" rx="100" ry="40" fill="url(#cloudGradient)" />
            <ellipse cx="230" cy="75" rx="70" ry="35" fill="#ECEFF1" />
            <ellipse cx="150" cy="85" rx="60" ry="30" fill="#FFF" opacity="0.9" />
            {/* Highlight */}
            <ellipse cx="200" cy="65" rx="40" ry="15" fill="#FFF" opacity="0.7" />
          </g>

          <g className="animate-drift-slow" style={{ animationDelay: '2s' }}>
            <ellipse cx="500" cy="70" rx="110" ry="40" fill="#B0BEC5" opacity="0.5" />
            <ellipse cx="480" cy="60" rx="90" ry="35" fill="url(#cloudGradient)" />
            <ellipse cx="520" cy="55" rx="60" ry="28" fill="#FFF" opacity="0.8" />
          </g>

          <g className="animate-drift-slow" style={{ animationDelay: '4s' }}>
            <ellipse cx="720" cy="100" rx="80" ry="30" fill="url(#cloudGradient)" opacity="0.7" />
            <ellipse cx="700" cy="95" rx="50" ry="22" fill="#FFF" opacity="0.6" />
          </g>
        </g>
      )}

      {/* === CLOUDY === */}
      {type === 'cloudy' && (
        <g>
          <rect width="800" height="200" fill="#CFD8DC" opacity="0.3" />

          {/* Multiple cloud layers for overcast sky */}
          <g className="animate-drift-slow">
            <ellipse cx="-50" cy="100" rx="200" ry="60" fill="#90A4AE" opacity="0.5" />
            <ellipse cx="0" cy="80" rx="150" ry="50" fill="url(#cloudGradient)" />
            <ellipse cx="50" cy="70" rx="100" ry="40" fill="#ECEFF1" opacity="0.9" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '1.5s' }}>
            <ellipse cx="300" cy="90" rx="180" ry="55" fill="#90A4AE" opacity="0.5" />
            <ellipse cx="280" cy="75" rx="140" ry="45" fill="url(#cloudGradient)" />
            <ellipse cx="320" cy="65" rx="90" ry="35" fill="#ECEFF1" opacity="0.85" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '3s' }}>
            <ellipse cx="600" cy="85" rx="160" ry="50" fill="#90A4AE" opacity="0.45" />
            <ellipse cx="580" cy="70" rx="130" ry="42" fill="url(#cloudGradient)" />
            <ellipse cx="620" cy="60" rx="80" ry="32" fill="#FFF" opacity="0.8" />
          </g>

          {/* Atmospheric haze at bottom */}
          <rect x="0" y="150" width="800" height="50" fill="#B0BEC5" opacity="0.2" />
        </g>
      )}

      {/* === RAINY === */}
      {type === 'rainy' && (
        <g>
          <rect width="800" height="200" fill="#546E7A" opacity="0.2" />

          {/* Dark rain clouds */}
          <g>
            <ellipse cx="100" cy="70" rx="180" ry="60" fill="url(#darkCloudGradient)" opacity="0.8" />
            <ellipse cx="80" cy="55" rx="120" ry="45" fill="#546E7A" opacity="0.9" />
            <ellipse cx="140" cy="50" rx="80" ry="35" fill="#607D8B" opacity="0.8" />
          </g>
          <g>
            <ellipse cx="400" cy="60" rx="200" ry="55" fill="url(#darkCloudGradient)" opacity="0.85" />
            <ellipse cx="380" cy="45" rx="140" ry="40" fill="#455A64" opacity="0.9" />
            <ellipse cx="430" cy="40" rx="100" ry="32" fill="#546E7A" opacity="0.85" />
          </g>
          <g>
            <ellipse cx="700" cy="75" rx="150" ry="50" fill="url(#darkCloudGradient)" opacity="0.75" />
            <ellipse cx="680" cy="60" rx="100" ry="38" fill="#546E7A" opacity="0.85" />
          </g>

          {/* Realistic rain drops */}
          {[...Array(50)].map((_, i) => (
            <line
              key={i}
              x1={15 + i * 16}
              y1={100 + (i % 4) * 15}
              x2={10 + i * 16}
              y2={130 + (i % 4) * 15}
              stroke="#78909C"
              strokeWidth="1.5"
              opacity={0.3 + (i % 3) * 0.15}
              className="animate-rain"
              style={{ animationDelay: `${(i * 0.1) % 2}s` }}
            />
          ))}
        </g>
      )}

      {/* === STORMY === */}
      {type === 'stormy' && (
        <g>
          <rect width="800" height="200" fill="url(#skyStormy)" />

          {/* Ominous storm clouds */}
          <g>
            <ellipse cx="150" cy="80" rx="220" ry="70" fill="#263238" opacity="0.8" />
            <ellipse cx="120" cy="60" rx="150" ry="50" fill="#37474F" opacity="0.9" />
            <ellipse cx="180" cy="50" rx="100" ry="40" fill="#455A64" opacity="0.85" />
          </g>
          <g>
            <ellipse cx="500" cy="70" rx="250" ry="65" fill="#263238" opacity="0.85" />
            <ellipse cx="480" cy="50" rx="180" ry="48" fill="#37474F" opacity="0.9" />
            <ellipse cx="530" cy="40" rx="120" ry="38" fill="#455A64" opacity="0.8" />
          </g>

          {/* Lightning bolt */}
          <g className="animate-flash">
            <path
              d="M400 50 L385 90 L400 90 L370 150"
              fill="none"
              stroke="#FFF"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
            />
            <path
              d="M400 50 L385 90 L400 90 L370 150"
              fill="none"
              stroke="#FFEB3B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* Heavy rain */}
          {[...Array(70)].map((_, i) => (
            <line
              key={i}
              x1={10 + i * 11.5}
              y1={90 + (i % 5) * 12}
              x2={3 + i * 11.5}
              y2={125 + (i % 5) * 12}
              stroke="#78909C"
              strokeWidth="2"
              opacity={0.4 + (i % 3) * 0.1}
              className="animate-rain-fast"
              style={{ animationDelay: `${(i * 0.08) % 1.5}s` }}
            />
          ))}
        </g>
      )}

      {/* === SNOWY === */}
      {type === 'snowy' && (
        <g>
          <rect width="800" height="200" fill="#ECEFF1" opacity="0.15" />

          {/* Soft winter clouds */}
          <ellipse cx="200" cy="60" rx="180" ry="50" fill="#B0BEC5" opacity="0.4" />
          <ellipse cx="500" cy="70" rx="200" ry="55" fill="#CFD8DC" opacity="0.35" />
          <ellipse cx="700" cy="55" rx="150" ry="45" fill="#B0BEC5" opacity="0.3" />

          {/* Snowflakes with varying sizes and opacity */}
          {[...Array(40)].map((_, i) => {
            const size = 3 + (i % 4) * 2;
            const x = 20 + i * 20;
            const y = 60 + (i % 5) * 25;
            return (
              <g key={i} className="animate-snow" style={{ animationDelay: `${i * 0.15}s` }}>
                <circle cx={x} cy={y} r={size} fill="#FFF" opacity={0.5 + (i % 3) * 0.15} />
                <circle cx={x} cy={y} r={size * 0.5} fill="#FFF" opacity="0.8" />
              </g>
            );
          })}
        </g>
      )}

      {/* === NIGHT CLEAR === */}
      {type === 'night-clear' && (
        <g>
          <rect width="800" height="200" fill="url(#skyNight)" />

          {/* Milky way suggestion */}
          <ellipse cx="400" cy="100" rx="350" ry="40" fill="#7C4DFF" opacity="0.08" filter="url(#heavyBlur)" transform="rotate(-15 400 100)" />

          {/* Beautiful crescent moon */}
          <g filter="url(#glow)">
            <circle cx="680" cy="55" r="45" fill="url(#moonGlow)" />
            <circle cx="680" cy="55" r="30" fill="#FFF8E1" opacity="0.95" />
            <circle cx="695" cy="55" r="25" fill="#1A237E" opacity="0.9" />
            {/* Moon surface details */}
            <circle cx="670" cy="48" r="4" fill="#E0E0E0" opacity="0.3" />
            <circle cx="678" cy="62" r="3" fill="#E0E0E0" opacity="0.25" />
            <circle cx="665" cy="58" r="2" fill="#E0E0E0" opacity="0.2" />
          </g>

          {/* Twinkling stars at various depths */}
          {[
            { x: 50, y: 30, s: 2 }, { x: 120, y: 70, s: 3 }, { x: 180, y: 45, s: 1.5 },
            { x: 250, y: 90, s: 2.5 }, { x: 300, y: 35, s: 2 }, { x: 350, y: 120, s: 1.5 },
            { x: 420, y: 55, s: 3 }, { x: 480, y: 85, s: 2 }, { x: 520, y: 25, s: 2.5 },
            { x: 570, y: 110, s: 1.5 }, { x: 620, y: 130, s: 2 }, { x: 750, y: 80, s: 2.5 },
            { x: 780, y: 40, s: 1.5 }, { x: 100, y: 130, s: 2 }, { x: 200, y: 150, s: 1.5 },
            { x: 380, y: 140, s: 2 }, { x: 550, y: 145, s: 2.5 },
          ].map((star, i) => (
            <g key={i} className="animate-twinkle" style={{ animationDelay: `${i * 0.2}s` }}>
              <circle cx={star.x} cy={star.y} r={star.s * 2} fill="#FFF" opacity="0.15" filter="url(#softGlow)" />
              <circle cx={star.x} cy={star.y} r={star.s} fill="#FFF" opacity={0.6 + (i % 3) * 0.15} />
            </g>
          ))}

          {/* Shooting star */}
          <g className="animate-shooting-star">
            <line x1="150" y1="40" x2="220" y2="70" stroke="#FFF" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            <line x1="150" y1="40" x2="180" y2="50" stroke="#FFF" strokeWidth="3" strokeLinecap="round" opacity="0.6" filter="url(#softGlow)" />
          </g>
        </g>
      )}

      {/* === NIGHT CLOUDY === */}
      {type === 'night-cloudy' && (
        <g>
          <rect width="800" height="200" fill="url(#skyNight)" />

          {/* Moon glow behind clouds */}
          <circle cx="650" cy="60" r="50" fill="#FFF8E1" opacity="0.15" filter="url(#heavyBlur)" />

          {/* Night clouds */}
          <g className="animate-drift-slow">
            <ellipse cx="150" cy="80" rx="160" ry="50" fill="#3F51B5" opacity="0.4" />
            <ellipse cx="130" cy="70" rx="120" ry="40" fill="#5C6BC0" opacity="0.5" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '2s' }}>
            <ellipse cx="450" cy="70" rx="180" ry="55" fill="#303F9F" opacity="0.5" />
            <ellipse cx="430" cy="60" rx="140" ry="42" fill="#3F51B5" opacity="0.55" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '4s' }}>
            <ellipse cx="700" cy="90" rx="140" ry="45" fill="#3F51B5" opacity="0.45" />
            <ellipse cx="680" cy="80" rx="100" ry="35" fill="#5C6BC0" opacity="0.5" />
          </g>

          {/* Dim stars peeking through */}
          {[
            { x: 80, y: 30, s: 1.5 }, { x: 250, y: 45, s: 2 }, { x: 380, y: 35, s: 1.5 },
            { x: 550, y: 130, s: 2 }, { x: 750, y: 50, s: 1.5 },
          ].map((star, i) => (
            <circle key={i} cx={star.x} cy={star.y} r={star.s} fill="#FFF" opacity={0.3 + (i % 2) * 0.1} className="animate-twinkle" style={{ animationDelay: `${i * 0.4}s` }} />
          ))}
        </g>
      )}

      {/* === FOGGY === */}
      {type === 'foggy' && (
        <g>
          <rect width="800" height="200" fill="#ECEFF1" opacity="0.2" />

          {/* Mysterious sun trying to break through */}
          <circle cx="650" cy="60" r="50" fill="#FFF" opacity="0.15" filter="url(#heavyBlur)" />

          {/* Layered fog with depth */}
          <rect x="0" y="0" width="800" height="200" fill="#B0BEC5" opacity="0.15" />
          <g className="animate-drift-slow">
            <ellipse cx="0" cy="100" rx="300" ry="80" fill="#CFD8DC" opacity="0.25" filter="url(#heavyBlur)" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '2s' }}>
            <ellipse cx="400" cy="120" rx="350" ry="70" fill="#ECEFF1" opacity="0.3" filter="url(#heavyBlur)" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '4s' }}>
            <ellipse cx="700" cy="90" rx="280" ry="60" fill="#CFD8DC" opacity="0.2" filter="url(#heavyBlur)" />
          </g>

          {/* Ground fog */}
          <rect x="0" y="140" width="800" height="60" fill="#B0BEC5" opacity="0.35" filter="url(#softGlow)" />
        </g>
      )}

      {/* === CHRISTMAS === */}
      {type === 'christmas' && (
        <g>
          <rect width="800" height="200" fill="#1A237E" opacity="0.2" />

          {/* Elegant Christmas tree */}
          <g transform="translate(640, 15)">
            {/* Tree glow */}
            <ellipse cx="60" cy="90" rx="80" ry="90" fill="#4CAF50" opacity="0.15" filter="url(#heavyBlur)" />

            {/* Tree layers with gradient */}
            <polygon points="60,-5 95,55 25,55" fill="url(#christmasTree)" />
            <polygon points="60,30 105,100 15,100" fill="url(#christmasTree)" />
            <polygon points="60,70 115,150 5,150" fill="url(#christmasTree)" />

            {/* Snow on branches */}
            <path d="M25 55 Q45 50 60 55 Q75 50 95 55" fill="#FFF" opacity="0.6" />
            <path d="M15 100 Q40 93 60 100 Q80 93 105 100" fill="#FFF" opacity="0.5" />

            {/* Trunk */}
            <rect x="48" y="150" width="24" height="25" fill="#5D4037" />

            {/* Star on top */}
            <g className="animate-twinkle">
              <polygon points="60,-5 63,5 73,5 65,11 68,21 60,15 52,21 55,11 47,5 57,5" fill="#FFD700" />
              <circle cx="60" cy="8" r="12" fill="#FFD700" opacity="0.3" filter="url(#glow)" />
            </g>

            {/* Ornaments with glow */}
            <circle cx="40" cy="65" r="6" fill="#F44336" />
            <circle cx="40" cy="65" r="8" fill="#F44336" opacity="0.3" filter="url(#softGlow)" />
            <circle cx="80" cy="55" r="5" fill="#FFD700" />
            <circle cx="35" cy="105" r="6" fill="#2196F3" />
            <circle cx="85" cy="95" r="5" fill="#F44336" />
            <circle cx="60" cy="120" r="6" fill="#FFD700" />
            <circle cx="45" cy="135" r="5" fill="#4CAF50" />
            <circle cx="75" cy="130" r="5" fill="#2196F3" />

            {/* Lights string */}
            <circle cx="50" cy="80" r="3" fill="#FFEB3B" className="animate-twinkle" />
            <circle cx="70" cy="75" r="3" fill="#FF5722" className="animate-twinkle" style={{ animationDelay: '0.3s' }} />
            <circle cx="55" cy="110" r="3" fill="#00BCD4" className="animate-twinkle" style={{ animationDelay: '0.6s' }} />
            <circle cx="65" cy="105" r="3" fill="#E91E63" className="animate-twinkle" style={{ animationDelay: '0.9s' }} />
          </g>

          {/* Gentle snowfall */}
          {[...Array(30)].map((_, i) => (
            <circle
              key={i}
              cx={25 + i * 26}
              cy={30 + (i % 6) * 25}
              r={2 + (i % 3)}
              fill="#FFF"
              opacity={0.4 + (i % 3) * 0.15}
              className="animate-snow"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </g>
      )}

      {/* === THANKSGIVING === */}
      {type === 'thanksgiving' && (
        <g>
          {/* Warm autumn sky */}
          <rect width="800" height="200" fill="#FF8A65" opacity="0.15" />
          <rect width="800" height="100" fill="#FFB74D" opacity="0.1" />

          {/* Harvest moon */}
          <circle cx="680" cy="60" r="45" fill="#FFCC80" opacity="0.3" filter="url(#heavyBlur)" />
          <circle cx="680" cy="60" r="35" fill="#FFB74D" opacity="0.8" />
          <circle cx="680" cy="60" r="30" fill="#FFA726" opacity="0.9" />

          {/* Beautiful falling leaves */}
          {[
            { x: 80, y: 40, color: '#E65100', rotation: 25, size: 1 },
            { x: 160, y: 80, color: '#BF360C', rotation: -15, size: 0.8 },
            { x: 240, y: 50, color: '#FF8F00', rotation: 45, size: 1.2 },
            { x: 320, y: 100, color: '#E65100', rotation: -30, size: 0.9 },
            { x: 400, y: 60, color: '#D84315', rotation: 60, size: 1 },
            { x: 480, y: 90, color: '#FF6F00', rotation: -45, size: 1.1 },
            { x: 560, y: 45, color: '#BF360C', rotation: 20, size: 0.85 },
            { x: 620, y: 110, color: '#E65100', rotation: -55, size: 0.95 },
          ].map((leaf, i) => (
            <g key={i} className="animate-fall-leaf" style={{ animationDelay: `${i * 0.5}s` }} transform={`translate(${leaf.x}, ${leaf.y}) rotate(${leaf.rotation}) scale(${leaf.size})`}>
              {/* Realistic maple leaf shape */}
              <path
                d="M0 0 C-5 -8 -12 -6 -15 0 C-12 -2 -10 2 -8 5 C-12 3 -18 5 -20 12 C-15 10 -10 12 -6 15 C-8 18 -6 25 0 30 C6 25 8 18 6 15 C10 12 15 10 20 12 C18 5 12 3 8 5 C10 2 12 -2 15 0 C12 -6 5 -8 0 0"
                fill={leaf.color}
                opacity="0.85"
              />
              <line x1="0" y1="0" x2="0" y2="30" stroke={leaf.color} strokeWidth="1.5" opacity="0.6" />
            </g>
          ))}

          {/* Subtle cornucopia suggestion */}
          <g transform="translate(100, 120)" opacity="0.5">
            <ellipse cx="0" cy="0" rx="40" ry="25" fill="#8D6E63" />
            <ellipse cx="30" cy="-5" rx="15" ry="12" fill="#FF9800" />
            <ellipse cx="45" cy="5" rx="12" ry="10" fill="#F44336" />
            <ellipse cx="20" cy="8" rx="10" ry="8" fill="#FFC107" />
          </g>
        </g>
      )}

      {/* === EASTER === */}
      {type === 'easter' && (
        <g>
          {/* Glorious sunrise */}
          <rect width="800" height="200" fill="url(#easterSunrise)" />

          {/* Rising sun with rays of hope */}
          <g>
            <circle cx="400" cy="180" r="100" fill="#FFCC80" opacity="0.3" filter="url(#heavyBlur)" />
            <circle cx="400" cy="180" r="60" fill="#FFB74D" opacity="0.5" />
            <circle cx="400" cy="180" r="40" fill="#FFA726" opacity="0.7" />

            {/* Divine light rays */}
            {[...Array(12)].map((_, i) => (
              <line
                key={i}
                x1="400"
                y1="180"
                x2={400 + Math.cos((i * 30 - 90) * Math.PI / 180) * 200}
                y2={180 + Math.sin((i * 30 - 90) * Math.PI / 180) * 200}
                stroke="#FFE082"
                strokeWidth={3 - (i % 2)}
                opacity={0.2 + (i % 3) * 0.05}
              />
            ))}
          </g>

          {/* The Cross - symbol of resurrection */}
          <g transform="translate(400, 40)">
            {/* Cross glow */}
            <rect x="-8" y="0" width="16" height="120" fill="#FFF" opacity="0.2" filter="url(#glow)" />

            {/* Wooden cross */}
            <rect x="-6" y="0" width="12" height="110" fill="#5D4037" />
            <rect x="-35" y="25" width="70" height="10" fill="#5D4037" />

            {/* Cross highlights */}
            <rect x="-4" y="2" width="3" height="106" fill="#8D6E63" opacity="0.5" />
            <rect x="-33" y="27" width="66" height="3" fill="#8D6E63" opacity="0.5" />
          </g>

          {/* Easter lilies */}
          {[
            { x: 150, y: 150 },
            { x: 250, y: 160 },
            { x: 550, y: 155 },
            { x: 650, y: 165 },
          ].map((lily, i) => (
            <g key={i} transform={`translate(${lily.x}, ${lily.y})`}>
              <ellipse cx="0" cy="0" rx="12" ry="20" fill="#FFF" opacity="0.85" transform="rotate(-20)" />
              <ellipse cx="8" cy="-5" rx="10" ry="18" fill="#FFF" opacity="0.8" transform="rotate(10)" />
              <ellipse cx="-8" cy="-5" rx="10" ry="18" fill="#FFF" opacity="0.8" transform="rotate(-50)" />
              <circle cx="0" cy="5" r="3" fill="#FFEB3B" opacity="0.8" />
            </g>
          ))}
        </g>
      )}

      {/* === NEW YEARS === */}
      {type === 'new-years' && (
        <g>
          <rect width="800" height="200" fill="url(#skyNight)" />

          {/* Fireworks */}
          {[
            { x: 150, y: 70, colors: ['#F44336', '#FFEB3B', '#FF9800'] },
            { x: 350, y: 50, colors: ['#2196F3', '#00BCD4', '#FFF'] },
            { x: 550, y: 80, colors: ['#9C27B0', '#E91E63', '#FF4081'] },
            { x: 700, y: 60, colors: ['#4CAF50', '#8BC34A', '#FFEB3B'] },
          ].map((fw, fwIndex) => (
            <g key={fwIndex} className="animate-twinkle" style={{ animationDelay: `${fwIndex * 0.4}s` }}>
              {/* Burst center */}
              <circle cx={fw.x} cy={fw.y} r="8" fill={fw.colors[0]} opacity="0.8" />
              <circle cx={fw.x} cy={fw.y} r="15" fill={fw.colors[0]} opacity="0.3" filter="url(#glow)" />

              {/* Sparkle rays */}
              {[...Array(16)].map((_, i) => {
                const angle = (i * 22.5) * Math.PI / 180;
                const length = 30 + (i % 3) * 15;
                return (
                  <line
                    key={i}
                    x1={fw.x}
                    y1={fw.y}
                    x2={fw.x + Math.cos(angle) * length}
                    y2={fw.y + Math.sin(angle) * length}
                    stroke={fw.colors[i % 3]}
                    strokeWidth={2 - (i % 2) * 0.5}
                    strokeLinecap="round"
                    opacity={0.7 + (i % 3) * 0.1}
                  />
                );
              })}

              {/* Sparkle dots at ends */}
              {[...Array(8)].map((_, i) => {
                const angle = (i * 45) * Math.PI / 180;
                const dist = 35 + (i % 2) * 15;
                return (
                  <circle
                    key={i}
                    cx={fw.x + Math.cos(angle) * dist}
                    cy={fw.y + Math.sin(angle) * dist}
                    r="3"
                    fill={fw.colors[i % 3]}
                    opacity="0.9"
                  />
                );
              })}
            </g>
          ))}

          {/* Background stars */}
          {[...Array(20)].map((_, i) => (
            <circle
              key={i}
              cx={40 + i * 40}
              cy={20 + (i % 5) * 30}
              r={1 + (i % 2)}
              fill="#FFF"
              opacity={0.3 + (i % 3) * 0.1}
              className="animate-twinkle"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </g>
      )}

      {/* === VALENTINES === */}
      {type === 'valentines' && (
        <g>
          {/* Soft romantic gradient */}
          <rect width="800" height="200" fill="#FCE4EC" opacity="0.2" />

          {/* Floating hearts with depth */}
          {[
            { x: 80, y: 60, size: 1, color: '#E91E63' },
            { x: 180, y: 100, size: 0.7, color: '#F48FB1' },
            { x: 280, y: 50, size: 1.2, color: '#EC407A' },
            { x: 380, y: 120, size: 0.8, color: '#F06292' },
            { x: 480, y: 70, size: 1.1, color: '#E91E63' },
            { x: 580, y: 90, size: 0.9, color: '#F48FB1' },
            { x: 680, y: 55, size: 1, color: '#EC407A' },
            { x: 750, y: 110, size: 0.75, color: '#F06292' },
          ].map((heart, i) => (
            <g key={i} className="animate-float" style={{ animationDelay: `${i * 0.3}s` }} transform={`translate(${heart.x}, ${heart.y}) scale(${heart.size})`}>
              {/* Heart glow */}
              <path
                d="M0 10 C-10 -5 -25 -5 -25 10 C-25 25 0 40 0 40 C0 40 25 25 25 10 C25 -5 10 -5 0 10"
                fill={heart.color}
                opacity="0.2"
                filter="url(#softGlow)"
                transform="scale(1.3)"
              />
              {/* Heart shape */}
              <path
                d="M0 10 C-10 -5 -25 -5 -25 10 C-25 25 0 40 0 40 C0 40 25 25 25 10 C25 -5 10 -5 0 10"
                fill={heart.color}
                opacity="0.85"
              />
              {/* Heart highlight */}
              <ellipse cx="-10" cy="5" rx="5" ry="4" fill="#FFF" opacity="0.4" />
            </g>
          ))}

          {/* Sparkles */}
          {[...Array(15)].map((_, i) => (
            <g key={i} className="animate-twinkle" style={{ animationDelay: `${i * 0.2}s` }}>
              <circle cx={50 + i * 50} cy={30 + (i % 4) * 40} r="2" fill="#FFF" opacity="0.6" />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}

// === REUSABLE COMPONENTS ===

function WispyCloud({ x, y, scale, color, opacity, delay }: {
  x: number; y: number; scale: number; color: string; opacity: number; delay: number
}) {
  return (
    <g
      className="animate-drift"
      style={{ animationDelay: `${delay}s` }}
      transform={`translate(${x}, ${y}) scale(${scale})`}
    >
      <path
        d="M0 30 Q20 20 50 25 Q70 10 100 20 Q130 15 150 25 Q170 20 180 30 Q185 40 170 45 Q160 50 140 48 Q100 55 60 48 Q30 50 10 45 Q-5 40 0 30"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity={opacity}
      />
    </g>
  );
}

function CloudFormation({ x, y, scale, color, opacity, delay }: {
  x: number; y: number; scale: number; color: string; opacity: number; delay: number
}) {
  return (
    <g
      className="animate-drift-slow"
      style={{ animationDelay: `${delay}s` }}
      transform={`translate(${x}, ${y}) scale(${scale})`}
    >
      {/* Soft cloud fill for depth */}
      <path
        d="M20 60 Q20 45 35 45 Q40 30 60 32 Q75 20 95 28 Q115 18 135 30 Q155 25 165 40 Q180 38 185 52 Q195 55 190 68 Q188 78 175 80 L25 80 Q10 78 10 65 Q8 55 20 60"
        fill={color}
        opacity={opacity * 0.15}
      />
      {/* Main cloud body - multiple overlapping curves for organic feel */}
      <path
        d="M20 60 Q20 45 35 45 Q40 30 60 32 Q75 20 95 28 Q115 18 135 30 Q155 25 165 40 Q180 38 185 52 Q195 55 190 68 Q188 78 175 80 L25 80 Q10 78 10 65 Q8 55 20 60"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={opacity}
      />
      {/* Inner detail lines */}
      <path
        d="M40 55 Q55 48 75 52 Q95 45 115 50"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        opacity={opacity * 0.65}
      />
      <path
        d="M60 65 Q80 60 100 63 Q120 58 140 62"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        opacity={opacity * 0.55}
      />
    </g>
  );
}

function RainDrop({ x, delay, fast = false }: {
  x: number; delay: number; fast?: boolean
}) {
  // Match cloud line color (blue-gray)
  const dropColor = '#546E7A';

  return (
    <g
      className={fast ? 'animate-rain-fast' : 'animate-rain'}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Teardrop shape */}
      <ellipse
        cx={x}
        cy="0"
        rx="2"
        ry="4"
        fill={dropColor}
        opacity="0.6"
      />
      {/* Small trail */}
      <line
        x1={x}
        y1="-6"
        x2={x}
        y2="4"
        stroke={dropColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
    </g>
  );
}

function Snowflake({ x, delay, color, size }: {
  x: number; delay: number; color: string; size: number
}) {
  return (
    <g
      className="animate-snow"
      style={{ animationDelay: `${delay}s`, transformOrigin: `${x}px 0px` }}
    >
      {/* Six-pointed snowflake */}
      <g transform={`translate(${x}, -10)`}>
        {[0, 60, 120].map((angle) => (
          <line
            key={angle}
            x1="0" y1={-size}
            x2="0" y2={size}
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.7"
            transform={`rotate(${angle})`}
          />
        ))}
        <circle cx="0" cy="0" r={size * 0.4} fill={color} opacity="0.5" />
      </g>
    </g>
  );
}

function Star({ x, y, size, color, delay, dim = false }: {
  x: number; y: number; size: number; color: string; delay: number; dim?: boolean
}) {
  // Use brighter base colors for dim stars, let animation handle visibility
  const starColor = dim ? color : color;
  const glowOpacity = dim ? 0.3 : 0.5;

  return (
    <g
      className="animate-twinkle"
      style={{ animationDelay: `${delay}s` }}
      transform={`translate(${x}, ${y})`}
    >
      {/* Glow effect */}
      <circle cx="0" cy="0" r={size * 1.5} fill={starColor} opacity={glowOpacity} filter="url(#softBlur)" />
      {/* Four-pointed star - no inline opacity, let animation control visibility */}
      <path
        d={`M0 ${-size} L${size * 0.3} 0 L0 ${size} L${-size * 0.3} 0 Z`}
        fill={starColor}
      />
      <path
        d={`M${-size} 0 L0 ${size * 0.3} L${size} 0 L0 ${-size * 0.3} Z`}
        fill={starColor}
      />
    </g>
  );
}
