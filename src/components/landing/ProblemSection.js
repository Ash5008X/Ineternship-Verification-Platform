"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Problem section: High-contrast darker backdrop showing the internship search dilemma
 * and the 5-step InternCheck product lifecycle activating sequentially on scroll.
 */
export default function ProblemSection() {
  const sectionRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [hasTriggered, setHasTriggered] = useState(false);

  const steps = [
    { number: "01", title: "Discover", desc: "Find verified opportunities without clutter or paywalls." },
    { number: "02", title: "Verify", desc: "Inspect multi-point risk checks, domain legitimacy, and fee audits." },
    { number: "03", title: "Match", desc: "Compare your resume skills directly against explicit technical requirements." },
    { number: "04", title: "Apply", desc: "Submit through zero-redirection Easy Apply with CV snapshot verification." },
    { number: "05", title: "Track", desc: "Follow every phase of recruiter review, shortlisting, and scheduling." },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered) {
          setHasTriggered(true);

          // Animate sequential step activation
          let current = 0;
          const interval = setInterval(() => {
            current += 1;
            if (current <= steps.length) {
              setActiveStep(current);
            } else {
              clearInterval(interval);
            }
          }, 320);
        }
      },
      { threshold: 0.25 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasTriggered, steps.length]);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative py-24 sm:py-32 bg-[#1b1216] text-[#f8eef1] z-10 border-y border-[#3a272e] overflow-hidden"
    >
      {/* Subtle radial warmth */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[radial-gradient(circle,rgba(224,90,122,0.12)_0%,transparent_70%)] blur-[90px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Heading */}
        <div className="max-w-2xl space-y-4">
          <span className="font-mono text-xs uppercase tracking-widest text-[#f08aa2] font-semibold">
            THE REALITY OF INTERNSHIP SEARCH
          </span>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-tight text-[#f8eef1]">
            Not every internship is what it claims.
          </h2>

          <p className="font-ui text-sm sm:text-base text-[#c7b9be] leading-relaxed">
            Registration fees. Broken application links. Inflated stipends. Vague job descriptions. Students shouldn&apos;t need detective skills just to apply for an internship.
          </p>
        </div>

        {/* Product Lifecycle Rail */}
        <div className="mt-14 sm:mt-18">
          <div className="border-b border-[#3a272e] pb-3 mb-6 flex items-center justify-between">
            <span className="font-mono text-xs text-[#95868d] uppercase tracking-wider">
              Product Lifecycle
            </span>
            <span className="font-mono text-xs text-[#f08aa2]">
              Discover &rarr; Verify &rarr; Match &rarr; Apply &rarr; Track
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((step, index) => {
              const isActivated = hasTriggered && index < activeStep;
              return (
                <div
                  key={step.number}
                  className={`p-5 rounded-xl border transition-all duration-300 relative ${
                    isActivated
                      ? "bg-[#24171d] border-[#f08aa2]/50 shadow-md translate-y-0"
                      : "bg-[#181014]/60 border-[#3a272e]/60 opacity-60 translate-y-2"
                  }`}
                >
                  {/* Step Number */}
                  <span
                    className={`font-mono text-xs font-bold block transition-colors duration-200 ${
                      isActivated ? "text-[#f08aa2]" : "text-[#95868d]"
                    }`}
                  >
                    {step.number}
                  </span>

                  {/* Step Title */}
                  <h3 className="font-ui font-extrabold text-base text-[#f8eef1] mt-2 leading-snug">
                    {step.title}
                  </h3>

                  {/* Step Description */}
                  <p className="font-ui text-xs text-[#c7b9be] mt-2 leading-relaxed">
                    {step.desc}
                  </p>

                  {/* Active highlight top indicator */}
                  {isActivated && (
                    <div className="absolute top-0 left-4 right-4 h-0.5 bg-[#f08aa2] rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
