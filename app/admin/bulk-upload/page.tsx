'use client';

import { useState, useCallback } from 'react';
import { ArrowLeft, Upload, File, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AdminAuth from '@/components/AdminAuth';
import { adminPostFormData } from '@/lib/adminApi';

interface FileStatus {
  file: File;
  status: 'pending' | 'processing' | 'success' | 'error';
  message?: string;
  progress?: number;
}

export default function BulkUploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [summary, setSummary] = useState<{ uploaded: number; skipped: number; errors: number } | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    // Filter for accepted file types (.txt, .docx only) - skip .doc, .ppt
    const acceptedFiles = newFiles.filter(file => {
      const ext = file.name.toLowerCase();
      return ext.endsWith('.txt') || ext.endsWith('.docx');
    });

    const fileStatuses: FileStatus[] = acceptedFiles.map(file => ({
      file,
      status: 'pending',
    }));

    setFiles(prev => [...prev, ...fileStatuses]);
    setSummary(null); // Reset summary when adding new files
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    let uploaded = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < files.length; i++) {
      const fileStatus = files[i];

      // Update status to processing
      setFiles(prev => prev.map((f, idx) =>
        idx === i ? { ...f, status: 'processing' as const } : f
      ));

      try {
        // Create FormData
        const formData = new FormData();
        formData.append('file', fileStatus.file);

        // Upload file
        const response = await adminPostFormData('/api/sermons/bulk-upload', formData);

        const result = await response.json();

        if (response.ok && result.success) {
          // Success
          setFiles(prev => prev.map((f, idx) =>
            idx === i ? {
              ...f,
              status: 'success' as const,
              message: `Uploaded: ${result.title}`
            } : f
          ));
          uploaded++;
        } else {
          // Error or skipped
          if (result.skipped) {
            setFiles(prev => prev.map((f, idx) =>
              idx === i ? {
                ...f,
                status: 'error' as const,
                message: `Skipped: ${result.reason}`
              } : f
            ));
            skipped++;
          } else {
            setFiles(prev => prev.map((f, idx) =>
              idx === i ? {
                ...f,
                status: 'error' as const,
                message: `Error: ${result.error || 'Upload failed'}`
              } : f
            ));
            errors++;
          }
        }
      } catch (error) {
        // Network error
        setFiles(prev => prev.map((f, idx) =>
          idx === i ? {
            ...f,
            status: 'error' as const,
            message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          } : f
        ));
        errors++;
      }

      // Small delay between files to avoid rate limiting
      if (i < files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setIsUploading(false);
    setSummary({ uploaded, skipped, errors });
  };

  const clearAll = () => {
    setFiles([]);
    setSummary(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <AdminAuth>
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/sermons')}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Upload className="w-8 h-8 text-amber-400" />
              Bulk Upload Sermons
            </h1>
            <p className="text-slate-300 mt-1">Upload multiple sermon files at once</p>
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="mb-6 p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
            <h3 className="font-semibold text-white mb-2">Upload Complete</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400">{summary.uploaded}</div>
                <div className="text-sm text-slate-300">Uploaded</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-400">{summary.skipped}</div>
                <div className="text-sm text-slate-300">Skipped</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">{summary.errors}</div>
                <div className="text-sm text-slate-300">Errors</div>
              </div>
            </div>
          </div>
        )}

        {/* Drag & Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mb-6 border-2 border-dashed rounded-xl p-12 text-center transition-all ${
            isDragging
              ? 'border-amber-500 bg-amber-500/10'
              : 'border-slate-700 bg-slate-800/30'
          }`}
        >
          <Upload className={`w-16 h-16 mx-auto mb-4 ${isDragging ? 'text-amber-400' : 'text-slate-400'}`} />
          <h3 className="text-xl font-semibold text-white mb-2">
            {isDragging ? 'Drop files here' : 'Drag & drop sermon files'}
          </h3>
          <p className="text-slate-300 mb-4">
            Supports .txt and .docx files (modern Word format)
          </p>
          <label className="inline-block px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium cursor-pointer transition-colors">
            <input
              type="file"
              multiple
              accept=".txt,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            Or click to browse
          </label>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Files ({files.length})
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={clearAll}
                  disabled={isUploading}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear All
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading || files.every(f => f.status === 'success')}
                  className="px-6 py-2 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload All
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {files.map((fileStatus, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg border border-slate-700"
                >
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {fileStatus.status === 'pending' && (
                      <File className="w-5 h-5 text-slate-400" />
                    )}
                    {fileStatus.status === 'processing' && (
                      <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                    )}
                    {fileStatus.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                    {fileStatus.status === 'error' && (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">
                      {fileStatus.file.name}
                    </div>
                    <div className="text-sm text-slate-400">
                      {formatFileSize(fileStatus.file.size)}
                      {fileStatus.message && (
                        <span className="ml-2">• {fileStatus.message}</span>
                      )}
                    </div>
                  </div>

                  {/* Remove Button */}
                  {fileStatus.status === 'pending' && !isUploading && (
                    <button
                      onClick={() => removeFile(index)}
                      className="flex-shrink-0 p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500 rounded-lg">
          <h3 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            File Processing Info:
          </h3>
          <ul className="space-y-1 text-sm text-slate-300">
            <li>• Accepts .txt and .docx files (modern Word format only)</li>
            <li>• Legacy .doc files not supported - convert to .docx or .txt first</li>
            <li>• PowerPoint files (.ppt, .pptx) will be ignored</li>
            <li>• Files are processed one at a time (~2-3 seconds each)</li>
            <li>• Duplicate titles will be skipped automatically</li>
            <li>• Recommended filename format: <code className="text-green-400">YYYY-MM-DD Sermon Title.txt</code></li>
          </ul>
        </div>
      </div>
    </div>
    </AdminAuth>
  );
}
