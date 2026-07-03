"use client";

import { useMemo, useState } from "react";

import { getPortfolioStats } from "../data/master-communities";
import { searchCommunities } from "../lib/community-registry";
import { CommunitiesHeader } from "./communities-header";
import { MasterCommunityCard } from "./master-community-card";

export function CommunitiesExperience() {
  const [query, setQuery] = useState("");
  const stats = getPortfolioStats();

  const filteredMasters = useMemo(
    () => searchCommunities(query),
    [query]
  );

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      <CommunitiesHeader
        query={query}
        onQueryChange={setQuery}
        masterCount={stats.masterCount}
        projectCount={stats.projectCount}
      />

      {filteredMasters.length > 0 ? (
        <div className="space-y-5">
          {filteredMasters.map((master, index) => (
            <MasterCommunityCard
              key={master.id}
              master={master}
              index={index}
              defaultExpanded={index === 0 && !query}
            />
          ))}
        </div>
      ) : (
        <div className="paragon-card rounded-2xl px-6 py-16 text-center">
          <p className="text-lg font-semibold">No communities match your search</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Try a different master community or residential project name.
          </p>
        </div>
      )}
    </div>
  );
}
