import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "LASUSTECH CBT",
  description: "Digital Exam Platform for LASUSTECH",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // No root theme provider: each layout opens a theme *scope* via
  // <RoleThemeProvider> (components/role-theme.tsx), so the class lands on a
  // wrapper element instead of <html>. Admin and student share the `site` scope;
  // the lecturer has its own. Public pages get neither and stay light.
  return (
    <html lang="en" suppressHydrationWarning className={`h-full antialiased ${ibmPlexSans.variable}`}>
      <body className="min-h-full flex flex-col transition-colors duration-300 font-sans">
        {children}
      </body>
    </html>
  );
}
