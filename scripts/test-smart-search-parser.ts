import assert from "node:assert/strict";

import { ListingType } from "@prisma/client";

import { parseSmartSearchQuery } from "../src/features/search/smart-search/parse-smart-search";

const context = {
  communities: [
    { value: "community-al-hamra", label: "Al Hamra Village" },
    { value: "community-marina", label: "Dubai Marina" },
  ],
  buildings: [
    { value: "building-royal-breeze", label: "Royal Breeze Residences" },
    { value: "building-pacific", label: "Pacific Residences" },
  ],
};

type Case = {
  query: string;
  assert: (result: ReturnType<typeof parseSmartSearchQuery>) => void;
};

const cases: Case[] = [
  {
    query: "sale",
    assert: (r) => {
      assert.equal(r.filters.listingType, ListingType.SALE);
      assert.ok(r.detected.some((d) => d.chip === "SALE"));
    },
  },
  {
    query: "SALE",
    assert: (r) => assert.equal(r.filters.listingType, ListingType.SALE),
  },
  {
    query: "for sale",
    assert: (r) => assert.equal(r.filters.listingType, ListingType.SALE),
  },
  {
    query: "buy",
    assert: (r) => assert.equal(r.filters.listingType, ListingType.SALE),
  },
  {
    query: "buying",
    assert: (r) => assert.equal(r.filters.listingType, ListingType.SALE),
  },
  {
    query: "purchase",
    assert: (r) => assert.equal(r.filters.listingType, ListingType.SALE),
  },
  {
    query: "rent",
    assert: (r) => assert.equal(r.filters.listingType, ListingType.RENT),
  },
  {
    query: "for rent",
    assert: (r) => assert.equal(r.filters.listingType, ListingType.RENT),
  },
  {
    query: "rental",
    assert: (r) => assert.equal(r.filters.listingType, ListingType.RENT),
  },
  {
    query: "lease",
    assert: (r) => assert.equal(r.filters.listingType, ListingType.RENT),
  },
  {
    query: "leasing",
    assert: (r) => assert.equal(r.filters.listingType, ListingType.RENT),
  },
  {
    query: "2 bedroom for sale",
    assert: (r) => {
      assert.equal(r.filters.bedrooms, 2);
      assert.equal(r.filters.listingType, ListingType.SALE);
    },
  },
  {
    query: "studio for rent",
    assert: (r) => {
      assert.equal(r.filters.bedrooms, 0);
      assert.equal(r.filters.listingType, ListingType.RENT);
      assert.ok(r.detected.some((d) => d.chip === "Studio"));
    },
  },
  {
    query: "sea view apartment for sale",
    assert: (r) => {
      assert.equal(r.filters.view, "SEA");
      assert.equal(r.filters.propertyType, "APARTMENT");
      assert.equal(r.filters.listingType, ListingType.SALE);
    },
  },
  {
    query: "pacific 1 bedroom rent",
    assert: (r) => {
      assert.equal(r.filters.bedrooms, 1);
      assert.equal(r.filters.listingType, ListingType.RENT);
      assert.equal(r.filters.buildingId, "building-pacific");
    },
  },
  {
    query: "royal breeze studio for sale",
    assert: (r) => {
      assert.equal(r.filters.bedrooms, 0);
      assert.equal(r.filters.listingType, ListingType.SALE);
      assert.equal(r.filters.buildingId, "building-royal-breeze");
      assert.ok(r.detected.some((d) => d.chip === "SALE"));
      assert.ok(r.detected.some((d) => d.chip === "Studio"));
    },
  },
  {
    query: "under 1 million",
    assert: (r) => assert.equal(r.filters.maxPrice, 1_000_000),
  },
  {
    query: "below 900k",
    assert: (r) => assert.equal(r.filters.maxPrice, 900_000),
  },
  {
    query: "under 850000",
    assert: (r) => assert.equal(r.filters.maxPrice, 850_000),
  },
  {
    query: "2 bedroom sea view under 1.3m for sale",
    assert: (r) => {
      assert.equal(r.filters.bedrooms, 2);
      assert.equal(r.filters.view, "SEA");
      assert.equal(r.filters.maxPrice, 1_300_000);
      assert.equal(r.filters.listingType, ListingType.SALE);
      assert.ok(r.detected.some((d) => d.chip === "AED ≤ 1,300,000"));
    },
  },
  {
    query: "Al Hamra villas for sale under 700000",
    assert: (r) => {
      assert.equal(r.filters.propertyType, "VILLA");
      assert.equal(r.filters.listingType, ListingType.SALE);
      assert.equal(r.filters.maxPrice, 700_000);
      assert.equal(r.filters.communityId, "community-al-hamra");
    },
  },
  {
    query: "under 1200 AED/sqft",
    assert: (r) => assert.equal(r.filters.maxPricePerSqft, 1200),
  },
  {
    query: "below 1000 per sqft",
    assert: (r) => assert.equal(r.filters.maxPricePerSqft, 1000),
  },
  {
    query: "less than 950 sqft price",
    assert: (r) => assert.equal(r.filters.maxPricePerSqft, 950),
  },
  {
    query: "over 1400 AED/sqft",
    assert: (r) => assert.equal(r.filters.minPricePerSqft, 1400),
  },
  {
    query: "above 1000 sqft",
    assert: (r) => assert.equal(r.filters.minSize, 1000),
  },
  {
    query: "below 600 sqft",
    assert: (r) => assert.equal(r.filters.maxSize, 600),
  },
  {
    query: "bigger than 1500 sqft",
    assert: (r) => assert.equal(r.filters.minSize, 1500),
  },
  {
    query: "between 800 and 1200 sqft",
    assert: (r) => {
      assert.equal(r.filters.minSize, 800);
      assert.equal(r.filters.maxSize, 1200);
    },
  },
  {
    query: "ROI above 7%",
    assert: (r) => {
      assert.equal(r.filters.minRoi, 7);
      assert.ok(r.detected.some((d) => d.chip === "ROI ≥ 7%"));
    },
  },
  {
    query: "yield above 8%",
    assert: (r) => assert.equal(r.filters.minRoi, 8),
  },
  {
    query: "highest ROI",
    assert: (r) => assert.equal(r.sort, "roi_desc"),
  },
  {
    query: "between 700k and 900k",
    assert: (r) => {
      assert.equal(r.filters.minPrice, 700_000);
      assert.equal(r.filters.maxPrice, 900_000);
    },
  },
  {
    query: "above 2 million",
    assert: (r) => assert.equal(r.filters.minPrice, 2_000_000),
  },
  {
    query: "2 bedroom for sale under 1.3 million below 1200 AED per sqft",
    assert: (r) => {
      assert.equal(r.filters.bedrooms, 2);
      assert.equal(r.filters.listingType, ListingType.SALE);
      assert.equal(r.filters.maxPrice, 1_300_000);
      assert.equal(r.filters.maxPricePerSqft, 1200);
    },
  },
  {
    query: "Sea view apartment under 1000 AED per sqft",
    assert: (r) => {
      assert.equal(r.filters.view, "SEA");
      assert.equal(r.filters.propertyType, "APARTMENT");
      assert.equal(r.filters.maxPricePerSqft, 1000);
    },
  },
  {
    query: "Studio for rent under 35k",
    assert: (r) => {
      assert.equal(r.filters.bedrooms, 0);
      assert.equal(r.filters.listingType, ListingType.RENT);
      assert.equal(r.filters.maxPrice, 35_000);
    },
  },
  {
    query: "lowest price per sqft",
    assert: (r) => assert.equal(r.sort, "price_sqft_asc"),
  },
  {
    query: "best value",
    assert: (r) => assert.equal(r.sort, "best_value"),
  },
  {
    query: "luxury",
    assert: (r) => assert.equal(r.sort, "luxury"),
  },
];

let passed = 0;
for (const testCase of cases) {
  const result = parseSmartSearchQuery(testCase.query, context);
  testCase.assert(result);
  passed += 1;
}

console.log(`Smart search parser: ${passed}/${cases.length} cases passed.`);
