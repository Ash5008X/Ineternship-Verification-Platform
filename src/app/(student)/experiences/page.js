
"use client";

import { useCallback, useEffect, useState } from "react";

const statuses = [
  { label: "All experiences", value: "" },
  { label: "Applied", value: "applied" },
  { label: "Interviewed", value: "interviewed" },
  { label: "Offered", value: "offered" },
  { label: "Interned", value: "interned" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
  { label: "Withdrawn", value: "withdrawn" },
];

const experienceSections = [
  { key: "applicationExperience", title: "Application experience" },
  { key: "interviewExperience", title: "Interview experience" },
  { key: "workExperience", title: "Work experience" },
  { key: "outcome", title: "Outcome" },
  { key: "feedback", title: "Additional feedback" },
];

function Rating({ value }) {
  if (!value) {
    return <span className="text-xs text-text-muted">Not rated</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-amber-400">★</span>
      <span className="text-sm font-semibold text-text">{value}/5</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    applied: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    interviewed: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    offered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    interned: "bg-primary/10 text-primary border-primary/20",
    completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
    withdrawn: "bg-gray-500/10 text-text-muted border-border",
  };

  const label =
    statuses.find((item) => item.value === status)?.label || status;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
        styles[status] || "bg-surface-alt text-text-muted border-border"
      }`}
    >
      {label}
    </span>
  );
}

function ExperienceCard({ experience }) {
  const company = experience.companyId;
  const internship = experience.internshipId;

  const sections = experienceSections.filter(({ key }) => {
    const content = experience[key];
    return typeof content === "string" && content.trim().length > 0;
  });

  return (
    <article className="rounded-2xl border border-border bg-surface p-5 sm:p-6 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-black/5">

      {/* Company information */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
            {company?.name?.charAt(0)?.toUpperCase() || "C"}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-base sm:text-lg font-bold text-text">
              {company?.name || "Unknown company"}
            </h2>

            <p className="mt-1 text-sm text-text-muted truncate">
              {internship?.title || "Internship experience"}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <StatusBadge status={experience.employmentStatus} />
          <Rating value={experience.rating} />
        </div>
      </div>

      {/* Industry */}
      {company?.industry && (
        <div className="mt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            {company.industry}
          </span>
        </div>
      )}

      {/* Experience content */}
      {sections.length > 0 ? (
        <div className="mt-5 space-y-5">
          {sections.map(({ key, title }) => (
            <div key={key}>
              <h3 className="mb-2 text-sm font-semibold text-primary">
                {title}
              </h3>

              <p className="whitespace-pre-line text-sm leading-7 text-text-secondary">
                {experience[key]}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm text-text-muted">
          No written experience details were provided.
        </p>
      )}

      {/* Footer */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div className="flex flex-wrap items-center gap-2">
          {internship?.category && (
            <span className="rounded-md bg-surface-alt px-2.5 py-1 text-xs text-text-secondary">
              {internship.category}
            </span>
          )}

          {internship?.workMode && (
            <span className="rounded-md bg-surface-alt px-2.5 py-1 text-xs capitalize text-text-secondary">
              {internship.workMode}
            </span>
          )}
        </div>

        <span className="text-xs text-text-muted">
          {experience.createdAt
            ? new Date(experience.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : ""}
        </span>
      </div>
    </article>
  );
}

function FilterField({ label, children }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

const controlClass =
  "w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/10";

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sort, setSort] = useState("newest");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchExperiences = useCallback(
    async (signal) => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          search: search.trim(),
          status,
          minRating,
          sort,
          page: String(page),
          limit: "10",
        });

        const response = await fetch(
          `/api/experiences?${params.toString()}`,
          { signal, cache: "no-store" }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load experiences."
          );
        }

        setExperiences(result.data || []);
        setPagination(result.pagination || null);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [search, status, minRating, sort, page]
  );

  useEffect(() => {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      fetchExperiences(controller.signal);
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [fetchExperiences]);

  function updateFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setStatus("");
    setMinRating("");
    setSort("newest");
    setPage(1);
  }

  function retry() {
    const controller = new AbortController();
    fetchExperiences(controller.signal);
  }

  return (
    <div className="w-full min-h-full bg-background font-ui text-text antialiased">
      <main className="flex-1 min-w-0 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Page heading */}
        <section className="mb-6">
            <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Community Insights
                </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                <h1 className="font-display text-3xl sm:text-4xl text-text tracking-tight">
                    Student Experiences.
                </h1>

                <p className="text-sm text-text-secondary mt-1">
                    Learn from students who have applied, interviewed and worked at
                    different companies. Real experiences help you make informed
                    internship decisions.
                </p>
                </div>

                {pagination && (
                <p className="text-xs text-text-muted">
                    {pagination.total} experiences found
                </p>
                )}
            </div>
        </section>

        {/* Filters */}
        <section className="mb-7 rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text">
              Find student experiences
            </h2>

            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Reset filters
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <FilterField label="Search company">
              <input
                type="text"
                value={search}
                onChange={(event) =>
                  updateFilter(setSearch, event.target.value)
                }
                placeholder="e.g. TechNova"
                className={controlClass}
              />
            </FilterField>

            <FilterField label="Employment status">
              <select
                value={status}
                onChange={(event) =>
                  updateFilter(setStatus, event.target.value)
                }
                className={controlClass}
              >
                {statuses.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Minimum rating">
              <select
                value={minRating}
                onChange={(event) =>
                  updateFilter(setMinRating, event.target.value)
                }
                className={controlClass}
              >
                <option value="">Any rating</option>
                <option value="5">5 stars</option>
                <option value="4">4+ stars</option>
                <option value="3">3+ stars</option>
                <option value="2">2+ stars</option>
                <option value="1">1+ stars</option>
              </select>
            </FilterField>

            <FilterField label="Sort by">
              <select
                value={sort}
                onChange={(event) =>
                  updateFilter(setSort, event.target.value)
                }
                className={controlClass}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="highestRated">Highest rated</option>
              </select>
            </FilterField>
          </div>
        </section>

        {/* Results heading */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-text">
              Community experiences
            </h2>
            <p className="mt-1 text-xs text-text-muted">
              Insights shared by students across different internship stages.
            </p>
          </div>

          {pagination && (
            <span className="text-xs text-text-muted">
              {pagination.total} total
            </span>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-border bg-surface p-6"
              >
                <div className="mb-5 flex gap-3">
                  <div className="h-12 w-12 rounded-xl bg-surface-alt" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 rounded bg-surface-alt" />
                    <div className="h-3 w-1/3 rounded bg-surface-alt" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 w-full rounded bg-surface-alt" />
                  <div className="h-3 w-5/6 rounded bg-surface-alt" />
                  <div className="h-3 w-4/6 rounded bg-surface-alt" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error */
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
            <h3 className="font-semibold text-text">
              Couldn't load experiences
            </h3>

            <p className="mt-2 text-sm text-text-muted">{error}</p>

            <button
              type="button"
              onClick={retry}
              className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              Try again
            </button>
          </div>
        ) : experiences.length === 0 ? (
          /* Empty state */
          <div className="rounded-2xl border border-dashed border-border bg-surface px-5 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <svg
                className="h-8 w-8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 10h8M8 14h5m-8 7l3.5-3H18a3 3 0 003-3V6a3 3 0 00-3-3H6a3 3 0 00-3 3v12z"
                />
              </svg>
            </div>

            <h3 className="mt-5 text-lg font-bold text-text">
              No experiences found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
              There aren't any approved experiences matching these filters
              yet. Try changing your search or check back later.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Clear filters
            </button>
          </div>
        ) : (
          /* Experience cards */
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {experiences.map((experience) => (
              <ExperienceCard
                key={experience._id}
                experience={experience}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination?.totalPages > 1 && (
          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4">
            <button
              type="button"
              disabled={!pagination.hasPreviousPage}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text transition hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Previous
            </button>

            <span className="text-sm text-text-muted">
              Page{" "}
              <span className="font-semibold text-text">
                {pagination.page}
              </span>{" "}
              of {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text transition hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
