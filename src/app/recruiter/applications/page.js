
"use client";

import { useCallback, useEffect, useState } from "react";

const STATUS_OPTIONS = [
    "all",
    "applied",
    "interviewing",
    "offered",
    "rejected",
];

const STATUS_STYLES = {
    applied: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    interviewing: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    offered: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    rejected: "bg-red-500/10 text-red-600 border-red-500/20",
    withdrawn: "bg-surface-alt text-text-muted border-border",
};

function formatDate(date) {
    if (!date) return "Not available";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "Not available";

    return parsed.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatStatus(status) {
    if (!status) return "Unknown";

    return status.charAt(0).toUpperCase() + status.slice(1);
}

function getInitials(name = "") {
    return name
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "S";
}

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${
                STATUS_STYLES[status] || "bg-surface-alt text-text-muted border-border"
            }`}
        >
            {formatStatus(status)}
        </span>
    );
}

function StatCard({ label, value, description, icon, color }) {
    return (
        <div className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-text-muted">{label}</p>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                    {icon}
                </div>
            </div>

            <p className="mt-3 font-display text-3xl font-bold text-text">
                {value ?? 0}
            </p>

            <p className="mt-1 text-xs text-text-muted">{description}</p>
        </div>
    );
}

function EmptyState({ title, description }) {
    return (
        <div className="px-5 py-20 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-soft text-primary">
                <svg
                    viewBox="0 0 24 24"
                    className="h-7 w-7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                >
                    <rect x="4" y="3" width="16" height="18" rx="2" />
                    <path
                        d="M8 8h8M8 12h8M8 16h5"
                        strokeLinecap="round"
                    />
                </svg>
            </div>

            <h3 className="font-display text-lg font-bold text-text">
                {title}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
                {description}
            </p>
        </div>
    );
}

function ApplicationCard({
    application,
    onStatusChange,
    onDownloadCV,
    updatingId,
    downloadingId,
}) {
    const student = application.student || {};
    const internship = application.internship || {};
    const cv = application.cv || {};

    const studentName = student.name || "Student";
    const studentEmail = student.email || "No email available";

    const isUpdating = updatingId === application._id;
    const isDownloading = downloadingId === application._id;

    const canDownloadCV = Boolean(application.cv?._id);

    const college = student.profile?.college || "";
    const degree = student.profile?.degree || "";
    const graduationYear = student.profile?.graduationYear || "";

    const skills = Array.isArray(student.profile?.skills)
        ? student.profile.skills
        : [];

    return (
        <article className="overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-primary/30">
            <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-rose-soft font-display text-lg font-bold text-primary">
                            {getInitials(studentName)}
                        </div>

                        <div className="min-w-0">
                            <h3 className="font-display text-lg font-bold text-text">
                                {studentName}
                            </h3>

                            <p className="mt-1 break-all text-xs text-text-secondary">
                                {studentEmail}
                            </p>

                            {college && (
                                <p className="mt-2 text-xs text-text-muted">
                                    {college}
                                </p>
                            )}

                            {(degree || graduationYear) && (
                                <p className="mt-1 text-xs text-text-muted">
                                    {[degree, graduationYear].filter(Boolean).join(" · ")}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <StatusBadge status={application.status} />

                        <button
                            type="button"
                            onClick={() => onDownloadCV(application)}
                            disabled={!canDownloadCV || isDownloading}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-text transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {isDownloading ? (
                                "Opening CV..."
                            ) : (
                                <>
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                    >
                                        <path
                                            d="M12 3v12m0 0 5-5m-5 5-5-5M5 17v3h14v-3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    Download CV
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                            Internship Applied For
                        </p>

                        <p className="mt-2 text-sm font-semibold text-text">
                            {internship.title || "Internship"}
                        </p>

                        {internship.category && (
                            <p className="mt-1 text-xs text-text-muted">
                                {internship.category}
                            </p>
                        )}
                    </div>

                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                            Application Date
                        </p>

                        <p className="mt-2 text-sm text-text">
                            {formatDate(application.appliedAt || application.createdAt)}
                        </p>
                    </div>

                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                            Application Method
                        </p>

                        <p className="mt-2 text-sm text-text">
                            {application.applicationMethod === "external"
                                ? "External application"
                                : "InternCheck application"}
                        </p>
                    </div>
                </div>

                <div className="mt-5 rounded-xl border border-border bg-background p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                                Candidate CV
                            </p>

                            <p className="mt-1 break-all text-sm font-medium text-text">
                                {cv.originalName || "No CV attached"}
                            </p>

                            {cv.version && (
                                <p className="mt-1 text-xs text-text-muted">
                                    CV Version {cv.version}
                                </p>
                            )}
                        </div>

                        {cv.sizeBytes && (
                            <span className="text-xs text-text-muted">
                                {(cv.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                            </span>
                        )}
                    </div>
                </div>

                {skills.length > 0 && (
                    <div className="mt-5">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                            Candidate Skills
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill, index) => (
                                <span
                                    key={`${skill}-${index}`}
                                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-text-secondary"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {application.notes && (
                    <div className="mt-5 rounded-xl bg-rose-soft/40 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                            Student's Application Note
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text-secondary">
                            {application.notes}
                        </p>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-3 border-t border-border bg-background px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                    <p className="text-xs font-semibold text-text">
                        Recruitment Status
                    </p>

                    <p className="mt-1 text-[11px] text-text-muted">
                        Update the candidate's application progress.
                    </p>
                </div>

                <select
                    value={application.status || "applied"}
                    onChange={(event) =>
                        onStatusChange(application._id, event.target.value)
                    }
                    disabled={isUpdating || application.status === "withdrawn"}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 sm:w-48"
                >
                    {STATUS_OPTIONS.filter((status) => status !== "all").map((status) => (
                        <option key={status} value={status}>
                            {formatStatus(status)}
                        </option>
                    ))}
                </select>
            </div>
        </article>
    );
}

export default function RecruiterApplicationsPage() {
    const [applications, setApplications] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        applied: 0,
        interviewing: 0,
        offered: 0,
        rejected: 0,
        withdrawn: 0,
    });

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    const [status, setStatus] = useState("all");
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);

    const loadApplications = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const query = new URLSearchParams({
                page: String(page),
                limit: "10",
            });

            if (status !== "all") {
                query.set("status", status);
            }

            if (search.trim()) {
                query.set("search", search.trim());
            }

            const response = await fetch(
                `/api/recruiter/applications?${query.toString()}`,
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to load recruiter applications."
                );
            }

            setApplications(Array.isArray(result.data) ? result.data : []);

            setStats({
                total: result.stats?.total ?? 0,
                applied: result.stats?.applied ?? 0,
                interviewing: result.stats?.interviewing ?? 0,
                offered: result.stats?.offered ?? 0,
                rejected: result.stats?.rejected ?? 0,
                withdrawn: result.stats?.withdrawn ?? 0,
            });

            setPagination({
                page: result.pagination?.page ?? page,
                limit: result.pagination?.limit ?? 10,
                total: result.pagination?.total ?? 0,
                totalPages: result.pagination?.totalPages ?? 0,
            });
        } catch (err) {
            setError(err.message || "Unable to load applications.");
        } finally {
            setLoading(false);
        }
    }, [page, status, search]);

    useEffect(() => {
        loadApplications();
    }, [loadApplications]);

    async function handleStatusChange(applicationId, newStatus) {
        setUpdatingId(applicationId);
        setError("");
        setSuccess("");

        try {
            const response = await fetch(
                `/api/recruiter/applications/${applicationId}`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        status: newStatus,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to update application status."
                );
            }

            setSuccess("Application status updated successfully.");

            await loadApplications();
        } catch (err) {
            setError(err.message || "Unable to update application status.");
        } finally {
            setUpdatingId(null);
        }
    }

    async function handleDownloadCV(application) {
        if (!application.cv?._id) {
            setError("This application does not have an attached CV.");
            return;
        }

        setDownloadingId(application._id);
        setError("");
        setSuccess("");

        try {
            const response = await fetch(
                `/api/recruiter/applications/${application._id}/cv`,
                {
                    method: "GET",
                    credentials: "include",
                    redirect: "manual",
                }
            );

            if (response.status === 302 || response.status === 303 || response.status === 307) {
                const location = response.headers.get("Location");
                if (!location) throw new Error("The CV download link was not returned.");
                window.open(location, "_blank", "noopener,noreferrer");
                setSuccess("CV download opened in a new tab.");
                return;
            }

            if (!response.ok) {
                let message = "Unable to download this CV.";
                try {
                    const result = await response.json();
                    message = result.message || message;
                } catch {}
                throw new Error(message);
            }

            const blob = await response.blob();
            if (!blob.size) throw new Error("The CV file is empty.");

            const objectUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = objectUrl;
            link.download = application.cv.originalName || "candidate-cv";
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
            setSuccess("Candidate CV downloaded successfully.");
        } catch (err) {
            // Redirects to authenticated Cloudinary URLs may be blocked by fetch/CORS.
            // Open the same authenticated endpoint as a normal browser navigation.
            const fallback = window.open(
                `/api/recruiter/applications/${application._id}/cv`,
                "_blank",
                "noopener,noreferrer"
            );
            if (fallback) {
                setSuccess("CV download opened in a new tab.");
            } else {
                setError(err.message || "Unable to open the CV. Allow pop-ups and try again.");
            }
        } finally {
            setDownloadingId(null);
        }
    }

    function applySearch(event) {
        event.preventDefault();
        setPage(1);
        setSearch(searchInput.trim());
    }

    const totalApplications = stats.total ?? 0;

    return (
        <div className="mx-auto max-w-7xl space-y-7 pb-10">
            <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                            Recruiter Workspace
                        </span>
                    </div>

                    <h1 className="font-display text-2xl font-bold tracking-tight text-text sm:text-3xl">
                        Applications
                    </h1>

                    <p className="mt-2 max-w-xl text-sm text-text-secondary">
                        Review candidates who applied to your internships and manage their recruitment progress.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadApplications}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-xs font-bold text-text transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                    >
                        <path
                            d="M20 7v5h-5M4 17v-5h5M5.5 9a7 7 0 0 1 12-2L20 12M4 12l2.5 5a7 7 0 0 0 12-2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    {loading ? "Refreshing..." : "Refresh"}
                </button>
            </section>

            {error && (
                <div className="flex items-start justify-between gap-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600">
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={loadApplications}
                        className="shrink-0 text-xs font-bold underline"
                    >
                        Try again
                    </button>
                </div>
            )}

            {success && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-600">
                    {success}
                </div>
            )}

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Total Applications"
                    value={stats.total}
                    description="Applications received"
                    color="bg-rose-soft text-primary"
                    icon={
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <rect x="4" y="3" width="16" height="18" rx="2" />
                            <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
                        </svg>
                    }
                />

                <StatCard
                    label="Applied"
                    value={stats.applied}
                    description="Awaiting review"
                    color="bg-amber-500/10 text-amber-600"
                    icon={
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7v5l3 2" strokeLinecap="round" />
                        </svg>
                    }
                />

                <StatCard
                    label="Interviewing"
                    value={stats.interviewing}
                    description="Candidates in interview"
                    color="bg-purple-500/10 text-purple-600"
                    icon={
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <circle cx="12" cy="12" r="9" />
                            <circle cx="12" cy="12" r="4" />
                        </svg>
                    }
                />

                <StatCard
                    label="Offers"
                    value={stats.offered}
                    description="Offers extended"
                    color="bg-emerald-500/10 text-emerald-600"
                    icon={
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    }
                />
            </section>

            <section className="overflow-hidden rounded-2xl border border-border bg-surface">
                <div className="border-b border-border p-5 sm:p-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-display text-lg font-bold text-text">
                                Candidate Applications
                            </h2>

                            <p className="mt-1 text-xs text-text-muted">
                                Applications submitted to your company's internships.
                            </p>
                        </div>

                        <span className="rounded-full bg-rose-soft px-3 py-1.5 text-xs font-bold text-primary">
                            {totalApplications} total
                        </span>
                    </div>

                    <form
                        onSubmit={applySearch}
                        className="mt-5 flex flex-col gap-3 lg:flex-row"
                    >
                        <div className="relative flex-1">
                            <svg
                                viewBox="0 0 24 24"
                                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <circle cx="10.8" cy="10.8" r="6.8" />
                                <path d="m16 16 4.5 4.5" strokeLinecap="round" />
                            </svg>

                            <input
                                type="search"
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                                placeholder="Search by candidate name, email or college..."
                                className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(event) => {
                                setStatus(event.target.value);
                                setPage(1);
                            }}
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 lg:w-52"
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                    {option === "all" ? "All statuses" : formatStatus(option)}
                                </option>
                            ))}
                        </select>

                        <button
                            type="submit"
                            className="rounded-xl bg-primary px-6 py-3 text-xs font-bold text-white transition-opacity hover:opacity-90"
                        >
                            Search
                        </button>
                    </form>
                </div>

                <div className="px-5 py-4 sm:px-6">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-text-muted">
                            Showing {applications.length} of {pagination.total} applications
                        </p>

                        {(search || status !== "all") && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchInput("");
                                    setSearch("");
                                    setStatus("all");
                                    setPage(1);
                                }}
                                className="text-left text-xs font-semibold text-primary hover:underline"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-4 px-5 pb-5 sm:px-6 sm:pb-6">
                    {loading ? (
                        <div className="py-16 text-center">
                            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            <p className="mt-4 text-sm text-text-muted">
                                Loading candidate applications...
                            </p>
                        </div>
                    ) : applications.length === 0 ? (
                        <EmptyState
                            title={
                                search || status !== "all"
                                    ? "No matching applications"
                                    : "No applications yet"
                            }
                            description={
                                search || status !== "all"
                                    ? "Try changing your search term or status filter."
                                    : "When students apply to your company's internships, their applications and CVs will appear here."
                            }
                        />
                    ) : (
                        applications.map((application) => (
                            <ApplicationCard
                                key={application._id}
                                application={application}
                                onStatusChange={handleStatusChange}
                                onDownloadCV={handleDownloadCV}
                                updatingId={updatingId}
                                downloadingId={downloadingId}
                            />
                        ))
                    )}
                </div>
            </section>

            {!loading && pagination.totalPages > 1 && (
                <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                    <p className="text-xs text-text-muted">
                        Page {pagination.page} of {pagination.totalPages}
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                            className="rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-text transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Previous
                        </button>

                        <button
                            type="button"
                            disabled={page >= pagination.totalPages}
                            onClick={() => setPage((previous) => Math.min(pagination.totalPages, previous + 1))}
                            className="rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-text transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}