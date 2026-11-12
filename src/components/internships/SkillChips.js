/**
 * SkillChips component for rendering candidate and required skills.
 */
export default function SkillChips({
  skills = [],
  max,
  highlightSkills = [],
  size = "sm",
  className = "",
}) {
  const visibleSkills = max ? skills.slice(0, max) : skills;
  const remainingCount = max && skills.length > max ? skills.length - max : 0;

  const sizeClasses = {
    xs: "text-[11px] px-2 py-0.5",
    sm: "text-xs px-2.5 py-1",
    md: "text-xs px-3 py-1.5 font-medium",
  };

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {visibleSkills.map((skill) => {
        const isMatched = highlightSkills.includes(skill);
        return (
          <span
            key={skill}
            className={`font-ui rounded-[var(--radius-sm)] border font-medium transition-colors select-none ${
              sizeClasses[size] || sizeClasses.sm
            } ${
              isMatched
                ? "bg-rose-soft text-primary border-primary/25 font-semibold"
                : "bg-surface-alt text-text-secondary border-border hover:border-border-strong hover:text-text"
            }`}
          >
            {skill}
          </span>
        );
      })}
      {remainingCount > 0 && (
        <span
          className={`font-ui rounded-[var(--radius-sm)] border border-border bg-surface text-text-muted select-none ${
            sizeClasses[size] || sizeClasses.sm
          }`}
          title={`${remainingCount} more skills: ${skills.slice(max).join(", ")}`}
        >
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}
