import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Menu, X, ShieldCheck } from 'lucide-react';
import { Profile } from '../../types/portfolio';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  profile: Profile | null;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, profile }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const primaryCenterLinks = [
    { name: 'Work', path: '/projects' },
    { name: 'About', path: '/about' },
    { name: 'Experience', path: '/experience' },
    { name: 'Education', path: '/education' },
    { name: 'Skills', path: '/skills' },
    { name: 'Certificates', path: '/certificates' },
    { name: 'Reviews', path: '/reviews' },
  ];

  const primaryRightLinks = [
    { name: 'Contact', path: '/contact' },
    { name: 'Resume', path: '/resume' },
  ];

  const allMobileLinks = [
    { name: 'Home', path: '/' },
    { name: 'Work', path: '/projects' },
    { name: 'About', path: '/about' },
    { name: 'Skills', path: '/skills' },
    { name: 'Certificates', path: '/certificates' },
    { name: 'Experience', path: '/experience' },
    { name: 'Education', path: '/education' },
    { name: 'Resume', path: '/resume' },
    { name: 'Reviews', path: '/reviews' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleLinkClick = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(path);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayName = profile?.full_name ? profile.full_name.toUpperCase() : 'MOSTAFA Y.';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#0B0B09]/90 backdrop-blur-md border-b border-[#23231F]/60 py-4'
          : 'bg-transparent py-6 sm:py-8'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        <div className="flex items-center justify-between">
          {/* LEFT: Brand Name */}
          <a
            href="/"
            onClick={(e) => handleLinkClick('/', e)}
            className="group flex items-center gap-2"
          >
            <span className="font-serif text-xl sm:text-2xl tracking-wider font-light text-[#F1EEE7] group-hover:text-[#C69A5B] transition-colors">
              {displayName}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C69A5B]" />
          </a>

          {/* CENTER: Work, About, Experience, Skills */}
          <nav className="hidden lg:flex items-center gap-8">
            {primaryCenterLinks.map((link) => {
              const isActive =
                currentPath === link.path ||
                (link.path !== '/' && currentPath.startsWith(link.path));

              return (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={(e) => handleLinkClick(link.path, e)}
                  className={`relative py-1 text-xs tracking-widest uppercase transition-colors duration-300 ${
                    isActive ? 'text-[#F1EEE7] font-medium' : 'text-[#9B9991] hover:text-[#F1EEE7]'
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-dot"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C69A5B]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* RIGHT: Contact, Resume + Admin */}
          <div className="hidden lg:flex items-center gap-8">
            {primaryRightLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={(e) => handleLinkClick(link.path, e)}
                  className={`relative py-1 text-xs tracking-widest uppercase transition-colors duration-300 ${
                    isActive ? 'text-[#F1EEE7] font-medium' : 'text-[#9B9991] hover:text-[#F1EEE7]'
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C69A5B]" />
                  )}
                </a>
              );
            })}

            <a
              href="/admin"
              onClick={(e) => handleLinkClick('/admin', e)}
              className="text-[#9B9991] hover:text-[#C69A5B] transition-colors p-1"
              title="Admin Portal"
            >
              <ShieldCheck className="w-4 h-4" />
            </a>
          </div>

          {/* MOBILE TOGGLE */}
          <div className="flex lg:hidden items-center gap-3">
            <a
              href="/admin"
              onClick={(e) => handleLinkClick('/admin', e)}
              className="text-[#9B9991] hover:text-[#C69A5B] p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Admin Portal"
            >
              <ShieldCheck className="w-5 h-5" />
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[#F1EEE7] p-2 min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE OVERLAY MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.2 }}
            className="fixed inset-0 top-[64px] sm:top-[72px] bg-[#0B0B09] z-40 px-6 sm:px-10 py-8 flex flex-col justify-between overflow-y-auto border-t border-[#23231F]"
          >
            <div className="flex flex-col gap-6">
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#C69A5B] uppercase">
                00 / NAVIGATION INDEX
              </span>
              <nav className="flex flex-col gap-1">
                {allMobileLinks.map((link) => {
                  const isActive = currentPath === link.path;
                  return (
                    <a
                      key={link.path}
                      href={link.path}
                      onClick={(e) => handleLinkClick(link.path, e)}
                      className={`font-serif text-2xl sm:text-3xl tracking-wide py-2 min-h-[44px] flex items-center transition-colors ${
                        isActive ? 'text-[#C69A5B] italic font-normal' : 'text-[#F1EEE7] hover:text-[#C69A5B]'
                      }`}
                    >
                      {link.name}
                    </a>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 mt-8 border-t border-[#23231F] flex items-center justify-between text-xs font-mono text-[#9B9991]">
              <span>© {new Date().getFullYear()} {displayName}</span>
              <a
                href="/admin"
                onClick={(e) => handleLinkClick('/admin', e)}
                className="text-[#C69A5B] hover:underline uppercase tracking-wider text-[11px]"
              >
                ADMIN ACCESS
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

