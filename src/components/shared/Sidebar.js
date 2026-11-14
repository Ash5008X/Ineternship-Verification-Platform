
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "../ui/Avatar";

/**
 * Vertical student navigation sidebar.
 */
export default function Sidebar({
  student,
  isMobileOpen = false,
  onCloseMobile,
}) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Home",
      href: "/home",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
    },
    {
      name: "Browse Internships",
      href: "/internships",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v1.069m7.5 0c1.353.078 2.68.235 3.974.465M8.25 6.319a44.6 44.6 0 00-3.974.465" />
        </svg>
      ),
    },
    {
      name: "Student Experiences",
      href: "/experiences",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.636 1.07.498 1.684l-.532 2.392a.75.75 0 001.03.834l2.772-1.232c.504-.224 1.082-.206 1.58.052A9.458 9.458 0 0012 20.25z" />
        </svg>
      ),
    },
    {
      name: "My Bookmarks",
      href: "/bookmarks",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
      ),
    },
    {
      name: "My Reports",
      href: "/reports",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
        </svg>
      ),
    },
    {
      name: "Applications",
      href: "/applications",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      ),
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="px-3 py-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted px-3 mb-2 font-ui">
            Navigation
          </p>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => onCloseMobile?.()}
                  aria-current={isActive ? "page" : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-xs font-semibold font-ui transition-all duration-150 select-none text-left ${
                    isActive
                      ? "bg-rose-soft text-primary font-bold shadow-2xs border border-primary/20"
                      : "text-text-secondary hover:text-text hover:bg-surface-alt border border-transparent"
                  }`}
                >
                  <span
                    className={`shrink-0 ${
                      isActive ? "text-primary" : "text-text-muted"
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span className="truncate">{item.name}</span>

                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary ml-auto shrink-0" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Profile Card */}
      <div className="p-3 border-t border-border mt-auto">
        <div className="rounded-[var(--radius-md)] bg-surface-alt border border-border p-3">
          <div className="flex items-center gap-2.5">
            <Avatar
              name={student?.name || "Ashmit Sharma"}
              initials={student?.avatarText || "AS"}
              size="sm"
              variant="brand"
            />

            <div className="min-w-0">
              <p className="font-ui font-bold text-xs text-text truncate">
                {student?.name || "Ashmit Sharma"}
              </p>

              <div className="flex items-center gap-1 text-[11px] text-success mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                <span className="font-ui font-medium">
                  Verified Student
                </span>
              </div>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-border/80 flex items-center justify-between text-[11px] text-text-muted">
            <span className="font-ui">
              Lovely Professional University
            </span>
            <span className="font-mono text-[10px]">3rd Year</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-60 shrink-0 border-r border-border bg-surface min-h-[calc(100vh-3.5rem)] sticky top-14 self-start">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-surface z-50 shadow-xl md:hidden transform transition-transform duration-200 ease-in-out flex flex-col ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-14 px-4 flex items-center border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary text-white flex items-center justify-center font-bold">
              IC
            </div>

            <span className="font-ui font-extrabold text-sm text-text">
              Intern<span className="text-primary">Check</span>
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sidebarContent}
        </div>
      </aside>
    </>
  );
}
