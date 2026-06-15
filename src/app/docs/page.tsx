'use client';

import React from 'react';
import DocsViewer from '@/components/DocsViewer';
import { PageContainer } from '@/components/LayoutSystem';

export default function Docs() {
  return (
    <PageContainer lockViewport={true}>
      {/* Compact page header */}
      <div className="shrink-0 px-4 lg:px-8 py-3 border-b border-white/[0.06] relative z-10 bg-zinc-950/80 backdrop-blur-sm">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
          API Reference
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Learn how to integrate the SharpFlow REST endpoints and client SDKs into your product stack.
        </p>
      </div>

      {/* Dual-pane docs viewer — fills ALL remaining height, NEVER overflows */}
      <div
        className="relative z-10 bg-white/[0.015] backdrop-blur-xl flex flex-col h-auto overflow-visible md:flex-1 md:min-h-0 md:overflow-hidden"
      >
        <DocsViewer />
      </div>
    </PageContainer>
  );
}
