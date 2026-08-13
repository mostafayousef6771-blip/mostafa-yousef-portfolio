import React, { useState } from 'react';
import { Inbox, Mail, Trash2, CheckCircle2, Circle, Calendar, User, Search, AlertCircle } from 'lucide-react';
import { ContactMessage } from '../../types/portfolio';
import { repository } from '../../lib/repository';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

interface AdminMessagesPageProps {
  messages: ContactMessage[];
  onRefresh: () => void;
}

export const AdminMessagesPage: React.FC<AdminMessagesPageProps> = ({ messages = [], onRefresh }) => {
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const safeMessages = Array.isArray(messages) ? messages : [];

  const filteredMessages = safeMessages.filter(
    (m) =>
      (m.sender_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.sender_email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.message || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (!msg.is_read) {
      await repository.markMessageRead(msg.id);
      onRefresh();
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await repository.deleteMessage(deleteConfirmId);
      if (selectedMessage?.id === deleteConfirmId) {
        setSelectedMessage(null);
      }
      setDeleteConfirmId(null);
      onRefresh();
    } catch (err: any) {
      console.error('Failed to delete message:', err);
      setDeleteError(err.message || 'Failed to delete message.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Inbox className="w-6 h-6 text-amber-400" />
            <span>Contact Messages Inbox</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Read and review direct inquiries submitted by visitors from the public website contact form.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
          Total Messages: {messages.length}
        </span>
      </div>

      {messages.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Messages Master List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search inbox..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                    selectedMessage?.id === msg.id
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : msg.is_read
                      ? 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/40'
                      : 'bg-slate-900 border-amber-500/30 font-semibold'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {!msg.is_read ? (
                        <Circle className="w-2.5 h-2.5 fill-amber-400 text-amber-400 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      )}
                      <span className="text-xs font-bold text-white truncate max-w-[140px]">
                        {msg.sender_name}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-medium truncate">{msg.subject || 'No Subject'}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{msg.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Message Detail Pane */}
          <div className="lg:col-span-7">
            {selectedMessage ? (
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-2xl space-y-6">
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-white">{selectedMessage.subject || 'Inquiry'}</h2>
                    <p className="text-xs font-mono text-slate-400 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      <span>{selectedMessage.sender_name}</span>
                      <span>({selectedMessage.sender_email})</span>
                    </p>
                    <p className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5 pt-1">
                      <Calendar className="w-3 h-3 text-slate-600" />
                      <span>{new Date(selectedMessage.created_at).toLocaleString()}</span>
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(selectedMessage.id);
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition-colors"
                    title="Delete Message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 min-h-[200px]">
                  {selectedMessage.message}
                </div>

                <div className="flex justify-end">
                  <a
                    href={`mailto:${selectedMessage.sender_email}?subject=Re: ${encodeURIComponent(
                      selectedMessage.subject || 'Your Portfolio Inquiry'
                    )}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-lg shadow-amber-500/20 transition-all"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Reply via Email</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 text-xs font-mono bg-slate-900/40 rounded-3xl border border-slate-800 flex flex-col items-center justify-center min-h-[300px]">
                <Inbox className="w-8 h-8 text-slate-700 mb-2" />
                <span>Select a message from the list to view details.</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 text-xs font-mono bg-slate-900/40 rounded-2xl border border-slate-800">
          No contact form messages in your inbox yet.
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
        title="Delete Contact Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
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
