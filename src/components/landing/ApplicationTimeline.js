"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Application tracking vertical timeline: Shows transparent recruitment progression
 * with sequential node lighting and animated connecting line.
 */
export default function ApplicationTimeline() {
  const sectionRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0); // 0 to 5
  const [hasTriggered, setHasTriggered] = useState(false);

  const steps = [
    {
      title: "Submitted",
      subtitle: "Application received",
      desc: "Instant cryptographic receipt generated with employer routing confirmation.",
      time: "Day 1",
    },
    {
      title: "Under Review",
      subtitle: "Recruiter opened your application",
      desc: "Engineering team reviewed matched skills and CV snapshot.",
      time: "Day 3",
    },
    {
      title: "Shortlisted",
      subtitle: "You're moving forward",
      desc: "Profile tagged for technical interview round with hiring manager.",
      time: "Day 6",
    },
    {
      title: "Interview",
      subtitle: "Next step scheduled",
      desc: "Direct calendar invite with team members, zero external test links.",
      time: "Day 9",
    },
    {
      title: "Selected",
      subtitle: "Offer received",
      desc: "Verified stipend contract and internship agreement issued.",
      time: "Day 14",
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered) {
          setHasTriggered(true);

          let current = 0;
          const interval = setInterval(() => {
            current += 1;
            setActiveStep(current);
            if (current >= steps.length) {
              clearInterval(interval);
            }
          }, 320);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasTriggered, steps.length]);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto z-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Heading & Context */}
        <div className="lg:col-span-5 space-y-4 sticky top-28">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-soft border border-border text-primary font-mono text-xs font-semibold uppercase tracking-wider select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>End-to-End Visibility</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-text leading-tight tracking-tight">
            Know what happens next.
          </h2>

          <p className="font-ui text-base text-text-secondary leading-relaxed">
            No endless ghosting or opaque applicant queues. Follow your submission step by step as recruiters interact with your profile.
          </p>

          <div className="pt-3 border-t border-border">
            <span className="font-mono text-xs text-text-muted">
              Live status notifications dispatched automatically to your student dashboard.
            </span>
          </div>
        </div>

        {/* Right Column: Vertical Timeline */}
        <div className="lg:col-span-7">
          <div className="relative pl-6 sm:pl-8 space-y-8 select-none">
            {/* Connecting Vertical Line */}
            <div className="absolute left-2.5 sm:left-3 top-3 bottom-3 w-0.5 bg-border -translate-x-1/2">
              <div
                className="w-full bg-primary transition-all duration-700 ease-out"
                style={{ height: `${(Math.min(activeStep, steps.length) / steps.length) * 100}%` }}
              />
            </div>

            {steps.map((step, index) => {
              const isPastOrActive = hasTriggered && index < activeStep;
              return (
                <div key={step.title} className="relative group">
                  {/* Timeline Node Dot */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-1 w-5 h-5 rounded-full border-2 transition-all duration-300 -translate-x-1/2 flex items-center justify-center ${
                      isPastOrActive
                        ? "bg-primary border-primary text-white shadow-xs"
                        : "bg-surface border-border text-transparent"
                    }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                  </div>

                  {/* Card Content */}
                  <div
                    className={`p-5 rounded-xl border transition-all duration-300 ${
                      isPastOrActive
                        ? "bg-surface border-border shadow-sm"
                        : "bg-surface/50 border-border/60 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="font-ui font-extrabold text-base text-text">
                          {step.title}
                        </span>
                        <p className="font-ui text-xs font-semibold text-primary mt-0.5">
                          {step.subtitle}
                        </p>
                      </div>

                      <span className="font-mono text-xs text-text-muted bg-surface-alt px-2 py-0.5 rounded border border-border">
                        {step.time}
                      </span>
                    </div>

                    <p className="font-ui text-xs text-text-secondary mt-2 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
