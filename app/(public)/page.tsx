"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { ElementType } from "react";

import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MonitorSmartphone,
  Wifi,
  BookOpen,
  BarChart3,
  UserRound,
  ClipboardCheck,
  Headphones,
  Menu,
  X,
  Clock3,
  CalendarDays,
  FileText,
  LockKeyhole,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";

/* =========================================================
   HERO SLIDES
========================================================= */

const heroSlides = [
  {
    eyebrow: "DIGITAL ASSESSMENT",
    title: "Smarter Exams.",
    highlight: "Brighter Futures.",
    description:
      "A secure computer-based examination platform built to make assessment simpler, more reliable, and easier to manage.",
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=2200&q=85",
  },
  {
    eyebrow: "EXAMINATION INTEGRITY",
    title: "Every Exam.",
    highlight: "Handled with Confidence.",
    description:
      "Support accountable examinations with controlled access, reliable monitoring, and traceable submission records.",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=2200&q=85",
  },
  {
    eyebrow: "STUDENT EXPERIENCE",
    title: "Your Next Step.",
    highlight: "Starts Here.",
    description:
      "Check your examination schedule, review instructions, and access your CBT examination from one place.",
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=2200&q=85",
  },
];

/* =========================================================
   FEATURES
========================================================= */

const features = [
  {
    icon: ShieldCheck,
    title: "Examination Integrity",
    description:
      "Support accountable examinations with secure access, focus-event monitoring, and detailed audit records.",
    color: "bg-blue-50 text-blue-700",
  },
  {
    icon: Wifi,
    title: "Reliable Exam Delivery",
    description:
      "Protect examination progress with answer caching, synchronization, and connection recovery.",
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    icon: BookOpen,
    title: "Exam Preparation",
    description:
      "Review examination instructions, understand requirements, and prepare confidently before you begin.",
    color: "bg-violet-50 text-violet-700",
  },
  {
    icon: BarChart3,
    title: "Results & Analytics",
    description:
      "Support structured result processing, performance reports, and academic analysis.",
    color: "bg-amber-50 text-amber-700",
  },
  {
    icon: MonitorSmartphone,
    title: "Unified Access",
    description:
      "Connect students, lecturers, invigilators, and examination officers through one platform.",
    color: "bg-cyan-50 text-cyan-700",
  },
  {
    icon: Headphones,
    title: "Support & Guidance",
    description:
      "Find examination guidance and access technical support when you need assistance.",
    color: "bg-rose-50 text-rose-700",
  },
];

/* =========================================================
   HOW IT WORKS
========================================================= */

const steps = [
  {
    number: "01",
    icon: UserRound,
    title: "Sign In",
    description:
      "Access the examination portal using your authorized university credentials.",
  },
  {
    number: "02",
    icon: ClipboardCheck,
    title: "Check Your Exam",
    description:
      "Review your available examination, timetable, instructions, and requirements.",
  },
  {
    number: "03",
    icon: Clock3,
    title: "Take Your Exam",
    description:
      "Read the instructions, answer each question, and manage your allocated examination time.",
  },
  {
    number: "04",
    icon: CheckCircle2,
    title: "Submit",
    description:
      "Review your answers and securely submit your examination when you are finished.",
  },
];

/* =========================================================
   QUICK ACCESS
========================================================= */

const quickAccess = [
  {
    icon: CalendarDays,
    title: "Exam Schedules",
    description: "View your examination timetable.",
    href: "/login",
  },
  {
    icon: FileText,
    title: "Exam Instructions",
    description: "Review examination guidelines.",
    href: "/login",
  },
  {
    icon: Headphones,
    title: "Technical Support",
    description: "Get help with portal access.",
    href: "/reset",
  },
];

/* =========================================================
   MAIN PAGE
========================================================= */

export default function LandingPage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  /*
   * Automatically rotate the hero.
   * The carousel pauses when the user interacts with it.
   */
  useEffect(() => {
    if (isPaused) return;

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 6500);

    return () => window.clearInterval(interval);
  }, [isPaused]);

  /*
   * Close mobile navigation when screen becomes desktop-sized.
   */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const slide = heroSlides[activeSlide];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <nav
          className="mx-auto flex h-[64px] max-w-7xl items-center justify-between px-4 sm:px-6"
          aria-label="Main navigation"
        >
          {/* BRAND */}
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-2.5 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-blue-950 shadow-sm">
              <Image
                src="/lasustech-logo.png"
                alt="Lagos State University of Science and Technology"
                width={36}
                height={36}
                className="h-full w-full object-cover p-1"
                priority
              />
            </div>

            <div className="min-w-0">
              <p className="font-heading max-w-[190px] text-[11px] font-extrabold leading-tight tracking-tight text-blue-950 sm:max-w-none sm:text-sm">
                Lagos State University of Science and Technology
              </p>

              <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:text-[9px]">
                CBT Examination Portal
              </p>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden items-center gap-7 md:flex">
            <a
              href="#home"
              className="rounded-sm text-sm font-semibold text-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4"
            >
              Home
            </a>

            <a
              href="#features"
              className="rounded-sm text-sm font-medium text-slate-600 transition hover:text-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="rounded-sm text-sm font-medium text-slate-600 transition hover:text-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4"
            >
              How It Works
            </a>

            <a
              href="#support"
              className="rounded-sm text-sm font-medium text-slate-600 transition hover:text-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4"
            >
              Support
            </a>
          </div>

          {/* DESKTOP ACTIONS */}
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/login"
              className="inline-flex h-9 items-center rounded-lg border border-blue-200 bg-white px-3.5 text-xs font-semibold text-blue-900 transition hover:border-blue-300 hover:bg-blue-50"
            >
              Staff Portal
            </Link>

            <Link
              href="/login"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-700 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-blue-800"
            >
              Student Login
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-lg border border-slate-200 p-2 text-slate-800 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 md:hidden"
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </nav>

        {/* MOBILE NAVIGATION */}
        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-4 shadow-lg md:hidden">
            <div className="mx-auto max-w-7xl space-y-1">
              <MobileNavLink
                href="#home"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </MobileNavLink>

              <MobileNavLink
                href="#features"
                onClick={() => setMenuOpen(false)}
              >
                Features
              </MobileNavLink>

              <MobileNavLink
                href="#how-it-works"
                onClick={() => setMenuOpen(false)}
              >
                How It Works
              </MobileNavLink>

              <MobileNavLink
                href="#support"
                onClick={() => setMenuOpen(false)}
              >
                Support
              </MobileNavLink>

              <div className="grid grid-cols-2 gap-2 pt-3">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg border border-blue-200 px-3 py-2.5 text-center text-xs font-bold text-blue-900 transition hover:bg-blue-50"
                >
                  Staff Portal
                </Link>

                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg bg-blue-700 px-3 py-2.5 text-center text-xs font-bold text-white transition hover:bg-blue-800"
                >
                  Student Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* =====================================================
            HERO
        ===================================================== */}

        <section
          id="home"
          className="relative isolate min-h-[540px] overflow-hidden bg-blue-950 sm:min-h-[570px] lg:min-h-[590px]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          {/* BACKGROUND IMAGES */}
          {heroSlides.map((item, index) => (
            <div
              key={item.eyebrow}
              aria-hidden="true"
              className={`absolute inset-0 -z-20 bg-cover bg-center transition-opacity duration-1000 ${
                activeSlide === index ? "opacity-100" : "opacity-0"
              }`}
              style={{
                backgroundImage: `url("${item.image}")`,
              }}
            />
          ))}

          {/* LEFT-TO-RIGHT DARK GRADIENT */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#04152f] via-[#071c38]/90 to-[#071c38]/30" />

          {/* BOTTOM GRADIENT */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#04152f]/90 via-transparent to-[#04152f]/10" />

          {/* CONTENT */}
          <div className="mx-auto flex min-h-[540px] max-w-7xl flex-col justify-center px-4 py-14 sm:min-h-[570px] sm:px-6 lg:min-h-[590px]">
            <div
              key={activeSlide}
              className="max-w-3xl animate-hero-enter"
            >
              {/* EYEBROW */}
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-100 backdrop-blur-md sm:text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                {slide.eyebrow}
              </div>

              {/* HEADING */}
              <h1 className="font-heading max-w-3xl text-4xl font-black leading-[1.05] tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">
                {slide.title}
                <br />
                <span className="bg-gradient-to-r from-sky-300 via-blue-300 to-white bg-clip-text text-transparent">
                  {slide.highlight}
                </span>
              </h1>

              {/* DESCRIPTION */}
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                {slide.description}
              </p>

              {/* ACTIONS */}
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 sm:w-auto"
                >
                  Access Examination Portal
                  <ArrowRight size={17} />
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-white/30 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20 hover:text-white sm:w-auto"
                >
                  How It Works
                </a>
              </div>

              {/* TRUST POINTS */}
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-white/90">
                <span className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-sky-300" />
                  Secure examination access
                </span>

                <span className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-sky-300" />
                  Reliable exam delivery
                </span>
              </div>
            </div>

            {/* SLIDE CONTROLS */}
            <div className="mt-12 flex items-center justify-between border-t border-white/15 pt-5">
              <span className="text-xs font-medium text-white/60">
                Lagos State University of Science and Technology
              </span>

              <div className="flex items-center gap-2.5">
                {heroSlides.map((item, index) => (
                  <button
                    key={item.eyebrow}
                    type="button"
                    aria-label={`Show ${item.eyebrow.toLowerCase()} slide`}
                    aria-current={activeSlide === index ? "true" : undefined}
                    onClick={() => setActiveSlide(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-950 ${
                      activeSlide === index
                        ? "w-8 bg-sky-300"
                        : "w-3 bg-white/40 hover:bg-white/80"
                    }`}
                  />
                ))}

                <span className="ml-1 text-[10px] font-semibold text-white/75 sm:text-xs">
                  {String(activeSlide + 1).padStart(2, "0")}/03
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            QUICK ACCESS
        ===================================================== */}

        <section className="relative z-10 -mt-1 px-4 pb-2 sm:px-6">
          <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-3">
            {quickAccess.map((item) => (
              <QuickAccess
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.description}
                href={item.href}
              />
            ))}
          </div>
        </section>

        {/* =====================================================
            FEATURES
        ===================================================== */}

        <section
          id="features"
          className="py-20 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-600">
                  Everything you need
                </p>

                <h2 className="font-heading mt-3 text-3xl font-extrabold tracking-[-0.025em] text-blue-950 sm:text-4xl lg:text-5xl">
                  Built for better examinations.
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                  A unified examination experience designed around secure
                  access, reliable delivery, clear guidance, and efficient
                  academic workflows.
                </p>
              </div>

              <a
                href="#how-it-works"
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-blue-700 transition hover:text-blue-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4"
              >
                See how it works
                <ArrowRight size={16} />
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <FeatureCard
                    key={feature.title}
                    icon={Icon}
                    title={feature.title}
                    desc={feature.description}
                    color={feature.color}
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* =====================================================
            HOW IT WORKS
        ===================================================== */}

        <section
          id="how-it-works"
          className="border-y border-slate-200 bg-white py-20 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-600">
                Your examination journey
              </p>

              <h2 className="font-heading mt-3 text-3xl font-extrabold tracking-[-0.025em] text-blue-950 sm:text-4xl lg:text-5xl">
                Four simple steps.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                From signing in to submitting your answers, the examination
                process is designed to be clear and straightforward.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => {
                const Icon = step.icon;

                return (
                  <StepCard
                    key={step.number}
                    number={step.number}
                    icon={Icon}
                    title={step.title}
                    description={step.description}
                  />
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-950 px-7 text-sm font-bold text-white transition hover:bg-blue-800"
              >
                Continue to Login
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>

        {/* =====================================================
            SECURITY / RELIABILITY
        ===================================================== */}

        <section className="py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-3">
            <InfoPanel
              icon={LockKeyhole}
              title="Secure access"
              description="Examination access is restricted to authorized users and controlled through the portal."
            />

            <InfoPanel
              icon={RefreshCw}
              title="Progress protection"
              description="Your examination experience is designed to remain reliable even when connectivity becomes unstable."
            />

            <InfoPanel
              icon={CheckCircle2}
              title="Accountable submission"
              description="Examination activity and submissions can be tracked through structured records."
            />
          </div>
        </section>

        {/* =====================================================
            SUPPORT
        ===================================================== */}

        <section
          id="support"
          className="px-4 pb-20 sm:px-6 sm:pb-24"
        >
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 rounded-2xl bg-blue-950 p-7 text-white shadow-xl shadow-blue-950/20 sm:p-10 lg:flex-row lg:items-center lg:p-12">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-sky-300">
                Need assistance?
              </p>

              <h2 className="font-heading mt-3 text-3xl font-extrabold tracking-[-0.025em] sm:text-4xl">
                Get ready for your next examination.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100 sm:text-base">
                Review your examination instructions and use the designated
                support channel if you experience technical difficulties.
              </p>
            </div>

            <Link
              href="/reset"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-bold text-blue-950 transition hover:bg-blue-50"
            >
              Get IT Support
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-7 text-center text-xs text-slate-500 sm:px-6 md:flex-row md:text-left">
          <div>
            <p className="font-medium">
              © {new Date().getFullYear()} Lagos State University of Science
              and Technology.
            </p>

            <p className="mt-1 text-[11px] text-slate-400">
              CBT Examination Portal
            </p>
          </div>

          <div className="flex items-center gap-5">
            <Link
              href="/login"
              className="font-medium transition hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Login
            </Link>

            <Link
              href="/maintenance"
              className="font-medium transition hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              System Status
            </Link>
          </div>
        </div>
      </footer>

      {/* =====================================================
          GLOBAL ANIMATION
      ===================================================== */}

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap");

        :root {
          --font-inter: "Inter", sans-serif;
          --font-jakarta: "Plus Jakarta Sans", sans-serif;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          font-family: var(--font-inter);
        }

        .font-heading {
          font-family: var(--font-jakarta);
        }

        .animate-hero-enter {
          animation: hero-enter 600ms cubic-bezier(0.2, 0.75, 0.25, 1) both;
        }

        @keyframes hero-enter {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }

          .animate-hero-enter {
            animation: none;
          }

          * {
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}

/* =========================================================
   FEATURE CARD
========================================================= */

function FeatureCard({
  icon: Icon,
  title,
  desc,
  color,
}: {
  icon: ElementType;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/5">
      <div
        className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl ${color}`}
      >
        <Icon size={20} />
      </div>

      <h3 className="font-heading text-base font-bold tracking-tight text-blue-950 sm:text-lg">
        {title}
      </h3>

      <p className="mt-2.5 text-sm leading-6 text-slate-600">
        {desc}
      </p>

      <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-blue-700">
        Built into the platform
        <CheckCircle2
          size={14}
          className="transition-transform duration-300 group-hover:scale-110"
        />
      </div>
    </article>
  );
}

/* =========================================================
   QUICK ACCESS CARD
========================================================= */

function QuickAccess({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: ElementType;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-950/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 transition duration-300 group-hover:bg-blue-700 group-hover:text-white">
        <Icon size={19} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-heading text-sm font-bold text-blue-950">
          {title}
        </h3>

        <p className="mt-0.5 text-[11px] leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <ArrowRight
        size={16}
        className="shrink-0 text-slate-400 transition duration-300 group-hover:translate-x-1 group-hover:text-blue-700"
      />
    </Link>
  );
}

/* =========================================================
   STEP CARD
========================================================= */

function StepCard({
  number,
  icon: Icon,
  title,
  description,
}: {
  number: string;
  icon: ElementType;
  title: string;
  description: string;
}) {
  return (
    <article className="group relative rounded-2xl border border-slate-200 bg-slate-50 p-6 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-blue-950/5">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
          <Icon size={21} />
        </div>

        <span className="font-heading text-3xl font-black tracking-tight text-slate-200">
          {number}
        </span>
      </div>

      <h3 className="font-heading mt-6 text-lg font-bold text-blue-950">
        {title}
      </h3>

      <p className="mt-2.5 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </article>
  );
}

/* =========================================================
   INFORMATION PANEL
========================================================= */

function InfoPanel({
  icon: Icon,
  title,
  description,
}: {
  icon: ElementType;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        <Icon size={20} />
      </div>

      <h3 className="font-heading mt-5 text-lg font-bold text-blue-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </article>
  );
}

/* =========================================================
   MOBILE NAV LINK
========================================================= */

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-800"
    >
      {children}
    </a>
  );
}