"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import RecruiterSectionHeader from "@/components/shared/recruiter/RecruiterSectionHeader";

const FILTERS = [
    { label: "All", value: "" },
    { label: "Positive", value: "Positive" },
    { label: "Neutral", value: "Neutral" },
    { label: "Negative", value: "Negative" },
];

const CATEGORY_STYLES = {
    Positive: "bg-success/10 text-success border-success/20",
    Neutral: "bg-warning/10 text-warning border-warning/20",
    Negative: "bg-danger/10 text-danger border-danger/20",
    Unrated: "bg-surface-alt text-text-muted border-border",
};

const EMPTY_STATS = {
    total: 0,
    averageRating: 0,
    positive: 0,
    neutral: 0,
    negative: 0,
    distribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
    },
};

function formatDate(date) {
    if (!date) return "Date unavailable";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return "Date unavailable";
    }

    return parsed.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatStatus(status) {
    if (!status) return "Not specified";

    return status.charAt(0).toUpperCase() + status.slice(1);
}

function getInitials(name = "Student") {
    return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function StarRating({ rating, size = "normal" }) {
    if (rating === null || rating === undefined) {
        return (
            <span className="font-ui text-xs text-text-muted">
                No rating
            </span>
        );
    }

    return (
        <div className="inline-flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={`${
                        size === "large" ? "w-5 h-5" : "w-3.5 h-3.5"
                    } ${
                        star <= rating
                            ? "text-amber-400"
                            : "text-text-muted/25"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.165c.969 0 1.371 1.24.588 1.81l-3.37 2.449a1 1 0 00-.364 1.118l1.287 3.96c.3.922-.755 1.688-1.539 1.119l-3.37-2.449a1 1 0 00-1.176 0l-3.37 2.449c-.783.569-1.838-.197-1.539-1.118l1.287-3.96a1 1 0 00-.364-1.118L2.122 9.387c-.783-.57-.38-1.81.588-1.81h4.165a1 1 0 00.95-.69h1.224z" />
                </svg>
            ))}
        </div>
    );
}

function CategoryBadge({ category }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold font-ui ${
                CATEGORY_STYLES[category] || CATEGORY_STYLES.Unrated
            }`}
        >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {category}
        </span>
    );
}

function Avatar({ name }) {
    return (
        <div className="w-10 h-10 shrink-0 rounded-full bg-rose-soft text-primary flex items-center justify-center font-ui text-xs font-bold">
            {getInitials(name)}
        </div>
    );
}

function StatCard({ label, value, description, icon, accent }) {
    return (
        <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="font-ui text-xs text-text-secondary font-medium">
                        {label}
                    </p>

                    <h3 className="font-display text-2xl font-bold text-text mt-2">
                        {value}
                    </h3>

                    <p className="font-ui text-[11px] text-text-muted mt-1">
                        {description}
                    </p>
                </div>

                <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

function EmptyState({ searchQuery, activeFilter }) {
    return (
        <div className="bg-surface border border-border rounded-[var(--radius-lg)] py-14 px-5 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-surface-alt flex items-center justify-center text-text-muted mb-3">
                <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7h8m-8 5h8m-8 5h4m-7 4h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                </svg>
            </div>

            <h3 className="font-ui text-sm font-bold text-text">
                No feedback found
            </h3>

            <p className="font-ui text-xs text-text-muted mt-1">
                {searchQuery || activeFilter
                    ? "Try changing your search or selected filter."
                    : "Approved student experiences will appear here."}
            </p>
        </div>
    );
}

function FeedbackCard({ item, onRead }) {
    const studentName = item.student?.name || "Anonymous student";

    return (
        <article className="bg-surface border border-border rounded-[var(--radius-lg)] p-5 space-y-4 hover:border-primary/20 transition-colors">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={studentName} />

                    <div className="min-w-0">
                        <h3 className="font-ui text-sm font-bold text-text truncate">
                            {studentName}
                        </h3>

                        <p className="font-ui text-[11px] text-text-muted mt-1 truncate">
                            {item.student?.university || "University not specified"}
                        </p>
                    </div>
                </div>

                <CategoryBadge category={item.category} />
            </div>

            <div>
                <p className="font-ui text-xs font-bold text-text">
                    {item.internship?.title || "Internship"}
                </p>

                <p className="font-ui text-[11px] text-text-muted mt-1">
                    {item.internship?.category || "General"} ·{" "}
                    {formatStatus(item.employmentStatus)}
                </p>
            </div>

            <div className="flex items-center justify-between gap-3">
                <StarRating rating={item.rating} />

                <span className="font-ui text-[11px] text-text-muted">
                    {formatDate(item.submittedAt)}
                </span>
            </div>

            <p className="font-ui text-xs text-text-secondary leading-6 line-clamp-3">
                {item.feedback ||
                    item.workExperience ||
                    item.applicationExperience ||
                    item.interviewExperience ||
                    item.outcome ||
                    "No written feedback was provided."}
            </p>

            <div className="pt-3 border-t border-border flex justify-end">
                <button
                    type="button"
                    onClick={() => onRead(item)}
                    className="px-3 py-2 rounded-lg border border-border text-xs font-ui font-semibold text-text-secondary hover:bg-rose-soft hover:text-primary hover:border-primary/20 transition-colors"
                >
                    Read Feedback
                </button>
            </div>
        </article>
    );
}

function FeedbackDetailsModal({ item, onClose }) {
    if (!item) return null;

    const sections = [
        {
            title: "Application Experience",
            content: item.applicationExperience,
        },
        {
            title: "Interview Experience",
            content: item.interviewExperience,
        },
        {
            title: "Work Experience",
            content: item.workExperience,
        },
        {
            title: "Outcome",
            content: item.outcome,
        },
        {
            title: "Additional Feedback",
            content: item.feedback,
        },
    ].filter((section) => section.content?.trim());

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="absolute inset-0 bg-[#21131d]/55 backdrop-blur-md" />

            <div className="relative w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-2xl sm:rounded-3xl border border-white/60 dark:border-white/15 bg-white/95 dark:bg-[#211923]/95 backdrop-blur-2xl shadow-[0_30px_100px_rgba(30,10,25,0.35)]">
                <div className="flex items-start justify-between gap-4 px-5 sm:px-7 py-5 border-b border-border">
                    <div>
                        <span className="font-ui text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                            Student Experience
                        </span>

                        <h2 className="font-display text-xl font-bold text-text mt-1">
                            Feedback Details
                        </h2>

                        <p className="font-ui text-xs text-text-muted mt-1">
                            Submitted {formatDate(item.submittedAt)}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close feedback"
                        className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-secondary hover:bg-rose-soft hover:text-primary transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[calc(92vh-145px)] px-5 sm:px-7 py-6 space-y-6">
                    <div className="flex items-center gap-3">
                        <Avatar name={item.student?.name} />

                        <div className="flex-1 min-w-0">
                            <h3 className="font-display text-lg font-bold text-text">
                                {item.student?.name || "Anonymous student"}
                            </h3>

                            <p className="font-ui text-xs text-text-muted mt-1">
                                {item.student?.university || "University not specified"}
                            </p>
                        </div>

                        <CategoryBadge category={item.category} />
                    </div>

                    <section className="rounded-xl bg-surface-alt/70 border border-border p-4">
                        <p className="font-ui text-[10px] font-bold uppercase tracking-wider text-text-muted">
                            Overall Rating
                        </p>

                        <div className="flex items-center gap-3 mt-2">
                            <StarRating rating={item.rating} size="large" />

                            <span className="font-display text-xl font-bold text-text">
                                {item.rating ? `${item.rating}/5` : "Not rated"}
                            </span>
                        </div>
                    </section>

                    <section className="space-y-2">
                        <h3 className="font-ui text-sm font-bold text-text">
                            Internship Details
                        </h3>

                        <div className="rounded-xl border border-border p-4">
                            <p className="font-ui text-sm font-bold text-text">
                                {item.internship?.title || "Internship"}
                            </p>

                            <p className="font-ui text-xs text-text-muted mt-1">
                                {item.internship?.category || "General"} ·{" "}
                                {formatStatus(item.employmentStatus)}
                            </p>
                        </div>
                    </section>

                    {sections.length > 0 ? (
                        sections.map((section) => (
                            <section key={section.title} className="space-y-2">
                                <h3 className="font-ui text-sm font-bold text-text">
                                    {section.title}
                                </h3>

                                <div className="rounded-xl border border-border bg-surface-alt/50 p-4">
                                    <p className="font-ui text-xs text-text-secondary leading-6 whitespace-pre-wrap">
                                        {section.content}
                                    </p>
                                </div>
                            </section>
                        ))
                    ) : (
                        <p className="font-ui text-xs text-text-muted">
                            No written feedback was provided.
                        </p>
                    )}
                </div>

                <div className="px-5 sm:px-7 py-4 border-t border-border bg-surface/80 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl bg-primary text-white font-ui text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                        Close Feedback
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function RecruiterFeedbackPage() {
    const [feedback, setFeedback] = useState([]);
    const [stats, setStats] = useState(EMPTY_STATS);
    const [pagination, setPagination] = useState({
        page: 1,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
    });

    const [activeFilter, setActiveFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchFeedback = useCallback(async (page = 1) => {
        setLoading(true);
        setError("");

        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: "12",
            });

            if (activeFilter) {
                params.set("category", activeFilter);
            }

            if (searchQuery.trim()) {
                params.set("search", searchQuery.trim());
            }

            const response = await fetch(
                `/api/recruiter/feedback?${params.toString()}`,
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to load student feedback."
                );
            }

            setFeedback(result.data || []);
            setStats({
                ...EMPTY_STATS,
                ...(result.stats || {}),
                distribution: {
                    ...EMPTY_STATS.distribution,
                    ...(result.stats?.distribution || {}),
                },
            });
            setPagination(
                result.pagination || {
                    page,
                    total: 0,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPreviousPage: false,
                }
            );
        } catch (err) {
            setError(
                err.message || "Unable to load student feedback."
            );
            setFeedback([]);
        } finally {
            setLoading(false);
        }
    }, [activeFilter, searchQuery]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchFeedback(1);
        }, searchQuery ? 350 : 0);

        return () => clearTimeout(timeout);
    }, [fetchFeedback, searchQuery]);

    const ratingDistribution = useMemo(() => {
        return [5, 4, 3, 2, 1].map((rating) => ({
            rating,
            count: stats.distribution?.[rating] || 0,
            percentage:
                stats.total > 0
                    ? ((stats.distribution?.[rating] || 0) /
                          Math.max(
                              1,
                              Object.values(stats.distribution || {}).reduce(
                                  (sum, value) => sum + value,
                                  0
                              )
                          )) *
                      100
                    : 0,
        }));
    }, [stats]);

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-7">
                <section>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-primary" />

                        <span className="font-ui text-xs font-bold uppercase tracking-wider text-text-muted">
                            Recruiter Workspace
                        </span>
                    </div>

                    <h1 className="font-display text-2xl sm:text-3xl text-text tracking-tight">
                        Student Feedback
                    </h1>

                    <p className="font-ui text-sm text-text-secondary mt-1">
                        Understand student experiences and improve your internship programs.
                    </p>
                </section>

                {error && (
                    <div className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 flex items-center justify-between gap-3">
                        <p className="font-ui text-xs text-danger">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() => fetchFeedback(1)}
                            className="font-ui text-xs font-bold text-danger underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                    <StatCard
                        label="Total Feedback"
                        value={stats.total}
                        description="Approved student experiences"
                        accent="bg-primary/10 text-primary"
                        icon={<span className="text-lg">▤</span>}
                    />

                    <StatCard
                        label="Average Rating"
                        value={`${Number(stats.averageRating || 0).toFixed(1)}/5`}
                        description="Overall student rating"
                        accent="bg-amber-400/10 text-amber-500"
                        icon={<span className="text-lg">★</span>}
                    />

                    <StatCard
                        label="Positive Feedback"
                        value={stats.positive}
                        description="Ratings of 4 or 5"
                        accent="bg-success/10 text-success"
                        icon={<span className="text-lg">↑</span>}
                    />

                    <StatCard
                        label="Needs Attention"
                        value={stats.negative}
                        description="Ratings of 1 or 2"
                        accent="bg-danger/10 text-danger"
                        icon={<span className="text-lg">!</span>}
                    />
                </section>

                <section className="bg-surface border border-border rounded-[var(--radius-lg)] p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="font-display text-lg font-bold text-text">
                                Overall Experience Rating
                            </h2>

                            <p className="font-ui text-xs text-text-muted mt-1">
                                Based on approved student experiences.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="font-display text-3xl font-bold text-text tabular-nums">
                                {Number(stats.averageRating || 0).toFixed(1)}
                            </span>

                            <div>
                                <StarRating
                                    rating={Math.round(stats.averageRating || 0)}
                                    size="large"
                                />

                                <p className="font-ui text-[10px] text-text-muted mt-1">
                                    Out of 5 stars
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 space-y-2">
                        {ratingDistribution.map((item) => (
                            <div
                                key={item.rating}
                                className="flex items-center gap-3"
                            >
                                <span className="font-ui text-xs text-text-secondary w-8">
                                    {item.rating} ★
                                </span>

                                <div className="flex-1 h-2 rounded-full bg-surface-alt overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-primary transition-all"
                                        style={{
                                            width: `${item.percentage}%`,
                                        }}
                                    />
                                </div>

                                <span className="font-ui text-[11px] text-text-muted w-6 text-right tabular-nums">
                                    {item.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-4">
                    <RecruiterSectionHeader
                        title="Student Experiences"
                        subtitle="Read approved experiences submitted for your company."
                    />

                    <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-3 sm:p-4 space-y-4">
                        <div className="relative">
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <circle cx="11" cy="11" r="7" />
                                <path
                                    strokeLinecap="round"
                                    d="m16 16 4 4"
                                />
                            </svg>

                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(event) =>
                                    setSearchQuery(event.target.value)
                                }
                                placeholder="Search by student, internship or feedback..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-md)] bg-background border border-border text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            {FILTERS.map((filter) => {
                                const count =
                                    filter.value === ""
                                        ? stats.total
                                        : filter.value === "Positive"
                                          ? stats.positive
                                          : filter.value === "Neutral"
                                            ? stats.neutral
                                            : stats.negative;

                                return (
                                    <button
                                        key={filter.value || "all"}
                                        type="button"
                                        onClick={() =>
                                            setActiveFilter(filter.value)
                                        }
                                        className={`shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-ui font-semibold transition-all ${
                                            activeFilter === filter.value
                                                ? "bg-rose-soft text-primary border-primary/20"
                                                : "bg-surface text-text-secondary border-border hover:bg-surface-alt"
                                        }`}
                                    >
                                        {filter.label}

                                        <span className="text-[10px] opacity-70">
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {loading ? (
                        <div className="bg-surface border border-border rounded-[var(--radius-lg)] py-16 text-center">
                            <div className="w-7 h-7 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />

                            <p className="font-ui text-xs text-text-muted mt-3">
                                Loading student feedback...
                            </p>
                        </div>
                    ) : feedback.length === 0 ? (
                        <EmptyState
                            searchQuery={searchQuery}
                            activeFilter={activeFilter}
                        />
                    ) : (
                        <>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                {feedback.map((item) => (
                                    <FeedbackCard
                                        key={item._id}
                                        item={item}
                                        onRead={setSelectedFeedback}
                                    />
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                                <p className="font-ui text-xs text-text-muted">
                                    Showing {feedback.length} of {pagination.total} experiences
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={
                                            loading ||
                                            !pagination.hasPreviousPage
                                        }
                                        onClick={() =>
                                            fetchFeedback(
                                                pagination.page - 1
                                            )
                                        }
                                        className="px-3 py-2 rounded-lg border border-border text-xs font-ui font-semibold text-text-secondary hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>

                                    <span className="font-ui text-xs text-text-muted tabular-nums">
                                        Page {pagination.page || 1} of{" "}
                                        {Math.max(
                                            1,
                                            pagination.totalPages || 1
                                        )}
                                    </span>

                                    <button
                                        type="button"
                                        disabled={
                                            loading ||
                                            !pagination.hasNextPage
                                        }
                                        onClick={() =>
                                            fetchFeedback(
                                                pagination.page + 1
                                            )
                                        }
                                        className="px-3 py-2 rounded-lg border border-border text-xs font-ui font-semibold text-text-secondary hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </section>
            </div>

            <FeedbackDetailsModal
                item={selectedFeedback}
                onClose={() => setSelectedFeedback(null)}
            />
        </div>
    );
}