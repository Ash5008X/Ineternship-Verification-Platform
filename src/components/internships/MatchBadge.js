/**
 * Match percentage badge using brand/rose color tokens and Space Grotesk numbers.
 */
export default function MatchBadge({
  percentage = 85,
  size = "sm",
  showLabel = true,
  className = "",
}) {
  const sizeClasses = {
    xs: "text-[11px] px-1.5 py-0.5",
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-[var(--radius-sm)] bg-rose-soft text-primary border border-border tracking-tight select-none ${
        sizeClasses[size] || sizeClasses.sm
      } ${className}`}
      title={`${percentage}% skill match based on your CV`}
    >
      <span className="font-number font-bold text-[1.05em]">
        {percentage}%
      </span>
      {showLabel && (
        <span className="font-ui uppercase tracking-wider text-[0.8em] font-bold">
          Match
        </span>
      )}
    </span>
  );
}
