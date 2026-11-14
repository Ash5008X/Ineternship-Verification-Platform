/**
 * Avatar component for user profiles and company logos.
 */
export default function Avatar({
  name = "User",
  initials,
  src,
  size = "md",
  className = "",
  variant = "brand", // 'brand' | 'surface' | 'neutral'
}) {
  const displayInitials =
    initials ||
    name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const sizes = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-14 h-14 text-lg",
  };

  const variants = {
    brand: "bg-rose-soft text-primary font-bold border border-border",
    primary: "bg-primary text-white font-bold",
    surface: "bg-surface-alt text-text font-bold border border-border",
    neutral: "bg-surface-alt text-text-secondary font-semibold border border-border",
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-[var(--radius-md)] shrink-0 select-none overflow-hidden font-ui ${
        sizes[size] || sizes.md
      } ${variants[variant] || variants.brand} ${className}`}
      aria-label={name}
      title={name}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{displayInitials}</span>
      )}
    </div>
  );
}
