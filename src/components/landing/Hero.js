"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Hero section: Two columns with DM Serif headline,
 * realistic product preview card, and animated 0->92% match score countup.
 */
export default function Hero() {
  const [matchScore, setMatchScore] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Smooth count-up to 92%
    let animationFrameId;
    const duration = 1600;
    const startTime = performance.now();

    const animateCount = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * 92);
      setMatchScore(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateCount);
      }
    };

    const timer = setTimeout(() => {
      setIsLoaded(true);
      animationFrameId = requestAnimationFrame(animateCount);
    }, 150);

    return () => {
      clearTimeout(timer);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto z-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column: Editorial Headline & Actions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-soft/90 border border-border text-primary font-mono text-xs font-semibold uppercase tracking-wider select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span>Internship Intelligence</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-text leading-[1.12] tracking-tight">
            Find internships worth applying to.
          </h1>

          <p className="font-ui text-base sm:text-lg text-text-secondary max-w-xl leading-relaxed">
            Discover opportunities, check the details, and find roles that actually match your skills.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <Link
              href="/home"
              className="inline-flex items-center justify-center font-ui text-sm sm:text-base font-bold px-6 py-3.5 rounded-xl bg-primary text-white hover:bg-primary-hover active:scale-[0.98] transition-all shadow-md group"
            >
              <span>Explore Internships</span>
              <span className="ml-2 group-hover:translate-x-1 transition-transform">
                &rarr;
              </span>
            </Link>

            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center font-ui text-sm sm:text-base font-bold px-6 py-3.5 rounded-xl bg-surface/80 hover:bg-surface text-text border border-border hover:border-border-strong active:scale-[0.98] transition-all"
            >
              See how it works
            </a>
          </div>

          <div className="pt-4 flex items-center gap-6 text-xs text-text-muted font-ui">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span>Domain Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span>Zero Placement Fees</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span>Skill Match Engine</span>
            </div>
          </div>
        </div>

        {/* Right Column: Realistic Product UI Preview */}
        <div className="lg:col-span-5 relative">
          <div
            className={`transition-all duration-700 transform ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            {/* Main Product Card */}
            <div className="relative rounded-2xl bg-surface border border-border shadow-xl p-5 sm:p-6 select-none overflow-hidden">
              {/* Top Card Label & Status */}
              <div className="flex items-center justify-between pb-4 border-b border-border/80">
                <span className="font-mono text-[11px] font-semibold text-text-muted uppercase tracking-widest">
                  INTERNSHIP
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-success-bg text-success border border-success/30 font-ui text-xs font-bold uppercase tracking-wider">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  LOW RISK
                </span>
              </div>

              {/* Role Title & Company */}
              <div className="pt-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-rose-soft text-primary font-bold font-ui text-sm flex items-center justify-center border border-border shrink-0">
                    NT
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-ui font-extrabold text-base sm:text-lg text-text leading-snug truncate">
                      Frontend Developer Intern
                    </h3>
                    <p className="font-ui text-xs sm:text-sm text-text-secondary mt-0.5">
                      NovaStack Technologies
                    </p>
                    <p className="font-ui text-xs text-text-muted mt-1 flex items-center gap-2">
                      <span>Remote</span>
                      <span>•</span>
                      <span>3 months</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Skills Chips */}
              <div className="mt-4 pt-3 border-t border-border/70 flex items-center gap-1.5 flex-wrap">
                <span className="font-ui text-xs px-2.5 py-1 rounded-[var(--radius-sm)] bg-rose-soft text-primary border border-primary/25 font-semibold">
                  React
                </span>
                <span className="font-ui text-xs px-2.5 py-1 rounded-[var(--radius-sm)] bg-rose-soft text-primary border border-primary/25 font-semibold">
                  Node.js
                </span>
                <span className="font-ui text-xs px-2.5 py-1 rounded-[var(--radius-sm)] bg-rose-soft text-primary border border-primary/25 font-semibold">
                  MongoDB
                </span>
                <span className="font-ui text-xs px-2.5 py-1 rounded-[var(--radius-sm)] bg-surface-alt text-text-muted border border-border">
                  Tailwind CSS
                </span>
              </div>

              {/* Stats Metrics (Skill Match & Stipend) */}
              <div className="mt-5 grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-surface-alt border border-border">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted block">
                    SKILL MATCH
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-number font-extrabold text-2xl text-primary leading-none">
                      {matchScore}%
                    </span>
                    <span className="font-ui text-[11px] font-bold text-rose uppercase">
                      Match
                    </span>
                  </div>
                </div>

                <div className="border-l border-border pl-3">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted block">
                    STIPEND
                  </span>
                  <div className="mt-0.5">
                    <span className="font-number font-bold text-base text-text leading-none block">
                      ₹15,000
                    </span>
                    <span className="font-ui text-[11px] text-text-muted">
                      per month
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button Preview */}
              <div className="mt-4 pt-2">
                <Link
                  href="/home"
                  className="w-full flex items-center justify-center font-ui text-xs font-bold py-2.5 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors shadow-xs"
                >
                  Easy Apply &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
