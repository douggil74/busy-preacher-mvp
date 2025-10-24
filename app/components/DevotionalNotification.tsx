'use client';

import { useState, useEffect } from 'react';
import { X, BookOpen, Bell } from 'lucide-react';

interface NotificationProps {
  show: boolean;
  onClose: () => void;
  onViewDevotional: () => void;
}

export function DevotionalNotification({ show, onClose, onViewDevotional }: NotificationProps) {
  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Notification Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-scale-in">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 text-white">
              <div className="bg-white/20 p-3 rounded-full">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">New Devotional Ready!</h3>
                <p className="text-amber-100 text-sm">Start your day with God's Word</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700 mb-6 text-center">
              Your daily devotional is ready to read. Take a few moments to connect with God before starting your day.
            </p>

            <div className="space-y-3">
              <button
                onClick={onViewDevotional}
                className="w-full py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors shadow-md hover:shadow-lg"
              >
                Read Today's Devotional
              </button>
              
              <button
                onClick={onClose}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Remind Me Later
              </button>
            </div>

            {/* Don't Show Again */}
            <div className="mt-4 flex items-center justify-center">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="rounded"
                  onChange={(e) => {
                    if (e.target.checked) {
                      localStorage.setItem('hideDevotionalNotification', 'true');
                    }
                  }}
                />
                Don't show this again
              </label>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

// ============================================
// Usage in your main layout or app
// ============================================

export function DevotionalNotificationWrapper() {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    checkIfShouldShowNotification();
  }, []);

  const checkIfShouldShowNotification = () => {
    const hideNotification = localStorage.getItem('hideDevotionalNotification');
    const lastShown = localStorage.getItem('lastNotificationShown');
    const today = new Date().toDateString();

    // Don't show if user opted out or already shown today
    if (hideNotification === 'true' || lastShown === today) {
      return;
    }

    // Show notification after 5 seconds
    setTimeout(() => {
      setShowNotification(true);
      localStorage.setItem('lastNotificationShown', today);
    }, 5000);
  };

  const handleViewDevotional = () => {
    setShowNotification(false);
    window.location.href = '/devotional';
  };

  return (
    <DevotionalNotification
      show={showNotification}
      onClose={() => setShowNotification(false)}
      onViewDevotional={handleViewDevotional}
    />
  );
}