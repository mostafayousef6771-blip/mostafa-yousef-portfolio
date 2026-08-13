import React from 'react';
import { MapPin, Award } from 'lucide-react';
import { Education } from '../../types/portfolio';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageTransition } from '../../components/ui/PageTransition';
import { StaggerContainer, StaggerItem } from '../../components/ui/ScrollReveal';

interface EducationPageProps {
  educations: Education[];
  onNavigate: (path: string) => void;
}

export const EducationPage: React.FC<EducationPageProps> = ({ educations, onNavigate }) => {
  return (
    <PageTransition className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-12 space-y-12">
      {/* Editorial Header */}
      <div>
        <span className="text-xs font-mono text-[#C69A5B] tracking-widest uppercase block mb-3">
          ACADEMIC FOUNDATION
        </span>
        <h1 className="font-serif text-5xl sm:text-7xl font-light text-[#F1EEE7] mb-4">
          Education
        </h1>
        <p className="text-[#9B9991] text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
          University degrees, computer science studies, and academic research background.
        </p>
      </div>

      {educations.length > 0 ? (
        <StaggerContainer className="relative border-l border-[#23231F] ml-3 sm:ml-6 space-y-12 pl-6 sm:pl-10">
          {educations.map((edu) => (
            <StaggerItem key={edu.id}>
              <div className="relative group">
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-[31px] sm:-left-[47px] top-1.5 w-2.5 h-2.5 rounded-full border transition-colors ${
                    edu.is_current
                      ? 'bg-[#C69A5B] border-[#C69A5B] ring-4 ring-[#C69A5B]/10'
                      : 'bg-[#0B0B09] border-[#23231F] group-hover:border-[#C69A5B]'
                  }`}
                />

                <div className="p-8 bg-[#131310] border border-[#23231F] hover:border-[#C69A5B]/40 transition-colors rounded-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#23231F] pb-4">
                    <div>
                      <h2 className="font-serif text-2xl text-[#F1EEE7]">
                        {edu.degree}
                      </h2>
                      {edu.field_of_study && (
                        <p className="text-xs font-mono text-[#C69A5B] uppercase tracking-wider mt-1">
                          {edu.field_of_study}
                        </p>
                      )}
                      <p className="text-xs font-mono text-[#9B9991] mt-1">
                        {edu.institution}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-[#9B9991]">
                      <span>
                        {edu.start_date} — {edu.is_current ? 'PRESENT' : edu.end_date || 'N/A'}
                      </span>

                      {edu.is_current && (
                        <span className="px-2 py-0.5 border border-[#23231F] bg-[#0B0B09] text-[#C69A5B] text-[10px] uppercase tracking-wider">
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>

                  {edu.location && (
                    <p className="text-xs text-[#9B9991] font-mono flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#C69A5B]" />
                      <span>{edu.location}</span>
                    </p>
                  )}

                  {edu.grade && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0B0B09] border border-[#23231F] text-[#C69A5B] text-xs font-mono uppercase tracking-wider">
                      <Award className="w-3.5 h-3.5" />
                      <span>Honors: {edu.grade}</span>
                    </div>
                  )}

                  {edu.description && (
                    <p className="text-xs sm:text-sm text-[#F1EEE7] leading-relaxed font-normal">
                      {edu.description}
                    </p>
                  )}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : (
        <EmptyState
          title="No education published yet."
          description="Academic records added in the Admin Dashboard will appear here."
          onAdminClick={() => onNavigate('/admin/education')}
        />
      )}
    </PageTransition>
  );
};

