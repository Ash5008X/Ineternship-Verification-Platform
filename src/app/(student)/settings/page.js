
"use client";

import { useState } from "react";

function SettingsSection({ title, description, children }) {
  return (
    <section className="bg-surface border border-border rounded-[var(--radius-lg)] overflow-hidden">
      <div className="px-5 sm:px-6 py-5 border-b border-border">
        <h2 className="font-display text-lg font-bold text-text">{title}</h2>
        <p className="font-ui text-xs text-text-muted mt-1">{description}</p>
      </div>
      <div className="p-5 sm:p-6 space-y-5">{children}</div>
    </section>
  );
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-5">
      <div className="min-w-0">
        <p className="font-ui text-sm font-semibold text-text">{label}</p>
        <p className="font-ui text-xs text-text-muted mt-1 leading-5">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative flex-none w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 ${
          checked ? "bg-primary" : "bg-[#D8CDD2]"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export default function StudentSettingsPage() {
  const [settings, setSettings] = useState({
    emailApplications: true,
    applicationStatus: true,
    internshipRecommendations: true,
    experienceUpdates: true,
    browserNotifications: false,
    profileVisibility: true,
    showEducation: true,
    showSkills: true,
  });

  function updateSetting(key, value) {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-7">

        <section>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="font-ui text-xs font-bold uppercase tracking-wider text-text-muted">
              Student Workspace
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl text-text tracking-tight">
            Settings
          </h1>

          <p className="font-ui text-sm text-text-secondary mt-1">
            Manage your notifications and profile privacy.
          </p>
        </section>

        <SettingsSection
          title="Notification Preferences"
          description="Choose which updates you want to receive."
        >
          <Toggle
            label="Application Updates"
            description="Receive notifications when your application status changes."
            checked={settings.emailApplications}
            onChange={(value) => updateSetting("emailApplications", value)}
          />

          <div className="border-t border-border" />

          <Toggle
            label="Application Status"
            description="Get updates when recruiters shortlist or review your applications."
            checked={settings.applicationStatus}
            onChange={(value) => updateSetting("applicationStatus", value)}
          />

          <div className="border-t border-border" />

          <Toggle
            label="Internship Recommendations"
            description="Receive recommendations for internships matching your interests and skills."
            checked={settings.internshipRecommendations}
            onChange={(value) => updateSetting("internshipRecommendations", value)}
          />

          <div className="border-t border-border" />

          <Toggle
            label="Student Experience Updates"
            description="Receive updates related to submitted experiences and reports."
            checked={settings.experienceUpdates}
            onChange={(value) => updateSetting("experienceUpdates", value)}
          />

          <div className="border-t border-border" />

          <Toggle
            label="Browser Notifications"
            description="Receive notifications while using InternCheck in your browser."
            checked={settings.browserNotifications}
            onChange={(value) => updateSetting("browserNotifications", value)}
          />
        </SettingsSection>

        <SettingsSection
          title="Privacy"
          description="Control what other users can see on your student profile."
        >
          <Toggle
            label="Profile Visibility"
            description="Allow recruiters to view your student profile."
            checked={settings.profileVisibility}
            onChange={(value) => updateSetting("profileVisibility", value)}
          />

          <div className="border-t border-border" />

          <Toggle
            label="Show Education"
            description="Display your degree, institution and academic year on your profile."
            checked={settings.showEducation}
            onChange={(value) => updateSetting("showEducation", value)}
          />

          <div className="border-t border-border" />

          <Toggle
            label="Show Skills"
            description="Allow recruiters to see the skills listed on your profile."
            checked={settings.showSkills}
            onChange={(value) => updateSetting("showSkills", value)}
          />
        </SettingsSection>

        <div className="bg-rose-soft/50 border border-primary/10 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v4m0 4h.01M10.3 3.9L2.8 17a2 2 0 001.7 3h15a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"
                />
              </svg>
            </div>

            <div>
              <h3 className="font-ui text-sm font-bold text-text">
                Your privacy matters
              </h3>
              <p className="font-ui text-xs text-text-secondary mt-1 leading-5">
                Your application information is shared with the recruiters
                handling those applications. Profile visibility preferences
                control the visibility of your public student profile.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
