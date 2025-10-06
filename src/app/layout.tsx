import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { FeatureFlagsProvider } from "@/components/providers/feature-flags";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SequenceHUB - Premium LED Sequence Marketplace",
  description: "Discover and purchase high-quality LED sequences for your displays. Join our marketplace of creators and bring your visions to life.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          defaultTheme="light"
          storageKey="sequencehub-theme-v2"
        >
          <AuthSessionProvider>
            <FeatureFlagsProvider>
              {children}
            </FeatureFlagsProvider>
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
