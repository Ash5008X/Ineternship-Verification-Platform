"use client";

import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import SectionHeader from "@/components/shared/SectionHeader";
import RightSidebar from "@/components/shared/RightSidebar";
import InternshipList from "@/components/internships/InternshipList";
import InternshipDetails from "@/components/internships/InternshipDetails";
import ApplicationActivity from "@/components/applications/ApplicationActivity";
import {
  studentProfile,
  motivationalMessage,
  applicationStats,
  applicationActivity,
  recentlyViewedInternships,
  recommendedInternships as initialRecommendedInternships,
} from "@/lib/mockData";

export default function StudentDashboardPage() {
  // Mobile drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Recommendations state
  const [internships, setInternships] = useState(
    initialRecommendedInternships
  );
  const [selectedId, setSelectedId] = useState(
    initialRecommendedInternships[0]?.id || null
  );

  // Active filter state for recommendations
  const [activeFilter, setActiveFilter] = useState("all");

  // Saved bookmarks count state
  const [savedCount, setSavedCount] = useState(applicationStats.savedCount);

  // Feedback toast for interactive feedback
  const [toastMessage, setToastMessage] = useState(null);

  // Active mobile view tab: "list" | "details"
  const [mobileTab, setMobileTab] = useState("list");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Find currently selected internship
  const selectedInternship =
    internships.find((i) => i.id === selectedId) || internships[0] || null;

  // Handle bookmark toggle
  const handleToggleBookmark = (id) => {
    setInternships((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStatus = !item.isBookmarked;
          setSavedCount((c) => (newStatus ? c + 1 : Math.max(0, c - 1)));
          showToast(
            newStatus
              ? `Saved ${item.company} role to your bookmarks`
              : `Removed from bookmarks`
          );
          return { ...item, isBookmarked: newStatus };
        }
        return item;
      })
    );
  };

  // Handle removing / dismissing an internship
  const handleRemove = (id) => {
    const remaining = internships.filter((i) => i.id !== id);
    setInternships(remaining);
    showToast("Opportunity dismissed from recommendations");
    if (selectedId === id && remaining.length > 0) {
      setSelectedId(remaining[0].id);
    }
  };

  // Reset recommendations list
  const handleReset = () => {
    setInternships(initialRecommendedInternships);
    setSelectedId(initialRecommendedInternships[0]?.id || null);
    showToast("Recommendations reset to initial feed");
  };

  // Select an internship
  const handleSelect = (internship) => {
    setSelectedId(internship.id);
    setMobileTab("details");
  };

  // Handle apply action
  const handleApply = (internship) => {
    showToast(
      internship.applicationType === "Easy Apply"
        ? `Application submitted to ${internship.company} via Easy Apply`
        : `Opening verified portal for ${internship.company}`
    );
  };

  // Handle quick actions navigation
  const handleQuickAction = (actionKey) => {
    if (actionKey === "cv") {
      showToast("CV profile analysis is already up-to-date (14 skills detected)");
    } else if (actionKey === "bookmarks") {
      showToast("Showing your 12 saved internships");
    } else if (actionKey === "browse") {
      showToast("Filtering all verified internship listings");
    } else if (actionKey === "applications") {
      showToast("Viewing active application tracking dashboard");
    }
  };

  // Handle selecting from recently viewed
  const handleSelectRecent = (recentItem) => {
    // If the item exists in recommended, select it
    const match = internships.find((i) => i.company === recentItem.company);
    if (match) {
      setSelectedId(match.id);
      setMobileTab("details");
      showToast(`Switched view to ${recentItem.company}`);
    } else {
      showToast(`Viewing details for ${recentItem.role} at ${recentItem.company}`);
    }
  };

  // Filtered internships
  const filteredInternships = internships.filter((item) => {
    if (activeFilter === "remote") return item.workMode.toLowerCase().includes("remote");
    if (activeFilter === "high-match") return item.matchPercentage >= 85;
    if (activeFilter === "low-risk") return item.riskLevel.toLowerCase() === "low";
    return true;
  });

  return (
    <>
        {/* 1. MAIN DASHBOARD CONTENT */}
        <main className="flex-1 min-w-0 py-6 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">
          {/* Toast Notification Banner */}
          {toastMessage && (
            <div className="fixed bottom-5 right-5 z-50 bg-text text-background px-4 py-2.5 rounded-[var(--radius-md)] text-xs font-semibold shadow-lg flex items-center gap-2.5 border border-border transition-all">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* WELCOME SECTION + CV STATUS CARD */}
          <section className="mb-6" aria-labelledby="welcome-heading">
            <PageHeader
              student={studentProfile}
              motivationalMessage={motivationalMessage}
              onUpdateCv={() =>
                showToast("Resume parsing is up to date (14 skills mapped)")
              }
            />
          </section>

          {/* TWO-COLUMN DASHBOARD GRID (approx 70% / 30%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* =========================================================
                LEFT / MAIN COLUMN (~70% of space on desktop)
                Houses: Recommended Internships Feed + Details
                ========================================================= */}
            <div className="lg:col-span-8 xl:col-span-8 space-y-6">
              {/* RECOMMENDED INTERNSHIPS HEADER */}
              <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 sm:p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
                  <SectionHeader
                    title="Recommended for you"
                    subtitle="Internships matched to your skills."
                  />

                  {/* Filter chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setActiveFilter("all")}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-[var(--radius-sm)] transition-colors cursor-pointer select-none ${activeFilter === "all"
                          ? "bg-primary text-white"
                          : "bg-surface-alt text-text-secondary hover:text-text border border-border"
                        }`}
                    >
                      All ({internships.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveFilter("remote")}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-[var(--radius-sm)] transition-colors cursor-pointer select-none ${activeFilter === "remote"
                          ? "bg-primary text-white"
                          : "bg-surface-alt text-text-secondary hover:text-text border border-border"
                        }`}
                    >
                      Remote
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveFilter("high-match")}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-[var(--radius-sm)] transition-colors cursor-pointer select-none ${activeFilter === "high-match"
                          ? "bg-primary text-white"
                          : "bg-surface-alt text-text-secondary hover:text-text border border-border"
                        }`}
                    >
                      85%+ Match
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveFilter("low-risk")}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-[var(--radius-sm)] transition-colors cursor-pointer select-none ${activeFilter === "low-risk"
                          ? "bg-primary text-white"
                          : "bg-surface-alt text-text-secondary hover:text-text border border-border"
                        }`}
                    >
                      Low Risk
                    </button>
                  </div>
                </div>

                {/* Mobile View Toggle Tabs (Only visible on small devices) */}
                <div className="flex xl:hidden border-b border-border mt-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setMobileTab("list")}
                    className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition-colors ${mobileTab === "list"
                        ? "border-primary text-primary"
                        : "border-transparent text-text-muted hover:text-text"
                      }`}
                  >
                    Internship List ({filteredInternships.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileTab("details")}
                    className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition-colors ${mobileTab === "details"
                        ? "border-primary text-primary"
                        : "border-transparent text-text-muted hover:text-text"
                      }`}
                  >
                    Selected Details {selectedInternship ? `(${selectedInternship.company})` : ""}
                  </button>
                </div>

                {/* INTERNSHIP DISCOVERY SPLIT INTERFACE */}
                <div className="pt-4">
                  {/* Large Desktop: True Side-by-Side Split View */}
                  <div className="hidden xl:grid xl:grid-cols-12 gap-5 items-start">
                    {/* Left: Internship List */}
                    <div className="xl:col-span-5 max-h-[820px] overflow-y-auto pr-1">
                      <InternshipList
                        internships={filteredInternships}
                        selectedId={selectedId}
                        onSelect={handleSelect}
                        onToggleBookmark={handleToggleBookmark}
                        onRemove={handleRemove}
                        onReset={handleReset}
                      />
                    </div>

                    {/* Right: Selected Internship Details */}
                    <div className="xl:col-span-7 sticky top-20">
                      <InternshipDetails
                        internship={selectedInternship}
                        userSkills={studentProfile.skills}
                        onToggleBookmark={handleToggleBookmark}
                        onApply={handleApply}
                      />
                    </div>
                  </div>

                  {/* Tablet / Mobile View: Switchable tabs or responsive stack */}
                  <div className="xl:hidden">
                    {mobileTab === "list" ? (
                      <div>
                        <InternshipList
                          internships={filteredInternships}
                          selectedId={selectedId}
                          onSelect={handleSelect}
                          onToggleBookmark={handleToggleBookmark}
                          onRemove={handleRemove}
                          onReset={handleReset}
                        />
                      </div>
                    ) : (
                      <div>
                        <button
                          type="button"
                          onClick={() => setMobileTab("list")}
                          className="mb-3 text-xs font-semibold text-primary flex items-center gap-1 cursor-pointer"
                        >
                          &larr; Back to internship list
                        </button>
                        <InternshipDetails
                          internship={selectedInternship}
                          userSkills={studentProfile.skills}
                          onToggleBookmark={handleToggleBookmark}
                          onApply={handleApply}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>


            </div>

            {/* =========================================================
                RIGHT COLUMN (~30% of space on desktop)
                Houses: Application Status, Saved, Recently Viewed, Quick Actions
                ========================================================= */}
            <div className="lg:col-span-4 xl:col-span-4 space-y-4">
              <RightSidebar
                stats={applicationStats}
                savedCount={savedCount}
                recentlyViewed={recentlyViewedInternships}
                onSelectRecent={handleSelectRecent}
                onNavigateAction={handleQuickAction}
              />
            </div>
          </div>
        </main>
    </>
  );
}
