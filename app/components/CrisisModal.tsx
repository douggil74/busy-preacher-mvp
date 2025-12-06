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
        <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Personal Opening */}
          <div className="text-white/90 leading-relaxed">
            <p className="text-base sm:text-lg mb-3">
              Hey, listen to me for a second. If you're thinking about ending your life, or you're in a dark place where everything feels hopeless - I need you to hear this: <strong className="text-yellow-300">You matter.</strong> Your life has value. And I'm asking you, please, reach out right now.
            </p>
          </div>

          {/* Primary Crisis Resources */}
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-yellow-400/50 bg-yellow-400/10 p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl sm:text-3xl">📞</div>
                <div className="flex-1">
                  <h3 className="font-bold text-yellow-400 text-base sm:text-lg mb-2">
                    Call or Text Right Now
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl sm:text-3xl font-bold text-white">988</span>
                    </div>
                    <p className="text-sm text-white/90 leading-relaxed">
                      Real people waiting to talk - not robots. Available 24/7, completely free, totally confidential.
                      You can also chat at <a href="https://988lifeline.org" target="_blank" rel="noopener noreferrer" className="underline">988lifeline.org</a>
                    </p>
                    <p className="text-xs text-white/70 italic">
                      Veterans: press 1 after dialing, or text 838255
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-400/30 bg-blue-400/10 p-3">
              <div className="flex items-start gap-3">
                <div className="text-xl sm:text-2xl">💬</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-400 mb-1 text-sm sm:text-base">If You'd Rather Text</h3>
                  <p className="text-xs sm:text-sm text-white/80 mb-1">
                    Text <span className="font-mono bg-white/10 px-2 py-0.5 rounded font-bold">HOME</span> to <span className="font-bold text-white">741741</span>
                  </p>
                  <p className="text-xs text-white/70">
                    A real person will text you back in about 5 minutes. Free, confidential, 24/7.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Support Groups */}
          <div className="rounded-xl border border-purple-400/30 bg-purple-400/10 p-4">
            <h3 className="font-semibold text-purple-400 mb-2 text-sm sm:text-base flex items-center gap-2">
              <span>🤝</span> Free Support Groups (NAMI)
            </h3>
            <p className="text-xs sm:text-sm text-white/80 mb-2">
              You don't have to walk through this alone. Free support groups with people who understand.
            </p>
            <p className="text-xs text-white/70">
              Call <span className="font-bold text-white">1-800-950-6264</span> or text "NAMI" to <span className="font-bold text-white">62640</span>
            </p>
          </div>

          {/* Christian Counseling */}
          <div className="rounded-xl border border-green-400/30 bg-green-400/10 p-4">
            <h3 className="font-semibold text-green-400 mb-2 text-sm sm:text-base flex items-center gap-2">
              <span>🙏</span> Christian Counseling
            </h3>
            <p className="text-xs sm:text-sm text-white/80 mb-2">
              Focus on the Family offers free Christian counseling. They'll pray with you.
            </p>
            <p className="text-xs text-white/70">
              Call <span className="font-bold text-white">1-855-771-HELP (4357)</span> (weekdays 6am-8pm Mountain)
            </p>
          </div>

          {/* Military Resources */}
          <div className="rounded-xl border border-orange-400/30 bg-orange-400/10 p-3">
            <h3 className="font-semibold text-orange-400 mb-2 text-sm flex items-center gap-2">
              <span>🎖️</span> For Our Military Family
            </h3>
            <div className="text-xs text-white/80 space-y-1">
              <p>Veterans Crisis Line: <span className="font-bold text-white">988 → Press 1</span></p>
              <p>Military OneSource: <span className="font-bold text-white">800-342-9647</span> (24/7)</p>
            </div>
          </div>

          {/* Scripture */}
          <div className="rounded-xl border border-white/20 bg-white/5 p-3 sm:p-4">
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed italic">
              "The LORD is close to the brokenhearted and saves those who are crushed in spirit."
              <span className="text-white/60 block mt-1">— Psalm 34:18</span>
            </p>
          </div>

          {/* Personal Note */}
          <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              <strong className="text-white">{userName},</strong> asking for help isn't weakness. It's wisdom. It's courage.
              God didn't design you to carry everything by yourself. Let someone help you.
            </p>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed mt-2">
              You are deeply loved. You are seen. And this world is better with you in it.
            </p>
            <p className="text-xs text-white/70 mt-2 italic">
              — Your Pastor
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-white/10 hover:bg-white/20 border-2 border-white/20 text-white font-semibold transition-all text-sm sm:text-base"
          >
            I Understand • Close This Message
          </button>
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