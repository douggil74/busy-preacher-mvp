'use client';

import { useState } from 'react';
import { ArrowLeft, Upload, Loader2, CheckCircle, FileStack } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AdminAuth from '@/components/AdminAuth';
import { adminPostJSON } from '@/lib/adminApi';

export default function AdminSermonsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    scripture_reference: '',
    content: '',
    summary: '',
    topics: '',
    series: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setError('');
    setUploadSuccess(false);

    try {
      const response = await adminPostJSON('/api/sermons/upload', {
        ...formData,
        topics: formData.topics.split(',').map(t => t.trim()).filter(Boolean),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload sermon');
      }

      setUploadSuccess(true);
      // Reset form
      setFormData({
        title: '',
        date: '',
        scripture_reference: '',
        content: '',
        summary: '',
        topics: '',
        series: '',
      });

      setTimeout(() => setUploadSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AdminAuth>
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Upload className="w-8 h-8 text-amber-500" />
              Upload Sermons
            </h1>
            <p className="text-slate-400 mt-1">Add sermons to the pastoral counseling database</p>
          </div>
        </div>

        {/* Bulk Upload CTA */}
        <div className="mb-6 p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/50 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
                <FileStack className="w-5 h-5 text-blue-400" />
                Have multiple sermon files?
              </h3>
              <p className="text-sm text-slate-300">
                Upload hundreds of sermons at once with our bulk uploader (.txt, .doc, .docx files)
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/bulk-upload')}
              className="ml-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <FileStack className="w-4 h-4" />
              Bulk Upload
            </button>
          </div>
        </div>

        {/* Success Message */}
        {uploadSuccess && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-green-500 font-medium">Sermon uploaded successfully!</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Sermon Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="e.g., Walking by Faith"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Date Preached
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Scripture Reference */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Scripture Reference
            </label>
            <input
              type="text"
              value={formData.scripture_reference}
              onChange={(e) => setFormData({ ...formData, scripture_reference: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="e.g., 2 Corinthians 5:7"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Summary
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Brief summary of the sermon..."
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Sermon Content *
            </label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={12}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-sm"
              placeholder="Paste the full sermon text or transcript here..."
            />
          </div>

          {/* Topics */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Topics (comma-separated)
            </label>
            <input
              type="text"
              value={formData.topics}
              onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="e.g., faith, trust, anxiety, peace"
            />
          </div>

          {/* Series */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Series Name
            </label>
            <input
              type="text"
              value={formData.series}
              onChange={(e) => setFormData({ ...formData, series: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="e.g., Life of David"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading}
            className="w-full px-6 py-3 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading & Generating Embeddings...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload Sermon
              </>
            )}
          </button>

          <p className="text-xs text-slate-500 text-center">
            This will generate AI embeddings and add the sermon to the database for pastoral counseling searches.
          </p>
        </form>
      </div>
    </div>
    </AdminAuth>
  );
}
