
"use client";

import { useCallback, useEffect, useState } from "react";

const EMPTY_PROFILE = {
    recruiter: {
        name: "",
        email: "",
        jobTitle: "",
        avatarUrl: null,
    },
    company: {
        name: "",
        website: "",
        description: "",
        industry: "",
        contactEmail: "",
        headquarters: {
            city: "",
            state: "",
            country: "",
        },
        identityStatus: "unverified",
    },
};

const INDUSTRIES = [
    "Information Technology",
    "Software Development",
    "Education",
    "Healthcare",
    "Finance",
    "Marketing",
    "Manufacturing",
    "E-commerce",
    "Other",
];

function ProfileSection({ title, description, children }) {
    return (
        <section className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface">
            <div className="border-b border-border px-5 py-5 sm:px-6">
                <h2 className="font-display text-lg font-bold text-text">
                    {title}
                </h2>
                <p className="mt-1 font-ui text-xs text-text-muted">
                    {description}
                </p>
            </div>

            <div className="p-5 sm:p-6">
                {children}
            </div>
        </section>
    );
}

function Field({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    disabled = false,
    required = false,
}) {
    return (
        <label className="block space-y-2">
            <span className="font-ui text-xs font-semibold text-text-secondary">
                {label}
                {required && <span className="ml-1 text-primary">*</span>}
            </span>

            <input
                type={type}
                value={value ?? ""}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-text transition-all placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-70"
            />
        </label>
    );
}

function Avatar({ name, imageUrl }) {
    const initials = (name || "Recruiter")
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt="Recruiter profile"
                className="h-16 w-16 rounded-full border border-border object-cover"
            />
        );
    }

    return (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-soft font-display text-xl font-bold text-primary">
            {initials}
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        verified: "bg-success/10 text-success border-success/20",
        pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        rejected: "bg-red-500/10 text-red-600 border-red-500/20",
        unverified: "bg-surface-alt text-text-muted border-border",
    };

    const labels = {
        verified: "Verified",
        pending: "Verification Pending",
        rejected: "Verification Rejected",
        unverified: "Not Verified",
    };

    return (
        <span
            className={`inline-flex rounded-full border px-3 py-1.5 font-ui text-[11px] font-bold ${
                styles[status] || styles.unverified
            }`}
        >
            {labels[status] || "Not Verified"}
        </span>
    );
}

export default function RecruiterProfilePage() {
    const [profile, setProfile] = useState(EMPTY_PROFILE);
    const [originalProfile, setOriginalProfile] = useState(EMPTY_PROFILE);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/recruiter/profile", {
                method: "GET",
                cache: "no-store",
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Unable to load your profile.");
            }

            const data = {
                recruiter: {
                    ...EMPTY_PROFILE.recruiter,
                    ...result.data.recruiter,
                },
                company: {
                    ...EMPTY_PROFILE.company,
                    ...result.data.company,
                    headquarters: {
                        ...EMPTY_PROFILE.company.headquarters,
                        ...result.data.company?.headquarters,
                    },
                },
            };

            setProfile(data);
            setOriginalProfile(data);
        } catch (err) {
            setError(err.message || "Something went wrong while loading your profile.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    function updateRecruiter(key, value) {
        setProfile((previous) => ({
            ...previous,
            recruiter: {
                ...previous.recruiter,
                [key]: value,
            },
        }));

        setSuccess("");
    }

    function updateCompany(key, value) {
        setProfile((previous) => ({
            ...previous,
            company: {
                ...previous.company,
                [key]: value,
            },
        }));

        setSuccess("");
    }

    function updateHeadquarters(key, value) {
        setProfile((previous) => ({
            ...previous,
            company: {
                ...previous.company,
                headquarters: {
                    ...previous.company.headquarters,
                    [key]: value,
                },
            },
        }));

        setSuccess("");
    }

    function cancelEditing() {
        setProfile(originalProfile);
        setEditing(false);
        setError("");
        setSuccess("");
    }

    async function saveProfile(event) {
        event.preventDefault();

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch("/api/recruiter/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(profile),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Unable to save profile changes.");
            }

            const updated = {
                recruiter: {
                    ...EMPTY_PROFILE.recruiter,
                    ...result.data.recruiter,
                },
                company: {
                    ...EMPTY_PROFILE.company,
                    ...result.data.company,
                    headquarters: {
                        ...EMPTY_PROFILE.company.headquarters,
                        ...result.data.company?.headquarters,
                    },
                },
            };

            setProfile(updated);
            setOriginalProfile(updated);
            setEditing(false);
            setSuccess("Your profile changes have been saved.");
        } catch (err) {
            setError(err.message || "Something went wrong while saving your profile.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-[70vh] bg-background px-4 py-12">
                <div className="mx-auto max-w-[1100px] space-y-6">
                    <div className="h-8 w-56 animate-pulse rounded-lg bg-surface-alt" />
                    <div className="h-48 animate-pulse rounded-2xl border border-border bg-surface" />
                    <div className="h-72 animate-pulse rounded-2xl border border-border bg-surface" />
                </div>
            </div>
        );
    }

    if (error && !profile.recruiter.email) {
        return (
            <div className="min-h-[70vh] bg-background px-4 py-12">
                <div className="mx-auto max-w-[700px] rounded-2xl border border-border bg-surface p-6 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-soft text-primary">
                        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13.1a2 2 0 0 0-3.4 0Z" />
                        </svg>
                    </div>

                    <h2 className="font-display text-xl font-bold text-text">
                        Unable to load profile
                    </h2>

                    <p className="mt-2 text-sm text-text-secondary">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={fetchProfile}
                        className="mt-5 rounded-xl bg-primary px-5 py-3 font-ui text-xs font-bold text-white hover:opacity-90"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-[1100px] space-y-7 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <section>
                    <div className="mb-1 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        <span className="font-ui text-xs font-bold uppercase tracking-wider text-text-muted">
                            Recruiter Workspace
                        </span>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="font-display text-2xl tracking-tight text-text sm:text-3xl">
                                Company Profile
                            </h1>
                            <p className="mt-1 font-ui text-sm text-text-secondary">
                                Manage your recruiter account and company information.
                            </p>
                        </div>

                        {!editing ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditing(true);
                                    setSuccess("");
                                    setError("");
                                }}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-ui text-xs font-bold text-white transition-opacity hover:opacity-90"
                            >
                                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16 4 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" />
                                </svg>
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={cancelEditing}
                                    disabled={saving}
                                    className="rounded-xl border border-border px-4 py-2.5 font-ui text-xs font-bold text-text-secondary hover:bg-surface-alt disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    form="recruiter-profile-form"
                                    disabled={saving}
                                    className="rounded-xl bg-primary px-5 py-2.5 font-ui text-xs font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {error && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="flex items-center gap-2 rounded-xl border border-success/20 bg-success/5 px-4 py-3 text-xs font-semibold text-success">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />
                        </svg>
                        {success}
                    </div>
                )}

                <form id="recruiter-profile-form" onSubmit={saveProfile} className="space-y-7">
                    <ProfileSection
                        title="Company Identity"
                        description="Your organization's public identity on InternCheck."
                    >
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/10 bg-rose-soft font-display text-2xl font-bold text-primary">
                                {(profile.company.name || "C").slice(0, 1).toUpperCase()}
                            </div>

                            <div className="min-w-0 flex-1">
                                <h3 className="font-display text-lg font-bold text-text">
                                    {profile.company.name || "Your Company"}
                                </h3>
                                <p className="mt-1 text-xs text-text-muted">
                                    Company identity and verification status
                                </p>
                                <div className="mt-3">
                                    <StatusBadge status={profile.company.identityStatus} />
                                </div>
                            </div>
                        </div>
                    </ProfileSection>

                    <ProfileSection
                        title="Recruiter Information"
                        description="Your personal details and professional contact information."
                    >
                        <div className="mb-5 flex items-center gap-4 border-b border-border pb-5">
                            <Avatar
                                name={profile.recruiter.name}
                                imageUrl={profile.recruiter.avatarUrl}
                            />

                            <div>
                                <h3 className="font-ui text-sm font-bold text-text">
                                    {profile.recruiter.name}
                                </h3>
                                <p className="mt-1 text-xs text-text-muted">
                                    {profile.recruiter.jobTitle || "Recruiter"}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <Field
                                label="Full Name"
                                value={profile.recruiter.name}
                                onChange={(event) => updateRecruiter("name", event.target.value)}
                                disabled={!editing}
                                required
                            />

                            <Field
                                label="Email Address"
                                value={profile.recruiter.email}
                                type="email"
                                disabled
                            />

                            <Field
                                label="Job Title"
                                value={profile.recruiter.jobTitle}
                                onChange={(event) => updateRecruiter("jobTitle", event.target.value)}
                                disabled={!editing}
                                required
                            />
                        </div>

                        <p className="mt-4 text-xs text-text-muted">
                            Your login email is read-only. Email changes are not supported by the current account API.
                        </p>
                    </ProfileSection>

                    <ProfileSection
                        title="Company Information"
                        description="Information displayed to students viewing your internship listings."
                    >
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <Field
                                label="Company Name"
                                value={profile.company.name}
                                onChange={(event) => updateCompany("name", event.target.value)}
                                disabled={!editing}
                                required
                            />

                            <Field
                                label="Company Website"
                                type="url"
                                value={profile.company.website}
                                onChange={(event) => updateCompany("website", event.target.value)}
                                disabled={!editing}
                                placeholder="https://example.com"
                            />

                            <label className="block space-y-2">
                                <span className="font-ui text-xs font-semibold text-text-secondary">
                                    Industry
                                </span>
                                <select
                                    value={profile.company.industry}
                                    onChange={(event) => updateCompany("industry", event.target.value)}
                                    disabled={!editing}
                                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    <option value="">Select industry</option>
                                    {INDUSTRIES.map((industry) => (
                                        <option key={industry} value={industry}>
                                            {industry}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <Field
                                label="Careers Contact Email"
                                type="email"
                                value={profile.company.contactEmail}
                                onChange={(event) => updateCompany("contactEmail", event.target.value)}
                                disabled={!editing}
                                placeholder="careers@example.com"
                            />
                        </div>

                        <div className="mt-5">
                            <label className="block space-y-2">
                                <span className="font-ui text-xs font-semibold text-text-secondary">
                                    Company Description
                                </span>
                                <textarea
                                    value={profile.company.description}
                                    onChange={(event) => updateCompany("description", event.target.value)}
                                    disabled={!editing}
                                    rows={5}
                                    maxLength={5000}
                                    placeholder="Describe your company, its mission and what it does..."
                                    className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-70"
                                />
                                <span className="block text-right text-[11px] text-text-muted">
                                    {profile.company.description.length}/5000
                                </span>
                            </label>
                        </div>
                    </ProfileSection>

                    <ProfileSection
                        title="Company Headquarters"
                        description="The registered or primary location of your organization."
                    >
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                            <Field
                                label="City"
                                value={profile.company.headquarters.city}
                                onChange={(event) => updateHeadquarters("city", event.target.value)}
                                disabled={!editing}
                                placeholder="e.g. New Delhi"
                            />

                            <Field
                                label="State"
                                value={profile.company.headquarters.state}
                                onChange={(event) => updateHeadquarters("state", event.target.value)}
                                disabled={!editing}
                                placeholder="e.g. Delhi"
                            />

                            <Field
                                label="Country"
                                value={profile.company.headquarters.country}
                                onChange={(event) => updateHeadquarters("country", event.target.value)}
                                disabled={!editing}
                                placeholder="e.g. India"
                            />
                        </div>
                    </ProfileSection>

                    {editing && (
                        <div className="flex justify-end gap-3 pb-6">
                            <button
                                type="button"
                                onClick={cancelEditing}
                                disabled={saving}
                                className="rounded-xl border border-border px-5 py-3 font-ui text-xs font-bold text-text-secondary hover:bg-surface-alt disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-xl bg-primary px-6 py-3 font-ui text-xs font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? "Saving..." : "Save Profile"}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
