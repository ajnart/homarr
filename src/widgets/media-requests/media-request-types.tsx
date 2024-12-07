export type MediaRequest = {
  appId: string;
  id: number;
  createdAt: string;
  rootFolder: string;
  type: 'movie' | 'tv';
  name: string;
  userName: string;
  userProfilePicture: string;
  fallbackUserProfilePicture: string;
  userLink: string;
  userRequestCount: number;
  airDate?: string;
  status: MediaRequestStatus;
  availability: MediaRequestAvailability;
  backdropPath: string;
  posterPath: string;
  href: string;
};

export type Users = {
  app: string;
  id: number;
  userName: string;
  userProfilePicture: string;
  fallbackUserProfilePicture: string;
  userLink: string;
  userRequestCount: number;
};

export enum MediaRequestStatus {
  PendingApproval = 1,
  Approved = 2,
  Declined = 3,
}

export enum MediaRequestAvailability {
  Unknown = 1,
  Pending = 2,
  Processing = 3,
  Partial = 4,
  Available = 5,
}
