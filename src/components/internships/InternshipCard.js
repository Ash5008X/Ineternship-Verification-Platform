import Avatar from "../ui/Avatar";
import MatchBadge from "./MatchBadge";
import RiskBadge from "./RiskBadge";
import IconButton from "../ui/IconButton";

/**
 * Internship card for the discovery feed list.
 */
export default function InternshipCard({
  internship,
  isSelected = false,
  onSelect,
  onToggleBookmark,
  onRemove,
}) {
  const {
    id,
    role,
    company,
    location,
    workMode,
    stipend,
    matchPercentage,
    riskLevel,
    isBookmarked,
    skills = [],
    initials,
  } = internship;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect && onSelect(internship)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect && onSelect(internship);
        }
      }}
      className={`group relative text-left rounded-[var(--radius-lg)] p-4 transition-all duration-150 cursor-pointer border select-none ${
        isSelected
          ? "bg-surface border-primary ring-1 ring-primary/30 shadow-xs"
          : "bg-surface border-border hover:border-border-strong hover:bg-surface-alt/40"
      }`}
    >
      {/* Top Header: Logo, Company & Role, Action Buttons */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <Avatar
            name={company}
            initials={initials}
            size="md"
            className="shrink-0 rounded-[var(--radius-md)]"
          />
          <div className="min-w-0">
            <h3 className="font-ui font-bold text-sm text-text truncate group-hover:text-primary transition-colors leading-snug">
              {role}
            </h3>
            <p className="font-ui text-xs text-text-secondary truncate mt-0.5">
              {company}
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div
          className="flex items-center gap-1 shrink-0 -mr-1"
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton
            size="sm"
            variant="ghost"
            title={isBookmarked ? "Remove bookmark" : "Save internship"}
            ariaLabel={isBookmarked ? "Remove bookmark" : "Save internship"}
            active={isBookmarked}
            onClick={() => onToggleBookmark && onToggleBookmark(id)}
          >
            <svg
              className={`w-4 h-4 ${
                isBookmarked ? "fill-primary text-primary" : "text-text-muted hover:text-text"
              }`}
              fill={isBookmarked ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
              />
            </svg>
          </IconButton>

          <IconButton
            size="sm"
            variant="ghost"
            title="Dismiss opportunity"
            ariaLabel="Dismiss opportunity"
            onClick={() => onRemove && onRemove(id)}
          >
            <svg
              className="w-4 h-4 text-text-muted hover:text-danger"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </IconButton>
        </div>
      </div>

      {/* Meta tags: Location & Work Mode */}
      <div className="mt-2.5 flex items-center text-xs text-text-secondary gap-2">
        <span className="truncate">{location}</span>
        <span className="w-1 h-1 rounded-full bg-border-strong shrink-0" />
        <span className="shrink-0">{workMode}</span>
      </div>

      {/* Badges: Match Score & Risk Level (Visually Separate) */}
      <div className="mt-3 flex items-center justify-between gap-2 pt-2.5 border-t border-border/60">
        <div className="flex items-center gap-1.5 flex-wrap">
          <MatchBadge percentage={matchPercentage} size="xs" />
          <RiskBadge level={riskLevel} size="xs" />
        </div>

        <div className="text-right shrink-0">
          <span className="font-number font-bold text-xs text-text">
            {stipend}
          </span>
        </div>
      </div>

      {/* Skills snippet */}
      {skills.length > 0 && (
        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
          {skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="font-ui text-[11px] px-2 py-0.5 rounded-[var(--radius-sm)] bg-surface-alt text-text-muted border border-border"
            >
              {skill}
            </span>
          ))}
          {skills.length > 3 && (
            <span className="text-[10px] text-text-muted font-ui">
              +{skills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Active accent indicator */}
      {isSelected && (
        <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-md" />
      )}
    </div>
  );
}
