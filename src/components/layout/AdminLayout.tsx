import React, { useState } from 'react';
import {
  LayoutDashboard,
  User,
  Info,
  Code2,
  FolderGit2,
  Award,
  Briefcase,
  GraduationCap,
  FileText,
  Star,
  Share2,
  Inbox,
  Image,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Database,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: (targetPath?: string) => void;
  unreadMessagesCount?: number;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  currentPath,
  onNavigate,
  onLogout,
  unreadMessagesCount = 0,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const supabaseActive = isSupabaseConfigured();

  React.useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileSidebarOpen]);

  const adminNav = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Profile & Hero', path: '/admin/profile', icon: User },
    { name: 'About Page', path: '/admin/about', icon: Info },
    { name: 'Skills', path: '/admin/skills', icon: Code2 },
    { name: 'Projects', path: '/admin/projects', icon: FolderGit2 },
    { name: 'Certificates', path: '/admin/certificates', icon: Award },
    { name: 'Experience', path: '/admin/experience', icon: Briefcase },
    { name: 'Education', path: '/admin/education', icon: GraduationCap },
    { name: 'Resume / CV', path: '/admin/resume', icon: FileText },
    { name: 'Client Reviews', path: '/admin/reviews', icon: Star },
    { name: 'Social Links', path: '/admin/social-links', icon: Share2 },
    {
      name: 'Messages',
      path: '/admin/messages',
      icon: Inbox,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
    { name: 'Media Library', path: '/admin/media', icon: Image },
    { name: 'Site Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleNavClick = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(path);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <a
            href="/admin"
            onClick={(e) => handleNavClick('/admin', e)}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white">
                Mostafa Admin
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Portfolio Control Panel
              </span>
            </div>
          </a>
        </div>

        {/* Database Status & Quick Links */}
        <div className="flex items-center gap-3 text-xs">
          <div
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border ${
              supabaseActive
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px]">
              {supabaseActive ? 'Supabase Connected' : 'Local Persistence (Offline Mode)'}
            </span>
          </div>

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onLogout('/');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-white transition-all"
            title="Sign out of admin session and return to public website"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">View Public Site</span>
          </a>

          <button
            onClick={() => onLogout()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 transition-all"
            title="Log out of Admin Dashboard"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:flex flex-col w-64 bg-slate-950/80 border-r border-slate-800/80 p-4 shrink-0 overflow-y-auto">
          <div className="mb-4 px-2 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Navigation Menu</span>
            <Sparkles className="w-3 h-3 text-blue-400" />
          </div>

          <nav className="flex-1 space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentPath === item.path ||
                (item.path !== '/admin' && currentPath.startsWith(item.path));

              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleNavClick(item.path, e)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/20 border border-blue-500/30 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                    <span>{item.name}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white font-bold text-[10px]">
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>

          <div className="mt-6 pt-4 border-t border-slate-800/80 px-2 text-[11px] text-slate-400 font-mono">
            <p className="truncate">Mostafa Portfolio v1.0</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Admin Security Active</p>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />

            <aside className="relative z-10 w-72 bg-[#090d16] border-r border-slate-800 p-5 flex flex-col h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                  <span className="font-bold text-sm text-white">Admin Menu</span>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1 flex-1">
                {adminNav.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    currentPath === item.path ||
                    (item.path !== '/admin' && currentPath.startsWith(item.path));

                  return (
                    <a
                      key={item.path}
                      href={item.path}
                      onClick={(e) => handleNavClick(item.path, e)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium ${
                        isActive
                          ? 'bg-blue-600/20 border border-blue-500/30 text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-blue-400" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white font-bold text-[10px]">
                          {item.badge}
                        </span>
                      )}
                    </a>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between">
                <button
                  onClick={() => onLogout()}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#06080d]">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
