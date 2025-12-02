'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ToastData {
  id: string;
  title: string;
  message: string;
  icon: string;
  position: 'top' | 'bottom';
  style: 'minimal' | 'card' | 'glass';
}

const TOAST_STORAGE_KEY = 'bc-last-toast-shown';

export default function InAppToast() {
  const [toast, setToast] = useState<ToastData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const checkForToast = async () => {
      try {
        // Check if we already showed a toast today
        const lastShown = localStorage.getItem(TOAST_STORAGE_KEY);
        if (lastShown) {
          const lastDate = new Date(lastShown);
          const today = new Date();
          if (lastDate.toDateString() === today.toDateString()) {
            return; // Already showed one today
          }
        }

        // Get user activity data from localStorage
        const lastStudy = localStorage.getItem('bc-last-study-date');
        const streakData = localStorage.getItem('bc-study-streak');
        const totalStudies = localStorage.getItem('bc-total-studies');

        // Calculate days since last visit
        let daysSinceLastVisit = 0;
        if (lastStudy) {
          const lastDate = new Date(lastStudy);
          const today = new Date();
          daysSinceLastVisit = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        }

        // Fetch appropriate toast from API
        const res = await fetch('/api/toast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            daysSinceLastVisit,
            currentStreak: streakData ? JSON.parse(streakData).count || 0 : 0,
            totalStudies: totalStudies ? parseInt(totalStudies) : 0,
            lastToastShown: lastShown,
          }),
        });

        const data = await res.json();

        if (data.toast) {
          // Delay showing toast by 2 seconds after page load
          setTimeout(() => {
            setToast(data.toast);
            setVisible(true);

            // Store that we showed a toast today
            localStorage.setItem(TOAST_STORAGE_KEY, new Date().toISOString());

            // Auto-dismiss after 6 seconds
            setTimeout(() => {
              setVisible(false);
              setTimeout(() => setToast(null), 300); // Wait for fade animation
            }, 6000);
          }, 2000);
        }
      } catch (error) {
        console.error('Error checking for toast:', error);
      }
    };

    checkForToast();
  }, []);

  const dismiss = () => {
    setVisible(false);
    setTimeout(() => setToast(null), 300);
  };

  if (!toast) return null;

  const positionClasses = toast.position === 'bottom'
    ? 'bottom-6 left-1/2 -translate-x-1/2'
    : 'top-20 left-1/2 -translate-x-1/2';

  const styleClasses = {
    minimal: 'bg-slate-800/95 border border-slate-700',
    card: 'bg-gradient-to-r from-slate-800 to-slate-900 border-2 border-yellow-400/30 shadow-lg shadow-yellow-400/10',
    glass: 'bg-white/10 backdrop-blur-xl border border-white/20',
  };

  return (
    <div
      className={`fixed ${positionClasses} z-50 max-w-sm w-[90%] rounded-2xl p-4 ${styleClasses[toast.style]} transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{toast.icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white text-sm">{toast.title}</h4>
          <p className="text-white/70 text-sm mt-0.5">{toast.message}</p>
        </div>
        <button
          onClick={dismiss}
          className="p-1 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4 text-white/50" />
        </button>
      </div>
    </div>
  );
}
