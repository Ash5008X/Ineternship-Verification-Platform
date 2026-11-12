import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";

/**
 * ApplicationActivity card listing the latest application updates.
 */
export default function ApplicationActivity({
  activities = [],
  className = "",
}) {
  const getStatusBadge = (status, statusType) => {
    switch (statusType) {
      case "review":
        return (
          <Badge variant="warning" size="xs" dot>
            {status}
          </Badge>
        );
      case "shortlisted":
        return (
          <Badge variant="rose" size="xs" dot>
            {status}
          </Badge>
        );
      case "interview":
        return (
          <Badge variant="success" size="xs" dot>
            {status}
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" size="xs" dot>
            {status}
          </Badge>
        );
    }
  };

  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-xs ${className}`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-border/80">
        <div>
          <h3 className="font-ui font-bold text-sm text-text">
            Application Activity
          </h3>
          <p className="font-ui text-xs text-text-muted mt-0.5">
            Recent updates on your submissions
          </p>
        </div>
        <span className="font-ui text-xs font-semibold text-primary hover:text-primary-hover cursor-pointer select-none">
          View all
        </span>
      </div>

      <div className="divide-y divide-border/60">
        {activities.map((app) => (
          <div key={app.id} className="py-3 first:pt-3 last:pb-0">
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-start gap-2.5 min-w-0">
                <Avatar
                  name={app.company}
                  initials={app.initials}
                  size="sm"
                  className="rounded-[var(--radius-md)] shrink-0 mt-0.5"
                />
                <div className="min-w-0">
                  <h4 className="font-ui font-bold text-xs text-text truncate">
                    {app.role}
                  </h4>
                  <p className="font-ui text-xs text-text-secondary truncate mt-0.5">
                    {app.company}
                  </p>
                  <p className="font-ui text-[11px] text-text-muted mt-1">
                    {app.appliedDate}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                {getStatusBadge(app.status, app.statusType)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
