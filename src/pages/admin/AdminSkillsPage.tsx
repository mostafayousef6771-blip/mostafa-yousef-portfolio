import React, { useState } from 'react';
import { Code2, Plus, Trash2, Edit3, Save, X, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Skill } from '../../types/portfolio';
import { repository } from '../../lib/repository';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

interface AdminSkillsPageProps {
  skills: Skill[];
  onRefresh: () => void;
}

export const AdminSkillsPage: React.FC<AdminSkillsPageProps> = ({ skills = [], onRefresh }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);

  const [formData, setFormData] = useState<Partial<Skill>>({
    name: '',
    category: 'Frontend',
    level: 80,
    icon: 'Code',
    featured: false,
    display_order: (skills?.length || 0) + 1,
  });

  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleStartNew = () => {
    setFormData({
      name: '',
      category: 'Frontend',
      level: 80,
      icon: 'Code',
      featured: false,
      display_order: (skills?.length || 0) + 1,
    });
    setEditingId('new');
    setIsNew(true);
  };

  const handleEdit = (skill: Skill) => {
    setFormData(skill);
    setEditingId(skill.id);
    setIsNew(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsNew(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    setSaving(true);
    try {
      await repository.saveSkill({
        id: isNew ? undefined : editingId!,
        name: formData.name,
        category: formData.category || 'General',
        level: Number(formData.level) || 80,
        icon: formData.icon || 'Code',
        featured: Boolean(formData.featured),
        display_order: Number(formData.display_order) || 0,
      });
      onRefresh();
      handleCancel();
    } catch (err) {
      console.error('Error saving skill:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await repository.deleteSkill(deleteConfirmId);
      setDeleteConfirmId(null);
      onRefresh();
    } catch (err: any) {
      console.error('Failed to delete skill:', err);
      setDeleteError(err.message || 'Failed to delete skill.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Code2 className="w-6 h-6 text-blue-400" />
            <span>Manage Skills</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Add, update, or remove technical skills, categories, and proficiency percentages.
          </p>
        </div>

        <button
          onClick={handleStartNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Skill</span>
        </button>
      </div>

      {/* Editor Modal / Form */}
      {editingId && (
        <form onSubmit={handleSave} className="p-6 rounded-3xl bg-slate-900/90 border border-blue-500/30 backdrop-blur-xl space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-mono font-bold text-blue-400">
              {isNew ? 'Add New Skill' : 'Edit Skill'}
            </h3>
            <button type="button" onClick={handleCancel} className="text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Skill Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. React.js / TypeScript / PostgreSQL"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Category</label>
              <input
                type="text"
                placeholder="e.g. Frontend, Backend, Database, DevOps, Tools"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Proficiency % (1-100)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.level || 80}
                onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs text-slate-300 font-mono cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(formData.featured)}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0"
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
              <span>{saving ? 'Saving...' : 'Save Skill'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Skills Table / List */}
      {skills.length > 0 ? (
        <div className="rounded-2xl border border-slate-800/80 overflow-hidden bg-slate-900/60 backdrop-blur-xl shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-4">Skill Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Proficiency</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {skills.map((skill) => (
                <tr key={skill.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-blue-400" />
                    <span>{skill.name}</span>
                  </td>
                  <td className="p-4 font-mono text-slate-400">{skill.category}</td>
                  <td className="p-4 font-mono">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                      <span className="text-slate-400">{skill.level}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {skill.featured ? (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px]">
                        Featured
                      </span>
                    ) : (
                      <span className="text-slate-500 font-mono text-[10px]">Standard</span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(skill)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400"
                      title="Edit Skill"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(skill.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400"
                      title="Delete Skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 text-xs font-mono bg-slate-900/40 rounded-2xl border border-slate-800">
          No skills added yet. Click "Add Skill" to create your technical matrix.
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
        title="Delete Skill"
        message="Are you sure you want to delete this skill? This action cannot be undone."
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
