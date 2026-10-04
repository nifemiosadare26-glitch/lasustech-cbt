"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

const heroSlides = [
  {
    eyebrow: "Digital Assessment",
    title: "Smarter Exams.",
    highlight: "Brighter Futures.",
    description:
      "A streamlined computer-based testing platform designed for students, lecturers, and examination officers.",
    image:
      "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2200&q=85",
  },
  {
    eyebrow: "Examination Integrity",
    title: "Every Exam.",
    highlight: "Handled with Confidence.",
    description:
      "Support accountable assessments through controlled access, monitoring, and traceable submission records.",
    image:
      "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=2200&q=85",
  },
  {
    eyebrow: "Student Experience",
    title: "Your Next Step.",
    highlight: "Starts Here.",
    description:
      "Access scheduled examinations, prepare with practice tests, and navigate your CBT portal seamlessly.",
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=2200&q=85",
  },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Examination Integrity",
    description:
      "Support accountable examinations with access verification, focus-event monitoring, and detailed audit records.",
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
    title: "Academic Management",
    description:
      "Help lecturers organize question banks, import questions, and review assessments efficiently.",
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
      "Bring students, lecturers, invigilators, and examination officers into one platform.",
    color: "bg-cyan-50 text-cyan-700",
  },
  {
    icon: Headphones,
    title: "Support & Guidance",
    description:
      "Help candidates find examination instructions and access assistance when technical issues arise.",
    color: "bg-rose-50 text-rose-700",
  },
];

const steps = [
  {
    number: "01",
    icon: UserRound,
    title: "Sign In",
    description:
      "Access the portal using your authorized university credentials.",
  },
  {
    number: "02",
    icon: ClipboardCheck,
    title: "Select Your Exam",
    description:
      "Review your available examinations, schedules, and instructions.",
  },
  {
    number: "03",
    icon: Clock3,
    title: "Begin Your Exam",
    description:
      "Read the rules, answer questions, and submit your work within the allocated time.",
  },
];

export default function LandingPage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 6500);

    return () => window.clearInterval(interval);
  }, []);

  const slide = heroSlides[activeSlide];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100/60 font-sans text-slate-900">
      {/* SLIM NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-[58px] max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-blue-950 shadow-sm">
              <img 
                src="/lasustech-logo.png" 
                alt="LASUSTECH Logo" 
                className="h-full w-full object-cover p-1"
                onError={(e) => {
                  e.currentTarget.src = "https://ui-avatars.com/api/?name=LS&background=172554&color=fff";
                }}
              />
            </div>

            <div className="flex flex-col justify-center">
              <p className="font-heading w-[160px] text-[11px] font-extrabold leading-[1.15] tracking-tight text-blue-950 sm:w-auto sm:text-xs md:text-sm">
                Lagos State University of <br className="sm:hidden" />
                Science and Technology
              </p>
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-500 sm:text-[9px]">
                CBT Examination Portal
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-6 lg:flex">
            <a href="#home" className="text-xs font-semibold text-blue-800 lg:text-sm">
              Home
            </a>
            <a href="#features" className="text-xs text-slate-600 transition hover:text-blue-800 lg:text-sm">
              Features
            </a>
            <a href="#how-it-works" className="text-xs text-slate-600 transition hover:text-blue-800 lg:text-sm">
              How It Works
            </a>
            <a href="#support" className="text-xs text-slate-600 transition hover:text-blue-800 lg:text-sm">
              Support
            </a>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Link href="/login">
              <Button
                variant="secondary"
                className="h-8 border border-blue-200 bg-white px-3 text-xs text-blue-900 hover:bg-blue-50"
              >
                Staff Portal
              </Button>
            </Link>

            <Link href="/login">
              <Button className="h-8 gap-1.5 bg-blue-700 px-3.5 text-xs font-semibold shadow-sm hover:bg-blue-800">
                Student Login
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>

          <button
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-md border border-slate-200 p-1.5 text-slate-800 md:hidden"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-slate-100 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-2.5">
              <a href="#home" onClick={() => setMenuOpen(false)} className="text-xs font-medium text-slate-700">
                Home
              </a>
              <a href="#features" onClick={() => setMenuOpen(false)} className="text-xs font-medium text-slate-700">
                Features
              </a>
              <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="text-xs font-medium text-slate-700">
                How It Works
              </a>
              <a href="#support" onClick={() => setMenuOpen(false)} className="text-xs font-medium text-slate-700">
                Support
              </a>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="mt-1 rounded-lg bg-blue-700 px-3 py-2 text-center text-xs font-bold text-white"
              >
                Student Login
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* COMPACT & REDUCED HERO SECTION */}
        <section
          id="home"
          className="relative isolate flex min-h-[460px] items-center overflow-hidden bg-blue-950 sm:min-h-[500px] lg:min-h-[520px]"
        >
          {heroSlides.map((item, index) => (
            <div
              key={item.eyebrow}
              aria-hidden="true"
              className={`absolute inset-0 -z-20 bg-cover bg-center transition-opacity duration-1000 ${
                activeSlide === index ? "opacity-100" : "opacity-0"
              }`}
              style={{ backgroundImage: `url("${item.image}")` }}
            />
          ))}

          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#06162e]/95 via-[#071a34]/85 to-[#071a34]/30" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#06162e]/80 via-transparent to-[#06162e]/10" />

          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
            <div key={activeSlide} className="hero-content max-w-3xl">
              {/* Scaled down badge eyebrow */}
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-100 backdrop-blur-md sm:text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                {slide.eyebrow}
              </div>

              {/* Headline */}
              <h1 className="font-heading max-w-2xl text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                {slide.title}{" "}
                <span className="bg-gradient-to-r from-sky-300 via-blue-300 to-white bg-clip-text text-transparent">
                  {slide.highlight}
                </span>
              </h1>

              {/* Compact Body Text */}
              <p className="mt-3.5 max-w-xl text-xs leading-relaxed text-slate-200 sm:text-sm md:text-base">
                {slide.description}
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/login">
                  <Button
                    size="default"
                    className="h-11 w-full gap-2 rounded-lg bg-blue-600 px-5 text-xs font-bold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 sm:w-auto sm:text-sm"
                  >
                    Access Examination Portal
                    <ArrowRight size={16} />
                  </Button>
                </Link>

                <a href="#features">
                  <Button
                    variant="secondary"
                    size="default"
                    className="h-11 w-full rounded-lg border border-white/30 bg-white/10 px-5 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/20 hover:text-white sm:w-auto sm:text-sm"
                  >
                    Explore Platform
                  </Button>
                </a>
              </div>
            </div>

            {/* Slide Indicators & Badges */}
            <div className="mt-10 flex flex-col justify-between gap-4 border-t border-white/15 pt-4 sm:mt-12 sm:flex-row sm:items-center">
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-medium text-white/90 sm:text-xs">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-sky-300" />
                  Accountable Assessments
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-sky-300" />
                  Streamlined Access
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                {heroSlides.map((item, index) => (
                  <button
                    key={item.eyebrow}
                    type="button"
                    aria-label={`Show slide ${index + 1}`}
                    aria-pressed={activeSlide === index}
                    onClick={() => setActiveSlide(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeSlide === index
                        ? "w-8 bg-sky-300"
                        : "w-3 bg-white/40 hover:bg-white/80"
                    }`}
                  />
                ))}
                <span className="ml-1 text-[10px] font-semibold text-white/80 sm:text-xs">
                  0{activeSlide + 1}/03
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK ACCESS STRIP */}
        <section className="relative z-10 mx-auto -mt-1 max-w-7xl px-4 pt-6 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <QuickAccess
              icon={CalendarDays}
              title="Exam Schedules"
              description="Review your examination timetable."
              href="/login"
            />
            <QuickAccess
              icon={FileText}
              title="Exam Instructions"
              description="Understand the examination rules."
              href="/login"
            />
            <QuickAccess
              icon={Headphones}
              title="Technical Support"
              description="Find help with portal access."
              href="/reset"
            />
          </div>
        </section>

        {/* FEATURES SECTION (Transparent to show gradient) */}
        <section id="features" className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div className="max-w-xl">
                <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-blue-600">
                  Everything in one place
                </p>
                <h2 className="font-heading mt-2 text-2xl font-extrabold tracking-tight text-blue-950 sm:text-4xl">
                  Built for better examinations.
                </h2>
                <p className="mt-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  Tools designed to support examination integrity, academic workflows, and a more convenient experience for every user.
                </p>
              </div>

              <a
                href="#how-it-works"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 transition hover:text-blue-900 sm:text-sm"
              >
                See how it works <ArrowRight size={16} />
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

        {/* HOW IT WORKS (Transparent to show gradient) */}
        <section id="how-it-works" className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto mb-10 max-w-xl text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-blue-600">
                Three simple steps
              </p>
              <h2 className="font-heading mt-2 text-2xl font-extrabold tracking-tight text-blue-950 sm:text-4xl">
                Your exam journey, simplified.
              </h2>
              <p className="mt-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
                Follow a clear process from signing in to completing your computer-based examination.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <article
                    key={step.number}
                    className="relative rounded-xl border border-white/50 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-blue-950/5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                        <Icon size={22} />
                      </div>
                      <span className="font-heading text-3xl font-black tracking-tight text-blue-100">
                        {step.number}
                      </span>
                    </div>

                    <h3 className="font-heading mt-5 text-base font-bold text-blue-950 sm:text-lg">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                      {step.description}
                    </p>

                    {index < steps.length - 1 && (
                      <ArrowRight
                        size={18}
                        className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-blue-400 md:block"
                      />
                    )}
                  </article>
                );
              })}
            </div>

            <div className="mt-10 text-center">
              <Link href="/login">
                <Button
                  size="default"
                  className="h-11 gap-2 rounded-lg bg-blue-950 px-6 text-xs font-bold text-white hover:bg-blue-800 sm:text-sm"
                >
                  Continue to Login
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* SUPPORT BANNER */}
        <section id="support" className="px-4 pb-16 sm:px-6 sm:pb-20">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-2xl bg-blue-950 p-6 text-white shadow-xl shadow-blue-950/20 sm:p-10 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-300">
                Need assistance?
              </p>
              <h2 className="font-heading mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Get ready for your next examination.
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-blue-100 sm:text-sm">
                Review your examination instructions and use the designated support channel if you experience technical difficulties.
              </p>
            </div>

            <Link href="/reset">
              <Button
                size="default"
                className="h-11 gap-2 rounded-lg bg-white px-5 text-xs font-bold text-blue-950 hover:bg-blue-50 sm:text-sm"
              >
                Get IT Support
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200/60 bg-white/40 py-6 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-center text-xs text-slate-500 sm:px-6 md:flex-row md:text-left">
          <p>
            © {new Date().getFullYear()} Lagos State University of Science and Technology.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="transition hover:text-blue-700">
              Login
            </Link>
            <Link href="/maintenance" className="transition hover:text-blue-700">
              System Status
            </Link>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap');

        :root {
          --font-plus-jakarta: 'Plus Jakarta Sans', sans-serif;
          --font-inter: 'Inter', sans-serif;
        }

        body {
          font-family: var(--font-inter);
        }

        .font-heading {
          font-family: var(--font-plus-jakarta);
        }

        .hero-content {
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
          .hero-content {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  color,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <article className="group rounded-xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-950/5">
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
        <Icon size={20} />
      </div>
      <h3 className="font-heading text-base font-bold tracking-tight text-blue-950">{title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-slate-600">{desc}</p>
      <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-blue-700">
        Platform capability
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
      </div>
    </article>
  );
}

function QuickAccess({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur-sm transition duration-300 hover:bg-white hover:border-blue-200 hover:shadow-md hover:shadow-blue-950/5"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
        <Icon size={19} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-heading text-xs font-bold text-blue-950 sm:text-sm">{title}</h3>
        <p className="mt-0.5 text-[11px] leading-tight text-slate-500">{description}</p>
      </div>
      <ArrowRight size={16} className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700" />
    </Link>
  );
}