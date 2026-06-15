'use client';

import React from 'react';
import DocsViewer from '@/components/DocsViewer';
import { PageContainer } from '@/components/LayoutSystem';

import { ResponsiveLayout } from '@/components/ResponsiveLayout';

export default function Docs() {
  return (
    <PageContainer lockViewport={false}>
      {/* Compact page header */}
      <div className="shrink-0 px-4 lg:px-8 py-3 border-b border-white/[0.06] relative z-10 bg-zinc-950/80 backdrop-blur-sm">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
          API Reference
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Learn how to integrate the SharpFlow REST endpoints and client SDKs into your product stack.
        </p>
      </div>

      <DocsViewer 
        renderLayout={(leftPanel, rightPanel, mobileNav) => (
          <ResponsiveLayout 
            desktop={
              <div className="dual-layout-parent w-full">
                <div className="flex-col w-52 xl:w-60 shrink-0 border-r border-white/[0.06] dual-layout-panel">
                  {leftPanel}
                </div>
                <div className="dual-layout-panel min-w-0 flex-1">
                  {rightPanel}
                </div>
              </div>
            }
            mobile={
              <div className="flex flex-col w-full h-auto">
                {mobileNav}
                <div className="flex flex-col w-full">
                  {rightPanel}
                </div>
              </div>
            }
          />
        )}
      />
    </PageContainer>
  );
}
