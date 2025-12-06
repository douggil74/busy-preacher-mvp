'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Weather types + holiday themes + time-of-day variants
type SceneType =
  | 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy' | 'snowy'
  | 'night-clear' | 'night-cloudy' | 'tornado' | 'hurricane' | 'foggy'
  | 'christmas' | 'thanksgiving' | 'easter' | 'new-years' | 'valentines'
  // Morning variants (dawn/sunrise - 5am-8am)
  | 'sunny-morning' | 'partly-cloudy-morning' | 'cloudy-morning' | 'rainy-morning' | 'snowy-morning' | 'foggy-morning'
  // Evening variants (sunset/dusk - 5pm-8pm)
  | 'sunny-evening' | 'partly-cloudy-evening' | 'cloudy-evening' | 'rainy-evening' | 'snowy-evening' | 'foggy-evening';

interface SceneSettings {
  disabledScenes: SceneType[];
  customOverride: {
    enabled: boolean;
    sceneId: SceneType | 'custom' | null;
    expiresAt: string | null;
    customPrompt: string | null;
    customSvg: string | null;
    customImageUrl: string | null;
  };
}

// Check if today is a holiday
function getHoliday(): SceneType | null {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  if (month === 12 && day >= 20 && day <= 26) return 'christmas';
  if (month === 11 && day >= 22 && day <= 28) return 'thanksgiving';
  if ((month === 12 && day === 31) || (month === 1 && day <= 2)) return 'new-years';
  if (month === 2 && (day === 13 || day === 14)) return 'valentines';
  if (month === 4 && day >= 1 && day <= 20) return 'easter';

  return null;
}

// Get instant default scene based on time of day (no async, no delay)
function getInstantDefaultScene(): SceneType {
  const hour = new Date().getHours();
  return hour < 6 || hour >= 20 ? 'night-clear' : 'partly-cloudy';
}

export default function WeatherHeader({ onSceneReady }: { onSceneReady?: (scene: SceneType | 'custom', tempF?: number | null) => void } = {}) {
  // Start with instant default scene - no blank loading state
  const [scene, setScene] = useState<SceneType | 'custom'>(getInstantDefaultScene());
  const [customSvg, setCustomSvg] = useState<string | null>(null);
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [temperature, setTemperature] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);

    const determineScene = async () => {
      let settings: SceneSettings | null = null;
      try {
        const docRef = doc(db, 'settings', 'scenes');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          settings = docSnap.data() as SceneSettings;
        }
      } catch (err) {
        console.log('No scene settings found');
      }

      // Check for custom override
      if (settings?.customOverride?.enabled &&
          settings.customOverride.expiresAt &&
          new Date(settings.customOverride.expiresAt) > new Date()) {

        // Check if it's a custom AI-generated scene (SVG or Image)
        if (settings.customOverride.sceneId === 'custom') {
          if (settings.customOverride.customSvg) {
            setCustomSvg(settings.customOverride.customSvg);
            setCustomImageUrl(null);
            setScene('custom');
            setIsLoading(false);
            onSceneReady?.('custom');
            return;
          }
          if (settings.customOverride.customImageUrl) {
            setCustomImageUrl(settings.customOverride.customImageUrl);
            setCustomSvg(null);
            setScene('custom');
            setIsLoading(false);
            onSceneReady?.('custom');
            return;
          }
        }

        // Otherwise use the selected scene ID
        if (settings.customOverride.sceneId && settings.customOverride.sceneId !== 'custom') {
          setScene(settings.customOverride.sceneId);
          setIsLoading(false);
          onSceneReady?.(settings.customOverride.sceneId);
          return;
        }
      }

      const holiday = getHoliday();
      if (holiday && !settings?.disabledScenes?.includes(holiday)) {
        setScene(holiday);
        setIsLoading(false);
        onSceneReady?.(holiday);
        return;
      }

      // Helper to apply time-of-day variants (morning/evening)
      const applyTimeOfDayVariant = (baseType: SceneType): SceneType => {
        const hour = new Date().getHours();

        // Types that have morning/evening variants
        const variantTypes = ['sunny', 'partly-cloudy', 'cloudy', 'rainy', 'snowy', 'foggy'];

        // Morning: 5am-8am (sunrise hours)
        if (hour >= 5 && hour < 8 && variantTypes.includes(baseType)) {
          return `${baseType}-morning` as SceneType;
        }

        // Evening: 5pm-8pm (sunset hours) - before it gets dark
        if (hour >= 17 && hour < 20 && variantTypes.includes(baseType)) {
          return `${baseType}-evening` as SceneType;
        }

        return baseType;
      };

      // Helper to fetch weather and determine scene
      const fetchWeatherAndSetScene = async (lat: number, lon: number) => {
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,is_day,temperature_2m&temperature_unit=fahrenheit`
        );
        const weatherData = await weatherRes.json();

        const code = weatherData.current?.weather_code || 0;
        const isDay = weatherData.current?.is_day === 1;
        const temp = weatherData.current?.temperature_2m;
        if (typeof temp === 'number') {
          setTemperature(Math.round(temp));
        }

        let type: SceneType = 'partly-cloudy';

        if (!isDay) {
          // Nighttime weather detection
          if (code >= 95) type = 'stormy';
          else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) type = 'rainy';
          else if (code >= 71 && code <= 77) type = 'snowy';
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

        if (settings?.disabledScenes?.includes(type)) {
          type = 'partly-cloudy';
        }

        // Apply morning/evening variant if applicable
        type = applyTimeOfDayVariant(type);

        // Check if the variant is disabled, fall back to base type
        if (settings?.disabledScenes?.includes(type)) {
          // Get base type back (remove -morning or -evening suffix)
          const baseType = type.replace(/-morning$|-evening$/, '') as SceneType;
          type = baseType;
        }

        console.log('🌤️ Weather detected:', { lat: lat.toFixed(2), lon: lon.toFixed(2), weatherCode: code, isDay, sceneType: type, tempF: temp });
        setScene(type);
        const roundedTemp = typeof temp === 'number' ? Math.round(temp) : null;
        onSceneReady?.(type, roundedTemp);
      };

      // Try browser geolocation first (more accurate, no rate limits)
      const tryBrowserGeolocation = (): Promise<{lat: number, lon: number} | null> => {
        return new Promise((resolve) => {
          if (!navigator.geolocation) {
            resolve(null);
            return;
          }
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('📍 Using browser geolocation');
              resolve({ lat: position.coords.latitude, lon: position.coords.longitude });
            },
            (err) => {
              console.log('📍 Browser geolocation failed:', err.message);
              resolve(null);
            },
            { timeout: 5000, maximumAge: 300000 } // 5s timeout, cache for 5 min
          );
        });
      };

      // Try IP-based geolocation as fallback
      const tryIPGeolocation = async (): Promise<{lat: number, lon: number} | null> => {
        try {
          // Try ipapi.co first
          const res = await fetch('https://ipapi.co/json/');
          const data = await res.json();
          if (data.latitude && data.longitude) {
            console.log('📍 Using ipapi.co:', data.city, data.region);
            return { lat: data.latitude, lon: data.longitude };
          }
        } catch (e) {
          console.log('ipapi.co failed, trying backup');
        }

        try {
          // Backup: ipinfo.io (HTTPS, no API key for basic usage)
          const res = await fetch('https://ipinfo.io/json');
          const data = await res.json();
          if (data.loc) {
            const [lat, lon] = data.loc.split(',').map(Number);
            if (!isNaN(lat) && !isNaN(lon)) {
              console.log('📍 Using ipinfo.io:', data.city, data.region);
              return { lat, lon };
            }
          }
        } catch (e) {
          console.log('ipinfo.io also failed');
        }

        return null;
      };

      try {
        // Try browser geolocation first
        let coords = await tryBrowserGeolocation();

        // Fall back to IP geolocation
        if (!coords) {
          coords = await tryIPGeolocation();
        }

        if (coords) {
          await fetchWeatherAndSetScene(coords.lat, coords.lon);
        } else {
          throw new Error('No geolocation available');
        }
      } catch (err) {
        console.log('Weather detection failed:', err);
        const hour = new Date().getHours();
        const fallback = hour < 6 || hour >= 20 ? 'night-clear' : 'partly-cloudy';
        setScene(fallback);
        onSceneReady?.(fallback);
      } finally {
        setIsLoading(false);
      }
    };

    determineScene();
  }, [onSceneReady]);

  // Don't render on server to avoid hydration mismatch
  if (!mounted) {
    return (
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none rounded-t-2xl"
        style={{ backgroundColor: 'var(--card-bg)' }}
      />
    );
  }

  // Always render scene immediately - no waiting for weather data

  // Determine if it's a night/evening scene for temperature styling
  const isNightScene = scene === 'night-clear' || scene === 'night-cloudy' || scene === 'christmas' || scene === 'new-years'
    || scene.endsWith('-evening');

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none rounded-t-2xl transition-opacity duration-500"
      style={{ backgroundColor: 'var(--card-bg)' }}
    >
      <div className="absolute inset-0">
        {scene === 'custom' && (customSvg || customImageUrl) ? (
          // Custom override scene (SVG or DALL-E image)
          customImageUrl ? (
            <img
              src={customImageUrl}
              alt="Custom scene"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              dangerouslySetInnerHTML={{ __html: customSvg! }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            />
          )
        ) : (
          // Default to animated SVG scene
          <WeatherScene type={scene as SceneType} />
        )}
      </div>
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, transparent 50%, var(--card-bg) 100%)'
        }}
      />

      {/* Temperature display - glass effect */}
      {temperature !== null && (
        <div
          className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-xl"
          style={{
            background: isNightScene
              ? 'rgba(255, 255, 255, 0.12)'
              : 'rgba(255, 255, 255, 0.35)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: isNightScene
              ? '1px solid rgba(255, 255, 255, 0.2)'
              : '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: isNightScene
              ? '0 2px 8px rgba(0, 0, 0, 0.3)'
              : '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <span
            className="text-lg font-semibold"
            style={{
              color: isNightScene ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.85)',
              textShadow: isNightScene
                ? '0 1px 2px rgba(0, 0, 0, 0.3)'
                : '0 1px 2px rgba(255, 255, 255, 0.5)',
              letterSpacing: '-0.02em',
            }}
          >
            {temperature}°
          </span>
        </div>
      )}
    </div>
  );
}

export { WeatherScene };
export type { SceneType };

// Fluffy cloud component - realistic puffy cumulus shape with light mode outline
function FluffyCloud({ x, y, scale = 1, opacity = 0.9, color = '#FFFFFF', shadowColor = '#90A4AE' }: {
  x: number; y: number; scale?: number; opacity?: number; color?: string; shadowColor?: string;
}) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* Drop shadow for depth */}
      <ellipse cx="5" cy="18" rx="55" ry="15" fill="#607D8B" opacity={opacity * 0.15} />

      {/* Outer subtle outline for light mode visibility */}
      <circle cx="0" cy="0" r="32" fill="none" stroke="#78909C" strokeWidth="1.5" opacity={opacity * 0.3} />
      <circle cx="-25" cy="5" r="24" fill="none" stroke="#78909C" strokeWidth="1" opacity={opacity * 0.25} />
      <circle cx="28" cy="3" r="26" fill="none" stroke="#78909C" strokeWidth="1" opacity={opacity * 0.25} />

      {/* Shadow/depth layer - more vivid */}
      <circle cx="0" cy="8" r="28" fill={shadowColor} opacity={opacity * 0.6} />
      <circle cx="35" cy="12" r="22" fill={shadowColor} opacity={opacity * 0.5} />
      <circle cx="-30" cy="10" r="20" fill={shadowColor} opacity={opacity * 0.5} />

      {/* Main cloud body - overlapping circles for fluffy look */}
      <circle cx="0" cy="0" r="30" fill={color} opacity={opacity} />
      <circle cx="-25" cy="5" r="22" fill={color} opacity={opacity} />
      <circle cx="28" cy="3" r="24" fill={color} opacity={opacity} />
      <circle cx="-40" cy="12" r="18" fill={color} opacity={opacity * 0.98} />
      <circle cx="45" cy="10" r="20" fill={color} opacity={opacity * 0.98} />
      <circle cx="12" cy="-8" r="20" fill={color} opacity={opacity} />
      <circle cx="-12" cy="-5" r="18" fill={color} opacity={opacity} />

      {/* Highlight puffs on top */}
      <circle cx="-5" cy="-12" r="12" fill={color} opacity={opacity} />
      <circle cx="20" cy="-10" r="10" fill={color} opacity={opacity * 0.98} />
    </g>
  );
}

// Snowflake component - 6-pointed crystal design with light mode shadow
function Snowflake({ x, y, size = 1, opacity = 0.8, rotation = 0 }: {
  x: number; y: number; size?: number; opacity?: number; rotation?: number;
}) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation}) scale(${size})`}>
      {/* Shadow layer for light mode visibility */}
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <g key={`shadow-${angle}`} transform={`rotate(${angle})`}>
          <line x1="0" y1="0" x2="0" y2="-8" stroke="#87CEEB" strokeWidth="2" opacity={opacity * 0.3} />
          <line x1="0" y1="-4" x2="-2.5" y2="-6" stroke="#87CEEB" strokeWidth="1.5" opacity={opacity * 0.25} />
          <line x1="0" y1="-4" x2="2.5" y2="-6" stroke="#87CEEB" strokeWidth="1.5" opacity={opacity * 0.25} />
        </g>
      ))}
      {/* 6 main arms */}
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <g key={angle} transform={`rotate(${angle})`}>
          {/* Main arm */}
          <line x1="0" y1="0" x2="0" y2="-8" stroke="#FFF" strokeWidth="1" opacity={opacity} />
          {/* Branch left */}
          <line x1="0" y1="-4" x2="-2.5" y2="-6" stroke="#FFF" strokeWidth="0.8" opacity={opacity * 0.9} />
          {/* Branch right */}
          <line x1="0" y1="-4" x2="2.5" y2="-6" stroke="#FFF" strokeWidth="0.8" opacity={opacity * 0.9} />
          {/* Tip detail */}
          <line x1="0" y1="-6.5" x2="-1.5" y2="-8" stroke="#FFF" strokeWidth="0.6" opacity={opacity * 0.8} />
          <line x1="0" y1="-6.5" x2="1.5" y2="-8" stroke="#FFF" strokeWidth="0.6" opacity={opacity * 0.8} />
        </g>
      ))}
      {/* Center dot with shadow */}
      <circle cx="0" cy="0" r="1.5" fill="#87CEEB" opacity={opacity * 0.3} />
      <circle cx="0" cy="0" r="1" fill="#FFF" opacity={opacity} />
    </g>
  );
}

// Dark storm cloud component
function StormCloud({ x, y, scale = 1, opacity = 0.9 }: {
  x: number; y: number; scale?: number; opacity?: number;
}) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* Dark ominous base */}
      <circle cx="0" cy="10" r="35" fill="#2C3E50" opacity={opacity} />
      <circle cx="-30" cy="8" r="28" fill="#34495E" opacity={opacity} />
      <circle cx="35" cy="12" r="30" fill="#2C3E50" opacity={opacity} />
      <circle cx="-50" cy="15" r="22" fill="#34495E" opacity={opacity * 0.9} />
      <circle cx="55" cy="14" r="24" fill="#2C3E50" opacity={opacity * 0.9} />

      {/* Top puffs */}
      <circle cx="0" cy="-5" r="28" fill="#3D5A73" opacity={opacity} />
      <circle cx="-20" cy="0" r="22" fill="#34495E" opacity={opacity} />
      <circle cx="25" cy="-2" r="24" fill="#3D5A73" opacity={opacity} />
      <circle cx="10" cy="-12" r="18" fill="#4A6B8A" opacity={opacity * 0.95} />
    </g>
  );
}

function WeatherScene({ type }: { type: SceneType }) {
  return (
    <svg
      className="w-full h-full"
      viewBox="0 0 800 200"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {/* Gradient definitions */}
        <linearGradient id="skyBlue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4FC3F7" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#81D4FA" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#B3E5FC" stopOpacity="0.3" />
        </linearGradient>

        {/* Morning/Sunrise sky gradients */}
        <linearGradient id="skyMorning" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#FF6B6B" stopOpacity="0.5" />
          <stop offset="25%" stopColor="#FFB347" stopOpacity="0.45" />
          <stop offset="50%" stopColor="#FFD93D" stopOpacity="0.4" />
          <stop offset="75%" stopColor="#87CEEB" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#6BB3F0" stopOpacity="0.3" />
        </linearGradient>

        <linearGradient id="skyMorningCloudy" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#E8A87C" stopOpacity="0.4" />
          <stop offset="40%" stopColor="#C9B8A8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#B0C4DE" stopOpacity="0.25" />
        </linearGradient>

        {/* Evening/Sunset sky gradients */}
        <linearGradient id="skyEvening" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#614385" stopOpacity="0.4" />
          <stop offset="25%" stopColor="#516395" stopOpacity="0.35" />
          <stop offset="50%" stopColor="#FF7E5F" stopOpacity="0.5" />
          <stop offset="75%" stopColor="#FF6B35" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#F9A825" stopOpacity="0.5" />
        </linearGradient>

        <linearGradient id="skyEveningCloudy" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A4063" stopOpacity="0.35" />
          <stop offset="50%" stopColor="#8E6B5A" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#C97B4A" stopOpacity="0.35" />
        </linearGradient>

        {/* Morning sun glow - softer, warmer */}
        <radialGradient id="sunGlowMorning" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFEC8B" stopOpacity="1" />
          <stop offset="30%" stopColor="#FFD700" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#FFA500" stopOpacity="0.5" />
          <stop offset="85%" stopColor="#FF6347" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FF4500" stopOpacity="0" />
        </radialGradient>

        {/* Evening sun glow - deeper, more orange/red */}
        <radialGradient id="sunGlowEvening" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="20%" stopColor="#FFE4B5" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#FF8C00" stopOpacity="0.8" />
          <stop offset="65%" stopColor="#FF4500" stopOpacity="0.5" />
          <stop offset="85%" stopColor="#DC143C" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#8B0000" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="skyNight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f0c29" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#302b63" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#24243e" stopOpacity="0.3" />
        </linearGradient>

        <linearGradient id="auroraGreen" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00ff87" stopOpacity="0" />
          <stop offset="30%" stopColor="#00ff87" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#60efff" stopOpacity="0.4" />
          <stop offset="70%" stopColor="#00ff87" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#00ff87" stopOpacity="0" />
        </linearGradient>

        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF176" stopOpacity="1" />
          <stop offset="30%" stopColor="#FFEB3B" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#FFC107" stopOpacity="0.6" />
          <stop offset="85%" stopColor="#FF9800" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FF6F00" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="moonGlow" cx="30%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="50%" stopColor="#F0F0F0" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#D0D0D0" stopOpacity="0.7" />
        </radialGradient>

        <linearGradient id="tornadoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2C3E50" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#5D6D7E" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#85929E" stopOpacity="0.6" />
        </linearGradient>

        <linearGradient id="warningRed" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C0392B" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#E74C3C" stopOpacity="0.15" />
        </linearGradient>

        <linearGradient id="starBeam" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FFE082" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFE082" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="gulfWater" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1565C0" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0D47A1" stopOpacity="0.8" />
        </linearGradient>

        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>

        <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" />
        </filter>

        <filter id="heavyBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="15" />
        </filter>
      </defs>

      {/* === SUNNY === */}
      {type === 'sunny' && (
        <g>
          <rect width="800" height="200" fill="url(#skyBlue)" />

          {/* Sun with glow - positioned for mobile visibility */}
          <circle cx="580" cy="55" r="100" fill="#FFD54F" opacity="0.25" filter="url(#heavyBlur)" />
          <circle cx="580" cy="55" r="70" fill="#FFEB3B" opacity="0.35" filter="url(#softBlur)" />
          <circle cx="580" cy="55" r="50" fill="url(#sunGlow)" />
          <circle cx="580" cy="55" r="38" fill="#FFEB3B" />
          <circle cx="580" cy="55" r="30" fill="#FFF59D" opacity="0.95" />

          {/* Sun rays */}
          <g className="animate-spin-slow" style={{ transformOrigin: '580px 55px' }}>
            {[...Array(12)].map((_, i) => (
              <line
                key={i}
                x1="580" y1="-15"
                x2="580" y2="15"
                stroke="#FFC107"
                strokeWidth={i % 2 === 0 ? 4 : 3}
                strokeLinecap="round"
                opacity={0.7}
                transform={`rotate(${i * 30} 580 55)`}
              />
            ))}
          </g>

          {/* Birds flying randomly */}
          <g className="animate-drift" style={{ animationDelay: '0s' }}>
            <path
              d="M120 45 q8 -6 16 0 q8 6 16 0"
              fill="none"
              stroke="#2C3E50"
              strokeWidth="2"
              opacity="0.4"
            />
          </g>
          <g className="animate-drift" style={{ animationDelay: '-30s' }}>
            <path
              d="M280 70 q6 -5 12 0 q6 5 12 0"
              fill="none"
              stroke="#2C3E50"
              strokeWidth="1.5"
              opacity="0.35"
            />
          </g>
          <g className="animate-drift" style={{ animationDelay: '-60s' }}>
            <path
              d="M450 55 q7 -5 14 0 q7 5 14 0"
              fill="none"
              stroke="#2C3E50"
              strokeWidth="1.8"
              opacity="0.38"
            />
          </g>
        </g>
      )}

      {/* === PARTLY CLOUDY === */}
      {type === 'partly-cloudy' && (
        <g>
          <rect width="800" height="200" fill="url(#skyBlue)" />

          {/* Sun peeking - positioned for mobile visibility */}
          <circle cx="550" cy="50" r="80" fill="#FFD54F" opacity="0.3" filter="url(#heavyBlur)" />
          <circle cx="550" cy="50" r="55" fill="#FFEB3B" opacity="0.4" filter="url(#softBlur)" />
          <circle cx="550" cy="50" r="42" fill="url(#sunGlow)" opacity="0.95" />
          <circle cx="550" cy="50" r="32" fill="#FFEB3B" />
          <circle cx="550" cy="50" r="24" fill="#FFF59D" opacity="0.9" />

          {/* Distant small clouds - background depth */}
          <g className="animate-drift-slower" style={{ animationDelay: '-20s' }}>
            <FluffyCloud x={180} y={35} scale={0.35} opacity={0.4} />
          </g>
          <g className="animate-drift-slower" style={{ animationDelay: '-70s' }}>
            <FluffyCloud x={420} y={28} scale={0.3} opacity={0.35} />
          </g>
          <g className="animate-drift-slower" style={{ animationDelay: '-110s' }}>
            <FluffyCloud x={580} y={32} scale={0.25} opacity={0.3} />
          </g>

          {/* Mid-layer clouds */}
          <g className="animate-drift-slow" style={{ animationDelay: '-45s' }}>
            <FluffyCloud x={50} y={95} scale={0.5} opacity={0.6} />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-85s' }}>
            <FluffyCloud x={350} y={110} scale={0.45} opacity={0.55} />
          </g>

          {/* Foreground fluffy clouds */}
          <g className="animate-drift-slow">
            <FluffyCloud x={100} y={65} scale={1} opacity={0.95} />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-30s' }}>
            <FluffyCloud x={280} y={75} scale={0.85} opacity={0.9} />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-60s' }}>
            <FluffyCloud x={480} y={60} scale={0.75} opacity={0.85} />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-90s' }}>
            <FluffyCloud x={700} y={80} scale={0.6} opacity={0.75} />
          </g>
        </g>
      )}

      {/* === CLOUDY === */}
      {type === 'cloudy' && (
        <g>
          <rect width="800" height="200" fill="#B0BEC5" opacity="0.2" />

          {/* Distant background clouds - depth layer */}
          <g className="animate-drift-slower" style={{ animationDelay: '-15s' }}>
            <FluffyCloud x={100} y={25} scale={0.4} opacity={0.35} shadowColor="#9099A0" color="#D8DEE4" />
          </g>
          <g className="animate-drift-slower" style={{ animationDelay: '-55s' }}>
            <FluffyCloud x={320} y={20} scale={0.35} opacity={0.3} shadowColor="#9099A0" color="#D8DEE4" />
          </g>
          <g className="animate-drift-slower" style={{ animationDelay: '-95s' }}>
            <FluffyCloud x={550} y={28} scale={0.38} opacity={0.32} shadowColor="#9099A0" color="#D8DEE4" />
          </g>
          <g className="animate-drift-slower" style={{ animationDelay: '-130s' }}>
            <FluffyCloud x={700} y={22} scale={0.32} opacity={0.28} shadowColor="#9099A0" color="#D8DEE4" />
          </g>

          {/* Mid-layer clouds */}
          <g className="animate-drift-slow" style={{ animationDelay: '-40s' }}>
            <FluffyCloud x={150} y={100} scale={0.6} opacity={0.5} shadowColor="#A0A8B0" color="#CCD4DC" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-80s' }}>
            <FluffyCloud x={450} y={110} scale={0.55} opacity={0.45} shadowColor="#A0A8B0" color="#CCD4DC" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-120s' }}>
            <FluffyCloud x={680} y={95} scale={0.5} opacity={0.42} shadowColor="#A0A8B0" color="#CCD4DC" />
          </g>

          {/* Foreground fluffy clouds */}
          <g className="animate-drift-slow">
            <FluffyCloud x={50} y={55} scale={1.1} opacity={0.95} shadowColor="#A0A8B0" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-25s' }}>
            <FluffyCloud x={200} y={70} scale={1} opacity={0.9} shadowColor="#A0A8B0" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-50s' }}>
            <FluffyCloud x={380} y={50} scale={1.15} opacity={0.95} shadowColor="#A0A8B0" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-75s' }}>
            <FluffyCloud x={550} y={65} scale={0.95} opacity={0.9} shadowColor="#A0A8B0" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-100s' }}>
            <FluffyCloud x={720} y={55} scale={0.85} opacity={0.85} shadowColor="#A0A8B0" />
          </g>
        </g>
      )}

      {/* === RAINY === */}
      {type === 'rainy' && (
        <g>
          <rect width="800" height="200" fill="#5D6D7E" opacity="0.2" />

          {/* Dark rain clouds */}
          <g className="animate-drift-slow">
            <StormCloud x={80} y={50} scale={1} opacity={0.9} />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-40s' }}>
            <StormCloud x={320} y={45} scale={1.1} opacity={0.95} />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-80s' }}>
            <StormCloud x={580} y={55} scale={0.95} opacity={0.9} />
          </g>

          {/* Rain drops */}
          {[...Array(50)].map((_, i) => {
            const x = 15 + i * 16;
            const delay = (i * 0.08) % 1.5;
            return (
              <line
                key={i}
                x1={x} y1={85 + (i % 5) * 12}
                x2={x - 3} y2={85 + (i % 5) * 12 + 20}
                stroke="#7FB3D5"
                strokeWidth={1.5}
                strokeLinecap="round"
                opacity={0.45}
                className="animate-rain"
                style={{ animationDelay: `${delay}s` }}
              />
            );
          })}
        </g>
      )}

      {/* === STORMY === */}
      {type === 'stormy' && (
        <g>
          <rect width="800" height="200" fill="#1A202C" opacity="0.35" />

          {/* Dark storm clouds */}
          <g className="animate-drift-slow">
            <StormCloud x={100} y={45} scale={1.2} opacity={0.95} />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-50s' }}>
            <StormCloud x={400} y={40} scale={1.3} opacity={0.98} />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-100s' }}>
            <StormCloud x={650} y={50} scale={1.1} opacity={0.92} />
          </g>

          {/* Zigzag Lightning bolt */}
          <g className="animate-flash" style={{ animationDuration: '3s' }}>
            {/* Outer glow */}
            <path
              d="M320 45 L335 75 L315 80 L340 115 L318 120 L350 170"
              fill="none"
              stroke="#FFF"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#heavyBlur)"
              opacity="0.6"
            />
            {/* White outline */}
            <path
              d="M320 45 L335 75 L315 80 L340 115 L318 120 L350 170"
              fill="none"
              stroke="#FFF"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Yellow core */}
            <path
              d="M320 45 L335 75 L315 80 L340 115 L318 120 L350 170"
              fill="none"
              stroke="#FFEB3B"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Flash glow behind bolt */}
            <circle cx="330" cy="110" r="50" fill="#FFEB3B" opacity="0.15" filter="url(#heavyBlur)" className="animate-flash" />
          </g>

          {/* Heavy rain */}
          {[...Array(70)].map((_, i) => {
            const x = 10 + i * 11.5;
            const delay = (i * 0.04) % 0.8;
            return (
              <line
                key={i}
                x1={x} y1={80 + (i % 6) * 10}
                x2={x - 5} y2={80 + (i % 6) * 10 + 25}
                stroke="#5DADE2"
                strokeWidth={2}
                strokeLinecap="round"
                opacity={0.4}
                className="animate-rain-fast"
                style={{ animationDelay: `${delay}s` }}
              />
            );
          })}
        </g>
      )}

      {/* === TORNADO - WARNING === */}
      {type === 'tornado' && (
        <g>
          {/* Ominous green-gray sky */}
          <rect width="800" height="200" fill="#2D3A2D" opacity="0.4" />
          <rect width="800" height="100" fill="#4A5D4A" opacity="0.2" />

          {/* Massive wall cloud base */}
          <ellipse cx="400" cy="35" rx="300" ry="45" fill="#1A1A1A" opacity="0.9" />
          <ellipse cx="400" cy="40" rx="250" ry="35" fill="#2C2C2C" opacity="0.85" />

          {/* Storm clouds */}
          <g className="animate-drift-slow">
            <StormCloud x={80} y={20} scale={1.4} opacity={0.98} />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-80s' }}>
            <StormCloud x={600} y={15} scale={1.5} opacity={0.95} />
          </g>

          {/* Tornado funnel - realistic rope tornado */}
          <g transform="translate(400, 55)">
            {/* Funnel cloud connection */}
            <ellipse cx="0" cy="0" rx="45" ry="20" fill="#3D3D3D" opacity="0.9" />

            {/* Main funnel - tapered with rotation lines */}
            <path
              d="M-40 5 Q-35 30 -25 60 Q-18 90 -12 120 Q-6 145 0 165 Q6 145 12 120 Q18 90 25 60 Q35 30 40 5 Z"
              fill="#4A4A4A"
              opacity="0.85"
            />
            {/* Inner funnel detail */}
            <path
              d="M-30 10 Q-25 35 -18 65 Q-12 95 -8 125 Q-3 148 0 160 Q3 148 8 125 Q12 95 18 65 Q25 35 30 10 Z"
              fill="#5D5D5D"
              opacity="0.7"
            />
            {/* Rotation bands */}
            <ellipse cx="0" cy="40" rx="28" ry="8" fill="none" stroke="#6B6B6B" strokeWidth="2" opacity="0.5" className="animate-spin-slow" style={{ transformOrigin: '0px 40px', animationDuration: '3s' }} />
            <ellipse cx="0" cy="80" rx="18" ry="5" fill="none" stroke="#6B6B6B" strokeWidth="1.5" opacity="0.4" className="animate-spin-slow" style={{ transformOrigin: '0px 80px', animationDuration: '2s' }} />
            <ellipse cx="0" cy="120" rx="10" ry="3" fill="none" stroke="#6B6B6B" strokeWidth="1" opacity="0.3" className="animate-spin-slow" style={{ transformOrigin: '0px 120px', animationDuration: '1.5s' }} />

            {/* Debris cloud at base */}
            <ellipse cx="0" cy="160" rx="50" ry="20" fill="#5D4037" opacity="0.5" filter="url(#softBlur)" />
            <ellipse cx="-15" cy="155" rx="25" ry="12" fill="#6D4C41" opacity="0.4" />
            <ellipse cx="20" cy="158" rx="20" ry="10" fill="#4E342E" opacity="0.45" />

            {/* Flying debris */}
            <g className="animate-spin-slow" style={{ transformOrigin: '0px 100px', animationDuration: '2s' }}>
              <rect x="-35" y="45" width="6" height="3" fill="#5D4037" opacity="0.7" transform="rotate(25)" />
              <rect x="28" y="65" width="5" height="2" fill="#4E342E" opacity="0.6" transform="rotate(-15)" />
              <circle cx="-22" cy="85" r="2.5" fill="#6D4C41" opacity="0.65" />
              <rect x="18" y="105" width="4" height="2" fill="#5D4037" opacity="0.6" transform="rotate(40)" />
            </g>
            <g className="animate-spin-slow" style={{ transformOrigin: '0px 100px', animationDuration: '2.5s', animationDirection: 'reverse' }}>
              <rect x="25" y="55" width="5" height="2" fill="#3E2723" opacity="0.6" transform="rotate(-30)" />
              <circle cx="-18" cy="95" r="2" fill="#5D4037" opacity="0.55" />
              <rect x="-30" y="115" width="4" height="2" fill="#4E342E" opacity="0.5" transform="rotate(60)" />
            </g>
          </g>

          {/* Ground dust/debris line */}
          <rect x="320" y="185" width="160" height="15" fill="#8D6E63" opacity="0.3" filter="url(#softBlur)" />

          {/* WARNING text */}
          <text x="120" y="185" textAnchor="middle" fill="#E74C3C" fontSize="16" fontWeight="bold" opacity="0.95">
            ⚠ TORNADO WARNING
          </text>
        </g>
      )}

      {/* === HURRICANE - WARNING === */}
      {type === 'hurricane' && (
        <g>
          {/* Satellite view background */}
          <rect width="800" height="200" fill="#0A1628" opacity="0.5" />

          {/* Gulf of Mexico map outline */}
          <g transform="translate(0, 0)">
            {/* Water */}
            <path
              d="M0 200 L0 80 Q50 60 150 55 Q250 50 350 60 Q420 70 480 100 Q520 120 550 100 Q600 70 680 60 Q750 55 800 70 L800 200 Z"
              fill="url(#gulfWater)"
              opacity="0.5"
            />
            {/* US Gulf Coast - simplified */}
            <path
              d="M0 80 Q50 60 150 55 Q200 50 250 48 L260 35 Q280 30 320 32 L340 45 Q380 55 420 70 Q450 82 480 100 Q500 112 520 100 Q540 85 580 75 Q620 68 680 60 Q720 55 780 58 L800 70"
              fill="#2D5016"
              opacity="0.7"
            />
            {/* Florida peninsula */}
            <path
              d="M580 75 Q590 90 600 120 Q605 150 595 175 Q590 185 580 190 L560 185 Q555 160 560 130 Q565 100 570 85 Q575 78 580 75 Z"
              fill="#2D5016"
              opacity="0.7"
            />
            {/* Texas coast detail */}
            <path
              d="M0 80 Q30 75 60 72 L70 85 Q50 90 30 92 L0 95 Z"
              fill="#2D5016"
              opacity="0.6"
            />
            {/* Mexico coast - Yucatan */}
            <path
              d="M150 200 L180 180 Q220 165 280 170 Q340 180 380 200 L150 200 Z"
              fill="#3D6B24"
              opacity="0.6"
            />
            {/* Cuba */}
            <ellipse cx="520" cy="175" rx="60" ry="12" fill="#3D6B24" opacity="0.6" transform="rotate(-10 520 175)" />
          </g>

          {/* Hurricane system with spiral clouds */}
          <g transform="translate(350, 110)">
            {/* Outer cloud bands - spiral arms */}
            <g className="animate-spin-slow" style={{ animationDuration: '40s' }}>
              <path
                d="M0 -75 C45 -70 70 -45 75 0 C70 45 45 70 0 75 C-25 72 -50 60 -60 40"
                fill="none"
                stroke="#E0E0E0"
                strokeWidth="22"
                strokeLinecap="round"
                opacity="0.75"
              />
              <path
                d="M0 75 C-45 70 -70 45 -75 0 C-70 -45 -45 -70 0 -75 C25 -72 50 -60 60 -40"
                fill="none"
                stroke="#E0E0E0"
                strokeWidth="20"
                strokeLinecap="round"
                opacity="0.7"
              />
            </g>

            {/* Inner rotation */}
            <g className="animate-spin-slow" style={{ animationDuration: '25s' }}>
              <path
                d="M0 -50 C30 -45 45 -30 50 0 C45 30 30 45 0 50 C-18 48 -35 38 -42 25"
                fill="none"
                stroke="#FFF"
                strokeWidth="15"
                strokeLinecap="round"
                opacity="0.8"
              />
              <path
                d="M0 50 C-30 45 -45 30 -50 0 C-45 -30 -30 -45 0 -50 C18 -48 35 -38 42 -25"
                fill="none"
                stroke="#FFF"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.75"
              />
            </g>

            {/* Eye wall */}
            <g className="animate-spin-slow" style={{ animationDuration: '15s' }}>
              <circle cx="0" cy="0" r="25" fill="none" stroke="#FFF" strokeWidth="10" opacity="0.85" />
            </g>

            {/* Clear eye */}
            <circle cx="0" cy="0" r="12" fill="#1565C0" opacity="0.8" />
            <circle cx="0" cy="0" r="8" fill="#0D47A1" opacity="0.9" />
          </g>

          {/* Wind swirl indicators */}
          {[
            { x: 150, y: 90, r: 25, dir: 1 },
            { x: 550, y: 85, r: 22, dir: -1 },
            { x: 200, y: 150, r: 20, dir: 1 },
            { x: 500, y: 160, r: 18, dir: -1 },
            { x: 680, y: 120, r: 15, dir: 1 },
          ].map((swirl, i) => (
            <g key={i} transform={`translate(${swirl.x}, ${swirl.y})`} className="animate-spin-slow" style={{ animationDuration: `${8 + i * 2}s`, animationDirection: swirl.dir > 0 ? 'normal' : 'reverse' }}>
              <path
                d={`M0 -${swirl.r} A${swirl.r} ${swirl.r} 0 0 1 ${swirl.r} 0`}
                fill="none"
                stroke="#90CAF9"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.5"
              />
              <path
                d={`M${swirl.r * 0.7} 0 A${swirl.r * 0.7} ${swirl.r * 0.7} 0 0 1 0 ${swirl.r * 0.7}`}
                fill="none"
                stroke="#90CAF9"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.4"
              />
            </g>
          ))}

          {/* Projected path cone */}
          <path
            d="M350 110 L280 40 L420 40 Z"
            fill="#E74C3C"
            opacity="0.15"
          />
          <path
            d="M350 110 L290 45 L410 45 Z"
            fill="none"
            stroke="#E74C3C"
            strokeWidth="1.5"
            strokeDasharray="5,3"
            opacity="0.5"
          />

          {/* WARNING text */}
          <text x="700" y="185" textAnchor="middle" fill="#E74C3C" fontSize="14" fontWeight="bold" opacity="0.95">
            ⚠ HURRICANE WARNING
          </text>

          {/* Category label */}
          <text x="700" y="30" textAnchor="middle" fill="#FFF" fontSize="11" fontWeight="bold" opacity="0.7">
            CAT 4
          </text>
        </g>
      )}

      {/* === SNOWY === */}
      {type === 'snowy' && (
        <g>
          <rect width="800" height="200" fill="#E8EEF2" opacity="0.15" />

          {/* Light gray clouds */}
          <g className="animate-drift-slow">
            <FluffyCloud x={100} y={50} scale={1} color="#E0E5EA" shadowColor="#C8D0D8" opacity={0.7} />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-40s' }}>
            <FluffyCloud x={350} y={55} scale={0.9} color="#E0E5EA" shadowColor="#C8D0D8" opacity={0.65} />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-80s' }}>
            <FluffyCloud x={600} y={45} scale={0.85} color="#E0E5EA" shadowColor="#C8D0D8" opacity={0.6} />
          </g>

          {/* Snowflakes - individual crystals floating down */}
          {[
            { x: 45, y: 30, size: 1.2, rot: 15, delay: 0 },
            { x: 120, y: 70, size: 0.9, rot: 30, delay: 2.1 },
            { x: 180, y: 45, size: 1.4, rot: 0, delay: 4.5 },
            { x: 250, y: 90, size: 1.0, rot: 45, delay: 1.2 },
            { x: 320, y: 35, size: 1.3, rot: 20, delay: 3.8 },
            { x: 400, y: 80, size: 0.8, rot: 10, delay: 5.2 },
            { x: 470, y: 50, size: 1.5, rot: 55, delay: 0.8 },
            { x: 540, y: 95, size: 1.1, rot: 25, delay: 6.1 },
            { x: 610, y: 40, size: 0.9, rot: 40, delay: 2.9 },
            { x: 680, y: 75, size: 1.2, rot: 5, delay: 4.2 },
            { x: 750, y: 55, size: 1.0, rot: 35, delay: 7.0 },
            { x: 80, y: 110, size: 1.1, rot: 50, delay: 1.5 },
            { x: 160, y: 130, size: 0.85, rot: 15, delay: 3.3 },
            { x: 230, y: 115, size: 1.3, rot: 28, delay: 5.8 },
            { x: 310, y: 140, size: 0.95, rot: 42, delay: 0.4 },
            { x: 380, y: 125, size: 1.15, rot: 8, delay: 2.6 },
            { x: 450, y: 145, size: 1.0, rot: 33, delay: 6.5 },
            { x: 520, y: 120, size: 1.25, rot: 18, delay: 4.0 },
            { x: 590, y: 135, size: 0.9, rot: 52, delay: 1.8 },
            { x: 660, y: 150, size: 1.05, rot: 12, delay: 5.5 },
            { x: 730, y: 128, size: 1.15, rot: 38, delay: 3.0 },
            { x: 30, y: 160, size: 0.8, rot: 22, delay: 7.3 },
            { x: 100, y: 175, size: 1.2, rot: 48, delay: 0.9 },
            { x: 200, y: 165, size: 1.0, rot: 3, delay: 4.8 },
            { x: 280, y: 180, size: 0.75, rot: 58, delay: 2.2 },
          ].map((flake, i) => (
            <g key={i} className="animate-snow-float" style={{ animationDelay: `${flake.delay}s` }}>
              <Snowflake x={flake.x} y={flake.y} size={flake.size} rotation={flake.rot} opacity={0.7 + (i % 3) * 0.1} />
            </g>
          ))}

          {/* Ground snow */}
          <ellipse cx="400" cy="195" rx="420" ry="18" fill="#FFF" opacity="0.25" filter="url(#softBlur)" />
        </g>
      )}

      {/* === NIGHT CLEAR === */}
      {type === 'night-clear' && (
        <g>
          <rect width="800" height="200" fill="url(#skyNight)" />

          {/* Subtle Milky Way band - smaller and dimmer for darker night sky */}
          <ellipse cx="400" cy="75" rx="180" ry="30" fill="#00AA55" opacity="0.08" filter="url(#heavyBlur)" />
          <ellipse cx="400" cy="75" rx="180" ry="30" fill="url(#auroraGreen)" opacity="0.15" filter="url(#heavyBlur)" className="animate-pulse" style={{ animationDuration: '8s' }} />
          <ellipse cx="300" cy="85" rx="120" ry="20" fill="#20B2AA" opacity="0.06" filter="url(#heavyBlur)" />
          <ellipse cx="300" cy="85" rx="120" ry="20" fill="#60efff" opacity="0.08" filter="url(#heavyBlur)" className="animate-pulse" style={{ animationDuration: '10s', animationDelay: '3s' }} />

          {/* Crescent moon - moved left to avoid temp display overlap on mobile */}
          <circle cx="480" cy="55" r="50" fill="#FFF8E1" opacity="0.1" filter="url(#heavyBlur)" />
          <circle cx="480" cy="55" r="30" fill="url(#moonGlow)" />
          <circle cx="493" cy="55" r="26" fill="#0f0c29" opacity="0.95" />

          {/* Stars - scattered naturally to avoid straight lines */}
          {[
            { x: 45, y: 32 }, { x: 118, y: 75 }, { x: 175, y: 22 }, { x: 247, y: 95 },
            { x: 310, y: 48 }, { x: 365, y: 108 }, { x: 412, y: 18 }, { x: 485, y: 62 },
            { x: 528, y: 135 }, { x: 595, y: 45 }, { x: 645, y: 118 }, { x: 755, y: 38 },
            { x: 88, y: 142 }, { x: 215, y: 85 }, { x: 385, y: 155 }, { x: 555, y: 28 },
            { x: 62, y: 58 }, { x: 148, y: 125 }, { x: 442, y: 72 }, { x: 708, y: 148 },
            { x: 275, y: 12 }, { x: 335, y: 165 }, { x: 678, y: 85 }, { x: 22, y: 105 },
          ].map((star, i) => (
            <g key={i}>
              {/* Golden outer glow for light mode */}
              <circle cx={star.x} cy={star.y} r={6 + (i % 2)} fill="#FFD700" opacity="0.15" filter="url(#softBlur)" />
              <circle cx={star.x} cy={star.y} r={4} fill="#FFF8E1" opacity="0.12" filter="url(#softBlur)" />
              <circle
                cx={star.x}
                cy={star.y}
                r={1.5 + (i % 3)}
                fill="#FFFDE7"
                opacity={0.6 + (i % 4) * 0.1}
                className="animate-twinkle"
                style={{ animationDelay: `${i * 0.3}s`, animationDuration: `${2 + (i % 3)}s` }}
              />
            </g>
          ))}
        </g>
      )}

      {/* === NIGHT CLOUDY === */}
      {type === 'night-cloudy' && (
        <g>
          <rect width="800" height="200" fill="url(#skyNight)" />

          {/* Moon glow behind clouds - moved left to avoid temp display overlap on mobile */}
          <circle cx="450" cy="55" r="55" fill="#FFF8E1" opacity="0.1" filter="url(#heavyBlur)" />

          {/* Night clouds - darker fluffy clouds */}
          <g className="animate-drift-slow">
            <FluffyCloud x={100} y={60} scale={0.95} color="#4A5568" shadowColor="#2D3748" opacity={0.7} />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-40s' }}>
            <FluffyCloud x={350} y={55} scale={1.05} color="#4A5568" shadowColor="#2D3748" opacity={0.75} />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-80s' }}>
            <FluffyCloud x={600} y={65} scale={0.85} color="#4A5568" shadowColor="#2D3748" opacity={0.65} />
          </g>

          {/* Stars peeking through with golden glow */}
          {[
            { x: 80, y: 28 }, { x: 250, y: 42 }, { x: 500, y: 130 }, { x: 750, y: 48 },
          ].map((star, i) => (
            <g key={i}>
              <circle cx={star.x} cy={star.y} r={5} fill="#FFD700" opacity="0.12" filter="url(#softBlur)" />
              <circle
                cx={star.x}
                cy={star.y}
                r={1.5 + (i % 2)}
                fill="#FFFDE7"
                opacity={0.5}
                className="animate-twinkle"
                style={{ animationDelay: `${i * 0.5}s` }}
              />
            </g>
          ))}
        </g>
      )}

      {/* === FOGGY === */}
      {type === 'foggy' && (
        <g>
          <rect width="800" height="200" fill="#CFD8DC" opacity="0.2" />

          {/* Hidden sun */}
          <circle cx="650" cy="55" r="45" fill="#FFF" opacity="0.1" filter="url(#heavyBlur)" />

          {/* Layered fog */}
          <g className="animate-drift-slow">
            <ellipse cx="0" cy="100" rx="320" ry="80" fill="#E0E0E0" opacity="0.3" filter="url(#heavyBlur)" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-50s' }}>
            <ellipse cx="400" cy="110" rx="380" ry="70" fill="#ECEFF1" opacity="0.35" filter="url(#heavyBlur)" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-100s' }}>
            <ellipse cx="750" cy="95" rx="280" ry="65" fill="#E0E0E0" opacity="0.3" filter="url(#heavyBlur)" />
          </g>

          {/* Ground fog */}
          <rect x="0" y="135" width="800" height="65" fill="#BDBDBD" opacity="0.3" filter="url(#softBlur)" />
          <rect x="0" y="160" width="800" height="40" fill="#CFD8DC" opacity="0.4" filter="url(#softBlur)" />
        </g>
      )}

      {/* === CHRISTMAS === */}
      {type === 'christmas' && (
        <g>
          {/* Night sky */}
          <rect width="800" height="200" fill="#0D1B2A" opacity="0.4" />

          {/* Stars - scattered naturally to avoid straight lines */}
          {[
            { x: 42, y: 18 }, { x: 95, y: 65 }, { x: 138, y: 28 }, { x: 182, y: 78 },
            { x: 225, y: 12 }, { x: 278, y: 55 }, { x: 315, y: 92 }, { x: 358, y: 35 },
            { x: 425, y: 68 }, { x: 468, y: 15 }, { x: 512, y: 82 }, { x: 565, y: 42 },
            { x: 618, y: 72 }, { x: 658, y: 25 }, { x: 705, y: 58 }, { x: 748, y: 88 },
            { x: 68, y: 45 }, { x: 155, y: 95 }, { x: 248, y: 38 }, { x: 345, y: 62 },
            { x: 488, y: 48 }, { x: 582, y: 15 }, { x: 635, y: 95 }, { x: 772, y: 32 },
          ].map((star, i) => (
            <g key={i}>
              <circle
                cx={star.x}
                cy={star.y}
                r={4}
                fill="#FFD700"
                opacity="0.1"
                filter="url(#softBlur)"
              />
              <circle
                cx={star.x}
                cy={star.y}
                r={1 + (i % 2) * 0.8}
                fill="#FFFDE7"
                opacity={0.5 + (i % 3) * 0.15}
                className="animate-twinkle"
                style={{ animationDelay: `${i * 0.25}s`, animationDuration: `${2.5 + (i % 3)}s` }}
              />
            </g>
          ))}

          {/* Star of Bethlehem - bright guiding star */}
          <g transform="translate(400, 25)">
            <circle cx="0" cy="0" r="25" fill="#FFE082" opacity="0.15" filter="url(#heavyBlur)" />
            <circle cx="0" cy="0" r="12" fill="#FFF8E1" opacity="0.3" filter="url(#glow)" />
            {/* Star rays */}
            <g className="animate-twinkle" style={{ animationDuration: '2s' }}>
              <line x1="0" y1="-18" x2="0" y2="18" stroke="#FFE082" strokeWidth="2" opacity="0.8" />
              <line x1="-18" y1="0" x2="18" y2="0" stroke="#FFE082" strokeWidth="2" opacity="0.8" />
              <line x1="-12" y1="-12" x2="12" y2="12" stroke="#FFE082" strokeWidth="1.5" opacity="0.6" />
              <line x1="12" y1="-12" x2="-12" y2="12" stroke="#FFE082" strokeWidth="1.5" opacity="0.6" />
            </g>
            <circle cx="0" cy="0" r="5" fill="#FFF" opacity="0.95" />
            {/* Light beam to manger */}
            <path d="M0 20 L-25 175 L25 175 Z" fill="url(#starBeam)" opacity="0.15" />
          </g>

          {/* Stable/Manger structure */}
          <g transform="translate(340, 95)">
            {/* Stable roof */}
            <polygon points="60,-25 120,25 0,25" fill="#5D4037" />
            <polygon points="60,-25 115,22 5,22" fill="#6D4C41" />
            {/* Roof texture */}
            <line x1="30" y1="0" x2="10" y2="20" stroke="#4E342E" strokeWidth="2" />
            <line x1="60" y1="-15" x2="40" y2="10" stroke="#4E342E" strokeWidth="2" />
            <line x1="90" y1="0" x2="110" y2="20" stroke="#4E342E" strokeWidth="2" />

            {/* Stable back wall */}
            <rect x="10" y="25" width="100" height="70" fill="#3E2723" opacity="0.6" />

            {/* Stable posts */}
            <rect x="5" y="20" width="8" height="80" fill="#5D4037" />
            <rect x="107" y="20" width="8" height="80" fill="#5D4037" />

            {/* Hay/straw on ground */}
            <ellipse cx="60" cy="95" rx="55" ry="10" fill="#C9A227" opacity="0.5" />
            <ellipse cx="60" cy="93" rx="45" ry="8" fill="#D4AF37" opacity="0.6" />

            {/* Manger/crib */}
            <g transform="translate(45, 65)">
              <rect x="0" y="10" width="30" height="20" fill="#6D4C41" />
              <rect x="-3" y="8" width="36" height="5" fill="#5D4037" />
              {/* Hay in manger */}
              <ellipse cx="15" cy="12" rx="12" ry="5" fill="#D4AF37" opacity="0.8" />
              {/* Baby Jesus - swaddled */}
              <ellipse cx="15" cy="8" rx="8" ry="4" fill="#FFF8E1" opacity="0.9" />
              {/* Baby head */}
              <circle cx="15" cy="4" r="5" fill="#FFCC80" />
              {/* Halo */}
              <circle cx="15" cy="4" r="8" fill="none" stroke="#FFE082" strokeWidth="1.5" opacity="0.6" className="animate-twinkle" style={{ animationDuration: '3s' }} />
            </g>

            {/* Mary - kneeling beside manger */}
            <g transform="translate(20, 50)">
              {/* Robe */}
              <ellipse cx="12" cy="40" rx="15" ry="12" fill="#1565C0" />
              <path d="M0 25 Q12 15 24 25 L20 50 L4 50 Z" fill="#1976D2" />
              {/* Head covering */}
              <ellipse cx="12" cy="18" rx="10" ry="12" fill="#1565C0" />
              {/* Face */}
              <circle cx="12" cy="15" r="7" fill="#FFCC80" />
              {/* Hair */}
              <ellipse cx="12" cy="12" rx="6" ry="4" fill="#5D4037" opacity="0.5" />
              {/* Praying hands */}
              <ellipse cx="18" cy="32" rx="4" ry="3" fill="#FFCC80" />
            </g>

            {/* Joseph - standing with staff */}
            <g transform="translate(85, 35)">
              {/* Robe */}
              <path d="M0 20 L-12 60 L20 60 L8 20 Z" fill="#6D4C41" />
              <rect x="-10" y="55" width="28" height="8" fill="#5D4037" />
              {/* Head covering */}
              <ellipse cx="4" cy="12" rx="9" ry="10" fill="#8D6E63" />
              {/* Face */}
              <circle cx="4" cy="10" r="7" fill="#FFCC80" />
              {/* Beard */}
              <ellipse cx="4" cy="14" rx="5" ry="4" fill="#5D4037" opacity="0.6" />
              {/* Staff */}
              <line x1="20" y1="0" x2="20" y2="65" stroke="#8D6E63" strokeWidth="3" />
              <circle cx="20" cy="-2" r="4" fill="#A1887F" />
            </g>
          </g>

          {/* Gentle snowfall - snowflake crystals */}
          {[
            { x: 60, y: 45, size: 0.9, rot: 12, delay: 0 },
            { x: 150, y: 80, size: 0.7, rot: 35, delay: 3.2 },
            { x: 250, y: 55, size: 1.0, rot: 8, delay: 5.8 },
            { x: 550, y: 70, size: 0.8, rot: 28, delay: 1.5 },
            { x: 650, y: 50, size: 0.85, rot: 45, delay: 4.1 },
            { x: 720, y: 85, size: 0.75, rot: 18, delay: 6.5 },
            { x: 100, y: 130, size: 0.9, rot: 52, delay: 2.3 },
            { x: 200, y: 150, size: 0.7, rot: 5, delay: 7.2 },
            { x: 580, y: 145, size: 0.8, rot: 38, delay: 0.8 },
            { x: 700, y: 125, size: 0.65, rot: 22, delay: 4.8 },
          ].map((flake, i) => (
            <g key={i} className="animate-snow-float" style={{ animationDelay: `${flake.delay}s` }}>
              <Snowflake x={flake.x} y={flake.y} size={flake.size} rotation={flake.rot} opacity={0.6 + (i % 3) * 0.1} />
            </g>
          ))}

          {/* Ground snow */}
          <ellipse cx="400" cy="195" rx="420" ry="12" fill="#FFF" opacity="0.2" filter="url(#softBlur)" />
        </g>
      )}

      {/* === THANKSGIVING === */}
      {type === 'thanksgiving' && (
        <g>
          <rect width="800" height="200" fill="#FF8A65" opacity="0.12" />
          <rect width="800" height="120" fill="#FFB74D" opacity="0.08" />

          {/* Harvest moon */}
          <circle cx="690" cy="55" r="52" fill="#FFCC80" opacity="0.22" filter="url(#heavyBlur)" />
          <circle cx="690" cy="55" r="40" fill="#FFB74D" opacity="0.85" />
          <circle cx="690" cy="55" r="34" fill="#FFA726" />

          {/* Falling maple leaves */}
          {[
            { x: 75, y: 38, color: '#E65100', rot: 22 },
            { x: 155, y: 78, color: '#BF360C', rot: -18 },
            { x: 235, y: 48, color: '#FF8F00', rot: 38 },
            { x: 315, y: 98, color: '#D84315', rot: -32 },
            { x: 395, y: 58, color: '#E65100', rot: 52 },
            { x: 475, y: 88, color: '#FF6F00', rot: -48 },
            { x: 545, y: 42, color: '#BF360C', rot: 18 },
            { x: 615, y: 108, color: '#D84315', rot: -58 },
          ].map((leaf, i) => (
            <g
              key={i}
              className="animate-fall-leaf"
              style={{ animationDelay: `${i * 0.55}s` }}
              transform={`translate(${leaf.x}, ${leaf.y}) rotate(${leaf.rot}) scale(${0.9 + (i % 3) * 0.1})`}
            >
              <path
                d="M0 0 C-4 -6 -9 -4 -12 0 C-9 -2 -7 2 -5 4 C-9 2 -14 4 -16 9 C-12 7 -7 9 -4 12 C-6 15 -4 20 0 25 C4 20 6 15 4 12 C7 9 12 7 16 9 C14 4 9 2 5 4 C7 2 9 -2 12 0 C9 -4 4 -6 0 0"
                fill={leaf.color}
                opacity="0.88"
              />
              <line x1="0" y1="0" x2="0" y2="25" stroke={leaf.color} strokeWidth="1.2" opacity="0.65" />
            </g>
          ))}

          {/* Cornucopia */}
          <g transform="translate(90, 128)" opacity="0.55">
            <ellipse cx="0" cy="0" rx="42" ry="26" fill="#8D6E63" />
            <ellipse cx="32" cy="-6" rx="16" ry="12" fill="#FF9800" />
            <ellipse cx="48" cy="4" rx="12" ry="10" fill="#F44336" />
            <ellipse cx="20" cy="8" rx="10" ry="8" fill="#FFC107" />
          </g>
        </g>
      )}

      {/* === EASTER === */}
      {type === 'easter' && (
        <g>
          <rect width="800" height="200" fill="#FF8A65" opacity="0.18" />
          <rect width="800" height="140" fill="#FFCC80" opacity="0.12" />
          <rect width="800" height="80" fill="#FFF8E1" opacity="0.1" />

          {/* Rising sun */}
          <circle cx="400" cy="185" r="110" fill="#FFCC80" opacity="0.22" filter="url(#heavyBlur)" />
          <circle cx="400" cy="185" r="65" fill="#FFB74D" opacity="0.5" />
          <circle cx="400" cy="185" r="48" fill="#FFA726" opacity="0.7" />

          {/* Light rays */}
          {[...Array(12)].map((_, i) => (
            <line
              key={i}
              x1="400" y1="185"
              x2={400 + Math.cos((i * 30 - 90) * Math.PI / 180) * 200}
              y2={185 + Math.sin((i * 30 - 90) * Math.PI / 180) * 200}
              stroke="#FFE082"
              strokeWidth={3.5 - (i % 2) * 1}
              opacity={0.12 + (i % 3) * 0.025}
            />
          ))}

          {/* Cross */}
          <g transform="translate(400, 38)">
            <rect x="-9" y="0" width="18" height="115" fill="#FFF" opacity="0.18" filter="url(#glow)" />
            <rect x="-7" y="0" width="14" height="115" fill="#5D4037" />
            <rect x="-40" y="28" width="80" height="12" fill="#5D4037" />
            <rect x="-4" y="3" width="3" height="109" fill="#8D6E63" opacity="0.45" />
            <rect x="-36" y="31" width="72" height="3" fill="#8D6E63" opacity="0.45" />
          </g>

          {/* Easter lilies with subtle outline for light mode */}
          {[{ x: 145, y: 155 }, { x: 245, y: 165 }, { x: 555, y: 160 }, { x: 655, y: 168 }].map((lily, i) => (
            <g key={i} transform={`translate(${lily.x}, ${lily.y})`}>
              {/* Subtle shadow/outline for light mode */}
              <ellipse cx="1" cy="2" rx="13" ry="23" fill="#C5CAE9" opacity="0.3" transform="rotate(-16)" />
              <ellipse cx="10" cy="-3" rx="11" ry="19" fill="#C5CAE9" opacity="0.25" transform="rotate(10)" />
              <ellipse cx="-8" cy="-3" rx="11" ry="19" fill="#C5CAE9" opacity="0.25" transform="rotate(-45)" />
              {/* Main petals */}
              <ellipse cx="0" cy="0" rx="12" ry="22" fill="#FFF" opacity="0.92" transform="rotate(-16)" />
              <ellipse cx="0" cy="0" rx="12" ry="22" fill="none" stroke="#E8EAF6" strokeWidth="1" opacity="0.4" transform="rotate(-16)" />
              <ellipse cx="9" cy="-5" rx="10" ry="18" fill="#FFF" opacity="0.88" transform="rotate(10)" />
              <ellipse cx="-9" cy="-5" rx="10" ry="18" fill="#FFF" opacity="0.88" transform="rotate(-45)" />
              <circle cx="0" cy="5" r="3.5" fill="#FFEB3B" opacity="0.85" />
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
            { x: 135, y: 68, colors: ['#FF5252', '#FFEB3B', '#FF9800'] },
            { x: 325, y: 52, colors: ['#2196F3', '#00BCD4', '#FFF'] },
            { x: 525, y: 78, colors: ['#9C27B0', '#E91E63', '#FF4081'] },
            { x: 695, y: 58, colors: ['#4CAF50', '#8BC34A', '#FFEB3B'] },
          ].map((fw, fwIndex) => (
            <g key={fwIndex} transform={`translate(${fw.x}, ${fw.y})`} className="animate-twinkle" style={{ animationDelay: `${fwIndex * 0.45}s`, animationDuration: '1.4s' }}>
              <circle cx="0" cy="0" r="10" fill={fw.colors[0]} opacity="0.7" />
              <circle cx="0" cy="0" r="18" fill={fw.colors[0]} opacity="0.22" filter="url(#glow)" />
              {[...Array(16)].map((_, i) => {
                const angle = (i * 22.5) * Math.PI / 180;
                const length = 28 + (i % 3) * 10;
                return (
                  <line
                    key={i}
                    x1="0" y1="0"
                    x2={Math.cos(angle) * length}
                    y2={Math.sin(angle) * length}
                    stroke={fw.colors[i % 3]}
                    strokeWidth={2.2 - (i % 2) * 0.6}
                    strokeLinecap="round"
                    opacity={0.72}
                  />
                );
              })}
            </g>
          ))}

          {/* Background stars - scattered naturally to avoid straight lines */}
          {[
            { x: 38, y: 25 }, { x: 85, y: 72 }, { x: 125, y: 18 }, { x: 172, y: 88 },
            { x: 215, y: 42 }, { x: 268, y: 95 }, { x: 305, y: 28 }, { x: 352, y: 68 },
            { x: 398, y: 15 }, { x: 445, y: 82 }, { x: 492, y: 35 }, { x: 538, y: 72 },
            { x: 585, y: 22 }, { x: 628, y: 58 }, { x: 672, y: 95 }, { x: 718, y: 38 },
            { x: 55, y: 52 }, { x: 148, y: 45 }, { x: 242, y: 65 }, { x: 375, y: 48 },
            { x: 508, y: 55 }, { x: 758, y: 75 },
          ].map((star, i) => (
            <g key={i}>
              <circle
                cx={star.x}
                cy={star.y}
                r={4}
                fill="#FFD700"
                opacity="0.1"
                filter="url(#softBlur)"
              />
              <circle
                cx={star.x}
                cy={star.y}
                r={1.5 + (i % 2)}
                fill="#FFFDE7"
                opacity={0.45 + (i % 3) * 0.1}
                className="animate-twinkle"
                style={{ animationDelay: `${i * 0.15}s`, animationDuration: `${2 + (i % 3)}s` }}
              />
            </g>
          ))}

          {/* Confetti */}
          {[...Array(18)].map((_, i) => (
            <rect
              key={i}
              x={45 + i * 42}
              y={122 + (i % 4) * 14}
              width="4"
              height="7"
              fill={['#FF5252', '#FFEB3B', '#2196F3', '#4CAF50', '#9C27B0'][i % 5]}
              opacity="0.58"
              transform={`rotate(${i * 28} ${47 + i * 42} ${126 + (i % 4) * 14})`}
              className="animate-fall-leaf"
              style={{ animationDelay: `${i * 0.08}s`, animationDuration: '2.8s' }}
            />
          ))}
        </g>
      )}

      {/* === VALENTINES === */}
      {type === 'valentines' && (
        <g>
          <rect width="800" height="200" fill="#FCE4EC" opacity="0.16" />
          <rect width="800" height="120" fill="#F8BBD9" opacity="0.08" />

          {/* Floating hearts */}
          {[
            { x: 78, y: 58, size: 1.05, color: '#E91E63' },
            { x: 175, y: 98, size: 0.72, color: '#F48FB1' },
            { x: 275, y: 50, size: 1.2, color: '#EC407A' },
            { x: 375, y: 118, size: 0.82, color: '#F06292' },
            { x: 475, y: 68, size: 1.1, color: '#E91E63' },
            { x: 575, y: 90, size: 0.92, color: '#F48FB1' },
            { x: 675, y: 55, size: 1.02, color: '#EC407A' },
            { x: 755, y: 108, size: 0.78, color: '#F06292' },
          ].map((heart, i) => (
            <g
              key={i}
              className="animate-float"
              style={{ animationDelay: `${i * 0.32}s` }}
              transform={`translate(${heart.x}, ${heart.y}) scale(${heart.size})`}
            >
              <path
                d="M0 10 C-10 -5 -28 -5 -28 10 C-28 28 0 45 0 45 C0 45 28 28 28 10 C28 -5 10 -5 0 10"
                fill={heart.color}
                opacity="0.18"
                filter="url(#softBlur)"
                transform="scale(1.2)"
              />
              <path
                d="M0 10 C-10 -5 -28 -5 -28 10 C-28 28 0 45 0 45 C0 45 28 28 28 10 C28 -5 10 -5 0 10"
                fill={heart.color}
                opacity="0.85"
              />
              <ellipse cx="-10" cy="5" rx="5" ry="4" fill="#FFF" opacity="0.4" />
            </g>
          ))}

          {/* Sparkles with pink glow for light mode visibility */}
          {[...Array(15)].map((_, i) => (
            <g key={i}>
              <circle
                cx={50 + i * 50}
                cy={30 + (i % 4) * 35}
                r="5"
                fill="#FF69B4"
                opacity="0.15"
                filter="url(#softBlur)"
              />
              <circle
                cx={50 + i * 50}
                cy={30 + (i % 4) * 35}
                r="2.2"
                fill="#FFF0F5"
                opacity="0.7"
                className="animate-twinkle"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            </g>
          ))}
        </g>
      )}

      {/* ============================================= */}
      {/* === MORNING VARIANTS (SUNRISE 5AM-8AM) ===== */}
      {/* ============================================= */}

      {/* === SUNNY MORNING === */}
      {type === 'sunny-morning' && (
        <g>
          <rect width="800" height="200" fill="url(#skyMorning)" />

          {/* Rising sun on horizon - low position with warm glow */}
          <ellipse cx="400" cy="185" rx="200" ry="60" fill="#FFE082" opacity="0.2" filter="url(#heavyBlur)" />
          <circle cx="400" cy="165" r="80" fill="#FF8A65" opacity="0.3" filter="url(#heavyBlur)" />
          <circle cx="400" cy="165" r="55" fill="#FFAB91" opacity="0.5" filter="url(#softBlur)" />
          <circle cx="400" cy="165" r="40" fill="url(#sunGlowMorning)" />
          <circle cx="400" cy="165" r="30" fill="#FFD54F" />
          <circle cx="400" cy="165" r="22" fill="#FFECB3" opacity="0.95" />

          {/* Morning light rays */}
          {[...Array(10)].map((_, i) => (
            <line
              key={i}
              x1="400" y1="165"
              x2={400 + Math.cos((i * 18 - 90) * Math.PI / 180) * 180}
              y2={165 + Math.sin((i * 18 - 90) * Math.PI / 180) * 180}
              stroke="#FFE082"
              strokeWidth={3 - (i % 2)}
              opacity={0.2 + (i % 3) * 0.05}
            />
          ))}

          {/* Early morning birds */}
          <g className="animate-drift" style={{ animationDelay: '0s' }}>
            <path d="M150 65 q6 -5 12 0 q6 5 12 0" fill="none" stroke="#5D4037" strokeWidth="1.5" opacity="0.4" />
          </g>
          <g className="animate-drift" style={{ animationDelay: '-25s' }}>
            <path d="M320 45 q5 -4 10 0 q5 4 10 0" fill="none" stroke="#5D4037" strokeWidth="1.3" opacity="0.35" />
          </g>
          <g className="animate-drift" style={{ animationDelay: '-50s' }}>
            <path d="M550 55 q7 -5 14 0 q7 5 14 0" fill="none" stroke="#5D4037" strokeWidth="1.6" opacity="0.38" />
          </g>
        </g>
      )}

      {/* === PARTLY CLOUDY MORNING === */}
      {type === 'partly-cloudy-morning' && (
        <g>
          <rect width="800" height="200" fill="url(#skyMorning)" />

          {/* Low sunrise */}
          <circle cx="550" cy="150" r="70" fill="#FFB74D" opacity="0.3" filter="url(#heavyBlur)" />
          <circle cx="550" cy="150" r="45" fill="#FFCC80" opacity="0.5" filter="url(#softBlur)" />
          <circle cx="550" cy="150" r="35" fill="url(#sunGlowMorning)" opacity="0.9" />
          <circle cx="550" cy="150" r="25" fill="#FFD54F" />

          {/* Morning clouds - pink/orange tinted */}
          <g className="animate-drift-slow">
            <FluffyCloud x={100} y={55} scale={0.9} opacity={0.85} color="#FFE4E1" shadowColor="#E8B4B4" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-35s' }}>
            <FluffyCloud x={280} y={70} scale={0.75} opacity={0.8} color="#FFDAB9" shadowColor="#E8C4A4" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-70s' }}>
            <FluffyCloud x={450} y={50} scale={0.7} opacity={0.75} color="#FFE4E1" shadowColor="#E8B4B4" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-100s' }}>
            <FluffyCloud x={680} y={75} scale={0.55} opacity={0.7} color="#FFDAB9" shadowColor="#E8C4A4" />
          </g>
        </g>
      )}

      {/* === CLOUDY MORNING === */}
      {type === 'cloudy-morning' && (
        <g>
          <rect width="800" height="200" fill="url(#skyMorningCloudy)" />

          {/* Hidden sun glow */}
          <circle cx="600" cy="120" r="60" fill="#FFE082" opacity="0.15" filter="url(#heavyBlur)" />

          {/* Pink-grey morning clouds */}
          <g className="animate-drift-slow">
            <FluffyCloud x={50} y={50} scale={1.05} opacity={0.9} shadowColor="#B8A8A0" color="#E8DCD8" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-30s' }}>
            <FluffyCloud x={220} y={65} scale={0.95} opacity={0.85} shadowColor="#B8A8A0" color="#E0D4D0" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-55s' }}>
            <FluffyCloud x={400} y={45} scale={1.1} opacity={0.9} shadowColor="#B8A8A0" color="#E8DCD8" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-80s' }}>
            <FluffyCloud x={580} y={60} scale={0.9} opacity={0.85} shadowColor="#B8A8A0" color="#E0D4D0" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-110s' }}>
            <FluffyCloud x={750} y={55} scale={0.8} opacity={0.8} shadowColor="#B8A8A0" color="#E8DCD8" />
          </g>
        </g>
      )}

      {/* === RAINY MORNING === */}
      {type === 'rainy-morning' && (
        <g>
          <rect width="800" height="200" fill="url(#skyMorningCloudy)" />
          <rect width="800" height="200" fill="#6B7C8C" opacity="0.15" />

          {/* Dark morning storm clouds */}
          <g className="animate-drift-slow">
            <StormCloud x={80} y={45} scale={0.95} opacity={0.85} />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-45s' }}>
            <StormCloud x={320} y={40} scale={1.05} opacity={0.9} />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-90s' }}>
            <StormCloud x={580} y={50} scale={0.9} opacity={0.85} />
          </g>

          {/* Morning rain - slightly warmer tint */}
          {[...Array(45)].map((_, i) => {
            const x = 18 + i * 17.5;
            const delay = (i * 0.09) % 1.5;
            return (
              <line
                key={i}
                x1={x} y1={85 + (i % 5) * 12}
                x2={x - 3} y2={85 + (i % 5) * 12 + 20}
                stroke="#8FA8BD"
                strokeWidth={1.5}
                strokeLinecap="round"
                opacity={0.4}
                className="animate-rain"
                style={{ animationDelay: `${delay}s` }}
              />
            );
          })}
        </g>
      )}

      {/* === SNOWY MORNING === */}
      {type === 'snowy-morning' && (
        <g>
          <rect width="800" height="200" fill="url(#skyMorningCloudy)" />
          <rect width="800" height="200" fill="#FFF0F5" opacity="0.08" />

          {/* Soft pink morning glow */}
          <ellipse cx="200" cy="180" rx="250" ry="80" fill="#FFB6C1" opacity="0.1" filter="url(#heavyBlur)" />

          {/* Light pinkish morning clouds */}
          <g className="animate-drift-slow">
            <FluffyCloud x={100} y={50} scale={0.95} color="#F5E8EA" shadowColor="#D8C8CC" opacity={0.65} />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-45s' }}>
            <FluffyCloud x={350} y={55} scale={0.85} color="#F5E8EA" shadowColor="#D8C8CC" opacity={0.6} />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-90s' }}>
            <FluffyCloud x={600} y={45} scale={0.8} color="#F5E8EA" shadowColor="#D8C8CC" opacity={0.55} />
          </g>

          {/* Morning snowflakes */}
          {[
            { x: 50, y: 35, size: 1.1, rot: 10, delay: 0 },
            { x: 130, y: 75, size: 0.85, rot: 25, delay: 2.5 },
            { x: 200, y: 50, size: 1.3, rot: 5, delay: 4.8 },
            { x: 280, y: 95, size: 0.95, rot: 40, delay: 1.3 },
            { x: 360, y: 40, size: 1.2, rot: 15, delay: 3.5 },
            { x: 440, y: 85, size: 0.75, rot: 55, delay: 5.5 },
            { x: 520, y: 55, size: 1.4, rot: 20, delay: 0.9 },
            { x: 600, y: 100, size: 1.0, rot: 30, delay: 6.2 },
            { x: 680, y: 45, size: 0.85, rot: 45, delay: 2.8 },
            { x: 760, y: 80, size: 1.15, rot: 8, delay: 4.0 },
          ].map((flake, i) => (
            <g key={i} className="animate-snow-float" style={{ animationDelay: `${flake.delay}s` }}>
              <Snowflake x={flake.x} y={flake.y} size={flake.size} rotation={flake.rot} opacity={0.65 + (i % 3) * 0.1} />
            </g>
          ))}

          {/* Ground snow with pink tint */}
          <ellipse cx="400" cy="195" rx="420" ry="18" fill="#FFF5F7" opacity="0.25" filter="url(#softBlur)" />
        </g>
      )}

      {/* === FOGGY MORNING === */}
      {type === 'foggy-morning' && (
        <g>
          <rect width="800" height="200" fill="url(#skyMorningCloudy)" />

          {/* Hidden sunrise glow */}
          <ellipse cx="400" cy="160" rx="200" ry="80" fill="#FFCC80" opacity="0.15" filter="url(#heavyBlur)" />
          <circle cx="400" cy="150" r="50" fill="#FFE082" opacity="0.1" filter="url(#heavyBlur)" />

          {/* Morning fog layers - warmer tint */}
          <g className="animate-drift-slow">
            <ellipse cx="0" cy="100" rx="320" ry="80" fill="#F5E8E0" opacity="0.35" filter="url(#heavyBlur)" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-50s' }}>
            <ellipse cx="400" cy="110" rx="380" ry="70" fill="#FFF5E8" opacity="0.4" filter="url(#heavyBlur)" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-100s' }}>
            <ellipse cx="750" cy="95" rx="280" ry="65" fill="#F5E8E0" opacity="0.35" filter="url(#heavyBlur)" />
          </g>

          {/* Ground fog */}
          <rect x="0" y="135" width="800" height="65" fill="#E8D8C8" opacity="0.3" filter="url(#softBlur)" />
          <rect x="0" y="160" width="800" height="40" fill="#F5E8DC" opacity="0.4" filter="url(#softBlur)" />
        </g>
      )}

      {/* ============================================= */}
      {/* === EVENING VARIANTS (SUNSET 5PM-8PM) ====== */}
      {/* ============================================= */}

      {/* === SUNNY EVENING === */}
      {type === 'sunny-evening' && (
        <g>
          <rect width="800" height="200" fill="url(#skyEvening)" />

          {/* Setting sun - low position with dramatic orange/red glow */}
          <ellipse cx="400" cy="185" rx="250" ry="80" fill="#FF6B35" opacity="0.25" filter="url(#heavyBlur)" />
          <circle cx="400" cy="160" r="100" fill="#FF4500" opacity="0.2" filter="url(#heavyBlur)" />
          <circle cx="400" cy="160" r="65" fill="#FF6347" opacity="0.4" filter="url(#softBlur)" />
          <circle cx="400" cy="160" r="48" fill="url(#sunGlowEvening)" />
          <circle cx="400" cy="160" r="35" fill="#FF8C00" />
          <circle cx="400" cy="160" r="26" fill="#FFDB58" opacity="0.95" />

          {/* Sunset rays - dramatic golden hour */}
          {[...Array(14)].map((_, i) => (
            <line
              key={i}
              x1="400" y1="160"
              x2={400 + Math.cos((i * 12.85 - 90) * Math.PI / 180) * 200}
              y2={160 + Math.sin((i * 12.85 - 90) * Math.PI / 180) * 200}
              stroke="#FFB347"
              strokeWidth={4 - (i % 3)}
              opacity={0.15 + (i % 4) * 0.03}
            />
          ))}

          {/* Silhouette birds heading home */}
          <g className="animate-drift" style={{ animationDelay: '-10s' }}>
            <path d="M620 65 q8 -6 16 0 q8 6 16 0" fill="none" stroke="#1A1A1A" strokeWidth="2" opacity="0.5" />
          </g>
          <g className="animate-drift" style={{ animationDelay: '-40s' }}>
            <path d="M520 85 q6 -5 12 0 q6 5 12 0" fill="none" stroke="#1A1A1A" strokeWidth="1.5" opacity="0.45" />
          </g>
          <g className="animate-drift" style={{ animationDelay: '-70s' }}>
            <path d="M580 55 q7 -5 14 0 q7 5 14 0" fill="none" stroke="#1A1A1A" strokeWidth="1.8" opacity="0.48" />
          </g>
        </g>
      )}

      {/* === PARTLY CLOUDY EVENING === */}
      {type === 'partly-cloudy-evening' && (
        <g>
          <rect width="800" height="200" fill="url(#skyEvening)" />

          {/* Low sunset behind clouds */}
          <circle cx="200" cy="145" r="80" fill="#FF6347" opacity="0.25" filter="url(#heavyBlur)" />
          <circle cx="200" cy="145" r="55" fill="#FF7F50" opacity="0.4" filter="url(#softBlur)" />
          <circle cx="200" cy="145" r="40" fill="url(#sunGlowEvening)" opacity="0.85" />
          <circle cx="200" cy="145" r="28" fill="#FFA500" />

          {/* Evening clouds - purple/orange tinted */}
          <g className="animate-drift-slow">
            <FluffyCloud x={80} y={60} scale={0.95} opacity={0.8} color="#E8C8D8" shadowColor="#8B6B7B" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-35s' }}>
            <FluffyCloud x={260} y={50} scale={0.8} opacity={0.75} color="#FFD4B8" shadowColor="#B8846B" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-65s' }}>
            <FluffyCloud x={420} y={70} scale={0.7} opacity={0.7} color="#E8C8D8" shadowColor="#8B6B7B" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-95s' }}>
            <FluffyCloud x={620} y={55} scale={0.6} opacity={0.65} color="#FFD4B8" shadowColor="#B8846B" />
          </g>
        </g>
      )}

      {/* === CLOUDY EVENING === */}
      {type === 'cloudy-evening' && (
        <g>
          <rect width="800" height="200" fill="url(#skyEveningCloudy)" />

          {/* Hidden sun glow */}
          <circle cx="150" cy="140" r="70" fill="#FF8C00" opacity="0.12" filter="url(#heavyBlur)" />

          {/* Purple-grey evening clouds */}
          <g className="animate-drift-slow">
            <FluffyCloud x={50} y={55} scale={1.0} opacity={0.85} shadowColor="#5D4A5D" color="#9B8B9B" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-28s' }}>
            <FluffyCloud x={220} y={70} scale={0.9} opacity={0.8} shadowColor="#5D4A5D" color="#A89BA8" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-56s' }}>
            <FluffyCloud x={400} y={50} scale={1.05} opacity={0.85} shadowColor="#5D4A5D" color="#9B8B9B" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-84s' }}>
            <FluffyCloud x={580} y={65} scale={0.85} opacity={0.8} shadowColor="#5D4A5D" color="#A89BA8" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-112s' }}>
            <FluffyCloud x={740} y={58} scale={0.75} opacity={0.75} shadowColor="#5D4A5D" color="#9B8B9B" />
          </g>
        </g>
      )}

      {/* === RAINY EVENING === */}
      {type === 'rainy-evening' && (
        <g>
          <rect width="800" height="200" fill="url(#skyEveningCloudy)" />
          <rect width="800" height="200" fill="#3D3D5C" opacity="0.15" />

          {/* Dark evening storm clouds */}
          <g className="animate-drift-slow">
            <StormCloud x={80} y={48} scale={1.0} opacity={0.9} />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-42s' }}>
            <StormCloud x={330} y={42} scale={1.1} opacity={0.95} />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-84s' }}>
            <StormCloud x={590} y={52} scale={0.95} opacity={0.88} />
          </g>

          {/* Evening rain - cooler tint */}
          {[...Array(48)].map((_, i) => {
            const x = 16 + i * 16.5;
            const delay = (i * 0.08) % 1.5;
            return (
              <line
                key={i}
                x1={x} y1={82 + (i % 5) * 12}
                x2={x - 3} y2={82 + (i % 5) * 12 + 20}
                stroke="#6B7B8B"
                strokeWidth={1.5}
                strokeLinecap="round"
                opacity={0.42}
                className="animate-rain"
                style={{ animationDelay: `${delay}s` }}
              />
            );
          })}
        </g>
      )}

      {/* === SNOWY EVENING === */}
      {type === 'snowy-evening' && (
        <g>
          <rect width="800" height="200" fill="url(#skyEveningCloudy)" />
          <rect width="800" height="200" fill="#E8E0F0" opacity="0.1" />

          {/* Soft purple evening glow */}
          <ellipse cx="600" cy="175" rx="250" ry="80" fill="#9370DB" opacity="0.12" filter="url(#heavyBlur)" />

          {/* Purple-grey evening clouds */}
          <g className="animate-drift-slow">
            <FluffyCloud x={100} y={52} scale={0.9} color="#D8D0E8" shadowColor="#8B7BAB" opacity={0.6} />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-42s' }}>
            <FluffyCloud x={350} y={58} scale={0.8} color="#D8D0E8" shadowColor="#8B7BAB" opacity={0.55} />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-84s' }}>
            <FluffyCloud x={600} y={48} scale={0.75} color="#D8D0E8" shadowColor="#8B7BAB" opacity={0.5} />
          </g>

          {/* Evening snowflakes */}
          {[
            { x: 55, y: 38, size: 1.05, rot: 12, delay: 0.2 },
            { x: 140, y: 78, size: 0.8, rot: 28, delay: 2.8 },
            { x: 220, y: 52, size: 1.25, rot: 8, delay: 5.2 },
            { x: 300, y: 98, size: 0.9, rot: 42, delay: 1.5 },
            { x: 380, y: 42, size: 1.15, rot: 18, delay: 3.8 },
            { x: 460, y: 88, size: 0.7, rot: 52, delay: 5.8 },
            { x: 540, y: 58, size: 1.35, rot: 22, delay: 1.0 },
            { x: 620, y: 102, size: 0.95, rot: 32, delay: 6.5 },
            { x: 700, y: 48, size: 0.8, rot: 48, delay: 3.0 },
            { x: 780, y: 82, size: 1.1, rot: 10, delay: 4.2 },
          ].map((flake, i) => (
            <g key={i} className="animate-snow-float" style={{ animationDelay: `${flake.delay}s` }}>
              <Snowflake x={flake.x} y={flake.y} size={flake.size} rotation={flake.rot} opacity={0.6 + (i % 3) * 0.1} />
            </g>
          ))}

          {/* Ground snow with purple tint */}
          <ellipse cx="400" cy="195" rx="420" ry="18" fill="#F5F0FA" opacity="0.25" filter="url(#softBlur)" />
        </g>
      )}

      {/* === FOGGY EVENING === */}
      {type === 'foggy-evening' && (
        <g>
          <rect width="800" height="200" fill="url(#skyEveningCloudy)" />

          {/* Hidden sunset glow */}
          <ellipse cx="200" cy="155" rx="180" ry="70" fill="#FF8C00" opacity="0.12" filter="url(#heavyBlur)" />
          <circle cx="200" cy="145" r="45" fill="#FFA500" opacity="0.08" filter="url(#heavyBlur)" />

          {/* Evening fog layers - purple/grey tint */}
          <g className="animate-drift-slow">
            <ellipse cx="0" cy="100" rx="320" ry="80" fill="#D8D0E0" opacity="0.3" filter="url(#heavyBlur)" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-50s' }}>
            <ellipse cx="400" cy="110" rx="380" ry="70" fill="#E0D8E8" opacity="0.35" filter="url(#heavyBlur)" />
          </g>
          <g className="animate-drift-slow" style={{ animationDelay: '-100s' }}>
            <ellipse cx="750" cy="95" rx="280" ry="65" fill="#D8D0E0" opacity="0.3" filter="url(#heavyBlur)" />
          </g>

          {/* Ground fog */}
          <rect x="0" y="135" width="800" height="65" fill="#A898B8" opacity="0.25" filter="url(#softBlur)" />
          <rect x="0" y="160" width="800" height="40" fill="#C8B8D8" opacity="0.35" filter="url(#softBlur)" />
        </g>
      )}
    </svg>
  );
}
