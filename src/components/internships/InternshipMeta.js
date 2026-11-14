/**
 * Internship metadata items (Location, Work mode, Duration, Stipend).
 */
export default function InternshipMeta({
  location,
  workMode,
  duration,
  stipend,
  deadline,
  compact = false,
  className = "",
}) {
  return (
    <div
      className={`flex flex-wrap items-center text-xs text-text-secondary gap-x-3 gap-y-1.5 ${className}`}
    >
      {stipend && (
        <span className="inline-flex items-center gap-1 font-semibold text-text">
          <svg
            className="w-3.5 h-3.5 text-text-muted shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-number font-bold text-text">{stipend}</span>
        </span>
      )}

      {location && (
        <span className="inline-flex items-center gap-1">
          <svg
            className="w-3.5 h-3.5 text-text-muted shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
            />
          </svg>
          <span className="font-ui">{location}</span>
        </span>
      )}

      {workMode && (
        <span className="inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-border-strong shrink-0" />
          <span className="font-ui">{workMode}</span>
        </span>
      )}

      {duration && (
        <span className="inline-flex items-center gap-1">
          <svg
            className="w-3.5 h-3.5 text-text-muted shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-ui">{duration}</span>
        </span>
      )}

      {!compact && deadline && (
        <span className="inline-flex items-center gap-1 text-text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-border-strong shrink-0" />
          <span>Apply by {deadline}</span>
        </span>
      )}
    </div>
  );
}
