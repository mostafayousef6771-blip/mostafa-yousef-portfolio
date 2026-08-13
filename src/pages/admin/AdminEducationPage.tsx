import React, { useState } from 'react';
import { GraduationCap, Plus, Edit3, Trash2, Save, X, AlertCircle } from 'lucide-react';
import { Education } from '../../types/portfolio';
import { repository } from '../../lib/repository';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

interface AdminEducationPageProps {
  educations: Education[];
  onRefresh: () => void;
}

export const AdminEducationPage: React.FC<AdminEducationPageProps> = ({
  educations = [],
  onRefresh,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);

  const [formData, setFormData] = useState<Partial<Education>>({
    institution: '',
    degree: '',
    field_of_study: '',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    grade: '',
    description: '',
  });

  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleStartNew = () => {
    setFormData({
      institution: '',
      degree: '',
      field_of_study: '',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      grade: '',
      description: '',
      display_order: educations.length + 1,
    });
    setEditingId('new');
    setIsNew(true);
  };

  const handleEdit = (edu: Education) => {
    setFormData(edu);
    setEditingId(edu.id);
    setIsNew(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsNew(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.institution || !formData.degree) return;
    setSaving(true);

    try {
      await repository.saveEducation({
        id: isNew ? undefined : editingId!,
        institution: formData.institution,
        degree: formData.degree,
        field_of_study: formData.field_of_study || '',
        location: formData.location || '',
        start_date: formData.start_date || '',
        end_date: formData.end_date || '',
        is_current: Boolean(formData.is_current),
        grade: formData.grade || '',
        description: formData.description || '',
        display_order: Number(formData.display_order) || 0,
      });
      onRefresh();
      handleCancel();
    } catch (err) {
      console.error('Error saving education:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await repository.deleteEducation(deleteConfirmId);
      setDeleteConfirmId(null);
      onRefresh();
    } catch (err: any) {
      console.error('Failed to delete education:', err);
      setDeleteError(err.message || 'Failed to delete education entry.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-purple-400" />
            <span>Manage Education</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Record university degrees, diplomas, academic fields, and achievements.
          </p>
        </div>

        <button
          onClick={handleStartNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Education</span>
        </button>
      </div>

      {editingId && (
        <form onSubmit={handleSave} className="p-6 rounded-3xl bg-slate-900/90 border border-purple-500/30 backdrop-blur-xl space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-mono font-bold text-purple-400">
              {isNew ? 'Add Education Entry' : 'Edit Education Entry'}
            </h3>
            <button type="button" onClick={handleCancel} className="text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Institution Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. University of Computer Science"
                value={formData.institution || ''}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Degree Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Bachelor of Science (B.Sc.)"
                value={formData.degree || ''}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Field of Study</label>
              <input
                type="text"
                placeholder="e.g. Software Engineering"
                value={formData.field_of_study || ''}
                onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Grade / GPA / Honor</label>
              <input
                type="text"
                placeholder="e.g. First Class Honors / 3.8 GPA"
                value={formData.grade || ''}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Location</label>
              <input
                type="text"
                placeholder="e.g. London, UK"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Start Date</label>
              <input
                type="text"
                placeholder="e.g. Sep 2018"
                value={formData.start_date || ''}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">End Date</label>
              <input
                type="text"
                placeholder="e.g. Jun 2022"
                value={formData.end_date || ''}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

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
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Education'}</span>
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {educations.length > 0 ? (
        <div className="space-y-4">
          {educations.map((edu) => (
            <div
              key={edu.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex flex-col sm:flex-row items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">{edu.degree}</h3>
                <p className="text-xs font-semibold text-purple-400">{edu.institution}</p>
                <p className="text-xs font-mono text-slate-400">
                  {edu.start_date} – {edu.end_date} {edu.grade && `• Grade: ${edu.grade}`}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleEdit(edu)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(edu.id)}
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
          No education history added yet. Click "Add Education" to record academic qualifications.
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
        title="Delete Education Entry"
        message="Are you sure you want to delete this education entry? This action cannot be undone."
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
