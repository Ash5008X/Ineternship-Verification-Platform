import Button from "../ui/Button";
import SkillChips from "../internships/SkillChips";

/**
 * PageHeader component for the student dashboard.
 * Contains:
 * - Label: "Student Dashboard"
 * - Heading: "Good afternoon, Ashmit." in DM Serif Display
 * - Motivational message: "Find something worth applying to."
 * - Compact CV / Profile Status card with identified skills & "Update CV" action
 */
export default function PageHeader({
  student,
  motivationalMessage = "Find something worth applying to.",
  onUpdateCv,
}) {
  const previewSkills = student?.skills?.slice(0, 6) || [
    "React",
    "Node.js",
    "MongoDB",
    "Docker",
    "JavaScript",
    "Git",
  ];

  return (
    <div className="space-y-4">
      {/* Welcome Greetings */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block w-2 h-2 rounded-full bg-primary" />
          <span className="font-ui text-xs font-bold uppercase tracking-wider text-text-muted">
            Student Dashboard
          </span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-text tracking-tight">
          Good afternoon, {student?.greetingName || "Ashmit"}.
        </h1>
        <p className="font-ui text-sm text-text-secondary mt-1">
          {motivationalMessage}
        </p>
      </div>
    </div>
  );
}
