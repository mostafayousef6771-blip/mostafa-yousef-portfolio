import React from 'react';
import { MapPin, Briefcase, ArrowUpRight } from 'lucide-react';
import { About, Profile } from '../../types/portfolio';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageTransition } from '../../components/ui/PageTransition';
import { ScrollReveal } from '../../components/ui/ScrollReveal';

interface AboutPageProps {
  about: About | null;
  profile: Profile | null;
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ about, profile, onNavigate }) => {
  const hasContent = Boolean(
    about?.content || about?.story || (about?.highlights && about.highlights.length > 0)
  );

  return (
    <PageTransition className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-12 space-y-16">
      {/* Editorial Header */}
      <div className="border-b border-[#23231F] pb-10">
        <span className="text-xs font-mono text-[#C69A5B] tracking-widest uppercase block mb-3">
          01 / BIOGRAPHY & PHILOSOPHY
        </span>
        <h1 className="font-serif text-4xl sm:text-7xl lg:text-8xl font-light text-[#F1EEE7] mb-6 leading-tight break-words">
          {about?.title || profile?.headline || (profile?.full_name ? `About ${profile.full_name}` : 'About')}
        </h1>
        {profile?.bio && (
          <p className="text-[#9B9991] text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
            {profile.bio}
          </p>
        )}
      </div>

      {hasContent ? (
        <div className="space-y-20">
          {/* Asymmetric Profile & Bio Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Portrait Frame or Quick Info */}
            <div className="lg:col-span-5 space-y-8">
              {profile?.avatar_url ? (
                <ScrollReveal>
                  <div className="relative aspect-[4/5] p-2 bg-[#131310] border border-[#23231F] overflow-hidden">
                    <img
                      src={profile.avatar_url}
                      alt={profile?.full_name || 'Mostafa Yousef'}
                      className="w-full h-full object-cover filter grayscale contrast-110 opacity-90 hover:grayscale-0 transition-all duration-700"
                    />
                  </div>
                </ScrollReveal>
              ) : (
                <div className="p-8 bg-[#131310] border border-[#23231F] space-y-4">
                  <span className="text-xs font-mono text-[#C69A5B] uppercase tracking-widest block">
                    FOUNDATIONAL PROFILE
                  </span>
                  <h3 className="font-serif text-3xl text-[#F1EEE7]">{profile?.full_name || 'Mostafa Yousef'}</h3>
                  <p className="text-xs font-mono text-[#9B9991] uppercase tracking-wider">{profile?.headline}</p>
                </div>
              )}

              {/* Profile Meta Info */}
              {profile && (
                <div className="p-6 border border-[#23231F] space-y-3 font-mono text-xs text-[#9B9991]">
                  {profile.full_name && (
                    <div className="flex flex-col sm:flex-row sm:justify-between border-b border-[#23231F] pb-2 gap-1">
                      <span className="text-[#C69A5B]">NAME:</span>
                      <span className="text-[#F1EEE7]">{profile.full_name}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex flex-col sm:flex-row sm:justify-between border-b border-[#23231F] pb-2 gap-1">
                      <span className="text-[#C69A5B] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#C69A5B]" />
                        LOCATION:
                      </span>
                      <span className="text-[#F1EEE7]">{profile.location}</span>
                    </div>
                  )}
                  {profile.headline && (
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-[#C69A5B] flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-[#C69A5B]" />
                        ROLE:
                      </span>
                      <span className="text-[#F1EEE7]">{profile.headline}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Editorial Bio Narrative */}
            <div className="lg:col-span-7 space-y-12">
              {about?.title && (
                <h2 className="font-serif text-3xl sm:text-4xl text-[#F1EEE7] font-light">
                  {about.title}
                </h2>
              )}

              {about?.content && (
                <ScrollReveal>
                  <div className="space-y-4 border-l-2 border-[#C69A5B] pl-6 py-2">
                    <span className="text-xs font-mono text-[#C69A5B] uppercase tracking-widest block">
                      BACKGROUND & TRAJECTORY
                    </span>
                    <p className="text-[#F1EEE7] text-base sm:text-lg leading-relaxed whitespace-pre-line font-normal">
                      {about.content}
                    </p>
                  </div>
                </ScrollReveal>
              )}

              {about?.story && (
                <ScrollReveal delay={0.1}>
                  <div className="space-y-4 border-l-2 border-[#23231F] hover:border-[#C69A5B] transition-colors pl-6 py-2">
                    <span className="text-xs font-mono text-[#C69A5B] uppercase tracking-widest block">
                      ENGINEERING PHILOSOPHY
                    </span>
                    <p className="text-[#9B9991] text-base sm:text-lg leading-relaxed whitespace-pre-line font-normal">
                      {about.story}
                    </p>
                  </div>
                </ScrollReveal>
              )}
            </div>
          </div>

          {/* Key Milestones Section */}
          {about?.highlights && about.highlights.length > 0 && (
            <ScrollReveal>
              <div className="pt-12 border-t border-[#23231F] space-y-8">
                <span className="text-xs font-mono text-[#C69A5B] uppercase tracking-widest block">
                  KEY MILESTONES & ACHIEVEMENTS
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {about.highlights.map((highlight, index) => {
                    const num = String(index + 1).padStart(2, '0');
                    return (
                      <div key={index} className="p-6 bg-[#131310] border border-[#23231F] flex items-start gap-4">
                        <span className="font-mono text-xs text-[#C69A5B] font-bold mt-0.5">
                          {num}
                        </span>
                        <p className="text-sm text-[#F1EEE7] leading-relaxed">
                          {highlight}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* Bottom Action */}
          <div className="pt-8 flex justify-between items-center border-t border-[#23231F]">
            <button
              onClick={() => onNavigate('/experience')}
              className="inline-flex items-center gap-2 text-xs font-mono text-[#C69A5B] hover:text-[#F1EEE7] uppercase tracking-widest transition-colors font-semibold"
            >
              <span>Explore Work Experience Timeline</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('/contact')}
              className="inline-flex items-center gap-2 text-xs font-mono text-[#9B9991] hover:text-[#F1EEE7] uppercase tracking-widest transition-colors"
            >
              <span>Direct Correspondence →</span>
            </button>
          </div>
        </div>
      ) : (
        <EmptyState
          title="About information not configured yet."
          description="Detailed background, biography, and highlights can be added via the Admin Dashboard."
          onAdminClick={() => onNavigate('/admin/about')}
        />
      )}
    </PageTransition>
  );
};


