// app/components/CrisisModal.tsx
"use client";

import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

interface CrisisModalProps {
  isOpen: boolean;
  userName: string;
  onClose: () => void;
}

export function CrisisModal({ isOpen, userName, onClose }: CrisisModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 bg-gradient-to-br from-red-900/40 to-purple-900/40 rounded-2xl border-2 border-red-400/50 shadow-2xl overflow-hidden animate-pulse-border">
        {/* Urgent Header */}
        <div className="bg-red-500/20 border-b-2 border-red-400/30 p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-4xl sm:text-5xl animate-pulse">🆘</div>
            <div>
              <h2 className={`${playfair.className} text-xl sm:text-2xl font-bold text-red-400 mb-1`}>
                You Are Not Alone
              </h2>
              <p className="text-white/80 text-xs sm:text-sm">
                There is help available right now
              </p>
            </div>
          </div>
        </div>

        {/* Content - Now Scrollable */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="text-white/90">
            <p className="text-base sm:text-lg leading-relaxed">
              <strong className="text-red-300">{userName},</strong> if you're in crisis or having thoughts of suicide, 
              please reach out for help immediately. You are deeply loved by God and not alone in this struggle.
            </p>
          </div>

          {/* Crisis Resources */}
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-yellow-400/50 bg-yellow-400/10 p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl sm:text-3xl">📞</div>
                <div>
                  <h3 className="font-bold text-yellow-400 text-base sm:text-lg mb-2">
                    National Suicide Prevention Lifeline
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl sm:text-2xl font-bold text-white">988</span>
                      <span className="text-white/70 text-xs sm:text-sm">(Call or Text)</span>
                    </div>
                    <p className="text-xs sm:text-sm text-white/70">
                      Available 24/7 • Free • Confidential
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-400/30 bg-blue-400/10 p-3">
              <div className="flex items-start gap-3">
                <div className="text-xl sm:text-2xl">💬</div>
                <div>
                  <h3 className="font-semibold text-blue-400 mb-1 text-sm sm:text-base">Crisis Text Line</h3>
                  <p className="text-xs sm:text-sm text-white/80">
                    Text <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-xs">HELLO</span> to <span className="font-bold text-white">741741</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-purple-400/30 bg-purple-400/10 p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🌐</div>
                <div>
                  <h3 className="font-semibold text-purple-400 mb-1">Online Chat</h3>
                  <a 
                    href="https://988lifeline.org/chat/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-white/80 hover:text-white underline"
                  >
                    988lifeline.org/chat
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Encouragement */}
          <div className="rounded-xl border border-white/20 bg-white/5 p-3 sm:p-4">
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed italic">
              "The LORD is close to the brokenhearted and saves those who are crushed in spirit." 
              <span className="text-white/60 block mt-1">— Psalm 34:18</span>
            </p>
          </div>

          {/* Action Steps */}
          <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
            <h3 className="font-semibold text-white mb-2 text-xs sm:text-sm">Right Now:</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>Call or text 988 to talk with a trained counselor</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>Reach out to a trusted friend, family member, or pastor</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>If in immediate danger, call 911 or go to your nearest ER</span>
              </li>
            </ul>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-white/10 hover:bg-white/20 border-2 border-white/20 text-white font-semibold transition-all text-sm sm:text-base"
          >
            I Understand • Close This Message
          </button>

          <p className="text-xs text-white/50 text-center">
            Your life matters. Your story isn't over. Help is available.
          </p>
        </div>
      </div>
    </div>
  );
}

// Add this to your globals.css
const styles = `
@keyframes pulse-border {
  0%, 100% {
    border-color: rgba(248, 113, 113, 0.5);
  }
  50% {
    border-color: rgba(248, 113, 113, 1);
  }
}

.animate-pulse-border {
  animation: pulse-border 2s ease-in-out infinite;
}
`;