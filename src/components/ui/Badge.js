/**
 * Badge component for InternCheck status chips and tags.
 */
export default function Badge({
  children,
  variant = "neutral",
  size = "sm",
  className = "",
  dot = false,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center font-ui font-medium rounded-[var(--radius-sm)] transition-colors select-none";

  const variants = {
    neutral: "bg-surface-alt text-text-secondary border border-border",
    primary: "bg-rose-soft text-primary border border-border",
    rose: "bg-rose-soft text-rose border border-border",
    success: "bg-success-bg text-success border border-success/25",
    warning: "bg-warning-bg text-warning border border-warning/25",
    danger: "bg-danger-bg text-danger border border-danger/25",
    outline: "bg-transparent text-text-secondary border border-border",
  };

  const sizes = {
    xs: "text-[11px] px-1.5 py-0.5 gap-1",
    sm: "text-xs px-2 py-0.5 gap-1.5",
    md: "text-xs px-2.5 py-1 gap-1.5 font-semibold",
  };

  const dotColors = {
    neutral: "bg-text-muted",
    primary: "bg-primary",
    rose: "bg-rose",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    outline: "bg-text-muted",
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant] || variants.neutral} ${
        sizes[size] || sizes.sm
      } ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            dotColors[variant] || "bg-current"
          }`}
        />
      )}
      {children}
    </span>
  );
}
