"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

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

function formatStipend(stipend) {
  if (!stipend) return "Not specified";
  if (stipend.period === "unpaid") return "Unpaid";
  if (stipend.amount == null) return "Not specified";

  const amount = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(stipend.amount);

  const currency =
    stipend.currency === "INR"
      ? "₹"
      : `${stipend.currency || ""} `;

  const periods = {
    hourly: "/ hour",
    weekly: "/ week",
    monthly: "/ month",
    total: " total",
  };

  return `${currency}${amount}${periods[stipend.period] || ""}`;
}

function formatDuration(duration) {
  if (!duration?.value || !duration?.unit) {
    return "Not specified";
  }

  return `${duration.value} ${duration.unit}`;
}

function formatLocation(location) {
  if (!location) return "Location not specified";

  const parts = [
    location.city,
    location.state,
    location.country,
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : "Location not specified";
}

function getStatusStyles(status) {
  const styles = {
    active: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    pending: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    expired: "border-orange-500/20 bg-orange-500/10 text-orange-400",
    withdrawn: "border-red-500/20 bg-red-500/10 text-red-400",
    rejected: "border-red-500/20 bg-red-500/10 text-red-400",
    draft: "border-border bg-surface-alt text-text-muted",
  };

  return styles[status] || styles.draft;
}

function BookmarkCard({ bookmark, onRemove, removing }) {
  const internship = bookmark?.internship;

  if (!internship) return null;

  const company = internship.company;
  const companyName = company?.name || "Company information unavailable";
  const title = internship.title || "Untitled internship";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-black/5">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
              {companyName.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-text">
                {title}
              </h2>

              <p className="mt-1 truncate text-sm text-text-muted">
                {companyName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onRemove(internship._id)}
            disabled={removing}
            aria-label={`Remove ${title} from bookmarks`}
            title="Remove bookmark"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {removing ? (
              <span className="text-xs">...</span>
            ) : (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 4.75A1.75 1.75 0 017.75 3h8.5A1.75 1.75 0 0118 4.75V21l-6-3.75L6 21V4.75z"
                />
              </svg>
            )}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {internship.category && (
            <span className="rounded-md bg-surface-alt px-2.5 py-1 text-xs text-text-secondary">
              {internship.category}
            </span>
          )}

          {internship.workMode && (
            <span className="rounded-md bg-surface-alt px-2.5 py-1 text-xs capitalize text-text-secondary">
              {internship.workMode}
            </span>
          )}
        </div>

        <div className="mt-5 flex items-center gap-2 text-sm text-text-muted">
          <svg
            className="h-4 w-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 5.25-7.5 11-7.5 11s-7.5-5.75-7.5-11a7.5 7.5 0 1115 0z"
            />
            <circle cx="12" cy="10.5" r="2.5" />
          </svg>

          <span className="truncate">
            {formatLocation(internship.location)}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-background p-3">
            <p className="text-xs text-text-muted">Stipend</p>
            <p className="mt-1 text-sm font-bold text-text">
              {formatStipend(internship.stipend)}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-background p-3">
            <p className="text-xs text-text-muted">Duration</p>
            <p className="mt-1 text-sm font-bold text-text">
              {formatDuration(internship.duration)}
            </p>
          </div>
        </div>

        {internship.requiredSkills?.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Required skills
            </p>

            <div className="flex flex-wrap gap-2">
              {internship.requiredSkills.slice(0, 5).map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="rounded-md border border-border bg-surface-alt px-2.5 py-1 text-xs text-text-secondary"
                >
                  {skill}
                </span>
              ))}

              {internship.requiredSkills.length > 5 && (
                <span className="px-1 py-1 text-xs text-text-muted">
                  +{internship.requiredSkills.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background/50 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getStatusStyles(
              internship.status
            )}`}
          >
            {internship.status || "Unspecified"}
          </span>

          <span className="text-xs text-text-muted">
            Saved {formatDate(bookmark.savedAt)}
          </span>
        </div>

        <Link
          href="/internships"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:opacity-75"
        >
          Browse internships
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}

function LoadingCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-surface p-5">
      <div className="mb-5 flex gap-3">
        <div className="h-12 w-12 rounded-xl bg-surface-alt" />

        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/2 rounded bg-surface-alt" />
          <div className="h-3 w-1/3 rounded bg-surface-alt" />
        </div>
      </div>

      <div className="mb-4 h-4 w-1/3 rounded bg-surface-alt" />
      <div className="mb-3 h-12 rounded-xl bg-surface-alt" />
      <div className="h-12 rounded-xl bg-surface-alt" />
    </div>
  );
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [search, setSearch] = useState("");

  const fetchBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/bookmarks", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load your saved internships."
        );
      }

      setBookmarks(
        Array.isArray(result.data) ? result.data : []
      );
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  async function handleRemove(internshipId) {
    if (!internshipId || removingId) return;

    try {
      setRemovingId(internshipId);
      setError("");

      const response = await fetch("/api/bookmarks", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ internshipId }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to remove this bookmark."
        );
      }

      setBookmarks((previous) =>
        previous.filter(
          (bookmark) =>
            bookmark.internship?._id !== internshipId
        )
      );
    } catch (err) {
      setError(err.message || "Unable to remove bookmark.");
    } finally {
      setRemovingId(null);
    }
  }

  const filteredBookmarks = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return bookmarks;

    return bookmarks.filter((bookmark) => {
      const internship = bookmark.internship;
      const companyName = internship?.company?.name || "";

      return [
        internship?.title,
        companyName,
        internship?.category,
        internship?.workMode,
        internship?.location?.city,
        internship?.location?.state,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        );
    });
  }, [bookmarks, search]);

  return (
    <div className="min-h-full w-full bg-background font-ui text-text antialiased">
      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-7">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Your Collection
            </span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-3xl tracking-tight text-text sm:text-4xl">
                My Bookmarks.
              </h1>

              <p className="mt-1 text-sm text-text-secondary">
                Keep track of internships you want to explore.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surface px-4 py-3">
              <p className="text-xs text-text-muted">
                Saved internships
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums text-text">
                {bookmarks.length}
              </p>
            </div>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400"
          >
            <span>{error}</span>

            <button
              type="button"
              onClick={fetchBookmarks}
              className="font-semibold underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && bookmarks.length > 0 && (
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <circle cx="11" cy="11" r="7" />
                <path
                  strokeLinecap="round"
                  d="m16 16 4 4"
                />
              </svg>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search saved internships..."
                aria-label="Search saved internships"
                className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm text-text outline-none transition placeholder:text-text-muted focus:border-primary"
              />
            </div>

            <p className="text-xs text-text-muted">
              Showing {filteredBookmarks.length} of {bookmarks.length} saved
              internships
            </p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <LoadingCard key={item} />
            ))}
          </div>
        ) : bookmarks.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-border bg-surface px-5 py-16 text-center">
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
                  d="M6 4.75A1.75 1.75 0 017.75 3h8.5A1.75 1.75 0 0118 4.75V21l-6-3.75L6 21V4.75z"
                />
              </svg>
            </div>

            <h2 className="mt-5 text-lg font-bold text-text">
              No saved internships yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
              When you find an opportunity worth considering, bookmark it
              and it will appear here for easy access.
            </p>

            <Link
              href="/internships"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Explore internships
              <span aria-hidden="true">→</span>
            </Link>
          </section>
        ) : filteredBookmarks.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-border bg-surface px-5 py-14 text-center">
            <h2 className="text-lg font-bold text-text">
              No matching bookmarks
            </h2>

            <p className="mt-2 text-sm text-text-muted">
              Try another search term.
            </p>

            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-5 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-text transition hover:border-primary/50"
            >
              Clear search
            </button>
          </section>
        ) : (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-text">
                Saved opportunities
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {filteredBookmarks.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.bookmarkId}
                  bookmark={bookmark}
                  onRemove={handleRemove}
                  removing={
                    removingId === bookmark.internship?._id
                  }
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}