import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, Database, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { isSupabaseConfigured, supabase, initializeSupabase } from '../../lib/supabase';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onNavigatePublic: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onNavigatePublic,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const supabaseActive = isSupabaseConfigured();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const client = (await initializeSupabase()) || supabase;
      const isConfigured = isSupabaseConfigured() && Boolean(client);

      if (isConfigured && client) {
        // Attempt Supabase Auth
        const { data, error } = await client.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message?.includes('Failed to fetch')) {
            setErrorMsg('Network Connection Error: Could not connect to Supabase authentication server. Please verify your internet connection.');
          } else {
            setErrorMsg(error.message || 'Invalid email or password credentials.');
          }
          setLoading(false);
          return;
        }

        if (data.session) {
          // Verify admin authorization via RPC
          const { data: isAdminRes, error: rpcErr } = await client.rpc('is_admin');
          if (rpcErr || isAdminRes !== true) {
            await client.auth.signOut();
            setErrorMsg('Unauthorized: You do not have administrator permissions.');
            setLoading(false);
            return;
          }

          onLoginSuccess();
          return;
        } else {
          setErrorMsg('Authentication failed: Session not established.');
          setLoading(false);
          return;
        }
      } else {
        setErrorMsg('Supabase service is required for administrator authentication.');
      }
    } catch (err: any) {
      if (err?.message?.includes('Failed to fetch')) {
        setErrorMsg('Network Connection Error: Could not connect to Supabase authentication server.');
      } else {
        setErrorMsg(err?.message || 'Login failed. Please check credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-[1px] mx-auto shadow-2xl shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full rounded-[15px] bg-[#090d16] flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Admin Dashboard Access
          </h1>
          <p className="text-slate-400 text-xs">
            Authenticate to manage personal content, projects, and site settings.
          </p>
        </div>

        {/* Database Status Alert */}
        <div
          className={`p-3 rounded-2xl border text-xs flex items-center gap-2.5 font-mono ${
            supabaseActive
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}
        >
          <Database className="w-4 h-4 shrink-0" />
          <span>
            {supabaseActive
              ? 'Supabase Auth Enabled'
              : 'Local Persistence Mode (Connect Supabase in Settings)'}
          </span>
        </div>

        {/* Login Form */}
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-2xl space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-xs shadow-xl shadow-blue-500/25 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Public Website Link */}
        <div className="text-center">
          <button
            onClick={onNavigatePublic}
            className="text-xs font-mono text-slate-400 hover:text-blue-400 transition-colors"
          >
            ← Return to Public Website
          </button>
        </div>
      </div>
    </div>
  );
};
