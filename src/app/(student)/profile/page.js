
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const EMPTY_PROFILE = {
  name: "",
  email: "",
  avatarUrl: null,
  college: "",
  degree: "",
  graduationYear: "",
  bio: "",
  skills: [],
  linkedinUrl: "",
};

function ProfileSection({ title, description, children }) {
  return (
    <section className="bg-surface border border-border rounded-[var(--radius-lg)] overflow-hidden">
      <div className="px-5 sm:px-6 py-5 border-b border-border">
        <h2 className="font-display text-lg font-bold text-text">{title}</h2>
        <p className="font-ui text-xs text-text-muted mt-1">{description}</p>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled = false,
}) {
  return (
    <label className="block space-y-2">
      <span className="font-ui text-xs font-semibold text-text-secondary">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
      />
    </label>
  );
}

function Avatar({ name, avatarUrl }) {
  const initials = (name || "Student")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || "Student"}
        className="w-20 h-20 rounded-full object-cover border border-border"
      />
    );
  }

  return (
    <div className="w-20 h-20 rounded-full bg-rose-soft text-primary flex items-center justify-center font-display text-2xl font-bold">
      {initials}
    </div>
  );
}

function formatFileSize(bytes) {
  if (!bytes) return "Unknown size";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(date) {
  if (!date) return "Recently uploaded";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [originalProfile, setOriginalProfile] = useState(EMPTY_PROFILE);

  const [uploadedCVs, setUploadedCVs] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [skillInput, setSkillInput] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [cvLoading, setCvLoading] = useState(true);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvError, setCvError] = useState("");
  const [cvSuccess, setCvSuccess] = useState("");

  const fileInputRef = useRef(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/profile", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load your profile.");
      }

      const user = result.data;
      const userProfile = user.profile || {};

      const data = {
        name: user.name || "",
        email: user.email || "",
        avatarUrl: user.avatarUrl || null,
        college: userProfile.college || "",
        degree: userProfile.degree || "",
        graduationYear: userProfile.graduationYear
          ? String(userProfile.graduationYear)
          : "",
        bio: userProfile.bio || "",
        skills: Array.isArray(userProfile.skills)
          ? userProfile.skills
          : [],
        linkedinUrl: userProfile.linkedinUrl || "",
      };

      setProfile(data);
      setOriginalProfile(data);
    } catch (err) {
      setError(err.message || "Unable to load your profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCVs = useCallback(async () => {
    setCvLoading(true);
    setCvError("");

    try {
      const response = await fetch("/api/cv", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load your CVs.");
      }

      setUploadedCVs(result.data || []);
    } catch (err) {
      setCvError(err.message || "Unable to load uploaded CVs.");
    } finally {
      setCvLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    loadCVs();
  }, [loadProfile, loadCVs]);

  function updateField(key, value) {
    setProfile((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSaved(false);
    setSuccess("");
  }

  function addSkill(event) {
    event.preventDefault();

    const skill = skillInput.trim();

    if (!skill) return;

    if (
      profile.skills.some(
        (existing) => existing.toLowerCase() === skill.toLowerCase()
      )
    ) {
      setSkillInput("");
      return;
    }

    if (profile.skills.length >= 50) {
      setError("You can add a maximum of 50 skills.");
      return;
    }

    updateField("skills", [...profile.skills, skill]);
    setSkillInput("");
    setError("");
  }

  function removeSkill(skillToRemove) {
    updateField(
      "skills",
      profile.skills.filter((skill) => skill !== skillToRemove)
    );
  }

  async function handleCVChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!["pdf", "doc", "docx"].includes(extension) ||
        !allowedTypes.includes(file.type)) {
      setCvError("Please select a valid PDF, DOC or DOCX document.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setCvError("Your CV must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    if (file.size === 0) {
      setCvError("The selected file is empty.");
      event.target.value = "";
      return;
    }

    setCvUploading(true);
    setCvError("");
    setCvSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/cv", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "CV upload failed.");
      }

      setCvSuccess("Your CV has been uploaded successfully.");

      await loadCVs();

    } catch (err) {
      setCvError(err.message || "Unable to upload your CV.");
    } finally {
      setCvUploading(false);

      // Allows selecting the same file again if an upload fails.
      event.target.value = "";
    }
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");
    setSaved(false);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profile.name,
          profile: {
            college: profile.college,
            degree: profile.degree,
            graduationYear: profile.graduationYear,
            bio: profile.bio,
            skills: profile.skills,
            linkedinUrl: profile.linkedinUrl,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save your profile.");
      }

      const user = result.data;
      const userProfile = user.profile || {};

      const updatedProfile = {
        name: user.name || "",
        email: user.email || "",
        avatarUrl: user.avatarUrl || null,
        college: userProfile.college || "",
        degree: userProfile.degree || "",
        graduationYear: userProfile.graduationYear
          ? String(userProfile.graduationYear)
          : "",
        bio: userProfile.bio || "",
        skills: userProfile.skills || [],
        linkedinUrl: userProfile.linkedinUrl || "",
      };

      setProfile(updatedProfile);
      setOriginalProfile(updatedProfile);
      setIsEditing(false);
      setSaved(true);
      setSuccess("Your profile has been saved successfully.");
    } catch (err) {
      setError(err.message || "Unable to save your profile.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setProfile(originalProfile);
    setSkillInput("");
    setIsEditing(false);
    setError("");
    setSuccess("");
    setSaved(false);
  }

  const inputProps = (key) => ({
    value: profile[key],
    onChange: (event) => updateField(key, event.target.value),
    disabled: !isEditing || saving,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-9 h-9 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-ui text-sm text-text-muted mt-4">
            Loading your profile...
          </p>
        </div>
      </div>
    );
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

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl text-text tracking-tight">
                My Profile
              </h1>
              <p className="font-ui text-sm text-text-secondary mt-1">
                Manage your personal information, education and skills.
              </p>
            </div>

            {!isEditing ? (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setSaved(false);
                  setError("");
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-ui text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl border border-border text-text-secondary font-ui text-xs font-bold hover:bg-surface-alt disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white font-ui text-xs font-bold hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {saved && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Profile changes saved to your account.
          </div>
        )}

        <ProfileSection
          title="Personal Profile"
          description="Your identity and contact information."
        >
          <div className="flex items-center gap-4 pb-5 mb-5 border-b border-border">
            <Avatar name={profile.name} avatarUrl={profile.avatarUrl} />

            <div className="min-w-0">
              <h3 className="font-display text-lg font-bold text-text">
                {profile.name || "Student"}
              </h3>
              <p className="font-ui text-xs text-text-muted mt-1">
                Student Account
              </p>
              <p className="font-ui text-xs text-text-secondary mt-1 break-all">
                {profile.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Full Name" {...inputProps("name")} />
            <Field
              label="Email Address"
              type="email"
              value={profile.email}
              disabled
            />
            <Field label="Institution" {...inputProps("college")} />
            <Field label="Degree / Course" {...inputProps("degree")} />
            <Field
              label="Expected Graduation Year"
              type="number"
              placeholder="e.g. 2027"
              {...inputProps("graduationYear")}
            />
            <Field
              label="LinkedIn Profile"
              type="url"
              placeholder="https://www.linkedin.com/in/your-profile"
              {...inputProps("linkedinUrl")}
            />
          </div>
        </ProfileSection>

        <ProfileSection
          title="Skills"
          description="Highlight the technical and professional skills you have developed."
        >
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-rose-soft text-primary text-xs font-ui font-semibold"
              >
                {skill}

                {isEditing && (
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    aria-label={`Remove ${skill}`}
                    className="hover:text-danger"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}

            {profile.skills.length === 0 && (
              <p className="font-ui text-xs text-text-muted">
                No skills added yet.
              </p>
            )}
          </div>

          {isEditing && (
            <form onSubmit={addSkill} className="flex gap-2 mt-5">
              <input
                value={skillInput}
                onChange={(event) => setSkillInput(event.target.value)}
                placeholder="Add a skill..."
                disabled={saving}
                className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />

              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2.5 rounded-xl bg-rose-soft text-primary font-ui text-xs font-bold hover:bg-primary hover:text-white transition-colors"
              >
                Add Skill
              </button>
            </form>
          )}
        </ProfileSection>

        <ProfileSection
          title="About Me"
          description="Introduce yourself to recruiters and potential employers."
        >
          <textarea
            value={profile.bio}
            onChange={(event) => updateField("bio", event.target.value)}
            disabled={!isEditing || saving}
            rows={5}
            maxLength={1000}
            placeholder="Tell recruiters about yourself, your interests and career goals..."
            className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed resize-y"
          />

          <p className="font-ui text-[11px] text-text-muted text-right mt-2">
            {profile.bio.length}/1000 characters
          </p>
        </ProfileSection>

        <ProfileSection
          title="Resume / CV"
          description="Upload your latest resume. It will be securely stored and available when applying for internships."
        >
          {cvError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
              {cvError}
            </div>
          )}

          {cvSuccess && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 mb-4">
              {cvSuccess}
            </div>
          )}

          <div className="rounded-2xl border-2 border-dashed border-border bg-background p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-rose-soft text-primary flex items-center justify-center mx-auto mb-3">
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  d="M12 16V4m0 0L7 9m5-5 5 5M5 15v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h3 className="font-display font-bold text-text">
              {cvUploading ? "Uploading your CV..." : "Upload your CV"}
            </h3>

            <p className="text-xs text-text-muted mt-1">
              PDF, DOC or DOCX · Maximum file size: 5 MB
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleCVChange}
              disabled={cvUploading}
              className="hidden"
              id="cv-upload"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={cvUploading}
              className="inline-flex mt-5 px-5 py-3 rounded-xl bg-primary text-white text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cvUploading ? "Uploading..." : "Choose CV"}
            </button>

            {cvUploading && (
              <div className="mt-5 max-w-xs mx-auto">
                <div className="h-2 rounded-full bg-border overflow-hidden">
                  <div className="h-full w-2/3 rounded-full bg-primary animate-pulse" />
                </div>
                <p className="text-xs text-text-muted mt-2">
                  Sending your file securely...
                </p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="font-display font-bold text-text">
                Uploaded CVs
              </h3>
              <span className="text-xs text-text-muted">
                {uploadedCVs.length} file(s)
              </span>
            </div>

            {cvLoading ? (
              <p className="font-ui text-sm text-text-muted py-4">
                Loading your CVs...
              </p>
            ) : uploadedCVs.length === 0 ? (
              <div className="rounded-xl border border-border bg-background p-5 text-center">
                <p className="text-sm font-semibold text-text">
                  No CV uploaded yet
                </p>
                <p className="text-xs text-text-muted mt-2">
                  Your uploaded resumes will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {uploadedCVs.map((cv) => (
                  <div
                    key={cv._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border p-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 shrink-0 rounded-lg bg-rose-soft text-primary flex items-center justify-center">
                        <svg
                          viewBox="0 0 24 24"
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path
                            d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
                            strokeLinejoin="round"
                          />
                          <path d="M14 3v5h5M9 13h6M9 17h6" />
                        </svg>
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-text truncate">
                          {cv.originalName}
                        </p>
                        <p className="text-xs text-text-muted mt-1">
                          Version {cv.version} · {formatFileSize(cv.sizeBytes)} ·{" "}
                          {formatDate(cv.createdAt)}
                        </p>
                      </div>
                    </div>

                    {cv.isDefault && (
                      <span className="self-start sm:self-center px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                        Default CV
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ProfileSection>
      </div>
    </div>
  );
}
