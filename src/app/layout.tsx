
import './globals.css';
import type { Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { NightModeSync } from '@/components/layout/NightModeSync';

export type Database = any;


export const viewport: Viewport = {
  themeColor: '#162548',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col font-sans">
        <NightModeSync />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster position="bottom-center" toastOptions={{ duration: 2500 }} />
      </body>
    </html>
  );
}
