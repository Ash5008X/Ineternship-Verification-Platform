/**
 * Card container component with InternCheck surface styling.
 */
export default function Card({
  children,
  variant = "default",
  className = "",
  padding = "md",
  onClick,
  ...props
}) {
  const variants = {
    default: "bg-surface border border-border shadow-xs",
    alt: "bg-surface-alt border border-border",
    elevated: "bg-surface-elevated border border-border shadow-sm",
    interactive:
      "bg-surface border border-border hover:border-border-strong transition-all duration-150 cursor-pointer shadow-xs",
    highlight:
      "bg-surface border border-primary/30 shadow-xs ring-1 ring-primary/10",
  };

  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4 sm:p-5",
    lg: "p-5 sm:p-6",
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-[var(--radius-lg)] ${
        variants[variant] || variants.default
      } ${paddings[padding] || paddings.md} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
