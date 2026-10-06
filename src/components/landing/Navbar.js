"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/**
 * Floating liquid-glass navbar for the public landing page.
 * Features translucent refraction, backdrop-filter blur/saturation,
 * scroll awareness, and navigation anchors.
 */
export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Verify", href: "#verification" },
    { name: "Match", href: "#matching" },
    { name: "Experiences", href: "#experiences" },
    { name: "Apply", href: "#apply" },
  ];

  return (
    <header className="fixed top-3 sm:top-5 inset-x-0 z-50 px-4 sm:px-6 max-w-6xl mx-auto select-none">
      <div
        className={`w-full h-16 sm:h-[66px] px-5 sm:px-7 rounded-[18px] transition-all duration-300 flex items-center justify-between ${
          isScrolled ? "liquid-glass-scrolled shadow-lg" : "liquid-glass shadow-md"
        }`}
      >
        {/* Logo / Brand Wordmark */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold shadow-xs group-hover:bg-primary-hover transition-colors">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
              />
            </svg>
          </div>
          <span className="font-ui font-extrabold text-base tracking-tight text-text">
            Intern<span className="text-primary">Check</span>
          </span>
        </Link>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="font-ui text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-primary transition-colors duration-150 py-1"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right Action: Get Started Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/home"
            className="inline-flex items-center justify-center font-ui text-xs sm:text-sm font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover active:scale-[0.98] transition-all shadow-xs"
          >
            Get Started
          </Link>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text hover:bg-surface-alt/70 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-4 rounded-2xl liquid-glass-scrolled shadow-xl border border-border space-y-2">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block font-ui text-sm font-semibold text-text py-2 px-3 rounded-lg hover:bg-surface-alt/70 transition-colors"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-2 border-t border-border">
            <Link
              href="/home"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center font-ui text-sm font-bold py-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors"
            >
              Launch Student Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
