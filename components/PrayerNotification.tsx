'use client';

import { useEffect, useState } from 'react';
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

export function PrayerNotification({ notification, onClose }: PrayerNotificationProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Load sound preference from localStorage
  useEffect(() => {
    const savedPref = localStorage.getItem('notificationSound');
    if (savedPref !== null) {
      setSoundEnabled(savedPref === 'true');
    }
  }, []);

  useEffect(() => {
    if (notification && soundEnabled) {
      playNotificationSound(notification.type);
      // Vibrate on mobile as fallback (works even when sound blocked)
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]); // vibrate pattern
      }
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    } else if (notification) {
      // Still vibrate even if sound is disabled (important for mobile)
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
      // Still set timer to close even if sound is disabled
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, soundEnabled, onClose]);

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    localStorage.setItem('notificationSound', String(newState));
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
            
            {/* Sound toggle button */}
            <button
              onClick={toggleSound}
              className="absolute top-2 right-12 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition-colors"
              aria-label={soundEnabled ? 'Mute notifications' : 'Enable notification sound'}
              title={soundEnabled ? 'Sound On' : 'Sound Off'}
            >
              <span className="text-slate-900 text-sm">
                {soundEnabled ? '🔔' : '🔕'}
              </span>
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
                  "{notification.prayerTitle}"
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

// Play notification sound based on type
async function playNotificationSound(type?: string) {
  // Check if sound was unlocked via the Enable Sound button
  const soundUnlocked = localStorage.getItem('soundUnlocked') === 'true';
  if (!soundUnlocked) {
    console.log('Sound not unlocked yet - skipping notification sound');
    return;
  }

  // Determine which sound file to use
  let soundFile = '/notification.mp3'; // default

  switch (type) {
    case 'prayer_support':
      soundFile = '/sounds/prayer-notification.mp3';
      break;
    case 'milestone':
      soundFile = '/sounds/milestone-notification.mp3';
      break;
    case 'reminder':
      soundFile = '/sounds/reminder-notification.mp3';
      break;
    default:
      soundFile = '/notification.mp3';
  }

  try {
    // Resume AudioContext if suspended (required for mobile)
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (AudioContext) {
      const audioContext = new AudioContext();
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
    }

    const audio = new Audio(soundFile);
    audio.volume = 0.5;

    // Play the sound and handle errors gracefully
    audio.play().catch((error) => {
      // If custom sound fails, try default sound as fallback
      if (soundFile !== '/notification.mp3') {
        console.warn(`Custom sound failed, using default:`, error);
        const fallbackAudio = new Audio('/notification.mp3');
        fallbackAudio.volume = 0.5;
        fallbackAudio.play().catch(() => {
          console.warn('Notification sound could not be played');
        });
      } else {
        console.warn('Notification sound could not be played:', error);
      }
    });
  } catch (error) {
    console.warn('Failed to create audio element:', error);
  }
}