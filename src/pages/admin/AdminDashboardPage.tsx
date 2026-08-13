import React from 'react';
import {
  FolderGit2,
  Award,
  Code2,
  Inbox,
  Star,
  Share2,
  ArrowRight,
  Database,
  CheckCircle2,
  Sparkles,
  User,
  Settings,
  FileText,
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

interface AdminDashboardPageProps {
  onNavigate: (path: string) => void;
  stats: {
    projectsCount: number;
    certificatesCount: number;
    skillsCount: number;
    messagesCount: number;
    unreadMessagesCount: number;
    reviewsCount: number;
    socialLinksCount: number;
  };
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onNavigate,
  stats,
}) => {
  const supabaseActive = isSupabaseConfigured();

  const metrics = [
    {
      title: 'Projects',
      count: stats.projectsCount,
      icon: FolderGit2,
      path: '/admin/projects',
      color: 'from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/30',
    },
    {
      title: 'Certificates',
      count: stats.certificatesCount,
      icon: Award,
      path: '/admin/certificates',
      color: 'from-purple-500/20 to-pink-500/10 text-purple-400 border-purple-500/30',
    },
    {
      title: 'Technical Skills',
      count: stats.skillsCount,
      icon: Code2,
      path: '/admin/skills',
      color: 'from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/30',
    },
    {
      title: 'Messages',
      count: stats.messagesCount,
      badge: stats.unreadMessagesCount > 0 ? `${stats.unreadMessagesCount} unread` : undefined,
      icon: Inbox,
      path: '/admin/messages',
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
    },
    {
      title: 'Client Reviews',
      count: stats.reviewsCount,
      icon: Star,
      path: '/admin/reviews',
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30',
    },
    {
      title: 'Social Links',
      count: stats.socialLinksCount,
      icon: Share2,
      path: '/admin/social-links',
      color: 'from-indigo-500/20 to-purple-500/10 text-indigo-400 border-indigo-500/30',
    },
  ];

  const quickActions = [
    { title: 'Update Profile & Bio', path: '/admin/profile', icon: User },
    { title: 'Publish New Project', path: '/admin/projects', icon: FolderGit2 },
    { title: 'Add Certificate', path: '/admin/certificates', icon: Award },
    { title: 'Upload Resume / CV', path: '/admin/resume', icon: FileText },
    { title: 'Configure Supabase & SEO', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Admin Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome to Portfolio Admin
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
              Manage your personal information, showcase projects, client reviews, CV, and site settings.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-xs font-mono text-blue-300 hover:text-white transition-all shrink-0"
          >
            <span>View Live Website</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Database Connection Alert Box */}
      <div
        className={`p-5 rounded-2xl border text-xs leading-relaxed flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          supabaseActive
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-slate-900 border-slate-800 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400 font-bold shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">
              {supabaseActive
                ? 'Supabase Backend Connected'
                : 'Local Persistence Engine Active'}
            </h4>
            <p className="text-slate-400 text-xs">
              {supabaseActive
                ? 'Your portfolio is connected directly to Supabase PostgreSQL and Auth.'
                : 'Data is currently stored in local persistent state. Connect your Supabase project URL and anon key in Settings.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('/admin/settings')}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-200 transition-all shrink-0"
        >
          {supabaseActive ? 'View Settings' : 'Connect Supabase'}
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.title}
              onClick={() => onNavigate(m.path)}
              className={`p-5 rounded-2xl bg-gradient-to-br ${m.color} bg-slate-900/60 border backdrop-blur-xl hover:border-blue-500/50 transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between shadow-lg`}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-6 h-6 stroke-[1.5]" />
                {m.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[10px]">
                    {m.badge}
                  </span>
                )}
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
                  {m.count}
                </div>
                <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                  <span>{m.title}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-mono font-semibold text-slate-300 uppercase tracking-wider">
          Quick Management Shortcuts
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.title}
                onClick={() => onNavigate(act.path)}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-blue-500/40 text-left flex items-center justify-between text-xs text-slate-200 hover:text-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{act.title}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
