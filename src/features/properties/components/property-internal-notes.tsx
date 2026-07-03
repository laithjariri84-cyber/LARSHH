import { Lock, Pin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { PropertyInternalNote } from "@/features/properties/types";
import { formatDateShort } from "@/lib/utils";

import { SectionCard } from "./section-card";

type PropertyInternalNotesProps = {
  notes: PropertyInternalNote[];
};

export function PropertyInternalNotes({ notes }: PropertyInternalNotesProps) {
  return (
    <SectionCard
      title="Internal Notes"
      description="Confidential team notes · visible inside LARSSH only"
      action={
        <Badge variant="outline" className="border-gold/30 text-gold gap-1.5">
          <Lock className="size-3" />
          Internal
        </Badge>
      }
      className="border-dashed border-gold/15"
    >
      {notes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center">
          <Lock className="text-muted-foreground mx-auto size-8" />
          <p className="mt-3 text-sm font-medium">No internal notes yet</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Team notes for this listing will appear here.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="rounded-xl border border-white/5 bg-black/20 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">{note.authorName}</p>
                <div className="flex items-center gap-2">
                  {note.isPinned ? (
                    <Badge variant="outline" className="gap-1 text-[10px]">
                      <Pin className="size-3" />
                      Pinned
                    </Badge>
                  ) : null}
                  <span className="text-muted-foreground text-xs">
                    {formatDateShort(note.createdAt)}
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground mt-3 text-sm leading-7 whitespace-pre-wrap">
                {note.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
