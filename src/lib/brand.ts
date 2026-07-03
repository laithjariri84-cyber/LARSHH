export const LARSSH_BRAND = {
  name: "LARSSH",
  tagline: "AI Real Estate Intelligence Platform",
  shortTagline: "AI Real Estate Intelligence",
  gold: "#D4AF37",
} as const;

export const PROPERTY_IMAGE_LIMITS = {
  maxImages: 50,
  maxFileSizeBytes: 20 * 1024 * 1024,
  allowedMimeTypes: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ] as const,
  allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"] as const,
  storageBucket: "property-images",
} as const;
