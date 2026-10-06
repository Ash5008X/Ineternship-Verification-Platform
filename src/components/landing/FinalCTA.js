"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const WORDS = ["DISCOVER", "VERIFY", "MATCH", "APPLY", "TRACK"];

/**
 * Final CTA section: Editorial heading with continuous typing animation
 * cycling through the core product actions (DISCOVER, VERIFY, MATCH, APPLY, TRACK).
 */
export default function FinalCTA() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState(WORDS[0]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = WORDS[currentWordIndex];
    let timeout;

    if (!isDeleting && displayText === currentWord) {
      // Keep word visible for ~1.2 seconds
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 1200);
    } else if (isDeleting && displayText === "") {
      // Word deleted letter by letter; brief pause before typing next word
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % WORDS.length);
      }, 250);
    } else if (isDeleting) {
      // Delete letter by letter
      timeout = setTimeout(() => {
        setDisplayText((prev) => prev.slice(0, -1));
      }, 50);
    } else {
      // Type letter by letter
      timeout = setTimeout(() => {
        setDisplayText((prev) => currentWord.slice(0, prev.length + 1));
      }, 90);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentWordIndex]);

  return (
    <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto z-10 text-center select-none">
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-text leading-[1.15] tracking-tight">
          Your next internship deserves better information.
        </h2>

        {/* Dynamic Typing Animation: DISCOVER | VERIFY | MATCH | APPLY | TRACK */}
        <div className="min-h-[48px] sm:min-h-[56px] flex items-center justify-center">
          <span className="font-mono font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-[40px] text-primary tracking-[0.06em] uppercase">
            {displayText}
            <span
              className="inline-block text-rose font-light ml-1 animate-cursor-blink select-none"
              aria-hidden="true"
            >
              |
            </span>
          </span>
        </div>

        <div className="pt-4">
          <Link
            href="/home"
            className="inline-flex items-center justify-center font-ui text-base font-bold px-8 py-4 rounded-xl bg-primary text-white hover:bg-primary-hover active:scale-[0.98] transition-all shadow-lg group"
          >
            <span>Get Started with InternCheck</span>
            <span className="ml-2 group-hover:translate-x-1 transition-transform">
              &rarr;
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
