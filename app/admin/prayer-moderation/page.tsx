'use client';

import React, { useState, useEffect } from 'react';
import { Playfair_Display } from 'next/font/google';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminAuth from '@/components/AdminAuth';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

interface PrayerRequest {
  id: string;
  userId: string;
  userName: string;
  userLocation?: string;
  request: string;
  category: string;
  isAnonymous: boolean;
  heartCount: number;
  status: string;
  flagCount: number;
  createdAt: any;
  needsModeration?: boolean;
  crisisDetected?: boolean;
  spamDetected?: boolean;
}

export const dynamic = 'force-dynamic'; // disables static generation

export default function PrayerModerationPage() {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'flagged' | 'crisis' | 'hidden'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'prayer_requests'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prayerData: PrayerRequest[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PrayerRequest));

      setPrayers(prayerData);
    });

    return () => unsubscribe();
  }, []);

  const filteredPrayers = prayers.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'flagged') return p.flagCount > 0;
    if (filter === 'crisis') return p.crisisDetected;
    if (filter === 'hidden') return p.status === 'hidden';
    return true;
  });

  const handleEdit = (prayer: PrayerRequest) => {
    setEditingId(prayer.id);
    setEditText(prayer.request);
    setExpandedId(prayer.id);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await updateDoc(doc(db, 'prayer_requests', id), {
        request: editText,
        needsModeration: false
      });
      setEditingId(null);
      setExpandedId(null);
    } catch (error) {
      console.error('Error updating prayer:', error);
      alert('❌ Failed to update');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete: "${title.substring(0, 50)}..."?`)) return;
    
    try {
      await deleteDoc(doc(db, 'prayer_requests', id));
    } catch (error) {
      console.error('Error deleting prayer:', error);
      alert('❌ Failed to delete');
    }
  };

  const handleHide = async (id: string) => {
    try {
      await updateDoc(doc(db, 'prayer_requests', id), { status: 'hidden' });
    } catch (error) {
      console.error('Error hiding prayer:', error);
    }
  };

  const handleUnhide = async (id: string) => {
    try {
      await updateDoc(doc(db, 'prayer_requests', id), { status: 'active' });
    } catch (error) {
      console.error('Error restoring prayer:', error);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <AdminAuth>
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className={`${playfair.className} text-4xl font-bold text-white mb-2`}>
            Prayer Moderation
          </h1>
          <div className="h-[2px] w-20 bg-gradient-to-r from-yellow-400 to-amber-400"></div>
        </div>

        {/* STATS ROW */}
        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
            <span className="text-white/60">Total: </span>
            <span className="font-bold text-yellow-400">{prayers.length}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
            <span className="text-white/60">Flagged: </span>
            <span className="font-bold text-red-400">{prayers.filter(p => p.flagCount > 0).length}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
            <span className="text-white/60">Crisis: </span>
            <span className="font-bold text-orange-400">{prayers.filter(p => p.crisisDetected).length}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
            <span className="text-white/60">Hidden: </span>
            <span className="font-bold text-white/60">{prayers.filter(p => p.status === 'hidden').length}</span>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'flagged', 'crisis', 'hidden'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-2 text-xs font-medium border transition-all capitalize ${
                filter === f
                  ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* COMPACT PRAYER TABLE */}
        <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-white/5 border-b border-white/10 text-xs font-semibold text-white/80">
            <div className="col-span-3">User / Category</div>
            <div className="col-span-5">Prayer Request</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-1 text-center">❤️</div>
            <div className="col-span-2 text-center">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-white/10">
            {filteredPrayers.map(prayer => {
              const isExpanded = expandedId === prayer.id;
              const isEditing = editingId === prayer.id;

              return (
                <div
                  key={prayer.id}
                  className={`transition-colors ${
                    prayer.crisisDetected ? 'bg-red-400/5' :
                    prayer.flagCount >= 3 ? 'bg-orange-400/5' :
                    prayer.status === 'hidden' ? 'bg-white/3' :
                    'hover:bg-white/5'
                  }`}
                >
                  {/* Main Row */}
                  <div className="grid grid-cols-12 gap-3 px-4 py-3 text-sm items-start">
                    {/* User / Category */}
                    <div className="col-span-3">
                      <div className="font-medium text-white truncate">{prayer.userName}</div>
                      <div className="text-xs text-white/50">{prayer.category}</div>
                    </div>

                    {/* Prayer Preview */}
                    <div className="col-span-5">
                      <button
                        onClick={() => toggleExpand(prayer.id)}
                        className="text-left text-white/70 hover:text-white transition-colors w-full"
                      >
                        <div className={`${isExpanded ? '' : 'line-clamp-2'}`}>
                          {prayer.request}
                        </div>
                      </button>
                    </div>

                    {/* Status Badges */}
                    <div className="col-span-1 flex flex-col gap-1">
                      {prayer.status === 'hidden' && (
                        <span className="text-xs px-2 py-0.5 bg-red-400/20 border border-red-400/30 text-red-400 rounded text-center">
                          HIDE
                        </span>
                      )}
                      {prayer.crisisDetected && (
                        <span className="text-xs px-2 py-0.5 bg-orange-400/20 border border-orange-400/30 text-orange-400 rounded text-center">
                          🆘
                        </span>
                      )}
                      {prayer.flagCount > 0 && (
                        <span className="text-xs px-2 py-0.5 bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 rounded text-center">
                          🚩{prayer.flagCount}
                        </span>
                      )}
                    </div>

                    {/* Hearts */}
                    <div className="col-span-1 text-center text-white/60 text-sm">
                      {prayer.heartCount}
                    </div>

                    {/* Action Buttons */}
                    <div className="col-span-2 flex gap-1">
                      <button
                        onClick={() => handleEdit(prayer)}
                        className="flex-1 px-2 py-1 bg-blue-500/80 text-white rounded text-xs hover:bg-blue-600 transition-colors font-medium"
                      >
                        Edit
                      </button>
                      {prayer.status === 'hidden' ? (
                        <button
                          onClick={() => handleUnhide(prayer.id)}
                          className="flex-1 px-2 py-1 bg-green-500/80 text-white rounded text-xs hover:bg-green-600 transition-colors font-medium"
                        >
                          Show
                        </button>
                      ) : (
                        <button
                          onClick={() => handleHide(prayer.id)}
                          className="flex-1 px-2 py-1 bg-orange-500/80 text-white rounded text-xs hover:bg-orange-600 transition-colors font-medium"
                        >
                          Hide
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(prayer.id, prayer.request)}
                        className="flex-1 px-2 py-1 bg-red-500/80 text-white rounded text-xs hover:bg-red-600 transition-colors font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Expanded Edit Area */}
                  {isExpanded && isEditing && (
                    <div className="px-4 pb-4 border-t border-white/10 bg-white/5">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-lg p-3 mt-3 min-h-32 focus:border-yellow-400 focus:outline-none text-sm"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleSaveEdit(prayer.id)}
                          className="px-4 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                        >
                          ✓ Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setExpandedId(null);
                          }}
                          className="px-4 py-1.5 bg-white/10 border border-white/20 text-white rounded text-sm hover:bg-white/20"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {filteredPrayers.length === 0 && (
          <div className="text-center py-20 text-white/50 text-sm">
            No prayers to moderate
          </div>
        )}
      </div>
    </div>
    </AdminAuth>
  );
}