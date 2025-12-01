// src\app\layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import ClientWrapper from '@/components/ClientWrapper';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Interview AI - Master Technical Interviews',
  description: 'Practice with AI-powered interview questions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} transition-colors duration-200`}>
          <ClientWrapper>
            {children}
          </ClientWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}
