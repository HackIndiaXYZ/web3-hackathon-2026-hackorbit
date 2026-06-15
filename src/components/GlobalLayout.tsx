'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function GlobalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Render navbar on pages that share the dashboard-style layout
  const showNavbar = pathname !== '/' && pathname !== '/login';

  return (
    <div className="flex flex-col flex-1 w-full">
      {showNavbar && (
        <div className="shrink-0 relative z-50">
          <Navbar />
        </div>
      )}
      <div className="flex-1 flex flex-col w-full relative">
        {children}
      </div>
    </div>
  );
}

