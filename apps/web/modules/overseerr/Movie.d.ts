export interface MovieResult {
  id: number;
  adult: boolean;
  budget: number;
  genres: Genre[];
  relatedVideos: RelatedVideo[];
  originalLanguage: string;
  originalTitle: string;
  popularity: number;
  productionCompanies: ProductionCompany[];
  productionCountries: ProductionCountry[];
  releaseDate: Date;
  releases: Releases;
  revenue: number;
  spokenLanguages: SpokenLanguage[];
  status: string;
  title: string;
  video: boolean;
  voteAverage: number;
  voteCount: number;
  backdropPath: string;
  homepage: string;
  imdbId: string;
  overview: string;
  posterPath: string;
  runtime: number;
  tagline: string;
  credits: Credits;
  collection: Collection;
  externalIds: ExternalIDS;
  mediaInfo: Media;
  watchProviders: WatchProvider[];
}

export interface Collection {
  id: number;
  name: string;
  posterPath: string;
  backdropPath: string;
}

export interface Credits {
  cast: Cast[];
  crew: Crew[];
}

export interface Cast {
  castId: number;
  character: string;
  creditId: string;
  id: number;
  name: string;
  order: number;
  gender: number;
  profilePath: null | string;
}

export interface Crew {
  creditId: string;
  department: Department;
  id: number;
  job: string;
  name: string;
  gender: number;
  profilePath: null | string;
}

export enum Department {
  Art = 'Art',
  Camera = 'Camera',
  CostumeMakeUp = 'Costume & Make-Up',
  Crew = 'Crew',
  Directing = 'Directing',
  Editing = 'Editing',
  Production = 'Production',
  Sound = 'Sound',
  VisualEffects = 'Visual Effects',
  Writing = 'Writing',
}

export interface ExternalIDS {
  facebookId: string;
  imdbId: string;
  instagramId: string;
  twitterId: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Request {
  id: number;
  status: number;
  createdAt: Date;
  updatedAt: Date;
  type: string;
  is4k: boolean;
  serverId: number;
  profileId: number;
  rootFolder: string;
  languageProfileId: null;
  tags: any[];
  media: Media;
  requestedBy: EdBy;
  modifiedBy: EdBy;
  seasons: any[];
  seasonCount: number;
}

export interface Media {
  downloadStatus: any[];
  downloadStatus4k: any[];
  id: number;
  mediaType: string;
  tmdbId: number;
  tvdbId: null;
  imdbId: null;
  status: number;
  status4k: number;
  createdAt: Date;
  updatedAt: Date;
  lastSeasonChange: Date;
  mediaAddedAt: Date;
  serviceId: number;
  serviceId4k: null;
  externalServiceId: number;
  externalServiceId4k: null;
  externalServiceSlug: string;
  externalServiceSlug4k: null;
  ratingKey: string;
  ratingKey4k: null;
  requests?: Request[];
  issues?: any[];
  seasons: any[];
  plexUrl: string;
  serviceUrl: string;
}

export interface EdBy {
  permissions: number;
  id: number;
  email: string;
  plexUsername: string;
  username: string;
  recoveryLinkExpirationDate: null;
  userType: number;
  avatar: string;
  movieQuotaLimit: null;
  movieQuotaDays: null;
  tvQuotaLimit: null;
  tvQuotaDays: null;
  createdAt: Date;
  updatedAt: Date;
  settings: Settings;
  requestCount: number;
  displayName: string;
}

export interface Settings {
  id: number;
  locale: string;
  region: string;
  originalLanguage: null;
  pgpKey: null;
  discordId: string;
  pushbulletAccessToken: null;
  pushoverApplicationToken: null;
  pushoverUserKey: null;
  telegramChatId: null;
  telegramSendSilently: null;
  notificationTypes: NotificationTypes;
}

export interface NotificationTypes {
  discord: number;
  email: number;
  webpush: number;
}

export interface ProductionCompany {
  id: number;
  name: string;
  originCountry?: string;
  logoPath: string;
  displayPriority?: number;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface RelatedVideo {
  site: string;
  key: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface Releases {
  results: Result[];
}

export interface Result {
  iso_3166_1: string;
  release_dates: ReleaseDate[];
}

export interface ReleaseDate {
  certification: string;
  iso_639_1: ISO639_1 | null;
  note: Note;
  release_date: Date;
  type: number;
}

export enum ISO639_1 {
  CS = 'cs',
  Empty = '',
}

export enum Note {
  Empty = '',
  HBOMax = 'HBO Max',
  LosAngelesCalifornia = 'Los Angeles, California',
  Starz = 'STARZ',
  The4KUHDBluRayDVD = '4K UHD, Blu-ray & DVD',
  TheMoreFunStuffVersion = 'The More Fun Stuff Version',
  Tvod = 'TVOD',
  VOD = 'VOD',
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface WatchProvider {
  iso_3166_1: string;
  link: string;
  buy: ProductionCompany[];
  flatrate: ProductionCompany[];
}
