'use client';

import { useEffect, useState } from 'react';
import { Playfair_Display } from 'next/font/google';
import { getPrayers } from '@/lib/prayerStorage';
import { getPrayedCount, incrementPrayedCount } from '@/lib/prayedForStorage';
import { recordMetric } from '@/lib/metricsTracker';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
});

export default function CommunityPrayerNetwork() {
  const [sharedPrayers, setSharedPrayers] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const all = getPrayers();
    const shared = all.filter((p) => p.isShared);
    setSharedPrayers(shared);

    const c: Record<string, number> = {};
    shared.forEach((p) => (c[p.id] = getPrayedCount(p.id)));
    setCounts(c);
  }, []);

  const handlePray = (id: string) => {
    const newCount = incrementPrayedCount(id);
    setCounts((prev) => ({ ...prev, [id]: newCount }));
    recordMetric('prayed_for');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* HEADER */}
        <div className="text-center mb-12">
          <h1
            className={`${playfair.className} text-5xl font-bold text-white mb-3 tracking-tight`}
          >
            Community Prayer Network
          </h1>
          <div className="h-[2px] w-24 bg-gradient-to-r from-yellow-400 to-amber-400 mx-auto mb-4"></div>
          <p className="text-white/70 max-w-2xl mx-auto">
            Join believers from around the world in lifting up shared requests.
            Tap “❤️ Prayed For” to let others know you’re standing with them.
          </p>
        </div>

        {/* NO PRAYERS */}
        {sharedPrayers.length === 0 && (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm">
            <h3 className={`${playfair.className} text-2xl font-semibold text-white mb-3`}>
              No shared prayers yet
            </h3>
            <p className="text-white/60 max-w-md mx-auto">
              When you mark a prayer as “Share with Community,” it will appear here for others to pray over.
            </p>
          </div>
        )}

        {/* PRAYER GRID */}
        {sharedPrayers.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-6">
            {sharedPrayers.map((p) => (
              <div
                key={p.id}
                className="rounded-3xl p-6 border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-yellow-400/30 shadow-md hover:shadow-lg"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-white">
                    {p.title}
                  </h3>
                  <span className="inline-block rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs px-3 py-1">
                    Shared
                  </span>
                </div>

                {p.description && (
                  <p className="text-white/70 text-sm mb-3">{p.description}</p>
                )}

                {p.linkedPassage && (
                  <p className="text-yellow-400/80 text-xs italic mb-3">
                    📖 {p.linkedPassage}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  {p.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-block rounded-full bg-white/5 border border-white/10 text-white/60 text-xs px-3 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    onClick={() => handlePray(p.id)}
                    className="flex items-center gap-2 text-sm text-pink-400 hover:text-pink-300 transition"
                  >
                    ❤️ Prayed For {counts[p.id] || 0}
                  </button>
                  <span className="text-xs text-white/50">
                    Added {new Date(p.dateAdded).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
