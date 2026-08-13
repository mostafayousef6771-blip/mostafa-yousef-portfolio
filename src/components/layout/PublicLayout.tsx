import React from 'react';
import { AnimatePresence } from 'motion/react';
import { GlowBackground } from '../ui/GlowBackground';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Profile, SocialLink } from '../../types/portfolio';

interface PublicLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  profile: Profile | null;
  socialLinks: SocialLink[];
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  children,
  currentPath,
  onNavigate,
  profile,
  socialLinks,
}) => {
  return (
    <div className="relative min-h-screen text-[#F1EEE7] font-sans bg-[#0B0B09] selection:bg-[#C69A5B] selection:text-[#0B0B09] antialiased overflow-x-hidden flex flex-col">
      <GlowBackground />
      <Navbar currentPath={currentPath} onNavigate={onNavigate} profile={profile} />

      <main className="relative z-10 flex-grow pt-24 sm:pt-28 pb-16">
        <AnimatePresence mode="wait">
          <div key={currentPath} className="w-full">
            {children}
          </div>
        </AnimatePresence>
      </main>

      <Footer onNavigate={onNavigate} socialLinks={socialLinks} profile={profile} />
    </div>
  );
};

