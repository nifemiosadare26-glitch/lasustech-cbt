import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { SystemWarmup } from "@/components/system-warmup";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1220" },
  ],
};

export const metadata: Metadata = {
  title: "LASUSTECH CBT",
  description: "Digital Exam Platform for LASUSTECH",
  formatDetection: {
    telephone: false,
    date: false,
    email: false,
    address: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LASUSTECH CBT",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // No root theme provider: each layout opens a theme *scope* via
  // <RoleThemeProvider> (components/role-theme.tsx), so the class lands on a
  // wrapper element instead of <html>. Admin and student share the `site` scope;
  // the lecturer has its own. Public pages get neither and stay light.
  return (
    <html lang="en" suppressHydrationWarning className={`h-full antialiased ${ibmPlexSans.variable}`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col transition-colors duration-300 font-sans">
        <SystemWarmup />
        {children}
      </body>
    </html>
  );
}
