import React, { useState } from 'react';
import { Star, Plus, Edit3, Trash2, Save, X, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Review } from '../../types/portfolio';
import { repository, getErrorMessage } from '../../lib/repository';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

interface AdminReviewsPageProps {
  reviews: Review[];
  onRefresh: () => void;
}

export const AdminReviewsPage: React.FC<AdminReviewsPageProps> = ({ reviews = [], onRefresh }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);

  const [formData, setFormData] = useState<Partial<Review>>({
    client_name: '',
    company: '',
    position: '',
    client_photo: '',
    review_text: '',
    rating: 5,
    date: new Date().toISOString().split('T')[0],
    is_published: true,
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleStartNew = () => {
    setFormData({
      client_name: '',
      company: '',
      position: '',
      client_photo: '',
      review_text: '',
      rating: 5,
      date: new Date().toISOString().split('T')[0],
      is_published: true,
      display_order: reviews.length + 1,
    });
    setEditingId('new');
    setIsNew(true);
    setSaveError(null);
  };

  const handleEdit = (rev: Review) => {
    setFormData(rev);
    setEditingId(rev.id);
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
    if (!formData.client_name || !formData.review_text) return;
    setSaving(true);
    setSaveError(null);

    try {
      await repository.saveReview({
        id: isNew ? undefined : editingId!,
        client_name: formData.client_name,
        company: formData.company || '',
        position: formData.position || '',
        client_photo: formData.client_photo || '',
        review_text: formData.review_text,
        rating: Number(formData.rating) || 5,
        date: formData.date || '',
        is_published: Boolean(formData.is_published),
        display_order: Number(formData.display_order) || 0,
      });
      onRefresh();
      handleCancel();
    } catch (err: any) {
      console.error('Error saving review:', err);
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
      await repository.deleteReview(deleteConfirmId);
      setDeleteConfirmId(null);
      onRefresh();
    } catch (err: any) {
      console.error('Failed to delete review:', err);
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
            <Star className="w-6 h-6 text-amber-400" />
            <span>Manage Client Reviews</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Add client testimonials, 5-star ratings, company designations, and client photos.
          </p>
        </div>

        <button
          onClick={handleStartNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Review</span>
        </button>
      </div>

      {editingId && (
        <form onSubmit={handleSave} className="p-6 rounded-3xl bg-slate-900/90 border border-amber-500/30 backdrop-blur-xl space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-mono font-bold text-amber-400">
              {isNew ? 'Add Client Review' : 'Edit Review'}
            </h3>
            <button type="button" onClick={handleCancel} className="text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Client Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. David Miller"
                value={formData.client_name || ''}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Position / Role</label>
              <input
                type="text"
                placeholder="e.g. CTO / VP of Engineering"
                value={formData.position || ''}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Company</label>
              <input
                type="text"
                placeholder="e.g. FinTech Innovations Ltd"
                value={formData.company || ''}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Review Text *</label>
            <textarea
              rows={4}
              required
              placeholder="The client's endorsement or project review narrative..."
              value={formData.review_text || ''}
              onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Rating (1 to 5 Stars)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.rating || 5}
                onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Client Photo URL</label>
              <input
                type="text"
                placeholder="https://..."
                value={formData.client_photo || ''}
                onChange={(e) => setFormData({ ...formData, client_photo: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Date</label>
              <input
                type="text"
                placeholder="e.g. Oct 2025"
                value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_published"
              checked={Boolean(formData.is_published)}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="rounded border-slate-800 bg-slate-950 text-amber-600 focus:ring-0"
            />
            <label htmlFor="is_published" className="text-xs font-mono text-slate-300 cursor-pointer">
              Publish on public website
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
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Review'}</span>
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-amber-400' : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      rev.is_published
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {rev.is_published ? 'Published' : 'Hidden'}
                  </span>
                </div>

                <p className="text-slate-300 text-xs italic">"{rev.review_text}"</p>
                <p className="text-xs font-bold text-white">
                  {rev.client_name} <span className="font-normal text-slate-400">({rev.company})</span>
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleEdit(rev)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(rev.id)}
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
          No reviews added yet. Click "Add Review" to add testimonials.
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
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
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
