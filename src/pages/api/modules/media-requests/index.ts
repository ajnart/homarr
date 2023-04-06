import { getCookie } from 'cookies-next';
import Consola from 'consola';
import { NextApiRequest, NextApiResponse } from 'next';
import { getConfig } from '../../../../tools/config/getConfig';

import { MediaRequest } from '../../../../widgets/media-requests/media-request-types';
import { ConfigAppType } from '../../../../types/app';

const Get = async (request: NextApiRequest, response: NextApiResponse) => {
  const configName = getCookie('config-name', { req: request });
  const config = getConfig(configName?.toString() ?? 'default');

  const apps = config.apps.filter((app) =>
    ['overseerr', 'jellyseerr'].includes(app.integration?.type ?? '')
  );

  const promises = apps.map((app): Promise<MediaRequest[]> => {
    const apiKey = app.integration?.properties.find((prop) => prop.field === 'apiKey')?.value ?? '';
    const headers: HeadersInit = { 'X-Api-Key': apiKey };
    return fetch(`${app.url}/api/v1/request?take=25&skip=0&sort=added`, {
      headers,
    })
      .then(async (response) => {
        const body = (await response.json()) as OverseerrResponse;

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
              userLink: constructAvatarUrl(app, item),
              userProfilePicture: `${app.url}${item.requestedBy.avatar}`,
              airDate: genericItem.airDate,
              status: item.status,
              backdropPath: `https://image.tmdb.org/t/p/original/${genericItem.backdropPath}`,
              posterPath: `https://image.tmdb.org/t/p/w600_and_h900_bestv2/${genericItem.posterPath}`,
              href: `${app.url}/movie/${item.media.tmdbId}`,
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

  const mediaRequests = (await Promise.all(promises)).reduce((prev, cur) => prev.concat(cur));

  return response.status(200).json(mediaRequests);
};

const constructAvatarUrl = (app: ConfigAppType, item: OverseerrResponseItem) => {
  if (item.requestedBy.avatar.startsWith('http://') || item.requestedBy.avatar.startsWith('https://')) {
    return item.requestedBy.avatar;
  }

  return `${app.url}/users/${item.requestedBy.id}`;
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
      posterPath: series.backdropPath,
    };
  }

  const movieResponse = await fetch(`${baseUrl}/api/v1/movie/${id}`, {
    headers,
  });

  const movie = (await movieResponse.json()) as OverseerrMovie;

  return {
    name: movie.originalTitle,
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
  originalTitle: string;
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

type OverseerrResponseItem = {
  id: number;
  status: number;
  createdAt: string;
  type: 'movie' | 'tv';
  rootFolder: string;
  requestedBy: OverseerrResponseItemUser;
  media: OverseerrResponseItemMedia;
};

type OverseerrResponseItemMedia = {
  tmdbId: number;
};

type OverseerrResponseItemUser = {
  id: number;
  displayName: string;
  avatar: string;
};

export default async (request: NextApiRequest, response: NextApiResponse) => {
  if (request.method === 'GET') {
    return Get(request, response);
  }

  return response.status(405);
};
