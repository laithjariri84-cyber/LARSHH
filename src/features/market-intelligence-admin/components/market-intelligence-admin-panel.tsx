"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bedroomLabel } from "@/server/market-intelligence";
import type { CommunityMarketProfileRecord } from "@/server/market-intelligence";

type DraftState = Record<string, Partial<CommunityMarketProfileRecord>>;

function numberField(value: number | null | undefined) {
  return value === null || value === undefined ? "" : String(value);
}

function parseNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function MarketIntelligenceAdminPanel() {
  const [profiles, setProfiles] = useState<CommunityMarketProfileRecord[]>([]);
  const [drafts, setDrafts] = useState<DraftState>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<string>("all");

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/v1/market-intelligence");
      const payload = await response.json();
      setProfiles(payload.data ?? []);
    } catch {
      toast.error("Failed to load market intelligence profiles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfiles();
  }, [loadProfiles]);

  const grouped = useMemo(() => {
    const map = new Map<string, CommunityMarketProfileRecord[]>();
    for (const profile of profiles) {
      const rows = map.get(profile.communityName) ?? [];
      rows.push(profile);
      map.set(profile.communityName, rows);
    }
    return Array.from(map.entries());
  }, [profiles]);

  const communityNames = useMemo(
    () => grouped.map(([name]) => name).sort((a, b) => a.localeCompare(b)),
    [grouped]
  );

  const visibleGroups = useMemo(() => {
    if (selectedCommunity === "all") return grouped;
    return grouped.filter(([name]) => name === selectedCommunity);
  }, [grouped, selectedCommunity]);

  function updateDraft(
    id: string,
    field: keyof CommunityMarketProfileRecord,
    value: string | boolean | number | null
  ) {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        [field]: value,
      },
    }));
  }

  function fieldValue(
    profile: CommunityMarketProfileRecord,
    field: keyof CommunityMarketProfileRecord
  ) {
    const draft = drafts[profile.id];
    if (draft && field in draft) {
      return draft[field as keyof typeof draft];
    }
    return profile[field];
  }

  async function saveProfile(profile: CommunityMarketProfileRecord) {
    const draft = drafts[profile.id];
    if (!draft) return;

    setSavingId(profile.id);
    try {
      const response = await fetch(`/api/v1/market-intelligence/${profile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });

      if (!response.ok) {
        throw new Error("Save failed");
      }

      const payload = await response.json();
      setProfiles((current) =>
        current.map((row) => (row.id === profile.id ? payload.data : row))
      );
      setDrafts((current) => {
        const next = { ...current };
        delete next[profile.id];
        return next;
      });
      toast.success(`${profile.communityName} · ${bedroomLabel(profile.bedroomCount)} saved.`);
    } catch {
      toast.error("Unable to save market intelligence profile.");
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 py-12">
        <Loader2 className="size-4 animate-spin" />
        Loading market intelligence database…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="max-w-md">
        <label className="larssh-label">Community</label>
        <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select community" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All communities</SelectItem>
            {communityNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {visibleGroups.map(([communityName, rows]) => (
        <section key={communityName} className="larssh-card overflow-hidden rounded-2xl">
          <div className="border-b border-white/5 bg-gradient-to-r from-gold/[0.04] to-transparent px-5 py-4 md:px-6">
            <h2 className="text-lg font-semibold">{communityName}</h2>
            <p className="text-muted-foreground mt-1 text-xs">
              All values in AED. Edit any field and save per unit type.
            </p>
          </div>

          <div className="divide-y divide-white/5">
            {rows.map((profile) => {
              const hasDraft = Boolean(drafts[profile.id]);
              return (
                <div key={profile.id} className="space-y-4 px-5 py-5 md:px-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{bedroomLabel(profile.bedroomCount)}</p>
                      <p className="text-muted-foreground text-xs">
                        {profile.isEstimated ? "Estimated profile" : "Research-backed profile"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="larssh-gold-btn"
                      disabled={!hasDraft || savingId === profile.id}
                      onClick={() => void saveProfile(profile)}
                    >
                      {savingId === profile.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Save className="size-4" />
                      )}
                      Save
                    </Button>
                  </div>

                  <FieldGrid
                    title="Rental Market · Furnished"
                    fields={[
                      ["rentFurnishedMin", "Min"],
                      ["rentFurnishedAvg", "Average"],
                      ["rentFurnishedMax", "Max"],
                    ]}
                    profile={profile}
                    fieldValue={fieldValue}
                    updateDraft={updateDraft}
                  />

                  <FieldGrid
                    title="Rental Market · Unfurnished"
                    fields={[
                      ["rentUnfurnishedMin", "Min"],
                      ["rentUnfurnishedAvg", "Average"],
                      ["rentUnfurnishedMax", "Max"],
                    ]}
                    profile={profile}
                    fieldValue={fieldValue}
                    updateDraft={updateDraft}
                  />

                  <FieldGrid
                    title="Sales Market · Asking"
                    fields={[
                      ["saleAskingLowest", "Lowest"],
                      ["saleAskingAvg", "Average"],
                      ["saleAskingHighest", "Highest"],
                    ]}
                    profile={profile}
                    fieldValue={fieldValue}
                    updateDraft={updateDraft}
                  />

                  <FieldGrid
                    title="Sales Market · Sold"
                    fields={[
                      ["saleSoldLowest", "Lowest"],
                      ["saleSoldAvg", "Average"],
                      ["saleSoldHighest", "Highest"],
                    ]}
                    profile={profile}
                    fieldValue={fieldValue}
                    updateDraft={updateDraft}
                  />

                  <FieldGrid
                    title="Additional Statistics"
                    fields={[
                      ["averageSizeSqft", "Average Size (sqft)"],
                      ["averagePricePerSqft", "Price / sqft"],
                      ["estimatedRoiPercent", "Estimated ROI (%)"],
                      ["confidencePercent", "Confidence (%)"],
                    ]}
                    profile={profile}
                    fieldValue={fieldValue}
                    updateDraft={updateDraft}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="larssh-label">Demand</label>
                      <Select
                        value={String(fieldValue(profile, "demand") ?? "none")}
                        onValueChange={(value) =>
                          updateDraft(
                            profile.id,
                            "demand",
                            value === "none" ? null : (value as "LOW" | "MEDIUM" | "HIGH")
                          )
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Demand" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Not set</SelectItem>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="larssh-label">Notes</label>
                      <Input
                        className="mt-2"
                        value={String(fieldValue(profile, "notes") ?? "")}
                        onChange={(event) =>
                          updateDraft(profile.id, "notes", event.target.value || null)
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function FieldGrid({
  title,
  fields,
  profile,
  fieldValue,
  updateDraft,
}: {
  title: string;
  fields: Array<[keyof CommunityMarketProfileRecord, string]>;
  profile: CommunityMarketProfileRecord;
  fieldValue: (
    profile: CommunityMarketProfileRecord,
    field: keyof CommunityMarketProfileRecord
  ) => unknown;
  updateDraft: (
    id: string,
    field: keyof CommunityMarketProfileRecord,
    value: string | boolean | number | null
  ) => void;
}) {
  return (
    <div>
      <p className="text-muted-foreground mb-3 text-xs font-medium uppercase tracking-[0.16em]">
        {title}
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        {fields.map(([field, label]) => (
          <div key={field}>
            <label className="larssh-label">{label}</label>
            <Input
              className="mt-2"
              inputMode="decimal"
              value={numberField(
                fieldValue(profile, field) as number | null | undefined
              )}
              onChange={(event) =>
                updateDraft(profile.id, field, parseNumber(event.target.value))
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
