import React, { useState, useEffect } from 'react';
import { Info, Save, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { About } from '../../types/portfolio';
import { repository } from '../../lib/repository';

interface AdminAboutPageProps {
  about: About | null;
  onRefresh: () => void;
}

export const AdminAboutPage: React.FC<AdminAboutPageProps> = ({ about = null, onRefresh }) => {
  const [formData, setFormData] = useState<Partial<About>>({
    title: '',
    content: '',
    story: '',
    highlights: [],
  });

  const [newHighlight, setNewHighlight] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (about) {
      setFormData({
        title: about.title || '',
        content: about.content || '',
        story: about.story || '',
        highlights: about.highlights || [],
      });
    }
  }, [about]);

  const handleAddHighlight = () => {
    if (!newHighlight.trim()) return;
    const current = formData.highlights || [];
    setFormData({ ...formData, highlights: [...current, newHighlight.trim()] });
    setNewHighlight('');
  };

  const handleRemoveHighlight = (index: number) => {
    const current = formData.highlights || [];
    setFormData({ ...formData, highlights: current.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await repository.updateAbout(formData);
      setSaved(true);
      onRefresh();
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      console.error('Error saving about page:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Info className="w-6 h-6 text-blue-400" />
            <span>About Page Content</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Manage your background narrative, engineering story, and key highlight bullet points.
          </p>
        </div>

        {saved && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>About updated!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-5">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">Page Subtitle / Heading</label>
            <input
              type="text"
              placeholder="e.g. Crafting resilient web infrastructure and modern digital experiences"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">Full Biography / Story</label>
            <textarea
              rows={6}
              placeholder="Detailed description of your software journey, technical background, and achievements..."
              value={formData.content || ''}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">Engineering Philosophy</label>
            <textarea
              rows={4}
              placeholder="Your principles regarding code quality, design systems, architectural scalability..."
              value={formData.story || ''}
              onChange={(e) => setFormData({ ...formData, story: e.target.value })}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Highlights List */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-mono text-slate-400">Key Highlights</label>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 5+ Years Full-Stack Experience"
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddHighlight();
                  }
                }}
                className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddHighlight}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-blue-300 flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {formData.highlights && formData.highlights.length > 0 && (
              <ul className="space-y-2 pt-2">
                {formData.highlights.map((item, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs text-slate-200"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHighlight(idx)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save About Page'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
