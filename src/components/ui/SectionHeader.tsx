import React from 'react';

interface SectionHeaderProps {
  badge?: string;
  title: string;
  highlightTitle?: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  title,
  highlightTitle,
  subtitle,
  align = 'left',
  className = '',
}) => {
  const isCenter = align === 'center';

  return (
    <div className={`mb-12 ${isCenter ? 'text-center mx-auto max-w-3xl' : 'text-left'} ${className}`}>
      {badge && (
        <div className={`inline-flex items-center gap-2 text-[#C69A5B] text-xs font-mono tracking-widest uppercase mb-3 ${isCenter ? 'mx-auto' : ''}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#C69A5B]" />
          {badge}
        </div>
      )}

      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light tracking-tight text-[#F1EEE7]">
        {title}{' '}
        {highlightTitle && (
          <span className="text-[#C69A5B] italic font-normal">
            {highlightTitle}
          </span>
        )}
      </h2>

      {subtitle && (
        <p className="mt-3 text-base sm:text-lg text-[#9B9991] leading-relaxed font-normal max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
};

