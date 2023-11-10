import { Jellyfin } from '@jellyfin/sdk';
import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models';
import { getSessionApi } from '@jellyfin/sdk/lib/utils/api/session-api';
import { getSystemApi } from '@jellyfin/sdk/lib/utils/api/system-api';
import Consola from 'consola';
import { z } from 'zod';
import { checkIntegrationsType, findAppProperty } from '~/tools/client/app-properties';
import { getConfig } from '~/tools/config/getConfig';
import { PlexClient } from '~/tools/server/sdk/plex/plexClient';
import { trimStringEnding } from '~/tools/shared/strings';
import { GenericMediaServer } from '~/types/api/media-server/media-server';
import { MediaServersResponseType } from '~/types/api/media-server/response';
import { GenericCurrentlyPlaying, GenericSessionInfo } from '~/types/api/media-server/session-info';
import { ConfigAppType } from '~/types/app';

import { createTRPCRouter, publicProcedure } from '../trpc';

const jellyfin = new Jellyfin({
  clientInfo: {
    name: 'Homarr',
    version: '0.0.1',
  },
  deviceInfo: {
    name: 'Homarr Jellyfin Widget',
    id: 'homarr-jellyfin-widget',
  },
});

export const mediaServerRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z.object({
        configName: z.string(),
      })
    )
    .query(async ({ input }) => {
      const config = getConfig(input.configName);

      const apps = config.apps.filter((app) =>
        checkIntegrationsType(app.integration, ['jellyfin', 'plex'])
      );

      const servers = await Promise.all(
        apps.map(async (app): Promise<GenericMediaServer | undefined> => {
          try {
            return await handleServer(app);
          } catch (error) {
            Consola.error(
              `failed to communicate with media server '${app.name}' (${app.id}): ${error}`
            );
            return {
              serverAddress: app.url,
              sessions: [],
              success: false,
              version: undefined,
              type: undefined,
              appId: app.id,
            };
          }
        })
      );

      return {
        servers: servers.filter(
          (server): server is Exclude<typeof server, undefined> => server !== undefined
        ),
      } satisfies MediaServersResponseType;
    }),
});

const handleServer = async (app: ConfigAppType): Promise<GenericMediaServer | undefined> => {
  switch (app.integration?.type) {
    case 'jellyfin': {
      const username = findAppProperty(app, 'username');

      if (!username) {
        return {
          appId: app.id,
          serverAddress: app.url,
          sessions: [],
          type: 'jellyfin',
          version: undefined,
          success: false,
        };
      }

      const password = findAppProperty(app, 'password');

      if (!password) {
        return {
          appId: app.id,
          serverAddress: app.url,
          sessions: [],
          type: 'jellyfin',
          version: undefined,
          success: false,
        };
      }

      const api = jellyfin.createApi(app.url);
      const infoApi = await getSystemApi(api).getPublicSystemInfo();
      await api.authenticateUserByName(username, password);
      const sessionApi = await getSessionApi(api);
      const { data: sessions } = await sessionApi.getSessions();
      return {
        type: 'jellyfin',
        appId: app.id,
        serverAddress: trimStringEnding(app.url, [
          '/web/index.html#!/home.html',
          '/web',
          '/web/index.html',
          '/web/',
          '/web/index.html#',
        ]),
        version: infoApi.data.Version ?? undefined,
        sessions: sessions
          .filter((session) => session.NowPlayingItem)
          .map(
            (session): GenericSessionInfo => ({
              id: session.Id ?? '?',
              username: session.UserName ?? undefined,
              sessionName: `${session.Client} (${session.DeviceName})`,
              supportsMediaControl: session.SupportsMediaControl ?? false,
              currentlyPlaying: session.NowPlayingItem
                ? {
                    name: `${session.NowPlayingItem.SeriesName ?? session.NowPlayingItem.Name}`,
                    seasonName: session.NowPlayingItem.SeasonName as string,
                    episodeName: session.NowPlayingItem.Name as string,
                    albumName: session.NowPlayingItem.Album as string,
                    episodeCount: session.NowPlayingItem.EpisodeCount ?? undefined,
                    metadata: {
                      video:
                        session.NowPlayingItem &&
                        session.NowPlayingItem.Width &&
                        session.NowPlayingItem.Height
                          ? {
                              videoCodec: undefined,
                              width: session.NowPlayingItem.Width ?? undefined,
                              height: session.NowPlayingItem.Height ?? undefined,
                              bitrate: undefined,
                              videoFrameRate: session.TranscodingInfo?.Framerate
                                ? String(session.TranscodingInfo?.Framerate)
                                : undefined,
                            }
                          : undefined,
                      audio: session.TranscodingInfo
                        ? {
                            audioChannels: session.TranscodingInfo.AudioChannels ?? undefined,
                            audioCodec: session.TranscodingInfo.AudioCodec ?? undefined,
                          }
                        : undefined,
                      transcoding: session.TranscodingInfo
                        ? {
                            audioChannels: session.TranscodingInfo.AudioChannels ?? -1,
                            audioCodec: session.TranscodingInfo.AudioCodec ?? undefined,
                            container: session.TranscodingInfo.Container ?? undefined,
                            width: session.TranscodingInfo.Width ?? undefined,
                            height: session.TranscodingInfo.Height ?? undefined,
                            videoCodec: session.TranscodingInfo?.VideoCodec ?? undefined,
                            audioDecision: undefined,
                            context: undefined,
                            duration: undefined,
                            error: undefined,
                            sourceAudioCodec: undefined,
                            sourceVideoCodec: undefined,
                            timeStamp: undefined,
                            transcodeHwRequested: undefined,
                            videoDecision: undefined,
                          }
                        : undefined,
                    },
                    type: convertJellyfinType(session.NowPlayingItem.Type),
                  }
                : undefined,
              userProfilePicture: undefined,
            })
          ),
        success: true,
      };
    }
    case 'plex': {
      const apiKey = findAppProperty(app, 'apiKey');

      if (!apiKey) {
        return {
          serverAddress: trimStringEnding(app.url, [
            '/web',
            '/web/index.html',
            '/web/index.html#!',
            '/web/index.html#!/settings/web/general',
            '/web/',
          ]),
          sessions: [],
          type: 'plex',
          appId: app.id,
          version: undefined,
          success: false,
        };
      }

      const plexClient = new PlexClient(app.url, apiKey);
      const sessions = await plexClient.getSessions();
      return {
        serverAddress: app.url,
        sessions,
        type: 'plex',
        version: undefined,
        appId: app.id,
        success: true,
      };
    }
    default: {
      Consola.warn(
        `media-server api entered a fallback case. This should normally not happen and must be reported. Cause: '${app.name}' (${app.id})`
      );
      return undefined;
    }
  }
};

const convertJellyfinType = (kind: BaseItemKind | undefined): GenericCurrentlyPlaying['type'] => {
  switch (kind) {
    case BaseItemKind.Audio:
    case BaseItemKind.MusicVideo:
      return 'audio';
    case BaseItemKind.Episode:
    case BaseItemKind.Video:
      return 'video';
    case BaseItemKind.Movie:
      return 'movie';
    case BaseItemKind.TvChannel:
    case BaseItemKind.TvProgram:
    case BaseItemKind.LiveTvChannel:
    case BaseItemKind.LiveTvProgram:
      return 'tv';
    default:
      return undefined;
  }
};
