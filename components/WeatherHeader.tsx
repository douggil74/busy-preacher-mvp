'use client';

import { useState, useEffect } from 'react';

type WeatherType = 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'night-clear' | 'night-cloudy';

export default function WeatherHeader() {
  const [weather, setWeather] = useState<WeatherType>('partly-cloudy');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const fetchWeather = async () => {
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

          setWeather(type);
        }
      } catch {
        const hour = new Date().getHours();
        if (hour < 6 || hour >= 20) {
          setWeather('night-clear');
        } else {
          setWeather('partly-cloudy');
        }
      }
    };

    fetchWeather();
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute top-0 left-0 right-0 h-72 overflow-hidden pointer-events-none z-0">
      {/* Gradient fade overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, transparent 30%, var(--bg-color) 100%)'
        }}
      />

      {/* Weather scene */}
      <div className="absolute inset-0 z-0">
        <WeatherScene type={weather} />
      </div>
    </div>
  );
}

function WeatherScene({ type }: { type: WeatherType }) {
  // Color palette based on weather
  const colors = {
    sunny: { primary: '#D4A574', secondary: '#E8C9A0', accent: '#F5DEB3' },
    'partly-cloudy': { primary: '#B8C4D0', secondary: '#D4DDE6', accent: '#E8EEF4' },
    cloudy: { primary: '#8899AA', secondary: '#A0B0C0', accent: '#B8C8D8' },
    rainy: { primary: '#6B7D8F', secondary: '#8899AA', accent: '#A0B0C0' },
    stormy: { primary: '#4A5568', secondary: '#606F80', accent: '#778899' },
    snowy: { primary: '#C8D4E0', secondary: '#E0E8F0', accent: '#F0F4F8' },
    'night-clear': { primary: '#4A5568', secondary: '#606F80', accent: '#778899' },
    'night-cloudy': { primary: '#3D4852', secondary: '#4A5568', accent: '#606F80' },
  };

  const c = colors[type];

  return (
    <svg
      className="w-full h-full"
      viewBox="0 0 800 300"
      preserveAspectRatio="xMidYMin slice"
    >
      <defs>
        {/* Glow filter for celestial bodies */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Soft blur for background elements */}
        <filter id="softBlur">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>

      {/* === SUNNY === */}
      {type === 'sunny' && (
        <g>
          {/* Large decorative sun */}
          <g className="animate-spin-slow" style={{ transformOrigin: '680px 80px' }}>
            {/* Sun rays - hand-drawn style */}
            {[...Array(16)].map((_, i) => (
              <line
                key={i}
                x1="680" y1="30"
                x2="680" y2="50"
                stroke={c.primary}
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.6"
                transform={`rotate(${i * 22.5} 680 80)`}
              />
            ))}
            {/* Inner glow */}
            <circle cx="680" cy="80" r="28" fill={c.accent} opacity="0.3" filter="url(#glow)" />
            {/* Sun body - multiple rings for depth */}
            <circle cx="680" cy="80" r="22" fill="none" stroke={c.primary} strokeWidth="2.5" opacity="0.8" />
            <circle cx="680" cy="80" r="16" fill="none" stroke={c.secondary} strokeWidth="1.5" opacity="0.6" />
            <circle cx="680" cy="80" r="8" fill={c.accent} opacity="0.4" />
          </g>

          {/* Subtle horizon line */}
          <path
            d="M0 200 Q200 180 400 195 Q600 210 800 190"
            fill="none"
            stroke={c.secondary}
            strokeWidth="1"
            opacity="0.2"
          />

          {/* Light wispy clouds */}
          <WispyCloud x={80} y={60} scale={1} color={c.secondary} opacity={0.15} delay={0} />
          <WispyCloud x={450} y={90} scale={0.7} color={c.secondary} opacity={0.1} delay={2} />
        </g>
      )}

      {/* === PARTLY CLOUDY === */}
      {type === 'partly-cloudy' && (
        <g>
          {/* Sun peeking through */}
          <g className="animate-spin-slow" style={{ transformOrigin: '650px 70px' }}>
            {[...Array(12)].map((_, i) => (
              <line
                key={i}
                x1="650" y1="30"
                x2="650" y2="45"
                stroke={c.accent}
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.4"
                transform={`rotate(${i * 30} 650 70)`}
              />
            ))}
            <circle cx="650" cy="70" r="18" fill="none" stroke={c.accent} strokeWidth="2" opacity="0.5" />
            <circle cx="650" cy="70" r="10" fill={c.accent} opacity="0.2" />
          </g>

          {/* Layered clouds with depth */}
          <CloudFormation x={100} y={50} scale={1.2} color={c.primary} opacity={0.35} delay={0} />
          <CloudFormation x={350} y={80} scale={1} color={c.secondary} opacity={0.25} delay={1.5} />
          <CloudFormation x={550} y={45} scale={0.8} color={c.primary} opacity={0.3} delay={3} />
        </g>
      )}

      {/* === CLOUDY === */}
      {type === 'cloudy' && (
        <g>
          {/* Multiple cloud layers for overcast look */}
          <CloudFormation x={-20} y={30} scale={1.4} color={c.primary} opacity={0.4} delay={0} />
          <CloudFormation x={200} y={60} scale={1.2} color={c.secondary} opacity={0.35} delay={2} />
          <CloudFormation x={400} y={40} scale={1.3} color={c.primary} opacity={0.38} delay={1} />
          <CloudFormation x={580} y={70} scale={1.1} color={c.secondary} opacity={0.32} delay={3} />
          <CloudFormation x={720} y={35} scale={0.9} color={c.primary} opacity={0.36} delay={0.5} />
        </g>
      )}

      {/* === RAINY === */}
      {type === 'rainy' && (
        <g>
          {/* Dark clouds */}
          <CloudFormation x={50} y={40} scale={1.3} color={c.primary} opacity={0.5} delay={0} />
          <CloudFormation x={280} y={55} scale={1.4} color={c.secondary} opacity={0.45} delay={1.5} />
          <CloudFormation x={500} y={35} scale={1.2} color={c.primary} opacity={0.48} delay={0.8} />

          {/* Rain drops - elegant lines */}
          {[...Array(25)].map((_, i) => (
            <RainLine
              key={i}
              x={30 + i * 30 + (i % 3) * 10}
              delay={i * 0.12}
              color={c.accent}
            />
          ))}
        </g>
      )}

      {/* === STORMY === */}
      {type === 'stormy' && (
        <g>
          {/* Heavy dark clouds */}
          <CloudFormation x={20} y={30} scale={1.5} color={c.primary} opacity={0.6} delay={0} />
          <CloudFormation x={250} y={45} scale={1.6} color={c.secondary} opacity={0.55} delay={1} />
          <CloudFormation x={480} y={25} scale={1.4} color={c.primary} opacity={0.58} delay={0.5} />

          {/* Lightning bolt - artistic zigzag */}
          <g className="animate-flash">
            <path
              d="M380 90 L365 130 L375 130 L355 180 L395 120 L380 120 L400 90 Z"
              fill="none"
              stroke={c.accent}
              strokeWidth="2"
              strokeLinejoin="round"
              opacity="0.7"
            />
            <path
              d="M380 90 L365 130 L375 130 L355 180"
              fill="none"
              stroke="#FFF"
              strokeWidth="1"
              strokeLinejoin="round"
              opacity="0.5"
            />
          </g>

          {/* Heavy rain */}
          {[...Array(35)].map((_, i) => (
            <RainLine
              key={i}
              x={20 + i * 22}
              delay={i * 0.08}
              color={c.accent}
              fast
            />
          ))}
        </g>
      )}

      {/* === SNOWY === */}
      {type === 'snowy' && (
        <g>
          {/* Soft clouds */}
          <CloudFormation x={100} y={50} scale={1.2} color={c.secondary} opacity={0.3} delay={0} />
          <CloudFormation x={400} y={40} scale={1.1} color={c.primary} opacity={0.28} delay={2} />

          {/* Snowflakes - delicate crystalline shapes */}
          {[...Array(20)].map((_, i) => (
            <Snowflake
              key={i}
              x={40 + i * 38}
              delay={i * 0.25}
              color={c.accent}
              size={4 + (i % 3) * 2}
            />
          ))}
        </g>
      )}

      {/* === NIGHT CLEAR === */}
      {type === 'night-clear' && (
        <g>
          {/* Crescent moon - elegant design */}
          <g filter="url(#glow)">
            <circle cx="650" cy="70" r="24" fill="none" stroke={c.accent} strokeWidth="2" opacity="0.6" />
            <path
              d="M640 50 A24 24 0 0 1 640 90 A18 18 0 0 0 640 50"
              fill={c.accent}
              opacity="0.3"
            />
            {/* Moon texture */}
            <circle cx="638" cy="65" r="3" fill={c.secondary} opacity="0.2" />
            <circle cx="648" cy="78" r="2" fill={c.secondary} opacity="0.15" />
          </g>

          {/* Stars - varied sizes and twinkle */}
          {[
            { x: 100, y: 40, size: 1.5 }, { x: 180, y: 80, size: 2 }, { x: 250, y: 35, size: 1 },
            { x: 320, y: 95, size: 1.5 }, { x: 400, y: 50, size: 2.5 }, { x: 480, y: 75, size: 1 },
            { x: 550, y: 45, size: 2 }, { x: 720, y: 110, size: 1.5 }, { x: 760, y: 55, size: 1 },
            { x: 150, y: 120, size: 1 }, { x: 380, y: 110, size: 1.5 }, { x: 600, y: 100, size: 2 },
          ].map((star, i) => (
            <Star key={i} x={star.x} y={star.y} size={star.size} color={c.accent} delay={i * 0.3} />
          ))}

          {/* Constellation hint */}
          <path
            d="M100 40 L180 80 L250 35"
            fill="none"
            stroke={c.secondary}
            strokeWidth="0.5"
            opacity="0.15"
            strokeDasharray="2 4"
          />
        </g>
      )}

      {/* === NIGHT CLOUDY === */}
      {type === 'night-cloudy' && (
        <g>
          {/* Moon behind clouds */}
          <circle cx="600" cy="65" r="20" fill={c.accent} opacity="0.15" filter="url(#softBlur)" />

          {/* Night clouds */}
          <CloudFormation x={80} y={50} scale={1.1} color={c.secondary} opacity={0.3} delay={0} />
          <CloudFormation x={350} y={70} scale={1.3} color={c.primary} opacity={0.35} delay={1.5} />
          <CloudFormation x={550} y={45} scale={1} color={c.secondary} opacity={0.32} delay={2.5} />

          {/* Dim stars peeking through */}
          {[
            { x: 120, y: 30, size: 1 }, { x: 280, y: 45, size: 1.5 }, { x: 450, y: 35, size: 1 },
            { x: 720, y: 90, size: 1.5 }, { x: 760, y: 40, size: 1 },
          ].map((star, i) => (
            <Star key={i} x={star.x} y={star.y} size={star.size} color={c.accent} delay={i * 0.4} dim />
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
      {/* Main cloud body - multiple overlapping curves for organic feel */}
      <path
        d="M20 60 Q20 45 35 45 Q40 30 60 32 Q75 20 95 28 Q115 18 135 30 Q155 25 165 40 Q180 38 185 52 Q195 55 190 68 Q188 78 175 80 L25 80 Q10 78 10 65 Q8 55 20 60"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={opacity}
      />
      {/* Inner detail lines */}
      <path
        d="M40 55 Q55 48 75 52 Q95 45 115 50"
        fill="none"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        opacity={opacity * 0.5}
      />
      <path
        d="M60 65 Q80 60 100 63 Q120 58 140 62"
        fill="none"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        opacity={opacity * 0.4}
      />
    </g>
  );
}

function RainLine({ x, delay, color, fast = false }: {
  x: number; delay: number; color: string; fast?: boolean
}) {
  return (
    <line
      x1={x} y1="-10"
      x2={x - 8} y2="40"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.4"
      className={fast ? 'animate-rain-fast' : 'animate-rain'}
      style={{ animationDelay: `${delay}s` }}
    />
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
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.5"
            transform={`rotate(${angle})`}
          />
        ))}
        <circle cx="0" cy="0" r={size * 0.3} fill={color} opacity="0.3" />
      </g>
    </g>
  );
}

function Star({ x, y, size, color, delay, dim = false }: {
  x: number; y: number; size: number; color: string; delay: number; dim?: boolean
}) {
  return (
    <g
      className="animate-twinkle"
      style={{ animationDelay: `${delay}s` }}
      transform={`translate(${x}, ${y})`}
    >
      {/* Four-pointed star */}
      <path
        d={`M0 ${-size} L${size * 0.3} 0 L0 ${size} L${-size * 0.3} 0 Z`}
        fill={color}
        opacity={dim ? 0.2 : 0.5}
      />
      <path
        d={`M${-size} 0 L0 ${size * 0.3} L${size} 0 L0 ${-size * 0.3} Z`}
        fill={color}
        opacity={dim ? 0.15 : 0.4}
      />
    </g>
  );
}
