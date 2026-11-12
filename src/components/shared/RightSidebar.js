import ApplicationStatus from "../applications/ApplicationStatus";
import Avatar from "../ui/Avatar";
import MatchBadge from "../internships/MatchBadge";
import RiskBadge from "../internships/RiskBadge";
import Button from "../ui/Button";

/**
 * Right sidebar with compact student utilities:
 * 1. Application Status
 * 2. Saved Internships
 * 3. Recently Viewed
 * 4. Quick Actions
 */
export default function RightSidebar({
  stats,
  savedCount = 12,
  recentlyViewed = [],
  onSelectRecent,
  onNavigateAction,
}) {
  return (
    <div className="space-y-4">
      {/* 1. Application Status */}
      <ApplicationStatus stats={stats} />

      {/* 2. Saved Internships */}
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-soft text-primary flex items-center justify-center shrink-0 border border-border">
              <svg
                className="w-4 h-4 fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            </div>
            <div>
              <span className="font-number font-extrabold text-base text-text block leading-tight">
                {savedCount}
              </span>
              <span className="font-ui text-xs text-text-secondary">
                Saved internships
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateAction && onNavigateAction("bookmarks")}
            className="font-ui text-xs font-bold text-primary hover:text-primary-hover select-none cursor-pointer"
          >
            View bookmarks &rarr;
          </button>
        </div>
      </div>

      {/* 3. Recently Viewed */}
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-border/80">
          <h3 className="font-ui font-bold text-sm text-text">
            Recently Viewed
          </h3>
          <span className="font-ui text-[11px] text-text-muted">
            Last 7 days
          </span>
        </div>

        <div className="divide-y divide-border/60">
          {recentlyViewed.map((item) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectRecent && onSelectRecent(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectRecent && onSelectRecent(item);
                }
              }}
              className="py-2.5 first:pt-2.5 last:pb-0 group cursor-pointer text-left"
            >
              <div className="flex items-start gap-2.5">
                <Avatar
                  name={item.company}
                  initials={item.initials}
                  size="xs"
                  className="rounded mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-ui font-bold text-xs text-text truncate group-hover:text-primary transition-colors">
                    {item.role}
                  </h4>
                  <p className="font-ui text-[11px] text-text-muted truncate mt-0.5">
                    {item.company} • {item.location}
                  </p>
                  <div className="flex items-center justify-between gap-1.5 mt-1.5">
                    <div className="flex items-center gap-1">
                      <MatchBadge percentage={item.matchScore} size="xs" showLabel={false} />
                      <RiskBadge level={item.riskLevel} size="xs" showIcon={false} />
                    </div>
                    <span className="font-number font-bold text-[11px] text-text">
                      {item.stipend}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Quick Actions */}
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-xs">
        <h3 className="font-ui font-bold text-sm text-text pb-2.5 border-b border-border/80 mb-3">
          Quick Actions
        </h3>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => onNavigateAction && onNavigateAction("browse")}
            className="w-full flex items-center justify-between p-2.5 rounded-[var(--radius-md)] bg-surface-alt hover:bg-surface-alt/70 border border-border hover:border-border-strong text-xs font-semibold text-text transition-colors group cursor-pointer text-left"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-text-muted group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <span>Browse Internships</span>
            </span>
            <span className="text-text-muted group-hover:text-text font-mono">&rarr;</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateAction && onNavigateAction("cv")}
            className="w-full flex items-center justify-between p-2.5 rounded-[var(--radius-md)] bg-surface-alt hover:bg-surface-alt/70 border border-border hover:border-border-strong text-xs font-semibold text-text transition-colors group cursor-pointer text-left"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-text-muted group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span>Update CV</span>
            </span>
            <span className="text-text-muted group-hover:text-text font-mono">&rarr;</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateAction && onNavigateAction("applications")}
            className="w-full flex items-center justify-between p-2.5 rounded-[var(--radius-md)] bg-surface-alt hover:bg-surface-alt/70 border border-border hover:border-border-strong text-xs font-semibold text-text transition-colors group cursor-pointer text-left"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-text-muted group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
              <span>View Applications</span>
            </span>
            <span className="text-text-muted group-hover:text-text font-mono">&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
}
