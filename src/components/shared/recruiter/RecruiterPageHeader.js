"use client";

export default function RecruiterPageHeader({
  recruiter,
  message = "Manage your internship opportunities and applications.",
}) {
  const recruiterName =
    recruiter?.greetingName ||
    recruiter?.firstName ||
    recruiter?.name ||
    "Recruiter";

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block w-2 h-2 rounded-full bg-primary" />

          <span className="font-ui text-xs font-bold uppercase tracking-wider text-text-muted">
            Recruiter Dashboard
          </span>
        </div>

        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-text tracking-tight">
          Good afternoon, {recruiterName}.
        </h1>

        <p className="font-ui text-sm text-text-secondary mt-1">
          {message}
        </p>
      </div>
    </div>
  );
}