"use client";

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface WordStudyData {
  lemma: string;
  strongs: string;
  plain: string;
  surface: string;
  usage?: string;
  references?: string[];
  etymology?: string;
  relatedWords?: Array<{ word: string; strongs: string }>;
}

interface WordStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  word: string;
  initialData: {
    lemma: string;
    strongs: string;
    plain: string;
  } | null;
  bookName?: string;
}

export default function WordStudyModal({
  isOpen,
  onClose,
  word,
  initialData,
  bookName,
}: WordStudyModalProps) {
  const [studyData, setStudyData] = useState<WordStudyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'definition' | 'usage' | 'references'>('definition');

  useEffect(() => {
    if (isOpen && initialData) {
      loadDetailedStudy();
    }
  }, [isOpen, initialData]);

  const loadDetailedStudy = async () => {
    if (!initialData) return;

    setLoading(true);
    try {
      const res = await fetch('/api/word-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surface: word,
          lemma: initialData.lemma,
          strongs: initialData.strongs,
          book: bookName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStudyData({
          ...initialData,
          surface: word,
          ...data,
        });
      } else {
        // Fallback to initial data
        setStudyData({
          ...initialData,
          surface: word,
        });
      }
    } catch (error) {
      console.error('Failed to load word study:', error);
      setStudyData({
        ...initialData,
        surface: word,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-6 flex items-start justify-between z-10">
          <div className="flex-1">
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              Word Study
            </div>
            <h2 className="text-3xl font-serif text-slate-900 dark:text-white mb-2">
              {studyData?.lemma || initialData?.lemma || word}
            </h2>
            <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">
              STRONG'S NUMBER: {studyData?.strongs || initialData?.strongs || '—'}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700 px-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('definition')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'definition'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Definition
            </button>
            <button
              onClick={() => setActiveTab('usage')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'usage'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Biblical Usage
            </button>
            <button
              onClick={() => setActiveTab('references')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'references'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Cross References
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {/* Definition Tab */}
              {activeTab === 'definition' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                      Dictionary Definition
                    </h3>
                    <div className="text-base leading-relaxed text-slate-700 dark:text-slate-300">
                      {studyData?.plain || initialData?.plain || 'No definition available.'}
                    </div>
                  </div>

                  {studyData?.etymology && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                        Etymology
                      </h3>
                      <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                        {studyData.etymology}
                      </div>
                    </div>
                  )}

                  {studyData?.relatedWords && studyData.relatedWords.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                        Related Words
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {studyData.relatedWords.map((related, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800"
                          >
                            <div className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
                              {related.word}
                            </div>
                            <div className="text-xs text-indigo-600 dark:text-indigo-400">
                              {related.strongs}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Usage Tab */}
              {activeTab === 'usage' && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                    How This Word is Used in Scripture
                  </h3>
                  <div className="text-base leading-relaxed text-slate-700 dark:text-slate-300">
                    {studyData?.usage || 'Loading biblical usage examples...'}
                  </div>
                </div>
              )}

              {/* References Tab */}
              {activeTab === 'references' && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                    Key Verses Using This Word
                  </h3>
                  {studyData?.references && studyData.references.length > 0 ? (
                    <div className="space-y-2">
                      {studyData.references.map((ref, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300"
                        >
                          {ref}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-600 dark:text-slate-400">
                      Loading cross references...
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-6">
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (studyData?.strongs) {
                  window.open(`https://www.blueletterbible.org/lexicon/${studyData.strongs}/`, '_blank');
                }
              }}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              View in Blue Letter Bible →
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
