import React from 'react';

interface ResponsiveLayoutProps {
  desktop: React.ReactNode;
  mobile: React.ReactNode;
}

export function ResponsiveLayout({ desktop, mobile }: ResponsiveLayoutProps) {
  return (
    <>
      <div className="desktop-layout w-full h-full min-h-0 flex-1 relative">
        {desktop}
      </div>
      <div className="mobile-layout w-full h-auto flex-1 relative">
        {mobile}
      </div>
    </>
  );
}
