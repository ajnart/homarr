import type { MediaInformation, MediaRequest, RequestStats, RequestUser } from "./media-request-types";

export interface IMediaRequestIntegration {
  getSeriesInformationAsync(mediaType: "movie" | "tv", id: number): Promise<MediaInformation>;
  requestMediaAsync(mediaType: "movie" | "tv", id: number, seasons?: number[]): Promise<void>;
  getRequestsAsync(): Promise<MediaRequest[]>;
  getStatsAsync(): Promise<RequestStats>;
  getUsersAsync(): Promise<RequestUser[]>;
  approveRequestAsync(requestId: number): Promise<void>;
  declineRequestAsync(requestId: number): Promise<void>;
}
