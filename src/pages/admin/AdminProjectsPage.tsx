import React, { useState, useRef } from 'react';
import { FolderGit2, Plus, Edit3, Trash2, Eye, EyeOff, Save, X, ExternalLink, Github, Sparkles, Upload, Loader2, AlertCircle } from 'lucide-react';
import { Project } from '../../types/portfolio';
import { repository, getErrorMessage } from '../../lib/repository';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

interface AdminProjectsPageProps {
  projects: Project[];
  onRefresh: () => void;
}

export const AdminProjectsPage: React.FC<AdminProjectsPageProps> = ({ projects = [], onRefresh }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);

  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    slug: '',
    summary: '',
    content: '',
    category: 'Web',
    tags: [],
    cover_image: '',
    gallery: [],
    demo_url: '',
    github_url: '',
    featured: false,
    published: true,
  });

  const [tagsInput, setTagsInput] = useState('');
  const [galleryInput, setGalleryInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    setUploadError(null);
    try {
      const url = await repository.uploadFile(file, 'projects');
      setFormData((prev) => ({ ...prev, cover_image: url }));
    } catch (err: any) {
      console.error('Cover image upload error:', err);
      setUploadError(getErrorMessage(err));
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    setUploadError(null);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await repository.uploadFile(file, 'projects');
        if (url && url !== '[object Object]') {
          uploadedUrls.push(url);
        }
      }

      setGalleryInput((prev) => {
        const existing = prev ? prev.split('\n').map((s) => s.trim()).filter(Boolean) : [];
        return [...existing, ...uploadedUrls].join('\n');
      });
    } catch (err: any) {
      console.error('Gallery upload error:', err);
      setUploadError(getErrorMessage(err));
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleStartNew = () => {
    setFormData({
      title: '',
      slug: '',
      summary: '',
      content: '',
      category: 'Web',
      tags: [],
      cover_image: '',
      gallery: [],
      demo_url: '',
      github_url: '',
      featured: false,
      published: true,
      display_order: projects.length + 1,
    });
    setTagsInput('');
    setGalleryInput('');
    setEditingId('new');
    setIsNew(true);
    setSaveError(null);
  };

  const handleEdit = (project: Project) => {
    setFormData(project);
    setTagsInput((project.tags || []).join(', '));
    setGalleryInput((project.gallery || []).join('\n'));
    setEditingId(project.id);
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
    if (!formData.title) return;
    setSaving(true);
    setSaveError(null);

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const parsedGallery = galleryInput
      .split('\n')
      .map((g) => g.trim())
      .filter(Boolean);

    try {
      await repository.saveProject({
        id: isNew ? undefined : editingId!,
        title: formData.title,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        summary: formData.summary || '',
        content: formData.content || '',
        category: formData.category || 'Web',
        tags: parsedTags,
        cover_image: formData.cover_image || '',
        gallery: parsedGallery,
        demo_url: formData.demo_url || '',
        github_url: formData.github_url || '',
        featured: Boolean(formData.featured),
        published: Boolean(formData.published),
        display_order: Number(formData.display_order) || 0,
      });

      onRefresh();
      handleCancel();
    } catch (err: any) {
      console.error('Error saving project:', err);
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
      await repository.deleteProject(deleteConfirmId);
      setDeleteConfirmId(null);
      onRefresh();
    } catch (err: any) {
      console.error('Failed to delete project:', err);
      setDeleteError(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const togglePublished = async (project: Project) => {
    await repository.saveProject({
      ...project,
      published: !project.published,
    });
    onRefresh();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-blue-400" />
            <span>Manage Projects</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Publish or unpublish projects, upload cover photos, gallery images, demo links, and repositories.
          </p>
        </div>

        <button
          onClick={handleStartNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Project</span>
        </button>
      </div>

      {/* Editor Modal / Drawer */}
      {editingId && (
        <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl bg-slate-900/95 border border-blue-500/40 backdrop-blur-2xl space-y-5 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-mono font-bold text-blue-400">
              {isNew ? 'Publish New Project' : 'Edit Project Details'}
            </h3>
            <button type="button" onClick={handleCancel} className="text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {saveError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{saveError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Project Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Distributed Analytics Engine"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">URL Slug</label>
              <input
                type="text"
                placeholder="analytics-engine (auto-generated if empty)"
                value={formData.slug || ''}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Category</label>
              <input
                type="text"
                placeholder="Web, Mobile, AI/ML, Cloud Systems"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Tags (Comma-separated)</label>
              <input
                type="text"
                placeholder="React, TypeScript, Tailwind, Node.js"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Project Summary / Overview</label>
            <textarea
              rows={2}
              placeholder="High-level description shown on cards and search results..."
              value={formData.summary || ''}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Detailed Case Study / Content</label>
            <textarea
              rows={6}
              placeholder="Full architectural deep dive, features, challenges solved, system design notes..."
              value={formData.content || ''}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {uploadError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
              {uploadError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Cover Image</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.cover_image || ''}
                  onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                  className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
                <input
                  type="file"
                  ref={coverInputRef}
                  onChange={handleCoverUpload}
                  className="hidden"
                  accept="image/*"
                />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                  title="Upload cover image file"
                >
                  {uploadingCover ? <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>Upload</span>
                </button>
              </div>

              {formData.cover_image && (
                <div className="mt-2.5 flex items-center gap-3 p-2 bg-slate-950/60 border border-slate-800 rounded-2xl w-fit">
                  <img
                    src={formData.cover_image}
                    alt="Cover preview"
                    className="w-16 h-12 rounded-xl object-cover border border-slate-700"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="text-[11px]">
                    <p className="font-mono text-slate-300 font-bold">Cover Preview</p>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, cover_image: '' })}
                      className="text-rose-400 hover:underline text-[10px] font-mono"
                    >
                      Remove image
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Live Demo URL</label>
              <input
                type="text"
                placeholder="https://my-demo-app.com"
                value={formData.demo_url || ''}
                onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">GitHub Repository URL</label>
              <input
                type="text"
                placeholder="https://github.com/..."
                value={formData.github_url || ''}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-mono text-slate-400">Gallery Image URLs (1 per line)</label>
                <input
                  type="file"
                  ref={galleryInputRef}
                  onChange={handleGalleryUpload}
                  className="hidden"
                  accept="image/*"
                  multiple
                />
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={uploadingGallery}
                  className="text-[11px] font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 disabled:opacity-50"
                >
                  {uploadingGallery ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                  <span>+ Upload Gallery Files</span>
                </button>
              </div>
              <textarea
                rows={3}
                placeholder="https://img1.png&#10;https://img2.png"
                value={galleryInput}
                onChange={(e) => setGalleryInput(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 resize-none font-mono"
              />

              {galleryInput.split('\n').filter(Boolean).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {galleryInput.split('\n').filter(Boolean).map((imgUrl, idx) => (
                    <div key={idx} className="relative group w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden">
                      <img
                        src={imgUrl.trim()}
                        alt={`Gallery ${idx}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const urls = galleryInput.split('\n').filter(Boolean);
                          urls.splice(idx, 1);
                          setGalleryInput(urls.join('\n'));
                        }}
                        className="absolute inset-0 bg-slate-950/80 text-rose-400 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs text-slate-300 font-mono cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(formData.published)}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0"
              />
              <span>Published (Visible to public)</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-300 font-mono cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(formData.featured)}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="rounded border-slate-800 bg-slate-950 text-purple-600 focus:ring-0"
              />
              <span>Feature on Homepage</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Project'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Projects List */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className={`p-6 rounded-2xl border backdrop-blur-xl transition-all shadow-xl flex flex-col justify-between ${
                proj.published
                  ? 'bg-slate-900/60 border-slate-800/80'
                  : 'bg-slate-950/40 border-slate-800/50 opacity-75'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-blue-400">
                    {proj.category}
                  </span>

                  <div className="flex items-center gap-2">
                    {proj.featured && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold">
                        Featured
                      </span>
                    )}

                    <button
                      onClick={() => togglePublished(proj)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition-colors flex items-center gap-1 ${
                        proj.published
                          ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                      }`}
                    >
                      {proj.published ? (
                        <>
                          <Eye className="w-3 h-3" /> Published
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" /> Draft / Hidden
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white">{proj.title}</h3>
                <p className="text-slate-400 text-xs line-clamp-2">{proj.summary || 'No summary entered.'}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">slug: {proj.slug}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(proj)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400"
                    title="Edit Project"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(proj.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 text-xs font-mono bg-slate-900/40 rounded-2xl border border-slate-800">
          No projects added yet. Click "Add Project" to publish your first case study.
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
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
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
