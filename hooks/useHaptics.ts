'use client';

import { useCallback, useEffect, useState } from 'react';
import { isFromIOSApp } from '@/lib/platform-detector';

/**
 * Custom hook for haptic feedback
 * Provides native iOS haptics when running in Capacitor
 */
export function useHaptics() {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(isFromIOSApp());
  }, []);

  const triggerImpact = useCallback(async (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (!isNative) return;

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
  }, [isNative]);

  const triggerNotification = useCallback(async (type: 'success' | 'warning' | 'error' = 'success') => {
    if (!isNative) return;

    try {
      const { Haptics, NotificationType } = await import('@capacitor/haptics');
      await Haptics.notification({
        type: type === 'error' ? NotificationType.Error :
              type === 'warning' ? NotificationType.Warning :
              NotificationType.Success
      });
    } catch (error) {
      // Silently fail on web
    }
  }, [isNative]);

  const triggerSelection = useCallback(async () => {
    if (!isNative) return;

    try {
      const { Haptics } = await import('@capacitor/haptics');
      await Haptics.selectionChanged();
    } catch (error) {
      // Silently fail on web
    }
  }, [isNative]);

  // Convenience methods
  const tap = useCallback(() => triggerImpact('light'), [triggerImpact]);
  const medium = useCallback(() => triggerImpact('medium'), [triggerImpact]);
  const heavy = useCallback(() => triggerImpact('heavy'), [triggerImpact]);
  const success = useCallback(() => triggerNotification('success'), [triggerNotification]);
  const warning = useCallback(() => triggerNotification('warning'), [triggerNotification]);
  const error = useCallback(() => triggerNotification('error'), [triggerNotification]);

  return {
    isNative,
    triggerImpact,
    triggerNotification,
    triggerSelection,
    // Convenience methods
    tap,
    medium,
    heavy,
    success,
    warning,
    error,
  };
}
