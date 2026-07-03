export type MarketOverviewCard = {
  title: string;
  value: string;
  subtitle: string;
  trend: string;
};

export type ListingRow = {
  id: string;
  community: string;
  building: string;
  unit: string;
  type: "Rent" | "Sale";
  price: string;
  beds: number;
  sqft: number;
  agent: string;
  status: "Active" | "Pending" | "Draft";
};

export type UpdatedListing = {
  id: string;
  title: string;
  change: string;
  updatedAt: string;
};

export type ChartPoint = {
  label: string;
  value: number;
};

export type QuickAction = {
  label: string;
  description: string;
  icon: string;
};

export const marketOverview: MarketOverviewCard[] = [
  {
    title: "Avg. Asking Price",
    value: "$1.24M",
    subtitle: "Across active sale listings",
    trend: "+3.8% vs last month",
  },
  {
    title: "Avg. Days on Market",
    value: "32",
    subtitle: "Median time to offer",
    trend: "-4 days vs last month",
  },
  {
    title: "Occupancy Rate",
    value: "94.2%",
    subtitle: "Rental portfolio average",
    trend: "+1.1% vs last quarter",
  },
  {
    title: "Viewing Conversion",
    value: "18.6%",
    subtitle: "Viewings to qualified leads",
    trend: "+2.3% vs last month",
  },
];

export const recentListings: ListingRow[] = [
  {
    id: "1",
    community: "Sunset Harbor",
    building: "Harbor Tower One",
    unit: "1804",
    type: "Sale",
    price: "$1,850,000",
    beds: 3,
    sqft: 1450,
    agent: "Sarah Mitchell",
    status: "Active",
  },
  {
    id: "2",
    community: "Pacific Heights",
    building: "Pacific Tower A",
    unit: "1001",
    type: "Rent",
    price: "$3,900/mo",
    beds: 2,
    sqft: 1250,
    agent: "Elena Rodriguez",
    status: "Active",
  },
  {
    id: "3",
    community: "Lakeview Commons",
    building: "Commons North",
    unit: "1105",
    type: "Rent",
    price: "$2,800/mo",
    beds: 2,
    sqft: 1050,
    agent: "James Carter",
    status: "Pending",
  },
  {
    id: "4",
    community: "Sunset Harbor",
    building: "Marina Residences",
    unit: "1503",
    type: "Sale",
    price: "$3,200,000",
    beds: 4,
    sqft: 2100,
    agent: "Michael Brooks",
    status: "Active",
  },
  {
    id: "5",
    community: "Pacific Heights",
    building: "Pacific Tower B",
    unit: "2001",
    type: "Sale",
    price: "$2,750,000",
    beds: 3,
    sqft: 1900,
    agent: "Aisha Khan",
    status: "Draft",
  },
];

export const recentlyUpdated: UpdatedListing[] = [
  {
    id: "1",
    title: "Skyline Penthouse · Harbor Tower One",
    change: "Price reduced to $1.85M",
    updatedAt: "12 min ago",
  },
  {
    id: "2",
    title: "Garden View Flat · Commons North",
    change: "Status changed to Pending",
    updatedAt: "45 min ago",
  },
  {
    id: "3",
    title: "Coastal Three Bed · Pacific Tower A",
    change: "New photos uploaded",
    updatedAt: "2 hours ago",
  },
  {
    id: "4",
    title: "Marina Residence · Marina Residences",
    change: "Agent reassigned to Sarah Mitchell",
    updatedAt: "5 hours ago",
  },
  {
    id: "5",
    title: "Courtyard One Bed · Pacific Tower B",
    change: "Rent increased to $2,500/mo",
    updatedAt: "Yesterday",
  },
];

export const listingTrendData: ChartPoint[] = [
  { label: "Jan", value: 186 },
  { label: "Feb", value: 192 },
  { label: "Mar", value: 205 },
  { label: "Apr", value: 218 },
  { label: "May", value: 231 },
  { label: "Jun", value: 248 },
];

export const marketMixData: ChartPoint[] = [
  { label: "Rentals", value: 142 },
  { label: "Sales", value: 106 },
];

export const priceIndexData: ChartPoint[] = [
  { label: "W1", value: 1.12 },
  { label: "W2", value: 1.15 },
  { label: "W3", value: 1.18 },
  { label: "W4", value: 1.21 },
  { label: "W5", value: 1.24 },
];

export const quickActions: QuickAction[] = [
  {
    label: "New Listing",
    description: "Publish a property to market",
    icon: "plus",
  },
  {
    label: "Schedule Viewing",
    description: "Book a client walkthrough",
    icon: "calendar",
  },
  {
    label: "Market Report",
    description: "Export community insights",
    icon: "file",
  },
  {
    label: "Assign Agent",
    description: "Route leads to your team",
    icon: "users",
  },
];

export const mockUser = {
  name: "Allaith Aljariri",
  role: "Founder & CEO",
  initials: "AA",
};
