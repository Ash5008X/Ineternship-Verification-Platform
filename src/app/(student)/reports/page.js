"use client";

export default function ReportsPage() {
  return (
    <div className="min-h-full w-full bg-background font-ui text-text antialiased">
      <main className="flex-1 min-w-0 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Student Portal
            </span>
          </div>

          <div>
            <h1 className="font-display text-3xl sm:text-4xl text-text tracking-tight">
              Reports & Analytics.
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Track your submitted reports and help keep InternCheck reliable.
            </p>
          </div>
        </section>

        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
          <h2 className="font-display text-lg text-text">
            Reports
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Your report history and reporting tools will appear here.
          </p>
        </div>
      </main>
    </div>
  );
}