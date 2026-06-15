'use client';

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import ShopSandbox from '@/components/ShopSandbox';
import { PageContainer, Section } from '@/components/LayoutSystem';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';

export default function ShopPage() {
  return (
    <PageContainer lockViewport={false}>
      <main className="w-full px-4 lg:px-8 pt-6 pb-6 relative z-10 flex flex-col gap-6 items-stretch flex-1 min-h-0">
        {/* Header Block using standardized Section component */}
        <Section 
          title="SharpFlow Store Sandbox"
          className="shrink-0"
        />

        <ShopSandbox 
          renderLayout={(leftPanel, rightPanel) => (
            <ResponsiveLayout 
              desktop={
                <div className="dual-layout-parent gap-6 lg:gap-8 w-full">
                  <div className="flex-1 min-w-0 dual-layout-panel">
                    {leftPanel}
                  </div>
                  <div className="flex-1 min-w-0 dual-layout-panel">
                    {rightPanel}
                  </div>
                </div>
              }
              mobile={
                <div className="flex flex-col gap-6 w-full h-auto">
                  <div className="flex flex-col min-w-0 w-full">
                    {leftPanel}
                  </div>
                  <div className="flex flex-col min-w-0 w-full">
                    {rightPanel}
                  </div>
                </div>
              }
            />
          )}
        />
      </main>
    </PageContainer>
  );
}
