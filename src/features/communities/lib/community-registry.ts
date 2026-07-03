import { masterCommunities } from "../data/master-communities";
import type { MasterCommunity, ResidentialProject } from "../types";

export function getMasterCommunities(): MasterCommunity[] {
  return masterCommunities;
}

export function getMasterCommunityBySlug(
  slug: string
): MasterCommunity | undefined {
  return masterCommunities.find((master) => master.slug === slug);
}

export function getProjectBySlugs(
  masterSlug: string,
  projectSlug: string
): { master: MasterCommunity; project: ResidentialProject } | undefined {
  const master = getMasterCommunityBySlug(masterSlug);
  if (!master) return undefined;

  const project = master.projects.find((item) => item.slug === projectSlug);
  if (!project) return undefined;

  return { master, project };
}

export function getAllProjectRoutes(): Array<{
  masterSlug: string;
  projectSlug: string;
}> {
  return masterCommunities.flatMap((master) =>
    master.projects.map((project) => ({
      masterSlug: master.slug,
      projectSlug: project.slug,
    }))
  );
}

export function searchCommunities(query: string): MasterCommunity[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return masterCommunities;

  return masterCommunities.filter((master) => {
    const masterMatch =
      master.name.toLowerCase().includes(normalized) ||
      master.region.toLowerCase().includes(normalized) ||
      master.description.toLowerCase().includes(normalized);

    const projectMatch = master.projects.some(
      (project) =>
        project.name.toLowerCase().includes(normalized) ||
        project.tagline.toLowerCase().includes(normalized)
    );

    return masterMatch || projectMatch;
  });
}
