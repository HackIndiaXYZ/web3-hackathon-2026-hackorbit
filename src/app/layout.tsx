import type { Metadata } from "next";
import { Toaster } from 'react-hot-toast';
import Providers from "@/components/Providers";
import Spotlight from "@/components/Spotlight";
import CommandMenu from "@/components/CommandMenu";
import Chatbot from "@/components/Chatbot";
import VisualUniverse from "@/components/VisualUniverse";
import GuidedTour from "@/components/GuidedTour";
import ProductShowcase from "@/components/ProductShowcase";
import "./globals.css";

import GlobalLayout from "@/components/GlobalLayout";

export const metadata: Metadata = {
  title: "SharpFlow AI | On-Chain Developer Rewards Infrastructure",
  description: "Seamlessly integrate Sharp tokens into your applications using our developer APIs and SDKs. Powered by Polygon.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased dark" data-scroll-behavior="smooth">
      <body className="min-h-screen flex flex-col font-sans bg-[#0A0A0B] text-white">
        <Providers>
          <div className="noise-overlay" />
          <Spotlight />
          <VisualUniverse />
          <CommandMenu />
          <GlobalLayout>
            {children}
          </GlobalLayout>
          <Chatbot />
          <GuidedTour />
          <ProductShowcase />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#18181b',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                fontSize: '13px',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
