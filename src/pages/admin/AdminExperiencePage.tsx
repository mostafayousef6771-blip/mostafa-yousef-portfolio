import React, { useState } from 'react';
import { Briefcase, Plus, Edit3, Trash2, Save, X, AlertCircle } from 'lucide-react';
import { Experience } from '../../types/portfolio';
import { repository } from '../../lib/repository';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

interface AdminExperiencePageProps {
  experiences: Experience[];
  onRefresh: () => void;
}

export const AdminExperiencePage: React.FC<AdminExperiencePageProps> = ({
  experiences = [],
  onRefresh,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);

  const [formData, setFormData] = useState<Partial<Experience>>({
    company: '',
    position: '',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: [],
    skills_used: [],
  });

  const [descInput, setDescInput] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleStartNew = () => {
    setFormData({
      company: '',
      position: '',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: [],
      skills_used: [],
      display_order: experiences.length + 1,
    });
    setDescInput('');
    setSkillsInput('');
    setEditingId('new');
    setIsNew(true);
  };

  const handleEdit = (exp: Experience) => {
    setFormData(exp);
    setDescInput((exp.description || []).join('\n'));
    setSkillsInput((exp.skills_used || []).join(', '));
    setEditingId(exp.id);
    setIsNew(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsNew(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.position) return;
    setSaving(true);

    const parsedDesc = descInput
      .split('\n')
      .map((d) => d.trim())
      .filter(Boolean);

    const parsedSkills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await repository.saveExperience({
        id: isNew ? undefined : editingId!,
        company: formData.company,
        position: formData.position,
        location: formData.location || '',
        start_date: formData.start_date || '',
        end_date: formData.end_date || '',
        is_current: Boolean(formData.is_current),
        description: parsedDesc,
        skills_used: parsedSkills,
        display_order: Number(formData.display_order) || 0,
      });
      onRefresh();
      handleCancel();
    } catch (err) {
      console.error('Error saving experience:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await repository.deleteExperience(deleteConfirmId);
      setDeleteConfirmId(null);
      onRefresh();
    } catch (err: any) {
      console.error('Failed to delete experience:', err);
      setDeleteError(err.message || 'Failed to delete experience record.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-400" />
            <span>Manage Experience</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Add employment history, company positions, achievements, and key skills used.
          </p>
        </div>

        <button
          onClick={handleStartNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Experience</span>
        </button>
      </div>

      {editingId && (
        <form onSubmit={handleSave} className="p-6 rounded-3xl bg-slate-900/90 border border-blue-500/30 backdrop-blur-xl space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-mono font-bold text-blue-400">
              {isNew ? 'Add Experience Entry' : 'Edit Experience Entry'}
            </h3>
            <button type="button" onClick={handleCancel} className="text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Position / Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Lead Software Engineer"
                value={formData.position || ''}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Company Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Tech Solutions"
                value={formData.company || ''}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Location</label>
              <input
                type="text"
                placeholder="e.g. London / Remote"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Start Date</label>
              <input
                type="text"
                placeholder="e.g. Jan 2022"
                value={formData.start_date || ''}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">End Date</label>
              <input
                type="text"
                placeholder="e.g. Present / Dec 2024"
                disabled={Boolean(formData.is_current)}
                value={formData.is_current ? 'Present' : formData.end_date || ''}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_current"
              checked={Boolean(formData.is_current)}
              onChange={(e) => setFormData({ ...formData, is_current: e.target.checked })}
              className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0"
            />
            <label htmlFor="is_current" className="text-xs font-mono text-slate-300 cursor-pointer">
              Current Role
            </label>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Bullet Points (1 line per point)</label>
            <textarea
              rows={4}
              placeholder="Architected microservices architecture handling 1M+ requests daily&#10;Led team of 6 engineers"
              value={descInput}
              onChange={(e) => setDescInput(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Technologies Used (Comma-separated)</label>
            <input
              type="text"
              placeholder="TypeScript, Docker, AWS, PostgreSQL, Redis"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
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
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Experience'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Experience List */}
      {experiences.length > 0 ? (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex flex-col sm:flex-row items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{exp.position}</h3>
                  <span className="text-xs font-semibold text-blue-400">@ {exp.company}</span>
                </div>
                <p className="text-xs font-mono text-slate-400">
                  {exp.start_date} – {exp.is_current ? 'Present' : exp.end_date} {exp.location && `• ${exp.location}`}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleEdit(exp)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(exp.id)}
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
          No experience records added yet. Click "Add Experience" to record your history.
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
        title="Delete Experience Entry"
        message="Are you sure you want to delete this experience record? This action cannot be undone."
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
