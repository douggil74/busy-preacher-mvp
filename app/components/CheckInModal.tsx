// app/components/CheckInModal.tsx
"use client";

import { useState } from "react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

interface CheckInModalProps {
  isOpen: boolean;
  userName: string;
  recentThemes: string[];
  onClose: () => void;
}

export function CheckInModal({ isOpen, userName, recentThemes, onClose }: CheckInModalProps) {
  const [response, setResponse] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleResponse = (answer: string) => {
    setResponse(answer);
    
    // Save response locally for future personalization
    const responses = JSON.parse(localStorage.getItem("bc-check-in-responses") || "[]");
    responses.push({
      timestamp: Date.now(),
      response: answer,
      themes: recentThemes,
    });
    localStorage.setItem("bc-check-in-responses", JSON.stringify(responses.slice(-10)));

    // Close after a moment
    setTimeout(() => {
      onClose();
      setResponse(null);
    }, 2000);
  };

  const displayTheme = recentThemes[0] || "your studies";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {!response ? (
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">💭</div>
              <h2 className={`${playfair.className} text-2xl font-semibold text-yellow-400 mb-3`}>
                How are you doing, {userName}?
              </h2>
              <p className="text-white/70 text-base leading-relaxed">
                I've noticed you've been studying {displayTheme}. I'd love to know how things are going with you.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleResponse("growing")}
                className="w-full text-left p-4 rounded-xl border-2 border-white/10 bg-white/5 hover:border-green-400/50 hover:bg-green-400/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌱</span>
                  <div>
                    <div className="font-semibold text-white group-hover:text-green-400 transition-colors">
                      Growing stronger
                    </div>
                    <div className="text-sm text-white/60">
                      God is teaching me through this
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleResponse("struggling")}
                className="w-full text-left p-4 rounded-xl border-2 border-white/10 bg-white/5 hover:border-blue-400/50 hover:bg-blue-400/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💙</span>
                  <div>
                    <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                      Still struggling
                    </div>
                    <div className="text-sm text-white/60">
                      I need continued grace and strength
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleResponse("seeking")}
                className="w-full text-left p-4 rounded-xl border-2 border-white/10 bg-white/5 hover:border-purple-400/50 hover:bg-purple-400/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔍</span>
                  <div>
                    <div className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                      Seeking answers
                    </div>
                    <div className="text-sm text-white/60">
                      Still learning and processing
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleResponse("victorious")}
                className="w-full text-left p-4 rounded-xl border-2 border-white/10 bg-white/5 hover:border-yellow-400/50 hover:bg-yellow-400/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <div className="font-semibold text-white group-hover:text-yellow-400 transition-colors">
                      Experiencing victory
                    </div>
                    <div className="text-sm text-white/60">
                      God is working powerfully in this area
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-4 text-sm text-white/50 hover:text-white/80 transition-colors"
            >
              Maybe later
            </button>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="text-5xl mb-4">
              {response === "growing" ? "🌱" : response === "struggling" ? "💙" : response === "seeking" ? "🙏" : "🎉"}
            </div>
            <h3 className={`${playfair.className} text-xl font-semibold text-yellow-400 mb-3`}>
              {response === "growing" && "Keep growing!"}
              {response === "struggling" && "You're not alone"}
              {response === "seeking" && "Keep seeking"}
              {response === "victorious" && "Praise God!"}
            </h3>
            <p className="text-white/70">
              {response === "growing" && "Your faithfulness in studying Scripture is bearing fruit. Keep pressing on!"}
              {response === "struggling" && "God's grace is sufficient for you. His strength is made perfect in weakness."}
              {response === "seeking" && "Ask and it will be given to you; seek and you will find. Keep knocking!"}
              {response === "victorious" && "Rejoice in what God is doing! Share this testimony to encourage others."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}