import { objectKeys } from "@homarr/common";

interface SerieSeason {
  id: number;
  seasonNumber: number;
  name: string;
  episodeCount: number;
}

interface SeriesInformation {
  id: number;
  overview: string;
  seasons: SerieSeason[];
  posterPath: string;
}

interface MovieInformation {
  id: number;
  overview: string;
  posterPath: string;
}

export type MediaInformation = SeriesInformation | MovieInformation;

export interface MediaRequest {
  id: number;
  name: string;
  type: "movie" | "tv";
  backdropImageUrl: string;
  posterImagePath: string;
  href: string;
  createdAt: Date;
  airDate?: Date;
  status: MediaRequestStatus;
  availability: MediaAvailability;
  requestedBy?: Omit<RequestUser, "requestCount">;
}

export const mediaAvailabilityConfiguration = {
  available: {
    color: "green",
  },
  partiallyAvailable: {
    color: "yellow",
  },
  processing: {
    color: "blue",
  },
  requested: {
    color: "violet",
  },
  pending: {
    color: "violet",
  },
  unknown: {
    color: "orange",
  },
  deleted: {
    color: "red",
  },
  blacklisted: {
    color: "gray",
  },
} satisfies Record<string, { color: string }>;

export const mediaAvailabilities = objectKeys(mediaAvailabilityConfiguration);

export type MediaAvailability = (typeof mediaAvailabilities)[number];

export const mediaRequestStatusConfiguration = {
  pending: {
    color: "blue",
    position: 1,
  },
  approved: {
    color: "green",
    position: 2,
  },
  declined: {
    color: "red",
    position: 3,
  },
  failed: {
    color: "red",
    position: 4,
  },
  completed: {
    color: "green",
    position: 5,
  },
} satisfies Record<string, { color: string; position: number }>;

export const mediaRequestStatuses = objectKeys(mediaRequestStatusConfiguration);

export type MediaRequestStatus = (typeof mediaRequestStatuses)[number];

export interface MediaRequestList {
  integration: {
    id: string;
  };
  medias: MediaRequest[];
}

export interface RequestStats {
  total: number;
  movie: number;
  tv: number;
  pending: number;
  approved: number;
  declined: number;
  processing: number;
  available: number;
}

export interface RequestUser {
  id: number;
  displayName: string;
  avatar: string;
  requestCount: number;
  link: string;
}

export interface MediaRequestStats {
  stats: RequestStats;
  users: RequestUser[];
}

// https://github.com/fallenbagel/jellyseerr/blob/0fd03f38480f853e7015ad9229ed98160e37602e/server/constants/media.ts#L1
export enum UpstreamMediaRequestStatus {
  PendingApproval = 1,
  Approved = 2,
  Declined = 3,
  Failed = 4,
  Completed = 5,
}

// https://github.com/fallenbagel/jellyseerr/blob/0fd03f38480f853e7015ad9229ed98160e37602e/server/constants/media.ts#L14
export enum UpstreamMediaAvailability {
  Unknown = 1,
  Pending = 2,
  Processing = 3,
  PartiallyAvailable = 4,
  Available = 5,
  JellyseerrBlacklistedOrOverseerrDeleted = 6,
  JellyseerrDeleted = 7,
}
