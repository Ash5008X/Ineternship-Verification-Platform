
"use client";

import { useCallback, useEffect, useState } from "react";
import InternshipCard from "@/components/internships/InternshipCard";
import InternshipDetails from "@/components/internships/InternshipDetails";

import { adaptInternships } from "@/lib/internshipAdapter";

const initialFilters = {
  category: "",
  location: "",
  workMode: "",
  verification: "",
  risk: "",
  minStipend: "",
  maxStipend: "",
};

export default function BrowseInternshipsPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState("list");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);

  const [internships, setInternships] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [toast, setToast] = useState("");

  // Debounce search input.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchInternships = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", "10");
      params.set("sort", sort);

      if (search) params.set("search", search);

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "") {
          params.set(key, value);
        }
      });

      const response = await fetch(
        `/api/internships?${params.toString()}`,
        { signal }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load internships.");
      }

      const adapted = adaptInternships(result.data || []);

      setInternships(adapted);
      setPagination(result.pagination || null);

      setSelectedId((currentId) => {
        if (adapted.some((item) => item.id === currentId)) {
          return currentId;
        }

        return adapted[0]?.id || null;
      });
    } catch (err) {
      if (err.name === "AbortError") return;

      setError(err.message || "Something went wrong.");
      setInternships([]);
      setPagination(null);
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [page, search, filters, sort]);

  useEffect(() => {
    const controller = new AbortController();

    fetchInternships(controller.signal);

    return () => controller.abort();
  }, [fetchInternships]);

  const selectedInternship =
    internships.find((item) => item.id === selectedId) || null;

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

  const handleSelect = (internship) => {
    setSelectedId(internship.id);
    setMobileTab("details");
  };

  const handleBookmark = () => {
    setToast("Bookmark saving will be connected when we implement the Bookmarks feature.");
    setTimeout(() => setToast(""), 3500);
  };

  const handleApply = (internship) => {
    if (
      internship.applicationType === "External Apply" &&
      internship.applicationUrl
    ) {
      window.open(
        internship.applicationUrl,
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }

    setToast("Internal applications will be enabled when we implement the Applications feature.");
    setTimeout(() => setToast(""), 3500);
  };

  const hasActiveFilters =
    search ||
    Object.values(filters).some(Boolean);

  return (
    <div className="min-h-screen bg-background flex flex-col font-ui text-text antialiased">

      <div className="flex-1 flex w-full">

        <main className="flex-1 min-w-0 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

          {/* Page heading */}
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
                  Browse Internships.
                </h1>
                <p className="text-sm text-text-secondary mt-1">
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

          {/* Search */}
          <section className="bg-surface border border-border rounded-[var(--radius-lg)] p-4 sm:p-5 shadow-xs mb-5">
            <label
              htmlFor="internship-search"
              className="block text-xs font-semibold text-text-secondary mb-2"
            >
              Search internships
            </label>

            <div className="relative">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
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
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by role, company, category or skill..."
                className="w-full bg-background border border-border rounded-[var(--radius-md)] pl-10 pr-4 py-3 text-sm text-text placeholder:text-text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            {/* Filters */}
            <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">

              <div>
                <label className="block text-[11px] font-semibold text-text-muted mb-1.5">
                  CATEGORY
                </label>
                <input
                  value={filters.category}
                  onChange={(e) => updateFilter("category", e.target.value)}
                  placeholder="e.g. Software Development"
                  className="w-full bg-background border border-border rounded-[var(--radius-md)] px-3 py-2.5 text-xs outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-muted mb-1.5">
                  LOCATION
                </label>
                <input
                  value={filters.location}
                  onChange={(e) => updateFilter("location", e.target.value)}
                  placeholder="City, state or country"
                  className="w-full bg-background border border-border rounded-[var(--radius-md)] px-3 py-2.5 text-xs outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-muted mb-1.5">
                  WORK MODE
                </label>
                <select
                  value={filters.workMode}
                  onChange={(e) => updateFilter("workMode", e.target.value)}
                  className="w-full bg-background border border-border rounded-[var(--radius-md)] px-3 py-2.5 text-xs outline-none focus:border-primary"
                >
                  <option value="">All work modes</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-muted mb-1.5">
                  COMPANY VERIFICATION
                </label>
                <select
                  value={filters.verification}
                  onChange={(e) => updateFilter("verification", e.target.value)}
                  className="w-full bg-background border border-border rounded-[var(--radius-md)] px-3 py-2.5 text-xs outline-none focus:border-primary"
                >
                  <option value="">All companies</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Not verified</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-muted mb-1.5">
                  RISK LEVEL
                </label>
                <select
                  value={filters.risk}
                  onChange={(e) => updateFilter("risk", e.target.value)}
                  className="w-full bg-background border border-border rounded-[var(--radius-md)] px-3 py-2.5 text-xs outline-none focus:border-primary"
                >
                  <option value="">All risk levels</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-muted mb-1.5">
                  MINIMUM STIPEND (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={filters.minStipend}
                  onChange={(e) => updateFilter("minStipend", e.target.value)}
                  placeholder="Minimum amount"
                  className="w-full bg-background border border-border rounded-[var(--radius-md)] px-3 py-2.5 text-xs outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-muted mb-1.5">
                  MAXIMUM STIPEND (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={filters.maxStipend}
                  onChange={(e) => updateFilter("maxStipend", e.target.value)}
                  placeholder="Maximum amount"
                  className="w-full bg-background border border-border rounded-[var(--radius-md)] px-3 py-2.5 text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border border-border text-xs font-semibold text-text-secondary hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          </section>

          {/* Listing heading and sorting */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-ui font-bold text-base text-text">
                Available opportunities
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Select an internship to see its full details.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="internship-sort"
                className="hidden sm:block text-xs text-text-muted shrink-0"
              >
                Sort by
              </label>

              <select
                id="internship-sort"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="flex-1 sm:flex-none min-w-0 bg-surface border border-border rounded-[var(--radius-md)] px-3 py-2.5 text-xs outline-none focus:border-primary"
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="stipend-high">Highest stipend</option>
                <option value="stipend-low">Lowest stipend</option>
                <option value="deadline">Application deadline</option>
              </select>

              <button
                type="button"
                onClick={() => setShowMobileFilters(true)}
                className="sm:hidden flex shrink-0 items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2.5 text-xs font-semibold text-text hover:border-primary transition-colors"
              >
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
                    d="M4 6h16M7 12h10m-7 6h4"
                  />
                </svg>
                Filters

                {Object.values(filters).filter(Boolean).length > 0 && (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-white">
                    {Object.values(filters).filter(Boolean).length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={clearFilters}
                disabled={!hasActiveFilters && sort === "latest"}
                className="sm:hidden shrink-0 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2.5 text-xs font-semibold text-text-secondary disabled:opacity-40"
              >
                Clear
              </button>
            </div>
          </div>



          
        {/* Mobile filter overlay */}
        {showMobileFilters && (
          <div
            className="fixed inset-0 z-[100] sm:hidden flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowMobileFilters(false)}
          >
            <div
              className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-display text-xl text-text">
                    Filters
                  </h2>
                  <p className="text-xs text-text-muted mt-1">
                    Refine your internship search.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMobileFilters(false)}
                  className="rounded-lg border border-border p-2 text-text-secondary hover:text-primary"
                  aria-label="Close filters"
                >
                  <svg
                    className="w-5 h-5"
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

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-text-muted mb-1.5">
                    CATEGORY
                  </label>
                  <input
                    value={filters.category}
                    onChange={(e) => updateFilter("category", e.target.value)}
                    placeholder="e.g. Software Development"
                    className="w-full bg-background border border-border rounded-[var(--radius-md)] px-3 py-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-text-muted mb-1.5">
                    LOCATION
                  </label>
                  <input
                    value={filters.location}
                    onChange={(e) => updateFilter("location", e.target.value)}
                    placeholder="City, state or country"
                    className="w-full bg-background border border-border rounded-[var(--radius-md)] px-3 py-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-text-muted mb-1.5">
                    WORK MODE
                  </label>
                  <select
                    value={filters.workMode}
                    onChange={(e) => updateFilter("workMode", e.target.value)}
                    className="w-full bg-background border border-border rounded-[var(--radius-md)] px-3 py-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="">All work modes</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-text-muted mb-1.5">
                    COMPANY VERIFICATION
                  </label>
                  <select
                    value={filters.verification}
                    onChange={(e) => updateFilter("verification", e.target.value)}
                    className="w-full bg-background border border-border rounded-[var(--radius-md)] px-3 py-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="">All companies</option>
                    <option value="verified">Verified</option>
                    <option value="unverified">Not verified</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-text-muted mb-1.5">
                    RISK LEVEL
                  </label>
                  <select
                    value={filters.risk}
                    onChange={(e) => updateFilter("risk", e.target.value)}
                    className="w-full bg-background border border-border rounded-[var(--radius-md)] px-3 py-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="">All risk levels</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-text-muted mb-1.5">
                    MINIMUM STIPEND (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={filters.minStipend}
                    onChange={(e) => updateFilter("minStipend", e.target.value)}
                    placeholder="Minimum amount"
                    className="w-full bg-background border border-border rounded-[var(--radius-md)] px-3 py-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-text-muted mb-1.5">
                    MAXIMUM STIPEND (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={filters.maxStipend}
                    onChange={(e) => updateFilter("maxStipend", e.target.value)}
                    placeholder="Maximum amount"
                    className="w-full bg-background border border-border rounded-[var(--radius-md)] px-3 py-3 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="sticky bottom-0 bg-surface pt-4 mt-5 border-t border-border flex gap-3">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex-1 rounded-[var(--radius-md)] border border-border px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-surface-alt"
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 rounded-[var(--radius-md)] bg-primary px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
                >
                  Show results
                </button>
              </div>
            </div>
          </div>
        )}

          {/* Loading state */}
          {loading && (
            <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-12 text-center">
              <div className="w-7 h-7 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
              <p className="text-xs text-text-muted mt-3">
                Finding internships...
              </p>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="bg-surface border border-danger/30 rounded-[var(--radius-lg)] p-8 text-center">
              <p className="text-sm font-semibold text-text">
                Couldn't load internships
              </p>
              <p className="text-xs text-text-muted mt-2">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 rounded-[var(--radius-md)] bg-primary text-white text-xs font-semibold"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && internships.length === 0 && (
            <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-10 text-center">
              <div className="w-12 h-12 rounded-full bg-surface-alt border border-border mx-auto flex items-center justify-center text-text-muted">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <circle cx="11" cy="11" r="7" />
                  <path strokeLinecap="round" d="m16 16 4 4" />
                </svg>
              </div>

              <h3 className="font-ui font-bold text-sm text-text mt-3">
                No internships found
              </h3>

              <p className="text-xs text-text-muted mt-1">
                Try changing your search or removing some filters.
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 text-xs font-semibold text-primary hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Internship list and details */}
          {!loading && !error && internships.length > 0 && (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">

                {/* Desktop list */}
                <div className="hidden xl:block xl:col-span-5 space-y-3">
                  {internships.map((internship) => (
                    <InternshipCard
                      key={internship.id}
                      internship={internship}
                      isSelected={internship.id === selectedId}
                      onSelect={setSelectedId}
                      onToggleBookmark={handleBookmark}
                    />
                  ))}
                </div>

                {/* Desktop details */}
                <div className="hidden xl:block xl:col-span-7 sticky top-20">
                  <InternshipDetails
                    internship={selectedInternship}
                    onApply={handleApply}
                    onToggleBookmark={handleBookmark}
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
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6">
                  <button
                    type="button"
                    disabled={!pagination.hasPreviousPage}
                    onClick={() => setPage((previous) => previous - 1)}
                    className="px-4 py-2 border border-border rounded-[var(--radius-md)] text-xs font-semibold disabled:opacity-40 hover:bg-surface-alt"
                  >
                    Previous
                  </button>

                  <span className="text-xs text-text-secondary">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={!pagination.hasNextPage}
                    onClick={() => setPage((previous) => previous + 1)}
                    className="px-4 py-2 border border-border rounded-[var(--radius-md)] text-xs font-semibold disabled:opacity-40 hover:bg-surface-alt"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-text text-background px-4 py-3 rounded-[var(--radius-md)] text-xs font-semibold shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
