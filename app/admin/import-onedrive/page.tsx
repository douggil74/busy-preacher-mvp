'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Cloud, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AdminAuth from '@/components/AdminAuth';

export default function ImportOneDrivePage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState('');
  const [folderPath, setFolderPath] = useState('root:/Sermons');
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    imported?: number;
    skipped?: number;
    total?: number;
    message?: string;
    errors?: string[];
  } | null>(null);

  const handleAuth = () => {
    // Microsoft OAuth 2.0 authentication
    const clientId = process.env.NEXT_PUBLIC_ONEDRIVE_CLIENT_ID || 'YOUR_CLIENT_ID';
    const redirectUri = encodeURIComponent(window.location.origin + '/admin/import-onedrive');
    const scope = encodeURIComponent('Files.Read.All offline_access');

    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scope}`;

    window.location.href = authUrl;
  };

  const handleImport = async () => {
    if (!accessToken) {
      alert('Please authorize OneDrive access first');
      return;
    }

    setIsImporting(true);
    setResult(null);

    try {
      const response = await fetch('/api/sermons/import-onedrive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken,
          folderId: folderPath,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Import failed',
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Check for token in URL hash (from OAuth redirect)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      if (token) {
        setAccessToken(token);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

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
              <Cloud className="w-8 h-8 text-blue-400" />
              Import from OneDrive
            </h1>
            <p className="text-slate-300 mt-1">Bulk import your sermon archive</p>
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div className={`mb-6 p-4 rounded-lg border ${
            result.success
              ? 'bg-green-500/10 border-green-500'
              : 'bg-red-500/10 border-red-500'
          }`}>
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${result.success ? 'text-green-500' : 'text-red-500'}`}>
                  {result.message}
                </p>
                {result.success && result.imported !== undefined && (
                  <p className="text-slate-300 mt-2">
                    <strong>{result.imported}</strong> sermons imported,
                    <strong> {result.skipped}</strong> skipped
                    (out of <strong>{result.total}</strong> files)
                  </p>
                )}
                {result.errors && result.errors.length > 0 && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-slate-200 hover:text-white">
                      Show errors ({result.errors.length})
                    </summary>
                    <ul className="mt-2 space-y-1 text-sm text-slate-300">
                      {result.errors.map((error, i) => (
                        <li key={i}>• {error}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-6">
          {/* Step 1: Authorize */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">Step 1: Authorize OneDrive Access</h2>
            {accessToken ? (
              <div className="p-3 bg-green-500/10 border border-green-500 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-500 font-medium">Connected to OneDrive</span>
              </div>
            ) : (
              <button
                onClick={handleAuth}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Cloud className="w-5 h-5" />
                Sign in with Microsoft
              </button>
            )}
          </div>

          {/* Step 2: Configure Folder */}
          {accessToken && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">Step 2: Specify Folder Path</h2>
              <p className="text-sm text-slate-200 mb-3">
                Enter the path to your sermon files folder in OneDrive
              </p>
              <input
                type="text"
                value={folderPath}
                onChange={(e) => setFolderPath(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="root:/Sermons"
              />
              <p className="text-xs text-slate-300 mt-2">
                Examples: <code className="bg-slate-700 px-1 rounded text-slate-200">root:/Sermons</code> or <code className="bg-slate-700 px-1 rounded text-slate-200">root:/Documents/Sermons</code>
              </p>
            </div>
          )}

          {/* Step 3: Import */}
          {accessToken && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">Step 3: Import Sermons</h2>
              <button
                onClick={handleImport}
                disabled={isImporting || !accessToken}
                className="w-full px-6 py-3 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Importing Sermons...
                  </>
                ) : (
                  <>
                    <Cloud className="w-5 h-5" />
                    Start Import
                  </>
                )}
              </button>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-blue-500/10 border border-blue-500 rounded-lg">
            <h3 className="font-semibold text-blue-400 mb-2">What This Does:</h3>
            <ul className="space-y-1 text-sm text-slate-300">
              <li>• Reads all .txt, .doc, .docx, and .pdf files from your OneDrive folder</li>
              <li>• Extracts sermon title, date, and content</li>
              <li>• Generates AI embeddings for semantic search</li>
              <li>• Stores everything in Supabase for Pastoral Counseling</li>
              <li>• Skips duplicates automatically</li>
            </ul>
          </div>

          {/* File Naming Convention */}
          <div className="p-4 bg-slate-900 border border-slate-700 rounded-lg">
            <h3 className="font-semibold text-white mb-2">Recommended File Naming:</h3>
            <code className="text-sm text-green-400 block mb-2">
              YYYY-MM-DD Sermon Title.txt
            </code>
            <p className="text-xs text-slate-200">
              Examples:<br/>
              • <span className="text-slate-100">2020-03-15 Walking by Faith.txt</span><br/>
              • <span className="text-slate-100">2021-07-04 God's Love Never Fails.txt</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
    </AdminAuth>
  );
}
