import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import MatchBadge from "./MatchBadge";
import RiskBadge from "./RiskBadge";
import SkillChips from "./SkillChips";
import InternshipMeta from "./InternshipMeta";
import VerificationSummary from "./VerificationSummary";

/**
 * Detailed view for the selected internship in the split discovery layout.
 */
export default function InternshipDetails({
  internship,
  userSkills = [],
  onToggleBookmark,
  onApply,
}) {
  if (!internship) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-8 text-center">
        <p className="text-xs text-text-muted">Select an internship to view details</p>
      </div>
    );
  }

  const {
    id,
    role,
    company,
    companyDomain,
    location,
    workMode,
    duration,
    stipend,
    applicationDeadline,
    matchPercentage,
    riskLevel,
    applicationType,
    description,
    workItems = [],
    skills = [],
    verification,
    isBookmarked,
    initials,
    postedTime,
    applicantsCount,
  } = internship;

  const isEasyApply = applicationType === "Easy Apply";

  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface shadow-xs overflow-hidden">
      {/* Top Banner / Header Info */}
      <div className="p-5 sm:p-6 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <Avatar
              name={company}
              initials={initials}
              size="lg"
              className="rounded-[var(--radius-md)] shrink-0"
            />
            <div className="min-w-0">
              <h2 className="font-ui font-extrabold text-lg sm:text-xl text-text leading-tight">
                {role}
              </h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="font-ui font-medium text-sm text-text-secondary">
                  {company}
                </span>
                <span className="w-1 h-1 rounded-full bg-border-strong shrink-0" />
                <span className="font-mono text-xs text-text-muted">
                  {companyDomain}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Match & Risk Indicators (Visually Separate) */}
        <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-border/70 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <MatchBadge percentage={matchPercentage} size="sm" />
            <RiskBadge level={riskLevel} size="sm" />
          </div>

          <div className="text-right">
            <span className="font-number font-extrabold text-base text-text">
              {stipend}
            </span>
            <span className="text-text-muted text-xs block font-ui">
              Fixed Stipend
            </span>
          </div>
        </div>

        {/* Metadata row */}
        <div className="mt-3.5 pt-3 border-t border-border/70">
          <InternshipMeta
            location={location}
            workMode={workMode}
            duration={duration}
            deadline={applicationDeadline}
          />
          <div className="mt-2 flex items-center gap-3 text-[11px] text-text-muted">
            <span>Posted {postedTime}</span>
            <span>•</span>
            <span>{applicantsCount} applicants</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {isEasyApply ? (
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => onApply && onApply(internship)}
              icon={
                <svg
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
                </svg>
              }
            >
              Easy Apply
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => onApply && onApply(internship)}
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
              }
            >
              Apply on Company Website
            </Button>
          )}

          <Button
            variant={isBookmarked ? "soft" : "secondary"}
            size="md"
            className="sm:w-auto shrink-0"
            onClick={() => onToggleBookmark && onToggleBookmark(id)}
            icon={
              <svg
                className={`w-4 h-4 ${
                  isBookmarked ? "fill-primary text-primary" : "text-text-secondary"
                }`}
                fill={isBookmarked ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                />
              </svg>
            }
          >
            {isBookmarked ? "Saved" : "Bookmark"}
          </Button>
        </div>
      </div>

      {/* Detail Content Body */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* Verification Summary */}
        <section aria-labelledby="verification-heading">
          <VerificationSummary verification={verification} />
        </section>

        {/* Role Overview */}
        <section>
          <h3 className="font-ui font-bold text-sm text-text mb-2 uppercase tracking-wider text-[11px] text-text-muted">
            About the Role
          </h3>
          <p className="font-ui text-sm text-text-secondary leading-relaxed">
            {description}
          </p>
        </section>

        {/* Required Skills & Candidate Match */}
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="font-ui font-bold text-sm text-text uppercase tracking-wider text-[11px] text-text-muted">
              Required Skills
            </h3>
            <span className="text-[11px] font-ui text-text-muted">
              Matched against your CV
            </span>
          </div>
          <SkillChips
            skills={skills}
            highlightSkills={userSkills}
            size="sm"
          />
        </section>

        {/* What You'll Work On */}
        {workItems.length > 0 && (
          <section>
            <h3 className="font-ui font-bold text-sm text-text mb-2.5 uppercase tracking-wider text-[11px] text-text-muted">
              What You&apos;ll Work On
            </h3>
            <ul className="space-y-2">
              {workItems.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-text-secondary leading-normal"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Application Method & Notice */}
        <section className="rounded-[var(--radius-md)] border border-border bg-surface-alt/40 p-3.5 text-xs text-text-muted">
          <div className="flex items-center gap-2 text-text font-medium mb-1">
            <svg
              className="w-4 h-4 text-text-muted shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
            <span>Application Method</span>
          </div>
          <p>
            {isEasyApply
              ? "Your InternCheck student profile and verified skills will be submitted directly to the employer's review portal without fee redirects."
              : `Applications for this position are hosted on ${companyDomain}. InternCheck has validated the external URL destination.`}
          </p>
        </section>
      </div>
    </div>
  );
}
