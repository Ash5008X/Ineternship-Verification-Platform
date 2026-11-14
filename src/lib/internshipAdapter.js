
export function formatStipend(stipend) {
  if (!stipend) return "Stipend not specified";

  if (stipend.period === "unpaid") return "Unpaid";

  if (
    stipend.amount === null ||
    stipend.amount === undefined
  ) {
    return "Stipend not disclosed";
  }

  const amount = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(stipend.amount);

  const periodLabels = {
    hourly: "/hour",
    weekly: "/week",
    monthly: "/month",
    total: " total",
  };

  return `₹${amount}${periodLabels[stipend.period] || ""}`;
}

export function formatDuration(duration) {
  if (!duration?.value || !duration?.unit) {
    return "Duration not specified";
  }

  const unit = duration.unit;

  return `${duration.value} ${unit.replace(/s$/, "")}${
    duration.value > 1 ? "s" : ""
  }`;
}

export function formatLocation(location) {
  if (!location) return "Location not specified";

  const parts = [
    location.city,
    location.state,
    location.country,
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : "Location not specified";
}

export function calculateSkillMatch(requiredSkills = [], userSkills = []) {
  if (!requiredSkills.length || !userSkills.length) {
    return null;
  }

  const normalizedUserSkills = new Set(
    userSkills.map((skill) => skill.trim().toLowerCase())
  );

  const matched = requiredSkills.filter((skill) =>
    normalizedUserSkills.has(skill.trim().toLowerCase())
  );

  return Math.round((matched.length / requiredSkills.length) * 100);
}

export function adaptInternship(internship, userSkills = [], bookmarkedIds = []) {
  const company = internship.company || {};
  const risk = internship.riskAssessment;

  const id = internship._id?.toString();

  return {
    id,
    role: internship.title,
    company: company.name || "Unknown Company",
    companyDomain: company.domain || company.website || "",
    initials: (company.name || "IC")
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),

    location: formatLocation(internship.location),
    workMode: internship.workMode || "unspecified",
    duration: formatDuration(internship.duration),
    stipend: formatStipend(internship.stipend),

    matchPercentage: calculateSkillMatch(
      internship.requiredSkills || [],
      userSkills
    ),

    riskLevel: risk?.severity || null,
    riskScore: risk?.score ?? null,

    skills: internship.requiredSkills || [],
    description: internship.description || "",
    workItems: [],
    
    applicationDeadline: internship.applicationDeadline,
    applicationType:
      internship.applicationMethod === "internal"
        ? "Easy Apply"
        : "External Apply",

    applicationUrl: internship.applicationUrl || null,

    verification: {
      status: company.identityStatus || "unverified",
    },

    isBookmarked: bookmarkedIds.includes(id),

    postedTime: internship.createdAt
      ? new Date(internship.createdAt).toLocaleDateString("en-IN")
      : "Recently",

    applicantsCount: null,
  };
}

export function adaptInternships(
  internships = [],
  userSkills = [],
  bookmarkedIds = []
) {
  return internships.map((internship) =>
    adaptInternship(internship, userSkills, bookmarkedIds)
  );
}
