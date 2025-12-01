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
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none rounded-t-2xl"
      style={{ backgroundColor: 'var(--card-bg)' }}
    >
      {/* Weather scene */}
      <div className="absolute inset-0">
        <WeatherScene type={weather} />
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

function WeatherScene({ type }: { type: WeatherType }) {
  // Color palette - darker colors that are visible in both light and dark modes
  const colors = {
    sunny: { primary: '#D4890D', secondary: '#E9A825', accent: '#F5C842', bg: 'linear-gradient(135deg, rgba(212,137,13,0.12) 0%, rgba(233,168,37,0.06) 100%)' },
    'partly-cloudy': { primary: '#546E7A', secondary: '#607D8B', accent: '#78909C', bg: 'linear-gradient(135deg, rgba(84,110,122,0.1) 0%, rgba(96,125,139,0.05) 100%)' },
    cloudy: { primary: '#455A64', secondary: '#546E7A', accent: '#607D8B', bg: 'linear-gradient(135deg, rgba(69,90,100,0.12) 0%, rgba(84,110,122,0.06) 100%)' },
    rainy: { primary: '#3F51B5', secondary: '#5C6BC0', accent: '#7986CB', bg: 'linear-gradient(135deg, rgba(63,81,181,0.12) 0%, rgba(92,107,192,0.06) 100%)' },
    stormy: { primary: '#37474F', secondary: '#455A64', accent: '#FFC107', bg: 'linear-gradient(135deg, rgba(55,71,79,0.15) 0%, rgba(69,90,100,0.08) 100%)' },
    snowy: { primary: '#64B5F6', secondary: '#90CAF9', accent: '#BBDEFB', bg: 'linear-gradient(135deg, rgba(100,181,246,0.1) 0%, rgba(144,202,249,0.05) 100%)' },
    'night-clear': { primary: '#5E35B1', secondary: '#7E57C2', accent: '#FFB300', bg: 'linear-gradient(135deg, rgba(94,53,177,0.1) 0%, rgba(126,87,194,0.05) 100%)' },
    'night-cloudy': { primary: '#3F51B5', secondary: '#5C6BC0', accent: '#7986CB', bg: 'linear-gradient(135deg, rgba(63,81,181,0.08) 0%, rgba(92,107,192,0.04) 100%)' },
  };

  const c = colors[type];

  return (
    <svg
      className="w-full h-full"
      viewBox="0 0 800 200"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {/* Background gradient */}
        <linearGradient id={`skyGradient-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.primary} stopOpacity="0.15" />
          <stop offset="100%" stopColor={c.secondary} stopOpacity="0.05" />
        </linearGradient>

        {/* Glow filter for celestial bodies */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Soft blur for background elements */}
        <filter id="softBlur">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      {/* Background gradient fill */}
      <rect width="800" height="200" fill={`url(#skyGradient-${type})`} />

      {/* === SUNNY === */}
      {type === 'sunny' && (
        <g>
          {/* Large decorative sun */}
          <g className="animate-spin-slow" style={{ transformOrigin: '680px 80px' }}>
            {/* Sun rays - hand-drawn style */}
            {[...Array(16)].map((_, i) => (
              <line
                key={i}
                x1="680" y1="25"
                x2="680" y2="48"
                stroke={c.primary}
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.7"
                transform={`rotate(${i * 22.5} 680 80)`}
              />
            ))}
            {/* Inner glow */}
            <circle cx="680" cy="80" r="32" fill={c.accent} opacity="0.4" filter="url(#glow)" />
            {/* Sun body - multiple rings for depth */}
            <circle cx="680" cy="80" r="26" fill="none" stroke={c.primary} strokeWidth="3" opacity="0.9" />
            <circle cx="680" cy="80" r="18" fill="none" stroke={c.secondary} strokeWidth="2" opacity="0.7" />
            <circle cx="680" cy="80" r="10" fill={c.accent} opacity="0.6" />
          </g>

          {/* Subtle horizon line */}
          <path
            d="M0 200 Q200 180 400 195 Q600 210 800 190"
            fill="none"
            stroke={c.secondary}
            strokeWidth="1.5"
            opacity="0.25"
          />

          {/* Light wispy clouds */}
          <WispyCloud x={80} y={60} scale={1} color={c.secondary} opacity={0.25} delay={0} />
          <WispyCloud x={450} y={90} scale={0.7} color={c.secondary} opacity={0.2} delay={2} />
        </g>
      )}

      {/* === PARTLY CLOUDY === */}
      {type === 'partly-cloudy' && (
        <g>
          {/* Sun peeking through - darker gold for light mode visibility */}
          <g className="animate-spin-slow" style={{ transformOrigin: '680px 65px' }}>
            {[...Array(12)].map((_, i) => (
              <line
                key={i}
                x1="680" y1="20"
                x2="680" y2="44"
                stroke="#D4890D"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.75"
                transform={`rotate(${i * 30} 680 65)`}
              />
            ))}
            <circle cx="680" cy="65" r="30" fill="#E9A825" opacity="0.25" filter="url(#glow)" />
            <circle cx="680" cy="65" r="24" fill="none" stroke="#D4890D" strokeWidth="3" opacity="0.85" />
            <circle cx="680" cy="65" r="16" fill="#E9A825" opacity="0.5" />
          </g>

          {/* Layered clouds with depth - higher opacity for visibility */}
          <CloudFormation x={60} y={35} scale={1.4} color={c.primary} opacity={0.85} delay={0} />
          <CloudFormation x={280} y={65} scale={1.2} color={c.secondary} opacity={0.75} delay={1.5} />
          <CloudFormation x={480} y={30} scale={1.0} color={c.primary} opacity={0.8} delay={3} />
        </g>
      )}

      {/* === CLOUDY === */}
      {type === 'cloudy' && (
        <g>
          {/* Multiple cloud layers for overcast look */}
          <CloudFormation x={-20} y={30} scale={1.4} color={c.primary} opacity={0.85} delay={0} />
          <CloudFormation x={200} y={60} scale={1.2} color={c.secondary} opacity={0.75} delay={2} />
          <CloudFormation x={400} y={40} scale={1.3} color={c.primary} opacity={0.8} delay={1} />
          <CloudFormation x={580} y={70} scale={1.1} color={c.secondary} opacity={0.7} delay={3} />
          <CloudFormation x={720} y={35} scale={0.9} color={c.primary} opacity={0.75} delay={0.5} />
        </g>
      )}

      {/* === RAINY === */}
      {type === 'rainy' && (
        <g>
          {/* Dark clouds */}
          <CloudFormation x={50} y={40} scale={1.3} color={c.primary} opacity={0.85} delay={0} />
          <CloudFormation x={280} y={55} scale={1.4} color={c.secondary} opacity={0.75} delay={1.5} />
          <CloudFormation x={500} y={35} scale={1.2} color={c.primary} opacity={0.8} delay={0.8} />

          {/* Light rain - scattered drops */}
          {[...Array(45)].map((_, i) => (
            <RainDrop
              key={i}
              x={20 + (i * 17) + ((i * 7) % 11)}
              delay={i * 0.18 + ((i * 3) % 5) * 0.25}
            />
          ))}
        </g>
      )}

      {/* === STORMY === */}
      {type === 'stormy' && (
        <g>
          {/* Heavy dark clouds */}
          <CloudFormation x={20} y={30} scale={1.5} color={c.primary} opacity={0.9} delay={0} />
          <CloudFormation x={250} y={45} scale={1.6} color={c.secondary} opacity={0.85} delay={1} />
          <CloudFormation x={480} y={25} scale={1.4} color={c.primary} opacity={0.88} delay={0.5} />

          {/* Lightning bolt - artistic zigzag */}
          <g className="animate-flash">
            <path
              d="M380 90 L365 130 L375 130 L355 180 L395 120 L380 120 L400 90 Z"
              fill="none"
              stroke={c.accent}
              strokeWidth="3"
              strokeLinejoin="round"
              opacity="0.85"
            />
            <path
              d="M380 90 L365 130 L375 130 L355 180"
              fill="none"
              stroke="#FFF"
              strokeWidth="1.5"
              strokeLinejoin="round"
              opacity="0.6"
            />
          </g>

          {/* Heavy rain - more drops, faster */}
          {[...Array(60)].map((_, i) => (
            <RainDrop
              key={i}
              x={15 + (i * 13) + ((i * 5) % 9)}
              delay={i * 0.1 + ((i * 2) % 4) * 0.2}
              fast
            />
          ))}
        </g>
      )}

      {/* === SNOWY === */}
      {type === 'snowy' && (
        <g>
          {/* Soft clouds */}
          <CloudFormation x={100} y={50} scale={1.2} color={c.secondary} opacity={0.5} delay={0} />
          <CloudFormation x={400} y={40} scale={1.1} color={c.primary} opacity={0.45} delay={2} />

          {/* Snowflakes - delicate crystalline shapes */}
          {[...Array(20)].map((_, i) => (
            <Snowflake
              key={i}
              x={40 + i * 38}
              delay={i * 0.25}
              color={c.accent}
              size={5 + (i % 3) * 2}
            />
          ))}
        </g>
      )}

      {/* === NIGHT CLEAR === */}
      {type === 'night-clear' && (
        <g>
          {/* Crescent moon - elegant design */}
          <g filter="url(#glow)">
            <circle cx="680" cy="70" r="28" fill="none" stroke={c.accent} strokeWidth="2.5" opacity="0.75" />
            <path
              d="M668 48 A28 28 0 0 1 668 92 A20 20 0 0 0 668 48"
              fill={c.accent}
              opacity="0.45"
            />
            {/* Moon texture */}
            <circle cx="665" cy="65" r="4" fill={c.secondary} opacity="0.25" />
            <circle cx="678" cy="80" r="2.5" fill={c.secondary} opacity="0.2" />
          </g>

          {/* Stars - varied sizes and twinkle */}
          {[
            { x: 100, y: 40, size: 2.5 }, { x: 180, y: 80, size: 3 }, { x: 250, y: 35, size: 2 },
            { x: 320, y: 95, size: 2.5 }, { x: 400, y: 50, size: 3.5 }, { x: 480, y: 75, size: 2 },
            { x: 550, y: 45, size: 3 }, { x: 720, y: 110, size: 2.5 }, { x: 760, y: 55, size: 2 },
            { x: 150, y: 120, size: 2 }, { x: 380, y: 110, size: 2.5 }, { x: 600, y: 100, size: 3 },
          ].map((star, i) => (
            <Star key={i} x={star.x} y={star.y} size={star.size} color={c.accent} delay={i * 0.3} />
          ))}

          {/* Constellation hint */}
          <path
            d="M100 40 L180 80 L250 35"
            fill="none"
            stroke={c.secondary}
            strokeWidth="1"
            opacity="0.25"
            strokeDasharray="2 4"
          />
        </g>
      )}

      {/* === NIGHT CLOUDY === */}
      {type === 'night-cloudy' && (
        <g>
          {/* Moon behind clouds */}
          <circle cx="650" cy="65" r="24" fill={c.accent} opacity="0.25" filter="url(#softBlur)" />

          {/* Night clouds */}
          <CloudFormation x={80} y={50} scale={1.1} color={c.secondary} opacity={0.5} delay={0} />
          <CloudFormation x={350} y={70} scale={1.3} color={c.primary} opacity={0.55} delay={1.5} />
          <CloudFormation x={550} y={45} scale={1} color={c.secondary} opacity={0.48} delay={2.5} />

          {/* Dim stars peeking through */}
          {[
            { x: 120, y: 30, size: 2 }, { x: 280, y: 45, size: 2.5 }, { x: 450, y: 35, size: 2 },
            { x: 720, y: 90, size: 2.5 }, { x: 760, y: 40, size: 2 },
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
