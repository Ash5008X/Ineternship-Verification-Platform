/**
 * ApplicationStatus widget displaying quick application progress counts.
 */
export default function ApplicationStatus({
  stats = { total: 8, underReview: 3, shortlisted: 2, interviews: 1 },
  className = "",
}) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-xs ${className}`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-border/80">
        <div>
          <h3 className="font-ui font-bold text-sm text-text">
            Application Status
          </h3>
          <p className="font-ui text-xs text-text-muted mt-0.5">
            Active submission pipeline
          </p>
        </div>
        <div className="text-right">
          <span className="font-number font-extrabold text-xl text-text leading-none block">
            {stats.total}
          </span>
          <span className="text-[10px] uppercase tracking-wider font-ui text-text-muted">
            Total
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3 text-center">
        <div className="p-2 rounded-[var(--radius-md)] bg-warning-bg/60 border border-warning/20">
          <span className="font-number font-bold text-base text-warning block">
            {stats.underReview}
          </span>
          <span className="font-ui text-[11px] text-text-secondary leading-tight block mt-0.5">
            Under Review
          </span>
        </div>

        <div className="p-2 rounded-[var(--radius-md)] bg-rose-soft/80 border border-border">
          <span className="font-number font-bold text-base text-primary block">
            {stats.shortlisted}
          </span>
          <span className="font-ui text-[11px] text-text-secondary leading-tight block mt-0.5">
            Shortlisted
          </span>
        </div>

        <div className="p-2 rounded-[var(--radius-md)] bg-success-bg/70 border border-success/20">
          <span className="font-number font-bold text-base text-success block">
            {stats.interviews}
          </span>
          <span className="font-ui text-[11px] text-text-secondary leading-tight block mt-0.5">
            Interview
          </span>
        </div>
      </div>
    </div>
  );
}
