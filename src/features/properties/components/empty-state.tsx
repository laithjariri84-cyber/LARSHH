import { FileText, Images, SearchX, Timer, UserRound } from "lucide-react";

export function NotesEmptyState() {
  return (
    <EmptyStateShell
      icon={FileText}
      title="No property notes"
      description="Notes will appear here when listing descriptions are added to this property."
    />
  );
}

export function TimelineEmptyState() {
  return (
    <EmptyStateShell
      icon={Timer}
      title="No timeline events"
      description="Property and listing activity will be tracked here as records are updated."
    />
  );
}

export function AgentEmptyState() {
  return (
    <EmptyStateShell
      icon={UserRound}
      title="No assigned agent"
      description="Assign a listing with an agent to display contact details on this property."
    />
  );
}

export function SimilarPropertiesEmptyState() {
  return (
    <EmptyStateShell
      icon={SearchX}
      title="No similar properties found"
      description="We couldn't find other listings in this community with matching bedrooms and comparable size."
    />
  );
}

export function MediaEmptyState() {
  return (
    <EmptyStateShell
      icon={Images}
      title="No media uploaded"
      description="Image gallery, floor plans, and video tours will appear here once media is connected."
    />
  );
}

function EmptyStateShell({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center">
      <div className="bg-muted mb-4 flex size-12 items-center justify-center rounded-full">
        <Icon className="text-muted-foreground size-5" />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-2 max-w-sm text-xs leading-relaxed">
        {description}
      </p>
    </div>
  );
}
