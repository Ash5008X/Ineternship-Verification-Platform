
export default function RecruiterSectionHeader({
  title,
  subtitle,
  action,
  className = "",
}) {
  return (
    <div
      className={`flex items-start sm:items-center justify-between gap-3 ${className}`}
    >
      <div>
        <h2 className="font-ui font-extrabold text-base sm:text-lg text-text tracking-tight">
          {title}
        </h2>

        {subtitle && (
          <p className="font-ui text-xs text-text-secondary mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
