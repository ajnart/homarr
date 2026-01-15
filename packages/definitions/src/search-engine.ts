export const searchEngineTypes = ["generic", "fromIntegration"] as const;
export type SearchEngineType = (typeof searchEngineTypes)[number];
