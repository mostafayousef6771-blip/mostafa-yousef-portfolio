import React from 'react';
import { ShieldCheck, ArrowUp } from 'lucide-react';
import { SocialLink, Profile } from '../../types/portfolio';

interface FooterProps {
  onNavigate: (path: string) => void;
  socialLinks: SocialLink[];
  profile: Profile | null;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, socialLinks, profile }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const enabledLinks = socialLinks.filter((s) => s.is_enabled);
  const displayName = profile?.full_name || 'Mostafa Yousef';
  const roleHeadline = profile?.headline || 'Data Analyst & Full-Stack Developer';

  return (
    <footer className="relative z-10 bg-[#0B0B09] border-t border-[#23231F] pt-16 pb-12 text-[#F1EEE7]">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[#23231F] pb-12">
          {/* Brand & Role */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#C69A5B] uppercase tracking-[0.2em] block">
              PORTFOLIO ARCHIVE
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-light text-[#F1EEE7]">
              {displayName}
            </h3>
            <p className="text-xs font-mono text-[#9B9991] uppercase tracking-widest">
              {roleHeadline}
            </p>
          </div>

          {/* Social Links */}
          {enabledLinks.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-mono text-[#9B9991]">
              {enabledLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#C69A5B] transition-colors uppercase tracking-wider py-1.5 min-h-[36px] flex items-center"
                >
                  {link.label || link.platform}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#9B9991]">
          <div>
            <span>© {new Date().getFullYear()} {displayName}. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="/admin"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 text-xs text-[#9B9991]/70 hover:text-[#C69A5B] transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#C69A5B]" />
              <span>Admin</span>
            </a>

            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 text-[#9B9991] hover:text-[#F1EEE7] transition-colors uppercase tracking-wider text-[11px]"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5 text-[#C69A5B]" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};


