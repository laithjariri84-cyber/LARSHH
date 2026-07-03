/** PF Expert CSV column aliases (case/spacing insensitive). */
export const PF_EXPERT_COLUMNS = {
  reference: ["reference", "ref", "listing reference", "property reference"],
  listingState: ["listing state", "state", "listing status", "status"],
  propertyType: ["property type", "type"],
  rentSale: ["rent sale", "rent / sale", "purpose", "listing purpose", "category"],
  price: ["price", "asking price", "list price", "amount"],
  bedrooms: ["bedrooms", "beds", "bedroom"],
  bathrooms: ["bathrooms", "baths", "bathroom"],
  size: ["size", "area", "built up area", "sqft", "square feet", "square feet sqft"],
  location: ["location", "full location", "address"],
  country: ["country"],
  emirate: ["emirate", "city", "state"],
  masterCommunity: ["master community", "master development", "master project"],
  community: ["community", "sub community", "subcommunity", "project"],
  building: ["building", "tower", "block"],
  agent: ["agent", "assigned agent", "listing agent", "agent name"],
  qualityScore: ["quality score", "listing quality", "quality", "score"],
  currency: ["currency"],
} as const;

export type PfExpertColumnKey = keyof typeof PF_EXPERT_COLUMNS;
