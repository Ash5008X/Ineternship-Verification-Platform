
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Avatar from "../../ui/Avatar";
import IconButton from "../../ui/IconButton";

export default function RecruiterNavbar({
  recruiter,
  onToggleMobileSidebar,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [theme, setTheme] = useState("light");
  const [themeReady, setThemeReady] = useState(false);

  const menuRef = useRef(null);
  const notificationRef = useRef(null);

  const recruiterName =
    [recruiter?.firstName, recruiter?.lastName].filter(Boolean).join(" ") ||
    recruiter?.fullName ||
    recruiter?.name ||
    "Recruiter";

  const recruiterInitial =
    recruiterName.trim().charAt(0).toUpperCase() || "R";

  useEffect(() => {
    const savedTheme = localStorage.getItem("interncheck-theme");
    const initialTheme = savedTheme === "dark" ? "dark" : "light";

    setTheme(initialTheme);
    document.documentElement.classList.toggle(
      "dark",
      initialTheme === "dark"
    );
    setThemeReady(true);
  }, []);

  useEffect(() => {
    let active = true;

    async function fetchNotifications() {
      try {
        const response = await fetch("/api/notifications", {
          credentials: "include",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to fetch notifications.");
        }

        if (active) {
          setNotifications(result.data || []);
          setUnreadCount(result.unreadCount || 0);
        }
      } catch (error) {
        console.error("Notification fetch error:", error);
      } finally {
        if (active) setNotificationsLoading(false);
      }
    }

    fetchNotifications();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setNotificationOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleMarkAllAsRead() {
    if (markingRead || unreadCount === 0) return;

    setMarkingRead(true);

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update notifications.");
      }

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: new Date().toISOString(),
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Mark notifications as read error:", error);
    } finally {
      setMarkingRead(false);
    }
  }

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";

    setTheme(nextTheme);
    localStorage.setItem("interncheck-theme", nextTheme);

    document.documentElement.classList.toggle(
      "dark",
      nextTheme === "dark"
    );
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setLogoutError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to log out.");
      }

      window.location.assign("/login");
    } catch (error) {
      setLogoutError(error.message || "Logout failed.");
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Left: Mobile menu and brand */}
        <div className="flex items-center gap-3">
          <IconButton
            size="md"
            variant="ghost"
            className="md:hidden text-text-secondary"
            ariaLabel="Toggle navigation sidebar"
            onClick={onToggleMobileSidebar}
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
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </IconButton>

          <Link
            href="/recruiter/dashboard"
            className="flex items-center gap-2.5 select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold shadow-xs">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                />
              </svg>
            </div>

            <div className="flex flex-col">
              <span className="font-ui font-extrabold text-base tracking-tight text-text leading-none">
                Intern<span className="text-primary">Check</span>
              </span>
              <span className="font-ui text-[10px] text-text-muted tracking-wider uppercase hidden sm:block mt-0.5">
                Verified Internships
              </span>
            </div>
          </Link>
        </div>

        <div className="hidden md:block" />

        {/* Right: Notifications and account */}
        <div className="flex items-center gap-3">
          <div className="relative" ref={notificationRef}>
            <div className="relative">
              <IconButton
                size="md"
                variant="secondary"
                ariaLabel="Notifications"
                title="Notifications"
                onClick={() => {
                  setNotificationOpen((previous) => !previous);
                  setMenuOpen(false);
                }}
              >
                <svg
                  className="w-4 h-4 text-text-secondary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                  />
                </svg>
              </IconButton>

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary ring-2 ring-surface" />
              )}
            </div>

            {notificationOpen && (
              <div className="absolute right-0 top-full mt-3 w-[min(360px,calc(100vw-2rem))] rounded-xl border border-border bg-surface shadow-xl overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div>
                    <h3 className="text-sm font-semibold text-text">
                      Notifications
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      {unreadCount > 0
                        ? `${unreadCount} unread notifications`
                        : "You're all caught up"}
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      disabled={markingRead}
                      className="text-xs font-semibold text-primary hover:opacity-75 disabled:opacity-50"
                    >
                      {markingRead ? "Updating..." : "Mark all as read"}
                    </button>
                  )}
                </div>

                <div className="max-h-[380px] overflow-y-auto">
                  {notificationsLoading ? (
                    <div className="px-4 py-10 text-center text-sm text-text-muted">
                      Loading notifications...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-12 text-center">
                      <p className="text-sm font-medium text-text">
                        No notifications yet
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        We'll let you know when something happens.
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`flex gap-3 px-4 py-3 border-b border-border last:border-0 transition-colors ${
                          !notification.isRead
                            ? "bg-primary/5"
                            : "hover:bg-surface-alt"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-text">
                              {notification.title}
                            </p>

                            {!notification.isRead && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                            )}
                          </div>

                          <p className="mt-1 text-xs leading-5 text-text-secondary break-words">
                            {notification.message}
                          </p>

                          <p className="mt-2 text-[11px] text-text-muted">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-border hidden sm:block" />

          {/* Recruiter account dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => {
                setMenuOpen((previous) => !previous);
                setNotificationOpen(false);
                setLogoutError("");
              }}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2.5 pl-1 py-1 pr-2 rounded-[var(--radius-md)] hover:bg-surface-alt transition-colors cursor-pointer select-none border border-transparent hover:border-border"
            >
              <Avatar
                name={recruiterName}
                initials={recruiterInitial}
                size="sm"
                variant="brand"
              />

              <div className="hidden sm:flex flex-col text-left">
                <span className="font-ui font-bold text-xs text-text leading-tight">
                  {recruiterName}
                </span>
                <span className="font-ui text-[11px] text-text-muted leading-tight">
                  Recruiter
                </span>
              </div>

              <svg
                className={`w-3.5 h-3.5 text-text-muted ml-0.5 transition-transform duration-200 ${
                  menuOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-surface shadow-xl overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-text truncate">
                    {recruiterName}
                  </p>
                  <p className="text-xs text-text-muted">
                    Recruiter account
                  </p>
                </div>

                <div className="p-1.5">
                  <Link
                    href="/recruiter/profile"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text hover:bg-surface-alt transition-colors"
                  >
                    <svg
                      className="w-5 h-5 text-primary"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 12a4.5 4.5 0 100-9 4.5 4.5 0 000 9zm0 2c-4.42 0-8 2.24-8 5v2h16v-2c0-2.76-3.58-5-8-5z" />
                    </svg>
                    Profile
                  </Link>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={themeReady ? toggleTheme : undefined}
                    disabled={!themeReady}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text hover:bg-surface-alt transition-colors disabled:opacity-60"
                  >
                    {theme === "dark" ? (
                      <svg
                        className="w-5 h-5 text-text-secondary"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 text-text-secondary"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20.5 15.5A8.5 8.5 0 018.5 3.5 8.5 8.5 0 1020.5 15.5z"
                        />
                      </svg>
                    )}

                    <span className="flex-1 text-left">Appearance</span>

                    <span
                      className={`relative w-9 h-5 rounded-full transition-colors ${
                        theme === "dark" ? "bg-primary" : "bg-border"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          theme === "dark" ? "translate-x-4" : ""
                        }`}
                      />
                    </span>
                  </button>

                  <Link
                    href="/recruiter/settings"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text hover:bg-surface-alt transition-colors"
                  >
                    <svg
                      className="w-5 h-5 text-text-secondary"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <circle cx="12" cy="12" r="3" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1-1.5 2.6-.2-.1a1.7 1.7 0 00-1.8.3l-.1.1h-3l-.1-.2a1.7 1.7 0 00-1.5-1l-.2.1-2.6-1.5.1-.2a1.7 1.7 0 00-.3-1.8l-.1-.1v-3l.2-.1a1.7 1.7 0 001-1.5l-.1-.2 1.5-2.6.2.1a1.7 1.7 0 001.8-.3l.1-.1h3l.1.2a1.7 1.7 0 001.5 1l.2-.1 2.6 1.5-.1.2a1.7 1.7 0 00.3 1.8l.1.1v3z"
                      />
                    </svg>
                    Settings
                  </Link>
                </div>

                {logoutError && (
                  <p className="px-4 pb-2 text-xs text-danger">
                    {logoutError}
                  </p>
                )}

                <div className="border-t border-border p-1.5">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-danger hover:bg-danger/5 transition-colors disabled:opacity-60"
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 17l5-5-5-5m5 5H3m9-9h6a3 3 0 013 3v12a3 3 0 01-3 3h-6"
                      />
                    </svg>
                    {loggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
