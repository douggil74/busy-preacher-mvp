// app/debug-storage/page.tsx
// Debug page to see what's actually saved in localStorage

"use client";

import { useEffect, useState } from "react";

export default function DebugStoragePage() {
  const [storage, setStorage] = useState<any>({});

  useEffect(() => {
    const data: any = {};
    
    // Get all localStorage items
    data.notes = localStorage.getItem("bc-notes");
    data.savedStudies = localStorage.getItem("bc-saved-studies");
    data.theme = localStorage.getItem("bc-theme");
    data.style = localStorage.getItem("bc-style");
    data.fontScale = localStorage.getItem("bc-font-scale");
    
    setStorage(data);
  }, []);

  const clearAllData = () => {
    if (confirm("Clear ALL localStorage data?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-white light:text-black">Debug: localStorage Contents</h1>

      <div className="space-y-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-3 text-yellow-400">Notes (bc-notes)</h2>
          {storage.notes ? (
            <>
              <p className="text-sm text-white/70 light:text-black/70 mb-2">Found {JSON.parse(storage.notes).length} notes</p>
              <pre className="bg-black/30 p-4 rounded text-xs overflow-auto max-h-96 text-white/80 light:text-black/80">
                {JSON.stringify(JSON.parse(storage.notes), null, 2)}
              </pre>
            </>
          ) : (
            <p className="text-white/60 light:text-black/60">No notes saved</p>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-3 text-yellow-400">Saved Studies (bc-saved-studies)</h2>
          {storage.savedStudies ? (
            <>
              <p className="text-sm text-white/70 light:text-black/70 mb-2">Found {JSON.parse(storage.savedStudies).length} studies</p>
              <pre className="bg-black/30 p-4 rounded text-xs overflow-auto max-h-96 text-white/80 light:text-black/80">
                {JSON.stringify(JSON.parse(storage.savedStudies), null, 2)}
              </pre>
            </>
          ) : (
            <p className="text-white/60 light:text-black/60">No studies saved</p>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-3 text-yellow-400">Preferences</h2>
          <div className="space-y-2 text-sm">
            <p className="text-white/80 light:text-black/80">Theme: <span className="text-yellow-400">{storage.theme || "not set"}</span></p>
            <p className="text-white/80 light:text-black/80">Study Style: <span className="text-yellow-400">{storage.style || "not set"}</span></p>
            <p className="text-white/80 light:text-black/80">Font Scale: <span className="text-yellow-400">{storage.fontScale || "not set"}</span></p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="btn"
          >
            Refresh Data
          </button>
          <button
            onClick={clearAllData}
            className="rounded-lg bg-red-500/20 border border-red-500 px-6 py-3 text-sm hover:bg-red-500/30"
          >
            Clear All Data
          </button>
          <a href="/" className="btn">Back to Home</a>
        </div>
      </div>
    </main>
  );
}