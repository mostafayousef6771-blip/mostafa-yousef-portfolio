import React, { useState, useRef } from 'react';
import { Award, Plus, Edit3, Trash2, Save, X, ExternalLink, Upload, Loader2, AlertCircle } from 'lucide-react';
import { Certificate } from '../../types/portfolio';
import { repository } from '../../lib/repository';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

interface AdminCertificatesPageProps {
  certificates: Certificate[];
  onRefresh: () => void;
}

export const AdminCertificatesPage: React.FC<AdminCertificatesPageProps> = ({
  certificates = [],
  onRefresh,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);

  const [formData, setFormData] = useState<Partial<Certificate>>({
    title: '',
    issuer: '',
    issue_date: '',
    expiry_date: '',
    credential_id: '',
    credential_url: '',
    image_url: '',
    pdf_url: '',
  });

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const badgeInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  const handleBadgeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError(null);
    try {
      const result: any = await repository.uploadFile(file, 'certificates');
      const url = typeof result === 'string' ? result : (result?.url || result?.publicUrl || '');
      if (!url || url === '[object Object]') {
        throw new Error('Badge image upload completed, but could not extract a valid URL.');
      }
      setFormData((prev) => ({ ...prev, image_url: url }));
    } catch (err: any) {
      setUploadError(err.message || 'Badge upload failed.');
    } finally {
      setUploadingImage(false);
      if (badgeInputRef.current) badgeInputRef.current.value = '';
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPdf(true);
    setUploadError(null);
    try {
      const result: any = await repository.uploadFile(file, 'certificates');
      const url = typeof result === 'string' ? result : (result?.url || result?.publicUrl || '');
      if (!url || url === '[object Object]') {
        throw new Error('Certificate document upload completed, but could not extract a valid URL.');
      }
      setFormData((prev) => ({ ...prev, pdf_url: url }));
    } catch (err: any) {
      setUploadError(err.message || 'PDF upload failed.');
    } finally {
      setUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  const handleStartNew = () => {
    setFormData({
      title: '',
      issuer: '',
      issue_date: new Date().toISOString().split('T')[0],
      expiry_date: '',
      credential_id: '',
      credential_url: '',
      image_url: '',
      pdf_url: '',
      display_order: certificates.length + 1,
    });
    setEditingId('new');
    setIsNew(true);
  };

  const handleEdit = (cert: Certificate) => {
    setFormData(cert);
    setEditingId(cert.id);
    setIsNew(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsNew(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.issuer) return;
    setSaving(true);
    try {
      await repository.saveCertificate({
        id: isNew ? undefined : editingId!,
        title: formData.title,
        issuer: formData.issuer,
        issue_date: formData.issue_date || '',
        expiry_date: formData.expiry_date || '',
        credential_id: formData.credential_id || '',
        credential_url: formData.credential_url || '',
        image_url: formData.image_url || '',
        pdf_url: formData.pdf_url || '',
        display_order: Number(formData.display_order) || 0,
      });
      onRefresh();
      handleCancel();
    } catch (err) {
      console.error('Error saving certificate:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await repository.deleteCertificate(deleteConfirmId);
      setDeleteConfirmId(null);
      onRefresh();
    } catch (err: any) {
      console.error('Failed to delete certificate:', err);
      setDeleteError(err.message || 'Failed to delete certificate.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-400" />
            <span>Manage Certificates</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Add or update certifications, issuer credentials, badge graphics, and PDF diplomas.
          </p>
        </div>

        <button
          onClick={handleStartNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-lg shadow-purple-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Certificate</span>
        </button>
      </div>

      {/* Editor Modal / Form */}
      {editingId && (
        <form onSubmit={handleSave} className="p-6 rounded-3xl bg-slate-900/90 border border-purple-500/30 backdrop-blur-xl space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-mono font-bold text-purple-400">
              {isNew ? 'Add Certificate' : 'Edit Certificate'}
            </h3>
            <button type="button" onClick={handleCancel} className="text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {uploadError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {uploadError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Certificate Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. AWS Certified Solutions Architect"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Issuer / Organization *</label>
              <input
                type="text"
                required
                placeholder="e.g. Amazon Web Services / Google Cloud"
                value={formData.issuer || ''}
                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Issue Date</label>
              <input
                type="text"
                placeholder="e.g. Nov 2025"
                value={formData.issue_date || ''}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Expiry Date (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Nov 2028 / Never"
                value={formData.expiry_date || ''}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Credential ID</label>
              <input
                type="text"
                placeholder="e.g. AWS-981247"
                value={formData.credential_id || ''}
                onChange={(e) => setFormData({ ...formData, credential_id: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Verification URL</label>
              <input
                type="text"
                placeholder="https://..."
                value={formData.credential_url || ''}
                onChange={(e) => setFormData({ ...formData, credential_url: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Badge Image</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.image_url || ''}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
                <input
                  type="file"
                  ref={badgeInputRef}
                  onChange={handleBadgeUpload}
                  className="hidden"
                  accept="image/*"
                />
                <button
                  type="button"
                  onClick={() => badgeInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center gap-1 shrink-0 disabled:opacity-50"
                  title="Upload Badge Image"
                >
                  {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>Upload</span>
                </button>
              </div>

              {formData.image_url && (
                <div className="mt-2 flex items-center gap-2 p-1.5 bg-slate-950/60 border border-slate-800 rounded-xl w-fit">
                  <img
                    src={formData.image_url}
                    alt="Badge preview"
                    className="w-8 h-8 rounded-lg object-cover border border-slate-700"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image_url: '' })}
                    className="text-rose-400 hover:underline text-[10px] font-mono pr-1"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Certificate PDF</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.pdf_url || ''}
                  onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                  className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
                <input
                  type="file"
                  ref={pdfInputRef}
                  onChange={handlePdfUpload}
                  className="hidden"
                  accept="application/pdf,image/*"
                />
                <button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  disabled={uploadingPdf}
                  className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center gap-1 shrink-0 disabled:opacity-50"
                  title="Upload PDF Document"
                >
                  {uploadingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>Upload</span>
                </button>
              </div>

              {formData.pdf_url && (
                <div className="mt-2 flex items-center gap-2 p-1.5 bg-slate-950/60 border border-slate-800 rounded-xl w-fit text-[11px] font-mono text-purple-300">
                  <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                  <a href={formData.pdf_url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-[140px]">
                    View Document
                  </a>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, pdf_url: '' })}
                    className="text-rose-400 hover:underline text-[10px] ml-1"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
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
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Certificate'}</span>
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-mono">
                  {cert.issuer}
                </span>
                <h3 className="text-base font-bold text-white">{cert.title}</h3>
                <p className="text-slate-400 text-xs font-mono">Issued: {cert.issue_date}</p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  {cert.credential_url && (
                    <a
                      href={cert.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-purple-300 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> Verify
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(cert)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(cert.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 text-xs font-mono bg-slate-900/40 rounded-2xl border border-slate-800">
          No certificates added yet. Click "Add Certificate" to record credentials.
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
        title="Delete Certificate"
        message="Are you sure you want to delete this certificate? This action cannot be undone."
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
