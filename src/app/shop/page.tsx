'use client';

import React from 'react';
import ShopSandbox from '@/components/ShopSandbox';
import { PageContainer, Section } from '@/components/LayoutSystem';

export default function ShopPage() {
  return (
    <PageContainer lockViewport={true}>
      <main className="w-full px-4 lg:px-8 pt-6 pb-6 relative z-10 flex-1 min-h-0 flex flex-col gap-6 items-stretch lg:h-full lg:overflow-hidden">
        {/* Header Block using standardized Section component */}
        <Section 
          title="SharpFlow Store Sandbox"
          description="Simulate secure Web3 cryptographically signed purchase intents with robust fallback systems."
          headerActions={
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
              <span>Web3 Sandbox</span>
              <span>/</span>
              <span className="text-blue-400 font-bold">Checkout Shop</span>
            </div>
          }
          spacing="none"
          className="shrink-0"
        />

        <div className="flex-1 relative">
          <ShopSandbox />
        </div>
      </main>
    </PageContainer>
  );
}
