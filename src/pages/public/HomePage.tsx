import React from 'react';
import {
  ArrowUpRight,
  ArrowDown,
  FileText,
  Star,
  ChevronRight,
} from 'lucide-react';
import { Profile, About, Skill, Project, Review, Resume, SocialLink } from '../../types/portfolio';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageTransition } from '../../components/ui/PageTransition';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../../components/ui/ScrollReveal';

interface HomePageProps {
  onNavigate: (path: string) => void;
  profile: Profile | null;
  about: About | null;
  skills: Skill[];
  projects: Project[];
  certificates?: unknown[];
  reviews: Review[];
  resume: Resume | null;
  socialLinks?: SocialLink[];
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  profile,
  about = null,
  skills,
  projects,
  reviews,
  resume,
  socialLinks = [],
}) => {
  const publishedProjects = projects.filter((p) => p.published);
  const featuredProjects = publishedProjects.filter((p) => p.featured);
  const displayProjects = featuredProjects.length > 0 ? featuredProjects : publishedProjects.slice(0, 3);

  const publishedReviews = reviews.filter((r) => r.is_published);
  const enabledSocials = socialLinks.filter((s) => s.is_enabled);

  // Determine photographic image for hero (Profile avatar -> Project cover image -> fallback)
  const heroImage =
    profile?.avatar_url ||
    publishedProjects.find((p) => p.cover_image)?.cover_image ||
    null;

  const headlineLabel =
    profile?.headline ||
    (profile?.full_name ? `${profile.full_name.toUpperCase()} / PORTFOLIO` : 'PORTFOLIO ARCHIVE');
  const bioText = profile?.bio || null;
  const mainTitle = profile?.headline || profile?.full_name || profile?.hero_greeting || null;

  // Group skills into 4 core technical index categories
  const skillCategories = Array.from(
    new Set(skills.map((s) => s.category).filter((c): c is string => Boolean(c && c.trim())))
  );
  const displaySkillGroups = skillCategories.slice(0, 4).map((cat) => ({
    category: cat,
    items: skills.filter((s) => s.category === cat).slice(0, 5),
  }));

  return (
    <PageTransition className="space-y-32">
      {/* 1 & 2 & 3. EDITORIAL HERO SECTION */}
      <section className="relative min-h-[85vh] sm:min-h-[92vh] flex flex-col justify-between max-w-7xl mx-auto px-4 sm:px-10 lg:px-12 pt-2 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center flex-grow py-6 sm:py-8">
          {/* LEFT: Text & Editorial Composition */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 z-10">
            {/* Editorial Micro Details Header */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-mono text-[#9B9991] uppercase tracking-[0.15em] sm:tracking-[0.2em]">
                <span className="text-[#C69A5B] font-semibold">01 / INTRO</span>
                <span className="w-1 h-1 rounded-full bg-[#C69A5B]" />
                <span className="text-[#F1EEE7]">{headlineLabel}</span>
              </div>
              <div className="w-16 h-[1px] bg-[#C69A5B]/60" />
            </div>

            {/* Display Headline / Name */}
            {mainTitle && (
              <h1 className="font-serif text-4xl sm:text-7xl lg:text-8xl font-light tracking-tight text-[#F1EEE7] leading-[1.08] sm:leading-[1.04] break-words">
                {mainTitle}
              </h1>
            )}

            {/* Personal Statement */}
            {bioText && (
              <p className="text-base sm:text-lg text-[#9B9991] max-w-xl leading-relaxed font-normal">
                {bioText}
              </p>
            )}

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <button
                onClick={() => onNavigate('/projects')}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#F1EEE7] hover:bg-[#C69A5B] text-[#0B0B09] font-semibold text-xs tracking-[0.15em] uppercase transition-colors duration-300 rounded-sm min-h-[44px] w-full sm:w-auto"
              >
                <span>View Selected Work</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              {resume?.file_url ? (
                <a
                  href={resume.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 text-[#9B9991] hover:text-[#F1EEE7] text-xs font-mono tracking-widest uppercase transition-colors min-h-[44px] py-2"
                >
                  <FileText className="w-4 h-4 text-[#C69A5B]" />
                  <span>Download CV ↓</span>
                </a>
              ) : (
                <button
                  onClick={() => onNavigate('/resume')}
                  className="inline-flex items-center justify-center gap-2 text-[#9B9991] hover:text-[#F1EEE7] text-xs font-mono tracking-widest uppercase transition-colors min-h-[44px] py-2"
                >
                  <FileText className="w-4 h-4 text-[#C69A5B]" />
                  <span>View Resume ↓</span>
                </button>
              )}
            </div>

            {/* Direct Social Connections */}
            {enabledSocials.length > 0 && (
              <div className="pt-6 border-t border-[#23231F] flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-mono text-[#9B9991]">
                <span className="text-[#C69A5B] uppercase tracking-widest text-[10px]">CONNECT:</span>
                <div className="flex flex-wrap gap-4 sm:gap-5">
                  {enabledSocials.map((social) => (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#F1EEE7] transition-colors min-h-[32px] flex items-center"
                    >
                      {social.label || social.platform}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Cinematic Editorial Image Frame */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-xs sm:max-w-md aspect-[4/5] p-2 bg-[#131310] border border-[#23231F] group">
              {/* Outer architectural accent frame */}
              <div className="absolute -inset-2 border border-[#C69A5B]/20 pointer-events-none group-hover:border-[#C69A5B]/40 transition-colors duration-500" />

              <div className="relative w-full h-full overflow-hidden bg-[#0B0B09]">
                {heroImage ? (
                  <img
                    src={heroImage}
                    alt={profile?.full_name || 'Mostafa Yousef Portfolio'}
                    className="w-full h-full object-cover filter grayscale contrast-110 opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 scale-100 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col justify-between p-8 bg-gradient-to-b from-[#181814] to-[#0B0B09]">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono text-[#C69A5B] tracking-widest uppercase">
                        {profile?.headline || 'PORTFOLIO ARCHIVE'}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-[#C69A5B]" />
                    </div>
                    <div className="space-y-4">
                      {profile?.full_name && (
                        <span className="font-serif text-3xl italic text-[#F1EEE7] block font-light leading-snug">
                          {profile.full_name}
                        </span>
                      )}
                      {profile?.bio && (
                        <p className="text-xs text-[#9B9991] font-mono leading-relaxed line-clamp-4">
                          {profile.bio}
                        </p>
                      )}
                    </div>
                    <div className="pt-4 border-t border-[#23231F] text-[10px] font-mono text-[#C69A5B] uppercase tracking-widest">
                      {profile?.full_name ? `${profile.full_name.toUpperCase()} / PORTFOLIO` : 'PORTFOLIO ARCHIVE'}
                    </div>
                  </div>
                )}
                {/* Subtle Image Overlay Accent */}
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-[#0B0B09] via-[#0B0B09]/40 to-transparent flex items-end justify-between text-[10px] font-mono text-[#F1EEE7]">
                  <span className="tracking-widest uppercase text-[#9B9991]">
                    {profile?.full_name || 'MOSTAFA YOUSEF'}
                  </span>
                  <span className="text-[#C69A5B]">{new Date().getFullYear()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="py-4 border-t border-[#23231F] flex items-center justify-between text-[10px] font-mono tracking-widest text-[#9B9991] uppercase">
          <div className="flex items-center gap-3">
            <ArrowDown className="w-3.5 h-3.5 text-[#C69A5B] animate-bounce" />
            <span>SCROLL TO EXPLORE ↓</span>
          </div>
          <span className="hidden sm:inline text-[#9B9991]/60">01 / ARCHIVE</span>
        </div>
      </section>

      {/* 4 & 5. SELECTED WORK — SIGNATURE SECTION */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        <ScrollReveal>
          <div className="mb-16 border-b border-[#23231F] pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-mono text-[#C69A5B] tracking-widest uppercase block mb-2">
                02 / SIGNATURE PROJECTS
              </span>
              <h2 className="font-serif text-4xl sm:text-6xl font-light text-[#F1EEE7]">
                Selected Work
              </h2>
            </div>
            {publishedProjects.length > 0 && (
              <button
                onClick={() => onNavigate('/projects')}
                className="inline-flex items-center gap-2 text-xs font-mono text-[#C69A5B] hover:text-[#F1EEE7] uppercase tracking-widest transition-colors"
              >
                <span>Full Archive ({publishedProjects.length})</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </ScrollReveal>

        {displayProjects.length > 0 ? (
          <div className="space-y-28 sm:space-y-36">
            {displayProjects.map((project, idx) => {
              const projNum = String(idx + 1).padStart(2, '0');
              const isEven = idx % 2 === 0;

              return (
                <ScrollReveal key={project.id}>
                  <div
                    onClick={() => onNavigate(`/projects/${project.slug}`)}
                    className="group cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-14 items-center"
                  >
                    {/* Project Image Composition */}
                    <div
                      className={`lg:col-span-7 ${
                        isEven ? 'lg:order-1' : 'lg:order-2'
                      }`}
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-[#131310] border border-[#23231F] group-hover:border-[#C69A5B]/60 transition-colors duration-500">
                        {project.cover_image ? (
                          <img
                            src={project.cover_image}
                            alt={project.title}
                            className="w-full h-full object-cover scale-100 group-hover:scale-[1.02] transition-transform duration-500 ease-out opacity-90 group-hover:opacity-100"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-[#9B9991] p-8">
                            <span className="font-serif text-3xl italic mb-2 text-[#F1EEE7]">
                              {project.title}
                            </span>
                            <span className="text-xs font-mono text-[#C69A5B] uppercase tracking-widest">
                              {project.category}
                            </span>
                          </div>
                        )}

                        {/* Top Overlay Badge */}
                        <div className="absolute top-4 left-4 text-[10px] font-mono text-[#C69A5B] bg-[#0B0B09]/90 px-3 py-1 border border-[#23231F] tracking-widest uppercase flex items-center gap-2">
                          <span className="group-hover:translate-x-0.5 transition-transform duration-300">
                            PROJECT {projNum}
                          </span>
                          <span>•</span>
                          <span>{project.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* Project Details */}
                    <div
                      className={`lg:col-span-5 space-y-5 ${
                        isEven ? 'lg:order-2' : 'lg:order-1'
                      }`}
                    >
                      <div className="flex items-center gap-3 text-xs font-mono text-[#C69A5B]">
                        <span className="font-semibold text-sm group-hover:translate-x-1 transition-transform duration-300">
                          {projNum}
                        </span>
                        <span>/</span>
                        <span className="uppercase tracking-widest">{project.category}</span>
                      </div>

                      <h3 className="font-serif text-3xl sm:text-5xl font-light text-[#F1EEE7] group-hover:text-[#C69A5B] transition-colors duration-300 leading-tight">
                        {project.title}
                      </h3>

                      <p className="text-sm sm:text-base text-[#9B9991] leading-relaxed font-normal">
                        {project.summary || 'Comprehensive software architecture and case study.'}
                      </p>

                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {project.tags.slice(0, 4).map((tag, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-mono text-[#9B9991] border border-[#23231F] px-2.5 py-1 uppercase tracking-wider"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Expanding Hover Brass Line & CTA */}
                      <div className="pt-4 space-y-3">
                        <div className="w-12 h-[1px] bg-[#23231F] group-hover:w-full group-hover:bg-[#C69A5B] transition-all duration-500" />
                        <div className="flex items-center gap-2 text-xs font-mono text-[#F1EEE7] group-hover:text-[#C69A5B] transition-colors uppercase tracking-widest font-semibold">
                          <span>VIEW CASE STUDY</span>
                          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No projects published yet."
            description="Projects published in the Admin Dashboard will appear in this section."
            onAdminClick={() => onNavigate('/admin/projects')}
          />
        )}
      </section>

      {/* 6. ABOUT — PERSONALITY */}
      {(about?.title || about?.content || about?.story || profile?.bio) && (
        <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
          <ScrollReveal>
            <div className="border-t border-[#23231F] pt-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              <div className="lg:col-span-5 space-y-6">
                <span className="text-xs font-mono text-[#C69A5B] tracking-widest uppercase block">
                  03 / BIOGRAPHY & PHILOSOPHY
                </span>
                <h2 className="font-serif text-4xl sm:text-6xl font-light text-[#F1EEE7] leading-[1.1]">
                  {about?.title || profile?.headline || 'About'}
                </h2>
              </div>

              <div className="lg:col-span-7 space-y-6 text-[#9B9991] text-base sm:text-lg leading-relaxed font-normal">
                {about?.content && <p className="whitespace-pre-line">{about.content}</p>}
                {about?.story && <p className="whitespace-pre-line">{about.story}</p>}
                {!about?.content && !about?.story && profile?.bio && <p>{profile.bio}</p>}
                <div className="pt-4">
                  <button
                    onClick={() => onNavigate('/about')}
                    className="inline-flex items-center gap-2 text-xs font-mono text-[#C69A5B] hover:text-[#F1EEE7] uppercase tracking-widest transition-colors font-semibold"
                  >
                    <span>FULL BIOGRAPHY & BACKGROUND →</span>
                  </button>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* 7. SKILLS — TECHNICAL INDEX */}
      {skills.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
          <ScrollReveal>
            <div className="mb-12 border-b border-[#23231F] pb-6 flex items-end justify-between">
              <div>
                <span className="text-xs font-mono text-[#C69A5B] tracking-widest uppercase block mb-2">
                  04 / TECHNICAL INDEX
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#F1EEE7]">
                  Capabilities & Stack
                </h2>
              </div>
              <button
                onClick={() => onNavigate('/skills')}
                className="text-xs font-mono text-[#C69A5B] hover:text-[#F1EEE7] uppercase tracking-widest transition-colors"
              >
                View Complete Index →
              </button>
            </div>
          </ScrollReveal>

          {displaySkillGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {displaySkillGroups.map((group, groupIdx) => {
                const idxStr = String(groupIdx + 1).padStart(2, '0');

                return (
                  <ScrollReveal key={group.category} delay={groupIdx * 0.05}>
                    <div className="space-y-4 p-6 bg-[#131310] border border-[#23231F] rounded-sm">
                      <div className="flex items-center justify-between border-b border-[#23231F] pb-3">
                        <span className="font-mono text-xs text-[#C69A5B] font-bold">
                          {idxStr}
                        </span>
                        <span className="font-mono text-[10px] text-[#9B9991] uppercase tracking-wider">
                          {group.category}
                        </span>
                      </div>

                      <ul className="space-y-2.5 pt-2">
                        {group.items.map((skill) => (
                          <li key={skill.id} className="flex items-center justify-between text-xs">
                            <span className="font-serif text-base text-[#F1EEE7]">{skill.name}</span>
                            {typeof skill.level === 'number' && skill.level > 0 && (
                              <span className="font-mono text-[10px] text-[#C69A5B]">
                                {skill.level}%
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {skills.slice(0, 12).map((skill) => (
                <StaggerItem key={skill.id}>
                  <div className="p-5 bg-[#131310] border border-[#23231F] rounded-sm">
                    <span className="text-[10px] font-mono text-[#C69A5B] block mb-1">
                      {skill.category}
                    </span>
                    <h4 className="text-sm font-medium text-[#F1EEE7]">{skill.name}</h4>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </section>
      )}

      {/* 10. REVIEWS — DOMINANT EDITORIAL QUOTE */}
      {publishedReviews.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-12">
          <ScrollReveal>
            <div className="p-10 sm:p-14 bg-[#131310] border border-[#23231F] rounded-sm space-y-8 relative">
              <div className="flex items-center justify-between border-b border-[#23231F] pb-4">
                <span className="text-xs font-mono text-[#C69A5B] tracking-widest uppercase">
                  05 / ENDORSEMENTS
                </span>
                <div className="flex items-center gap-1 text-[#C69A5B]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < publishedReviews[0].rating
                          ? 'fill-[#C69A5B] text-[#C69A5B]'
                          : 'text-[#23231F]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <blockquote className="font-serif text-2xl sm:text-4xl text-[#F1EEE7] font-light italic leading-relaxed">
                "{publishedReviews[0].review_text}"
              </blockquote>

              <div className="pt-6 border-t border-[#23231F] flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-xl text-[#F1EEE7]">
                    {publishedReviews[0].client_name}
                  </h4>
                  <p className="text-xs font-mono text-[#C69A5B] uppercase tracking-wider mt-1">
                    {publishedReviews[0].position && publishedReviews[0].company
                      ? `${publishedReviews[0].position}, ${publishedReviews[0].company}`
                      : publishedReviews[0].company || publishedReviews[0].position || 'Verified Partner'}
                  </p>
                </div>

                {publishedReviews.length > 1 && (
                  <button
                    onClick={() => onNavigate('/reviews')}
                    className="text-xs font-mono text-[#C69A5B] hover:text-[#F1EEE7] uppercase tracking-widest transition-colors"
                  >
                    All Endorsements ({publishedReviews.length}) →
                  </button>
                )}
              </div>
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* 12. CALL TO ACTION / MEMORABLE ENDING */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        <ScrollReveal>
          <div className="py-20 border-t border-b border-[#23231F] text-center space-y-8">
            <span className="text-xs font-mono text-[#C69A5B] tracking-widest uppercase">
              06 / INITIATE CONTACT
            </span>

            <h2 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-light text-[#F1EEE7] max-w-4xl mx-auto leading-tight uppercase tracking-tight">
              LET'S BUILD<br />
              SOMETHING<br />
              <span className="text-[#C69A5B] italic font-normal">MEANINGFUL.</span>
            </h2>

            <p className="text-base text-[#9B9991] max-w-md mx-auto font-normal">
              Have an upcoming project, architectural inquiry, or opportunity? Direct correspondence is welcomed.
            </p>

            <div className="pt-4">
              <button
                onClick={() => onNavigate('/contact')}
                className="inline-flex items-center gap-3 px-10 py-5 bg-[#F1EEE7] hover:bg-[#C69A5B] text-[#0B0B09] font-bold text-xs tracking-[0.2em] uppercase transition-colors duration-300 rounded-sm"
              >
                <span>Initiate Correspondence</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </PageTransition>
  );
};


