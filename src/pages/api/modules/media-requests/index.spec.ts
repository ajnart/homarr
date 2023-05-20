import Consola from 'consola';

import { createMocks } from 'node-mocks-http';

import { describe, expect, it, vi } from 'vitest';

import 'vitest-fetch-mock';

import { ConfigType } from '../../../../types/config';

import MediaRequestsRoute from './index';

const mockedGetConfig = vi.fn();

describe('media-requests api', () => {
  it('reduce when empty list of requests', async () => {
    // Arrange
    const { req, res } = createMocks();

    vi.mock('./../../../../tools/config/getConfig.ts', () => ({
      get getConfig() {
        return mockedGetConfig;
      },
    }));
    mockedGetConfig.mockReturnValue({
      apps: [],
    });

    // Act
    await MediaRequestsRoute(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(200);
    expect(res.finished).toBe(true);
    expect(JSON.parse(res._getData())).toEqual([]);
  });

  it('log error when fetch was not successful', async () => {
    // Arrange
    const { req, res } = createMocks();

    vi.mock('./../../../../tools/config/getConfig.ts', () => ({
      get getConfig() {
        return mockedGetConfig;
      },
    }));
    mockedGetConfig.mockReturnValue({
      apps: [
        {
          integration: {
            type: 'overseerr',
            properties: [
              {
                field: 'apiKey',
                type: 'private',
                value: 'abc',
              },
            ],
          },
        },
      ],
    } as ConfigType);
    const logSpy = vi.spyOn(Consola, 'error');

    // Act
    await MediaRequestsRoute(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(200);
    expect(res.finished).toBe(true);
    expect(JSON.parse(res._getData())).toEqual([]);

    expect(logSpy).toHaveBeenCalledOnce();
    expect(logSpy.mock.lastCall).toEqual([
      'Failed to request data from Overseerr: FetchError: invalid json response body at  reason: Unexpected end of JSON input',
    ]);

    logSpy.mockRestore();
  });

  it('fetch and return requests in response with external url', async () => {
    // Arrange
    const { req, res } = createMocks({
      method: 'GET',
    });

    vi.mock('./../../../../tools/config/getConfig.ts', () => ({
      get getConfig() {
        return mockedGetConfig;
      },
    }));
    mockedGetConfig.mockReturnValue({
      apps: [
        {
          url: 'http://my-overseerr.local',
          behaviour: {
            externalUrl: 'http://my-overseerr.external',
          },
          integration: {
            type: 'overseerr',
            properties: [
              {
                field: 'apiKey',
                type: 'private',
                value: 'abc',
              },
            ],
          },
        },
      ],
      widgets: [
        {
          id: 'hjeruijgrig',
          type: 'media-requests-list',
          properties: {
            replaceLinksWithExternalHost: true,
          },
        },
      ],
    } as unknown as ConfigType);
    const logSpy = vi.spyOn(Consola, 'error');

    fetchMock.mockResponse((request) => {
      if (request.url === 'http://my-overseerr.local/api/v1/request?take=25&skip=0&sort=added') {
        return JSON.stringify({
          pageInfo: { pages: 3, pageSize: 20, results: 42, page: 1 },
          results: [
            {
              id: 44,
              status: 2,
              createdAt: '2023-04-06T19:38:45.000Z',
              updatedAt: '2023-04-06T19:38:45.000Z',
              type: 'movie',
              is4k: false,
              serverId: 0,
              profileId: 4,
              tags: [],
              isAutoRequest: false,
              media: {
                downloadStatus: [],
                downloadStatus4k: [],
                id: 999,
                mediaType: 'movie',
                tmdbId: 99999999,
                tvdbId: null,
                imdbId: null,
                status: 5,
                status4k: 1,
                createdAt: '2023-02-06T19:38:45.000Z',
                updatedAt: '2023-02-06T20:00:04.000Z',
                lastSeasonChange: '2023-08-06T19:38:45.000Z',
                mediaAddedAt: '2023-05-14T06:30:34.000Z',
                serviceId: 0,
                serviceId4k: null,
                externalServiceId: 32,
                externalServiceId4k: null,
                externalServiceSlug: '000000000000',
                externalServiceSlug4k: null,
                ratingKey: null,
                ratingKey4k: null,
                jellyfinMediaId: '0000',
                jellyfinMediaId4k: null,
                mediaUrl:
                  'http://your-jellyfin.local/web/index.html#!/details?id=mn8q2j4gq038g&context=home&serverId=jf83fj34gm340g',
                serviceUrl: 'http://your-jellyfin.local/movie/0000',
              },
              seasons: [],
              modifiedBy: {
                permissions: 2,
                warnings: [],
                id: 1,
                email: 'example-user@homarr.dev',
                plexUsername: null,
                jellyfinUsername: 'example-user',
                username: null,
                recoveryLinkExpirationDate: null,
                userType: 3,
                plexId: null,
                jellyfinUserId: '00000000000000000',
                jellyfinDeviceId: '111111111111111111',
                jellyfinAuthToken: '2222222222222222222',
                plexToken: null,
                avatar: '/os_logo_square.png',
                movieQuotaLimit: null,
                movieQuotaDays: null,
                tvQuotaLimit: null,
                tvQuotaDays: null,
                createdAt: '2022-07-03T19:53:08.000Z',
                updatedAt: '2022-07-03T19:53:08.000Z',
                requestCount: 34,
                displayName: 'Example User',
              },
              requestedBy: {
                permissions: 2,
                warnings: [],
                id: 1,
                email: 'example-user@homarr.dev',
                plexUsername: null,
                jellyfinUsername: 'example-user',
                username: null,
                recoveryLinkExpirationDate: null,
                userType: 3,
                plexId: null,
                jellyfinUserId: '00000000000000000',
                jellyfinDeviceId: '111111111111111111',
                jellyfinAuthToken: '2222222222222222222',
                plexToken: null,
                avatar: '/os_logo_square.png',
                movieQuotaLimit: null,
                movieQuotaDays: null,
                tvQuotaLimit: null,
                tvQuotaDays: null,
                createdAt: '2022-07-03T19:53:08.000Z',
                updatedAt: '2022-07-03T19:53:08.000Z',
                requestCount: 34,
                displayName: 'Example User',
              },
              seasonCount: 0,
            },
          ],
        });
      }

      if (request.url === 'http://my-overseerr.local/api/v1/movie/99999999') {
        return JSON.stringify({
          id: 0,
          adult: false,
          budget: 0,
          genres: [
            {
              id: 18,
              name: 'Dashboards',
            },
          ],
          relatedVideos: [],
          originalLanguage: 'jp',
          originalTitle: 'Homarrrr Movie',
          popularity: 9.352,
          productionCompanies: [],
          productionCountries: [],
          releaseDate: '2023-12-08',
          releases: {
            results: [],
          },
          revenue: 0,
          spokenLanguages: [
            {
              english_name: 'Japanese',
              iso_639_1: 'jp',
              name: '日本語',
            },
          ],
          status: 'Released',
          title: 'Homarr Movie',
          video: false,
          voteAverage: 9.999,
          voteCount: 0,
          backdropPath: '/mhjq8jr0qgrjnghnh.jpg',
          homepage: '',
          imdbId: 'tt0000000',
          overview: 'A very cool movie',
          posterPath: '/hf4j0928gq543njgh8935nqh8.jpg',
          runtime: 97,
          tagline: '',
          credits: {},
          collection: null,
          externalIds: {
            facebookId: null,
            imdbId: null,
            instagramId: null,
            twitterId: null,
          },
          watchProviders: [],
          keywords: [],
        });
      }

      return Promise.reject(new Error(`Bad url: ${request.url}`));
    });

    // Act
    await MediaRequestsRoute(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(200);
    expect(res.finished).toBe(true);
    expect(JSON.parse(res._getData())).toEqual([
      {
        airDate: '2023-12-08',
        backdropPath: 'https://image.tmdb.org/t/p/original//mhjq8jr0qgrjnghnh.jpg',
        createdAt: '2023-04-06T19:38:45.000Z',
        href: 'http://my-overseerr.external/movie/99999999',
        id: 44,
        name: 'Homarrrr Movie',
        posterPath:
          'https://image.tmdb.org/t/p/w600_and_h900_bestv2//hf4j0928gq543njgh8935nqh8.jpg',
        status: 2,
        type: 'movie',
        userLink: 'http://my-overseerr.external/users/1',
        userName: 'Example User',
        userProfilePicture: 'http://my-overseerr.external//os_logo_square.png',
      },
    ]);

    expect(logSpy).not.toHaveBeenCalled();

    logSpy.mockRestore();
  });

  it('fetch and return requests in response with internal url', async () => {
    // Arrange
    const { req, res } = createMocks({
      method: 'GET',
    });

    vi.mock('./../../../../tools/config/getConfig.ts', () => ({
      get getConfig() {
        return mockedGetConfig;
      },
    }));
    mockedGetConfig.mockReturnValue({
      apps: [
        {
          url: 'http://my-overseerr.local',
          behaviour: {
            externalUrl: 'http://my-overseerr.external',
          },
          integration: {
            type: 'overseerr',
            properties: [
              {
                field: 'apiKey',
                type: 'private',
                value: 'abc',
              },
            ],
          },
        },
      ],
      widgets: [
        {
          id: 'hjeruijgrig',
          type: 'media-requests-list',
          properties: {
            replaceLinksWithExternalHost: false,
          },
        },
      ],
    } as unknown as ConfigType);
    const logSpy = vi.spyOn(Consola, 'error');

    fetchMock.mockResponse((request) => {
      if (request.url === 'http://my-overseerr.local/api/v1/request?take=25&skip=0&sort=added') {
        return JSON.stringify({
          pageInfo: { pages: 3, pageSize: 20, results: 42, page: 1 },
          results: [
            {
              id: 44,
              status: 2,
              createdAt: '2023-04-06T19:38:45.000Z',
              updatedAt: '2023-04-06T19:38:45.000Z',
              type: 'movie',
              is4k: false,
              serverId: 0,
              profileId: 4,
              tags: [],
              isAutoRequest: false,
              media: {
                downloadStatus: [],
                downloadStatus4k: [],
                id: 999,
                mediaType: 'movie',
                tmdbId: 99999999,
                tvdbId: null,
                imdbId: null,
                status: 5,
                status4k: 1,
                createdAt: '2023-02-06T19:38:45.000Z',
                updatedAt: '2023-02-06T20:00:04.000Z',
                lastSeasonChange: '2023-08-06T19:38:45.000Z',
                mediaAddedAt: '2023-05-14T06:30:34.000Z',
                serviceId: 0,
                serviceId4k: null,
                externalServiceId: 32,
                externalServiceId4k: null,
                externalServiceSlug: '000000000000',
                externalServiceSlug4k: null,
                ratingKey: null,
                ratingKey4k: null,
                jellyfinMediaId: '0000',
                jellyfinMediaId4k: null,
                mediaUrl:
                  'http://your-jellyfin.local/web/index.html#!/details?id=mn8q2j4gq038g&context=home&serverId=jf83fj34gm340g',
                serviceUrl: 'http://your-jellyfin.local/movie/0000',
              },
              seasons: [],
              modifiedBy: {
                permissions: 2,
                warnings: [],
                id: 1,
                email: 'example-user@homarr.dev',
                plexUsername: null,
                jellyfinUsername: 'example-user',
                username: null,
                recoveryLinkExpirationDate: null,
                userType: 3,
                plexId: null,
                jellyfinUserId: '00000000000000000',
                jellyfinDeviceId: '111111111111111111',
                jellyfinAuthToken: '2222222222222222222',
                plexToken: null,
                avatar: '/os_logo_square.png',
                movieQuotaLimit: null,
                movieQuotaDays: null,
                tvQuotaLimit: null,
                tvQuotaDays: null,
                createdAt: '2022-07-03T19:53:08.000Z',
                updatedAt: '2022-07-03T19:53:08.000Z',
                requestCount: 34,
                displayName: 'Example User',
              },
              requestedBy: {
                permissions: 2,
                warnings: [],
                id: 1,
                email: 'example-user@homarr.dev',
                plexUsername: null,
                jellyfinUsername: 'example-user',
                username: null,
                recoveryLinkExpirationDate: null,
                userType: 3,
                plexId: null,
                jellyfinUserId: '00000000000000000',
                jellyfinDeviceId: '111111111111111111',
                jellyfinAuthToken: '2222222222222222222',
                plexToken: null,
                avatar: '/os_logo_square.png',
                movieQuotaLimit: null,
                movieQuotaDays: null,
                tvQuotaLimit: null,
                tvQuotaDays: null,
                createdAt: '2022-07-03T19:53:08.000Z',
                updatedAt: '2022-07-03T19:53:08.000Z',
                requestCount: 34,
                displayName: 'Example User',
              },
              seasonCount: 0,
            },
          ],
        });
      }

      if (request.url === 'http://my-overseerr.local/api/v1/movie/99999999') {
        return JSON.stringify({
          id: 0,
          adult: false,
          budget: 0,
          genres: [
            {
              id: 18,
              name: 'Dashboards',
            },
          ],
          relatedVideos: [],
          originalLanguage: 'jp',
          originalTitle: 'Homarrrr Movie',
          popularity: 9.352,
          productionCompanies: [],
          productionCountries: [],
          releaseDate: '2023-12-08',
          releases: {
            results: [],
          },
          revenue: 0,
          spokenLanguages: [
            {
              english_name: 'Japanese',
              iso_639_1: 'jp',
              name: '日本語',
            },
          ],
          status: 'Released',
          title: 'Homarr Movie',
          video: false,
          voteAverage: 9.999,
          voteCount: 0,
          backdropPath: '/mhjq8jr0qgrjnghnh.jpg',
          homepage: '',
          imdbId: 'tt0000000',
          overview: 'A very cool movie',
          posterPath: '/hf4j0928gq543njgh8935nqh8.jpg',
          runtime: 97,
          tagline: '',
          credits: {},
          collection: null,
          externalIds: {
            facebookId: null,
            imdbId: null,
            instagramId: null,
            twitterId: null,
          },
          watchProviders: [],
          keywords: [],
        });
      }

      return Promise.reject(new Error(`Bad url: ${request.url}`));
    });

    // Act
    await MediaRequestsRoute(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(200);
    expect(res.finished).toBe(true);
    expect(JSON.parse(res._getData())).toEqual([
      {
        airDate: '2023-12-08',
        backdropPath: 'https://image.tmdb.org/t/p/original//mhjq8jr0qgrjnghnh.jpg',
        createdAt: '2023-04-06T19:38:45.000Z',
        href: 'http://my-overseerr.local/movie/99999999',
        id: 44,
        name: 'Homarrrr Movie',
        posterPath:
          'https://image.tmdb.org/t/p/w600_and_h900_bestv2//hf4j0928gq543njgh8935nqh8.jpg',
        status: 2,
        type: 'movie',
        userLink: 'http://my-overseerr.local/users/1',
        userName: 'Example User',
        userProfilePicture: 'http://my-overseerr.local//os_logo_square.png',
      },
    ]);

    expect(logSpy).not.toHaveBeenCalled();

    logSpy.mockRestore();
  });
});
