export type QuickAction = {
  label: string;
  description: string;
  icon: string;
};

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
