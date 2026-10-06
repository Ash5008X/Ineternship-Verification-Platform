"use client";

import { useEffect, useRef } from "react";

/**
 * Student experiences section: Horizontally scrolling verified student reviews
 * tied gently to vertical scroll.
 */
export default function ExperienceSection() {
  const containerRef = useRef(null);
  const railRef = useRef(null);

  const experiences = [
    {
      id: "exp-1",
      rating: 5,
      stipendTag: "₹12,000 received",
      stipendClass: "text-success bg-success-bg border-success/30",
      role: "Frontend Intern",
      duration: "3 months",
      company: "NovaStack Technologies",
      quote: "Mentorship was strong and the project work matched the description.",
      badge: "Verified student experience",
      badgeType: "verified",
    },
    {
      id: "exp-2",
      rating: 3,
      stipendTag: "₹8,000 promised",
      stipendClass: "text-warning bg-warning-bg border-warning/30",
      role: "Software Intern",
      duration: "2 months",
      company: "CloudVibe Labs",
      quote: "Work was useful, but the stipend arrived late twice.",
      badge: "Verified student experience",
      badgeType: "verified",
    },
    {
      id: "exp-3",
      rating: 1,
      stipendTag: "₹0 received",
      stipendClass: "text-danger bg-danger-bg border-danger/30",
      role: "Web Intern",
      duration: "1 month",
      company: "ApexSkill Tech",
      quote: "Asked for a training fee after selection. I declined.",
      badge: "Reported experience",
      badgeType: "reported",
    },
    {
      id: "exp-4",
      rating: 5,
      stipendTag: "₹22,000 received",
      stipendClass: "text-success bg-success-bg border-success/30",
      role: "Full Stack Intern",
      duration: "6 months",
      company: "ByteForge Labs",
      quote: "Shipped production code within two weeks. Excellent team culture.",
      badge: "Verified student experience",
      badgeType: "verified",
    },
  ];

  useEffect(() => {
    // Check reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    const handleScroll = () => {
      if (!containerRef.current || !railRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // When the section is in view
      if (rect.top < windowHeight && rect.bottom > 0) {
        const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
        // Translate horizontally based on vertical scroll
        const maxScroll = 180;
        const offset = (progress - 0.5) * maxScroll;
        railRef.current.style.transform = `translateX(${-offset}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      id="experiences"
      ref={containerRef}
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto z-10 overflow-hidden"
    >
      {/* Section Header */}
      <div className="max-w-2xl space-y-3 mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-soft border border-border text-primary font-mono text-xs font-semibold uppercase tracking-wider select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span>Real Voices</span>
        </div>

        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-text leading-tight tracking-tight">
          See what students actually experienced.
        </h2>

        <p className="font-ui text-base text-text-secondary leading-relaxed">
          Promises are cheap. Experiences are much harder to fake.
        </p>
      </div>

      {/* Horizontal Experience Rail */}
      <div className="relative">
        <div
          ref={railRef}
          className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-2 no-scrollbar transition-transform duration-100 ease-out"
        >
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="w-[300px] sm:w-[340px] shrink-0 rounded-2xl bg-surface border border-border shadow-md p-6 flex flex-col justify-between select-none hover:border-border-strong transition-colors"
            >
              <div>
                {/* Top: Stars & Stipend Tag */}
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center text-amber-500 text-sm">
                    {"★".repeat(exp.rating)}
                    {"☆".repeat(5 - exp.rating)}
                  </div>

                  <span
                    className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded border ${exp.stipendClass}`}
                  >
                    {exp.stipendTag}
                  </span>
                </div>

                {/* Role & Duration */}
                <div className="pt-3">
                  <h4 className="font-ui font-extrabold text-sm text-text">
                    {exp.role} · {exp.duration}
                  </h4>
                  <p className="font-ui text-xs text-text-muted mt-0.5">
                    {exp.company}
                  </p>
                </div>

                {/* Quote */}
                <blockquote className="mt-4 font-ui text-xs sm:text-sm text-text-secondary italic leading-relaxed">
                  &ldquo;{exp.quote}&rdquo;
                </blockquote>
              </div>

              {/* Bottom Badge */}
              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-[11px]">
                <span
                  className={`font-ui font-semibold inline-flex items-center gap-1.5 ${
                    exp.badgeType === "verified" ? "text-success" : "text-danger"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      exp.badgeType === "verified" ? "bg-success" : "bg-danger"
                    }`}
                  />
                  {exp.badge}
                </span>

                <span className="font-mono text-text-muted text-[10px]">
                  Verified Student
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
