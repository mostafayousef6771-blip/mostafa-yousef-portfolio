import React, { useState, useEffect, useRef } from 'react';
import { Image, Copy, Check, Upload, Trash2, ExternalLink, FileText, Loader2, Plus, AlertCircle } from 'lucide-react';
import { MediaItem } from '../../types/portfolio';
import { repository, getErrorMessage } from '../../lib/repository';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export const AdminMediaPage: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const data = await repository.getMedia();
      setMediaList(data);
    } catch (err) {
      console.error('Error loading media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);

    // Validate size limit (max 15MB)
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMsg(`File size exceeds 15MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    try {
      await repository.uploadMediaFile(file, 'media');
      await loadMedia();
    } catch (err: any) {
      console.error('Error uploading media:', err);
      setErrorMsg(getErrorMessage(err));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    setErrorMsg(null);
    setUploading(true);
    try {
      await repository.addMedia({
        name: newUrl.split('/').pop() || 'Remote Asset',
        file_path: '',
        file_url: newUrl.trim(),
        size: 0,
        storage_bucket: 'media',
        file_type: 'image/url',
      });
      setNewUrl('');
      await loadMedia();
    } catch (err: any) {
      console.error('Error adding media URL:', err);
      setErrorMsg(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await repository.deleteMedia(deleteConfirmId);
      setDeleteConfirmId(null);
      await loadMedia();
    } catch (err: any) {
      console.error('Failed to delete media:', err);
      setDeleteError(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Image className="w-6 h-6 text-blue-400" />
            <span>Media Library</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Upload files directly to Supabase storage or add external asset URLs for project covers, badges, and PDFs.
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,application/pdf"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading Asset...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload Local File</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Add Media via URL Bar */}
      <form onSubmit={handleAddUrl} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
        <input
          type="text"
          placeholder="Or paste external image/document URL..."
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
        />
        <button
          type="submit"
          disabled={uploading || !newUrl.trim()}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center gap-1 shrink-0 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Add URL</span>
        </button>
      </form>

      {/* Gallery Grid */}
      {loading ? (
        <div className="p-12 text-center font-mono text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
          <span>Loading media assets...</span>
        </div>
      ) : mediaList.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/30 space-y-3">
          <Image className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Media Assets Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Upload files or add URLs to manage assets for projects, certificates, and resumes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {mediaList.map((item) => (
            <div
              key={item.id}
              className="group p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl hover:border-blue-500/40 transition-all shadow-lg space-y-3 flex flex-col justify-between"
            >
              <div className="h-40 rounded-xl bg-slate-950 overflow-hidden relative border border-slate-800 flex items-center justify-center">
                {item.file_type?.startsWith('image/') || item.file_url.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i) ? (
                  <img
                    src={item.file_url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <FileText className="w-10 h-10 text-blue-400" />
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800">{item.name}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-200">
                  <span className="truncate flex-1 font-mono">{item.name}</span>
                  <span className="text-[9px] font-mono text-slate-500 ml-2">{formatFileSize(item.size)}</span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                  <span className="text-[10px] font-mono text-slate-500 truncate flex-1">{item.file_url}</span>

                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Open Link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleCopy(item.file_url)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Copy URL"
                    >
                      {copiedUrl === item.file_url ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
        title="Delete Media Asset"
        message="Are you sure you want to delete this media file? This action cannot be undone."
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

