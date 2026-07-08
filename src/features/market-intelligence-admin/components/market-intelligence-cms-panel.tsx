"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Save, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatCurrency } from "@/lib/utils";
import type {
  CommunityIntelligenceCmsRecord,
  CommunityListItem,
} from "@/server/market-intelligence/cms";
import {
  INTELLIGENCE_UNIT_CATEGORIES,
  INTELLIGENCE_UNIT_LABELS,
} from "@/server/market-intelligence/cms";

const TEXTAREA_CLASS =
  "border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring mt-2 min-h-24 w-full rounded-xl border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none";

const UNSAVED_MESSAGE =
  "You have unsaved changes. Leave this community without saving?";

type TabId =
  | "general"
  | "market"
  | "property-types"
  | "nearby"
  | "ai-notes"
  | "admin";

const TABS: { id: TabId; label: string }[] = [
  { id: "general", label: "General" },
  { id: "market", label: "Market Data" },
  { id: "property-types", label: "Property Types" },
  { id: "nearby", label: "Nearby" },
  { id: "ai-notes", label: "AI Notes" },
  { id: "admin", label: "Admin" },
];

type Draft = Partial<CommunityIntelligenceCmsRecord> & {
  prosText?: string;
  consText?: string;
  nearbySchoolsText?: string;
  nearbyHospitalsText?: string;
  nearbyRestaurantsText?: string;
  nearbySupermarketsText?: string;
  nearbyHotelsText?: string;
  nearbyShoppingText?: string;
};

function linesToPlaces(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, meta] = line.split("|").map((part) => part.trim());
      return meta ? { title, meta } : { title };
    });
}

function placesToLines(places: { title: string; meta?: string }[]) {
  return places
    .map((place) => (place.meta ? `${place.title} | ${place.meta}` : place.title))
    .join("\n");
}

function num(value: number | null | undefined) {
  return value === null || value === undefined ? "" : String(value);
}

function parseNum(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseIntField(value: string): number | null {
  const parsed = parseNum(value);
  if (parsed === null) return null;
  return Math.round(parsed);
}

function snapshotDraft(draft: Draft): string {
  return JSON.stringify(draft);
}

function buildDraftFromRecord(data: CommunityIntelligenceCmsRecord): Draft {
  const manualUnits = INTELLIGENCE_UNIT_CATEGORIES.map((unitType) => {
    const row = data.manual.unitTypes.find((item) => item.unitType === unitType);
    return {
      unitType,
      averageSalePriceAed: row?.averageSalePriceAed ?? null,
      averageRentAedYear: row?.averageRentAedYear ?? null,
      averagePricePerSqftAed: row?.averagePricePerSqftAed ?? null,
      isCalculated: false,
    };
  });

  return {
    communityName: data.communityName,
    overview: data.overview,
    investmentSummary: data.investmentSummary,
    bestFor: data.bestFor,
    marketNotes: data.marketNotes,
    averageSalePriceAed: data.manual.averageSalePriceAed,
    averageRentAedYear: data.manual.averageRentAedYear,
    averagePricePerSqftAed: data.manual.averagePricePerSqftAed,
    averageRoiPercent: data.manual.averageRoiPercent,
    capitalAppreciationPercent: data.capitalAppreciationPercent,
    rentalDemand: data.rentalDemand,
    occupancyRatePercent: data.occupancyRatePercent,
    luxuryScore: data.luxuryScore,
    familyScore: data.familyScore,
    investmentScore: data.investmentScore,
    lifestyleScore: data.lifestyleScore,
    walkability: data.walkability,
    beachAccess: data.beachAccess,
    shortTermRentalScore: data.shortTermRentalScore,
    longTermRentalScore: data.longTermRentalScore,
    hiddenMarketInsights: data.hiddenMarketInsights,
    futureDevelopments: data.futureDevelopments,
    thingsBuyersShouldKnow: data.thingsBuyersShouldKnow,
    thingsInvestorsShouldKnow: data.thingsInvestorsShouldKnow,
    unitTypes: manualUnits,
    prosText: (data.pros ?? []).join("\n"),
    consText: (data.cons ?? []).join("\n"),
    nearbySchoolsText: placesToLines(data.nearbySchools),
    nearbyHospitalsText: placesToLines(data.nearbyHospitals),
    nearbyRestaurantsText: placesToLines(data.nearbyRestaurants),
    nearbySupermarketsText: placesToLines(data.nearbySupermarkets),
    nearbyHotelsText: placesToLines(data.nearbyHotels),
    nearbyShoppingText: placesToLines(data.nearbyShopping),
  };
}

export function MarketIntelligenceCmsPanel() {
  const [communities, setCommunities] = useState<CommunityListItem[]>([]);
  const [communityQuery, setCommunityQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [record, setRecord] = useState<CommunityIntelligenceCmsRecord | null>(null);
  const [draft, setDraft] = useState<Draft>({});
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingRecord, setLoadingRecord] = useState(false);
  const [saving, setSaving] = useState(false);

  const isDirty = useMemo(
    () => snapshotDraft(draft) !== savedSnapshot,
    [draft, savedSnapshot]
  );

  const loadCommunities = useCallback(async () => {
    setLoadingList(true);
    try {
      const response = await fetch("/api/v1/admin/market-intelligence");
      if (response.status === 403) {
        toast.error("You are not authorized to manage market intelligence.");
        return;
      }
      if (!response.ok) {
        throw new Error("list failed");
      }
      const payload = await response.json();
      setCommunities(payload.data ?? []);
    } catch {
      toast.error("Failed to load communities.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  const applyRecordToForm = useCallback((data: CommunityIntelligenceCmsRecord) => {
    const nextDraft = buildDraftFromRecord(data);
    setRecord(data);
    setDraft(nextDraft);
    setSavedSnapshot(snapshotDraft(nextDraft));
  }, []);

  const loadRecord = useCallback(
    async (communityId: string) => {
      setLoadingRecord(true);
      try {
        const response = await fetch(
          `/api/v1/admin/market-intelligence/${communityId}`
        );
        if (response.status === 404) {
          toast.error("Community not found in the database.");
          setRecord(null);
          setDraft({});
          setSavedSnapshot("");
          return;
        }
        if (!response.ok) throw new Error("load failed");
        const payload = await response.json();
        applyRecordToForm(payload.data as CommunityIntelligenceCmsRecord);
      } catch {
        toast.error("Failed to load community intelligence profile.");
        setRecord(null);
        setDraft({});
        setSavedSnapshot("");
      } finally {
        setLoadingRecord(false);
      }
    },
    [applyRecordToForm]
  );

  useEffect(() => {
    void loadCommunities();
  }, [loadCommunities]);

  useEffect(() => {
    if (!selectedId && communities.length > 0) {
      setSelectedId(communities[0].id);
    }
  }, [communities, selectedId]);

  useEffect(() => {
    if (selectedId) void loadRecord(selectedId);
  }, [selectedId, loadRecord]);

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  const filteredCommunities = useMemo(() => {
    const query = communityQuery.trim().toLowerCase();
    if (!query) return communities;
    return communities.filter(
      (community) =>
        community.name.toLowerCase().includes(query) ||
        community.masterCommunityName.toLowerCase().includes(query) ||
        community.slug.toLowerCase().includes(query)
    );
  }, [communities, communityQuery]);

  const selectedCommunity = useMemo(
    () => communities.find((row) => row.id === selectedId) ?? null,
    [communities, selectedId]
  );

  function handleSelectCommunity(communityId: string) {
    if (communityId === selectedId) return;
    if (isDirty && !window.confirm(UNSAVED_MESSAGE)) return;
    setSelectedId(communityId);
  }

  function updateDraft(patch: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function updateUnitType(
    unitType: (typeof INTELLIGENCE_UNIT_CATEGORIES)[number],
    field: "averageSalePriceAed" | "averageRentAedYear" | "averagePricePerSqftAed",
    value: string
  ) {
    setDraft((current) => {
      const unitTypes = [...(current.unitTypes ?? [])];
      const index = unitTypes.findIndex((row) => row.unitType === unitType);
      const existing = index >= 0 ? unitTypes[index] : null;
      const next = {
        unitType,
        averageSalePriceAed: existing?.averageSalePriceAed ?? null,
        averageRentAedYear: existing?.averageRentAedYear ?? null,
        averagePricePerSqftAed: existing?.averagePricePerSqftAed ?? null,
        isCalculated: false,
      };
      next[field] = parseNum(value);
      if (index >= 0) unitTypes[index] = next;
      else unitTypes.push(next);
      return { ...current, unitTypes };
    });
  }

  async function saveProfile() {
    if (!selectedId) {
      toast.error("Select a community first.");
      return;
    }
    if (!draft.communityName?.trim()) {
      toast.error("Community name is required.");
      return;
    }

    if (!isDirty) {
      toast.info("No changes to save.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        communityName: draft.communityName.trim(),
        overview: draft.overview ?? null,
        investmentSummary: draft.investmentSummary ?? null,
        bestFor: draft.bestFor ?? null,
        pros: (draft.prosText ?? "")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        cons: (draft.consText ?? "")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        marketNotes: draft.marketNotes ?? null,
        averageSalePriceAed: draft.averageSalePriceAed ?? null,
        averageRentAedYear: draft.averageRentAedYear ?? null,
        averagePricePerSqftAed: draft.averagePricePerSqftAed ?? null,
        averageRoiPercent: draft.averageRoiPercent ?? null,
        capitalAppreciationPercent: draft.capitalAppreciationPercent ?? null,
        rentalDemand: draft.rentalDemand ?? null,
        occupancyRatePercent: draft.occupancyRatePercent ?? null,
        luxuryScore: draft.luxuryScore ?? null,
        familyScore: draft.familyScore ?? null,
        investmentScore: draft.investmentScore ?? null,
        lifestyleScore: draft.lifestyleScore ?? null,
        walkability: draft.walkability ?? null,
        beachAccess: draft.beachAccess ?? null,
        shortTermRentalScore: draft.shortTermRentalScore ?? null,
        longTermRentalScore: draft.longTermRentalScore ?? null,
        nearbySchools: linesToPlaces(draft.nearbySchoolsText ?? ""),
        nearbyHospitals: linesToPlaces(draft.nearbyHospitalsText ?? ""),
        nearbyRestaurants: linesToPlaces(draft.nearbyRestaurantsText ?? ""),
        nearbySupermarkets: linesToPlaces(draft.nearbySupermarketsText ?? ""),
        nearbyHotels: linesToPlaces(draft.nearbyHotelsText ?? ""),
        nearbyShopping: linesToPlaces(draft.nearbyShoppingText ?? ""),
        hiddenMarketInsights: draft.hiddenMarketInsights ?? null,
        futureDevelopments: draft.futureDevelopments ?? null,
        thingsBuyersShouldKnow: draft.thingsBuyersShouldKnow ?? null,
        thingsInvestorsShouldKnow: draft.thingsInvestorsShouldKnow ?? null,
        unitTypes: (draft.unitTypes ?? [])
          .filter(
            (row) =>
              row.averageSalePriceAed !== null ||
              row.averageRentAedYear !== null ||
              row.averagePricePerSqftAed !== null
          )
          .map((row) => ({
            unitType: row.unitType,
            averageSalePriceAed: row.averageSalePriceAed,
            averageRentAedYear: row.averageRentAedYear,
            averagePricePerSqftAed: row.averagePricePerSqftAed,
          })),
      };

      const response = await fetch(
        `/api/v1/admin/market-intelligence/${selectedId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        toast.error(errorBody?.error ?? "Unable to save market intelligence.");
        return;
      }

      const saved = await response.json();
      applyRecordToForm(saved.data as CommunityIntelligenceCmsRecord);
      toast.success("Market intelligence saved.");
      void loadCommunities();
    } catch {
      toast.error("Unable to save market intelligence.");
    } finally {
      setSaving(false);
    }
  }

  async function clearProfile() {
    if (!selectedId) return;
    if (isDirty && !window.confirm(UNSAVED_MESSAGE)) return;
    if (
      !window.confirm(
        "Delete the manual CMS profile for this community? Calculated listing fallbacks will remain."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/v1/admin/market-intelligence/${selectedId}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        toast.error(errorBody?.error ?? "Unable to delete profile.");
        return;
      }
      toast.success("Manual profile deleted. Calculated fallbacks remain.");
      await loadRecord(selectedId);
      void loadCommunities();
    } catch {
      toast.error("Unable to delete profile.");
    }
  }

  if (loadingList) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 py-12">
        <Loader2 className="size-4 animate-spin" />
        Loading communities…
      </div>
    );
  }

  if (communities.length === 0) {
    return (
      <div className="larssh-card rounded-2xl p-8 text-center">
        <p className="font-medium">No communities found in the database.</p>
        <p className="text-muted-foreground mt-2 text-sm">
          Import or sync communities first, then return to manage market
          intelligence profiles.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="larssh-card rounded-2xl p-4">
        <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
          Communities ({communities.length})
        </p>
        <div className="relative mb-3">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            className="pl-9"
            placeholder="Search communities…"
            value={communityQuery}
            onChange={(event) => setCommunityQuery(event.target.value)}
          />
        </div>
        <div className="max-h-[70vh] space-y-1 overflow-y-auto">
          {filteredCommunities.map((community) => (
            <button
              key={community.id}
              type="button"
              onClick={() => handleSelectCommunity(community.id)}
              className={cn(
                "hover:bg-accent w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                selectedId === community.id && "bg-gold-muted text-gold"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{community.name}</p>
                {community.hasCmsProfile ? (
                  <span className="bg-gold-muted text-gold shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase">
                    CMS
                  </span>
                ) : null}
              </div>
              <p className="text-muted-foreground text-xs">
                {community.masterCommunityName}
              </p>
            </button>
          ))}
          {filteredCommunities.length === 0 ? (
            <p className="text-muted-foreground px-2 py-4 text-xs">
              No communities match your search.
            </p>
          ) : null}
        </div>
      </aside>

      <div className="space-y-4">
        <div className="larssh-card flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
          <div>
            <h2 className="text-lg font-semibold">
              {selectedCommunity?.name ?? "Select a community"}
            </h2>
            <p className="text-muted-foreground text-xs">
              Currency: AED · Manual values override calculated listing benchmarks
              {isDirty ? " · Unsaved changes" : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void clearProfile()}
              disabled={!selectedId || saving || loadingRecord}
            >
              <Trash2 className="size-4" />
              Reset manual
            </Button>
            <Button
              size="sm"
              className="larssh-gold-btn"
              disabled={!selectedId || saving || loadingRecord}
              onClick={() => void saveProfile()}
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                activeTab === tab.id
                  ? "border-gold/30 bg-gold-muted text-gold"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loadingRecord ? (
          <div className="text-muted-foreground flex items-center gap-2 py-12">
            <Loader2 className="size-4 animate-spin" />
            Loading profile…
          </div>
        ) : (
          <div className="larssh-card space-y-6 rounded-2xl p-5 md:p-6">
            {activeTab === "general" ? (
              <GeneralTab draft={draft} updateDraft={updateDraft} />
            ) : null}
            {activeTab === "market" ? (
              <MarketTab draft={draft} record={record} updateDraft={updateDraft} />
            ) : null}
            {activeTab === "property-types" ? (
              <PropertyTypesTab
                draft={draft}
                record={record}
                updateUnitType={updateUnitType}
              />
            ) : null}
            {activeTab === "nearby" ? (
              <NearbyTab draft={draft} updateDraft={updateDraft} />
            ) : null}
            {activeTab === "ai-notes" ? (
              <AiNotesTab draft={draft} updateDraft={updateDraft} />
            ) : null}
            {activeTab === "admin" ? <AdminTab record={record} /> : null}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <Label className="larssh-label">{label}</Label>
      {multiline ? (
        <textarea
          className={TEXTAREA_CLASS}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <Input className="mt-2" value={value} onChange={(event) => onChange(event.target.value)} />
      )}
      {hint ? <p className="text-muted-foreground mt-1 text-xs">{hint}</p> : null}
    </div>
  );
}

function GeneralTab({
  draft,
  updateDraft,
}: {
  draft: Draft;
  updateDraft: (patch: Partial<Draft>) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field
        label="Community Name"
        value={draft.communityName ?? ""}
        onChange={(value) => updateDraft({ communityName: value })}
      />
      <Field
        label="Best For"
        value={draft.bestFor ?? ""}
        onChange={(value) => updateDraft({ bestFor: value || null })}
      />
      <div className="md:col-span-2">
        <Field
          label="Overview"
          value={draft.overview ?? ""}
          multiline
          onChange={(value) => updateDraft({ overview: value || null })}
        />
      </div>
      <div className="md:col-span-2">
        <Field
          label="Investment Summary"
          value={draft.investmentSummary ?? ""}
          multiline
          onChange={(value) => updateDraft({ investmentSummary: value || null })}
        />
      </div>
      <Field
        label="Pros (one per line)"
        value={draft.prosText ?? ""}
        multiline
        onChange={(value) => updateDraft({ prosText: value })}
      />
      <Field
        label="Cons (one per line)"
        value={draft.consText ?? ""}
        multiline
        onChange={(value) => updateDraft({ consText: value })}
      />
      <div className="md:col-span-2">
        <Field
          label="Market Notes"
          value={draft.marketNotes ?? ""}
          multiline
          onChange={(value) => updateDraft({ marketNotes: value || null })}
        />
      </div>
    </div>
  );
}

function MarketTab({
  draft,
  record,
  updateDraft,
}: {
  draft: Draft;
  record: CommunityIntelligenceCmsRecord | null;
  updateDraft: (patch: Partial<Draft>) => void;
}) {
  const sourceHint = (
    field: keyof CommunityIntelligenceCmsRecord["sources"],
    manualValue: number | null | undefined
  ) => {
    const source = record?.sources[field];
    const calculatedValue = record?.calculated[field];

    if (source === "manual" || manualValue !== null) {
      return "Manual CMS value";
    }

    if (calculatedValue !== null && calculatedValue !== undefined) {
      if (field === "averageRoiPercent") {
        return `Calculated from listings: ${calculatedValue}%`;
      }
      return `Calculated from listings: ${formatCurrency(calculatedValue, "AED")}${
        field === "averageRentAedYear" ? "/yr" : ""
      }`;
    }

    return "No value — calculated listing data will be used when available";
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <NumberField
        label="Average Sale Price (AED)"
        value={num(draft.averageSalePriceAed)}
        hint={sourceHint("averageSalePriceAed", draft.averageSalePriceAed)}
        onChange={(value) => updateDraft({ averageSalePriceAed: parseNum(value) })}
      />
      <NumberField
        label="Average Rent (AED/year)"
        value={num(draft.averageRentAedYear)}
        hint={sourceHint("averageRentAedYear", draft.averageRentAedYear)}
        onChange={(value) => updateDraft({ averageRentAedYear: parseNum(value) })}
      />
      <NumberField
        label="Average Price per Sqft (AED)"
        value={num(draft.averagePricePerSqftAed)}
        hint={sourceHint("averagePricePerSqftAed", draft.averagePricePerSqftAed)}
        onChange={(value) => updateDraft({ averagePricePerSqftAed: parseNum(value) })}
      />
      <NumberField
        label="Average ROI (%)"
        value={num(draft.averageRoiPercent)}
        hint={sourceHint("averageRoiPercent", draft.averageRoiPercent)}
        onChange={(value) => updateDraft({ averageRoiPercent: parseNum(value) })}
      />
      <NumberField
        label="Capital Appreciation (%)"
        value={num(draft.capitalAppreciationPercent)}
        onChange={(value) =>
          updateDraft({ capitalAppreciationPercent: parseNum(value) })
        }
      />
      <NumberField
        label="Occupancy Rate (%)"
        value={num(draft.occupancyRatePercent)}
        onChange={(value) => updateDraft({ occupancyRatePercent: parseNum(value) })}
      />
      <div>
        <Label className="larssh-label">Rental Demand</Label>
        <Select
          value={draft.rentalDemand ?? "none"}
          onValueChange={(value) =>
            updateDraft({
              rentalDemand:
                value === "none" ? null : (value as "LOW" | "MEDIUM" | "HIGH"),
            })
          }
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Rental demand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Not set</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <NumberField
        label="Luxury Score (1–10)"
        value={num(draft.luxuryScore)}
        onChange={(value) => updateDraft({ luxuryScore: parseIntField(value) })}
      />
      <NumberField
        label="Family Score (1–10)"
        value={num(draft.familyScore)}
        onChange={(value) => updateDraft({ familyScore: parseIntField(value) })}
      />
      <NumberField
        label="Investment Score (1–10)"
        value={num(draft.investmentScore)}
        onChange={(value) => updateDraft({ investmentScore: parseIntField(value) })}
      />
      <NumberField
        label="Lifestyle Score (1–10)"
        value={num(draft.lifestyleScore)}
        onChange={(value) => updateDraft({ lifestyleScore: parseIntField(value) })}
      />
      <Field
        label="Walkability"
        value={draft.walkability ?? ""}
        onChange={(value) => updateDraft({ walkability: value || null })}
      />
      <Field
        label="Beach Access"
        value={draft.beachAccess ?? ""}
        onChange={(value) => updateDraft({ beachAccess: value || null })}
      />
      <NumberField
        label="Short-Term Rental Score"
        value={num(draft.shortTermRentalScore)}
        onChange={(value) =>
          updateDraft({ shortTermRentalScore: parseIntField(value) })
        }
      />
      <NumberField
        label="Long-Term Rental Score"
        value={num(draft.longTermRentalScore)}
        onChange={(value) =>
          updateDraft({ longTermRentalScore: parseIntField(value) })
        }
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <Label className="larssh-label">{label}</Label>
      <Input
        className="mt-2"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? <p className="text-muted-foreground mt-1 text-xs">{hint}</p> : null}
    </div>
  );
}

function PropertyTypesTab({
  draft,
  record,
  updateUnitType,
}: {
  draft: Draft;
  record: CommunityIntelligenceCmsRecord | null;
  updateUnitType: (
    unitType: (typeof INTELLIGENCE_UNIT_CATEGORIES)[number],
    field: "averageSalePriceAed" | "averageRentAedYear" | "averagePricePerSqftAed",
    value: string
  ) => void;
}) {
  return (
    <div className="space-y-6">
      {INTELLIGENCE_UNIT_CATEGORIES.map((unitType) => {
        const draftRow = draft.unitTypes?.find((item) => item.unitType === unitType);
        const calculatedRow = record?.calculated.unitTypes.find(
          (item) => item.unitType === unitType
        );
        const hasManual = Boolean(
          draftRow &&
            (draftRow.averageSalePriceAed !== null ||
              draftRow.averageRentAedYear !== null ||
              draftRow.averagePricePerSqftAed !== null)
        );

        return (
          <section
            key={unitType}
            className="border-border rounded-xl border p-4"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-medium">{INTELLIGENCE_UNIT_LABELS[unitType]}</h3>
              {!hasManual && calculatedRow ? (
                <span className="text-muted-foreground text-xs">
                  Calculated fallback available
                </span>
              ) : null}
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <NumberField
                label="Average Sale Price (AED)"
                value={num(draftRow?.averageSalePriceAed)}
                hint={
                  calculatedRow?.averageSalePriceAed !== null &&
                  calculatedRow?.averageSalePriceAed !== undefined
                    ? `Calculated: ${formatCurrency(calculatedRow.averageSalePriceAed, "AED")}`
                    : undefined
                }
                onChange={(value) =>
                  updateUnitType(unitType, "averageSalePriceAed", value)
                }
              />
              <NumberField
                label="Average Rent (AED/year)"
                value={num(draftRow?.averageRentAedYear)}
                hint={
                  calculatedRow?.averageRentAedYear !== null &&
                  calculatedRow?.averageRentAedYear !== undefined
                    ? `Calculated: ${formatCurrency(calculatedRow.averageRentAedYear, "AED")}/yr`
                    : undefined
                }
                onChange={(value) =>
                  updateUnitType(unitType, "averageRentAedYear", value)
                }
              />
              <NumberField
                label="Average Price/Sqft (AED)"
                value={num(draftRow?.averagePricePerSqftAed)}
                hint={
                  calculatedRow?.averagePricePerSqftAed !== null &&
                  calculatedRow?.averagePricePerSqftAed !== undefined
                    ? `Calculated: ${formatCurrency(calculatedRow.averagePricePerSqftAed, "AED")}`
                    : undefined
                }
                onChange={(value) =>
                  updateUnitType(unitType, "averagePricePerSqftAed", value)
                }
              />
            </div>
          </section>
        );
      })}
    </div>
  );
}

function NearbyTab({
  draft,
  updateDraft,
}: {
  draft: Draft;
  updateDraft: (patch: Partial<Draft>) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field
        label="Schools (one per line, optional meta after |)"
        value={draft.nearbySchoolsText ?? ""}
        multiline
        onChange={(value) => updateDraft({ nearbySchoolsText: value })}
      />
      <Field
        label="Hospitals"
        value={draft.nearbyHospitalsText ?? ""}
        multiline
        onChange={(value) => updateDraft({ nearbyHospitalsText: value })}
      />
      <Field
        label="Restaurants"
        value={draft.nearbyRestaurantsText ?? ""}
        multiline
        onChange={(value) => updateDraft({ nearbyRestaurantsText: value })}
      />
      <Field
        label="Supermarkets"
        value={draft.nearbySupermarketsText ?? ""}
        multiline
        onChange={(value) => updateDraft({ nearbySupermarketsText: value })}
      />
      <Field
        label="Hotels"
        value={draft.nearbyHotelsText ?? ""}
        multiline
        onChange={(value) => updateDraft({ nearbyHotelsText: value })}
      />
      <Field
        label="Shopping"
        value={draft.nearbyShoppingText ?? ""}
        multiline
        onChange={(value) => updateDraft({ nearbyShoppingText: value })}
      />
    </div>
  );
}

function AiNotesTab({
  draft,
  updateDraft,
}: {
  draft: Draft;
  updateDraft: (patch: Partial<Draft>) => void;
}) {
  return (
    <div className="grid gap-4">
      <Field
        label="Hidden Market Insights"
        value={draft.hiddenMarketInsights ?? ""}
        multiline
        onChange={(value) => updateDraft({ hiddenMarketInsights: value || null })}
      />
      <Field
        label="Future Developments"
        value={draft.futureDevelopments ?? ""}
        multiline
        onChange={(value) => updateDraft({ futureDevelopments: value || null })}
      />
      <Field
        label="Things Buyers Should Know"
        value={draft.thingsBuyersShouldKnow ?? ""}
        multiline
        onChange={(value) => updateDraft({ thingsBuyersShouldKnow: value || null })}
      />
      <Field
        label="Things Investors Should Know"
        value={draft.thingsInvestorsShouldKnow ?? ""}
        multiline
        onChange={(value) => updateDraft({ thingsInvestorsShouldKnow: value || null })}
      />
    </div>
  );
}

function AdminTab({ record }: { record: CommunityIntelligenceCmsRecord | null }) {
  if (!record) return null;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="border-border rounded-xl border p-4">
        <p className="text-muted-foreground text-xs uppercase tracking-wide">Last Updated</p>
        <p className="mt-2 font-medium">
          {record.updatedAt ? new Date(record.updatedAt).toLocaleString() : "—"}
        </p>
      </div>
      <div className="border-border rounded-xl border p-4">
        <p className="text-muted-foreground text-xs uppercase tracking-wide">Updated By</p>
        <p className="mt-2 font-medium">{record.updatedByName ?? "—"}</p>
        <p className="text-muted-foreground text-sm">{record.updatedByEmail ?? ""}</p>
      </div>
    </div>
  );
}
