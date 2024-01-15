import { cn } from '@udecode/cn';
import { Toaster } from "@/components/ui/sonner"

import { fontSans } from '@/lib/fonts';
import { TooltipProvider } from '@/components/plate-ui/tooltip';
import { ThemeProvider } from '@/components/site/theme-provider';

import '@/styles/globals.css';

import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: {
    default: "Webnotes",
    template: `%s - Webnotes`,
  },
  description: "Webnotes is a note-taking app for the web.",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body
          className={cn(
            'min-h-screen bg-background font-sans antialiased',
            '[&_.slate-selected]:!bg-primary/20 [&_.slate-selection-area]:border [&_.slate-selection-area]:border-primary [&_.slate-selection-area]:bg-primary/10',
            fontSans.variable
          )}
        >
          <ThemeProvider attribute="class" defaultTheme="light">
            <Toaster />
            <TooltipProvider
              disableHoverableContent
              delayDuration={500}
              skipDelayDuration={0}
            >
              <div className="relative flex min-h-screen flex-col">
                <div className="flex-1">
                  {children}
                </div>
              </div>
            </TooltipProvider>
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
