import InternshipCard from "./InternshipCard";
import Button from "../ui/Button";

/**
 * InternshipList component rendering the selectable list of recommended roles.
 */
export default function InternshipList({
  internships = [],
  selectedId,
  onSelect,
  onToggleBookmark,
  onRemove,
  onReset,
}) {
  if (internships.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-8 text-center">
        <div className="w-10 h-10 rounded-full bg-surface-alt border border-border mx-auto flex items-center justify-center text-text-muted mb-3">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <h4 className="font-ui font-bold text-sm text-text">
          No more internships in this feed
        </h4>
        <p className="font-ui text-xs text-text-muted mt-1 max-w-xs mx-auto">
          You have reviewed all available recommendations. Reset to restore the initial list.
        </p>
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={onReset}>
            Reset recommendations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {internships.map((internship) => (
        <InternshipCard
          key={internship.id}
          internship={internship}
          isSelected={internship.id === selectedId}
          onSelect={onSelect}
          onToggleBookmark={onToggleBookmark}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
