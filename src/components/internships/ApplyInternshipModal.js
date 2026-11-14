
"use client";

import { useEffect, useState } from "react";

export default function ApplyInternshipModal({
    internship,
    onClose,
    onSuccess,
}) {
    const [cvs, setCvs] = useState([]);
    const [selectedCV, setSelectedCV] = useState("");
    const [notes, setNotes] = useState("");
    const [confirmExternal, setConfirmExternal] = useState(false);

    const [loadingCVs, setLoadingCVs] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const isExternal =
        internship?.applicationType === "External Apply";

    useEffect(() => {
        let active = true;

        async function fetchCVs() {
            try {
                const response = await fetch("/api/cv", {
                    credentials: "include",
                    cache: "no-store",
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message || "Unable to load your CVs."
                    );
                }

                if (!active) return;

                const availableCVs = result.data || [];

                setCvs(availableCVs);

                const defaultCV = availableCVs.find(
                    (cv) => cv.isDefault
                );

                setSelectedCV(
                    defaultCV?._id || availableCVs[0]?._id || ""
                );
            } catch (err) {
                if (active) {
                    setError(err.message);
                }
            } finally {
                if (active) {
                    setLoadingCVs(false);
                }
            }
        }

        fetchCVs();

        return () => {
            active = false;
        };
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();

        if (!internship?.id) {
            setError("Invalid internship.");
            return;
        }

        if (isExternal && !confirmExternal) {
            setError(
                "Please confirm that you have submitted the application on the company website."
            );
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const response = await fetch("/api/applications", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    internshipId: internship.id,
                    cvId: selectedCV || null,
                    notes: notes.trim(),
                    confirmExternal: isExternal
                        ? confirmExternal
                        : false,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to submit application."
                );
            }

            onSuccess?.(result);

            if (isExternal && internship.applicationUrl) {
                window.open(
                    internship.applicationUrl,
                    "_blank",
                    "noopener,noreferrer"
                );
            }

            onClose();
        } catch (err) {
            setError(
                err.message || "Something went wrong."
            );
        } finally {
            setSubmitting(false);
        }
    }

    if (!internship) return null;

    return (
        <div
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !submitting) {
                    onClose();
                }
            }}
        >
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-surface border border-border rounded-2xl shadow-2xl">

                <div className="px-5 sm:px-6 py-5 border-b border-border flex items-start justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-primary font-ui">
                            Student Portal
                        </p>

                        <h2 className="font-display text-xl font-bold text-text mt-1">
                            {isExternal
                                ? "Record Your Application"
                                : "Apply for Internship"}
                        </h2>

                        <p className="font-ui text-xs text-text-muted mt-1">
                            {internship.role}
                        </p>
                    </div>

                    <button
                        type="button"
                        disabled={submitting}
                        onClick={onClose}
                        className="w-9 h-9 rounded-lg border border-border text-text-muted hover:bg-surface-alt disabled:opacity-50"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-5 sm:p-6 space-y-5">

                        <div className="rounded-xl bg-rose-soft/50 border border-primary/10 p-4">
                            <p className="font-ui text-sm font-bold text-text">
                                {internship.role}
                            </p>

                            <p className="font-ui text-xs text-text-secondary mt-1">
                                {internship.company}
                            </p>

                            <p className="font-ui text-[11px] text-text-muted mt-2">
                                {internship.location}
                            </p>
                        </div>

                        <section>
                            <label className="block font-ui text-xs font-bold text-text-secondary mb-2">
                                Select CV
                            </label>

                            {loadingCVs ? (
                                <div className="rounded-xl border border-border p-4 text-xs text-text-muted">
                                    Loading your saved CVs...
                                </div>
                            ) : cvs.length > 0 ? (
                                <div className="space-y-2">
                                    {cvs.map((cv) => (
                                        <label
                                            key={cv._id}
                                            className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                                                selectedCV === cv._id
                                                    ? "border-primary bg-rose-soft/40"
                                                    : "border-border hover:bg-surface-alt"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="cv"
                                                value={cv._id}
                                                checked={selectedCV === cv._id}
                                                onChange={() =>
                                                    setSelectedCV(cv._id)
                                                }
                                                className="accent-[var(--color-primary)]"
                                            />

                                            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={1.8}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M7 3h7l5 5v13H7a2 2 0 01-2-2V5a2 2 0 012-2z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M14 3v5h5M9 13h6m-6 4h6"
                                                    />
                                                </svg>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="font-ui text-xs font-semibold text-text truncate">
                                                    {cv.originalName}
                                                </p>

                                                <p className="font-ui text-[10px] text-text-muted mt-1">
                                                    Version {cv.version}
                                                    {cv.isDefault
                                                        ? " · Default CV"
                                                        : ""}
                                                </p>
                                            </div>
                                        </label>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() => setSelectedCV("")}
                                        className={`text-xs font-ui font-semibold ${
                                            selectedCV
                                                ? "text-text-muted"
                                                : "text-primary"
                                        }`}
                                    >
                                        {selectedCV
                                            ? "Apply without a CV"
                                            : "No CV selected"}
                                    </button>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-border p-4">
                                    <p className="font-ui text-xs font-semibold text-text">
                                        No saved CV found
                                    </p>

                                    <p className="font-ui text-[11px] text-text-muted mt-1">
                                        You can still submit an application without a CV.
                                    </p>
                                </div>
                            )}
                        </section>

                        <section>
                            <label
                                htmlFor="application-notes"
                                className="block font-ui text-xs font-bold text-text-secondary mb-2"
                            >
                                Additional Note
                                <span className="font-normal text-text-muted">
                                    {" "}(Optional)
                                </span>
                            </label>

                            <textarea
                                id="application-notes"
                                rows={4}
                                maxLength={3000}
                                value={notes}
                                onChange={(event) =>
                                    setNotes(event.target.value)
                                }
                                placeholder="Add a short introduction or relevant information..."
                                className="w-full resize-y px-3.5 py-3 rounded-xl bg-background border border-border text-sm text-text placeholder:text-text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                            />

                            <p className="text-right font-ui text-[10px] text-text-muted mt-1">
                                {notes.length}/3000
                            </p>
                        </section>

                        {isExternal && (
                            <label className="flex items-start gap-3 rounded-xl border border-warning/20 bg-warning/5 p-4 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={confirmExternal}
                                    onChange={(event) =>
                                        setConfirmExternal(event.target.checked)
                                    }
                                    className="mt-0.5 accent-[var(--color-primary)]"
                                />

                                <span className="font-ui text-xs text-text-secondary leading-5">
                                    I understand that this internship uses an external application website. I confirm that I have submitted my application there and want to record it on InternCheck.
                                </span>
                            </label>
                        )}

                        {error && (
                            <div className="rounded-lg border border-danger/20 bg-danger/5 p-3">
                                <p className="font-ui text-xs text-danger">
                                    {error}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="px-5 sm:px-6 py-4 border-t border-border flex items-center justify-end gap-2">
                        <button
                            type="button"
                            disabled={submitting}
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl border border-border text-text-secondary font-ui text-xs font-semibold hover:bg-surface-alt disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                submitting ||
                                loadingCVs ||
                                (isExternal && !confirmExternal)
                            }
                            className="px-4 py-2.5 rounded-xl bg-primary text-white font-ui text-xs font-bold hover:opacity-90 disabled:opacity-50"
                        >
                            {submitting
                                ? "Submitting..."
                                : isExternal
                                    ? "Record Application"
                                    : "Submit Application"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
