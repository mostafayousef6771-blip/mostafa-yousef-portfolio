import React, { useState, useEffect, useRef } from 'react';
import { User, Save, CheckCircle2, Image, Sparkles, Upload, Loader2 } from 'lucide-react';
import { Profile } from '../../types/portfolio';
import { repository } from '../../lib/repository';

interface AdminProfilePageProps {
  profile: Profile | null;
  onRefresh: () => void;
}

export const AdminProfilePage: React.FC<AdminProfilePageProps> = ({ profile = null, onRefresh }) => {
  const [formData, setFormData] = useState<Partial<Profile>>({
    full_name: '',
    headline: '',
    bio: '',
    location: '',
    avatar_url: '',
    hero_greeting: '',
    hero_cta_work_label: 'View My Work',
    hero_cta_contact_label: 'Contact Me',
  });

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (profile) {
      let rawAvatar: any = profile.avatar_url;
      if (rawAvatar && typeof rawAvatar === 'object') {
        rawAvatar = rawAvatar.url || rawAvatar.publicUrl || '';
      }
      if (typeof rawAvatar === 'string' && rawAvatar.trim() === '[object Object]') {
        rawAvatar = '';
      }

      setFormData({
        ...profile,
        avatar_url: typeof rawAvatar === 'string' ? rawAvatar : '',
      });
    }
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      const finalUrl = await repository.uploadFile(file, 'profile');
      setFormData((prev) => ({ ...prev, avatar_url: finalUrl }));
    } catch (err: any) {
      setUploadError(err.message || 'Avatar upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setSaveError(null);
    try {
      await repository.updateProfile(formData);
      setSaved(true);
      onRefresh();
      setTimeout(() => setSaved(false), 4000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setSaveError(err.message || 'Failed to save profile. Please check permissions.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <User className="w-6 h-6 text-blue-400" />
            <span>Profile & Hero Content</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Manage your real name, professional title, bio, location, avatar photo, and hero CTA labels.
          </p>
        </div>

        {saved && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Saved successfully!</span>
          </div>
        )}
      </div>

      {saveError && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
          <span>⚠️ {saveError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-5">
          <h3 className="text-xs font-mono font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Personal Identity</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Mostafa Yousef"
                value={formData.full_name || ''}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Professional Title / Headline</label>
              <input
                type="text"
                placeholder="e.g. Senior Full-Stack Engineer"
                value={formData.headline || ''}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Location</label>
              <input
                type="text"
                placeholder="e.g. London, United Kingdom / Remote"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Avatar Image</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="https://... / avatar image URL"
                  value={formData.avatar_url || ''}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                  className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  className="hidden"
                  accept="image/*"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                  title="Upload avatar image"
                >
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>Upload</span>
                </button>
              </div>

              {uploadError && (
                <p className="mt-1.5 text-[11px] font-mono text-rose-400 flex items-center gap-1">
                  <span>{uploadError}</span>
                </p>
              )}

              {formData.avatar_url && typeof formData.avatar_url === 'string' && formData.avatar_url !== '[object Object]' && (
                <div className="mt-3 flex items-center gap-3 p-2 bg-slate-950/60 border border-slate-800 rounded-2xl w-fit">
                  <img
                    src={formData.avatar_url}
                    alt="Avatar preview"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="text-[11px]">
                    <p className="font-mono text-slate-300 font-bold">Avatar Preview</p>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar_url: '' })}
                      className="text-rose-400 hover:underline text-[10px] font-mono"
                    >
                      Remove image
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">Short Professional Bio</label>
            <textarea
              rows={4}
              placeholder="A brief summary of your expertise, experience, and specialization..."
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-5">
          <h3 className="text-xs font-mono font-semibold text-purple-400 uppercase tracking-wider">
            Homepage Hero Greetings & CTAs
          </h3>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">Hero Welcoming Message Pill</label>
            <input
              type="text"
              placeholder="e.g. Welcome to my official portfolio"
              value={formData.hero_greeting || ''}
              onChange={(e) => setFormData({ ...formData, hero_greeting: e.target.value })}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Primary Button Label</label>
              <input
                type="text"
                value={formData.hero_cta_work_label || ''}
                onChange={(e) => setFormData({ ...formData, hero_cta_work_label: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Secondary Button Label</label>
              <input
                type="text"
                value={formData.hero_cta_contact_label || ''}
                onChange={(e) => setFormData({ ...formData, hero_cta_contact_label: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
