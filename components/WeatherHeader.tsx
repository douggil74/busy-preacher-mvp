'use client';

import { useState, useEffect } from 'react';

type WeatherType = 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'night-clear' | 'night-cloudy';

interface WeatherData {
  type: WeatherType;
  temp?: number;
}

export default function WeatherHeader() {
  const [weather, setWeather] = useState<WeatherData>({ type: 'partly-cloudy' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Try to get weather based on location
    const fetchWeather = async () => {
      try {
        // Get user's approximate location via IP (no permission needed)
        const geoRes = await fetch('https://ipapi.co/json/');
        const geoData = await geoRes.json();

        if (geoData.latitude && geoData.longitude) {
          // Use Open-Meteo (free, no API key needed)
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${geoData.latitude}&longitude=${geoData.longitude}&current=weather_code,temperature_2m,is_day`
          );
          const weatherData = await weatherRes.json();

          const code = weatherData.current?.weather_code || 0;
          const isDay = weatherData.current?.is_day === 1;
          const temp = weatherData.current?.temperature_2m;

          // Map weather codes to our types
          // https://open-meteo.com/en/docs
          let type: WeatherType = 'partly-cloudy';

          if (!isDay) {
            type = code <= 3 ? 'night-clear' : 'night-cloudy';
          } else if (code === 0) {
            type = 'sunny';
          } else if (code <= 3) {
            type = 'partly-cloudy';
          } else if (code <= 48) {
            type = 'cloudy';
          } else if (code <= 67 || (code >= 80 && code <= 82)) {
            type = 'rainy';
          } else if (code >= 95) {
            type = 'stormy';
          } else if (code >= 71 && code <= 77) {
            type = 'snowy';
          }

          setWeather({ type, temp });
        }
      } catch (err) {
        // Fallback to time-based weather
        const hour = new Date().getHours();
        if (hour < 6 || hour >= 20) {
          setWeather({ type: 'night-clear' });
        } else if (hour < 12) {
          setWeather({ type: 'sunny' });
        } else {
          setWeather({ type: 'partly-cloudy' });
        }
      }
    };

    fetchWeather();
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute top-0 left-0 right-0 h-64 overflow-hidden pointer-events-none z-0">
      {/* Gradient fade overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, transparent 40%, var(--bg-color) 100%)'
        }}
      />

      {/* Weather animations container */}
      <div className="absolute inset-0 z-0">
        {weather.type === 'sunny' && <SunnyScene />}
        {weather.type === 'partly-cloudy' && <PartlyCloudyScene />}
        {weather.type === 'cloudy' && <CloudyScene />}
        {weather.type === 'rainy' && <RainyScene />}
        {weather.type === 'stormy' && <StormyScene />}
        {weather.type === 'snowy' && <SnowyScene />}
        {weather.type === 'night-clear' && <NightClearScene />}
        {weather.type === 'night-cloudy' && <NightCloudyScene />}
      </div>
    </div>
  );
}

// === SUNNY ===
function SunnyScene() {
  return (
    <div className="relative w-full h-full">
      {/* Sun with rays */}
      <svg className="absolute top-4 right-12 w-24 h-24 animate-spin-slow" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        {/* Sun rays */}
        {[...Array(12)].map((_, i) => (
          <line
            key={i}
            x1="50" y1="10" x2="50" y2="20"
            stroke="#fbbf24"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.5"
            transform={`rotate(${i * 30} 50 50)`}
          />
        ))}
        {/* Sun circle */}
        <circle cx="50" cy="50" r="20" fill="url(#sunGrad)" />
        <circle cx="50" cy="50" r="20" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.6" />
      </svg>

      {/* Subtle floating clouds */}
      <CloudLine className="absolute top-16 left-[10%] opacity-20 animate-float-slow" />
      <CloudLine className="absolute top-8 left-[60%] opacity-15 animate-float-slower scale-75" />
    </div>
  );
}

// === PARTLY CLOUDY ===
function PartlyCloudyScene() {
  return (
    <div className="relative w-full h-full">
      {/* Partial sun */}
      <svg className="absolute top-6 right-16 w-20 h-20" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="partSunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {[...Array(8)].map((_, i) => (
          <line
            key={i}
            x1="50" y1="15" x2="50" y2="25"
            stroke="#fbbf24"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.4"
            transform={`rotate(${i * 45} 50 50)`}
          />
        ))}
        <circle cx="50" cy="50" r="18" fill="url(#partSunGrad)" />
      </svg>

      {/* Drifting clouds */}
      <CloudLine className="absolute top-8 left-[5%] opacity-30 animate-drift" />
      <CloudLine className="absolute top-20 left-[30%] opacity-25 animate-drift-slow scale-110" />
      <CloudLine className="absolute top-12 right-[15%] opacity-20 animate-drift-slower scale-90" />
    </div>
  );
}

// === CLOUDY ===
function CloudyScene() {
  return (
    <div className="relative w-full h-full">
      <CloudLine className="absolute top-4 left-[0%] opacity-35 animate-drift scale-125" />
      <CloudLine className="absolute top-16 left-[20%] opacity-30 animate-drift-slow" />
      <CloudLine className="absolute top-8 left-[45%] opacity-35 animate-drift-slower scale-110" />
      <CloudLine className="absolute top-20 left-[65%] opacity-25 animate-drift scale-90" />
      <CloudLine className="absolute top-6 right-[5%] opacity-30 animate-drift-slow scale-105" />
    </div>
  );
}

// === RAINY ===
function RainyScene() {
  return (
    <div className="relative w-full h-full">
      {/* Rain clouds */}
      <CloudLine className="absolute top-4 left-[5%] opacity-40 animate-drift-slow scale-110" dark />
      <CloudLine className="absolute top-8 left-[35%] opacity-45 animate-drift scale-125" dark />
      <CloudLine className="absolute top-6 right-[10%] opacity-35 animate-drift-slower" dark />

      {/* Rain drops */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <RainDrop key={i} delay={i * 0.15} left={5 + (i * 4.5)} />
        ))}
      </div>
    </div>
  );
}

// === STORMY ===
function StormyScene() {
  return (
    <div className="relative w-full h-full">
      {/* Dark storm clouds */}
      <CloudLine className="absolute top-2 left-[0%] opacity-50 animate-drift-slow scale-130" dark />
      <CloudLine className="absolute top-10 left-[25%] opacity-55 animate-drift scale-140" dark />
      <CloudLine className="absolute top-4 right-[5%] opacity-45 animate-drift-slower scale-120" dark />

      {/* Lightning bolt */}
      <svg className="absolute top-12 left-[40%] w-8 h-16 animate-flash" viewBox="0 0 30 60">
        <path
          d="M15 0 L8 25 L14 25 L10 60 L25 20 L17 20 L22 0 Z"
          fill="#fbbf24"
          opacity="0.7"
        />
      </svg>

      {/* Heavy rain */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <RainDrop key={i} delay={i * 0.1} left={3 + (i * 3.2)} fast />
        ))}
      </div>
    </div>
  );
}

// === SNOWY ===
function SnowyScene() {
  return (
    <div className="relative w-full h-full">
      {/* Light clouds */}
      <CloudLine className="absolute top-6 left-[10%] opacity-25 animate-drift-slow" />
      <CloudLine className="absolute top-4 left-[50%] opacity-30 animate-drift scale-110" />

      {/* Snowflakes */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <Snowflake key={i} delay={i * 0.2} left={4 + (i * 3.8)} />
        ))}
      </div>
    </div>
  );
}

// === NIGHT CLEAR ===
function NightClearScene() {
  return (
    <div className="relative w-full h-full">
      {/* Moon */}
      <svg className="absolute top-6 right-16 w-16 h-16" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="22" fill="url(#moonGrad)" />
        <circle cx="50" cy="50" r="22" fill="none" stroke="#e2e8f0" strokeWidth="1" opacity="0.5" />
        {/* Moon craters */}
        <circle cx="42" cy="45" r="4" fill="#94a3b8" opacity="0.3" />
        <circle cx="55" cy="55" r="3" fill="#94a3b8" opacity="0.2" />
      </svg>

      {/* Stars */}
      {[...Array(15)].map((_, i) => (
        <Star key={i} top={8 + (i % 5) * 12} left={5 + (i * 6)} delay={i * 0.3} />
      ))}
    </div>
  );
}

// === NIGHT CLOUDY ===
function NightCloudyScene() {
  return (
    <div className="relative w-full h-full">
      {/* Partial moon behind clouds */}
      <svg className="absolute top-8 right-20 w-14 h-14 opacity-60" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="20" fill="#94a3b8" opacity="0.4" />
      </svg>

      {/* Night clouds */}
      <CloudLine className="absolute top-6 left-[5%] opacity-25 animate-drift-slow" />
      <CloudLine className="absolute top-12 left-[35%] opacity-30 animate-drift" />
      <CloudLine className="absolute top-4 right-[10%] opacity-25 animate-drift-slower scale-90" />

      {/* Dim stars */}
      {[...Array(8)].map((_, i) => (
        <Star key={i} top={10 + (i % 3) * 15} left={10 + (i * 10)} delay={i * 0.4} dim />
      ))}
    </div>
  );
}

// === REUSABLE ELEMENTS ===

function CloudLine({ className = '', dark = false }: { className?: string; dark?: boolean }) {
  return (
    <svg className={`w-32 h-16 ${className}`} viewBox="0 0 120 50">
      <path
        d="M10 35 Q10 25 20 25 Q22 15 35 15 Q45 5 60 15 Q75 10 85 20 Q100 18 105 28 Q115 28 115 38 Q115 45 105 45 L15 45 Q5 45 10 35"
        fill="none"
        stroke={dark ? '#64748b' : '#94a3b8'}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity={dark ? 0.6 : 0.4}
      />
    </svg>
  );
}

function RainDrop({ delay, left, fast = false }: { delay: number; left: number; fast?: boolean }) {
  return (
    <div
      className={`absolute w-0.5 h-4 rounded-full ${fast ? 'animate-rain-fast' : 'animate-rain'}`}
      style={{
        left: `${left}%`,
        top: '-20px',
        background: 'linear-gradient(to bottom, transparent, #60a5fa)',
        animationDelay: `${delay}s`,
        opacity: 0.4
      }}
    />
  );
}

function Snowflake({ delay, left }: { delay: number; left: number }) {
  return (
    <div
      className="absolute w-2 h-2 animate-snow"
      style={{
        left: `${left}%`,
        top: '-10px',
        animationDelay: `${delay}s`,
      }}
    >
      <svg viewBox="0 0 20 20" className="w-full h-full">
        <circle cx="10" cy="10" r="3" fill="#e2e8f0" opacity="0.6" />
      </svg>
    </div>
  );
}

function Star({ top, left, delay, dim = false }: { top: number; left: number; delay: number; dim?: boolean }) {
  return (
    <div
      className="absolute animate-twinkle"
      style={{
        top: `${top}px`,
        left: `${left}%`,
        animationDelay: `${delay}s`,
      }}
    >
      <svg className="w-2 h-2" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="1.5" fill="#e2e8f0" opacity={dim ? 0.3 : 0.6} />
      </svg>
    </div>
  );
}
