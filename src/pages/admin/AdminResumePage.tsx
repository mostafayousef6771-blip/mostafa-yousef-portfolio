import React, { useState, useEffect, useRef } from 'react';
import { FileText, Save, CheckCircle2, Download, ExternalLink, Calendar, Upload, Loader2 } from 'lucide-react';
import { Resume } from '../../types/portfolio';
import { repository, getErrorMessage } from '../../lib/repository';

interface AdminResumePageProps {
  resume: Resume | null;
  onRefresh: () => void;
}

export const AdminResumePage: React.FC<AdminResumePageProps> = ({ resume = null, onRefresh }) => {
  const [formData, setFormData] = useState<Partial<Resume>>({
    title: 'Curriculum Vitae',
    file_url: '',
    file_size: '',
    is_active: true,
  });

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (resume) setFormData(resume);
  }, [resume]);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg(null);
    try {
      const url = await repository.uploadFile(file, 'resume');
      const sizeFormatted = (file.size / (1024 * 1024)).toFixed(1) + ' MB / PDF';
      setFormData((prev) => ({
        ...prev,
        file_url: url,
        file_size: sizeFormatted,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
      }));
    } catch (err: any) {
      console.error('Resume upload error:', err);
      setErrorMsg(getErrorMessage(err));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setErrorMsg(null);
    try {
      const updatedResume = await repository.saveResume(formData);
      setFormData(updatedResume);
      setSaved(true);
      onRefresh();
      setTimeout(() => setSaved(false), 4000);
    } catch (err: any) {
      console.error('Error saving resume:', err);
      setErrorMsg(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-400" />
            <span>Manage Resume / CV</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Upload, update, or replace your official curriculum vitae document URL.
          </p>
        </div>

        {saved && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Resume Updated!</span>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
          <span>⚠️ {errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Document Title</label>
              <input
                type="text"
                placeholder="e.g. Mostafa Yousef - Senior Software Engineer CV"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">File Size Display (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 1.2 MB / PDF"
                value={formData.file_size || ''}
                onChange={(e) => setFormData({ ...formData, file_size: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">CV PDF File *</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                placeholder="https://... / Supabase storage bucket PDF URL"
                value={formData.file_url || ''}
                onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleResumeUpload}
                className="hidden"
                accept="application/pdf,image/*"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                title="Upload CV PDF file"
              >
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" /> : <Upload className="w-3.5 h-3.5" />}
                <span>Upload PDF</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={Boolean(formData.is_active)}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0"
            />
            <label htmlFor="is_active" className="text-xs font-mono text-slate-300 cursor-pointer">
              Active CV (Enabled on public website)
            </label>
          </div>
        </div>

        {formData.file_url && (
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-purple-400" />
              <div>
                <p className="font-bold text-white">{formData.title || 'Curriculum Vitae'}</p>
                <p className="text-[11px] text-slate-500 font-mono">{formData.file_url}</p>
              </div>
            </div>

            <a
              href={formData.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-blue-400 font-mono flex items-center gap-1 hover:text-white"
            >
              <span>Preview</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Resume Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
