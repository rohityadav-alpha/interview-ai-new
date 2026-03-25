// src/components/ClientWrapper.tsx
// Wraps all client-side page content: Navbar + Toaster with skeuomorphic dark theme.

'use client';

import { ThemeProvider } from '@/components/ThemeProvider';
import Navbar from '@/components/Navbar';
import { Toaster } from 'sonner';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Navbar />
      {children}
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            // Match skeuomorphic panel aesthetic
            background:
              'linear-gradient(170deg, #363636 0%, #2c2c2c 60%, #252525 100%)',
            border: '1px solid #1e1e1e',
            borderTop: '1px solid #484848',
            borderRadius: '5px',
            boxShadow:
              '6px 6px 20px rgba(0,0,0,0.8), -2px -2px 8px rgba(255,255,255,0.04)',
            fontFamily: 'Roboto Condensed, sans-serif',
            fontSize: '0.85rem',
            letterSpacing: '0.03em',
            color: '#c0c0c0',
          },
          classNames: {
            title: 'font-[Oswald] tracking-[0.1em] uppercase text-[0.78rem] text-[#d0d0d0]',
            description: 'font-[Roboto_Condensed] text-[0.78rem] text-[#888]',
          },
        }}
      />
    </ThemeProvider>
  );
}
