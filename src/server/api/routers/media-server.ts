import { Jellyfin } from '@jellyfin/sdk';
import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models';
import { getSessionApi } from '@jellyfin/sdk/lib/utils/api/session-api';
import { getSystemApi } from '@jellyfin/sdk/lib/utils/api/system-api';
import { TRPCError } from '@trpc/server';
import Consola from 'consola';
import { z } from 'zod';
import { PlexClient } from '~/tools/server/sdk/plex/plexClient';
import { GenericMediaServer } from '~/types/api/media-server/media-server';
import { GenericCurrentlyPlaying, GenericSessionInfo } from '~/types/api/media-server/session-info';
import { ClientApp, generateClientAppSchema, mergeClientAppsIntoServerApps } from '../helpers/apps';
import { mediaServerIntegrationTypes } from '../helpers/integrations';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { configNameSchema, getConfigData } from './config';

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
        configName: configNameSchema,
        apps: z.array(generateClientAppSchema(mediaServerIntegrationTypes)),
      })
    )
    .query(async ({ input }) => {
      const config = getConfigData(input.configName);

      if (!config) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Config was not found',
        });
      }

      const mergedApps = mergeClientAppsIntoServerApps(input.apps, config.apps);

      const servers = await Promise.all(
        mergedApps.map(async (app) => {
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
        servers,
      };
    }),
});

const handleServer = async (app: ClientApp) => {
  switch (app.integration?.type) {
    case 'jellyfin': {
      const username = app.integration.properties.find((x) => x.field === 'username');

      if (!username || !username.value) {
        return {
          appId: app.id,
          serverAddress: app.url,
          sessions: [],
          type: 'jellyfin',
          version: undefined,
          success: false,
        } satisfies GenericMediaServer;
      }

      const password = app.integration.properties.find((x) => x.field === 'password');

      if (!password || !password.value) {
        return {
          appId: app.id,
          serverAddress: app.url,
          sessions: [],
          type: 'jellyfin',
          version: undefined,
          success: false,
        } satisfies GenericMediaServer;
      }

      const api = jellyfin.createApi(app.url);
      const infoApi = await getSystemApi(api).getPublicSystemInfo();
      await api.authenticateUserByName(username.value, password.value);
      const sessionApi = await getSessionApi(api);
      const sessions = await sessionApi.getSessions();
      return {
        type: 'jellyfin',
        appId: app.id,
        serverAddress: app.url,
        version: infoApi.data.Version ?? undefined,
        sessions: sessions.data.map(
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
      } satisfies GenericMediaServer;
    }
    case 'plex': {
      const apiKey = app.integration.properties.find((x) => x.field === 'apiKey');

      if (!apiKey || !apiKey.value) {
        return {
          serverAddress: app.url,
          sessions: [],
          type: 'plex',
          appId: app.id,
          version: undefined,
          success: false,
        } satisfies GenericMediaServer;
      }

      const plexClient = new PlexClient(app.url, apiKey.value);
      const sessions = await plexClient.getSessions();
      return {
        serverAddress: app.url,
        sessions,
        type: 'plex',
        version: undefined,
        appId: app.id,
        success: true,
      } satisfies GenericMediaServer;
    }
    default: {
      throw new Error(`Unable to find media server for integration ${app.integration.type}`);
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
