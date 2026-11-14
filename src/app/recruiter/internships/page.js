
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import RecruiterSectionHeader from "@/components/shared/recruiter/RecruiterSectionHeader";

const INITIAL_FORM = {
    title: "",
    category: "",
    description: "",
    requiredSkills: "",
    preferredSkills: "",
    workMode: "remote",
    city: "",
    state: "",
    country: "India",
    stipendAmount: "",
    stipendPeriod: "monthly",
    durationValue: "",
    durationUnit: "months",
    deadline: "",
    applicationMethod: "internal",
    applicationUrl: "",
    degrees: "",
    graduationYears: "",
    otherRequirements: "",
};

const FILTERS = [
    { label: "All", value: "" },
    { label: "Active", value: "active" },
    { label: "Pending", value: "pending" },
    { label: "Draft", value: "draft" },
    { label: "Rejected", value: "rejected" },
    { label: "Withdrawn", value: "withdrawn" },
    { label: "Expired", value: "expired" },
];

const STATUS_STYLES = {
    active: "bg-success/10 text-success border-success/20",
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    draft: "bg-surface-alt text-text-muted border-border",
    rejected: "bg-red-500/10 text-red-600 border-red-500/20",
    withdrawn: "bg-surface-alt text-text-muted border-border",
    expired: "bg-surface-alt text-text-muted border-border",
};

function formatStatus(status) {
    if (!status) return "Unknown";

    return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(value) {
    if (!value) return "Not specified";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Not specified";

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatLocation(internship) {
    const location = internship.location || {};

    const parts = [
        location.city,
        location.state,
        location.country,
    ].filter(Boolean);

    return parts.length
        ? parts.join(", ")
        : formatStatus(internship.workMode || "unspecified");
}

function formatStipend(stipend = {}) {
    if (stipend.period === "unpaid") return "Unpaid";

    if (stipend.amount === null || stipend.amount === undefined) {
        return "Not specified";
    }

    const amount = new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 0,
    }).format(stipend.amount);

    const periods = {
        hourly: "/hour",
        weekly: "/week",
        monthly: "/month",
        total: " total",
    };

    return `₹${amount}${periods[stipend.period] || ""}`;
}

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-ui text-[11px] font-bold ${
                STATUS_STYLES[status] || STATUS_STYLES.draft
            }`}
        >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {formatStatus(status)}
        </span>
    );
}

function StatCard({ label, value, description, icon, accent }) {
    return (
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="font-ui text-xs font-medium text-text-secondary">
                        {label}
                    </p>

                    <h3 className="mt-2 font-display text-2xl font-bold text-text">
                        {value}
                    </h3>

                    <p className="mt-1 font-ui text-[11px] text-text-muted">
                        {description}
                    </p>
                </div>

                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

function FormField({
    label,
    name,
    value,
    onChange,
    placeholder,
    type = "text",
    required = false,
    min,
    options,
}) {
    const className =
        "w-full rounded-xl border border-border bg-white/60 px-3.5 py-3 text-sm text-text outline-none transition-all placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/10 dark:bg-white/5";

    return (
        <div>
            <label
                htmlFor={name}
                className="mb-1.5 block font-ui text-xs font-semibold text-text-secondary"
            >
                {label}
                {required && " *"}
            </label>

            {options ? (
                <select
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className={className}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    id={name}
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    min={min}
                    className={className}
                />
            )}
        </div>
    );
}

function EmptyState({ searchQuery, onCreate }) {
    return (
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface px-5 py-14 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-alt text-text-muted">
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
                        d="M8 7h8m-8 5h8m-8 5h4m-7 4h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v16a2 2 0 002 2Z"
                    />
                </svg>
            </div>

            <h3 className="font-ui text-sm font-bold text-text">
                {searchQuery ? "No matching internships" : "No internships yet"}
            </h3>

            <p className="mt-1 font-ui text-xs text-text-muted">
                {searchQuery
                    ? "Try changing your search or selected filter."
                    : "Create your first internship listing to get started."}
            </p>

            {!searchQuery && (
                <button
                    type="button"
                    onClick={onCreate}
                    className="mt-4 rounded-lg bg-primary px-4 py-2.5 font-ui text-xs font-semibold text-white hover:opacity-90"
                >
                    Create internship
                </button>
            )}
        </div>
    );
}

async function readApiResponse(response) {
    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
        throw new Error(
            "The server returned an unexpected response. Check the API route."
        );
    }

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message || "The requested operation failed."
        );
    }

    return result;
}

function parseCommaSeparated(value) {
    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

function getFormData(internship) {
    return {
        title: internship.title || "",
        category: internship.category || "",
        description: internship.description || "",
        requiredSkills: (internship.requiredSkills || []).join(", "),
        preferredSkills: (internship.preferredSkills || []).join(", "),
        workMode: internship.workMode || "remote",
        city: internship.location?.city || "",
        state: internship.location?.state || "",
        country: internship.location?.country || "India",
        stipendAmount: internship.stipend?.amount ?? "",
        stipendPeriod: internship.stipend?.period || "monthly",
        durationValue: internship.duration?.value ?? "",
        durationUnit: internship.duration?.unit || "months",
        deadline: internship.applicationDeadline
            ? new Date(internship.applicationDeadline)
                .toISOString()
                .slice(0, 10)
            : "",
        applicationMethod: internship.applicationMethod || "internal",
        applicationUrl: internship.applicationUrl || "",
        degrees: (internship.eligibility?.degrees || []).join(", "),
        graduationYears: (
            internship.eligibility?.graduationYears || []
        ).join(", "),
        otherRequirements:
            internship.eligibility?.otherRequirements || "",
    };
}

export default function RecruiterInternshipsPage() {
    const [internships, setInternships] = useState([]);

    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        pending: 0,
        applicants: 0,
        draft: 0,
        rejected: 0,
        withdrawn: 0,
        expired: 0,
    });

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 100,
        total: 0,
        totalPages: 0,
    });

    const [formData, setFormData] = useState(INITIAL_FORM);
    const [activeFilter, setActiveFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const [showPostModal, setShowPostModal] = useState(false);
    const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);

    const [selectedInternship, setSelectedInternship] = useState(null);
    const [editingInternship, setEditingInternship] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const fetchInternships = useCallback(async (signal) => {
        setLoading(true);
        setError("");

        try {
            const params = new URLSearchParams({
                page: "1",
                limit: "100",
            });

            if (activeFilter) {
                params.set("status", activeFilter);
            }

            if (searchQuery.trim()) {
                params.set("search", searchQuery.trim());
            }

            const response = await fetch(
                `/api/recruiter/internships?${params.toString()}`,
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                    signal,
                }
            );

            const result = await readApiResponse(response);

            if (signal?.aborted) return;

            setInternships(result.data || []);

            setStats({
                total: 0,
                active: 0,
                pending: 0,
                applicants: 0,
                draft: 0,
                rejected: 0,
                withdrawn: 0,
                expired: 0,
                ...(result.stats || {}),
            });

            setPagination(
                result.pagination || {
                    page: 1,
                    limit: 100,
                    total: (result.data || []).length,
                    totalPages: 1,
                }
            );
        } catch (err) {
            if (err.name !== "AbortError") {
                setError(err.message || "Unable to load internships.");
            }
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
            }
        }
    }, [activeFilter, searchQuery]);

    useEffect(() => {
        const controller = new AbortController();

        const timeout = setTimeout(
            () => fetchInternships(controller.signal),
            searchQuery.trim() ? 350 : 0
        );

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [fetchInternships, searchQuery]);

    const filteredInternships = useMemo(
        () => internships,
        [internships]
    );

    const filterCounts = {
        "": stats.total,
        active: stats.active,
        pending: stats.pending,
        draft: stats.draft,
        rejected: stats.rejected,
        withdrawn: stats.withdrawn,
        expired: stats.expired,
    };

    function handleFormChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    function openCreateModal() {
        setEditingInternship(null);
        setFormData(INITIAL_FORM);
        setError("");
        setSuccessMessage("");
        setShowPostModal(true);
    }

    function openEditModal(internship) {
        if (!["draft", "active"].includes(internship.status)) {
            return;
        }

        setEditingInternship(internship);
        setFormData(getFormData(internship));
        setError("");
        setSuccessMessage("");
        setShowPostModal(true);
    }

    function closePostModal() {
        if (saving) return;

        setShowPostModal(false);
        setEditingInternship(null);
        setFormData(INITIAL_FORM);
    }

    function buildPayload() {
        const stipendAmount =
            formData.stipendAmount === ""
                ? null
                : Number(formData.stipendAmount);

        const durationValue =
            formData.durationValue === ""
                ? null
                : Number(formData.durationValue);

        return {
            title: formData.title.trim(),
            category: formData.category.trim(),
            description: formData.description.trim(),

            requiredSkills: parseCommaSeparated(
                formData.requiredSkills
            ),

            preferredSkills: parseCommaSeparated(
                formData.preferredSkills
            ),

            workMode: formData.workMode,

            location: {
                city: formData.city.trim(),
                state: formData.state.trim(),
                country: formData.country.trim(),
            },

            stipend: {
                amount: formData.stipendPeriod === "unpaid"
                    ? null
                    : stipendAmount,
                currency: "INR",
                period: formData.stipendPeriod,
            },

            duration: {
                value: durationValue,
                unit: durationValue ? formData.durationUnit : null,
            },

            eligibility: {
                degrees: parseCommaSeparated(formData.degrees),
                graduationYears: parseCommaSeparated(
                    formData.graduationYears
                ).map(Number),
                otherRequirements: formData.otherRequirements.trim(),
            },

            applicationMethod: formData.applicationMethod,

            applicationUrl:
                formData.applicationMethod === "external"
                    ? formData.applicationUrl.trim()
                    : null,

            applicationDeadline: formData.deadline || null,
        };
    }

    function validateForm(payload) {
        if (
            !payload.title ||
            !payload.category ||
            !payload.description
        ) {
            return "Title, category and description are required.";
        }

        if (payload.title.length > 200) {
            return "The internship title cannot exceed 200 characters.";
        }

        if (payload.description.length > 20000) {
            return "The description is too long.";
        }

        if (
            payload.stipend.amount !== null &&
            (
                !Number.isFinite(payload.stipend.amount) ||
                payload.stipend.amount < 0
            )
        ) {
            return "Enter a valid stipend amount.";
        }

        if (
            payload.duration.value !== null &&
            (
                !Number.isFinite(payload.duration.value) ||
                payload.duration.value < 1
            )
        ) {
            return "Duration must be at least one unit.";
        }

        if (
            payload.eligibility.graduationYears.some(
                (year) =>
                    !Number.isInteger(year) ||
                    year < 2000 ||
                    year > 2100
            )
        ) {
            return "Enter valid graduation years between 2000 and 2100.";
        }

        if (
            payload.applicationMethod === "external" &&
            !payload.applicationUrl
        ) {
            return "An application URL is required for external applications.";
        }

        if (payload.applicationMethod === "external") {
            try {
                const url = new URL(payload.applicationUrl);

                if (!["http:", "https:"].includes(url.protocol)) {
                    return "Application URL must use HTTP or HTTPS.";
                }
            } catch {
                return "Enter a valid application URL.";
            }
        }

        if (payload.applicationDeadline) {
            const deadline = new Date(payload.applicationDeadline);

            if (Number.isNaN(deadline.getTime())) {
                return "Enter a valid application deadline.";
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (deadline < today) {
                return "Application deadline cannot be in the past.";
            }
        }

        return null;
    }

    async function saveInternship(shouldSubmit = false) {
        setError("");
        setSuccessMessage("");

        const payload = buildPayload();
        const validationError = validateForm(payload);

        if (validationError) {
            setError(validationError);
            return;
        }

        setSaving(true);

        try {
            const isEditing = Boolean(editingInternship);

            const response = await fetch(
                isEditing
                    ? `/api/internships/${editingInternship._id}`
                    : "/api/internships",
                {
                    method: isEditing ? "PATCH" : "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const result = await readApiResponse(response);
            const savedInternship = result.data;

            if (!savedInternship?._id) {
                throw new Error(
                    "The server saved the request but did not return an internship ID."
                );
            }

            if (shouldSubmit) {
                const submitResponse = await fetch(
                    `/api/internships/${savedInternship._id}/submit`,
                    {
                        method: "POST",
                        credentials: "include",
                    }
                );

                await readApiResponse(submitResponse);

                setSuccessMessage(
                    "Internship submitted for automated verification."
                );
            } else {
                setSuccessMessage(
                    isEditing
                        ? "Internship updated successfully."
                        : "Internship saved as a draft."
                );
            }

            setShowPostModal(false);
            setEditingInternship(null);
            setFormData(INITIAL_FORM);
            setActiveFilter("");
            setSearchQuery("");

            await fetchInternships();
        } catch (err) {
            setError(err.message || "Unable to save internship.");
        } finally {
            setSaving(false);
        }
    }

    async function submitDraft(internship) {
        setActionLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            const response = await fetch(
                `/api/internships/${internship._id}/submit`,
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            const result = await readApiResponse(response);

            setSuccessMessage(
                result.message || "Internship submitted for verification."
            );

            await fetchInternships();
        } catch (err) {
            setError(err.message || "Unable to submit internship.");
        } finally {
            setActionLoading(false);
        }
    }

    async function withdrawInternship() {
        if (!selectedInternship) return;

        setActionLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            const response = await fetch(
                `/api/internships/${selectedInternship._id}/withdraw`,
                {
                    method: "PATCH",
                    credentials: "include",
                }
            );

            const result = await readApiResponse(response);

            setShowWithdrawConfirm(false);
            setSelectedInternship(null);

            setSuccessMessage(
                result.message || "Internship withdrawn successfully."
            );

            await fetchInternships();
        } catch (err) {
            setError(err.message || "Unable to withdraw internship.");
        } finally {
            setActionLoading(false);
        }
    }

    const statCards = [
        {
            label: "Total Listings",
            value: stats.total,
            description: "All your opportunities",
            accent: "bg-primary/10 text-primary",
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                </svg>
            ),
        },
        {
            label: "Active Listings",
            value: stats.active,
            description: "Visible to students",
            accent: "bg-success/10 text-success",
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4m6 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            ),
        },
        {
            label: "Pending Review",
            value: stats.pending,
            description: "Awaiting assessment",
            accent: "bg-amber-500/10 text-amber-600",
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m5-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            ),
        },
        {
            label: "Total Applicants",
            value: stats.applicants,
            description: "Across all listings",
            accent: "bg-rose-soft text-primary",
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m16 0v-2a4 4 0 0 0-3-3.87M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8-7.87a4 4 0 0 1 0 7.75" />
                </svg>
            ),
        },
    ];

    return (
        <main className="mx-auto min-h-screen w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
            <div className="space-y-7">

                {/* Page heading */}
                <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-primary" />

                            <span className="font-ui text-xs font-bold uppercase tracking-wider text-text-muted">
                                Recruiter Workspace
                            </span>
                        </div>

                        <h1 className="font-display text-2xl tracking-tight text-text sm:text-3xl">
                            Internship Listings
                        </h1>

                        <p className="mt-1 font-ui text-sm text-text-secondary">
                            Create, manage and track your internship opportunities.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 py-2.5 font-ui text-xs font-bold text-white shadow-sm transition hover:opacity-90"
                    >
                        <span className="text-base leading-none">+</span>
                        Post Internship
                    </button>
                </section>

                {/* Alerts */}
                {error && (
                    <div
                        role="alert"
                        className="flex items-start justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3"
                    >
                        <p className="font-ui text-xs text-red-600">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() => setError("")}
                            className="shrink-0 text-xs font-bold text-red-600"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {successMessage && (
                    <div
                        role="status"
                        className="flex items-start justify-between gap-3 rounded-xl border border-success/20 bg-success/5 px-4 py-3"
                    >
                        <p className="font-ui text-xs text-success">
                            {successMessage}
                        </p>

                        <button
                            type="button"
                            onClick={() => setSuccessMessage("")}
                            className="shrink-0 text-xs font-bold text-success"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Statistics */}
                <section className="grid grid-cols-2 gap-3 xl:grid-cols-4 sm:gap-4">
                    {statCards.map((stat) => (
                        <StatCard key={stat.label} {...stat} />
                    ))}
                </section>

                {/* Listings */}
                <section className="space-y-4">
                    <RecruiterSectionHeader
                        title="Your Internships"
                        subtitle="Manage your published, pending and draft opportunities."
                    />

                    <div className="space-y-4 rounded-[var(--radius-lg)] border border-border bg-surface p-3 sm:p-4">
                        {/* Search */}
                        <div className="relative">
                            <svg
                                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <circle cx="11" cy="11" r="7" />
                                <path strokeLinecap="round" d="m16 16 4 4" />
                            </svg>

                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(event) =>
                                    setSearchQuery(event.target.value)
                                }
                                placeholder="Search by title, category or skills..."
                                className="w-full rounded-[var(--radius-md)] border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            {FILTERS.map((filter) => (
                                <button
                                    key={filter.value}
                                    type="button"
                                    onClick={() => setActiveFilter(filter.value)}
                                    className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 font-ui text-xs font-semibold transition ${
                                        activeFilter === filter.value
                                            ? "border-primary/20 bg-rose-soft text-primary"
                                            : "border-border bg-surface text-text-secondary hover:bg-surface-alt"
                                    }`}
                                >
                                    {filter.label}

                                    <span className="text-[10px] opacity-70">
                                        {filterCounts[filter.value] ?? 0}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="rounded-[var(--radius-lg)] border border-border bg-surface py-16 text-center">
                            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />

                            <p className="mt-3 font-ui text-xs text-text-muted">
                                Loading internships...
                            </p>
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && filteredInternships.length === 0 && (
                        <EmptyState
                            searchQuery={searchQuery}
                            onCreate={openCreateModal}
                        />
                    )}

                    {/* Desktop table */}
                    {!loading && filteredInternships.length > 0 && (
                        <>
                            <div className="hidden overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface lg:block">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="border-b border-border bg-surface-alt">
                                            <tr>
                                                {[
                                                    "Internship",
                                                    "Location",
                                                    "Applicants",
                                                    "Deadline",
                                                    "Status",
                                                    "Actions",
                                                ].map((heading) => (
                                                    <th
                                                        key={heading}
                                                        className={`px-5 py-3 font-ui text-[11px] font-bold uppercase tracking-wider text-text-muted ${
                                                            heading === "Actions"
                                                                ? "text-right"
                                                                : ""
                                                        }`}
                                                    >
                                                        {heading}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-border">
                                            {filteredInternships.map((internship) => (
                                                <tr
                                                    key={internship._id}
                                                    className="transition-colors hover:bg-surface-alt/60"
                                                >
                                                    <td className="px-5 py-4">
                                                        <p className="font-ui text-sm font-bold text-text">
                                                            {internship.title}
                                                        </p>

                                                        <p className="mt-1 font-ui text-[11px] text-text-muted">
                                                            {internship.category}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="font-ui text-xs text-text-secondary">
                                                            {formatLocation(internship)}
                                                        </p>

                                                        <p className="mt-1 font-ui text-[11px] text-text-muted">
                                                            {formatStatus(internship.workMode)}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span className="font-ui text-sm font-semibold text-text">
                                                            {internship.applicantCount || 0}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="font-ui text-xs text-text-secondary">
                                                            {formatDate(internship.applicationDeadline)}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <StatusBadge status={internship.status} />
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {["draft", "active"].includes(internship.status) && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEditModal(internship)}
                                                                    className="rounded-md border border-border px-3 py-1.5 font-ui text-xs font-semibold text-text-secondary transition hover:bg-surface-alt"
                                                                >
                                                                    Edit
                                                                </button>
                                                            )}

                                                            {internship.status === "draft" && (
                                                                <button
                                                                    type="button"
                                                                    disabled={actionLoading}
                                                                    onClick={() => submitDraft(internship)}
                                                                    className="rounded-md bg-primary px-3 py-1.5 font-ui text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                                                                >
                                                                    Submit
                                                                </button>
                                                            )}

                                                            {["active", "pending"].includes(internship.status) && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedInternship(internship);
                                                                        setShowWithdrawConfirm(true);
                                                                    }}
                                                                    className="rounded-md border border-red-500/20 px-3 py-1.5 font-ui text-xs font-semibold text-red-600 transition hover:bg-red-500/5"
                                                                >
                                                                    Withdraw
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Mobile cards */}
                            <div className="space-y-3 lg:hidden">
                                {filteredInternships.map((internship) => (
                                    <div
                                        key={internship._id}
                                        className="space-y-4 rounded-[var(--radius-lg)] border border-border bg-surface p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h3 className="font-ui text-sm font-bold text-text">
                                                    {internship.title}
                                                </h3>

                                                <p className="mt-1 font-ui text-[11px] text-text-muted">
                                                    {internship.category}
                                                </p>
                                            </div>

                                            <StatusBadge status={internship.status} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="font-ui text-[10px] font-bold uppercase tracking-wider text-text-muted">
                                                    Location
                                                </p>

                                                <p className="mt-1 font-ui text-xs text-text-secondary">
                                                    {formatLocation(internship)}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="font-ui text-[10px] font-bold uppercase tracking-wider text-text-muted">
                                                    Applicants
                                                </p>

                                                <p className="mt-1 font-ui text-xs text-text-secondary">
                                                    {internship.applicantCount || 0}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="font-ui text-[10px] font-bold uppercase tracking-wider text-text-muted">
                                                    Stipend
                                                </p>

                                                <p className="mt-1 font-ui text-xs text-text-secondary">
                                                    {formatStipend(internship.stipend)}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="font-ui text-[10px] font-bold uppercase tracking-wider text-text-muted">
                                                    Deadline
                                                </p>

                                                <p className="mt-1 font-ui text-xs text-text-secondary">
                                                    {formatDate(internship.applicationDeadline)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-3">
                                            {["draft", "active"].includes(internship.status) && (
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(internship)}
                                                    className="rounded-md border border-border px-3 py-2 font-ui text-xs font-semibold text-text-secondary hover:bg-surface-alt"
                                                >
                                                    Edit
                                                </button>
                                            )}

                                            {internship.status === "draft" && (
                                                <button
                                                    type="button"
                                                    disabled={actionLoading}
                                                    onClick={() => submitDraft(internship)}
                                                    className="rounded-md bg-primary px-3 py-2 font-ui text-xs font-semibold text-white disabled:opacity-50"
                                                >
                                                    Submit
                                                </button>
                                            )}

                                            {["active", "pending"].includes(internship.status) && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedInternship(internship);
                                                        setShowWithdrawConfirm(true);
                                                    }}
                                                    className="rounded-md border border-red-500/20 px-3 py-2 font-ui text-xs font-semibold text-red-600 hover:bg-red-500/5"
                                                >
                                                    Withdraw
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {!loading && pagination.total > 0 && (
                        <p className="text-right font-ui text-[11px] text-text-muted">
                            Showing {internships.length} of {pagination.total} listings
                        </p>
                    )}
                </section>
            </div>

            {/* Withdraw confirmation */}
            {showWithdrawConfirm && selectedInternship && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-xl sm:p-6">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 text-red-600">
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
                                    d="M12 9v4m0 4h.01M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z"
                                />
                            </svg>
                        </div>

                        <h3 className="font-display text-lg font-bold text-text">
                            Withdraw this internship?
                        </h3>

                        <p className="mt-2 font-ui text-xs leading-5 text-text-secondary">
                            You are about to withdraw{" "}
                            <strong>{selectedInternship.title}</strong>.
                            This listing will no longer accept applications.
                        </p>

                        <div className="mt-6 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => {
                                    setSelectedInternship(null);
                                    setShowWithdrawConfirm(false);
                                }}
                                className="rounded-lg border border-border px-4 py-2 font-ui text-xs font-semibold text-text-secondary hover:bg-surface-alt disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={actionLoading}
                                onClick={withdrawInternship}
                                className="rounded-lg bg-red-600 px-4 py-2 font-ui text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
                            >
                                {actionLoading ? "Withdrawing..." : "Confirm withdrawal"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create / Edit modal */}
            {showPostModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closePostModal();
                        }
                    }}
                >
                    <div className="absolute inset-0 bg-[#21131d]/55 backdrop-blur-md" />

                    <div className="relative flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/90 shadow-[0_30px_100px_rgba(30,10,25,0.35)] backdrop-blur-2xl dark:border-white/15 dark:bg-[#211923]/95 sm:rounded-3xl">
                        <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-rose-300/20 blur-3xl" />

                        {/* Modal header */}
                        <div className="relative flex items-center justify-between gap-4 border-b border-border/70 px-5 py-5 sm:px-8">
                            <div>
                                <div className="mb-1 flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-primary" />

                                    <span className="font-ui text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                                        Recruiter Workspace
                                    </span>
                                </div>

                                <h2 className="font-display text-xl font-bold text-text sm:text-2xl">
                                    {editingInternship
                                        ? "Edit Internship"
                                        : "Create an Internship"}
                                </h2>

                                <p className="mt-1 font-ui text-xs text-text-secondary">
                                    Provide accurate details about this opportunity.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closePostModal}
                                disabled={saving}
                                aria-label="Close form"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface/60 text-text-secondary transition-colors hover:bg-rose-soft hover:text-primary disabled:opacity-50"
                            >
                                ✕
                            </button>
                        </div>

                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                saveInternship(false);
                            }}
                            className="relative flex max-h-[calc(94vh-90px)] flex-col"
                        >
                            <div className="flex-1 space-y-7 overflow-y-auto px-5 py-6 sm:px-8">

                                {/* Basic information */}
                                <section className="space-y-4">
                                    <div>
                                        <h3 className="font-ui text-sm font-bold text-text">
                                            Basic Information
                                        </h3>

                                        <p className="mt-1 font-ui text-xs text-text-muted">
                                            Introduce the opportunity to potential candidates.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                            <FormField
                                                label="Internship Title"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleFormChange}
                                                placeholder="e.g. Frontend Developer Intern"
                                                required
                                            />
                                        </div>

                                        <FormField
                                            label="Category"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleFormChange}
                                            placeholder="e.g. Engineering"
                                            required
                                        />

                                        <FormField
                                            label="Work Mode"
                                            name="workMode"
                                            value={formData.workMode}
                                            onChange={handleFormChange}
                                            options={[
                                                { value: "remote", label: "Remote" },
                                                { value: "hybrid", label: "Hybrid" },
                                                { value: "onsite", label: "On-site" },
                                            ]}
                                        />
                                    </div>
                                </section>

                                <div className="h-px bg-border/70" />

                                {/* Location */}
                                <section className="space-y-4">
                                    <h3 className="font-ui text-sm font-bold text-text">
                                        Location
                                    </h3>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                        <FormField
                                            label="City"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleFormChange}
                                            placeholder="e.g. Bengaluru"
                                        />

                                        <FormField
                                            label="State"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleFormChange}
                                            placeholder="e.g. Karnataka"
                                        />

                                        <FormField
                                            label="Country"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleFormChange}
                                            placeholder="e.g. India"
                                        />
                                    </div>
                                </section>

                                <div className="h-px bg-border/70" />

                                {/* Compensation and duration */}
                                <section className="space-y-4">
                                    <h3 className="font-ui text-sm font-bold text-text">
                                        Compensation and Duration
                                    </h3>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        <FormField
                                            label="Stipend Amount (INR)"
                                            name="stipendAmount"
                                            value={formData.stipendAmount}
                                            onChange={handleFormChange}
                                            type="number"
                                            min="0"
                                            placeholder="15000"
                                        />

                                        <FormField
                                            label="Stipend Period"
                                            name="stipendPeriod"
                                            value={formData.stipendPeriod}
                                            onChange={handleFormChange}
                                            options={[
                                                { value: "hourly", label: "Hourly" },
                                                { value: "weekly", label: "Weekly" },
                                                { value: "monthly", label: "Monthly" },
                                                { value: "total", label: "Total" },
                                                { value: "unpaid", label: "Unpaid" },
                                                { value: "unspecified", label: "Not specified" },
                                            ]}
                                        />

                                        <FormField
                                            label="Duration Value"
                                            name="durationValue"
                                            value={formData.durationValue}
                                            onChange={handleFormChange}
                                            type="number"
                                            min="1"
                                            placeholder="3"
                                        />

                                        <FormField
                                            label="Duration Unit"
                                            name="durationUnit"
                                            value={formData.durationUnit}
                                            onChange={handleFormChange}
                                            options={[
                                                { value: "days", label: "Days" },
                                                { value: "weeks", label: "Weeks" },
                                                { value: "months", label: "Months" },
                                            ]}
                                        />

                                        <FormField
                                            label="Application Deadline"
                                            name="deadline"
                                            value={formData.deadline}
                                            onChange={handleFormChange}
                                            type="date"
                                            min={new Date().toISOString().slice(0, 10)}
                                        />
                                    </div>
                                </section>

                                <div className="h-px bg-border/70" />

                                {/* Description */}
                                <section className="space-y-4">
                                    <div>
                                        <h3 className="font-ui text-sm font-bold text-text">
                                            Role Description
                                        </h3>

                                        <p className="mt-1 font-ui text-xs text-text-muted">
                                            Explain the role, responsibilities and learning experience.
                                        </p>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="description"
                                            className="mb-1.5 block font-ui text-xs font-semibold text-text-secondary"
                                        >
                                            Internship Description *
                                        </label>

                                        <textarea
                                            id="description"
                                            required
                                            rows={5}
                                            name="description"
                                            value={formData.description}
                                            onChange={handleFormChange}
                                            placeholder="Describe the opportunity, team, responsibilities and learning experience..."
                                            className="w-full resize-y rounded-xl border border-border bg-white/60 px-3.5 py-3 text-sm text-text outline-none placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/10 dark:bg-white/5"
                                        />
                                    </div>
                                </section>

                                <div className="h-px bg-border/70" />

                                {/* Skills */}
                                <section className="space-y-4">
                                    <h3 className="font-ui text-sm font-bold text-text">
                                        Skills
                                    </h3>

                                    <div>
                                        <FormField
                                            label="Required Skills"
                                            name="requiredSkills"
                                            value={formData.requiredSkills}
                                            onChange={handleFormChange}
                                            placeholder="JavaScript, React, Node.js"
                                        />

                                        <p className="mt-1 font-ui text-[10px] text-text-muted">
                                            Separate skills with commas.
                                        </p>
                                    </div>

                                    <div>
                                        <FormField
                                            label="Preferred Skills"
                                            name="preferredSkills"
                                            value={formData.preferredSkills}
                                            onChange={handleFormChange}
                                            placeholder="Docker, AWS, Git"
                                        />

                                        <p className="mt-1 font-ui text-[10px] text-text-muted">
                                            Separate skills with commas.
                                        </p>
                                    </div>
                                </section>

                                <div className="h-px bg-border/70" />

                                {/* Eligibility */}
                                <section className="space-y-4">
                                    <h3 className="font-ui text-sm font-bold text-text">
                                        Eligibility
                                    </h3>

                                    <div>
                                        <FormField
                                            label="Eligible Degrees"
                                            name="degrees"
                                            value={formData.degrees}
                                            onChange={handleFormChange}
                                            placeholder="B.Tech, BCA, MCA"
                                        />

                                        <p className="mt-1 font-ui text-[10px] text-text-muted">
                                            Separate degrees with commas.
                                        </p>
                                    </div>

                                    <div>
                                        <FormField
                                            label="Graduation Years"
                                            name="graduationYears"
                                            value={formData.graduationYears}
                                            onChange={handleFormChange}
                                            placeholder="2026, 2027, 2028"
                                        />

                                        <p className="mt-1 font-ui text-[10px] text-text-muted">
                                            Separate years with commas.
                                        </p>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="otherRequirements"
                                            className="mb-1.5 block font-ui text-xs font-semibold text-text-secondary"
                                        >
                                            Other Requirements
                                        </label>

                                        <textarea
                                            id="otherRequirements"
                                            rows={3}
                                            name="otherRequirements"
                                            value={formData.otherRequirements}
                                            onChange={handleFormChange}
                                            placeholder="Mention any additional eligibility requirements..."
                                            className="w-full resize-y rounded-xl border border-border bg-white/60 px-3.5 py-3 text-sm text-text outline-none placeholder:text-text-muted focus:border-primary dark:bg-white/5"
                                        />
                                    </div>
                                </section>

                                <div className="h-px bg-border/70" />

                                {/* Application method */}
                                <section className="space-y-4">
                                    <h3 className="font-ui text-sm font-bold text-text">
                                        Application Method
                                    </h3>

                                    <FormField
                                        label="How should students apply?"
                                        name="applicationMethod"
                                        value={formData.applicationMethod}
                                        onChange={handleFormChange}
                                        options={[
                                            {
                                                value: "internal",
                                                label: "Apply through InternCheck",
                                            },
                                            {
                                                value: "external",
                                                label: "External application link",
                                            },
                                        ]}
                                    />

                                    {formData.applicationMethod === "external" && (
                                        <FormField
                                            label="Application URL"
                                            name="applicationUrl"
                                            value={formData.applicationUrl}
                                            onChange={handleFormChange}
                                            placeholder="https://example.com/apply"
                                            required
                                        />
                                    )}
                                </section>
                            </div>

                            {/* Footer */}
                            <div className="flex flex-col gap-3 border-t border-border/70 bg-surface/90 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                                <p className="font-ui text-[10px] text-text-muted">
                                    {editingInternship
                                        ? "Editing an active listing returns it to draft for reassessment."
                                        : "New internships are saved as drafts first."}
                                </p>

                                <div className="flex flex-wrap items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        disabled={saving}
                                        onClick={closePostModal}
                                        className="rounded-xl border border-border px-4 py-2.5 font-ui text-xs font-semibold text-text-secondary hover:bg-surface-alt disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="rounded-xl border border-primary/20 px-4 py-2.5 font-ui text-xs font-bold text-primary hover:bg-rose-soft disabled:opacity-50"
                                    >
                                        {saving ? "Saving..." : "Save Draft"}
                                    </button>

                                    <button
                                        type="button"
                                        disabled={saving}
                                        onClick={() => saveInternship(true)}
                                        className="rounded-xl bg-primary px-4 py-2.5 font-ui text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
                                    >
                                        {saving ? "Submitting..." : "Save & Submit"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
