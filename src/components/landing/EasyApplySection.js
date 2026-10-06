"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/**
 * Easy Apply section with rich burgundy theme, emphasizing the CV snapshot concept
 * and animating the application flow sequentially into view.
 */
export default function EasyApplySection() {
  const sectionRef = useRef(null);
  const [activeNode, setActiveNode] = useState(0); // 0 to 4
  const [hasTriggered, setHasTriggered] = useState(false);

  const nodes = [
    {
      id: "node-1",
      step: "01",
      title: "Your CV",
      desc: "Uploaded PDF with parsed skills ready in your student profile.",
      badge: "Source File",
    },
    {
      id: "node-2",
      step: "02",
      title: "Easy Apply",
      desc: "One-click submission without external redirects or paid test forms.",
      badge: "Direct Action",
    },
    {
      id: "node-3",
      step: "03",
      title: "CV Snapshot",
      desc: "Immutable timestamped capture frozen specifically for this company review.",
      badge: "Key Feature",
      highlight: true,
    },
    {
      id: "node-4",
      step: "04",
      title: "Submitted",
      desc: "Enters recruiter pipeline with instant tracking verification ID.",
      badge: "Confirmed",
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
            setActiveNode(current);
            if (current >= nodes.length) {
              clearInterval(interval);
            }
          }, 340);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasTriggered, nodes.length]);

  return (
    <section
      id="apply"
      ref={sectionRef}
      className="relative py-24 sm:py-32 bg-[#2d1b23] text-[#f8eef1] z-10 border-y border-[#51313c] overflow-hidden"
    >
      {/* Subtle deep burgundy ambient glow */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-[radial-gradient(circle,rgba(224,90,122,0.18)_0%,transparent_70%)] blur-[90px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl space-y-4">
          <span className="font-mono text-xs uppercase tracking-widest text-[#f08aa2] font-semibold">
            FRICTIONLESS SUBMISSION
          </span>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-tight text-[#f8eef1]">
            Found the right internship? Apply.
          </h2>

          <p className="font-ui text-sm sm:text-base text-[#c7b9be] leading-relaxed">
            Use your current CV, add an optional message, give consent, and submit.
          </p>
        </div>

        {/* CV Snapshot Flow Nodes */}
        <div className="mt-14 sm:mt-18">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {nodes.map((item, index) => {
              const isVisible = hasTriggered && index < activeNode;
              return (
                <div
                  key={item.id}
                  className={`p-6 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between ${
                    item.highlight
                      ? isVisible
                        ? "bg-[#3a1d29] border-[#f08aa2] shadow-xl ring-1 ring-[#f08aa2]/40"
                        : "bg-[#24171d] border-[#51313c]"
                      : isVisible
                      ? "bg-[#24171d] border-[#51313c] shadow-md"
                      : "bg-[#1b1216] border-[#3a272e]/60 opacity-60"
                  }`}
                >
                  <div>
                    {/* Header: Step & Badge */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#51313c]">
                      <span className="font-mono text-xs font-bold text-[#f08aa2]">
                        {item.step}
                      </span>
                      <span
                        className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          item.highlight
                            ? "bg-[#f08aa2] text-[#241a1e]"
                            : "bg-[#3a272e] text-[#c7b9be]"
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>

                    {/* Node Title */}
                    <h3 className="font-ui font-extrabold text-base sm:text-lg text-[#f8eef1] mt-3">
                      {item.title}
                    </h3>

                    {/* Node Description */}
                    <p className="font-ui text-xs text-[#c7b9be] mt-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  {/* Highlight pill for snapshot */}
                  {item.highlight && isVisible && (
                    <div className="mt-4 pt-3 border-t border-[#51313c]/80 flex items-center gap-1.5 text-[11px] font-mono text-[#f08aa2]">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                      <span>Locked timestamped copy</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Callout action link */}
        <div className="mt-10 flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-[#51313c]">
          <p className="font-ui text-xs text-[#c7b9be]">
            Recruiters see the verified skills present on your CV at the exact moment of application.
          </p>
          <Link
            href="/home"
            className="font-ui text-xs font-bold text-[#f08aa2] hover:text-[#f06b8b] transition-colors inline-flex items-center gap-1"
          >
            <span>Try Easy Apply on Student Dashboard</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
