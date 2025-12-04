'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Phone, MessageCircle, ExternalLink } from 'lucide-react';

interface CrisisDisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
  userName?: string;
}

export default function CrisisDisclaimerModal({ isOpen, onAccept, userName }: CrisisDisclaimerModalProps) {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm">
      {/* Landscape styles */}
      <style jsx>{`
        @media (orientation: landscape) and (max-height: 500px) {
          .modal-container {
            max-width: 90vw !important;
            max-height: 95vh !important;
          }
          .modal-header {
            padding: 0.75rem 1rem !important;
            flex-direction: row !important;
            gap: 0.75rem !important;
          }
          .modal-header-icon {
            width: 2.5rem !important;
            height: 2.5rem !important;
            margin: 0 !important;
          }
          .modal-header-icon svg {
            width: 1.25rem !important;
            height: 1.25rem !important;
          }
          .modal-content {
            padding: 0.75rem 1rem !important;
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 0.75rem !important;
          }
          .modal-content > * {
            margin: 0 !important;
          }
          .crisis-box {
            grid-column: 1 / 2 !important;
            grid-row: 1 / 3 !important;
          }
          .agreement-box {
            grid-column: 1 / -1 !important;
          }
          .modal-footer {
            padding: 0.5rem 1rem !important;
          }
          .modal-footer button {
            padding-top: 0.5rem !important;
            padding-bottom: 0.5rem !important;
          }
        }
      `}</style>

      <div
        className="modal-container relative w-full max-w-lg sm:max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
        }}
      >
        {/* Header */}
        <div className="modal-header p-4 sm:p-6 text-center flex flex-col items-center" style={{ borderBottom: '1px solid var(--card-border)' }}>
          <div className="modal-header-icon w-12 h-12 sm:w-16 sm:h-16 mb-2 sm:mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Before You Begin
            </h2>
            {userName && (
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Welcome, {userName}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="modal-content flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Crisis Alert Box */}
          <div className="crisis-box p-3 sm:p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-500 text-sm sm:text-base">In a Crisis?</p>
                <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  This is not an emergency service. If you're in immediate danger:
                </p>
                <div className="mt-2 sm:mt-3 space-y-1 sm:space-y-2">
                  <a
                    href="tel:911"
                    className="flex items-center gap-2 text-xs sm:text-sm font-medium text-red-500 hover:text-red-400"
                  >
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                    Call 911 for emergencies
                  </a>
                  <a
                    href="tel:988"
                    className="flex items-center gap-2 text-xs sm:text-sm font-medium text-red-500 hover:text-red-400"
                  >
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                    Call 988 - Suicide & Crisis Lifeline
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* What This Is */}
          <div>
            <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>
              What This Feature Is
            </h3>
            <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
              AI-assisted spiritual guidance based on biblical principles. A tool for exploring faith
              questions and finding encouragement.
            </p>
          </div>

          {/* What This Is NOT */}
          <div>
            <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>
              What This Feature Is NOT
            </h3>
            <ul className="space-y-1 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                Professional mental health counseling
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                Medical advice or diagnosis
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                A substitute for licensed care
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                An emergency response service
              </li>
            </ul>
          </div>

          {/* Important Notes */}
          <div className="p-3 sm:p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>
              Important to Know
            </h3>
            <ul className="space-y-1 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                AI may not recognize all signs of crisis
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                Conversations may be monitored for safety
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                Reports of child abuse trigger mandatory reporting
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                Seek professional help for serious concerns
              </li>
            </ul>
          </div>

          {/* Agreement Checkbox */}
          <label className="agreement-box flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl cursor-pointer transition-colors hover:bg-white/5"
            style={{ border: agreed ? '2px solid var(--accent-color)' : '2px solid var(--card-border)' }}
          >
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded border-2 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer"
              style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--bg-primary)' }}
            />
            <span className="text-xs sm:text-sm" style={{ color: 'var(--text-primary)' }}>
              I understand this is AI spiritual guidance, not professional counseling,
              and I will call 988 or 911 if I am in crisis.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="modal-footer p-4 sm:p-6" style={{ borderTop: '1px solid var(--card-border)' }}>
          <button
            onClick={onAccept}
            disabled={!agreed}
            className="w-full py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: agreed ? 'var(--accent-color)' : 'var(--card-border)',
              color: agreed ? 'white' : 'var(--text-secondary)',
            }}
          >
            Continue to Guidance
          </button>

          {/* Links */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mt-3 sm:mt-4">
            <Link
              href="/legal"
              target="_blank"
              className="text-xs flex items-center gap-1 hover:underline"
              style={{ color: 'var(--text-secondary)' }}
            >
              Disclaimer
              <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              href="/privacy"
              target="_blank"
              className="text-xs flex items-center gap-1 hover:underline"
              style={{ color: 'var(--text-secondary)' }}
            >
              Privacy
              <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              href="/terms"
              target="_blank"
              className="text-xs flex items-center gap-1 hover:underline"
              style={{ color: 'var(--text-secondary)' }}
            >
              Terms
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
