"use client";

import { useState, useEffect, useRef } from "react";

interface SearchResult {
  reference: string;
  preview: string;
}

interface KeywordSearchResultsProps {
  keyword: string;
  onClose: () => void;
  onSelectPassage: (reference: string) => void;
}

export function KeywordSearchResults({ keyword, onClose, onSelectPassage }: KeywordSearchResultsProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("/api/keyword-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch search results");
        }

        const data = await response.json();
        setResults(data.results || []);
      } catch (err) {
        console.error("Search error:", err);
        setError("Failed to search Scripture. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [keyword]);

  // Center modal on mount
  useEffect(() => {
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      setPosition({
        x: (window.innerWidth - rect.width) / 2,
        y: Math.max(40, (window.innerHeight - rect.height) / 2)
      });
    }
  }, [loading]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isPinned) return;
    
    const rect = modalRef.current?.getBoundingClientRect();
    if (!rect) return;

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !isPinned) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Keep within viewport bounds
    const maxX = window.innerWidth - (modalRef.current?.offsetWidth || 0);
    const maxY = window.innerHeight - (modalRef.current?.offsetHeight || 0);

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handleClose = () => {
    if (!isPinned) {
      onClose();
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 ${isPinned ? 'pointer-events-none' : 'bg-black/50'} flex items-center justify-center p-4`}
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className={`bg-slate-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden border ${
          isPinned 
            ? 'border-yellow-400 shadow-2xl shadow-yellow-400/20 pointer-events-auto' 
            : 'border-slate-700'
        } ${isDragging ? 'cursor-grabbing' : ''}`}
        style={isPinned ? {
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
        } : {}}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className={`sticky top-0 bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between ${
            isPinned ? 'cursor-grab active:cursor-grabbing' : ''
          }`}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-yellow-400">
              Results for &quot;{keyword}&quot;
            </h2>
            {isPinned && (
              <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded">
                📌 Pinned • Drag to move
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPinned(!isPinned)}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                isPinned
                  ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              title={isPinned ? 'Unpin window' : 'Pin window (keeps open)'}
            >
              {isPinned ? '📌 Pinned' : '📌 Pin'}
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
              title="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(80vh-80px)]">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
              <p className="text-slate-400 mt-4">Searching Scripture...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400">{error}</p>
              <button
                onClick={onClose}
                className="mt-4 text-sm text-yellow-400 hover:text-yellow-300 underline"
              >
                Close
              </button>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No results found for &quot;{keyword}&quot;</p>
              <p className="text-slate-500 text-sm mt-2">Try a different keyword or phrase</p>
            </div>
          ) : (
            <>
              <p className="text-slate-400 text-sm mb-4">
                Found {results.length} passage{results.length !== 1 ? 's' : ''}
              </p>
              {results.map((result, index) => (
                <div
                  key={index}
                  className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-yellow-400/30 transition-all"
                >
                  <h3 className="text-yellow-400 font-bold mb-2">{result.reference}</h3>
                  <p className="text-slate-300 text-sm mb-3 line-clamp-3">{result.preview}</p>
                  <button
                    onClick={() => {
                      onSelectPassage(result.reference);
                      if (!isPinned) {
                        onClose();
                      }
                    }}
                    className="text-sm bg-yellow-400/20 border border-yellow-400 px-3 py-1.5 rounded hover:bg-yellow-400/30 transition-colors"
                  >
                    Read Passage
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}