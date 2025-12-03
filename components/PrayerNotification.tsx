'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  message: string;
  prayerTitle: string;
  type?: 'prayer_support' | 'milestone' | 'reminder';
}

interface PrayerNotificationProps {
  notification: Notification | null;
  onClose: () => void;
}

// Global audio context that persists across component renders
let globalAudioContext: AudioContext | null = null;

export function PrayerNotification({ notification, onClose }: PrayerNotificationProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Preload the audio on mount
  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.volume = 0.5;
    audioRef.current.load();
  }, []);

  useEffect(() => {
    if (notification) {
      playNotificationSound();
      // Vibrate on mobile
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  const playNotificationSound = async () => {
    // Check if sound was unlocked via the Enable Sound button
    const soundUnlocked = localStorage.getItem('soundUnlocked') === 'true';
    if (!soundUnlocked) {
      console.log('Sound not unlocked yet - skipping notification sound');
      return;
    }

    try {
      // Get or create the global AudioContext
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        if (!globalAudioContext) {
          globalAudioContext = new AudioContextClass();
        }
        if (globalAudioContext.state === 'suspended') {
          await globalAudioContext.resume();
        }
      }

      // Try to play the preloaded audio first
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      } else {
        // Fallback: create new audio
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.5;
        await audio.play();
      }
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  };

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-4 right-4 z-[9999] max-w-sm"
        >
          <div className="bg-gradient-to-r from-yellow-400/95 to-amber-400/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-yellow-300/50 p-4 pr-12">
            <button
              onClick={onClose}
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition-colors"
              aria-label="Close notification"
            >
              <span className="text-slate-900 font-bold text-lg">×</span>
            </button>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-2xl">🙏</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-900 font-bold text-sm mb-1">
                  Someone is praying for you!
                </p>
                <p className="text-slate-800 text-xs line-clamp-2">
                  &quot;{notification.prayerTitle}&quot;
                </p>
                <p className="text-slate-700 text-xs mt-2 font-medium">
                  ❤️ {notification.message}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
