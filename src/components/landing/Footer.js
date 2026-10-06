import Link from "next/link";

/**
 * Minimal public footer for InternCheck.
 */
export default function Footer() {
  return (
    <footer className="relative border-t border-border bg-surface/80 py-12 px-4 sm:px-6 lg:px-8 z-10 select-none">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div>
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <div className="w-6 h-6 rounded bg-primary text-white flex items-center justify-center font-bold text-xs">
              IC
            </div>
            <span className="font-ui font-extrabold text-sm text-text">
              Intern<span className="text-primary">Check</span>
            </span>
          </div>
          <p className="font-ui text-xs text-text-muted mt-1.5">
            Internship discovery, verification and experience intelligence.
          </p>
        </div>

        <div className="flex items-center gap-6 font-ui text-xs text-text-secondary">
          <Link href="/home" className="hover:text-primary transition-colors">
            Student Dashboard
          </Link>
          <a href="#verification" className="hover:text-primary transition-colors">
            Verification Protocol
          </a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">
            How It Works
          </a>
        </div>

        <div className="font-mono text-xs text-text-muted">
          &copy; 2026 InternCheck. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
