import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Skill } from '../../types/portfolio';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageTransition } from '../../components/ui/PageTransition';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../../components/ui/ScrollReveal';

interface SkillsPageProps {
  skills: Skill[];
  onNavigate: (path: string) => void;
}

export const SkillsPage: React.FC<SkillsPageProps> = ({ skills, onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const shouldReduceMotion = useReducedMotion();

  const uniqueCategories = Array.from(
    new Set(skills.map((s) => s.category).filter((c): c is string => Boolean(c && c.trim())))
  );
  const categories = ['All', ...uniqueCategories];

  const filteredSkills = skills.filter((skill) => {
    const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (skill.category && skill.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Group filtered skills by category
  const groupedSkills = uniqueCategories.reduce((acc, cat) => {
    const skillsInCat = filteredSkills.filter((s) => s.category === cat);
    if (skillsInCat.length > 0) {
      acc.push({ category: cat, items: skillsInCat });
    }
    return acc;
  }, [] as { category: string; items: Skill[] }[]);

  // Add uncategorized skills if any
  const uncategorized = filteredSkills.filter((s) => !s.category || !s.category.trim());
  if (uncategorized.length > 0) {
    groupedSkills.push({ category: 'General Capabilities', items: uncategorized });
  }

  return (
    <PageTransition className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-12 space-y-12">
      {/* Editorial Header */}
      <div>
        <span className="text-xs font-mono text-[#C69A5B] tracking-widest uppercase block mb-3">
          04 / TECHNICAL INDEX
        </span>
        <h1 className="font-serif text-4xl sm:text-7xl font-light text-[#F1EEE7] mb-4 break-words">
          Skills & Stack
        </h1>
        <p className="text-[#9B9991] text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
          An editorial index of tools, languages, platforms, and methodologies.
        </p>
      </div>

      {skills.length > 0 ? (
        <div className="space-y-12">
          {/* Controls: Search + Categories */}
          <ScrollReveal>
            <div className="p-4 bg-[#131310] border border-[#23231F] rounded-sm flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Search Input */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-[#9B9991] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter skills by keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0B0B09] border border-[#23231F] rounded-sm pl-9 pr-8 py-2 text-xs text-[#F1EEE7] placeholder:text-[#9B9991]/60 focus:outline-none focus:border-[#C69A5B] transition-all font-mono"
                  aria-label="Filter skills"
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
                  aria-label="Skill categories"
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

          {/* Numbered Editorial Technical Index */}
          {groupedSkills.length > 0 ? (
            <div className="space-y-16">
              {groupedSkills.map((group, groupIdx) => {
                const indexNum = String(groupIdx + 1).padStart(2, '0');

                return (
                  <ScrollReveal key={group.category} className="space-y-6">
                    {/* Category Header Bar */}
                    <div className="flex items-baseline justify-between border-b border-[#23231F] pb-4">
                      <div className="flex items-baseline gap-4">
                        <span className="font-mono text-xs text-[#C69A5B] font-semibold">
                          {indexNum}
                        </span>
                        <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#F1EEE7] uppercase tracking-wide">
                          {group.category}
                        </h2>
                      </div>
                      <span className="font-mono text-xs text-[#9B9991]">
                        {group.items.length} {group.items.length === 1 ? 'ITEM' : 'ITEMS'}
                      </span>
                    </div>

                    {/* Skill Cards Index */}
                    <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {group.items.map((skill) => {
                        const hasProficiency = typeof skill.level === 'number' && skill.level > 0;

                        return (
                          <StaggerItem key={skill.id}>
                            <div className="p-5 bg-[#131310] border border-[#23231F] hover:border-[#C69A5B]/60 transition-all duration-300 rounded-sm flex flex-col justify-between h-full group">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  {skill.icon && skill.icon.startsWith('http') ? (
                                    <img
                                      src={skill.icon}
                                      alt={skill.name}
                                      className="w-5 h-5 object-contain filter grayscale group-hover:grayscale-0 transition-all"
                                    />
                                  ) : (
                                    <span className="font-mono text-[10px] text-[#C69A5B]">
                                      //
                                    </span>
                                  )}
                                  {hasProficiency && (
                                    <span className="text-[10px] font-mono text-[#C69A5B]">
                                      {skill.level}%
                                    </span>
                                  )}
                                </div>

                                <h3 className="font-serif text-lg text-[#F1EEE7] group-hover:text-[#C69A5B] transition-colors">
                                  {skill.name}
                                </h3>
                              </div>

                              {/* Minimal Proficiency Line */}
                              {hasProficiency && (
                                <div className="w-full h-[2px] bg-[#0B0B09] mt-4 overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, Math.max(0, skill.level))}%` }}
                                    transition={{
                                      duration: shouldReduceMotion ? 0.01 : 0.8,
                                      ease: 'easeOut',
                                    }}
                                    className="h-full bg-[#C69A5B]"
                                  />
                                </div>
                              )}
                            </div>
                          </StaggerItem>
                        );
                      })}
                    </StaggerContainer>
                  </ScrollReveal>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-[#9B9991] text-xs font-mono bg-[#131310] border border-[#23231F] rounded-sm space-y-2">
              <p className="text-[#F1EEE7] uppercase tracking-wider">No matching skills found.</p>
              <p className="text-[#9B9991]/70">Try adjusting your search query or selected category filter.</p>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          title="No skills published yet."
          description="Technical capabilities added in the Admin Dashboard will appear here."
          onAdminClick={() => onNavigate('/admin/skills')}
        />
      )}
    </PageTransition>
  );
};


