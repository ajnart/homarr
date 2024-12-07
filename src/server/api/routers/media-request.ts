import Consola from 'consola';
import { removeTrailingSlash } from 'next/dist/shared/lib/router/utils/remove-trailing-slash';
import { z } from 'zod';
import { checkIntegrationsType } from '~/tools/client/app-properties';
import { getConfig } from '~/tools/config/getConfig';
import { MediaRequestListWidget } from '~/widgets/media-requests/MediaRequestListTile';
import { MediaRequestStatsWidget } from '~/widgets/media-requests/MediaRequestStatsTile';
import { MediaRequest, Users } from '~/widgets/media-requests/media-request-types';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const mediaRequestsRouter = createTRPCRouter({
  allMedia: publicProcedure
    .input(
      z.object({
        configName: z.string(),
        widget: z.custom<MediaRequestListWidget>().or(z.custom<MediaRequestStatsWidget>()),
      })
    )
    .query(async ({ input }) => {
      const config = getConfig(input.configName);

      const apps = config.apps.filter((app) =>
        checkIntegrationsType(app.integration, ['overseerr', 'jellyseerr'])
      );

      const promises = apps.map((app): Promise<MediaRequest[]> => {
        const apiKey =
          app.integration?.properties.find((prop) => prop.field === 'apiKey')?.value ?? '';
        const headers: HeadersInit = { 'X-Api-Key': apiKey };
        return fetch(`${app.url}/api/v1/request?take=25&skip=0&sort=added`, {
          headers,
        })
          .then(async (response) => {
            const body = (await response.json()) as OverseerrResponse;
            let appUrl =
              input.widget.properties.replaceLinksWithExternalHost &&
              app.behaviour.externalUrl?.length > 0
                ? app.behaviour.externalUrl
                : app.url;

            appUrl = removeTrailingSlash(appUrl);

            const requests = await Promise.all(
              body.results.map(async (item): Promise<MediaRequest> => {
                const genericItem = await retrieveDetailsForItem(
                  app.url,
                  item.type,
                  headers,
                  item.media.tmdbId
                );
                return {
                  appId: app.id,
                  createdAt: item.createdAt,
                  id: item.id,
                  rootFolder: item.rootFolder,
                  type: item.type,
                  name: genericItem.name,
                  userName: item.requestedBy.displayName,
                  userProfilePicture: constructAvatarUrl(appUrl, item.requestedBy.avatar),
                  fallbackUserProfilePicture: constructAvatarUrl(appUrl, item.requestedBy.avatar,'avatarproxy'),
                  userLink: `${appUrl}/users/${item.requestedBy.id}`,
                  userRequestCount: item.requestedBy.requestCount,
                  airDate: genericItem.airDate,
                  status: item.status,
                  availability: item.is4k ? item.media.status4k : item.media.status,
                  backdropPath: `https://image.tmdb.org/t/p/original/${genericItem.backdropPath}`,
                  posterPath: `https://image.tmdb.org/t/p/w600_and_h900_bestv2/${genericItem.posterPath}`,
                  href: `${appUrl}/${item.type}/${item.media.tmdbId}`,
                };
              })
            );

            return Promise.resolve(requests);
          })
          .catch((err) => {
            Consola.error(`Failed to request data from Overseerr: ${err}`);
            return Promise.resolve([]);
          });
      });

      const mediaRequests = (await Promise.all(promises)).reduce(
        (prev, cur) => prev.concat(cur),
        []
      );

      return mediaRequests;
    }),
  users: publicProcedure
    .input(
      z.object({
        configName: z.string(),
        widget: z.custom<MediaRequestListWidget>().or(z.custom<MediaRequestStatsWidget>()),
      })
    )
    .query(async ({ input }) => {
      const config = getConfig(input.configName);

      const apps = config.apps.filter((app) =>
        checkIntegrationsType(app.integration, ['overseerr', 'jellyseerr'])
      );

      const promises = apps.map((app): Promise<Users[]> => {
        const apiKey =
          app.integration?.properties.find((prop) => prop.field === 'apiKey')?.value ?? '';
        const headers: HeadersInit = { 'X-Api-Key': apiKey };
        return fetch(`${app.url}/api/v1/user?take=25&skip=0&sort=requests`, {
          headers,
        })
          .then(async (response) => {
            const body = (await response.json()) as OverseerrUsers;
            const appUrl = input.widget.properties.replaceLinksWithExternalHost
              ? app.behaviour.externalUrl
              : app.url;

            const users = await Promise.all(
              body.results.map(async (user): Promise<Users> => {
                return {
                  app: app.integration?.type ?? 'overseerr',
                  id: user.id,
                  userName: user.displayName,
                  userProfilePicture: constructAvatarUrl(appUrl, user.avatar),
                  fallbackUserProfilePicture: constructAvatarUrl(appUrl, user.avatar,'avatarproxy'),
                  userLink: `${appUrl}/users/${user.id}`,
                  userRequestCount: user.requestCount,
                };
              })
            );
            return Promise.resolve(users);
          })
          .catch((err) => {
            Consola.error(`Failed to request users from Overseerr: ${err}`);
            return Promise.resolve([]);
          });
      });
      const users = (await Promise.all(promises)).reduce((prev, cur) => prev.concat(cur), []);

      return users;
    }),
});

const constructAvatarUrl = (appUrl: string, avatar: string, path?: string) => {
  const isAbsolute = avatar.startsWith('http://') || avatar.startsWith('https://');

  if (isAbsolute) {
    return avatar;
  }

  return `${appUrl}/${path?.concat("/") ?? "" }${avatar}`;
};

const retrieveDetailsForItem = async (
  baseUrl: string,
  type: OverseerrResponseItem['type'],
  headers: HeadersInit,
  id: number
): Promise<GenericOverseerrItem> => {
  if (type === 'tv') {
    const tvResponse = await fetch(`${baseUrl}/api/v1/tv/${id}`, {
      headers,
    });

    const series = (await tvResponse.json()) as OverseerrSeries;

    return {
      name: series.name,
      airDate: series.firstAirDate,
      backdropPath: series.backdropPath,
      posterPath: series.posterPath ?? series.backdropPath,
    };
  }

  const movieResponse = await fetch(`${baseUrl}/api/v1/movie/${id}`, {
    headers,
  });

  const movie = (await movieResponse.json()) as OverseerrMovie;

  return {
    name: movie.title,
    airDate: movie.releaseDate,
    backdropPath: movie.backdropPath,
    posterPath: movie.posterPath,
  };
};

type GenericOverseerrItem = {
  name: string;
  airDate: string;
  backdropPath: string;
  posterPath: string;
};

type OverseerrMovie = {
  title: string;
  releaseDate: string;
  backdropPath: string;
  posterPath: string;
};

type OverseerrSeries = {
  name: string;
  firstAirDate: string;
  backdropPath: string;
  posterPath: string;
};

type OverseerrResponse = {
  results: OverseerrResponseItem[];
};

type OverseerrUsers = {
  results: OverseerrResponseItemUser[];
};

type OverseerrResponseItem = {
  id: number;
  status: number;
  createdAt: string;
  type: 'movie' | 'tv';
  is4k: boolean;
  rootFolder: string;
  requestedBy: OverseerrResponseItemUser;
  media: OverseerrResponseItemMedia;
};

type OverseerrResponseItemMedia = {
  tmdbId: number;
  status: number;
  status4k: number;
};

type OverseerrResponseItemUser = {
  id: number;
  displayName: string;
  avatar: string;
  requestCount: number;
};
