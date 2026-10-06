import Link from "next/link";

/**
 * Recruiter section: Clean minimal invitation for hiring teams.
 */
export default function RecruiterSection() {
  return (
    <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto z-10">
      <div className="rounded-3xl bg-surface border border-border shadow-md p-8 sm:p-12 lg:p-16 relative overflow-hidden select-none">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle,rgba(248,228,234,0.6)_0%,transparent_70%)] blur-[70px] pointer-events-none" />

        <div className="max-w-2xl space-y-4 relative z-10">
          <span className="font-mono text-xs uppercase tracking-widest text-primary font-semibold">
            FOR EMPLOYERS & HIRING MANAGERS
          </span>

          <h2 className="font-display text-3xl sm:text-4xl text-text leading-tight tracking-tight">
            Hire interns with better signals.
          </h2>

          <p className="font-ui text-sm sm:text-base text-text-secondary leading-relaxed">
            Post opportunities, receive relevant applications, review student profiles and manage your hiring pipeline with verified skill matching.
          </p>

          <div className="pt-4 flex items-center gap-4 flex-wrap">
            <Link
              href="/recruiter"
              className="inline-flex items-center justify-center font-ui text-sm font-bold px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary-hover active:scale-[0.98] transition-all shadow-xs"
            >
              For Recruiters &rarr;
            </Link>

            <span className="font-ui text-xs text-text-muted">
              Zero placement fees for verified startups & labs.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
