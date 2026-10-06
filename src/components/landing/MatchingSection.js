"use client";

import { useEffect, useRef, useState } from "react";

/**
 * CV Matching section: Visualizes resume skills vs requirements,
 * animating skill tags into matched state and stepping the match score from 0% to 80%.
 */
export default function MatchingSection() {
  const sectionRef = useRef(null);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [matchedStep, setMatchedStep] = useState(0); // 0 to 4
  const [percentage, setPercentage] = useState(0);

  const candidateSkills = ["React", "Node.js", "MongoDB", "Docker", "JavaScript"];
  const requirementSkills = [
    { name: "React", required: true, matched: true },
    { name: "Node.js", required: true, matched: true },
    { name: "MongoDB", required: true, matched: true },
    { name: "Docker", required: true, matched: true },
    { name: "AWS", required: true, matched: false },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered) {
          setHasTriggered(true);

          // Animate skills matching 1 by 1
          let currentMatches = 0;
          const interval = setInterval(() => {
            currentMatches += 1;
            setMatchedStep(currentMatches);

            // Step percentage: 0 -> 20 -> 40 -> 60 -> 80
            setPercentage(currentMatches * 20);

            if (currentMatches >= 4) {
              clearInterval(interval);
            }
          }, 360);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasTriggered]);

  return (
    <section
      id="matching"
      ref={sectionRef}
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto z-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: UI Matching Card */}
        <div className="lg:col-span-6 order-2 lg:order-1">
          <div className="rounded-2xl bg-surface border border-border shadow-xl p-6 sm:p-7 select-none">
            {/* Header with Match Percentage */}
            <div className="flex items-center justify-between pb-5 border-b border-border">
              <div>
                <span className="font-mono text-[11px] text-text-muted uppercase tracking-wider block">
                  CV MATCH REPORT
                </span>
                <h4 className="font-ui font-extrabold text-base text-text mt-0.5">
                  Backend Developer Intern
                </h4>
              </div>

              <div className="text-right">
                <span className="font-number font-extrabold text-3xl text-primary leading-none block">
                  {percentage}%
                </span>
                <span className="font-mono text-xs font-bold text-rose uppercase tracking-wide">
                  Match Score
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-ui mb-1.5">
                <span className="text-text-secondary font-medium">Relevance progress</span>
                <span className="font-mono font-bold text-primary">
                  {matchedStep} / 5 MATCHED
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-alt border border-border overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {/* Comparison Grid */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
              {/* Candidate Skills */}
              <div className="space-y-2">
                <span className="font-mono text-[11px] text-text-muted uppercase tracking-wider block">
                  Your Parsed Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {candidateSkills.map((skill) => (
                    <span
                      key={skill}
                      className="font-ui text-xs px-2.5 py-1 rounded-[var(--radius-sm)] bg-surface-alt text-text-secondary border border-border"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Requirement Skills Match Matrix */}
              <div className="space-y-2">
                <span className="font-mono text-[11px] text-text-muted uppercase tracking-wider block">
                  Role Requirements
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {requirementSkills.map((req, idx) => {
                    const isMatchedNow = hasTriggered && req.matched && idx < matchedStep;
                    return (
                      <span
                        key={req.name}
                        className={`font-ui text-xs px-2.5 py-1 rounded-[var(--radius-sm)] border font-semibold transition-all duration-300 flex items-center gap-1 ${
                          isMatchedNow
                            ? "bg-rose-soft text-primary border-primary/30"
                            : req.matched
                            ? "bg-surface-alt text-text-muted border-border"
                            : "bg-surface-alt/50 text-text-muted border-dashed border-border"
                        }`}
                      >
                        {isMatchedNow && (
                          <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                        {req.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="mt-5 pt-3 border-t border-border flex items-center gap-2 text-xs text-text-muted">
              <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <span>Missing &quot;AWS&quot; will not block your application submission.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Heading & Description */}
        <div className="lg:col-span-6 order-1 lg:order-2 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-soft border border-border text-primary font-mono text-xs font-semibold uppercase tracking-wider select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Deterministic Match Engine</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-text leading-tight tracking-tight">
            Find roles that fit your skills.
          </h2>

          <p className="font-ui text-base text-text-secondary leading-relaxed">
            Your CV is compared against internship requirements. Matched and missing skills are shown clearly before you spend time preparing an application.
          </p>

          <div className="pt-2 space-y-3 font-ui text-xs sm:text-sm text-text-muted">
            <div className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>Understand your skill coverage instantly before applying.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>Zero black-box AI ranking; clear transparent keyword mapping.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
