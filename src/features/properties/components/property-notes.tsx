import { FileText } from "lucide-react";

import { SectionCard } from "./section-card";
import { NotesEmptyState } from "./empty-state";

type PropertyNotesProps = {
  notes: string | null;
};

export function PropertyNotes({ notes }: PropertyNotesProps) {
  return (
    <SectionCard
      title="Property Notes"
      description="Internal notes sourced from listing descriptions"
    >
      {notes ? (
        <div className="bg-muted/20 rounded-lg border px-4 py-4">
          <div className="text-muted-foreground mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
            <FileText className="size-3.5" />
            Listing notes
          </div>
          <p className="text-sm leading-7 whitespace-pre-wrap">{notes}</p>
        </div>
      ) : (
        <NotesEmptyState />
      )}
    </SectionCard>
  );
}
