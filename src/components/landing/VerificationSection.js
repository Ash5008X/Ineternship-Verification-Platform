"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Verification section: Sequential verification checks and risk score reduction (100 -> 18)
 * demonstrating the multi-point risk engine.
 */
export default function VerificationSection() {
  const sectionRef = useRef(null);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [riskScore, setRiskScore] = useState(100);

  const checks = [
    { id: "c1", label: "Company Website", detail: "Registered corporate domain active with valid SSL" },
    { id: "c2", label: "Application Domain", detail: "Application endpoint matches official company namespace" },
    { id: "c3", label: "Registration Fee", detail: "Zero training charges, deposit demands, or hidden fees" },
    { id: "c4", label: "Company Information", detail: "CIN, MCA registration, and registered corporate headquarters" },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered) {
          setHasTriggered(true);

          // 1. Sequential check verification
          let count = 0;
          const checkInterval = setInterval(() => {
            count += 1;
            setVerifiedCount(count);

            if (count >= checks.length) {
              clearInterval(checkInterval);

              // 2. Animate risk score reduction: 100 -> 90 -> 70 -> 50 -> 35 -> 18
              const scoreSteps = [100, 90, 70, 50, 35, 18];
              scoreSteps.forEach((score, idx) => {
                setTimeout(() => {
                  setRiskScore(score);
                }, idx * 160);
              });
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
  }, [hasTriggered, checks.length]);

  const isLowRisk = riskScore === 18 && verifiedCount >= checks.length;

  return (
    <section
      id="verification"
      ref={sectionRef}
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto z-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Heading & Explanation */}
        <div className="lg:col-span-6 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-soft border border-border text-primary font-mono text-xs font-semibold uppercase tracking-wider select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Signal-Based Trust</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-text leading-tight tracking-tight">
            Know more before you apply.
          </h2>

          <p className="font-ui text-base text-text-secondary leading-relaxed">
            InternCheck checks multiple signals instead of pretending one green badge can magically reveal the truth about a company.
          </p>

          <div className="pt-2 space-y-3 font-ui text-xs sm:text-sm text-text-muted">
            <div className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>Domain resolution heuristics verify applicant routing integrity.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>Automated fee scanning flags scam recruitment deposits.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>Risk scores are computed on objective data, never arbitrary endorsements.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Verification Interface */}
        <div className="lg:col-span-6">
          <div className="rounded-2xl bg-surface border border-border shadow-xl p-6 sm:p-7 select-none">
            {/* Header: Target Entity & Risk Badge */}
            <div className="flex items-center justify-between pb-5 border-b border-border">
              <div>
                <span className="font-mono text-[11px] text-text-muted uppercase tracking-wider block">
                  Target Inspection
                </span>
                <h4 className="font-ui font-extrabold text-base text-text mt-0.5">
                  NovaStack Technologies
                </h4>
                <p className="font-mono text-xs text-text-muted">
                  novastack.tech
                </p>
              </div>

              {/* Animated Risk Meter */}
              <div className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded-[var(--radius-sm)] border uppercase transition-colors duration-300 ${
                      isLowRisk
                        ? "bg-success-bg text-success border-success/30"
                        : "bg-surface-alt text-text-muted border-border"
                    }`}
                  >
                    {isLowRisk ? "LOW RISK" : "CALCULATING"}
                  </span>
                </div>
                <div className="mt-1">
                  <span className="font-number font-extrabold text-2xl text-text leading-none">
                    {riskScore}
                  </span>
                  <span className="font-mono text-xs text-text-muted"> / 100</span>
                </div>
                <span className="font-ui text-[10px] text-text-muted uppercase tracking-wider block">
                  Risk Metric
                </span>
              </div>
            </div>

            {/* Checks Stream */}
            <div className="mt-5 space-y-3">
              {checks.map((check, index) => {
                const isVerified = hasTriggered && index < verifiedCount;
                return (
                  <div
                    key={check.id}
                    className={`p-3 rounded-xl border transition-all duration-300 ${
                      isVerified
                        ? "bg-surface-alt/70 border-border"
                        : "bg-surface border-border/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-ui font-bold text-xs sm:text-sm text-text">
                        {check.label}
                      </span>

                      <div className="shrink-0">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-success bg-success-bg border border-success/30 px-2 py-0.5 rounded">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 font-mono text-xs text-text-muted bg-surface-alt px-2 py-0.5 rounded border border-border">
                            <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-ping" />
                            Checking...
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="font-ui text-[11px] text-text-muted mt-1 leading-snug">
                      {check.detail}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Footer validation stamp */}
            <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-[11px] text-text-muted font-mono">
              <span>SHA-256 Verified Protocol</span>
              <span>Checked in 420ms</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
