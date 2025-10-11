// This is a component to add to your existing deep study page
// app/deep-study/DeepStudyContent.tsx
"use client";

import { useState } from "react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

interface Commentary {
  source: string;
  author: string;
  year: string;
  style: string;
  url: string;
  excerpt: string;
  available: boolean;
}

interface Sermon {
  title: string;
  date: string;
  scripture: string;
  url: string;
  type: string;
  author: string;
}

interface DeepStudyContentProps {
  passage: string;
}

export function DeepStudyContent({ passage }: DeepStudyContentProps) {
  const [commentaries, setCommentaries] = useState<Commentary[]>([]);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"ai" | "commentaries" | "sermons" | "videos">("ai");

  const loadCommentaries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/commentary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passage }),
      });
      const data = await res.json();
      if (data.commentaries) {
        setCommentaries(data.commentaries);
      }
    } catch (error) {
      console.error("Failed to load commentaries:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSermons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/piper-sermons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passage }),
      });
      const data = await res.json();
      if (data.sermons) {
        setSermons(data.sermons);
      }
    } catch (error) {
      console.error("Failed to load sermons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    
    if (tab === "commentaries" && commentaries.length === 0) {
      loadCommentaries();
    }
    
    if (tab === "sermons" && sermons.length === 0) {
      loadSermons();
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => handleTabChange("ai")}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === "ai"
              ? "bg-yellow-400 text-slate-900"
              : "bg-white/10 text-white/70 hover:bg-white/15"
          }`}
        >
          🤖 AI Commentary
        </button>
        <button
          onClick={() => handleTabChange("commentaries")}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === "commentaries"
              ? "bg-yellow-400 text-slate-900"
              : "bg-white/10 text-white/70 hover:bg-white/15"
          }`}
        >
          📚 Classic Commentaries
        </button>
        <button
          onClick={() => handleTabChange("sermons")}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === "sermons"
              ? "bg-yellow-400 text-slate-900"
              : "bg-white/10 text-white/70 hover:bg-white/15"
          }`}
        >
          🎤 Sermons (Piper & More)
        </button>
        <button
          onClick={() => handleTabChange("videos")}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === "videos"
              ? "bg-yellow-400 text-slate-900"
              : "bg-white/10 text-white/70 hover:bg-white/15"
          }`}
        >
          📺 Teaching Videos
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "ai" && (
          <div className="card">
            <h3 className={`${playfair.className} text-xl font-semibold text-yellow-400 mb-4`}>
              AI-Generated Commentary
            </h3>
            <p className="text-white/70 text-sm mb-4">
              Your existing AI commentary appears here
            </p>
            {/* Your existing AI commentary component */}
          </div>
        )}

        {activeTab === "commentaries" && (
          <div className="space-y-4">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${playfair.className} text-xl font-semibold text-yellow-400`}>
                  Classic Commentaries
                </h3>
                <span className="text-xs text-white/50">Public Domain • Free Forever</span>
              </div>
              
              {loading && (
                <div className="text-center py-8 text-white/60">
                  Loading commentaries...
                </div>
              )}

              {!loading && commentaries.length === 0 && (
                <div className="text-center py-8 text-white/60">
                  No commentaries loaded yet
                </div>
              )}

              {commentaries.map((commentary, idx) => (
                <div key={idx} className="mb-6 last:mb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-white">{commentary.source}</h4>
                      <p className="text-sm text-white/60">
                        {commentary.author} ({commentary.year})
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-400/10 text-blue-400 border border-blue-400/30">
                      {commentary.style.split(",")[0]}
                    </span>
                  </div>
                  
                  <p className="text-white/80 text-sm mb-3 leading-relaxed">
                    {commentary.excerpt}
                  </p>

                  <a
                    href={commentary.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    Read Full Commentary
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              ))}
            </div>

            {/* Commentary Info Card */}
            <div className="card border-blue-400/30 bg-blue-400/10">
              <h4 className="font-semibold text-blue-400 mb-2 text-sm">About These Commentaries</h4>
              <p className="text-xs text-white/70 leading-relaxed">
                All commentaries are from public domain sources (pre-1928) and represent the gold standard 
                of biblical scholarship. Matthew Henry's work is especially beloved for its pastoral warmth.
              </p>
            </div>
          </div>
        )}

        {activeTab === "sermons" && (
          <div className="space-y-4">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${playfair.className} text-xl font-semibold text-yellow-400`}>
                  Sermons & Teaching
                </h3>
                <span className="text-xs text-white/50">Curated • Trusted Teachers</span>
              </div>

              {loading && (
                <div className="text-center py-8 text-white/60">
                  Finding sermons...
                </div>
              )}

              {!loading && sermons.length === 0 && (
                <div className="text-center py-8 text-white/60">
                  No sermons loaded yet
                </div>
              )}

              {sermons.map((sermon, idx) => (
                <div key={idx} className="mb-4 last:mb-0">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-purple-400/10">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{sermon.title}</h4>
                      <p className="text-sm text-white/60 mb-2">
                        {sermon.author} • {sermon.date}
                      </p>
                      <a
                        href={sermon.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
                      >
                        Listen on Desiring God
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desiring God Info */}
            <div className="card border-purple-400/30 bg-purple-400/10">
              <h4 className="font-semibold text-purple-400 mb-2 text-sm">About Desiring God</h4>
              <p className="text-xs text-white/70 leading-relaxed mb-3">
                John Piper's ministry offers thousands of free sermons, articles, and resources indexed by Scripture. 
                All content is gospel-centered and Christ-exalting.
              </p>
              <a
                href="https://www.desiringgod.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-400 hover:text-purple-300 underline"
              >
                Visit DesiringGod.org →
              </a>
            </div>
          </div>
        )}

        {activeTab === "videos" && (
          <div className="card">
            <h3 className={`${playfair.className} text-xl font-semibold text-yellow-400 mb-4`}>
              Teaching Videos
            </h3>
            <p className="text-white/70 text-sm mb-4">
              Curated short teachings from trusted pastors and teachers (5-15 minutes)
            </p>
            {/* Your existing YouTube component - but now filtered by trusted teachers */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-white/50 mb-2">
                <strong>Trusted Teachers:</strong> John Piper, R.C. Sproul, Tim Keller, John MacArthur, 
                Alistair Begg, Paul Washer, Voddie Baucham
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}