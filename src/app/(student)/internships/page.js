
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import InternshipCard from "@/components/internships/InternshipCard";
import InternshipDetails from "@/components/internships/InternshipDetails";
import ApplyInternshipModal from "@/components/internships/ApplyInternshipModal";

import { adaptInternships } from "@/lib/internshipAdapter";

const initialFilters = {
  category: "",
  location: "",
  workMode: "",
  verification: "",
  minStipend: "",
  maxStipend: "",
};

const filterInputClass =
  "w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2.5 text-xs text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/10";

const mobileFilterInputClass =
  "w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-3 text-sm text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/10";

function FilterField({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold text-text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

function FilterFields({
  filters,
  updateFilter,
  mobile = false,
}) {
  const inputClass = mobile
    ? mobileFilterInputClass
    : filterInputClass;

  return (
    <>
      <FilterField label="CATEGORY">
        <input
          value={filters.category}
          onChange={(event) =>
            updateFilter("category", event.target.value)
          }
          placeholder="e.g. Software Development"
          className={inputClass}
        />
      </FilterField>

      <FilterField label="LOCATION">
        <input
          value={filters.location}
          onChange={(event) =>
            updateFilter("location", event.target.value)
          }
          placeholder="City, state or country"
          className={inputClass}
        />
      </FilterField>

      <FilterField label="WORK MODE">
        <select
          value={filters.workMode}
          onChange={(event) =>
            updateFilter("workMode", event.target.value)
          }
          className={inputClass}
        >
          <option value="">All work modes</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="onsite">On-site</option>
        </select>
      </FilterField>

      <FilterField label="COMPANY VERIFICATION">
        <select
          value={filters.verification}
          onChange={(event) =>
            updateFilter("verification", event.target.value)
          }
          className={inputClass}
        >
          <option value="">All companies</option>
          <option value="verified">Verified</option>
          <option value="unverified">Not verified</option>
        </select>
      </FilterField>

      <FilterField label="MINIMUM STIPEND (₹)">
        <input
          type="number"
          min="0"
          value={filters.minStipend}
          onChange={(event) =>
            updateFilter("minStipend", event.target.value)
          }
          placeholder="Minimum amount"
          className={inputClass}
        />
      </FilterField>

      <FilterField label="MAXIMUM STIPEND (₹)">
        <input
          type="number"
          min="0"
          value={filters.maxStipend}
          onChange={(event) =>
            updateFilter("maxStipend", event.target.value)
          }
          placeholder="Maximum amount"
          className={inputClass}
        />
      </FilterField>
    </>
  );
}

function LoadingState() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-12 text-center">
      <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      <p className="mt-3 text-xs text-text-muted">
        Finding internships...
      </p>
    </div>
  );
}

function EmptyState({ hasActiveFilters, onClear }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface-alt text-text-muted">
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="m16 16 4 4" />
        </svg>
      </div>

      <h3 className="mt-3 text-sm font-bold text-text">
        No internships found
      </h3>

      <p className="mt-1 text-xs text-text-muted">
        Try changing your search or removing some filters.
      </p>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 text-xs font-semibold text-primary hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

export default function BrowseInternshipsPage() {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [mobileTab, setMobileTab] = useState("list");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);

  const [rawInternships, setRawInternships] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [appliedInternshipIds, setAppliedInternshipIds] = useState([]);
  const [dismissedIds, setDismissedIds] = useState([]);

  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [toast, setToast] = useState("");
  const [applicationInternship, setApplicationInternship] =
    useState(null);

  const [bookmarkingId, setBookmarkingId] = useState(null);

  const internships = useMemo(
    () =>
      adaptInternships(
        rawInternships,
        [],
        bookmarkedIds
      ).filter(
        (internship) => !dismissedIds.includes(internship.id)
      ),
    [rawInternships, bookmarkedIds, dismissedIds]
  );

  const selectedInternship =
    internships.find(
      (internship) => internship.id === selectedId
    ) || null;

  const isSelectedInternshipApplied =
    selectedInternship &&
    appliedInternshipIds.includes(selectedInternship.id);

  const hasActiveFilters =
    Boolean(search.trim()) ||
    Object.values(filters).some(Boolean);

  const activeFilterCount =
    Object.values(filters).filter(Boolean).length;

  const showToast = useCallback((message) => {
    setToast(message);

    window.setTimeout(() => {
      setToast("");
    }, 3500);
  }, []);

  // Debounced search.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  // Fetch saved internships.
  useEffect(() => {
    let cancelled = false;

    async function fetchBookmarks() {
      try {
        const response = await fetch("/api/bookmarks", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load bookmarks."
          );
        }

        const ids = (result.data || [])
          .map((bookmark) => bookmark.internship?._id)
          .filter(Boolean)
          .map(String);

        if (!cancelled) {
          setBookmarkedIds(ids);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load bookmarks:", err);
        }
      }
    }

    fetchBookmarks();

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch existing applications.
  useEffect(() => {
    let cancelled = false;

    async function fetchApplications() {
      try {
        const response = await fetch("/api/applications", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load applications."
          );
        }

        const ids = (result.data || [])
          .filter((application) =>
            [
              "applied",
              "interviewing",
              "offered",
              "rejected",
            ].includes(application.status)
          )
          .map((application) => {
            const internship = application.internshipId;

            return internship?._id
              ? String(internship._id)
              : typeof internship === "string"
                ? internship
                : null;
          })
          .filter(Boolean);

        if (!cancelled) {
          setAppliedInternshipIds(ids);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load applications:", err);
        }
      }
    }

    fetchApplications();

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch internships.
  const fetchInternships = useCallback(
    async (signal) => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();

        params.set("page", String(page));
        params.set("limit", "10");
        params.set("sort", sort);

        if (search) {
          params.set("search", search);
        }

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== "") {
            params.set(key, value);
          }
        });

        const response = await fetch(
          `/api/internships?${params.toString()}`,
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
            result.message || "Unable to load internships."
          );
        }

        const data = Array.isArray(result.data)
          ? result.data
          : [];

        setRawInternships(data);

        setPagination(result.pagination || null);

        // Keep the selected internship if it is still on this page.
        setSelectedId((currentId) => {
          const currentExists = data.some(
            (internship) =>
              String(internship._id) === String(currentId)
          );

          if (currentExists) {
            return currentId;
          }

          return data[0]?._id
            ? String(data[0]._id)
            : null;
        });
      } catch (err) {
        if (err.name === "AbortError") return;

        setError(
          err.message || "Something went wrong while loading internships."
        );

        setRawInternships([]);
        setPagination(null);
        setSelectedId(null);
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [page, search, filters, sort]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchInternships(controller.signal);

    return () => controller.abort();
  }, [fetchInternships]);

  const updateFilter = (key, value) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));

    setPage(1);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setSearchInput("");
    setSearch("");
    setSort("latest");
    setPage(1);
  };

  // IMPORTANT: InternshipCard passes the entire internship object.
  // Always extract its ID before updating selectedId.
  const handleSelect = (internship) => {
    if (!internship?.id) return;

    setSelectedId(String(internship.id));
    setMobileTab("details");
  };

  // Bookmark integration.
  const handleBookmark = async (internshipId) => {
    if (!internshipId || bookmarkingId) return;

    const id = String(internshipId);
    const isBookmarked = bookmarkedIds.includes(id);

    setBookmarkingId(id);

    try {
      const response = await fetch("/api/bookmarks", {
        method: isBookmarked ? "DELETE" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          internshipId: id,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            (isBookmarked
              ? "Unable to remove bookmark."
              : "Unable to save bookmark.")
        );
      }

      setBookmarkedIds((previous) =>
        isBookmarked
          ? previous.filter((savedId) => savedId !== id)
          : previous.includes(id)
            ? previous
            : [...previous, id]
      );

      showToast(
        isBookmarked
          ? "Internship removed from bookmarks."
          : "Internship saved to bookmarks."
      );
    } catch (err) {
      showToast(err.message || "Bookmark action failed.");
    } finally {
      setBookmarkingId(null);
    }
  };

  // Dismiss an internship from the current results.
  const handleRemove = (internshipId) => {
    const id = String(internshipId);

    setDismissedIds((previous) =>
      previous.includes(id) ? previous : [...previous, id]
    );

    if (selectedId === id) {
      const nextInternship = internships.find(
        (internship) => internship.id !== id
      );

      setSelectedId(nextInternship?.id || null);
    }
  };

  // Open the application modal.
  const handleApply = (internship) => {
    if (!internship?.id) return;

    if (appliedInternshipIds.includes(String(internship.id))) {
      showToast("You have already recorded an application for this internship.");
      return;
    }

    setApplicationInternship(internship);
  };

  const handleApplicationSuccess = (result) => {
    const application = result?.data;

    const internshipId = application?.internshipId?._id
      ? String(application.internshipId._id)
      : application?.internshipId
        ? String(application.internshipId)
        : String(applicationInternship?.id || "");

    if (internshipId) {
      setAppliedInternshipIds((previous) =>
        previous.includes(internshipId)
          ? previous
          : [...previous, internshipId]
      );
    }

    setApplicationInternship(null);
    showToast("Your application has been recorded successfully.");
  };

  const closeMobileFilters = () => {
    setShowMobileFilters(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background font-ui text-text antialiased">
      <main className="mx-auto w-full min-w-0 max-w-[1600px] flex-1 px-4 py-6 sm:px-6 lg:px-8">

        {/* Page heading */}
        <section className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Student Portal
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-3xl tracking-tight text-text sm:text-4xl">
                Browse Internships.
              </h1>

              <p className="mt-1 text-sm text-text-secondary">
                Discover opportunities that match your skills and goals.
              </p>
            </div>

            {pagination && (
              <p className="text-xs text-text-muted">
                {pagination.total} opportunities found
              </p>
            )}
          </div>
        </section>

        {/* Search and desktop filters */}
        <section className="mb-5 rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-xs sm:p-5">
          <label
            htmlFor="internship-search"
            className="mb-2 block text-xs font-semibold text-text-secondary"
          >
            Search internships
          </label>

          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m16 16 4 4" />
            </svg>

            <input
              id="internship-search"
              type="search"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
              placeholder="Search by role, company, category or skill..."
              className="w-full rounded-[var(--radius-md)] border border-border bg-background py-3 pl-10 pr-4 text-sm text-text outline-none placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          {/* Desktop filters */}
          <div className="mt-4 hidden grid-cols-2 gap-3 sm:grid lg:grid-cols-4">
            <FilterFields
              filters={filters}
              updateFilter={updateFilter}
            />

            <div className="flex items-end">
              <button
                type="button"
                onClick={clearFilters}
                disabled={!hasActiveFilters && sort === "latest"}
                className="w-full rounded-[var(--radius-md)] border border-border px-3 py-2.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
              >
                Clear all filters
              </button>
            </div>
          </div>
        </section>

        {/* Results heading and sorting */}
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-bold text-text">
              Available opportunities
            </h2>

            <p className="mt-0.5 text-xs text-text-muted">
              Select an internship to see its full details.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="internship-sort"
              className="hidden shrink-0 text-xs text-text-muted sm:block"
            >
              Sort by
            </label>

            <select
              id="internship-sort"
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setPage(1);
              }}
              className="min-w-0 flex-1 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2.5 text-xs outline-none focus:border-primary sm:flex-none"
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
              <option value="stipend-high">Highest stipend</option>
              <option value="stipend-low">Lowest stipend</option>
              <option value="deadline">Application deadline</option>
            </select>

            {/* Mobile filters button */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2.5 text-xs font-semibold text-text transition-colors hover:border-primary sm:hidden"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M7 12h10m-7 6h4"
                />
              </svg>

              Filters

              {activeFilterCount > 0 && (
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters && sort === "latest"}
              className="shrink-0 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2.5 text-xs font-semibold text-text-secondary transition hover:bg-surface-alt disabled:opacity-40 sm:hidden"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Mobile filter modal */}
        {showMobileFilters && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm sm:hidden"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeMobileFilters();
              }
            }}
          >
            <div className="flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-2xl">
              <div className="flex items-center justify-between border-b border-border p-4">
                <div>
                  <h2 className="font-display text-xl text-text">
                    Filters
                  </h2>

                  <p className="mt-1 text-xs text-text-muted">
                    Refine your internship search.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeMobileFilters}
                  className="rounded-lg border border-border p-2 text-text-secondary transition hover:text-primary"
                  aria-label="Close filters"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                <FilterFields
                  filters={filters}
                  updateFilter={updateFilter}
                  mobile
                />
              </div>

              <div className="flex gap-3 border-t border-border bg-surface p-4">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex-1 rounded-[var(--radius-md)] border border-border px-4 py-3 text-sm font-semibold text-text-secondary transition hover:bg-surface-alt"
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={closeMobileFilters}
                  className="flex-1 rounded-[var(--radius-md)] bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Show results
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && <LoadingState />}

        {/* Error state */}
        {!loading && error && (
          <div className="rounded-[var(--radius-lg)] border border-danger/30 bg-surface p-8 text-center">
            <p className="text-sm font-semibold text-text">
              Could not load internships
            </p>

            <p className="mt-2 text-xs text-text-muted">
              {error}
            </p>

            <button
              type="button"
              onClick={() => {
                const controller = new AbortController();
                fetchInternships(controller.signal);
              }}
              className="mt-4 rounded-[var(--radius-md)] bg-primary px-4 py-2 text-xs font-semibold text-white"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && internships.length === 0 && (
          <EmptyState
            hasActiveFilters={hasActiveFilters}
            onClear={clearFilters}
          />
        )}

        {/* Internship list and details */}
        {!loading && !error && internships.length > 0 && (
          <>
            <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">

              {/* Desktop internship list */}
              <div className="hidden space-y-3 xl:col-span-5 xl:block">
                {internships.map((internship) => (
                  <InternshipCard
                    key={internship.id}
                    internship={internship}
                    isSelected={internship.id === selectedId}
                    onSelect={handleSelect}
                    onToggleBookmark={handleBookmark}
                    onRemove={handleRemove}
                  />
                ))}
              </div>

              {/* Desktop details */}
              <div className="hidden xl:col-span-7 xl:block xl:sticky xl:top-20">
                <InternshipDetails
                  internship={selectedInternship}
                  onApply={handleApply}
                  onToggleBookmark={handleBookmark}
                  isApplied={Boolean(isSelectedInternshipApplied)}
                />
              </div>

              {/* Mobile and tablet */}
              <div className="xl:hidden">
                {mobileTab === "list" ? (
                  <div className="space-y-3">
                    {internships.map((internship) => (
                      <InternshipCard
                        key={internship.id}
                        internship={internship}
                        isSelected={internship.id === selectedId}
                        onSelect={handleSelect}
                        onToggleBookmark={handleBookmark}
                        onRemove={handleRemove}
                      />
                    ))}
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => setMobileTab("list")}
                      className="mb-3 text-xs font-semibold text-primary"
                    >
                      ← Back to internship list
                    </button>

                    <InternshipDetails
                      internship={selectedInternship}
                      onApply={handleApply}
                      onToggleBookmark={handleBookmark}
                      isApplied={Boolean(isSelectedInternshipApplied)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-4">
                <button
                  type="button"
                  disabled={!pagination.hasPreviousPage}
                  onClick={() =>
                    setPage((previous) => Math.max(1, previous - 1))
                  }
                  className="rounded-[var(--radius-md)] border border-border px-4 py-2 text-xs font-semibold transition hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="text-xs text-text-secondary">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                  type="button"
                  disabled={!pagination.hasNextPage}
                  onClick={() =>
                    setPage((previous) => previous + 1)
                  }
                  className="rounded-[var(--radius-md)] border border-border px-4 py-2 text-xs font-semibold transition hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Application modal */}
      {applicationInternship && (
        <ApplyInternshipModal
          internship={applicationInternship}
          onClose={() => setApplicationInternship(null)}
          onSuccess={handleApplicationSuccess}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[200] max-w-sm rounded-[var(--radius-md)] bg-text px-4 py-3 text-xs font-semibold text-background shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
