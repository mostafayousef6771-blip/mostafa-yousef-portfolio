import React from 'react';
import { MapPin } from 'lucide-react';
import { Experience } from '../../types/portfolio';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageTransition } from '../../components/ui/PageTransition';
import { StaggerContainer, StaggerItem } from '../../components/ui/ScrollReveal';

interface ExperiencePageProps {
  experiences: Experience[];
  onNavigate: (path: string) => void;
}

export const ExperiencePage: React.FC<ExperiencePageProps> = ({ experiences, onNavigate }) => {
  return (
    <PageTransition className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-12 space-y-16">
      {/* Editorial Header */}
      <div className="border-b border-[#23231F] pb-10">
        <span className="text-xs font-mono text-[#C69A5B] tracking-widest uppercase block mb-3">
          02 / CAREER TRAJECTORY
        </span>
        <h1 className="font-serif text-4xl sm:text-7xl font-light text-[#F1EEE7] mb-4 break-words">
          Work Experience
        </h1>
        <p className="text-[#9B9991] text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
          Chronological record of engineering roles, leadership responsibilities, and system contributions.
        </p>
      </div>

      {experiences.length > 0 ? (
        <StaggerContainer className="space-y-16">
          {experiences.map((exp, index) => {
            const dateDisplay = `${exp.start_date} — ${exp.is_current ? 'PRESENT' : exp.end_date || 'N/A'}`;

            return (
              <StaggerItem key={exp.id}>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-10 pb-16 border-b border-[#23231F] group">
                  {/* Left Column: Date / Year */}
                  <div className="md:col-span-4 space-y-2">
                    <div className="inline-flex items-center gap-2 text-xs font-mono text-[#C69A5B] font-semibold tracking-wider uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C69A5B]" />
                      <span>{dateDisplay}</span>
                    </div>

                    {exp.is_current && (
                      <span className="inline-block ml-3 px-2 py-0.5 border border-[#23231F] bg-[#131310] text-[#C69A5B] text-[10px] font-mono uppercase tracking-wider">
                        Active Role
                      </span>
                    )}

                    {exp.location && (
                      <p className="text-xs text-[#9B9991] font-mono flex items-center gap-1.5 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#C69A5B]" />
                        <span>{exp.location}</span>
                      </p>
                    )}
                  </div>

                  {/* Right Column: Role, Company, Description */}
                  <div className="md:col-span-8 space-y-4 pl-0 md:pl-6 border-l-0 md:border-l border-[#C69A5B]/30 group-hover:border-[#C69A5B] transition-colors duration-300">
                    <div>
                      <h2 className="font-serif text-3xl text-[#F1EEE7] group-hover:text-[#C69A5B] transition-colors duration-300">
                        {exp.position}
                      </h2>
                      <p className="text-xs font-mono text-[#C69A5B] uppercase tracking-widest mt-1">
                        {exp.company}
                      </p>
                    </div>

                    {/* Bullet Points */}
                    {exp.description && exp.description.length > 0 && (
                      <ul className="space-y-3 pt-2 text-sm text-[#9B9991] leading-relaxed font-normal">
                        {exp.description.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="w-1 h-1 rounded-full bg-[#C69A5B] shrink-0 mt-2" />
                            <span className="text-[#F1EEE7]">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Tech Stack */}
                    {exp.skills_used && exp.skills_used.length > 0 && (
                      <div className="pt-4 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono text-[#C69A5B] uppercase tracking-widest mr-2">
                          STACK:
                        </span>
                        {exp.skills_used.map((skill, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-[#131310] border border-[#23231F] text-[10px] font-mono text-[#9B9991] uppercase tracking-wider"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      ) : (
        <EmptyState
          title="No work experience published yet."
          description="Career records added in the Admin Dashboard will appear here."
          onAdminClick={() => onNavigate('/admin/experience')}
        />
      )}
    </PageTransition>
  );
};


