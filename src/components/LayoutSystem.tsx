'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

// ==========================================
// 1. PAGECONTAINER COMPONENT
// ==========================================
interface PageContainerProps {
  children: React.ReactNode;
  lockViewport?: boolean;
  className?: string;
  subtleGrid?: boolean;
}

export function PageContainer({
  children,
  lockViewport = false,
  className = '',
  subtleGrid = true,
}: PageContainerProps) {
  
  // Viewport locking is now strictly controlled by layout wrappers (dual-layout-parent)

  return (
    <div 
      className={`flex-1 w-full flex flex-col relative bg-[#0A0A0B] text-white ${
        subtleGrid ? 'subtle-grid-bg' : ''
      } ${className}`}
    >
      {/* Background ambient radial glows */}
      <div 
        className="absolute top-20 left-10 w-[350px] h-[350px] rounded-full pointer-events-none z-0 opacity-15" 
        style={{ 
          filter: 'blur(130px)', 
          WebkitFilter: 'blur(130px)', 
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.22) 0%, rgba(99, 102, 241, 0.05) 70%, transparent 100%)' 
        }} 
      />
      <div 
        className="absolute bottom-20 right-10 w-[400px] h-[400px] rounded-full pointer-events-none z-0 opacity-15" 
        style={{ 
          filter: 'blur(140px)', 
          WebkitFilter: 'blur(140px)', 
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.20) 0%, rgba(236, 72, 153, 0.05) 75%, transparent 100%)' 
        }} 
      />
      
      {/* Page Content */}
      <div className="relative z-10 flex flex-col flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
}

// ==========================================
// 2. SECTION COMPONENT
// ==========================================
interface SectionProps {
  children?: React.ReactNode;
  title?: string;
  description?: string;
  headerActions?: React.ReactNode;
  className?: string;
  spacing?: 'none' | 'tight' | 'normal' | 'large';
}

export function Section({
  children,
  title,
  description,
  headerActions,
  className = '',
  spacing = 'normal',
}: SectionProps) {
  const spacingClasses = {
    none: 'space-y-0',
    tight: 'space-y-3',
    normal: 'space-y-4 lg:space-y-6',
    large: 'space-y-6 lg:space-y-8',
  };

  return (
    <section className={`${spacingClasses[spacing]} ${className}`}>
      {(title || description || headerActions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left border border-white/[0.06] bg-zinc-950/20 backdrop-blur-md rounded-3xl p-5 lg:p-6 shrink-0">
          <div className="space-y-1">
            {title && (
              <h2 className="text-lg font-extrabold text-white tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-zinc-400">
                {description}
              </p>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center gap-2 shrink-0">
              {headerActions}
            </div>
          )}
        </div>
      )}
      {children && (
        <div className="w-full">
          {children}
        </div>
      )}
    </section>
  );
}

// ==========================================
// 3. CARD COMPONENT
// ==========================================
interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'interactive' | 'highlight' | 'flat';
  hoverEffect?: boolean;
  padding?: 'none' | 'tight' | 'normal' | 'large';
}

export function Card({
  children,
  className = '',
  variant = 'default',
  hoverEffect = true,
  padding = 'normal',
}: CardProps) {
  
  const paddingClasses = {
    none: 'p-0',
    tight: 'p-3.5 sm:p-4',
    normal: 'p-5 lg:p-6',
    large: 'p-6 sm:p-8',
  };

  const variantClasses = {
    default: 'bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.5)]',
    interactive: 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12]',
    highlight: 'bg-gradient-to-b from-zinc-900/60 to-zinc-950/80 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
    flat: 'bg-white/[0.01] border border-white/[0.04] hover:border-white/[0.08]',
  };

  const motionProps = hoverEffect
    ? {
        whileHover: {
          y: -4,
          scale: 1.012,
          boxShadow: '0 20px 40px -15px rgba(59, 130, 246, 0.12), 0 0 25px -5px rgba(168, 85, 247, 0.08)',
          transition: { duration: 0.25, ease: 'easeOut' as any },
        },
      }
    : {};

  return (
    <motion.div
      {...motionProps}
      className={`
        relative overflow-hidden rounded-3xl transition-all duration-300
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${className}
      `}
    >
      {/* Decorative inner glow */}
      {variant !== 'flat' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 dark:to-white/5 pointer-events-none" />
      )}
      <div className="relative z-10 flex flex-col h-full w-full">{children}</div>
    </motion.div>
  );
}
