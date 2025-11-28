'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Search, TrendingUp, Star, Filter, BookOpen } from 'lucide-react';

interface GuidanceLog {
  id: number;
  first_name: string;
  question: string;
  answer: string;
  flagged: boolean;
  subject?: string;
  is_learning_example?: boolean;
  improved_answer?: string;
  created_at: string;
}

export default function GuidanceLogsViewer() {
  const [logs, setLogs] = useState<GuidanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAnswer, setShowAnswer] = useState<number | null>(null);
  const [subjectCounts, setSubjectCounts] = useState<Record<string, number>>({});
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [showLearningOnly, setShowLearningOnly] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = '/api/guidance-logs?limit=200';
      if (showLearningOnly) url += '&learning=true';
      if (selectedSubject) url += `&subject=${encodeURIComponent(selectedSubject)}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        setSubjectCounts(data.subjectCounts || {});
      }
    } catch (error) {
      console.error('Failed to fetch guidance logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [showLearningOnly, selectedSubject]);

  const toggleLearningExample = async (logId: number, currentValue: boolean) => {
    try {
      const response = await fetch('/api/guidance-logs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: logId, is_learning_example: !currentValue }),
      });

      if (response.ok) {
        setLogs(logs.map(log =>
          log.id === logId ? { ...log, is_learning_example: !currentValue } : log
        ));
      }
    } catch (error) {
      console.error('Failed to update learning example:', error);
    }
  };

  const filteredLogs = logs.filter(log =>
    log.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.subject && log.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const topSubjects = Object.entries(subjectCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const learningExamplesCount = logs.filter(l => l.is_learning_example).length;

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Total Questions</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{logs.length}</p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-semibold text-amber-900 dark:text-amber-100">Learning Examples</h3>
          </div>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{learningExamplesCount}</p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">Used to train AI responses</p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-semibold text-purple-900 dark:text-purple-100">Top Subject</h3>
          </div>
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {topSubjects[0]?.[0] || 'N/A'}
          </p>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            {topSubjects[0]?.[1] || 0} questions
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Top Subjects</h3>
          <div className="space-y-1">
            {topSubjects.slice(0, 4).map(([subject, count]) => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(selectedSubject === subject ? '' : subject)}
                className={`flex justify-between text-sm w-full px-2 py-0.5 rounded transition-colors ${
                  selectedSubject === subject
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span className="text-slate-700 dark:text-slate-300 truncate">{subject}</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <button
          onClick={() => setShowLearningOnly(!showLearningOnly)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showLearningOnly
              ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Star className="w-4 h-4" />
          {showLearningOnly ? 'Showing Learning Examples Only' : 'Show Learning Examples Only'}
        </button>

        {selectedSubject && (
          <div className="flex items-center gap-2 px-3 py-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg text-sm">
            <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-indigo-700 dark:text-indigo-300">Subject: {selectedSubject}</span>
            <button
              onClick={() => setSelectedSubject('')}
              className="ml-1 text-indigo-500 hover:text-indigo-700 dark:text-indigo-400"
            >
              &times;
            </button>
          </div>
        )}
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
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Date</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Name</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Subject</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Question</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${log.is_learning_example ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
                    <td className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleDateString()}
                      <br />
                      <span className="text-xs">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap">
                      {log.first_name}
                      {log.flagged && (
                        <span className="ml-2 px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded">
                          Flagged
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm">
                      {log.subject ? (
                        <span className="inline-flex px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-full">
                          {log.subject}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300">
                      <div className="max-w-sm truncate">{log.question}</div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => toggleLearningExample(log.id, log.is_learning_example || false)}
                          className={`p-1.5 rounded transition-colors ${
                            log.is_learning_example
                              ? 'text-amber-500 bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-800'
                              : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                          title={log.is_learning_example ? 'Remove from learning examples' : 'Add as learning example'}
                        >
                          <Star className={`w-4 h-4 ${log.is_learning_example ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => setShowAnswer(showAnswer === log.id ? null : log.id)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium"
                        >
                          {showAnswer === log.id ? 'Hide' : 'View'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredLogs.map((log) =>
                  showAnswer === log.id && (
                    <tr key={`${log.id}-detail`} className="bg-slate-50 dark:bg-slate-900/50">
                      <td colSpan={5} className="px-4 py-4">
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
