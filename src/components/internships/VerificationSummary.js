import RiskBadge from "./RiskBadge";

/**
 * Verification summary card showing system-level verification checks and trust metrics.
 */
export default function VerificationSummary({
  verification,
  className = "",
}) {
  if (!verification) return null;

  const { id, lastChecked, riskScore, riskLevel, checks = [] } = verification;

  return (
    <div
      className={`rounded-[var(--radius-md)] border border-border bg-surface-alt/70 p-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-success-bg text-success border border-success/30 flex items-center justify-center shrink-0">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <div>
            <h4 className="font-ui font-bold text-sm text-text leading-none">
              Verification
            </h4>
            <p className="font-mono text-[11px] text-text-muted mt-0.5">
              ID: {id} • Checked {lastChecked}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <RiskBadge level={riskLevel} size="xs" />
          <div className="text-right">
            <span className="font-mono text-xs font-semibold text-text">
              {riskScore}
              <span className="text-text-muted font-normal text-[10px]">/100</span>
            </span>
            <p className="text-[10px] text-text-muted font-ui uppercase tracking-wide">
              Risk Score
            </p>
          </div>
        </div>
      </div>

      {/* Verification Checks List */}
      <div className="mt-3 space-y-2">
        {checks.map((check) => {
          const isPass = check.status === "PASS";
          return (
            <div
              key={check.id}
              className="flex items-start justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-2 min-w-0">
                <span
                  className={`font-mono text-[11px] font-semibold px-1.5 py-0.2 rounded shrink-0 ${
                    isPass
                      ? "text-success bg-success-bg border border-success/30"
                      : "text-warning bg-warning-bg border border-warning/30"
                  }`}
                >
                  {isPass ? "PASS" : "FLAG"}
                </span>
                <div className="min-w-0">
                  <span className="font-ui font-medium text-text block leading-tight">
                    {check.label}
                  </span>
                  {check.detail && (
                    <span className="font-ui text-[11px] text-text-muted block mt-0.5 truncate">
                      {check.detail}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px] text-text-muted">
        <span className="font-ui">Verified by InternCheck Automated Engine</span>
        <span className="font-mono text-[10px]">SHA-256 Validated</span>
      </div>
    </div>
  );
}
