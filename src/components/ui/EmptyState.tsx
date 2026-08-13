import React from 'react';
import { LucideIcon, FolderOpen, ArrowUpRight } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  adminLink?: string;
  adminActionText?: string;
  onAdminClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderOpen,
  title,
  description,
  adminLink = '/admin',
  adminActionText = 'Admin Portal',
  onAdminClick,
}) => {
  return (
    <div className="relative p-10 sm:p-14 bg-[#131310] border border-[#23231F] text-center flex flex-col items-center justify-center max-w-xl mx-auto my-12 rounded-sm space-y-4">
      <div className="w-12 h-12 bg-[#0B0B09] border border-[#23231F] text-[#C69A5B] flex items-center justify-center">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>

      <h3 className="font-serif text-2xl text-[#F1EEE7] font-light">
        {title}
      </h3>

      <p className="text-[#9B9991] text-xs sm:text-sm font-mono max-w-md leading-relaxed">
        {description}
      </p>

      {adminLink && (
        <a
          href={adminLink}
          onClick={(e) => {
            if (onAdminClick) {
              e.preventDefault();
              onAdminClick();
            }
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B0B09] border border-[#23231F] hover:border-[#C69A5B] text-xs font-mono text-[#9B9991] hover:text-[#F1EEE7] uppercase tracking-wider transition-colors mt-2"
        >
          <span>{adminActionText}</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#C69A5B]" />
        </a>
      )}
    </div>
  );
};

