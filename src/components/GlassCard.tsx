'use client';

import React from 'react';
import { Card } from './LayoutSystem';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export default function GlassCard({
  children,
  className = '',
  hoverEffect = false,
}: GlassCardProps) {
  return (
    <Card 
      className={className} 
      hoverEffect={hoverEffect} 
      variant="default"
      padding="none"
    >
      {children}
    </Card>
  );
}
