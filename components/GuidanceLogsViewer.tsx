'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Search, TrendingUp } from 'lucide-react';

interface GuidanceLog {
  id: number;
  first_name: string;
  question: string;
  answer: string;
  flagged: boolean;
  created_at: string;
}

export default function GuidanceLogsViewer() {
  const [logs, setLogs] = useState<GuidanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAnswer, setShowAnswer] = useState<number | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/guidance-logs?limit=100');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch guidance logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log =>
    log.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.first_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get question themes/topics for insights
  const getTopicInsights = () => {
    const topics: Record<string, number> = {};
    logs.forEach(log => {
      const question = log.question.toLowerCase();
      if (question.includes('anxiet') || question.includes('worry') || question.includes('fear')) {
        topics['Anxiety/Fear'] = (topics['Anxiety/Fear'] || 0) + 1;
      }
      if (question.includes('forgiv')) {
        topics['Forgiveness'] = (topics['Forgiveness'] || 0) + 1;
      }
      if (question.includes('relationship') || question.includes('marriage') || question.includes('family')) {
        topics['Relationships'] = (topics['Relationships'] || 0) + 1;
      }
      if (question.includes('faith') || question.includes('belief') || question.includes('god')) {
        topics['Faith/Belief'] = (topics['Faith/Belief'] || 0) + 1;
      }
      if (question.includes('prayer') || question.includes('pray')) {
        topics['Prayer'] = (topics['Prayer'] || 0) + 1;
      }
    });
    return Object.entries(topics).sort((a, b) => b[1] - a[1]).slice(0, 5);
  };

  const topicInsights = getTopicInsights();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Guidance Question Logs</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Tracking questions to improve AI responses and understand user needs
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Total Questions</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{logs.length}</p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-semibold text-amber-900 dark:text-amber-100">Top Topic</h3>
          </div>
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
            {topicInsights[0]?.[0] || 'N/A'}
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            {topicInsights[0]?.[1] || 0} questions
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Common Topics</h3>
          <div className="space-y-1">
            {topicInsights.slice(0, 3).map(([topic, count]) => (
              <div key={topic} className="flex justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-300">{topic}</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search questions or names..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {searchTerm ? 'No matching logs found' : 'No guidance questions logged yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Question</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleDateString()}
                      <br />
                      <span className="text-xs">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap">
                      {log.first_name}
                      {log.flagged && (
                        <span className="ml-2 px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded">
                          Flagged
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                      <div className="max-w-md truncate">{log.question}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setShowAnswer(showAnswer === log.id ? null : log.id)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium"
                      >
                        {showAnswer === log.id ? 'Hide' : 'View Full'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredLogs.map((log) =>
                  showAnswer === log.id && (
                    <tr key={`${log.id}-detail`} className="bg-slate-50 dark:bg-slate-900/50">
                      <td colSpan={4} className="px-4 py-4">
                        <div className="space-y-3 max-w-4xl">
                          <div>
                            <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                              Question
                            </h4>
                            <p className="text-sm text-slate-900 dark:text-white whitespace-pre-wrap">
                              {log.question}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                              Response
                            </h4>
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                              {log.answer}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
