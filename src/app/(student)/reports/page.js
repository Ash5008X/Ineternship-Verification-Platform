
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const categories = [
  {
    value: "registration_fee",
    label: "Registration fee requested",
    description: "The company asks for money to register or apply.",
  },
  {
    value: "payment_scam",
    label: "Payment scam",
    description: "Suspicious payment requests or financial fraud.",
  },
  {
    value: "company_impersonation",
    label: "Company impersonation",
    description: "Someone is pretending to represent a real company.",
  },
  {
    value: "fake_listing",
    label: "Fake internship listing",
    description: "The internship or job opportunity appears fabricated.",
  },
  {
    value: "misleading_information",
    label: "Misleading information",
    description: "The listing contains false or misleading details.",
  },
  {
    value: "suspicious_contact",
    label: "Suspicious contact",
    description: "Unusual messages, links, or requests from a recruiter.",
  },
  {
    value: "other",
    label: "Other concern",
    description: "Something else that may put students at risk.",
  },
];

const moderationStyles = {
  pending: "border-amber-500/20 bg-amber-500/10 text-amber-600",
  under_review: "border-violet-500/20 bg-violet-500/10 text-violet-600",
  substantiated: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
  unsubstantiated: "border-gray-500/20 bg-gray-500/10 text-gray-500",
  dismissed: "border-red-500/20 bg-red-500/10 text-red-500",
};

const moderationLabels = {
  pending: "Pending",
  under_review: "Under review",
  substantiated: "Confirmed",
  unsubstantiated: "Unsubstantiated",
  dismissed: "Dismissed",
};

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/10";

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getCategoryLabel(value) {
  return (
    categories.find((category) => category.value === value)?.label ||
    "Other concern"
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        moderationStyles[status] ||
        "border-border bg-surface-alt text-text-muted"
      }`}
    >
      {moderationLabels[status] || "Unknown status"}
    </span>
  );
}

function ReportCard({ report }) {
  const internship = report.internshipId;
  const company = report.companyId;

  const evidence = Array.isArray(report.evidence)
    ? report.evidence
    : [];

  return (
    <article className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            {getCategoryLabel(report.category)}
          </p>

          <h3 className="mt-2 break-words text-base font-bold text-text">
            {internship?.title ||
              company?.name ||
              "General report"}
          </h3>

          {(internship?.title || company?.name) && (
            <p className="mt-1 text-xs text-text-muted">
              {company?.name ||
                internship?.companyId?.name ||
                "Company information unavailable"}
            </p>
          )}
        </div>

        <StatusBadge status={report.moderationStatus} />
      </div>

      <p className="mt-4 whitespace-pre-line break-words text-sm leading-6 text-text-secondary">
        {report.description}
      </p>

      {evidence.length > 0 && (
        <div className="mt-4 rounded-xl bg-background p-4">
          <p className="mb-2 text-xs font-semibold text-text">
            Submitted evidence
          </p>

          <div className="space-y-2">
            {evidence.map((item, index) => (
              <div key={item._id || index}>
                {item.sourceUrl && (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-xs font-medium text-primary hover:underline"
                  >
                    {item.sourceUrl}
                  </a>
                )}

                {item.description && (
                  <p className="mt-1 text-xs leading-5 text-text-secondary">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <span className="text-xs text-text-muted">
          Submitted {formatDate(report.createdAt)}
        </span>

        {report.resolution && (
          <span className="text-xs font-medium text-text-secondary">
            Resolution available
          </span>
        )}
      </div>

      {report.resolution && (
        <div className="mt-3 rounded-xl border border-border bg-background p-4">
          <p className="text-xs font-semibold text-text">
            Resolution
          </p>

          <p className="mt-1 whitespace-pre-line text-sm leading-6 text-text-secondary">
            {report.resolution}
          </p>

          {report.resolvedAt && (
            <p className="mt-2 text-[11px] text-text-muted">
              Resolved {formatDate(report.resolvedAt)}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

function LoadingCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-surface p-6">
      <div className="h-3 w-1/3 rounded bg-surface-alt" />
      <div className="mt-4 h-5 w-2/3 rounded bg-surface-alt" />
      <div className="mt-4 h-3 w-full rounded bg-surface-alt" />
      <div className="mt-2 h-3 w-5/6 rounded bg-surface-alt" />
    </div>
  );
}

function EmptyReports() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface px-5 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-soft text-primary">
        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.7}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v4m0 4h.01M10.3 3.86 1.82 18.5A1.5 1.5 0 003.12 21h17.76a1.5 1.5 0 001.3-2.5L13.7 3.86a1.96 1.96 0 00-3.4 0z"
          />
        </svg>
      </div>

      <h3 className="mt-4 font-display text-lg font-bold text-text">
        No reports submitted
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
        Your submitted reports will appear here. If you encounter a
        suspicious internship or company, help protect other students
        by reporting it.
      </p>
    </div>
  );
}

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [internships, setInternships] = useState([]);

  const [loading, setLoading] = useState(true);
  const [internshipsLoading, setInternshipsLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    category: "",
    internshipId: "",
    description: "",
    evidenceUrl: "",
    evidenceDescription: "",
  });

  const fetchReports = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/reports?page=1&limit=20",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          signal,
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load your reports."
        );
      }

      setReports(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Unable to load reports.");
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchReports(controller.signal);

    return () => controller.abort();
  }, [fetchReports]);

  // Load internships for the optional report target selector.
  useEffect(() => {
    const controller = new AbortController();

    async function fetchInternships() {
      try {
        const response = await fetch(
          "/api/internships?page=1&limit=100&sort=newest",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load internships."
          );
        }

        setInternships(
          Array.isArray(result.data) ? result.data : []
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Failed to load report targets:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setInternshipsLoading(false);
        }
      }
    }

    fetchInternships();

    return () => controller.abort();
  }, []);

  const reportStats = useMemo(() => {
    return {
      total: reports.length,
      pending: reports.filter(
        (report) => report.moderationStatus === "pending"
      ).length,
      reviewing: reports.filter(
        (report) => report.moderationStatus === "under_review"
      ).length,
      resolved: reports.filter((report) =>
        ["substantiated", "unsubstantiated", "dismissed"].includes(
          report.moderationStatus
        )
      ).length,
    };
  }, [reports]);

  function updateForm(key, value) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function resetForm() {
    setForm({
      category: "",
      internshipId: "",
      description: "",
      evidenceUrl: "",
      evidenceDescription: "",
    });

    setSubmitError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitError("");
    setSuccessMessage("");

    if (!form.category) {
      setSubmitError("Please select a report category.");
      return;
    }

    if (form.description.trim().length < 20) {
      setSubmitError(
        "Please provide at least 20 characters describing the issue."
      );
      return;
    }

    if (form.description.trim().length > 5000) {
      setSubmitError("Description cannot exceed 5000 characters.");
      return;
    }

    if (form.evidenceUrl.trim()) {
      try {
        const url = new URL(form.evidenceUrl.trim());

        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error();
        }
      } catch {
        setSubmitError(
          "Please enter a valid evidence URL beginning with http:// or https://."
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      const evidence = [];

      if (
        form.evidenceUrl.trim() ||
        form.evidenceDescription.trim()
      ) {
        evidence.push({
          type: form.evidenceUrl.trim() ? "url" : "observation",
          sourceUrl: form.evidenceUrl.trim() || undefined,
          description:
            form.evidenceDescription.trim() || undefined,
        });
      }

      const payload = {
        category: form.category,
        description: form.description.trim(),
        evidence,
      };

      if (form.internshipId) {
        payload.internshipId = form.internshipId;
      }

      const response = await fetch("/api/reports", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to submit your report."
        );
      }

      if (result.data) {
        setReports((previous) => [
          result.data,
          ...previous,
        ]);
      } else {
        const controller = new AbortController();
        await fetchReports(controller.signal);
      }

      resetForm();
      setShowForm(false);
      setSuccessMessage(
        "Your report has been submitted successfully."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      setSubmitError(
        err.message || "Something went wrong while submitting your report."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-full w-full bg-background font-ui text-text antialiased">
      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Heading */}
        <section className="mb-7">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />

            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Student Portal
            </span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-3xl tracking-tight text-text sm:text-4xl">
                Reports & Safety.
              </h1>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">
                Help keep InternCheck reliable by reporting suspicious
                internships, companies, or recruiter activity.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowForm((previous) => !previous);
                setSubmitError("");
              }}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <span className="text-lg leading-none">+</span>
              {showForm ? "Close report form" : "Submit a report"}
            </button>
          </div>
        </section>

        {/* Messages */}
        {successMessage && (
          <div
            role="status"
            className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-600"
          >
            <span>{successMessage}</span>

            <button
              type="button"
              onClick={() => setSuccessMessage("")}
              aria-label="Dismiss success message"
              className="font-bold"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-500"
          >
            <span>{error}</span>

            <button
              type="button"
              onClick={() => {
                const controller = new AbortController();
                fetchReports(controller.signal);
              }}
              className="font-semibold underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}

        {/* Statistics */}
        <section className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {[
            {
              label: "Total reports",
              value: reportStats.total,
              description: "Reports submitted",
            },
            {
              label: "Pending",
              value: reportStats.pending,
              description: "Awaiting review",
            },
            {
              label: "Under review",
              value: reportStats.reviewing,
              description: "Currently being reviewed",
            },
            {
              label: "Completed",
              value: reportStats.resolved,
              description: "Review outcome recorded",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="min-w-0 rounded-2xl border border-border bg-surface p-4 sm:p-5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted sm:text-xs">
                {stat.label}
              </p>

              <p className="mt-3 font-display text-2xl font-bold text-text sm:text-3xl">
                {loading ? "–" : stat.value}
              </p>

              <p className="mt-1 text-[11px] leading-5 text-text-secondary sm:text-xs">
                {stat.description}
              </p>
            </div>
          ))}
        </section>

        {/* Report form */}
        {showForm && (
          <section className="mb-8 overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="border-b border-border p-5 sm:p-6">
              <h2 className="font-display text-xl font-bold text-text">
                Submit a safety report
              </h2>

              <p className="mt-1 text-sm text-text-secondary">
                Provide accurate details so the reported issue can be
                assessed properly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
              <div>
                <label
                  htmlFor="report-category"
                  className="mb-2 block text-xs font-semibold text-text-secondary"
                >
                  Report category <span className="text-primary">*</span>
                </label>

                <select
                  id="report-category"
                  required
                  value={form.category}
                  onChange={(event) =>
                    updateForm("category", event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="">Select a reason</option>

                  {categories.map((category) => (
                    <option
                      key={category.value}
                      value={category.value}
                    >
                      {category.label}
                    </option>
                  ))}
                </select>

                {form.category && (
                  <p className="mt-2 text-xs text-text-muted">
                    {
                      categories.find(
                        (category) => category.value === form.category
                      )?.description
                    }
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="report-internship"
                  className="mb-2 block text-xs font-semibold text-text-secondary"
                >
                  Related internship
                  <span className="ml-1 font-normal text-text-muted">
                    (Optional)
                  </span>
                </label>

                <select
                  id="report-internship"
                  value={form.internshipId}
                  onChange={(event) =>
                    updateForm("internshipId", event.target.value)
                  }
                  disabled={internshipsLoading}
                  className={inputClass}
                >
                  <option value="">
                    {internshipsLoading
                      ? "Loading internships..."
                      : "General company or safety report"}
                  </option>

                  {internships.map((internship) => (
                    <option
                      key={internship._id}
                      value={internship._id}
                    >
                      {internship.title} ·{" "}
                      {internship.company?.name ||
                        internship.companyId?.name ||
                        "Company"}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs text-text-muted">
                  Select the internship if your report concerns a
                  particular listing. Otherwise, leave this empty.
                </p>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="report-description"
                    className="text-xs font-semibold text-text-secondary"
                  >
                    Describe the issue{" "}
                    <span className="text-primary">*</span>
                  </label>

                  <span className="text-[11px] text-text-muted">
                    {form.description.length}/5000
                  </span>
                </div>

                <textarea
                  id="report-description"
                  required
                  minLength={20}
                  maxLength={5000}
                  rows={5}
                  value={form.description}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  placeholder="Explain what happened, who contacted you, what was requested, and why you believe it is suspicious..."
                  className={`${inputClass} resize-y`}
                />

                <p className="mt-2 text-xs text-text-muted">
                  Include relevant details such as dates, messages, payment
                  requests, or unusual instructions. Avoid sharing passwords
                  or sensitive personal information.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="report-evidence-url"
                    className="mb-2 block text-xs font-semibold text-text-secondary"
                  >
                    Evidence URL
                    <span className="ml-1 font-normal text-text-muted">
                      (Optional)
                    </span>
                  </label>

                  <input
                    id="report-evidence-url"
                    type="url"
                    value={form.evidenceUrl}
                    onChange={(event) =>
                      updateForm("evidenceUrl", event.target.value)
                    }
                    placeholder="https://example.com/message"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="report-evidence-description"
                    className="mb-2 block text-xs font-semibold text-text-secondary"
                  >
                    Evidence description
                    <span className="ml-1 font-normal text-text-muted">
                      (Optional)
                    </span>
                  </label>

                  <input
                    id="report-evidence-description"
                    type="text"
                    maxLength={2000}
                    value={form.evidenceDescription}
                    onChange={(event) =>
                      updateForm(
                        "evidenceDescription",
                        event.target.value
                      )
                    }
                    placeholder="What does this evidence show?"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs leading-5 text-text-secondary">
                  Reports are intended for genuine safety concerns. Submit
                  accurate information and avoid making claims you cannot
                  support. Your report will be stored with its review status.
                </p>
              </div>

              {submitError && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-500"
                >
                  {submitError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  disabled={submitting}
                  className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-text-secondary transition hover:bg-background disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit report"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Report history */}
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-text">
                Your report history
              </h2>

              <p className="mt-1 text-sm text-text-secondary">
                Track the status and outcome of your submitted reports.
              </p>
            </div>

            {!loading && (
              <span className="text-xs text-text-muted">
                {reports.length} reports
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <LoadingCard key={item} />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <EmptyReports />
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {reports.map((report) => (
                <ReportCard
                  key={report._id}
                  report={report}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
