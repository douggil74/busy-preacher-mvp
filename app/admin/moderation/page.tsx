'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, Ban, MessageSquareOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AdminAuth from '@/components/AdminAuth';
import { adminGet } from '@/lib/adminApi';

interface ModerationLog {
  id: string;
  created_at: string;
  moderation_type: string;
  user_question: string;
  user_ip: string;
  user_agent: string;
  response_sent: string;
}

interface ModerationStats {
  total: number;
  abusive: number;
  spam: number;
  offTopic: number;
}

export default function ModerationLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [stats, setStats] = useState<ModerationStats>({ total: 0, abusive: 0, spam: 0, offTopic: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await adminGet('/api/moderation-logs');
      const data = await response.json();
      setLogs(data.logs || []);
      setStats(data.stats || { total: 0, abusive: 0, spam: 0, offTopic: 0 });
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = filter === 'all'
    ? logs
    : logs.filter(log => log.moderation_type === filter);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'abusive': return 'text-red-400 bg-red-900/30 border-red-700/50';
      case 'spam': return 'text-orange-400 bg-orange-900/30 border-orange-700/50';
      case 'off-topic': return 'text-yellow-400 bg-yellow-900/30 border-yellow-700/50';
      default: return 'text-slate-400 bg-slate-800/30 border-slate-700/50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'abusive': return <AlertTriangle className="w-4 h-4" />;
      case 'spam': return <Ban className="w-4 h-4" />;
      case 'off-topic': return <MessageSquareOff className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <AdminAuth>
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/admin')}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Moderation Logs</h1>
            <p className="text-sm text-slate-400">Monitor flagged pastoral guidance questions</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-1">Total Flagged</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
            <p className="text-xs text-red-300 mb-1">Abusive</p>
            <p className="text-3xl font-bold text-red-400">{stats.abusive}</p>
          </div>
          <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
            <p className="text-xs text-orange-300 mb-1">Spam</p>
            <p className="text-3xl font-bold text-orange-400">{stats.spam}</p>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
            <p className="text-xs text-yellow-300 mb-1">Off-Topic</p>
            <p className="text-3xl font-bold text-yellow-400">{stats.offTopic}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'abusive', 'spam', 'off-topic'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && ` (${f === 'abusive' ? stats.abusive : f === 'spam' ? stats.spam : stats.offTopic})`}
            </button>
          ))}
        </div>

        {/* Logs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 mt-4">Loading logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/30 border border-slate-700 rounded-xl">
            <MessageSquareOff className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No moderation events found</p>
            <p className="text-sm text-slate-500 mt-2">This is good news!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`border rounded-xl p-4 ${getTypeColor(log.moderation_type)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(log.moderation_type)}
                    <span className="font-semibold capitalize">{log.moderation_type.replace('-', ' ')}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-75">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                    <p className="text-xs opacity-60 mt-1">IP: {log.user_ip}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold mb-1 opacity-75">Question:</p>
                    <p className="text-sm bg-black/20 rounded p-2">{log.user_question}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold mb-1 opacity-75">Response Sent:</p>
                    <p className="text-xs bg-black/20 rounded p-2 opacity-90">{log.response_sent}</p>
                  </div>

                  <div>
                    <p className="text-xs opacity-60">User Agent: {log.user_agent}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
    </AdminAuth>
  );
}
