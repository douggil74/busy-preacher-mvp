'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Upload, Cloud, FileText, Database, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AdminAuth from '@/components/AdminAuth';

interface AdminTool {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  color: string;
}

export default function AdminDashboard() {
  const router = useRouter();

  const tools: AdminTool[] = [
    {
      title: 'Prayer Moderation',
      description: 'Review and moderate user prayer requests. Approve or reject submissions.',
      href: '/admin/prayer-moderation',
      icon: <Shield className="w-8 h-8" />,
      badge: 'Moderation',
      color: 'from-red-500 to-red-600',
    },
    {
      title: 'Pastoral Guidance Logs',
      description: 'Monitor flagged questions (abusive, spam, off-topic). Track moderation events.',
      href: '/admin/moderation',
      icon: <Shield className="w-8 h-8" />,
      badge: 'Logs',
      color: 'from-amber-500 to-amber-600',
    },
    {
      title: 'Manual Sermon Upload',
      description: 'Upload individual sermons with title, date, scripture, and content.',
      href: '/admin/sermons',
      icon: <FileText className="w-8 h-8" />,
      badge: 'Upload',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Bulk Sermon Upload',
      description: 'Upload multiple sermon .txt files at once. Automatic processing.',
      href: '/admin/bulk-upload',
      icon: <Upload className="w-8 h-8" />,
      badge: 'Bulk',
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'OneDrive Import',
      description: 'Import sermons directly from your OneDrive folder. Batch processing.',
      href: '/admin/import-onedrive',
      icon: <Cloud className="w-8 h-8" />,
      badge: 'Cloud',
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Sermon Database',
      description: 'View and manage your sermon database in Supabase (opens in new tab).',
      href: 'https://supabase.com/dashboard/project/fteolzeggftsjevmseyn',
      icon: <Database className="w-8 h-8" />,
      badge: 'External',
      color: 'from-emerald-500 to-emerald-600',
    },
  ];

  return (
    <AdminAuth>
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Bar - Small & Non-clickable */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">Sermons in Database</p>
            <p className="text-2xl font-bold text-blue-400">817</p>
          </div>

          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">Ready to Upload</p>
            <p className="text-2xl font-bold text-amber-400">866</p>
          </div>

          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">AI Features</p>
            <p className="text-2xl font-bold text-green-400">Active</p>
          </div>
        </div>

        {/* Admin Tools Grid - Clearly Clickable */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Admin Tools <span className="text-sm text-slate-500 font-normal">(Click to open)</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                target={tool.badge === 'External' ? '_blank' : undefined}
                rel={tool.badge === 'External' ? 'noopener noreferrer' : undefined}
                className="group bg-gradient-to-br from-slate-800 to-slate-800/50 border-2 border-slate-700 rounded-xl p-4 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 bg-gradient-to-br ${tool.color} rounded-lg text-white shrink-0`}>
                    {tool.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                      {tool.title}
                    </h3>
                  </div>
                  {tool.badge && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-slate-700/50 text-slate-300 rounded-full shrink-0">
                      {tool.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {tool.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-slate-800/20 border border-slate-700/50 rounded-xl p-4">
          <h2 className="text-base font-bold text-white mb-3">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              href="/pastoral-guidance"
              className="flex items-center gap-2 p-2 bg-slate-800/30 rounded-lg hover:bg-slate-800/60 hover:border-amber-500/50 border border-transparent transition-all text-sm"
            >
              <MessageCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-white font-medium truncate">Pastoral Guidance</span>
            </Link>

            <Link
              href="/prayer"
              className="flex items-center gap-2 p-2 bg-slate-800/30 rounded-lg hover:bg-slate-800/60 hover:border-blue-500/50 border border-transparent transition-all text-sm"
            >
              <Shield className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-white font-medium truncate">Prayer Center</span>
            </Link>

            <a
              href="https://supabase.com/dashboard/project/fteolzeggftsjevmseyn"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 bg-slate-800/30 rounded-lg hover:bg-slate-800/60 hover:border-green-500/50 border border-transparent transition-all text-sm"
            >
              <Database className="w-4 h-4 text-green-400 shrink-0" />
              <span className="text-white font-medium truncate">Database</span>
            </a>

            <Link
              href="/"
              className="flex items-center gap-2 p-2 bg-slate-800/30 rounded-lg hover:bg-slate-800/60 hover:border-slate-500/50 border border-transparent transition-all text-sm"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-white font-medium truncate">Home</span>
            </Link>
          </div>
        </div>

        {/* Documentation */}
        <div className="mt-4 bg-blue-900/10 border border-blue-700/30 rounded-lg p-3">
          <h2 className="text-sm font-bold text-blue-200 mb-2">Documentation</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <a
              href="https://github.com/douggil74/busy-preacher-mvp/blob/main/SUPABASE_SETUP.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 hover:text-blue-100 hover:underline transition-colors cursor-pointer"
            >
              • SUPABASE_SETUP.md
            </a>
            <a
              href="https://github.com/douggil74/busy-preacher-mvp/blob/main/SERMON_DATABASE_SUMMARY.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 hover:text-blue-100 hover:underline transition-colors cursor-pointer"
            >
              • SERMON_DATABASE_SUMMARY.md
            </a>
            <a
              href="https://github.com/douggil74/busy-preacher-mvp/blob/main/ONEDRIVE_SETUP.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 hover:text-blue-100 hover:underline transition-colors cursor-pointer"
            >
              • ONEDRIVE_SETUP.md
            </a>
            <a
              href="https://github.com/douggil74/busy-preacher-mvp/blob/main/THIRD_PARTY_SERVICES.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 hover:text-blue-100 hover:underline transition-colors cursor-pointer"
            >
              • THIRD_PARTY_SERVICES.md
            </a>
          </div>
        </div>
      </div>
    </div>
    </AdminAuth>
  );
}
