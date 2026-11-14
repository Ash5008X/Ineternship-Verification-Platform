
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

const formatDate = (value) => {
  if (!value) return "Recently";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Recently";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatStipend = (stipend) => {
  if (!stipend || stipend.period === "unpaid") return "Unpaid";

  if (typeof stipend.amount !== "number") return "Not specified";

  return (
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: stipend.currency || "INR",
      maximumFractionDigits: 0,
    }).format(stipend.amount) +
    (stipend.period === "monthly"
      ? " / month"
      : stipend.period === "weekly"
        ? " / week"
        : stipend.period === "hourly"
          ? " / hour"
          : "")
  );
};

const getCompanyName = (internship) =>
  internship?.company?.name ||
  internship?.companyId?.name ||
  "Company";

const getLocation = (internship) => {
  const location = internship?.location;

  if (!location) return "Location not specified";
  if (typeof location === "string") return location;

  return (
    [
      location.city,
      location.state,
      location.country,
    ]
      .filter(Boolean)
      .join(", ") || "Location not specified"
  );
};

const statusStyles = {
  applied: "bg-amber-50 text-amber-700",
  interviewing: "bg-violet-50 text-violet-700",
  offered: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  withdrawn: "bg-gray-100 text-gray-600",
  saved: "bg-rose-soft text-primary",
};

function StatCard({ label, value, description, href }) {
  return (
    <Link
      href={href}
      className="min-w-0 rounded-2xl border border-border bg-surface p-4 transition hover:border-primary/40 hover:shadow-sm sm:p-5"
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted sm:text-xs">
        {label}
      </p>

      <p className="mt-3 font-display text-2xl font-bold text-text sm:text-3xl">
        {value}
      </p>

      <p className="mt-1 text-[11px] leading-5 text-text-secondary sm:text-xs">
        {description}
      </p>
    </Link>
  );
}

function InternshipCard({ internship, onApply, applyingId }) {
  const company = getCompanyName(internship);
  const isApplying = applyingId === internship._id;

  return (
    <article className="rounded-2xl border border-border bg-surface p-5 transition hover:border-primary/40 hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-soft text-lg font-bold text-primary">
          {company.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-bold text-text">
            {internship.title}
          </h3>

          <p className="mt-1 text-sm text-text-secondary">
            {company}
          </p>

          <p className="mt-1 text-xs text-text-muted">
            {getLocation(internship)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {internship.category && (
          <span className="rounded-full bg-surface-alt px-3 py-1 text-xs text-text-secondary">
            {internship.category}
          </span>
        )}

        {internship.workMode && (
          <span className="rounded-full bg-surface-alt px-3 py-1 text-xs capitalize text-text-secondary">
            {internship.workMode}
          </span>
        )}

        {internship.applicationMethod && (
          <span className="rounded-full bg-rose-soft px-3 py-1 text-xs capitalize text-primary">
            {internship.applicationMethod === "internal"
              ? "Easy Apply"
              : "External Apply"}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div>
          <p className="text-sm font-bold text-text">
            {formatStipend(internship.stipend)}
          </p>

          <p className="mt-1 text-xs text-text-muted">
            Posted {formatDate(internship.createdAt)}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/internships?id=${internship._id}`}
            className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-text transition hover:bg-surface-alt"
          >
            Details
          </Link>

          <button
            type="button"
            onClick={() => onApply(internship)}
            disabled={isApplying}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isApplying ? "Processing..." : "Apply"}
          </button>
        </div>
      </div>
    </article>
  );
}

function ApplicationCard({ application }) {
  const internship = application.internshipId;
  const company = getCompanyName(internship);
  const status = application.status || "applied";

  return (
    <Link
      href="/applications"
      className="flex items-center gap-3 rounded-xl border border-border p-4 transition hover:border-primary/40 hover:bg-background"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-soft font-bold text-primary">
        {company.charAt(0).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text">
          {internship?.title || "Internship application"}
        </p>

        <p className="mt-1 text-xs text-text-muted">
          {company}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${
            statusStyles[status] ||
            "bg-surface-alt text-text-secondary"
          }`}
        >
          {status}
        </span>

        <span className="text-[10px] text-text-muted">
          {formatDate(application.appliedAt || application.createdAt)}
        </span>
      </div>
    </Link>
  );
}

function EmptyState({ title, description, href, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface px-5 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-soft text-xl text-primary">
        ✦
      </div>

      <h3 className="mt-4 font-display text-base font-bold text-text">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-muted">
        {description}
      </p>

      <Link
        href={href}
        className="mt-5 inline-flex rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90"
      >
        {action}
      </Link>
    </div>
  );
}

export default function StudentDashboardPage() {
  const [student, setStudent] = useState(null);
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyingId, setApplyingId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");

  const fetchDashboard = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    try {
      const endpoints = [
        "/api/auth/me",
        "/api/internships?page=1&limit=6&sort=newest",
        "/api/applications",
        "/api/bookmarks",
        "/api/notifications",
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
          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(
              result.message || "Unable to load dashboard information."
            );
          }

          return result;
        })
      );

      if (signal.aborted) return;

      const [
        authResult,
        internshipResult,
        applicationResult,
        bookmarkResult,
        notificationResult,
      ] = results;

      if (!authResult.user || authResult.user.role !== "student") {
        throw new Error(
          "A student account is required to access this page."
        );
      }

      setStudent(authResult.user);
      setInternships(internshipResult.data || []);
      setApplications(applicationResult.data || []);
      setBookmarks(bookmarkResult.data || []);
      setNotifications(notificationResult.data || []);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(
          err.message || "Unable to load your dashboard."
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

  const applicationStats = useMemo(
    () => ({
      total: applications.length,
      active: applications.filter((item) =>
        ["applied", "interviewing"].includes(item.status)
      ).length,
      offered: applications.filter(
        (item) => item.status === "offered"
      ).length,
      saved: bookmarks.length,
    }),
    [applications, bookmarks]
  );

  const recentApplications = useMemo(
    () => applications.slice(0, 4),
    [applications]
  );

  const unreadNotifications = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  async function handleApply(internship) {
    if (!internship?._id || applyingId) return;

    const alreadyApplied = applications.some((application) => {
      const existingId =
        application.internshipId?._id ||
        application.internshipId;

      return String(existingId) === String(internship._id);
    });

    if (alreadyApplied) {
      setActionMessage(
        "You have already recorded an application for this internship."
      );
      return;
    }

    if (internship.applicationMethod === "external") {
      if (!internship.applicationUrl) {
        setActionMessage(
          "This internship does not have a valid application link."
        );
        return;
      }

      window.open(
        internship.applicationUrl,
        "_blank",
        "noopener,noreferrer"
      );

      const confirmed = window.confirm(
        "After submitting your application on the company website, select OK to record it in InternCheck."
      );

      if (!confirmed) return;
    }

    setApplyingId(internship._id);
    setActionMessage("");

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          internshipId: internship._id,
          confirmExternal:
            internship.applicationMethod === "external",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to submit application."
        );
      }

      setApplications((previous) => [
        result.data,
        ...previous,
      ]);

      setActionMessage(
        "Your application has been recorded successfully."
      );
    } catch (err) {
      setActionMessage(
        err.message || "Unable to submit application."
      );
    } finally {
      setApplyingId(null);
    }
  }

  async function retry() {
    const controller = new AbortController();
    await fetchDashboard(controller.signal);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-[1500px]">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 rounded-lg bg-surface-alt" />
            <div className="h-4 w-96 max-w-full rounded bg-surface-alt" />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-32 rounded-2xl border border-border bg-surface"
                />
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="h-96 rounded-2xl border border-border bg-surface xl:col-span-2" />
              <div className="h-96 rounded-2xl border border-border bg-surface" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-surface p-8 text-center">
          <h1 className="font-display text-xl font-bold text-text">
            Unable to load your dashboard
          </h1>

          <p className="mt-3 text-sm leading-6 text-text-secondary">
            {error}
          </p>

          <button
            type="button"
            onClick={retry}
            className="mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  const firstName =
    student?.name?.trim()?.split(/\s+/)[0] || "Student";

  return (
    <main className="min-h-screen w-full bg-background px-4 py-6 font-ui text-text sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-7">
        <section className="flex flex-col justify-between gap-5 rounded-3xl border border-border bg-surface p-6 sm:p-8 lg:flex-row lg:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Student Workspace
              </span>
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
              Welcome back, {firstName}.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
              Explore verified internship opportunities, keep track of your
              applications and build your professional profile.
            </p>

            {student?.profile?.college && (
              <p className="mt-2 text-xs text-text-muted">
                {student.profile.college}
                {student.profile.degree
                  ? ` · ${student.profile.degree}`
                  : ""}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/internships"
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Explore internships
            </Link>

            <Link
              href="/profile"
              className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-text transition hover:bg-background"
            >
              Complete profile
            </Link>
          </div>
        </section>

        {actionMessage && (
          <div className="flex items-start justify-between gap-4 rounded-xl border border-primary/20 bg-rose-soft/50 px-4 py-3 text-sm text-text">
            <p>{actionMessage}</p>

            <button
              type="button"
              onClick={() => setActionMessage("")}
              className="font-bold text-primary"
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        {/* Dashboard statistics: 2 columns on mobile */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <StatCard
            label="Applications"
            value={applicationStats.total}
            description="Applications recorded"
            href="/applications"
          />

          <StatCard
            label="In progress"
            value={applicationStats.active}
            description="Applied or interviewing"
            href="/applications"
          />

          <StatCard
            label="Offers"
            value={applicationStats.offered}
            description="Offers received"
            href="/applications"
          />

          <StatCard
            label="Bookmarks"
            value={applicationStats.saved}
            description="Saved opportunities"
            href="/bookmarks"
          />
        </section>

        <section className="grid grid-cols-1 items-start gap-7 xl:grid-cols-3">
          <div className="space-y-5 xl:col-span-2">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold text-text">
                  Latest opportunities
                </h2>

                <p className="mt-1 text-sm text-text-secondary">
                  Recently published active internships.
                </p>
              </div>

              <Link
                href="/internships"
                className="text-xs font-bold text-primary hover:underline"
              >
                View all internships →
              </Link>
            </div>

            {internships.length === 0 ? (
              <EmptyState
                title="No active internships available"
                description="There are no active opportunities to display right now. Check back later for new listings."
                href="/internships"
                action="Browse internships"
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {internships.slice(0, 6).map((internship) => (
                  <InternshipCard
                    key={internship._id}
                    internship={internship}
                    onApply={handleApply}
                    applyingId={applyingId}
                  />
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-7">
            <section className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-text">
                    Recent applications
                  </h2>

                  <p className="mt-1 text-xs text-text-muted">
                    Your latest application activity.
                  </p>
                </div>

                <Link
                  href="/applications"
                  className="text-xs font-bold text-primary hover:underline"
                >
                  View all
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {recentApplications.length > 0 ? (
                  recentApplications.map((application) => (
                    <ApplicationCard
                      key={application._id}
                      application={application}
                    />
                  ))
                ) : (
                  <div className="rounded-xl bg-background p-5 text-center">
                    <p className="text-sm font-semibold text-text">
                      No applications yet
                    </p>

                    <p className="mt-2 text-xs leading-5 text-text-muted">
                      Applications you record will appear here.
                    </p>

                    <Link
                      href="/internships"
                      className="mt-3 inline-block text-xs font-bold text-primary hover:underline"
                    >
                      Find internships →
                    </Link>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-text">
                    Notifications
                  </h2>

                  <p className="mt-1 text-xs text-text-muted">
                    Your latest account updates.
                  </p>
                </div>

                {unreadNotifications > 0 && (
                  <span className="rounded-full bg-rose-soft px-2.5 py-1 text-xs font-bold text-primary">
                    {unreadNotifications} unread
                  </span>
                )}
              </div>

              {notifications.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {notifications.slice(0, 4).map((notification) => (
                    <div
                      key={notification._id}
                      className="border-b border-border pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start gap-2">
                        {!notification.isRead && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-text">
                            {notification.title || "Account update"}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-text-secondary">
                            {notification.message ||
                              "You have a new notification."}
                          </p>

                          <p className="mt-1 text-[10px] text-text-muted">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Link
                    href="/settings"
                    className="inline-block pt-1 text-xs font-bold text-primary hover:underline"
                  >
                    Manage notification preferences →
                  </Link>
                </div>
              ) : (
                <p className="mt-4 rounded-xl bg-background p-4 text-center text-xs text-text-muted">
                  You have no notifications yet.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-primary/10 bg-rose-soft/40 p-5">
              <h2 className="font-display text-lg font-bold text-text">
                Build your profile
              </h2>

              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Keep your education, skills and professional information
                updated so recruiters can understand your background.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/profile"
                  className="rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white hover:opacity-90"
                >
                  Update profile
                </Link>

                <Link
                  href="/experiences"
                  className="rounded-xl border border-primary/20 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-white/50"
                >
                  Student experiences
                </Link>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
