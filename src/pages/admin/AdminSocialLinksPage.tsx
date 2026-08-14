import React, { useState } from 'react';
import { Share2, Plus, Edit3, Trash2, Save, X, Globe, AlertCircle } from 'lucide-react';
import { SocialLink } from '../../types/portfolio';
import { repository, getErrorMessage } from '../../lib/repository';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

interface AdminSocialLinksPageProps {
  socialLinks: SocialLink[];
  onRefresh: () => void;
}

export const AdminSocialLinksPage: React.FC<AdminSocialLinksPageProps> = ({
  socialLinks = [],
  onRefresh,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);

  const [formData, setFormData] = useState<Partial<SocialLink>>({
    platform: 'GitHub',
    label: 'GitHub Profile',
    url: '',
    icon: 'Github',
    is_enabled: true,
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleStartNew = () => {
    setFormData({
      platform: 'LinkedIn',
      label: 'LinkedIn Profile',
      url: '',
      icon: 'Linkedin',
      is_enabled: true,
      display_order: (socialLinks?.length || 0) + 1,
    });
    setEditingId('new');
    setIsNew(true);
    setSaveError(null);
  };

  const handleEdit = (link: SocialLink) => {
    setFormData(link);
    setEditingId(link.id);
    setIsNew(false);
    setSaveError(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsNew(false);
    setSaveError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.platform || !formData.url) return;
    setSaving(true);
    setSaveError(null);

    try {
      await repository.saveSocialLink({
        id: isNew ? undefined : editingId!,
        platform: formData.platform,
        label: formData.label || formData.platform,
        url: formData.url,
        icon: formData.icon || 'Globe',
        is_enabled: Boolean(formData.is_enabled),
        display_order: Number(formData.display_order) || 0,
      });
      onRefresh();
      handleCancel();
    } catch (err: any) {
      console.error('Error saving social link:', err);
      setSaveError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await repository.deleteSocialLink(deleteConfirmId);
      setDeleteConfirmId(null);
      onRefresh();
    } catch (err: any) {
      console.error('Failed to delete social link:', err);
      setDeleteError(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Share2 className="w-6 h-6 text-blue-400" />
            <span>Manage Social Links</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Configure external profiles, GitHub, LinkedIn, Twitter/X, Email, WhatsApp, and custom links.
          </p>
        </div>

        <button
          onClick={handleStartNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Social Link</span>
        </button>
      </div>

      {editingId && (
        <form onSubmit={handleSave} className="p-6 rounded-3xl bg-slate-900/90 border border-blue-500/30 backdrop-blur-xl space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-mono font-bold text-blue-400">
              {isNew ? 'Add Social Channel' : 'Edit Social Link'}
            </h3>
            <button type="button" onClick={handleCancel} className="text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Platform Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. GitHub, LinkedIn, X, WhatsApp, Email"
                value={formData.platform || ''}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value as any })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Display Label</label>
              <input
                type="text"
                placeholder="e.g. Connect on LinkedIn"
                value={formData.label || ''}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Target URL *</label>
            <input
              type="text"
              required
              placeholder="https://linkedin.com/in/username"
              value={formData.url || ''}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_enabled"
              checked={Boolean(formData.is_enabled)}
              onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
              className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0"
            />
            <label htmlFor="is_enabled" className="text-xs font-mono text-slate-300 cursor-pointer">
              Enable link on website footer and contact page
            </label>
          </div>

          {saveError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Social Link'}</span>
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {socialLinks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {socialLinks.map((link) => (
            <div
              key={link.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex items-center justify-between gap-4"
            >
              <div className="space-y-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                  <h3 className="text-sm font-bold text-white">{link.label || link.platform}</h3>
                </div>
                <p className="text-[11px] font-mono text-slate-400 truncate">{link.url}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleEdit(link)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(link.id)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 text-xs font-mono bg-slate-900/40 rounded-2xl border border-slate-800">
          No social links configured yet. Click "Add Social Link".
        </div>
      )}

      {deleteError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{deleteError}</span>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        title="Delete Social Link"
        message="Are you sure you want to delete this social link? This action cannot be undone."
        isDeleting={isDeleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setDeleteConfirmId(null);
          setDeleteError(null);
        }}
      />
    </div>
  );
};
