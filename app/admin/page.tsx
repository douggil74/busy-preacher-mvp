'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Upload, Cloud, FileText, Database, MessageCircle, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AdminAuth from '@/components/AdminAuth';
import SetAdminBanner from '@/components/SetAdminBanner';

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
      title: 'Ask the Pastor Logs',
      description: 'Monitor flagged questions (abusive, spam, off-topic). Track moderation events.',
      href: '/admin/moderation',
      icon: <Shield className="w-8 h-8" />,
      badge: 'Logs',
      color: 'from-amber-500 to-amber-600',
    },
    {
      title: 'Pastoral Messages',
      description: 'View and respond to pastoral guidance conversations. Message users who shared contact info.',
      href: '/admin/pastoral-messages',
      icon: <MessageCircle className="w-8 h-8" />,
      badge: 'Messaging',
      color: 'from-pink-500 to-pink-600',
    },
    {
      title: 'Question Analytics',
      description: 'View user questions and topics for AI learning. Track common themes and needs.',
      href: '/admin/guidance-logs',
      icon: <TrendingUp className="w-8 h-8" />,
      badge: 'Insights',
      color: 'from-indigo-500 to-indigo-600',
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
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-sm" style={{
        backgroundColor: 'var(--card-bg)',
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        borderBottomColor: 'var(--card-border)'
      }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Admin Dashboard</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Bar - Small & Non-clickable */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-lg p-3" style={{
            backgroundColor: 'var(--card-bg)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--card-border)'
          }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Sermons in Database</p>
            <p className="text-2xl font-bold text-blue-400">817</p>
          </div>

          <div className="rounded-lg p-3" style={{
            backgroundColor: 'var(--card-bg)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--card-border)'
          }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Ready to Upload</p>
            <p className="text-2xl font-bold text-amber-400">866</p>
          </div>

          <div className="rounded-lg p-3" style={{
            backgroundColor: 'var(--card-bg)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--card-border)'
          }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>AI Features</p>
            <p className="text-2xl font-bold text-green-400">Active</p>
          </div>
        </div>

        {/* Admin Banner Section */}
        <div className="mb-8">
          <SetAdminBanner />
        </div>

        {/* Admin Tools Grid - Clearly Clickable */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Admin Tools <span className="text-sm font-normal" style={{ color: 'var(--text-secondary)' }}>(Click to open)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                target={tool.badge === 'External' ? '_blank' : undefined}
                rel={tool.badge === 'External' ? 'noopener noreferrer' : undefined}
                className="group rounded-xl p-4 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 cursor-pointer"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderColor: 'var(--card-border)'
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 bg-gradient-to-br ${tool.color} rounded-lg text-white shrink-0`}>
                    {tool.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold group-hover:text-blue-400 transition-colors truncate" style={{ color: 'var(--text-primary)' }}>
                      {tool.title}
                    </h3>
                  </div>
                  {tool.badge && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full shrink-0" style={{
                      backgroundColor: 'var(--card-border)',
                      color: 'var(--text-secondary)'
                    }}>
                      {tool.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                  {tool.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="rounded-xl p-4" style={{
          backgroundColor: 'var(--card-bg)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--card-border)'
        }}>
          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              href="/pastoral-guidance"
              className="flex items-center gap-2 p-2 rounded-lg hover:border-amber-500/50 border border-transparent transition-all text-sm"
              style={{ backgroundColor: 'var(--card-hover)' }}
            >
              <MessageCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>Ask the Pastor</span>
            </Link>

            <Link
              href="/prayer"
              className="flex items-center gap-2 p-2 rounded-lg hover:border-blue-500/50 border border-transparent transition-all text-sm"
              style={{ backgroundColor: 'var(--card-hover)' }}
            >
              <Shield className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>Prayer Center</span>
            </Link>

            <a
              href="https://supabase.com/dashboard/project/fteolzeggftsjevmseyn"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 rounded-lg hover:border-green-500/50 border border-transparent transition-all text-sm"
              style={{ backgroundColor: 'var(--card-hover)' }}
            >
              <Database className="w-4 h-4 text-green-400 shrink-0" />
              <span className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>Database</span>
            </a>

            <Link
              href="/"
              className="flex items-center gap-2 p-2 rounded-lg hover:border-slate-500/50 border border-transparent transition-all text-sm"
              style={{ backgroundColor: 'var(--card-hover)' }}
            >
              <ArrowLeft className="w-4 h-4 shrink-0" style={{ color: 'var(--text-secondary)' }} />
              <span className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>Home</span>
            </Link>
          </div>
        </div>

        {/* Documentation */}
        <div className="mt-4 rounded-lg p-3" style={{
          backgroundColor: 'var(--card-bg)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--card-border)'
        }}>
          <h2 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Documentation</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <a
              href="https://github.com/douggil74/busy-preacher-mvp/blob/main/SUPABASE_SETUP.md"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline transition-colors cursor-pointer"
              style={{ color: 'var(--text-link)' }}
            >
              • SUPABASE_SETUP.md
            </a>
            <a
              href="https://github.com/douggil74/busy-preacher-mvp/blob/main/SERMON_DATABASE_SUMMARY.md"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline transition-colors cursor-pointer"
              style={{ color: 'var(--text-link)' }}
            >
              • SERMON_DATABASE_SUMMARY.md
            </a>
            <a
              href="https://github.com/douggil74/busy-preacher-mvp/blob/main/ONEDRIVE_SETUP.md"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline transition-colors cursor-pointer"
              style={{ color: 'var(--text-link)' }}
            >
              • ONEDRIVE_SETUP.md
            </a>
            <a
              href="https://github.com/douggil74/busy-preacher-mvp/blob/main/THIRD_PARTY_SERVICES.md"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline transition-colors cursor-pointer"
              style={{ color: 'var(--text-link)' }}
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
