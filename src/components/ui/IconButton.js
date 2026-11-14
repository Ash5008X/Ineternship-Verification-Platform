/**
 * IconButton component for compact icon-only actions (bookmarks, dismiss, notifications, etc.).
 */
export default function IconButton({
  children,
  ariaLabel,
  variant = "ghost",
  size = "md",
  className = "",
  active = false,
  onClick,
  disabled = false,
  title,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-[var(--radius-md)] transition-colors duration-150 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    ghost:
      "bg-transparent text-text-secondary hover:text-text hover:bg-surface-alt active:bg-surface-alt",
    secondary:
      "bg-surface text-text-secondary border border-border hover:text-text hover:bg-surface-alt hover:border-border-strong",
    outline:
      "border border-border text-text-secondary hover:text-primary hover:border-primary/40 hover:bg-rose-soft/30",
    primary:
      "bg-primary text-white hover:bg-primary-hover active:bg-primary-hover",
  };

  const activeStyles = active
    ? "bg-rose-soft text-primary border-primary/30"
    : "";

  const sizes = {
    sm: "w-7 h-7 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel || title}
      title={title || ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${sizes[size] || sizes.md} ${
        variants[variant] || variants.ghost
      } ${activeStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
