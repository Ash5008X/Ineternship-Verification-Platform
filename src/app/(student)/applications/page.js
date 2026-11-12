
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

const filters = [
  { label: "All applications", value: "all" },
  { label: "In progress", value: "progress" },
  { label: "Interviewing", value: "interviewing" },
  { label: "Offers", value: "offered" },
  { label: "Rejected", value: "rejected" },
  { label: "Withdrawn", value: "withdrawn" },
];

const statusConfig = {
  saved: {
    label: "Saved",
    className: "bg-surface-muted text-text-secondary",
  },
  applied: {
    label: "Applied",
    className: "bg-primary/10 text-primary",
  },
  interviewing: {
    label: "Interviewing",
    className: "bg-amber-500/10 text-amber-600",
  },
  offered: {
    label: "Offer received",
    className: "bg-emerald-500/10 text-emerald-600",
  },
  rejected: {
    label: "Not selected",
    className: "bg-red-500/10 text-red-600",
  },
  withdrawn: {
    label: "Withdrawn",
    className: "bg-surface-muted text-text-muted",
  },
};

function formatDate(date) {
  if (!date) return "Date unavailable";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getCompanyName(internship) {
  return internship?.companyId?.name || "Company";
}

function getLocation(internship) {
  const location = internship?.location;

  if (!location) return "Location not specified";

  return [location.city, location.state]
    .filter(Boolean)
    .join(", ") || "Location not specified";
}

function ApplicationCard({ application }) {
  const internship = application.internshipId;
  const status = statusConfig[application.status] || statusConfig.applied;

  if (!internship) return null;

  return (
    <article className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 sm:p-5 shadow-xs transition-colors hover:border-primary/30">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-muted font-display text-lg text-primary">
            {getCompanyName(internship).charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <h3 className="font-display text-lg text-text leading-snug">
              {internship.title}
            </h3>

            <p className="mt-1 text-sm font-medium text-text-secondary">
              {getCompanyName(internship)}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
              <span>{getLocation(internship)}</span>
              <span className="hidden sm:inline">·</span>
              <span className="capitalize">
                {internship.workMode || "Work mode unspecified"}
              </span>
            </div>
          </div>
        </div>

        <span
          className={`inline-flex w-fit shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-semibold ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <div className="my-4 border-t border-border" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-text-muted">
          <span>
            Applied:{" "}
            <strong className="font-semibold text-text-secondary">
              {formatDate(application.appliedAt)}
            </strong>
          </span>

          <span>
            Method:{" "}
            <strong className="font-semibold capitalize text-text-secondary">
              {application.applicationMethod}
            </strong>
          </span>

          {application.cvSnapshot?.version && (
            <span>
              CV version:{" "}
              <strong className="font-semibold text-text-secondary">
                v{application.cvSnapshot.version}
              </strong>
            </span>
          )}
        </div>

        {internship.applicationUrl &&
          application.applicationMethod === "external" && (
            <a
              href={internship.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-primary transition-opacity hover:opacity-70"
            >
              Company website ↗
            </a>
          )}
      </div>
    </article>
  );
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplications = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/applications", { signal });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load applications.");
      }

      setApplications(result.data || []);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Something went wrong.");
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchApplications(controller.signal);

    return () => controller.abort();
  }, [fetchApplications]);

  const counts = useMemo(() => {
    return {
      total: applications.length,
      progress: applications.filter((item) =>
        ["saved", "applied", "interviewing"].includes(item.status)
      ).length,
      interviewing: applications.filter(
        (item) => item.status === "interviewing"
      ).length,
      offered: applications.filter(
        (item) => item.status === "offered"
      ).length,
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const internship = application.internshipId;
      if (!internship) return false;

      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "progress" &&
          ["saved", "applied", "interviewing"].includes(application.status)) ||
        application.status === activeFilter;

      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        internship.title?.toLowerCase().includes(query) ||
        getCompanyName(internship).toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [applications, activeFilter, search]);

  return (
    <div className="min-h-full w-full bg-background font-ui text-text antialiased">
      <main className="flex-1 min-w-0 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Student Portal
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl text-text tracking-tight">
                My Applications.
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                Keep track of your applications and every step that follows.
              </p>
            </div>

            <Link
              href="/internships"
              className="inline-flex w-fit items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Explore internships <span className="ml-2">↗</span>
            </Link>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Total applications", value: counts.total },
            { label: "In progress", value: counts.progress },
            { label: "Interviewing", value: counts.interviewing },
            { label: "Offers received", value: counts.offered },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 sm:p-5 shadow-xs"
            >
              <p className="text-xs font-medium text-text-muted">
                {item.label}
              </p>
              <p className="mt-2 font-display text-2xl sm:text-3xl text-text tabular-nums">
                {loading ? "—" : item.value}
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-display text-lg text-text">
                Application history
              </h2>
              <p className="mt-1 text-xs text-text-muted">
                Your recorded applications, sorted by most recent.
              </p>
            </div>

            <div className="w-full lg:max-w-xs">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search role or company..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-primary"
              />
            </div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto border-b border-border pb-3">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
                  activeFilter === filter.value
                    ? "bg-primary text-white"
                    : "bg-background text-text-secondary hover:bg-surface-muted"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            {loading ? (
              <div className="py-14 text-center">
                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-border border-t-primary" />
                <p className="mt-3 text-sm text-text-secondary">
                  Loading your applications...
                </p>
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-8 text-center">
                <p className="text-sm font-semibold text-red-600">{error}</p>
                <button
                  type="button"
                  onClick={() => fetchApplications()}
                  className="mt-3 text-sm font-semibold text-primary hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : filteredApplications.length > 0 ? (
              filteredApplications.map((application) => (
                <ApplicationCard
                  key={application._id}
                  application={application}
                />
              ))
            ) : (
              <div className="px-4 py-14 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl text-primary">
                  ↗
                </div>

                <h3 className="mt-4 font-display text-lg text-text">
                  {applications.length === 0
                    ? "Your application journey starts here."
                    : "No matching applications."}
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">
                  {applications.length === 0
                    ? "When you apply to internships, they will appear here so you can follow their progress in one place."
                    : "Try another filter or search for a different role or company."}
                </p>

                {applications.length === 0 && (
                  <Link
                    href="/internships"
                    className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                  >
                    Browse internships
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
