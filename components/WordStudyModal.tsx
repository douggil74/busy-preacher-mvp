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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto scrollbar-hide rounded-2xl shadow-2xl"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="sticky top-0 p-6 flex items-start justify-between z-10"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderBottom: '1px solid var(--card-border)',
          }}
        >
          <div className="flex-1">
            <div className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
              Word Study
            </div>
            <h2 className="text-3xl font-serif mb-2" style={{ color: 'var(--text-primary)' }}>
              {studyData?.lemma || initialData?.lemma || word}
            </h2>
            <div className="text-sm font-semibold" style={{ color: 'var(--accent-color)' }}>
              STRONG'S NUMBER: {studyData?.strongs || initialData?.strongs || '—'}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6" style={{ borderBottom: '1px solid var(--card-border)' }}>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('definition')}
              className="px-4 py-3 text-sm font-medium transition-colors"
              style={{
                borderBottom: activeTab === 'definition' ? '2px solid var(--accent-color)' : '2px solid transparent',
                color: activeTab === 'definition' ? 'var(--accent-color)' : 'var(--text-secondary)',
              }}
            >
              Definition
            </button>
            <button
              onClick={() => setActiveTab('usage')}
              className="px-4 py-3 text-sm font-medium transition-colors"
              style={{
                borderBottom: activeTab === 'usage' ? '2px solid var(--accent-color)' : '2px solid transparent',
                color: activeTab === 'usage' ? 'var(--accent-color)' : 'var(--text-secondary)',
              }}
            >
              Biblical Usage
            </button>
            <button
              onClick={() => setActiveTab('references')}
              className="px-4 py-3 text-sm font-medium transition-colors"
              style={{
                borderBottom: activeTab === 'references' ? '2px solid var(--accent-color)' : '2px solid transparent',
                color: activeTab === 'references' ? 'var(--accent-color)' : 'var(--text-secondary)',
              }}
            >
              Cross References
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2"
                style={{ borderColor: 'var(--accent-color)' }}
              />
            </div>
          ) : (
            <>
              {/* Definition Tab */}
              {activeTab === 'definition' && (
                <div className="space-y-6">
                  <div>
                    <h3
                      className="text-sm font-bold mb-3"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Dictionary Definition
                    </h3>
                    <div
                      className="text-base leading-relaxed"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {studyData?.plain || initialData?.plain || 'No definition available.'}
                    </div>
                  </div>

                  {studyData?.etymology && (
                    <div>
                      <h3
                        className="text-sm font-bold mb-3"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        Etymology
                      </h3>
                      <div
                        className="text-sm leading-relaxed"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {studyData.etymology}
                      </div>
                    </div>
                  )}

                  {studyData?.relatedWords && studyData.relatedWords.length > 0 && (
                    <div>
                      <h3
                        className="text-sm font-bold mb-3"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        Related Words
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {studyData.relatedWords.map((related, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-2 rounded-lg"
                            style={{
                              backgroundColor: 'color-mix(in srgb, var(--accent-color) 10%, transparent)',
                              border: '1px solid color-mix(in srgb, var(--accent-color) 30%, transparent)',
                            }}
                          >
                            <div
                              className="text-sm font-medium"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {related.word}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: 'var(--accent-color)' }}
                            >
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
                  <h3
                    className="text-sm font-bold mb-3"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    How This Word is Used in Scripture
                  </h3>
                  <div
                    className="text-base leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {studyData?.usage || 'Loading biblical usage examples...'}
                  </div>
                </div>
              )}

              {/* References Tab */}
              {activeTab === 'references' && (
                <div>
                  <h3
                    className="text-sm font-bold mb-3"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Key Verses Using This Word
                  </h3>
                  {studyData?.references && studyData.references.length > 0 ? (
                    <div className="space-y-2">
                      {studyData.references.map((ref, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg text-sm"
                          style={{
                            backgroundColor: 'color-mix(in srgb, var(--text-primary) 5%, transparent)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {ref}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-secondary)' }}>
                      Loading cross references...
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className="sticky bottom-0 p-6"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderTop: '1px solid var(--card-border)',
          }}
        >
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (studyData?.strongs) {
                  window.open(`https://www.blueletterbible.org/lexicon/${studyData.strongs}/`, '_blank');
                }
              }}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--text-primary) 5%, transparent)',
                border: '2px solid var(--card-border)',
                color: 'var(--text-secondary)',
              }}
            >
              View in Blue Letter Bible →
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--accent-color)',
                color: 'var(--bg-color)',
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
