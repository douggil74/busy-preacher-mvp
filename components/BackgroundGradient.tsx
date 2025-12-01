'use client';

/**
 * Beautiful textured gradient background
 * Add this component to the root layout to apply to all pages
 */
export default function BackgroundGradient() {
  return (
    <>
      {/* Beautiful textured gradient background */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}
      >
        {/* Base gradient mesh */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 20% -20%, color-mix(in srgb, var(--accent-color) 15%, transparent) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 80% 10%, color-mix(in srgb, var(--accent-color) 12%, transparent) 0%, transparent 40%),
              radial-gradient(ellipse 50% 60% at 100% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse 40% 40% at 0% 100%, rgba(139, 92, 246, 0.06) 0%, transparent 40%)
            `,
          }}
        />

        {/* Flowing accent orbs */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-3xl animate-float-slow"
          style={{
            top: '-15%',
            right: '-10%',
            background: 'radial-gradient(circle, color-mix(in srgb, var(--accent-color) 8%, transparent) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full blur-3xl animate-float-mid"
          style={{
            top: '20%',
            left: '-5%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl animate-float-fast"
          style={{
            bottom: '10%',
            right: '20%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%)',
          }}
        />

        {/* Subtle noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Bottom fade to page background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, transparent 60%, var(--bg-color) 100%)',
          }}
        />
      </div>

      <style jsx>{`
        @keyframes floatSlow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, 20px) scale(1.05); }
        }
        @keyframes floatMid {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 30px) scale(1.03); }
        }
        @keyframes floatFast {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(25px, -15px) scale(1.02); }
        }
        .animate-float-slow {
          animation: floatSlow 20s ease-in-out infinite;
        }
        .animate-float-mid {
          animation: floatMid 15s ease-in-out infinite;
          animation-delay: -5s;
        }
        .animate-float-fast {
          animation: floatFast 12s ease-in-out infinite;
          animation-delay: -3s;
        }
      `}</style>
    </>
  );
}
