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

const controlClass =
  "w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/10";

function formatDate(date) {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Rating({ value }) {
  if (!value) {
    return (
      <span className="text-xs text-text-muted">
        Not rated
      </span>
    );
  }

  return (
    <div
      className="flex items-center gap-1.5"
      aria-label={`Rated ${value} out of 5`}
    >
      <span className="text-amber-400">★</span>
      <span className="text-sm font-semibold text-text">
        {value}/5
      </span>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    applied: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    interviewed: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    offered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    interned: "bg-primary/10 text-primary border-primary/20",
    completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
    withdrawn: "bg-surface-alt text-text-muted border-border",
  };

  const label =
    statuses.find((item) => item.value === status)?.label ||
    status ||
    "Unspecified";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
        styles[status] || "border-border bg-surface-alt text-text-muted"
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

  const companyName = company?.name || "Unknown company";

  return (
    <article className="rounded-2xl border border-border bg-surface p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-black/5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
            {companyName.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-text sm:text-lg">
              {companyName}
            </h2>

            <p className="mt-1 truncate text-sm text-text-muted">
              {internship?.title || "Internship experience"}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <StatusBadge status={experience.employmentStatus} />
          <Rating value={experience.rating} />
        </div>
      </div>

      {company?.industry && (
        <div className="mt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            {company.industry}
          </span>
        </div>
      )}

      {sections.length > 0 ? (
        <div className="mt-5 space-y-5">
          {sections.map(({ key, title }) => (
            <div key={key}>
              <h3 className="mb-2 text-sm font-semibold text-primary">
                {title}
              </h3>

              <p className="whitespace-pre-line break-words text-sm leading-7 text-text-secondary">
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
          Shared {formatDate(experience.createdAt)}
        </span>
      </div>
    </article>
  );
}

function LoadingCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-surface p-6">
      <div className="flex gap-3">
        <div className="h-12 w-12 rounded-xl bg-surface-alt" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/2 rounded bg-surface-alt" />
          <div className="h-3 w-1/3 rounded bg-surface-alt" />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="h-3 w-1/4 rounded bg-surface-alt" />
        <div className="h-3 w-full rounded bg-surface-alt" />
        <div className="h-3 w-5/6 rounded bg-surface-alt" />
      </div>
    </div>
  );
}

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
            result.message || "Unable to load student experiences."
          );
        }

        setExperiences(
          Array.isArray(result.data) ? result.data : []
        );

        setPagination(result.pagination || null);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong.");
          setExperiences([]);
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

  function resetFilters() {
    setSearch("");
    setStatus("");
    setMinRating("");
    setSort("newest");
    setPage(1);
  }

  const hasActiveFilters =
    Boolean(search.trim()) ||
    Boolean(status) ||
    Boolean(minRating) ||
    sort !== "newest";

  return (
    <div className="min-h-full w-full bg-background font-ui text-text antialiased">
      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Community Insights
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-3xl tracking-tight text-text sm:text-4xl">
                Student Experiences.
              </h1>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">
                Learn from students who have applied, interviewed, and
                worked at different companies. Real experiences can help
                you make more informed internship decisions.
              </p>
            </div>

            {!loading && pagination && (
              <p className="shrink-0 text-xs text-text-muted">
                {pagination.total} experiences found
              </p>
            )}
          </div>
        </section>

        <section className="mb-7 rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-text">
              Find student experiences
            </h2>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-primary transition hover:opacity-75"
              >
                Reset filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="xl:col-span-1">
              <label
                htmlFor="experience-search"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted"
              >
                Search company
              </label>

              <input
                id="experience-search"
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Enter company name..."
                className={controlClass}
              />
            </div>

            <div>
              <label
                htmlFor="experience-status"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted"
              >
                Application status
              </label>

              <select
                id="experience-status"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
                className={controlClass}
              >
                {statuses.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="experience-rating"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted"
              >
                Minimum rating
              </label>

              <select
                id="experience-rating"
                value={minRating}
                onChange={(event) => {
                  setMinRating(event.target.value);
                  setPage(1);
                }}
                className={controlClass}
              >
                <option value="">Any rating</option>
                <option value="5">5 stars</option>
                <option value="4">4+ stars</option>
                <option value="3">3+ stars</option>
                <option value="2">2+ stars</option>
                <option value="1">1+ stars</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="experience-sort"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted"
              >
                Sort by
              </label>

              <select
                id="experience-sort"
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value);
                  setPage(1);
                }}
                className={controlClass}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="highestRated">Highest rated</option>
              </select>
            </div>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400"
          >
            <span>{error}</span>

            <button
              type="button"
              onClick={() => {
                const controller = new AbortController();
                fetchExperiences(controller.signal);
              }}
              className="font-semibold underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-text">
              Community experiences
            </h2>

            {!loading && pagination && (
              <span className="text-xs text-text-muted">
                Page {pagination.page} of {Math.max(1, pagination.totalPages)}
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <LoadingCard key={item} />
              ))}
            </div>
          ) : experiences.length === 0 ? (
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
                    d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m16 0v-2a4 4 0 00-3-3.87M14 3.13a4 4 0 010 7.75M14 11h-2"
                  />
                  <circle cx="10" cy="7" r="4" />
                </svg>
              </div>

              <h3 className="mt-5 text-lg font-bold text-text">
                No experiences found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
                There are no approved experiences matching these filters.
                Try changing your search or check back later.
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-6 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-text transition hover:border-primary/50"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {experiences.map((experience) => (
                <ExperienceCard
                  key={experience._id}
                  experience={experience}
                />
              ))}
            </div>
          )}
        </section>

        {!loading && pagination && pagination.totalPages > 1 && (
          <nav
            aria-label="Experience pages"
            className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5"
          >
            <p className="text-xs text-text-muted">
              Showing page {pagination.page} of {pagination.totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!pagination.hasPreviousPage}
                onClick={() => {
                  setPage((current) => Math.max(1, current - 1));
                }}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-text transition hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <span className="min-w-10 text-center text-sm font-semibold tabular-nums text-text">
                {pagination.page}
              </span>

              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() => {
                  setPage((current) => current + 1);
                }}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-text transition hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </nav>
        )}
      </main>
    </div>
  );
}