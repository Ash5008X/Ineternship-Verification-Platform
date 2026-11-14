/**
 * Button component using InternCheck design tokens.
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  type = "button",
  onClick,
  disabled = false,
  icon,
  iconPosition = "left",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-ui rounded-[var(--radius-md)] transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    primary:
      "bg-primary text-white hover:bg-primary-hover active:bg-primary-hover shadow-xs border border-transparent",
    secondary:
      "bg-surface text-text border border-border hover:bg-surface-alt hover:border-border-strong active:bg-surface-alt",
    outline:
      "bg-transparent text-primary border border-primary hover:bg-rose-soft active:bg-rose-soft",
    ghost:
      "bg-transparent text-text-secondary hover:text-text hover:bg-surface-alt active:bg-surface-alt",
    soft:
      "bg-rose-soft text-primary hover:bg-rose-soft/80 active:bg-rose-soft/70 border border-transparent",
  };

  const sizes = {
    sm: "text-xs font-semibold px-2.5 py-1.5 gap-1.5",
    md: "text-sm font-semibold px-3.5 py-2 gap-2",
    lg: "text-base font-semibold px-5 py-2.5 gap-2.5",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${
        sizes[size] || sizes.md
      } ${widthStyle} ${className}`}
      {...props}
    >
      {icon && iconPosition === "left" && (
        <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {icon && iconPosition === "right" && (
        <span className="shrink-0">{icon}</span>
      )}
    </button>
  );
}
