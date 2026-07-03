import { masterCommunities } from "@/features/communities/data/master-communities";

export const MASTER_COMMUNITY_NAMES = masterCommunities.map(
  (master) => master.name
) as [
  "Al Hamra Village",
  "Al Marjan Island",
  "Mina Al Arab",
  "Hayat Island",
  "RAK Central",
];

export const PROPERTY_TYPES = [
  "Studio",
  "1 Bedroom",
  "2 Bedroom",
  "3 Bedroom",
  "Villa",
  "Townhouse",
  "Penthouse",
] as const;

export const BEDROOM_OPTIONS = [
  "Studio",
  "1",
  "2",
  "3",
  "4",
  "5",
] as const;

export const FURNISHING_OPTIONS = [
  "Furnished",
  "Unfurnished",
  "Partially Furnished",
] as const;

export const VIEW_OPTIONS = [
  "Sea View",
  "Golf View",
  "Marina View",
  "Community View",
  "City View",
  "Garden View",
] as const;

export function getCommunitiesForMaster(masterName: string): string[] {
  const master = masterCommunities.find((item) => item.name === masterName);
  if (!master) return [];

  if (master.projects.length > 0) {
    return master.projects.map((project) => project.name);
  }

  return [`${master.name} Phase 1`, `${master.name} Central`, `${master.name} Waterfront`];
}

export function getBuildingsForCommunity(community: string): string[] {
  return [
    `${community} Tower A`,
    `${community} Tower B`,
    `${community} Podium`,
    `${community} Phase 1`,
  ];
}

export const FILTER_STEPS = [
  { key: "masterCommunity", label: "Master Community" },
  { key: "community", label: "Community" },
  { key: "building", label: "Building" },
  { key: "propertyType", label: "Property Type" },
  { key: "bedrooms", label: "Bedrooms" },
  { key: "furnishing", label: "Furnishing" },
  { key: "view", label: "View" },
] as const;
