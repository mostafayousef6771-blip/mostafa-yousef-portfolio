import React, { useState, useEffect } from 'react';
import { Settings, Save, Check, Globe, Search, BarChart3, Image as ImageIcon } from 'lucide-react';
import { SiteSettings } from '../../types/portfolio';
import { repository } from '../../lib/repository';

interface AdminSettingsPageProps {
  onRefresh?: () => void;
}

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({ onRefresh }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState<SiteSettings>({
    site_title: 'Mostafa Portfolio',
    meta_description: 'Official personal portfolio web application',
    keywords: 'portfolio, software engineer, developer, fullstack, web development',
    og_image_url: '',
    google_analytics_id: '',
    google_search_console_code: '',
    allow_indexing: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await repository.getSettings();
      if (data) {
        setSettings(data);
      }
    } catch (err) {
      console.error('Error loading site settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await repository.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error updating settings:', err);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 font-mono text-xs">
        Loading site settings...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-blue-400 mb-1">
            <Settings className="w-4 h-4" />
            <span>Site Configuration & SEO</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Site Settings</h1>
          <p className="text-xs text-slate-400">
            Manage global metadata, SEO tags, analytics IDs, and indexing permissions.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic SEO Settings */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200 border-b border-slate-800 pb-3">
            <Globe className="w-4 h-4 text-blue-400" />
            <span>Global Search & SEO Metadata</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Site Title (Browser Tab)
              </label>
              <input
                type="text"
                value={settings.site_title}
                onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
                placeholder="e.g. Mostafa - Personal Portfolio"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Meta Description
              </label>
              <textarea
                rows={3}
                value={settings.meta_description}
                onChange={(e) => setSettings({ ...settings, meta_description: e.target.value })}
                placeholder="Short summary for search engines and social links..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Meta Keywords (comma separated)
              </label>
              <input
                type="text"
                value={settings.keywords}
                onChange={(e) => setSettings({ ...settings, keywords: e.target.value })}
                placeholder="portfolio, software engineer, react, nodejs"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                OpenGraph Image URL (Social Preview)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={settings.og_image_url}
                  onChange={(e) => setSettings({ ...settings, og_image_url: e.target.value })}
                  placeholder="https://..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="allow_indexing"
                checked={settings.allow_indexing}
                onChange={(e) => setSettings({ ...settings, allow_indexing: e.target.checked })}
                className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0"
              />
              <label htmlFor="allow_indexing" className="text-xs text-slate-300 cursor-pointer">
                Allow Search Engines to Index Site (robots.txt / index meta)
              </label>
            </div>
          </div>
        </div>

        {/* Third-Party Integrations */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200 border-b border-slate-800 pb-3">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <span>Analytics & Search Console</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Google Analytics Measurement ID
              </label>
              <input
                type="text"
                value={settings.google_analytics_id}
                onChange={(e) => setSettings({ ...settings, google_analytics_id: e.target.value })}
                placeholder="G-XXXXXXXXXX"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Google Search Console Verification Tag
              </label>
              <input
                type="text"
                value={settings.google_search_console_code}
                onChange={(e) => setSettings({ ...settings, google_search_console_code: e.target.value })}
                placeholder="google-site-verification=..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4">
          {saved && (
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>Settings Saved Successfully!</span>
            </span>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Site Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
