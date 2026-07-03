"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ImportColumnMapping } from "@/lib/import/core/field-definitions";
import type {
  ImportCommitResult,
  ImportPreviewResult,
  ImportPreviewRow,
} from "@/lib/import/core/types";
import { ColumnMappingPanel } from "./column-mapping-panel";
import { notify } from "@/lib/notifications";

type Step = "upload" | "mapping" | "preview" | "complete";

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function PreviewTable({
  rows,
  emptyMessage,
}: {
  rows: ImportPreviewRow[];
  emptyMessage: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground py-6 text-center text-sm">
        {emptyMessage}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Row</TableHead>
          <TableHead>Reference</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Agent</TableHead>
          <TableHead>Quality</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={`${row.rowNumber}-${row.propertyCode}`}>
            <TableCell>{row.rowNumber}</TableCell>
            <TableCell className="font-medium">{row.propertyCode}</TableCell>
            <TableCell>{row.listingType}</TableCell>
            <TableCell>{formatPrice(row.askingPrice, row.currency)}</TableCell>
            <TableCell className="max-w-xs truncate">{row.locationLabel}</TableCell>
            <TableCell>{row.agentName}</TableCell>
            <TableCell>
              {row.qualityScore !== null ? `${row.qualityScore}%` : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function IssueTable({
  issues,
  emptyMessage,
}: {
  issues: ImportPreviewResult["errors"];
  emptyMessage: string;
}) {
  if (issues.length === 0) {
    return (
      <p className="text-muted-foreground py-6 text-center text-sm">
        {emptyMessage}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Row</TableHead>
          <TableHead>Field</TableHead>
          <TableHead>Message</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {issues.map((issue, index) => (
          <TableRow key={`${issue.rowNumber}-${issue.field ?? "general"}-${index}`}>
            <TableCell>{issue.rowNumber}</TableCell>
            <TableCell>{issue.field ?? "—"}</TableCell>
            <TableCell>{issue.message}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function ImportWorkflow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [csvText, setCsvText] = useState<string>("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ImportColumnMapping>({});
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null);
  const [commitResult, setCommitResult] = useState<ImportCommitResult | null>(
    null
  );
  const [loading, setLoading] = useState<
    "parse" | "preview" | "commit" | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const canImport = useMemo(
    () => Boolean(preview && preview.newListings.length > 0),
    [preview]
  );

  async function handleFileSelected(selected: File | null) {
    setFile(selected);
    setPreview(null);
    setCommitResult(null);
    setError(null);
    setStep("upload");

    if (!selected) {
      setCsvText("");
      setHeaders([]);
      setColumnMapping({});
      return;
    }

    setLoading("parse");
    try {
      const text = await selected.text();
      setCsvText(text);

      const formData = new FormData();
      formData.append("file", selected);

      const response = await fetch("/api/v1/import/headers", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Failed to read CSV headers");
      }

      setHeaders(payload.data.headers);
      setColumnMapping(payload.data.suggestedMapping);
      setStep("mapping");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read CSV");
    } finally {
      setLoading(null);
    }
  }

  async function handlePreview() {
    if (!file || !csvText) {
      setError("Select a CSV file first.");
      return;
    }

    setLoading("preview");
    setError(null);
    setCommitResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("columnMapping", JSON.stringify(columnMapping));

      const response = await fetch("/api/v1/import/pf-expert/preview", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Preview failed");
      }

      setPreview(payload.data as ImportPreviewResult);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Preview failed");
      setPreview(null);
    } finally {
      setLoading(null);
    }
  }

  async function handleCommit() {
    if (!preview || preview.newListings.length === 0) return;

    setLoading("commit");
    setError(null);

    try {
      const response = await fetch("/api/v1/import/pf-expert/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: preview.source,
          fileName: preview.fileName,
          rows: preview.newListings.map((row) => row.normalized),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Import failed");
      }

      const result = payload.data as ImportCommitResult;
      if (result.errors.length > 0) {
        throw new Error(result.errors[0]?.message ?? "Import failed");
      }

      setCommitResult(result);
      setPreview(null);
      setStep("complete");
      notify.listingImported(result.imported);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
      notify.errorOccurred(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(null);
    }
  }

  function resetWorkflow() {
    setStep("upload");
    setFile(null);
    setCsvText("");
    setHeaders([]);
    setColumnMapping({});
    setPreview(null);
    setCommitResult(null);
    setError(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(["upload", "mapping", "preview", "complete"] as Step[]).map(
          (item, index) => (
            <Badge
              key={item}
              variant={step === item ? "default" : "outline"}
              className="capitalize"
            >
              {index + 1}. {item}
            </Badge>
          )
        )}
      </div>

      {step === "upload" || step === "mapping" ? (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Upload CSV</h2>
            <p className="text-muted-foreground text-sm">
              Upload a PF Expert export or any compatible listing CSV.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(event) =>
                handleFileSelected(event.target.files?.[0] ?? null)
              }
              className="border-input bg-background file:bg-muted file:text-foreground hover:file:bg-muted/80 w-full rounded-lg border px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:px-3 file:py-1"
            />
            {file ? (
              <p className="text-muted-foreground text-xs">{file.name}</p>
            ) : null}
            {loading === "parse" ? (
              <p className="text-muted-foreground flex items-center text-sm">
                <Loader2 className="mr-2 size-4 animate-spin" />
                Reading CSV columns…
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {step === "mapping" && headers.length > 0 ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Map Columns</h2>
              <p className="text-muted-foreground text-sm">
                Match each CSV column to the corresponding database field.
              </p>
            </div>
            <Button
              type="button"
              onClick={handlePreview}
              disabled={loading !== null}
            >
              {loading === "preview" ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Upload className="mr-2 size-4" />
              )}
              Analyze CSV
            </Button>
          </CardHeader>
          <CardContent>
            <ColumnMappingPanel
              headers={headers}
              mapping={columnMapping}
              onChange={setColumnMapping}
            />
          </CardContent>
        </Card>
      ) : null}

      {error ? (
        <Card className="border-destructive/40">
          <CardContent className="text-destructive pt-6 text-sm">{error}</CardContent>
        </Card>
      ) : null}

      {step === "complete" && commitResult ? (
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-gold mt-0.5 size-5" />
              <div>
                <h2 className="text-lg font-semibold">Import Complete</h2>
                <p className="text-muted-foreground text-sm">
                  Imported {commitResult.imported} listings. Skipped{" "}
                  {commitResult.skipped} duplicates.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={() => {
                router.push("/search");
                router.refresh();
              }}
            >
              View in Search
              <ArrowRight className="ml-2 size-4" />
            </Button>
            <Button type="button" variant="outline" onClick={resetWorkflow}>
              Import Another File
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {step === "preview" && preview ? (
        <>
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary">{preview.totalRows} total rows</Badge>
            <Badge>{preview.newListings.length} to import</Badge>
            <Badge variant="outline">
              {preview.duplicateListings.length} DB duplicates
            </Badge>
            <Badge variant="outline">
              {preview.duplicateInFile.length} file duplicates
            </Badge>
            <Badge variant="destructive">{preview.errors.length} errors</Badge>
            <Badge variant="outline">{preview.warnings.length} warnings</Badge>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Rows to Import</h2>
                <p className="text-muted-foreground text-sm">
                  Valid rows ready to insert into the database
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("mapping")}
                  disabled={loading !== null}
                >
                  Edit Mapping
                </Button>
                <Button
                  type="button"
                  onClick={handleCommit}
                  disabled={!canImport || loading !== null}
                >
                  {loading === "commit" ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : null}
                  Import {preview.newListings.length} Listings
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <PreviewTable
                rows={preview.newListings}
                emptyMessage="No new listings to import."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Duplicate Listings (Database)</h2>
              <p className="text-muted-foreground text-sm">
                Property codes or PF Expert references already exist
              </p>
            </CardHeader>
            <CardContent>
              <PreviewTable
                rows={preview.duplicateListings}
                emptyMessage="No database duplicates detected."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Duplicate Rows (File)</h2>
              <p className="text-muted-foreground text-sm">
                Repeated property codes or references within the CSV
              </p>
            </CardHeader>
            <CardContent>
              <PreviewTable
                rows={preview.duplicateInFile}
                emptyMessage="No in-file duplicates detected."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Rows with Errors</h2>
              <p className="text-muted-foreground text-sm">
                Invalid rows skipped during validation
              </p>
            </CardHeader>
            <CardContent>
              <IssueTable
                issues={preview.errors}
                emptyMessage="No validation errors."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Warnings</h2>
              <p className="text-muted-foreground text-sm">
                Rows imported with inferred or missing values
              </p>
            </CardHeader>
            <CardContent>
              <IssueTable
                issues={preview.warnings}
                emptyMessage="No warnings."
              />
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
