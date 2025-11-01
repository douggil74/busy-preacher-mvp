'use client';

import React from 'react';
// Import your actual PrayerWarriorPage component if it's separate
// For now, just export a simple placeholder

export default function PrayerWarriorPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold text-yellow-400 mb-4">
        ⚔️ Become a Prayer Warrior
      </h1>
      <p className="text-slate-300">
        Coming soon! For now, let's test the prayer feed.
      </p>
      <button
        onClick={() => window.location.href = '/prayer'}
        className="mt-4 bg-yellow-400 text-slate-950 px-6 py-3 rounded-lg font-semibold"
      >
        ← Back to Prayer Feed
      </button>
    </div>
  );
}
