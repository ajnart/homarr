export const sectionKinds = ["category", "empty", "dynamic"] as const;
export type SectionKind = (typeof sectionKinds)[number];
