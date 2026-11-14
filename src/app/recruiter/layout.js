"use client";

import { useEffect, useState } from "react";
import RecruiterNavbar from "@/components/shared/recruiter/RecruiterNavbar";
import RecruiterSidebar from "@/components/shared/recruiter/RecruiterSidebar";

export default function RecruiterLayout({ children }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [recruiter, setRecruiter] = useState(null);

  useEffect(() => {
    let active = true;

    async function fetchRecruiter() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        const result = await response.json();

        if (response.ok && result.success && active) {
          setRecruiter(result.user || result.data || null);
        }
      } catch (error) {
        console.error("Unable to load recruiter profile:", error);
      }
    }

    fetchRecruiter();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <RecruiterNavbar
        recruiter={recruiter}
        onToggleMobileSidebar={() =>
          setIsMobileSidebarOpen((previous) => !previous)
        }
      />

      <div className="flex">
        <RecruiterSidebar
          recruiter={recruiter}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
