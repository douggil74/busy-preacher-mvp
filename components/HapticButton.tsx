'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { isFromIOSApp } from '@/lib/platform-detector';

/**
 * Trigger haptic feedback on iOS
 */
async function triggerHaptic(style: 'light' | 'medium' | 'heavy' = 'light') {
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({
      style: style === 'heavy' ? ImpactStyle.Heavy :
             style === 'light' ? ImpactStyle.Light :
             ImpactStyle.Medium
    });
  } catch (error) {
    // Silently fail on web
  }
}

interface HapticLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hapticStyle?: 'light' | 'medium' | 'heavy';
  onClick?: () => void;
}

/**
 * Link component with native haptic feedback on iOS
 */
export function HapticLink({
  href,
  children,
  className,
  style,
  hapticStyle = 'light',
  onClick,
}: HapticLinkProps) {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(isFromIOSApp());
  }, []);

  const handleClick = useCallback(() => {
    if (isNative) {
      triggerHaptic(hapticStyle);
    }
    onClick?.();
  }, [isNative, hapticStyle, onClick]);

  return (
    <Link
      href={href}
      className={className}
      style={style}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}

interface HapticButtonProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hapticStyle?: 'light' | 'medium' | 'heavy';
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Button component with native haptic feedback on iOS
 */
export function HapticButton({
  children,
  className,
  style,
  hapticStyle = 'light',
  onClick,
  disabled,
  type = 'button',
}: HapticButtonProps) {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(isFromIOSApp());
  }, []);

  const handleClick = useCallback(() => {
    if (isNative && !disabled) {
      triggerHaptic(hapticStyle);
    }
    onClick?.();
  }, [isNative, hapticStyle, onClick, disabled]);

  return (
    <button
      type={type}
      className={className}
      style={style}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

/**
 * Hook to manually trigger haptic feedback
 */
export function useHapticFeedback() {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(isFromIOSApp());
  }, []);

  const trigger = useCallback(async (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (isNative) {
      await triggerHaptic(style);
    }
  }, [isNative]);

  return { trigger, isNative };
}
