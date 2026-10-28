"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export interface ErrorPageLayoutProps {
  code?: string;
  title: string;
  description: string;
  badge?: React.ReactNode;
  primaryAction: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
  };
  illustrationSrc: string;
  illustrationAlt: string;
}

export function ErrorPageLayout({
  code,
  title,
  description,
  badge,
  primaryAction,
  secondaryAction,
  illustrationSrc,
  illustrationAlt,
}: ErrorPageLayoutProps) {
  return (
    <div
      className={`${inter.className} min-h-screen w-full bg-[#040b1e] text-white flex flex-col justify-between px-6 py-6 sm:px-10 lg:px-16 selection:bg-blue-600 selection:text-white`}
    >
      {/* 1. TOP HEADER (Identical to reference mockup) */}
      <header className="flex items-center justify-between w-full max-w-7xl mx-auto py-2">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 shrink-0">
            <Image
              src="/lasustech-logo.png"
              alt="LASUSTECH Logo"
              width={40}
              height={40}
              priority
              className="object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-white text-[15px] sm:text-[16px] tracking-wider uppercase leading-none group-hover:text-blue-300 transition-colors">
              LASUSTECH
            </span>
            <span className="text-[10px] font-semibold text-blue-300 tracking-widest uppercase leading-none mt-1">
              CBT EXAMINATION PORTAL
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav aria-label="Quick links" className="flex items-center gap-3 text-xs font-semibold text-slate-300">
          <Link
            href="/login"
            className="hover:text-white transition-colors tracking-wider"
          >
            EXAMS
          </Link>
          <span className="text-slate-600" aria-hidden="true">|</span>
          <Link
            href="/support"
            className="hover:text-white transition-colors tracking-wider"
          >
            SUPPORT
          </Link>
        </nav>
      </header>

      {/* 2. MAIN 2-COLUMN SECTION (Left Content, Right 3D Visual) */}
      <main className="w-full max-w-7xl mx-auto my-auto py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Heading, Description & Action Buttons */}
        <div className="lg:col-span-6 xl:col-span-6 space-y-5 text-left order-2 lg:order-1">
          {code && (
            <div className="text-6xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight leading-none drop-shadow-sm">
              {code}
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {title}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg font-medium">
            {description}
          </p>

          {badge && <div className="pt-1">{badge}</div>}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            {primaryAction.href ? (
              <Link
                href={primaryAction.href}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all cursor-pointer"
              >
                {primaryAction.icon}
                <span>{primaryAction.label}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={primaryAction.onClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all cursor-pointer"
              >
                {primaryAction.icon}
                <span>{primaryAction.label}</span>
              </button>
            )}

            {secondaryAction && (
              secondaryAction.href ? (
                <Link
                  href={secondaryAction.href}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#091533] hover:bg-[#0f214f] text-slate-200 border border-slate-700/80 hover:border-slate-500 font-semibold text-sm transition-all cursor-pointer"
                >
                  {secondaryAction.icon}
                  <span>{secondaryAction.label}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={secondaryAction.onClick}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#091533] hover:bg-[#0f214f] text-slate-200 border border-slate-700/80 hover:border-slate-500 font-semibold text-sm transition-all cursor-pointer"
                >
                  {secondaryAction.icon}
                  <span>{secondaryAction.label}</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Right Column: 3D High-Tech Graphic Mockup */}
        <div className="lg:col-span-6 xl:col-span-6 flex items-center justify-center order-1 lg:order-2">
          <div className="relative w-full max-w-[480px] aspect-[4/3] rounded-2xl overflow-hidden border border-[#1e3b7a]/80 bg-[#06122d] shadow-2xl flex items-center justify-center p-3 sm:p-5 group">
            <Image
              src={illustrationSrc}
              alt={illustrationAlt}
              fill
              className="object-contain p-2 transform group-hover:scale-102 transition-transform duration-300"
              priority
            />
          </div>
        </div>
      </main>

      {/* 3. BOTTOM FOOTER (Identical to reference mockup) */}
      <footer className="w-full max-w-7xl mx-auto py-3 text-center border-t border-slate-900/80">
        <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase">
          LASUSTECH CBT &bull; EXCELLENCE IN ASSESSMENT
        </p>
      </footer>
    </div>
  );
}
