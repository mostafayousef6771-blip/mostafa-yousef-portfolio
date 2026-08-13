import React from 'react';
import { Compass, Home, FolderGit2, Mail, ArrowLeft } from 'lucide-react';
import { PageTransition } from '../../components/ui/PageTransition';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { motion, useReducedMotion } from 'motion/react';

interface NotFoundPageProps {
  currentPath?: string;
  onNavigate: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ currentPath, onNavigate }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <PageTransition className="max-w-3xl mx-auto px-4 py-12 sm:py-20 text-center space-y-8">
      <GlassCard padding="lg" hoverEffect={false} className="relative overflow-hidden space-y-6">
        {/* Decorative ambient background glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Animated Icon Container */}
        <motion.div
          animate={shouldReduceMotion ? {} : { rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="relative z-10 w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-purple-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/10"
        >
          <Compass className="w-10 h-10 stroke-[1.5]" />
        </motion.div>

        {/* Error Code & Heading */}
        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
            <span>404 ROUTE ERROR</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Page Not Found
          </h1>

          <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            The route{' '}
            {currentPath ? (
              <span className="font-mono text-blue-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                {currentPath}
              </span>
            ) : (
              'you requested'
            )}{' '}
            does not exist or may have been moved to another location.
          </p>
        </div>

        {/* Quick Navigation CTAs */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-3 relative z-10">
          <Button
            variant="primary"
            size="md"
            icon={<Home className="w-4 h-4" />}
            onClick={() => onNavigate('/')}
          >
            Back to Home
          </Button>

          <Button
            variant="secondary"
            size="md"
            icon={<FolderGit2 className="w-4 h-4" />}
            onClick={() => onNavigate('/projects')}
          >
            Explore Projects
          </Button>

          <Button
            variant="ghost"
            size="md"
            icon={<Mail className="w-4 h-4" />}
            onClick={() => onNavigate('/contact')}
          >
            Contact
          </Button>
        </div>
      </GlassCard>
    </PageTransition>
  );
};
