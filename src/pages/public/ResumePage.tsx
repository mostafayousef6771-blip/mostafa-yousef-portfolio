import React from 'react';
import { Download, FileText, Calendar, HardDrive } from 'lucide-react';
import { Resume, Profile } from '../../types/portfolio';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageTransition } from '../../components/ui/PageTransition';
import { ScrollReveal } from '../../components/ui/ScrollReveal';

interface ResumePageProps {
  resume: Resume | null;
  profile?: Profile | null;
  onNavigate: (path: string) => void;
}

export const ResumePage: React.FC<ResumePageProps> = ({ resume, profile, onNavigate }) => {
  const hasResume = Boolean(resume && resume.file_url);

  return (
    <PageTransition className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-12 space-y-12">
      {/* Editorial Header */}
      <div>
        <span className="text-xs font-mono text-[#C69A5B] tracking-widest uppercase block mb-3">
          CURRICULUM VITAE
        </span>
        <h1 className="font-serif text-4xl sm:text-7xl font-light text-[#F1EEE7] mb-4 break-words">
          Official Resume
        </h1>
        <p className="text-[#9B9991] text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
          Comprehensive record of skills, qualifications, and employment history.
        </p>
      </div>

      {hasResume ? (
        <ScrollReveal>
          <div className="p-10 bg-[#131310] border border-[#23231F] rounded-sm text-center space-y-8 max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-[#0B0B09] border border-[#23231F] text-[#C69A5B] flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8 stroke-[1.5]" />
            </div>

            <div className="space-y-3">
              <h2 className="font-serif text-3xl text-[#F1EEE7]">
                {resume?.title || `${profile?.full_name || 'Official'} Resume`}
              </h2>

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-[#9B9991]">
                <span className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#C69A5B]" />
                  <span>
                    Updated:{' '}
                    {resume?.updated_at
                      ? new Date(resume.updated_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Recently'}
                  </span>
                </span>

                {resume?.file_size && (
                  <span className="flex items-center gap-2">
                    <HardDrive className="w-3.5 h-3.5 text-[#C69A5B]" />
                    <span>Size: {resume.file_size}</span>
                  </span>
                )}

                <span className="px-2 py-0.5 bg-[#0B0B09] border border-[#23231F] text-[#C69A5B] uppercase tracking-wider text-[10px]">
                  PDF FORMAT
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-6 border-t border-[#23231F]">
              <a
                href={resume?.file_url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#F1EEE7] hover:bg-[#C69A5B] text-[#0B0B09] text-xs font-mono uppercase tracking-wider font-semibold transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Resume PDF</span>
              </a>

              <a
                href={resume?.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0B0B09] hover:bg-[#181814] border border-[#23231F] text-[#F1EEE7] text-xs font-mono uppercase tracking-wider transition-colors"
              >
                <span>View in Browser</span>
              </a>
            </div>
          </div>
        </ScrollReveal>
      ) : (
        <EmptyState
          title="Resume file not uploaded yet."
          description="Upload your CV PDF in the Admin Dashboard to enable downloads."
          onAdminClick={() => onNavigate('/admin/resume')}
        />
      )}
    </PageTransition>
  );
};

