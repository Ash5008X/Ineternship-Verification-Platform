
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import RecruiterPageHeader from "@/components/shared/recruiter/RecruiterPageHeader";
import RecruiterSectionHeader from "@/components/shared/recruiter/RecruiterSectionHeader";

const statusStyles = {
    active: "bg-success/10 text-success",
    pending: "bg-amber-500/10 text-amber-600",
    draft: "bg-surface-alt text-text-secondary",
    rejected: "bg-red-500/10 text-red-600",
    expired: "bg-surface-alt text-text-muted",
    withdrawn: "bg-surface-alt text-text-muted",
};

const applicationStatusStyles = {
    applied: "bg-primary/10 text-primary",
    interviewing: "bg-amber-500/10 text-amber-600",
    offered: "bg-success/10 text-success",
    rejected: "bg-red-500/10 text-red-600",
    withdrawn: "bg-surface-alt text-text-muted",
};

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

function formatRelativeDate(value) {
    if (!value) return "Recently";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Recently";

    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 172800) return "Yesterday";

    return formatDate(value);
}

function getInitials(name) {
    if (!name) return "ST";

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function StatCard({ label, value, description, icon, accent }) {
    return (
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 sm:p-5 shadow-xs">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="font-ui text-xs font-semibold text-text-secondary">
                        {label}
                    </p>

                    <p className="mt-2 font-display text-3xl tracking-tight text-text">
                        {value}
                    </p>

                    <p className="mt-1 font-ui text-[11px] text-text-muted">
                        {description}
                    </p>
                </div>

                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] ${accent}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status, application = false }) {
    const normalizedStatus = String(status || "").toLowerCase();

    const label = normalizedStatus
        ? normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)
        : "Unknown";

    const styles = application
        ? applicationStatusStyles[normalizedStatus]
        : statusStyles[normalizedStatus];

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 font-ui text-[10px] font-bold ${
                styles || "bg-surface-alt text-text-secondary"
            }`}
        >
            {label}
        </span>
    );
}

function LoadingDashboard() {
    return (
        <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-6">
                <div className="space-y-3">
                    <div className="h-3 w-32 rounded bg-surface-alt" />
                    <div className="h-9 w-72 max-w-full rounded bg-surface-alt" />
                    <div className="h-4 w-96 max-w-full rounded bg-surface-alt" />
                </div>

                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="h-32 rounded-[var(--radius-lg)] border border-border bg-surface"
                        />
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div className="h-96 rounded-[var(--radius-lg)] border border-border bg-surface lg:col-span-8" />
                    <div className="h-96 rounded-[var(--radius-lg)] border border-border bg-surface lg:col-span-4" />
                </div>
            </div>
        </main>
    );
}

function EmptyState({ title, description, action, href }) {
    return (
        <div className="rounded-[var(--radius-md)] border border-dashed border-border px-5 py-10 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-rose-soft text-primary">
                <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.7}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 0 1 1 1v13H4V6a1 1 0 0 1 1-1Z"
                    />
                </svg>
            </div>

            <h3 className="mt-3 font-ui text-sm font-bold text-text">
                {title}
            </h3>

            <p className="mx-auto mt-1 max-w-sm font-ui text-xs leading-5 text-text-muted">
                {description}
            </p>

            {action && href && (
                <Link
                    href={href}
                    className="mt-4 inline-flex rounded-[var(--radius-md)] bg-primary px-4 py-2.5 font-ui text-xs font-semibold text-white transition hover:opacity-90"
                >
                    {action}
                </Link>
            )}
        </div>
    );
}

function InternshipRow({ internship }) {
    return (
        <div className="rounded-[var(--radius-md)] border border-border p-4 transition-colors hover:border-primary/30">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div className="min-w-0">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <h3 className="font-ui text-sm font-bold text-text">
                            {internship.title || "Untitled internship"}
                        </h3>

                        <StatusBadge status={internship.status} />
                    </div>

                    <p className="font-ui text-xs text-text-secondary">
                        {internship.category || "Uncategorized"}
                        {internship.workMode &&
                        internship.workMode !== "unspecified"
                            ? ` · ${internship.workMode}`
                            : ""}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 font-ui text-[11px] text-text-muted">
                        <span>
                            {internship.applicantCount || 0} applicants
                        </span>

                        <span>
                            Posted {formatDate(internship.createdAt)}
                        </span>

                        {internship.locationLabel && (
                            <span>{internship.locationLabel}</span>
                        )}
                    </div>
                </div>

                <Link
                    href="/recruiter/internships"
                    className="shrink-0 text-xs font-semibold text-primary hover:underline"
                >
                    Manage listing →
                </Link>
            </div>
        </div>
    );
}

function ApplicationRow({ application }) {
    const student = application.student;
    const internship = application.internship;

    return (
        <div className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-soft font-ui text-xs font-bold text-primary">
                {getInitials(student?.name)}
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate font-ui text-xs font-bold text-text">
                    {student?.name || "Student"}
                </p>

                <p className="mt-0.5 truncate font-ui text-[11px] text-text-secondary">
                    {internship?.title || "Internship application"}
                </p>

                <p className="mt-1 truncate font-ui text-[10px] text-text-muted">
                    {student?.profile?.college || "University not provided"}
                    {" · "}
                    {formatRelativeDate(
                        application.appliedAt || application.createdAt
                    )}
                </p>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
                <StatusBadge
                    status={application.status}
                    application
                />

                <Link
                    href="/recruiter/applications"
                    className="font-ui text-[10px] font-semibold text-primary hover:underline"
                >
                    View
                </Link>
            </div>
        </div>
    );
}

export default function RecruiterDashboardPage() {
    const [recruiter, setRecruiter] = useState(null);
    const [internships, setInternships] = useState([]);
    const [applications, setApplications] = useState([]);

    const [internshipStats, setInternshipStats] = useState({
        total: 0,
        draft: 0,
        pending: 0,
        active: 0,
        rejected: 0,
        expired: 0,
        withdrawn: 0,
        applicants: 0,
    });

    const [applicationStats, setApplicationStats] = useState({
        total: 0,
        applied: 0,
        interviewing: 0,
        offered: 0,
        rejected: 0,
        withdrawn: 0,
    });

    const [activeFilter, setActiveFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboard = useCallback(async (signal) => {
        setLoading(true);
        setError("");

        try {
            const endpoints = [
                "/api/auth/me",
                "/api/recruiter/internships?page=1&limit=5",
                "/api/recruiter/applications?page=1&limit=5",
            ];

            const responses = await Promise.all(
                endpoints.map((endpoint) =>
                    fetch(endpoint, {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                        signal,
                    })
                )
            );

            const results = await Promise.all(
                responses.map(async (response) => {
                    const contentType =
                        response.headers.get("content-type") || "";

                    if (!contentType.includes("application/json")) {
                        throw new Error(
                            "The server returned an unexpected response. Check the recruiter API routes."
                        );
                    }

                    const result = await response.json();

                    if (!response.ok || !result.success) {
                        throw new Error(
                            result.message || "Unable to load recruiter dashboard."
                        );
                    }

                    return result;
                })
            );

            if (signal.aborted) return;

            const [authResult, internshipResult, applicationResult] = results;

            if (
                !authResult.user ||
                authResult.user.role !== "recruiter"
            ) {
                throw new Error(
                    "A recruiter account is required to access this dashboard."
                );
            }

            setRecruiter(authResult.user);
            setInternships(internshipResult.data || []);
            setApplications(applicationResult.data || []);

            setInternshipStats({
                total: 0,
                draft: 0,
                pending: 0,
                active: 0,
                rejected: 0,
                expired: 0,
                withdrawn: 0,
                applicants: 0,
                ...(internshipResult.stats || {}),
            });

            setApplicationStats({
                total: 0,
                applied: 0,
                interviewing: 0,
                offered: 0,
                rejected: 0,
                withdrawn: 0,
                ...(applicationResult.stats || {}),
            });
        } catch (err) {
            if (err.name !== "AbortError") {
                setError(
                    err.message || "Unable to load recruiter dashboard."
                );
            }
        } finally {
            if (!signal.aborted) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        fetchDashboard(controller.signal);

        return () => controller.abort();
    }, [fetchDashboard]);

    const filteredInternships = useMemo(() => {
        if (activeFilter === "all") return internships;

        return internships.filter(
            (internship) => internship.status === activeFilter
        );
    }, [internships, activeFilter]);

    const stats = [
        {
            label: "Total Listings",
            value: internshipStats.total,
            description: "Your internship listings",
            accent: "bg-primary/10 text-primary",
            icon: (
                <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
                    />
                </svg>
            ),
        },
        {
            label: "Active Listings",
            value: internshipStats.active,
            description: "Visible to students",
            accent: "bg-success/10 text-success",
            icon: (
                <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m9 12.75 2.25 2.25L15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                </svg>
            ),
        },
        {
            label: "Total Applicants",
            value: internshipStats.applicants,
            description: "Submitted applications",
            accent: "bg-amber-500/10 text-amber-600",
            icon: (
                <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 19h5v-1a4 4 0 0 0-5.5-3.7M16 19H8m8 0v-1a4 4 0 0 0-8 0v1m8-11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm5 3a3 3 0 1 1-6 0"
                    />
                </svg>
            ),
        },
        {
            label: "Pending Listings",
            value: internshipStats.pending,
            description: "Awaiting verification",
            accent: "bg-orange-500/10 text-orange-600",
            icon: (
                <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6l4 2m5-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                </svg>
            ),
        },
    ];

    if (loading) {
        return <LoadingDashboard />;
    }

    if (error) {
        return (
            <main className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-xl rounded-[var(--radius-lg)] border border-red-500/20 bg-surface p-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-600">
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.8}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v4m0 4h.01M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z"
                            />
                        </svg>
                    </div>

                    <h1 className="mt-4 font-display text-xl font-bold text-text">
                        Unable to load recruiter dashboard
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-text-secondary">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => {
                            const controller = new AbortController();
                            fetchDashboard(controller.signal);
                        }}
                        className="mt-6 rounded-[var(--radius-md)] bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                        Try again
                    </button>
                </div>
            </main>
        );
    }

    const recruiterName =
        recruiter?.name?.trim()?.split(/\s+/)[0] || "Recruiter";

    const companyName =
        recruiter?.recruiterProfile?.companyName ||
        recruiter?.company?.name ||
        "your company";

    const filters = [
        { label: "All", value: "all" },
        { label: "Active", value: "active" },
        { label: "Pending", value: "pending" },
        { label: "Draft", value: "draft" },
        { label: "Rejected", value: "rejected" },
    ];

    return (
        <main className="mx-auto w-full max-w-[1600px] min-w-0 px-4 py-6 font-ui text-text sm:px-6 lg:px-8">
            <section className="mb-6">
                <RecruiterPageHeader
                    recruiter={{
                        ...recruiter,
                        greetingName: recruiterName,
                    }}
                    message={`Manage your internship opportunities at ${companyName}.`}
                />
            </section>

            <section className="mb-6">
                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
                    {stats.map((stat) => (
                        <StatCard key={stat.label} {...stat} />
                    ))}
                </div>
            </section>

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                <div className="space-y-6 lg:col-span-8">
                    <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-xs sm:p-5">
                        <div className="flex flex-col justify-between gap-3 border-b border-border/80 pb-3 sm:flex-row sm:items-center">
                            <RecruiterSectionHeader
                                title="Your internship listings"
                                subtitle="Create, manage and monitor your opportunities."
                                action={
                                    <Link
                                        href="/recruiter/internships"
                                        className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                                    >
                                        <span className="text-base leading-none">
                                            +
                                        </span>
                                        Manage listings
                                    </Link>
                                }
                            />
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-1.5">
                            {filters.map((filter) => (
                                <button
                                    key={filter.value}
                                    type="button"
                                    onClick={() => setActiveFilter(filter.value)}
                                    className={`cursor-pointer select-none rounded-[var(--radius-sm)] border px-2.5 py-1 text-xs font-semibold transition-colors ${
                                        activeFilter === filter.value
                                            ? "border-primary bg-primary text-white"
                                            : "border-border bg-surface-alt text-text-secondary hover:text-text"
                                    }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>

                        <div className="mt-4 space-y-3">
                            {filteredInternships.length > 0 ? (
                                filteredInternships.map((internship) => (
                                    <InternshipRow
                                        key={internship._id}
                                        internship={internship}
                                    />
                                ))
                            ) : (
                                <EmptyState
                                    title="No listings found"
                                    description={
                                        activeFilter === "all"
                                            ? "You have not created any internship listings yet."
                                            : `You do not have any ${activeFilter} listings.`
                                    }
                                    action="View listings"
                                    href="/recruiter/internships"
                                />
                            )}
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/80 pt-4">
                            <p className="text-[11px] text-text-muted">
                                Showing {filteredInternships.length} of{" "}
                                {internshipStats.total} listings on this page
                            </p>

                            <Link
                                href="/recruiter/internships"
                                className="shrink-0 text-xs font-semibold text-primary hover:underline"
                            >
                                View all →
                            </Link>
                        </div>
                    </section>

                    <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-xs sm:p-5">
                        <div className="flex items-center justify-between gap-3 border-b border-border/80 pb-3">
                            <RecruiterSectionHeader
                                title="Recent applications"
                                subtitle="Latest students applying to your listings."
                            />

                            <Link
                                href="/recruiter/applications"
                                className="shrink-0 text-xs font-semibold text-primary hover:underline"
                            >
                                View all →
                            </Link>
                        </div>

                        <div className="divide-y divide-border">
                            {applications.length > 0 ? (
                                applications.map((application) => (
                                    <ApplicationRow
                                        key={application._id}
                                        application={application}
                                    />
                                ))
                            ) : (
                                <div className="py-8">
                                    <EmptyState
                                        title="No applications yet"
                                        description="Applications submitted by students will appear here."
                                        action="View listings"
                                        href="/recruiter/internships"
                                    />
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <aside className="space-y-4 lg:col-span-4">
                    <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-xs sm:p-5">
                        <RecruiterSectionHeader
                            title="Recruiter account"
                            subtitle="Your signed-in account information."
                        />

                        <div className="mt-4 flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-rose-soft font-ui text-sm font-extrabold text-primary">
                                {getInitials(recruiter?.name)}
                            </div>

                            <div className="min-w-0">
                                <p className="truncate font-ui text-sm font-bold text-text">
                                    {recruiter?.name || "Recruiter"}
                                </p>

                                <p className="mt-0.5 truncate font-ui text-[11px] text-text-muted">
                                    {recruiter?.email || "Email unavailable"}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-3 border-t border-border pt-3">
                            <div className="flex items-center justify-between gap-3 text-xs">
                                <span className="text-text-secondary">
                                    Account type
                                </span>
                                <span className="font-semibold capitalize text-text">
                                    {recruiter?.role || "Recruiter"}
                                </span>
                            </div>

                            {recruiter?.recruiterProfile?.jobTitle && (
                                <div className="flex items-center justify-between gap-3 text-xs">
                                    <span className="text-text-secondary">
                                        Job title
                                    </span>
                                    <span className="text-right font-semibold text-text">
                                        {recruiter.recruiterProfile.jobTitle}
                                    </span>
                                </div>
                            )}

                            <Link
                                href="/recruiter/profile"
                                className="block w-full rounded-[var(--radius-md)] border border-border py-2.5 text-center text-xs font-semibold text-text transition hover:bg-surface-alt"
                            >
                                View recruiter profile
                            </Link>
                        </div>
                    </section>

                    <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-xs sm:p-5">
                        <RecruiterSectionHeader
                            title="Listing overview"
                            subtitle="Distribution of your listings by status."
                        />

                        <div className="mt-4 space-y-4">
                            {[
                                {
                                    label: "Active",
                                    count: internshipStats.active,
                                    color: "bg-success",
                                },
                                {
                                    label: "Pending",
                                    count: internshipStats.pending,
                                    color: "bg-amber-500",
                                },
                                {
                                    label: "Draft",
                                    count: internshipStats.draft,
                                    color: "bg-border",
                                },
                                {
                                    label: "Rejected",
                                    count: internshipStats.rejected,
                                    color: "bg-red-500",
                                },
                            ].map((item) => {
                                const percentage =
                                    internshipStats.total > 0
                                        ? (item.count / internshipStats.total) * 100
                                        : 0;

                                return (
                                    <div key={item.label}>
                                        <div className="mb-1.5 flex items-center justify-between">
                                            <span className="text-xs text-text-secondary">
                                                {item.label}
                                            </span>

                                            <span className="text-xs font-bold text-text">
                                                {item.count}
                                            </span>
                                        </div>

                                        <div className="h-1.5 overflow-hidden rounded-full bg-surface-alt">
                                            <div
                                                className={`h-full rounded-full ${item.color}`}
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <p className="mt-4 border-t border-border pt-3 text-[11px] text-text-muted">
                            {internshipStats.total} total listings
                        </p>
                    </section>

                    <section className="rounded-[var(--radius-lg)] border border-primary/10 bg-rose-soft/40 p-4 sm:p-5">
                        <RecruiterSectionHeader
                            title="Quick actions"
                            subtitle="Shortcuts to common tasks."
                        />

                        <div className="mt-4 space-y-2">
                            <Link
                                href="/recruiter/internships"
                                className="block rounded-[var(--radius-md)] border border-border bg-surface p-3 transition hover:border-primary/30"
                            >
                                <p className="text-xs font-bold text-text">
                                    Manage internship listings
                                </p>
                                <p className="mt-0.5 text-[11px] text-text-muted">
                                    Create and manage your opportunities
                                </p>
                            </Link>

                            <Link
                                href="/recruiter/applications"
                                className="block rounded-[var(--radius-md)] border border-border bg-surface p-3 transition hover:border-primary/30"
                            >
                                <p className="text-xs font-bold text-text">
                                    Review applications
                                </p>
                                <p className="mt-0.5 text-[11px] text-text-muted">
                                    View applicants and their submitted details
                                </p>
                            </Link>

                            <Link
                                href="/recruiter/profile"
                                className="block rounded-[var(--radius-md)] border border-border bg-surface p-3 transition hover:border-primary/30"
                            >
                                <p className="text-xs font-bold text-text">
                                    Edit recruiter profile
                                </p>
                                <p className="mt-0.5 text-[11px] text-text-muted">
                                    Update your account information
                                </p>
                            </Link>
                        </div>
                    </section>
                </aside>
            </div>
        </main>
    );
}
