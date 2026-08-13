import React from 'react';
import { motion } from 'motion/react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glowColor?: 'amber' | 'neutral' | 'none' | 'blue' | 'purple' | 'cyan';
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  onClick,
  padding = 'md',
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4 sm:p-5',
    md: 'p-6 sm:p-8',
    lg: 'p-8 sm:p-10',
  }[padding];

  const baseClasses = `
    relative rounded-xl bg-[#131310]
    border border-[#23231f] text-[#F1EEE7]
    transition-all duration-300 ease-out
    ${paddingClasses}
    ${hoverEffect ? 'hover:border-[#C69A5B]/40 hover:bg-[#181814]' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  if (hoverEffect || onClick) {
    return (
      <motion.div
        whileHover={hoverEffect ? { y: -2 } : undefined}
        whileTap={onClick ? { scale: 0.99 } : undefined}
        onClick={onClick}
        className={baseClasses}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClasses}>
      {children}
    </div>
  );
};

