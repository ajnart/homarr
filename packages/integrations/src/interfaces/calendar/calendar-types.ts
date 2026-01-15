export const radarrReleaseTypes = ["inCinemas", "digitalRelease", "physicalRelease"] as const;
export type RadarrReleaseType = (typeof radarrReleaseTypes)[number];

export interface RadarrMetadata {
  type: "radarr";
  releaseType: RadarrReleaseType;
}

export type CalendarMetadata = RadarrMetadata;

export interface CalendarLink {
  name: string;
  isDark: boolean;
  href: string;
  color?: string;
  logo?: string;
}

export interface CalendarImageBadge {
  content: string;
  color: string;
}

export interface CalendarImage {
  src: string;
  badge?: CalendarImageBadge;
  aspectRatio?: { width: number; height: number };
}

export interface CalendarEvent {
  title: string;
  subTitle: string | null;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  image: CalendarImage | null;
  location: string | null;
  metadata?: CalendarMetadata;
  indicatorColor: string;
  links: CalendarLink[];
}
