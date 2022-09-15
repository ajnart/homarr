export interface TvShowResult {
  createdBy: CreatedBy[];
  episodeRunTime: number[];
  firstAirDate: Date;
  genres: Genre[];
  relatedVideos: RelatedVideo[];
  homepage: string;
  id: number;
  inProduction: boolean;
  languages: string[];
  lastAirDate: Date;
  name: string;
  networks: Network[];
  numberOfEpisodes: number;
  numberOfSeasons: number;
  originCountry: string[];
  originalLanguage: string;
  originalName: string;
  tagline: string;
  overview: string;
  popularity: number;
  productionCompanies: Network[];
  productionCountries: ProductionCountry[];
  contentRatings: ContentRatings;
  spokenLanguages: SpokenLanguage[];
  seasons: TvShowResultSeason[];
  status: string;
  type: string;
  voteAverage: number;
  voteCount: number;
  backdropPath: string;
  lastEpisodeToAir: LastEpisodeToAir;
  posterPath: string;
  credits: Credits;
  externalIds: ExternalIDS;
  keywords: Genre[];
  mediaInfo: Media;
  watchProviders: WatchProvider[];
}

export interface ContentRatings {
  results: Result[];
}

export interface Result {
  iso_3166_1: string;
  rating: string;
}

export interface CreatedBy {
  id: number;
  credit_id: string;
  name: string;
  gender: number;
  profile_path: string;
}

export interface Credits {
  cast: Cast[];
  crew: Crew[];
}

export interface Cast {
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
  department: string;
  id: number;
  job: string;
  name: string;
  gender: number;
  profilePath: string;
}

export interface ExternalIDS {
  facebookId: string;
  freebaseId: null;
  freebaseMid: string;
  imdbId: string;
  instagramId: string;
  tvdbId: number;
  tvrageId: number;
  twitterId: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface LastEpisodeToAir {
  id: number;
  airDate: Date;
  episodeNumber: number;
  name: string;
  overview: string;
  productionCode: string;
  seasonNumber: number;
  showId: number;
  voteAverage: number;
  stillPath: string;
}

export interface Request {
  id: number;
  status: number;
  createdAt: Date;
  updatedAt: Date;
  type: Type;
  is4k: boolean;
  serverId: null;
  profileId: null;
  rootFolder: null;
  languageProfileId: null;
  tags: null;
  media: Media;
  requestedBy: EdBy;
  modifiedBy: EdBy;
  seasons: MediaInfoSeason[];
  seasonCount: number;
}

export interface Media {
  downloadStatus: DownloadStatus[];
  downloadStatus4k: any[];
  id: number;
  mediaType: Type;
  tmdbId: number;
  tvdbId: number;
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
  seasons: MediaInfoSeason[];
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

export interface MediaInfoSeason {
  id: number;
  seasonNumber: number;
  status: number;
  status4k?: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum Type {
  Tv = 'tv',
}

export interface DownloadStatus {
  externalId: number;
  estimatedCompletionTime: Date;
  mediaType: Type;
  size: number;
  sizeLeft: number;
  status: Status;
  timeLeft: string;
  title: string;
}

export enum Status {
  Completed = 'completed',
  Downloading = 'downloading',
}

export interface Network {
  id: number;
  name: Name;
  originCountry?: string;
  logoPath: LogoPath | null;
  displayPriority?: number;
}

export enum LogoPath {
  HbifXPpM55B1FL5WPo7T72VzN78PNG = '/hbifXPpM55B1fL5wPo7t72vzN78.png',
  KhiCshsZBdtUUYOr4VLoCtuqCEqPNG = '/khiCshsZBdtUUYOr4VLoCtuqCEq.png',
  O9ExgOSLF3OTwR6T3DJOuwOKJgqJpg = '/o9ExgOSLF3OTwR6T3DJOuwOKJgq.jpg',
  PEURlLlr8JggOwK53FJ5WdQl05YJpg = '/peURlLlr8jggOwK53fJ5wdQl05y.jpg',
  T2YyOv40HZeVlLjYsCSPHnWLk4WJpg = '/t2yyOv40HZeVlLjYsCsPHnWLk4W.jpg',
  TBEdFQDwx5LEVr8WpSEXQSIirVqJpg = '/tbEdFQDwx5LEVr8WpSeXQSIirVq.jpg',
  The5NyLm42TmCqCMOZFvH4FcoSNKEWJpg = '/5NyLm42TmCqCMOZFvH4fcoSNKEW.jpg',
  WwemzKWzjKYJFfCeiB57Q3R4BcmPNG = '/wwemzKWzjKYJFfCeiB57q3r4Bcm.png',
}

export enum Name {
  AmazonVideo = 'Amazon Video',
  AppleITunes = 'Apple iTunes',
  Channel4 = 'Channel 4',
  GooglePlayMovies = 'Google Play Movies',
  HouseOfTomorrow = 'House of Tomorrow',
  Ivi = 'Ivi',
  Netflix = 'Netflix',
  Zeppotron = 'Zeppotron',
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

export interface TvShowResultSeason {
  airDate: Date;
  episodeCount: number;
  id: number;
  name: string;
  overview: string;
  seasonNumber: number;
  posterPath: string;
}

export interface SpokenLanguage {
  englishName: string;
  iso_639_1: string;
  name: string;
}

export interface WatchProvider {
  iso_3166_1: string;
  link: string;
  buy: Network[];
  flatrate: Network[];
}
