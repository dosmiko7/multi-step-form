import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { Toaster } from '@/components/ui/sonner';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin', 'latin-ext'],
});

export const metadata: Metadata = {
  title: 'Mikołaj Oberda — Katalog produktów',
  description: 'Wieloetapowy formularz dodawania produktu.',
};

/** Lets the dialog shrink with the on-screen keyboard instead of hiding its footer. */
export const viewport: Viewport = {
  interactiveWidget: 'resizes-content',
  themeColor: '#fafafa',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pl" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <NuqsAdapter>{children}</NuqsAdapter>
        {/* No theme provider mounts, so sonner's "system" default would follow the OS. */}
        <Toaster theme="light" position="bottom-right" />
      </body>
    </html>
  );
}
