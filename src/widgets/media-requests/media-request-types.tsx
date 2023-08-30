export type MediaRequest = {
  appId: string;
  id: number;
  createdAt: string;
  rootFolder: string;
  type: 'movie' | 'tv';
  name: string;
  userName: string;
  userProfilePicture: string;
  userLink: string;
  userRequestCount: number;
  airDate?: string;
  status: MediaRequestStatus;
  backdropPath: string;
  posterPath: string;
  href: string;
};

export type Users = {
  app: string;
  id: number;
  userName: string;
  userProfilePicture: string;
  userLink: string;
  userRequestCount: number;
};

export enum MediaRequestStatus {
  PendingApproval = 1,
  Approved = 2,
  Declined = 3,
}
