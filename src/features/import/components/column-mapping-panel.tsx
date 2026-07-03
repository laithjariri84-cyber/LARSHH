"use client";

import {
  IMPORT_FIELD_DEFINITIONS,
  type ImportColumnMapping,
  type ImportFieldKey,
} from "@/lib/import/core/field-definitions";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ColumnMappingPanelProps = {
  headers: string[];
  mapping: ImportColumnMapping;
  onChange: (mapping: ImportColumnMapping) => void;
};

const UNMAPPED = "__unmapped__";

export function ColumnMappingPanel({
  headers,
  mapping,
  onChange,
}: ColumnMappingPanelProps) {
  function updateField(field: ImportFieldKey, header: string | null) {
    onChange({
      ...mapping,
      [field]: header === UNMAPPED ? null : header,
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {IMPORT_FIELD_DEFINITIONS.map((field) => (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={`map-${field.key}`} className="flex items-center gap-2">
            {field.label}
            {field.required ? (
              <span className="text-destructive text-xs">Required</span>
            ) : null}
          </Label>
          <Select
            value={mapping[field.key] ?? UNMAPPED}
            onValueChange={(value) => updateField(field.key, value)}
          >
            <SelectTrigger id={`map-${field.key}`}>
              <SelectValue placeholder="Select CSV column" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNMAPPED}>— Not mapped —</SelectItem>
              {headers.map((header) => (
                <SelectItem key={header} value={header}>
                  {header}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs">{field.description}</p>
        </div>
      ))}
    </div>
  );
}
