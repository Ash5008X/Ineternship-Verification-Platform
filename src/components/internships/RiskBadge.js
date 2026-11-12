/**
 * Risk badge indicator using status colors (green = low, amber = medium, red = high).
 */
export default function RiskBadge({
  level = "low",
  size = "sm",
  showIcon = true,
  className = "",
}) {
  const normalizedLevel = (level || "low").toLowerCase();

  const configs = {
    low: {
      text: "LOW RISK",
      containerClass: "bg-success-bg text-success border-success/30",
      dotClass: "bg-success",
    },
    medium: {
      text: "MEDIUM RISK",
      containerClass: "bg-warning-bg text-warning border-warning/30",
      dotClass: "bg-warning",
    },
    high: {
      text: "HIGH RISK",
      containerClass: "bg-danger-bg text-danger border-danger/30",
      dotClass: "bg-danger",
    },
  };

  const config = configs[normalizedLevel] || configs.low;

  const sizeClasses = {
    xs: "text-[10px] px-1.5 py-0.5 gap-1",
    sm: "text-xs px-2 py-0.5 gap-1.5",
    md: "text-xs px-2.5 py-1 gap-1.5 font-bold",
  };

  return (
    <span
      className={`inline-flex items-center font-ui font-bold rounded-[var(--radius-sm)] border select-none uppercase tracking-wider ${
        config.containerClass
      } ${sizeClasses[size] || sizeClasses.sm} ${className}`}
      title={`Risk level: ${config.text}`}
    >
      {showIcon ? (
        <svg
          className="w-3 h-3 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
          />
        </svg>
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotClass}`} />
      )}
      <span>{config.text}</span>
    </span>
  );
}
