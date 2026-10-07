import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

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
  return (
    <html lang="en" suppressHydrationWarning className={`h-full antialiased ${ibmPlexSans.variable}`}>
      <body className="min-h-full flex flex-col transition-colors duration-300 font-sans">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light" disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
