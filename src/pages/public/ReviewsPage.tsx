import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, LayoutGrid, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Review } from '../../types/portfolio';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageTransition } from '../../components/ui/PageTransition';
import { StaggerContainer, StaggerItem, ScrollReveal } from '../../components/ui/ScrollReveal';

interface ReviewsPageProps {
  reviews: Review[];
  onNavigate: (path: string) => void;
}

export const ReviewsPage: React.FC<ReviewsPageProps> = ({ reviews, onNavigate }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('carousel');
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const shouldReduceMotion = useReducedMotion();

  const publishedReviews = reviews.filter((r) => r.is_published);

  useEffect(() => {
    if (viewMode !== 'carousel' || publishedReviews.length <= 1) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev + 1) % publishedReviews.length);
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev - 1 + publishedReviews.length) % publishedReviews.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, publishedReviews.length]);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % publishedReviews.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + publishedReviews.length) % publishedReviews.length);
  };

  return (
    <PageTransition className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-12 space-y-12">
      {/* Editorial Header */}
      <div>
        <span className="text-xs font-mono text-[#C69A5B] tracking-widest uppercase block mb-3">
          TESTIMONIALS & ENDORSEMENTS
        </span>
        <h1 className="font-serif text-4xl sm:text-7xl font-light text-[#F1EEE7] mb-4 break-words">
          Client Reviews
        </h1>
        <p className="text-[#9B9991] text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
          Feedback and recommendations from engineering leaders, project stakeholders, and collaborators.
        </p>
      </div>

      {publishedReviews.length > 0 ? (
        <div className="space-y-10">
          {/* Controls: View Mode Toggle */}
          {publishedReviews.length > 1 && (
            <div className="flex items-center justify-between border-b border-[#23231F] pb-4">
              <span className="text-xs font-mono text-[#9B9991] uppercase tracking-wider">
                Total Verified Reviews: <span className="text-[#C69A5B] font-bold">{publishedReviews.length}</span>
              </span>

              <div className="flex items-center gap-1 p-1 bg-[#131310] border border-[#23231F]">
                <button
                  onClick={() => setViewMode('carousel')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                    viewMode === 'carousel'
                      ? 'bg-[#F1EEE7] text-[#0B0B09] font-bold'
                      : 'text-[#9B9991] hover:text-[#F1EEE7]'
                  }`}
                  aria-label="Carousel View"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Featured</span>
                </button>

                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-[#F1EEE7] text-[#0B0B09] font-bold'
                      : 'text-[#9B9991] hover:text-[#F1EEE7]'
                  }`}
                  aria-label="Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>
              </div>
            </div>
          )}

          {/* Carousel View */}
          {viewMode === 'carousel' && publishedReviews.length > 0 ? (
            <ScrollReveal>
              <div className="relative max-w-3xl mx-auto space-y-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={publishedReviews[activeIndex].id}
                    initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: shouldReduceMotion ? 0 : -20 }}
                    transition={{ duration: shouldReduceMotion ? 0.01 : 0.3 }}
                  >
                    <div className="p-10 bg-[#131310] border border-[#23231F] rounded-sm space-y-8">
                      {/* Rating */}
                      <div className="flex items-center gap-1 text-[#C69A5B]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < publishedReviews[activeIndex].rating
                                ? 'fill-[#C69A5B] text-[#C69A5B]'
                                : 'text-[#23231F]'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Review Text */}
                      <p className="font-serif text-2xl text-[#F1EEE7] font-light leading-relaxed italic">
                        "{publishedReviews[activeIndex].review_text}"
                      </p>

                      {/* Author Details */}
                      <div className="pt-6 border-t border-[#23231F] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#0B0B09] border border-[#23231F] text-[#C69A5B] font-mono font-bold flex items-center justify-center shrink-0 overflow-hidden">
                            {publishedReviews[activeIndex].client_photo ? (
                              <img
                                src={publishedReviews[activeIndex].client_photo}
                                alt={publishedReviews[activeIndex].client_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              publishedReviews[activeIndex].client_name.charAt(0)
                            )}
                          </div>
                          <div>
                            <h4 className="font-serif text-lg text-[#F1EEE7]">
                              {publishedReviews[activeIndex].client_name}
                            </h4>
                            <p className="text-xs font-mono text-[#C69A5B] uppercase tracking-wider mt-0.5">
                              {publishedReviews[activeIndex].position && publishedReviews[activeIndex].company
                                ? `${publishedReviews[activeIndex].position} at ${publishedReviews[activeIndex].company}`
                                : publishedReviews[activeIndex].company ||
                                  publishedReviews[activeIndex].position ||
                                  'Verified Partner'}
                            </p>
                          </div>
                        </div>

                        {publishedReviews[activeIndex].date && (
                          <span className="text-xs font-mono text-[#9B9991]">
                            {publishedReviews[activeIndex].date}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Carousel Controls */}
                {publishedReviews.length > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={prevSlide}
                        className="p-3 bg-[#131310] border border-[#23231F] text-[#F1EEE7] hover:border-[#C69A5B] transition-colors"
                        title="Previous review"
                        aria-label="Previous review"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <button
                        onClick={nextSlide}
                        className="p-3 bg-[#131310] border border-[#23231F] text-[#F1EEE7] hover:border-[#C69A5B] transition-colors"
                        title="Next review"
                        aria-label="Next review"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {publishedReviews.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveIndex(idx)}
                          className={`h-1 transition-all ${
                            idx === activeIndex ? 'w-8 bg-[#C69A5B]' : 'w-2 bg-[#23231F]'
                          }`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollReveal>
          ) : (
            /* Grid View */
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedReviews.map((review) => (
                <StaggerItem key={review.id}>
                  <div className="p-8 bg-[#131310] border border-[#23231F] hover:border-[#C69A5B]/50 transition-colors rounded-sm flex flex-col justify-between h-full space-y-6">
                    <div>
                      <div className="flex items-center gap-1 mb-4 text-[#C69A5B]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < review.rating ? 'fill-[#C69A5B] text-[#C69A5B]' : 'text-[#23231F]'
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-xs text-[#F1EEE7] leading-relaxed italic font-normal">
                        "{review.review_text}"
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#23231F] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#0B0B09] border border-[#23231F] text-[#C69A5B] font-mono text-xs font-bold flex items-center justify-center shrink-0 overflow-hidden">
                          {review.client_photo ? (
                            <img
                              src={review.client_photo}
                              alt={review.client_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            review.client_name.charAt(0)
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-serif text-[#F1EEE7]">{review.client_name}</h4>
                          <p className="text-[10px] font-mono text-[#9B9991] uppercase tracking-wider">
                            {review.position && review.company
                              ? `${review.position} at ${review.company}`
                              : review.company || review.position || 'Verified Client'}
                          </p>
                        </div>
                      </div>

                      {review.date && (
                        <span className="text-[10px] font-mono text-[#9B9991]">{review.date}</span>
                      )}
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      ) : (
        <EmptyState
          title="No testimonials published yet."
          description="Client reviews can be published in the Admin Dashboard."
          onAdminClick={() => onNavigate('/admin/reviews')}
        />
      )}
    </PageTransition>
  );
};

