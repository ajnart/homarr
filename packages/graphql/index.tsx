/* eslint-disable */
/* AUTOMATICALLY GENERATED FILE. DO NOT MODIFY. */
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: Date;
};

export type CalendarConfig = {
  __typename?: 'CalendarConfig';
  enabled: Scalars['Boolean'];
  title?: Maybe<Scalars['String']>;
};

export type CalendarItem = MovieCalendarItem | TvCalendarItem;

export type Config = {
  __typename?: 'Config';
  modules: Modules;
  name: Scalars['String'];
  services: Array<Service>;
  settings: Settings;
};

export enum DockerAction {
  Remove = 'Remove',
  Restart = 'Restart',
  Start = 'Start',
  Stop = 'Stop'
}

export type DockerConfig = {
  __typename?: 'DockerConfig';
  enabled: Scalars['Boolean'];
  title?: Maybe<Scalars['String']>;
};

export type DockerContainer = {
  __typename?: 'DockerContainer';
  id: Scalars['String'];
  image: Scalars['String'];
  name: Scalars['String'];
  ports: Array<DockerPort>;
  status: DockerStatus;
};

export type DockerPort = {
  __typename?: 'DockerPort';
  private: Scalars['Float'];
  public: Scalars['Float'];
};

export enum DockerStatus {
  Created = 'Created',
  Exited = 'Exited',
  Running = 'Running',
  Unknown = 'Unknown'
}

export type Modules = {
  __typename?: 'Modules';
  calendar?: Maybe<CalendarConfig>;
  docker?: Maybe<DockerConfig>;
  usenet?: Maybe<UsenetConfig>;
};

export type MovieCalendarItem = {
  __typename?: 'MovieCalendarItem';
  digitalDate: Scalars['DateTime'];
  genres: Array<Scalars['String']>;
  imdbId: Scalars['String'];
  inCinemasDate: Scalars['DateTime'];
  movieTitle: Scalars['String'];
  overview: Scalars['String'];
  poster: Scalars['String'];
  voteAverage?: Maybe<Scalars['Float']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  pauseUsenetQueue: UsenetInfo;
  resumeUsenetQueue: UsenetInfo;
  updateConfig: Config;
  updateContainers: Array<DockerContainer>;
};


export type MutationPauseUsenetQueueArgs = {
  serviceId: Scalars['String'];
};


export type MutationResumeUsenetQueueArgs = {
  serviceId: Scalars['String'];
};


export type MutationUpdateConfigArgs = {
  body: Scalars['String'];
  configName: Scalars['String'];
};


export type MutationUpdateContainersArgs = {
  action: DockerAction;
  ids: Array<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  calendar: Array<CalendarItem>;
  config: Config;
  configs: Array<Config>;
  containers: Array<DockerContainer>;
  usenetHistory: UsenetHistory;
  usenetInfo: UsenetInfo;
  usenetQueue: UsenetQueue;
};


export type QueryCalendarArgs = {
  endDate: Scalars['DateTime'];
  startDate: Scalars['DateTime'];
};


export type QueryConfigArgs = {
  configName: Scalars['String'];
};


export type QueryUsenetHistoryArgs = {
  limit: Scalars['Int'];
  offset: Scalars['Int'];
  serviceId: Scalars['String'];
};


export type QueryUsenetInfoArgs = {
  serviceId: Scalars['String'];
};


export type QueryUsenetQueueArgs = {
  limit: Scalars['Int'];
  offset: Scalars['Int'];
  serviceId: Scalars['String'];
};

export type Service = {
  __typename?: 'Service';
  apiKey: Scalars['String'];
  icon: Scalars['String'];
  id: Scalars['String'];
  name: Scalars['String'];
  type: ServiceType;
  url: Scalars['String'];
};

export enum ServiceType {
  DashDot = 'DashDot',
  Deluge = 'Deluge',
  Emby = 'Emby',
  Jellyseerr = 'Jellyseerr',
  Lidarr = 'Lidarr',
  Other = 'Other',
  Overseerr = 'Overseerr',
  Plex = 'Plex',
  Radarr = 'Radarr',
  Readarr = 'Readarr',
  Sabnzbd = 'Sabnzbd',
  Sonarr = 'Sonarr',
  Transmission = 'Transmission',
  QBittorrent = 'qBittorrent'
}

export type Settings = {
  __typename?: 'Settings';
  appCardWidth?: Maybe<Scalars['Float']>;
  appOpacity?: Maybe<Scalars['Float']>;
  background?: Maybe<Scalars['String']>;
  customCSS?: Maybe<Scalars['String']>;
  favicon?: Maybe<Scalars['String']>;
  logo?: Maybe<Scalars['String']>;
  primaryColor?: Maybe<Scalars['String']>;
  primaryShade?: Maybe<Scalars['String']>;
  searchUrl: Scalars['String'];
  secondaryColor?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  widgetPosition?: Maybe<Scalars['String']>;
};

export type TvCalendarItem = {
  __typename?: 'TvCalendarItem';
  airDate: Scalars['DateTime'];
  episodeNumber: Scalars['Float'];
  episodeTitle: Scalars['String'];
  genres: Array<Scalars['String']>;
  imdbId: Scalars['String'];
  overview: Scalars['String'];
  poster: Scalars['String'];
  seasonNumber: Scalars['Float'];
  seriesTitle: Scalars['String'];
  tvDbId: Scalars['String'];
};

export type UsenetConfig = {
  __typename?: 'UsenetConfig';
  enabled: Scalars['Boolean'];
  title?: Maybe<Scalars['String']>;
};

export type UsenetHistory = {
  __typename?: 'UsenetHistory';
  items: Array<UsenetHistoryItem>;
  total: Scalars['Float'];
};

export type UsenetHistoryItem = {
  __typename?: 'UsenetHistoryItem';
  id: Scalars['String'];
  name: Scalars['String'];
  size: Scalars['Float'];
  time: Scalars['Float'];
};

export type UsenetInfo = {
  __typename?: 'UsenetInfo';
  eta: Scalars['Float'];
  paused: Scalars['Boolean'];
  sizeLeft: Scalars['Float'];
  speed: Scalars['Float'];
};

export type UsenetQueue = {
  __typename?: 'UsenetQueue';
  items: Array<UsenetQueueItem>;
  total: Scalars['Float'];
};

export type UsenetQueueItem = {
  __typename?: 'UsenetQueueItem';
  eta: Scalars['Float'];
  id: Scalars['String'];
  name: Scalars['String'];
  progress: Scalars['Float'];
  size: Scalars['Float'];
  state: UsenetQueueStatus;
};

export enum UsenetQueueStatus {
  Downloading = 'Downloading',
  Paused = 'Paused',
  Queued = 'Queued'
}

export type GetCalendarQueryVariables = Exact<{
  startDate: Scalars['DateTime'];
  endDate: Scalars['DateTime'];
}>;


export type GetCalendarQuery = { __typename?: 'Query', calendar: Array<{ __typename?: 'MovieCalendarItem', movieTitle: string, inCinemasDate: Date, digitalDate: Date, imdbId: string, poster: string, genres: Array<string>, overview: string, voteAverage?: number | null } | { __typename?: 'TvCalendarItem', seriesTitle: string, episodeTitle: string, airDate: Date, seasonNumber: number, episodeNumber: number, tvDbId: string, imdbId: string, poster: string, genres: Array<string>, overview: string }> };

export type GetConfigQueryVariables = Exact<{
  configName: Scalars['String'];
}>;


export type GetConfigQuery = { __typename?: 'Query', config: { __typename?: 'Config', name: string, settings: { __typename?: 'Settings', searchUrl: string, title?: string | null, logo?: string | null, favicon?: string | null, primaryColor?: string | null, secondaryColor?: string | null, primaryShade?: string | null, background?: string | null, customCSS?: string | null, appOpacity?: number | null, widgetPosition?: string | null, appCardWidth?: number | null }, services: Array<{ __typename?: 'Service', name: string, id: string, type: ServiceType, icon: string, url: string }>, modules: { __typename?: 'Modules', usenet?: { __typename?: 'UsenetConfig', title?: string | null, enabled: boolean } | null, docker?: { __typename?: 'DockerConfig', title?: string | null, enabled: boolean } | null, calendar?: { __typename?: 'CalendarConfig', title?: string | null, enabled: boolean } | null } } };

export type GetConfigListQueryVariables = Exact<{ [key: string]: never; }>;


export type GetConfigListQuery = { __typename?: 'Query', configs: Array<{ __typename?: 'Config', name: string }> };

export type GetContainersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetContainersQuery = { __typename?: 'Query', containers: Array<{ __typename?: 'DockerContainer', id: string, name: string, image: string, status: DockerStatus, ports: Array<{ __typename?: 'DockerPort', private: number, public: number }> }> };

export type GetUsenetHistoryQueryVariables = Exact<{
  serviceId: Scalars['String'];
  limit: Scalars['Int'];
  offset: Scalars['Int'];
}>;


export type GetUsenetHistoryQuery = { __typename?: 'Query', usenetHistory: { __typename?: 'UsenetHistory', total: number, items: Array<{ __typename?: 'UsenetHistoryItem', name: string, size: number, id: string, time: number }> } };

export type GetUsenetInfoQueryVariables = Exact<{
  serviceId: Scalars['String'];
}>;


export type GetUsenetInfoQuery = { __typename?: 'Query', usenetInfo: { __typename?: 'UsenetInfo', paused: boolean, sizeLeft: number, speed: number, eta: number } };

export type GetUsenetQueueQueryVariables = Exact<{
  serviceId: Scalars['String'];
  limit: Scalars['Int'];
  offset: Scalars['Int'];
}>;


export type GetUsenetQueueQuery = { __typename?: 'Query', usenetQueue: { __typename?: 'UsenetQueue', total: number, items: Array<{ __typename?: 'UsenetQueueItem', name: string, size: number, id: string, progress: number, state: UsenetQueueStatus, eta: number }> } };

export type PauseUsenetQueueMutationVariables = Exact<{
  serviceId: Scalars['String'];
}>;


export type PauseUsenetQueueMutation = { __typename?: 'Mutation', pauseUsenetQueue: { __typename?: 'UsenetInfo', paused: boolean, sizeLeft: number, speed: number, eta: number } };

export type ResumeUsenetQueueMutationVariables = Exact<{
  serviceId: Scalars['String'];
}>;


export type ResumeUsenetQueueMutation = { __typename?: 'Mutation', resumeUsenetQueue: { __typename?: 'UsenetInfo', paused: boolean, sizeLeft: number, speed: number, eta: number } };

export type UpdateConfigMutationVariables = Exact<{
  configName: Scalars['String'];
  body: Scalars['String'];
}>;


export type UpdateConfigMutation = { __typename?: 'Mutation', updateConfig: { __typename?: 'Config', name: string } };

export type UpdateContainersMutationVariables = Exact<{
  ids: Array<Scalars['String']> | Scalars['String'];
  action: DockerAction;
}>;


export type UpdateContainersMutation = { __typename?: 'Mutation', updateContainers: Array<{ __typename?: 'DockerContainer', id: string, name: string, image: string, status: DockerStatus, ports: Array<{ __typename?: 'DockerPort', private: number, public: number }> }> };


export const GetCalendarDocument = gql`
    query getCalendar($startDate: DateTime!, $endDate: DateTime!) {
  calendar(startDate: $startDate, endDate: $endDate) {
    ... on TvCalendarItem {
      seriesTitle
      episodeTitle
      airDate
      seasonNumber
      episodeNumber
      tvDbId
      imdbId
      poster
      genres
      overview
    }
    ... on MovieCalendarItem {
      movieTitle
      inCinemasDate
      digitalDate
      imdbId
      poster
      genres
      overview
      voteAverage
    }
  }
}
    `;

/**
 * __useGetCalendarQuery__
 *
 * To run a query within a React component, call `useGetCalendarQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCalendarQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCalendarQuery({
 *   variables: {
 *      startDate: // value for 'startDate'
 *      endDate: // value for 'endDate'
 *   },
 * });
 */
export function useGetCalendarQuery(baseOptions: Apollo.QueryHookOptions<GetCalendarQuery, GetCalendarQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCalendarQuery, GetCalendarQueryVariables>(GetCalendarDocument, options);
      }
export function useGetCalendarLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCalendarQuery, GetCalendarQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCalendarQuery, GetCalendarQueryVariables>(GetCalendarDocument, options);
        }
export type GetCalendarQueryHookResult = ReturnType<typeof useGetCalendarQuery>;
export type GetCalendarLazyQueryHookResult = ReturnType<typeof useGetCalendarLazyQuery>;
export type GetCalendarQueryResult = Apollo.QueryResult<GetCalendarQuery, GetCalendarQueryVariables>;
export const GetConfigDocument = gql`
    query getConfig($configName: String!) {
  config(configName: $configName) {
    name
    settings {
      searchUrl
      title
      logo
      favicon
      primaryColor
      secondaryColor
      primaryShade
      background
      customCSS
      appOpacity
      widgetPosition
      appCardWidth
    }
    services {
      name
      id
      type
      icon
      url
    }
    modules {
      usenet {
        title
        enabled
      }
      docker {
        title
        enabled
      }
      calendar {
        title
        enabled
      }
    }
  }
}
    `;

/**
 * __useGetConfigQuery__
 *
 * To run a query within a React component, call `useGetConfigQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetConfigQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetConfigQuery({
 *   variables: {
 *      configName: // value for 'configName'
 *   },
 * });
 */
export function useGetConfigQuery(baseOptions: Apollo.QueryHookOptions<GetConfigQuery, GetConfigQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetConfigQuery, GetConfigQueryVariables>(GetConfigDocument, options);
      }
export function useGetConfigLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetConfigQuery, GetConfigQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetConfigQuery, GetConfigQueryVariables>(GetConfigDocument, options);
        }
export type GetConfigQueryHookResult = ReturnType<typeof useGetConfigQuery>;
export type GetConfigLazyQueryHookResult = ReturnType<typeof useGetConfigLazyQuery>;
export type GetConfigQueryResult = Apollo.QueryResult<GetConfigQuery, GetConfigQueryVariables>;
export const GetConfigListDocument = gql`
    query getConfigList {
  configs {
    name
  }
}
    `;

/**
 * __useGetConfigListQuery__
 *
 * To run a query within a React component, call `useGetConfigListQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetConfigListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetConfigListQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetConfigListQuery(baseOptions?: Apollo.QueryHookOptions<GetConfigListQuery, GetConfigListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetConfigListQuery, GetConfigListQueryVariables>(GetConfigListDocument, options);
      }
export function useGetConfigListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetConfigListQuery, GetConfigListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetConfigListQuery, GetConfigListQueryVariables>(GetConfigListDocument, options);
        }
export type GetConfigListQueryHookResult = ReturnType<typeof useGetConfigListQuery>;
export type GetConfigListLazyQueryHookResult = ReturnType<typeof useGetConfigListLazyQuery>;
export type GetConfigListQueryResult = Apollo.QueryResult<GetConfigListQuery, GetConfigListQueryVariables>;
export const GetContainersDocument = gql`
    query getContainers {
  containers {
    id
    name
    image
    ports {
      private
      public
    }
    status
  }
}
    `;

/**
 * __useGetContainersQuery__
 *
 * To run a query within a React component, call `useGetContainersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetContainersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetContainersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetContainersQuery(baseOptions?: Apollo.QueryHookOptions<GetContainersQuery, GetContainersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetContainersQuery, GetContainersQueryVariables>(GetContainersDocument, options);
      }
export function useGetContainersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetContainersQuery, GetContainersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetContainersQuery, GetContainersQueryVariables>(GetContainersDocument, options);
        }
export type GetContainersQueryHookResult = ReturnType<typeof useGetContainersQuery>;
export type GetContainersLazyQueryHookResult = ReturnType<typeof useGetContainersLazyQuery>;
export type GetContainersQueryResult = Apollo.QueryResult<GetContainersQuery, GetContainersQueryVariables>;
export const GetUsenetHistoryDocument = gql`
    query getUsenetHistory($serviceId: String!, $limit: Int!, $offset: Int!) {
  usenetHistory(serviceId: $serviceId, limit: $limit, offset: $offset) {
    items {
      name
      size
      id
      time
    }
    total
  }
}
    `;

/**
 * __useGetUsenetHistoryQuery__
 *
 * To run a query within a React component, call `useGetUsenetHistoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUsenetHistoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUsenetHistoryQuery({
 *   variables: {
 *      serviceId: // value for 'serviceId'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetUsenetHistoryQuery(baseOptions: Apollo.QueryHookOptions<GetUsenetHistoryQuery, GetUsenetHistoryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUsenetHistoryQuery, GetUsenetHistoryQueryVariables>(GetUsenetHistoryDocument, options);
      }
export function useGetUsenetHistoryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUsenetHistoryQuery, GetUsenetHistoryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUsenetHistoryQuery, GetUsenetHistoryQueryVariables>(GetUsenetHistoryDocument, options);
        }
export type GetUsenetHistoryQueryHookResult = ReturnType<typeof useGetUsenetHistoryQuery>;
export type GetUsenetHistoryLazyQueryHookResult = ReturnType<typeof useGetUsenetHistoryLazyQuery>;
export type GetUsenetHistoryQueryResult = Apollo.QueryResult<GetUsenetHistoryQuery, GetUsenetHistoryQueryVariables>;
export const GetUsenetInfoDocument = gql`
    query getUsenetInfo($serviceId: String!) {
  usenetInfo(serviceId: $serviceId) {
    paused
    sizeLeft
    speed
    eta
  }
}
    `;

/**
 * __useGetUsenetInfoQuery__
 *
 * To run a query within a React component, call `useGetUsenetInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUsenetInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUsenetInfoQuery({
 *   variables: {
 *      serviceId: // value for 'serviceId'
 *   },
 * });
 */
export function useGetUsenetInfoQuery(baseOptions: Apollo.QueryHookOptions<GetUsenetInfoQuery, GetUsenetInfoQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUsenetInfoQuery, GetUsenetInfoQueryVariables>(GetUsenetInfoDocument, options);
      }
export function useGetUsenetInfoLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUsenetInfoQuery, GetUsenetInfoQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUsenetInfoQuery, GetUsenetInfoQueryVariables>(GetUsenetInfoDocument, options);
        }
export type GetUsenetInfoQueryHookResult = ReturnType<typeof useGetUsenetInfoQuery>;
export type GetUsenetInfoLazyQueryHookResult = ReturnType<typeof useGetUsenetInfoLazyQuery>;
export type GetUsenetInfoQueryResult = Apollo.QueryResult<GetUsenetInfoQuery, GetUsenetInfoQueryVariables>;
export const GetUsenetQueueDocument = gql`
    query getUsenetQueue($serviceId: String!, $limit: Int!, $offset: Int!) {
  usenetQueue(serviceId: $serviceId, limit: $limit, offset: $offset) {
    items {
      name
      size
      id
      progress
      state
      eta
    }
    total
  }
}
    `;

/**
 * __useGetUsenetQueueQuery__
 *
 * To run a query within a React component, call `useGetUsenetQueueQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUsenetQueueQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUsenetQueueQuery({
 *   variables: {
 *      serviceId: // value for 'serviceId'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetUsenetQueueQuery(baseOptions: Apollo.QueryHookOptions<GetUsenetQueueQuery, GetUsenetQueueQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUsenetQueueQuery, GetUsenetQueueQueryVariables>(GetUsenetQueueDocument, options);
      }
export function useGetUsenetQueueLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUsenetQueueQuery, GetUsenetQueueQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUsenetQueueQuery, GetUsenetQueueQueryVariables>(GetUsenetQueueDocument, options);
        }
export type GetUsenetQueueQueryHookResult = ReturnType<typeof useGetUsenetQueueQuery>;
export type GetUsenetQueueLazyQueryHookResult = ReturnType<typeof useGetUsenetQueueLazyQuery>;
export type GetUsenetQueueQueryResult = Apollo.QueryResult<GetUsenetQueueQuery, GetUsenetQueueQueryVariables>;
export const PauseUsenetQueueDocument = gql`
    mutation pauseUsenetQueue($serviceId: String!) {
  pauseUsenetQueue(serviceId: $serviceId) {
    paused
    sizeLeft
    speed
    eta
  }
}
    `;
export type PauseUsenetQueueMutationFn = Apollo.MutationFunction<PauseUsenetQueueMutation, PauseUsenetQueueMutationVariables>;

/**
 * __usePauseUsenetQueueMutation__
 *
 * To run a mutation, you first call `usePauseUsenetQueueMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePauseUsenetQueueMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [pauseUsenetQueueMutation, { data, loading, error }] = usePauseUsenetQueueMutation({
 *   variables: {
 *      serviceId: // value for 'serviceId'
 *   },
 * });
 */
export function usePauseUsenetQueueMutation(baseOptions?: Apollo.MutationHookOptions<PauseUsenetQueueMutation, PauseUsenetQueueMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PauseUsenetQueueMutation, PauseUsenetQueueMutationVariables>(PauseUsenetQueueDocument, options);
      }
export type PauseUsenetQueueMutationHookResult = ReturnType<typeof usePauseUsenetQueueMutation>;
export type PauseUsenetQueueMutationResult = Apollo.MutationResult<PauseUsenetQueueMutation>;
export type PauseUsenetQueueMutationOptions = Apollo.BaseMutationOptions<PauseUsenetQueueMutation, PauseUsenetQueueMutationVariables>;
export const ResumeUsenetQueueDocument = gql`
    mutation resumeUsenetQueue($serviceId: String!) {
  resumeUsenetQueue(serviceId: $serviceId) {
    paused
    sizeLeft
    speed
    eta
  }
}
    `;
export type ResumeUsenetQueueMutationFn = Apollo.MutationFunction<ResumeUsenetQueueMutation, ResumeUsenetQueueMutationVariables>;

/**
 * __useResumeUsenetQueueMutation__
 *
 * To run a mutation, you first call `useResumeUsenetQueueMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResumeUsenetQueueMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resumeUsenetQueueMutation, { data, loading, error }] = useResumeUsenetQueueMutation({
 *   variables: {
 *      serviceId: // value for 'serviceId'
 *   },
 * });
 */
export function useResumeUsenetQueueMutation(baseOptions?: Apollo.MutationHookOptions<ResumeUsenetQueueMutation, ResumeUsenetQueueMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ResumeUsenetQueueMutation, ResumeUsenetQueueMutationVariables>(ResumeUsenetQueueDocument, options);
      }
export type ResumeUsenetQueueMutationHookResult = ReturnType<typeof useResumeUsenetQueueMutation>;
export type ResumeUsenetQueueMutationResult = Apollo.MutationResult<ResumeUsenetQueueMutation>;
export type ResumeUsenetQueueMutationOptions = Apollo.BaseMutationOptions<ResumeUsenetQueueMutation, ResumeUsenetQueueMutationVariables>;
export const UpdateConfigDocument = gql`
    mutation updateConfig($configName: String!, $body: String!) {
  updateConfig(configName: $configName, body: $body) {
    name
  }
}
    `;
export type UpdateConfigMutationFn = Apollo.MutationFunction<UpdateConfigMutation, UpdateConfigMutationVariables>;

/**
 * __useUpdateConfigMutation__
 *
 * To run a mutation, you first call `useUpdateConfigMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateConfigMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateConfigMutation, { data, loading, error }] = useUpdateConfigMutation({
 *   variables: {
 *      configName: // value for 'configName'
 *      body: // value for 'body'
 *   },
 * });
 */
export function useUpdateConfigMutation(baseOptions?: Apollo.MutationHookOptions<UpdateConfigMutation, UpdateConfigMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateConfigMutation, UpdateConfigMutationVariables>(UpdateConfigDocument, options);
      }
export type UpdateConfigMutationHookResult = ReturnType<typeof useUpdateConfigMutation>;
export type UpdateConfigMutationResult = Apollo.MutationResult<UpdateConfigMutation>;
export type UpdateConfigMutationOptions = Apollo.BaseMutationOptions<UpdateConfigMutation, UpdateConfigMutationVariables>;
export const UpdateContainersDocument = gql`
    mutation updateContainers($ids: [String!]!, $action: DockerAction!) {
  updateContainers(ids: $ids, action: $action) {
    id
    name
    image
    ports {
      private
      public
    }
    status
  }
}
    `;
export type UpdateContainersMutationFn = Apollo.MutationFunction<UpdateContainersMutation, UpdateContainersMutationVariables>;

/**
 * __useUpdateContainersMutation__
 *
 * To run a mutation, you first call `useUpdateContainersMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateContainersMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateContainersMutation, { data, loading, error }] = useUpdateContainersMutation({
 *   variables: {
 *      ids: // value for 'ids'
 *      action: // value for 'action'
 *   },
 * });
 */
export function useUpdateContainersMutation(baseOptions?: Apollo.MutationHookOptions<UpdateContainersMutation, UpdateContainersMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateContainersMutation, UpdateContainersMutationVariables>(UpdateContainersDocument, options);
      }
export type UpdateContainersMutationHookResult = ReturnType<typeof useUpdateContainersMutation>;
export type UpdateContainersMutationResult = Apollo.MutationResult<UpdateContainersMutation>;
export type UpdateContainersMutationOptions = Apollo.BaseMutationOptions<UpdateContainersMutation, UpdateContainersMutationVariables>;