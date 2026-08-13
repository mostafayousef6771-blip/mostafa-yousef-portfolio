import React from 'react';
import { motion } from 'motion/react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  onClick,
  type = 'button',
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs rounded-md gap-1.5 font-medium uppercase tracking-wider',
    md: 'px-6 py-3 text-xs sm:text-sm rounded-md gap-2 font-medium tracking-wide',
    lg: 'px-8 py-4 text-sm sm:text-base rounded-md gap-2.5 font-medium tracking-wide',
  }[size];

  const variantClasses = {
    primary:
      'bg-[#F1EEE7] hover:bg-[#C69A5B] text-[#0B0B09] font-semibold transition-colors duration-300 shadow-sm',
    secondary:
      'bg-[#181814] hover:bg-[#22221C] text-[#F1EEE7] border border-[#2D2D26] hover:border-[#C69A5B]/40 transition-colors duration-300',
    outline:
      'bg-transparent text-[#F1EEE7] border border-[#2D2D26] hover:border-[#C69A5B] hover:text-[#C69A5B] transition-colors duration-300',
    ghost:
      'bg-transparent text-[#9B9991] hover:text-[#F1EEE7] transition-colors duration-200',
  }[variant];

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-[#C69A5B] disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${sizeClasses} ${variantClasses} ${className}`}
      type={type}
    >
      {isLoading ? (
        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
        </>
      )}
    </motion.button>
  );
};

