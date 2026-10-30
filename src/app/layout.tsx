import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { RealtimeGate } from "@/components/realtime-gate";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Webnotes", template: "%s · Webnotes" },
  description: "A fast, private markdown notebook with beautiful editing and one-click sharing.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // paint under the notch; content pads back with env(safe-area-inset-*)
  interactiveWidget: "resizes-content", // keyboard shrinks the layout viewport on Android too
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <body>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <RealtimeGate>{children}</RealtimeGate>
            <Toaster position="bottom-right" richColors closeButton />
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
