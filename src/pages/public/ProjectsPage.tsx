import React, { useState } from 'react';
import { Search, ArrowUpRight, X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Project } from '../../types/portfolio';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageTransition } from '../../components/ui/PageTransition';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../../components/ui/ScrollReveal';

interface ProjectsPageProps {
  projects: Project[];
  onNavigate: (path: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ projects, onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const shouldReduceMotion = useReducedMotion();

  const publishedProjects = projects.filter((p) => p.published);

  const uniqueCategories = Array.from(
    new Set(publishedProjects.map((p) => p.category).filter((c): c is string => Boolean(c && c.trim())))
  );
  const categories = ['All', ...uniqueCategories];

  const filteredProjects = publishedProjects.filter((project) => {
    const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      project.title.toLowerCase().includes(query) ||
      (project.summary && project.summary.toLowerCase().includes(query)) ||
      (project.category && project.category.toLowerCase().includes(query)) ||
      (project.tags && project.tags.some((t) => t.toLowerCase().includes(query)));

    return matchesCategory && matchesSearch;
  });

  return (
    <PageTransition className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 space-y-12">
      {/* Editorial Header */}
      <div>
        <span className="text-xs font-mono text-[#C69A5B] tracking-widest uppercase block mb-3">
          PORTFOLIO ARCHIVE
        </span>
        <h1 className="font-serif text-5xl sm:text-7xl font-light text-[#F1EEE7] mb-4">
          Selected Projects & Systems
        </h1>
        <p className="text-[#9B9991] text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
          A comprehensive archive of engineering case studies, software architectures, and analytical platforms.
        </p>
      </div>

      {publishedProjects.length > 0 ? (
        <div className="space-y-10">
          {/* Search & Category Filter Controls */}
          <ScrollReveal>
            <div className="p-4 bg-[#131310] border border-[#23231F] rounded-sm flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Search Input */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-[#9B9991] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter by title, stack, or tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0B0B09] border border-[#23231F] rounded-sm pl-9 pr-8 py-2 text-xs text-[#F1EEE7] placeholder:text-[#9B9991]/60 focus:outline-none focus:border-[#C69A5B] transition-all font-mono"
                  aria-label="Search projects"
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

              {/* Category Filter Tabs */}
              {categories.length > 1 && (
                <div
                  className="flex flex-wrap items-center gap-2 w-full md:w-auto"
                  role="tablist"
                  aria-label="Project categories"
                >
                  {categories.map((cat) => {
                    const isActive = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setSelectedCategory(cat)}
                        className={`relative px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors duration-200 ${
                          isActive
                            ? 'text-[#0B0B09] font-bold bg-[#F1EEE7]'
                            : 'text-[#9B9991] hover:text-[#F1EEE7] bg-[#0B0B09] border border-[#23231F]'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollReveal>

  /* Projects List / Grid */
  {filteredProjects.length > 0 ? (
    <AnimatePresence mode="popLayout">
      <div className="space-y-16">
        {filteredProjects.map((project, idx) => {
          const projNum = String(idx + 1).padStart(2, '0');
          const isEven = idx % 2 === 0;

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 0.3 }}
              onClick={() => onNavigate(`/projects/${project.slug}`)}
              className="group cursor-pointer bg-[#131310] border border-[#23231F] hover:border-[#C69A5B]/60 transition-all duration-300 p-6 sm:p-8 rounded-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              {/* Image Container */}
              <div className={`lg:col-span-7 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                <div className="relative aspect-[16/10] overflow-hidden bg-[#0B0B09] border border-[#23231F]">
                  {project.cover_image ? (
                    <img
                      src={project.cover_image}
                      alt={project.title}
                      className="w-full h-full object-cover scale-100 group-hover:scale-[1.02] transition-transform duration-500 ease-out opacity-90 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#9B9991] p-6">
                      <span className="font-serif text-3xl italic text-[#F1EEE7]">
                        {project.title}
                      </span>
                      <span className="text-xs font-mono text-[#C69A5B] uppercase tracking-widest mt-2">
                        {project.category}
                      </span>
                    </div>
                  )}

                  <div className="absolute top-4 left-4 px-3 py-1 bg-[#0B0B09]/90 border border-[#23231F] text-[10px] font-mono text-[#C69A5B] tracking-widest uppercase">
                    ARCHIVE {projNum}
                  </div>
                </div>
              </div>

              {/* Details Container */}
              <div className={`lg:col-span-5 space-y-4 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                <div className="flex items-center gap-3 text-xs font-mono text-[#C69A5B]">
                  <span className="font-bold">{projNum}</span>
                  <span>/</span>
                  <span className="uppercase tracking-widest">{project.category || 'PROJECT'}</span>
                </div>

                <h3 className="font-serif text-3xl sm:text-4xl text-[#F1EEE7] group-hover:text-[#C69A5B] transition-colors duration-300">
                  {project.title}
                </h3>

                <p className="text-[#9B9991] text-sm leading-relaxed font-normal">
                  {project.summary || 'Engineering case study and architectural overview.'}
                </p>

                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.tags.slice(0, 5).map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-1 border border-[#23231F] text-[10px] font-mono text-[#9B9991] uppercase tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-4 space-y-2">
                  <div className="w-10 h-[1px] bg-[#23231F] group-hover:w-full group-hover:bg-[#C69A5B] transition-all duration-500" />
                  <div className="flex items-center gap-2 text-xs font-mono text-[#F1EEE7] group-hover:text-[#C69A5B] transition-colors uppercase tracking-widest font-semibold">
                    <span>EXPLORE CASE STUDY</span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </AnimatePresence>
  ) : (
            <div className="p-12 text-center text-[#9B9991] text-xs font-mono bg-[#131310] border border-[#23231F] rounded-sm space-y-2">
              <p className="text-[#F1EEE7] uppercase tracking-wider">No projects match your query.</p>
              <p className="text-[#9B9991]/70">Try adjusting your search terms or category filter.</p>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          title="No projects published yet."
          description="Projects added in the Admin Dashboard will appear in this archive."
          onAdminClick={() => onNavigate('/admin/projects')}
        />
      )}
    </PageTransition>
  );
};

