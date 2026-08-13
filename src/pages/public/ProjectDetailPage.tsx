import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Github,
  Calendar,
  Tag,
  ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Project } from '../../types/portfolio';
import { PageTransition } from '../../components/ui/PageTransition';
import { ScrollReveal } from '../../components/ui/ScrollReveal';

interface ProjectDetailPageProps {
  slug: string;
  allProjects?: Project[];
  projects?: Project[];
  onNavigate: (path: string) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  slug,
  allProjects,
  projects,
  onNavigate,
}) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const publishedProjects = (allProjects || projects || []).filter((p) => p.published);
  const projectIndex = publishedProjects.findIndex((p) => p.slug === slug || p.id === slug);
  const project = projectIndex !== -1 ? publishedProjects[projectIndex] : null;

  const prevProject = projectIndex > 0 ? publishedProjects[projectIndex - 1] : null;
  const nextProject =
    projectIndex !== -1 && projectIndex < publishedProjects.length - 1
      ? publishedProjects[projectIndex + 1]
      : null;

  useEffect(() => {
    if (lightboxIndex === null || !project?.gallery) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev !== null ? (prev + 1) % project.gallery!.length : 0
        );
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev !== null
            ? (prev - 1 + project.gallery!.length) % project.gallery!.length
            : 0
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, project]);

  if (!project) {
    return (
      <PageTransition className="max-w-4xl mx-auto px-6 py-20 text-center space-y-6">
        <h2 className="font-serif text-3xl text-[#F1EEE7]">Project Not Found</h2>
        <p className="text-[#9B9991] text-sm max-w-md mx-auto font-mono">
          The requested project <code className="text-[#C69A5B]">"{slug}"</code> does not exist or has not been published yet.
        </p>
        <button
          onClick={() => onNavigate('/projects')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#F1EEE7] text-[#0B0B09] text-xs font-mono uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Archive</span>
        </button>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-12 space-y-12">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between border-b border-[#23231F] pb-6">
        <button
          onClick={() => onNavigate('/projects')}
          className="inline-flex items-center gap-2 text-xs font-mono text-[#9B9991] hover:text-[#F1EEE7] uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#C69A5B]" />
          <span>Back to Archive</span>
        </button>

        {project.featured && (
          <span className="text-[10px] font-mono text-[#C69A5B] uppercase tracking-widest px-3 py-1 border border-[#23231F] bg-[#131310]">
            FEATURED CASE STUDY
          </span>
        )}
      </div>

      {/* Header & Metadata */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#9B9991]">
          {project.category && (
            <span className="text-[#C69A5B] uppercase tracking-widest font-semibold">
              {project.category}
            </span>
          )}

          {project.created_at && (
            <span className="flex items-center gap-1.5 text-[#9B9991]">
              <Calendar className="w-3.5 h-3.5 text-[#C69A5B]" />
              <span>
                {new Date(project.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                })}
              </span>
            </span>
          )}
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl font-light text-[#F1EEE7] leading-tight">
          {project.title}
        </h1>

        {project.summary && (
          <p className="text-[#9B9991] text-base sm:text-xl font-normal leading-relaxed max-w-3xl">
            {project.summary}
          </p>
        )}

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-4 pt-4">
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#F1EEE7] hover:bg-[#C69A5B] text-[#0B0B09] font-medium text-xs tracking-wider uppercase transition-colors"
            >
              <span>Live Demonstration</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          )}

          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#131310] hover:bg-[#181814] border border-[#23231F] text-[#F1EEE7] font-mono text-xs tracking-wider uppercase transition-colors"
            >
              <Github className="w-4 h-4 text-[#C69A5B]" />
              <span>Repository</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Cover Image */}
      {project.cover_image && (
        <ScrollReveal>
          <div className="overflow-hidden border border-[#23231F] bg-[#131310] rounded-sm max-h-[500px]">
            <img
              src={project.cover_image}
              alt={project.title}
              className="w-full h-full object-cover max-h-[500px]"
            />
          </div>
        </ScrollReveal>
      )}

      {/* Architectural Specifications */}
      {project.content && (
        <ScrollReveal>
          <div className="p-8 sm:p-10 bg-[#131310] border border-[#23231F] rounded-sm space-y-6">
            <h3 className="text-xs font-mono text-[#C69A5B] uppercase tracking-widest">
              ARCHITECTURE & SPECIFICATIONS
            </h3>
            <div className="text-[#F1EEE7] text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
              {project.content}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Project Gallery */}
      {project.gallery && project.gallery.length > 0 && (
        <ScrollReveal className="space-y-6">
          <h3 className="text-xs font-mono text-[#C69A5B] uppercase tracking-widest flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#C69A5B]" />
            <span>PROJECT GALLERY ({project.gallery.length})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {project.gallery.map((imgUrl, idx) => (
              <div
                key={idx}
                onClick={() => setLightboxIndex(idx)}
                className="aspect-video overflow-hidden border border-[#23231F] bg-[#131310] cursor-pointer group relative rounded-sm"
              >
                <img
                  src={imgUrl}
                  alt={`${project.title} snapshot ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-[#0B0B09]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-mono text-[#F1EEE7] uppercase tracking-wider">
                  Expand Image
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      )}

      {/* Technology Stack Tags */}
      {project.tags && project.tags.length > 0 && (
        <div className="p-6 bg-[#131310] border border-[#23231F] rounded-sm flex items-center gap-4">
          <Tag className="w-4 h-4 text-[#C69A5B] shrink-0" />
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-[#0B0B09] border border-[#23231F] text-xs font-mono text-[#9B9991] uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Prev / Next Navigation Links */}
      {(prevProject || nextProject) && (
        <div className="pt-8 border-t border-[#23231F] grid grid-cols-1 sm:grid-cols-2 gap-6">
          {prevProject ? (
            <button
              onClick={() => onNavigate(`/projects/${prevProject.slug}`)}
              className="p-6 bg-[#131310] border border-[#23231F] hover:border-[#C69A5B]/50 text-left transition-colors space-y-2 group rounded-sm"
            >
              <span className="text-[10px] font-mono text-[#C69A5B] uppercase flex items-center gap-1.5 tracking-wider">
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                Previous Project
              </span>
              <p className="font-serif text-lg text-[#F1EEE7] group-hover:text-[#C69A5B] transition-colors truncate">
                {prevProject.title}
              </p>
            </button>
          ) : (
            <div />
          )}

          {nextProject ? (
            <button
              onClick={() => onNavigate(`/projects/${nextProject.slug}`)}
              className="p-6 bg-[#131310] border border-[#23231F] hover:border-[#C69A5B]/50 text-right transition-colors space-y-2 group rounded-sm sm:col-start-2"
            >
              <span className="text-[10px] font-mono text-[#C69A5B] uppercase flex items-center justify-end gap-1.5 tracking-wider">
                Next Project
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
              <p className="font-serif text-lg text-[#F1EEE7] group-hover:text-[#C69A5B] transition-colors truncate">
                {nextProject.title}
              </p>
            </button>
          ) : null}
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && project.gallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.2 }}
            className="fixed inset-0 z-50 bg-[#0B0B09]/95 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 p-3 bg-[#131310] border border-[#23231F] text-[#F1EEE7] hover:text-[#C69A5B]"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {project.gallery.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(
                      (lightboxIndex - 1 + project.gallery!.length) %
                        project.gallery!.length
                    );
                  }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-[#131310] border border-[#23231F] text-[#F1EEE7] hover:text-[#C69A5B]"
                  title="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((lightboxIndex + 1) % project.gallery!.length);
                  }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-[#131310] border border-[#23231F] text-[#F1EEE7] hover:text-[#C69A5B]"
                  title="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            <img
              src={project.gallery[lightboxIndex]}
              alt={`${project.title} gallery full`}
              className="max-w-full max-h-[85vh] object-contain border border-[#23231F]"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

