import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  Calendar,
  FileText,
  Search,
  X,
  Download,
  Maximize2,
  ArrowUpRight,
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Certificate } from '../../types/portfolio';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageTransition } from '../../components/ui/PageTransition';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../../components/ui/ScrollReveal';

interface CertificatesPageProps {
  certificates: Certificate[];
  onNavigate: (path: string) => void;
}

export const CertificatesPage: React.FC<CertificatesPageProps> = ({ certificates, onNavigate }) => {
  const [selectedIssuer, setSelectedIssuer] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeImageModal, setActiveImageModal] = useState<{ url: string; title: string } | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const uniqueIssuers = Array.from(
    new Set(certificates.map((c) => c.issuer).filter((i): i is string => Boolean(i && i.trim())))
  );
  const issuers = ['All', ...uniqueIssuers];

  const filteredCerts = certificates.filter((cert) => {
    const matchesIssuer = selectedIssuer === 'All' || cert.issuer === selectedIssuer;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      cert.title.toLowerCase().includes(query) ||
      cert.issuer.toLowerCase().includes(query) ||
      (cert.credential_id && cert.credential_id.toLowerCase().includes(query));

    return matchesIssuer && matchesSearch;
  });

  useEffect(() => {
    if (!activeImageModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveImageModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeImageModal]);

  return (
    <PageTransition className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-12 space-y-12">
      {/* Editorial Header */}
      <div>
        <span className="text-xs font-mono text-[#C69A5B] tracking-widest uppercase block mb-3">
          VERIFIED CREDENTIALS
        </span>
        <h1 className="font-serif text-4xl sm:text-7xl font-light text-[#F1EEE7] mb-4 break-words">
          Certifications
        </h1>
        <p className="text-[#9B9991] text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
          Accredited qualifications, technical diplomas, and system certifications.
        </p>
      </div>

      {certificates.length > 0 ? (
        <div className="space-y-10">
          {/* Controls: Search + Issuer Filter Tabs */}
          <ScrollReveal>
            <div className="p-4 bg-[#131310] border border-[#23231F] rounded-sm flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Search Box */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-[#9B9991] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter certificate or issuer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0B0B09] border border-[#23231F] rounded-sm pl-9 pr-8 py-2 text-xs text-[#F1EEE7] placeholder:text-[#9B9991]/60 focus:outline-none focus:border-[#C69A5B] transition-all font-mono"
                  aria-label="Search certificates"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9B9991] hover:text-[#F1EEE7] p-0.5"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Issuer Filter Tabs */}
              {issuers.length > 1 && (
                <div
                  className="flex flex-wrap items-center gap-2 w-full md:w-auto"
                  role="tablist"
                  aria-label="Certificate issuers"
                >
                  {issuers.map((issuer) => {
                    const isActive = selectedIssuer === issuer;
                    return (
                      <button
                        key={issuer}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setSelectedIssuer(issuer)}
                        className={`relative px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors duration-200 ${
                          isActive
                            ? 'text-[#0B0B09] font-bold bg-[#F1EEE7]'
                            : 'text-[#9B9991] hover:text-[#F1EEE7] bg-[#0B0B09] border border-[#23231F]'
                        }`}
                      >
                        {issuer}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Certificate Cards Grid */}
          {filteredCerts.length > 0 ? (
            <AnimatePresence mode="popLayout">
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredCerts.map((cert) => (
                  <StaggerItem key={cert.id}>
                    <div className="p-8 bg-[#131310] border border-[#23231F] hover:border-[#C69A5B]/50 transition-all duration-300 rounded-sm flex flex-col justify-between h-full group">
                      <div className="space-y-6">
                        <div className="flex items-start justify-between gap-4">
                          {cert.image_url ? (
                            <div
                              onClick={() => setActiveImageModal({ url: cert.image_url!, title: cert.title })}
                              className="relative w-20 h-20 bg-[#0B0B09] border border-[#23231F] overflow-hidden shrink-0 cursor-pointer group/img"
                              title="Click to expand"
                            >
                              <img
                                src={cert.image_url}
                                alt={cert.title}
                                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500 opacity-90 group-hover/img:opacity-100"
                              />
                              <div className="absolute inset-0 bg-[#0B0B09]/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-[#F1EEE7]">
                                <Maximize2 className="w-4 h-4" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-[#0B0B09] border border-[#23231F] text-[#C69A5B] font-mono font-bold flex items-center justify-center shrink-0">
                              //
                            </div>
                          )}

                          <span className="px-3 py-1 bg-[#0B0B09] border border-[#23231F] text-[10px] font-mono text-[#C69A5B] uppercase tracking-wider">
                            {cert.issuer}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-serif text-2xl text-[#F1EEE7] group-hover:text-[#C69A5B] transition-colors mb-2">
                            {cert.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#9B9991] font-mono">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#C69A5B]" />
                              Issued: {cert.issue_date}
                            </span>

                            {cert.expiry_date && (
                              <span>
                                • Expires: {cert.expiry_date}
                              </span>
                            )}
                          </div>
                        </div>

                        {cert.credential_id && (
                          <div className="p-3 bg-[#0B0B09] border border-[#23231F] text-xs font-mono text-[#9B9991] flex items-center justify-between">
                            <span>ID:</span>
                            <span className="text-[#F1EEE7] font-semibold select-all">
                              {cert.credential_id}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Links */}
                      {(cert.credential_url || cert.pdf_url) && (
                        <div className="pt-6 mt-6 border-t border-[#23231F] flex flex-wrap items-center gap-3">
                          {cert.credential_url && (
                            <a
                              href={cert.credential_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F1EEE7] hover:bg-[#C69A5B] text-[#0B0B09] text-xs font-mono uppercase tracking-wider transition-colors font-medium"
                            >
                              <span>Verify Credential</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {cert.pdf_url && (
                            <a
                              href={cert.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B0B09] hover:bg-[#181814] border border-[#23231F] text-[#F1EEE7] text-xs font-mono uppercase tracking-wider transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5 text-[#C69A5B]" />
                              <span>View PDF</span>
                            </a>
                          )}

                          {cert.pdf_url && (
                            <a
                              href={cert.pdf_url}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B0B09] hover:bg-[#181814] border border-[#23231F] text-[#9B9991] hover:text-[#F1EEE7] text-xs font-mono uppercase tracking-wider transition-colors"
                              title="Download PDF"
                            >
                              <Download className="w-3.5 h-3.5 text-[#C69A5B]" />
                              <span>Download</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </AnimatePresence>
          ) : (
            <div className="p-12 text-center text-[#9B9991] text-xs font-mono bg-[#131310] border border-[#23231F] rounded-sm space-y-2">
              <p className="text-[#F1EEE7] uppercase tracking-wider">No certificates match your query.</p>
              <p className="text-[#9B9991]/70">Try adjusting your search terms or issuer filter.</p>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          title="No certificates published yet."
          description="Certificates added in the Admin Dashboard will appear here."
          onAdminClick={() => onNavigate('/admin/certificates')}
        />
      )}

      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {activeImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.2 }}
            className="fixed inset-0 z-50 bg-[#0B0B09]/95 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setActiveImageModal(null)}
          >
            <button
              onClick={() => setActiveImageModal(null)}
              className="absolute top-6 right-6 p-3 bg-[#131310] border border-[#23231F] text-[#F1EEE7] hover:text-[#C69A5B]"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div
              className="max-w-4xl max-h-[85vh] space-y-4 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activeImageModal.url}
                alt={activeImageModal.title}
                className="max-w-full max-h-[75vh] object-contain mx-auto border border-[#23231F]"
              />
              <p className="text-sm font-mono text-[#F1EEE7]">{activeImageModal.title}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

