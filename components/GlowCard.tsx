'use client';

import { ReactNode, useState } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  variant?: 'default' | 'featured' | 'stat';
  onClick?: () => void;
}

export default function GlowCard({
  children,
  className = '',
  glowColor = 'var(--accent-color)',
  variant = 'default',
  onClick
}: GlowCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyles = `
    relative rounded-2xl transition-all duration-300 ease-out
    hover:scale-[1.02] cursor-pointer overflow-hidden
  `;

  const variantStyles = {
    default: {
      padding: 'p-6',
      background: 'var(--card-bg)',
      border: '1px solid var(--card-border)',
    },
    featured: {
      padding: 'p-6 md:p-8',
      background: `linear-gradient(135deg, color-mix(in srgb, ${glowColor} 15%, var(--card-bg)) 0%, var(--card-bg) 100%)`,
      border: `1px solid color-mix(in srgb, ${glowColor} 30%, transparent)`,
    },
    stat: {
      padding: 'p-5',
      background: `linear-gradient(135deg, color-mix(in srgb, ${glowColor} 10%, var(--card-bg)) 0%, var(--card-bg) 100%)`,
      border: `1px solid color-mix(in srgb, ${glowColor} 25%, transparent)`,
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`${baseStyles} ${styles.padding} ${className} glow-card`}
      style={{
        background: styles.background,
        border: styles.border,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        ['--glow-color' as string]: glowColor,
        zIndex: isHovered ? 50 : 1,
        position: 'relative',
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative blur orb for featured cards */}
      {variant === 'featured' && (
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity duration-300 group-hover:opacity-40"
          style={{ backgroundColor: glowColor }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Hover glow effect */}
      <style jsx>{`
        .glow-card {
          isolation: isolate;
        }
        .glow-card:hover {
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.3),
            0 0 60px color-mix(in srgb, var(--glow-color) 30%, transparent),
            0 0 100px color-mix(in srgb, var(--glow-color) 15%, transparent),
            inset 0 1px 0 color-mix(in srgb, var(--glow-color) 10%, transparent);
          border-color: color-mix(in srgb, var(--glow-color) 50%, transparent);
        }
      `}</style>
    </div>
  );
}

// Preset color variants for common use cases
export const cardColors = {
  gold: '#facc15',
  red: '#ef4444',
  blue: '#60a5fa',
  green: '#22c55e',
  purple: '#a78bfa',
  pink: '#f472b6',
  orange: '#f97316',
};
