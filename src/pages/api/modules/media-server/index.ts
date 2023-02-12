import { Jellyfin } from '@jellyfin/sdk';
import { getSessionApi } from '@jellyfin/sdk/lib/utils/api/session-api';
import { getSystemApi } from '@jellyfin/sdk/lib/utils/api/system-api';

import Consola from 'consola';

import { getCookie } from 'cookies-next';

import { NextApiRequest, NextApiResponse } from 'next';

import { BaseItemKind, ProgramAudio } from '@jellyfin/sdk/lib/generated-client/models';
import { getConfig } from '../../../../tools/config/getConfig';
import { PlexClient } from '../../../../tools/server/sdk/plex/plexClient';
import { GenericMediaServer } from '../../../../types/api/media-server/media-server';
import { MediaServersResponseType } from '../../../../types/api/media-server/response';
import {
  GenericCurrentlyPlaying,
  GenericSessionInfo,
} from '../../../../types/api/media-server/session-info';
import { ConfigAppType } from '../../../../types/app';

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

const Get = async (request: NextApiRequest, response: NextApiResponse) => {
  const configName = getCookie('config-name', { req: request });
  const config = getConfig(configName?.toString() ?? 'default');

  const apps = config.apps.filter((app) =>
    ['jellyfin', 'plex'].includes(app.integration?.type ?? '')
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

  return response.status(200).json({
    servers: servers.filter((server) => server !== undefined),
  } as MediaServersResponseType);
};

const handleServer = async (app: ConfigAppType): Promise<GenericMediaServer | undefined> => {
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
        };
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
        };
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
            username: session.UserName ?? undefined,
            sessionName: `${session.Client} (${session.DeviceName})`,
            supportsMediaControl: session.SupportsMediaControl ?? false,
            currentlyPlaying: session.NowPlayingItem
              ? {
                  name: session.NowPlayingItem.Name as string,
                  seasonName: session.NowPlayingItem.SeasonName as string,
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
      const apiKey = app.integration.properties.find((x) => x.field === 'apiKey');

      if (!apiKey || !apiKey.value) {
        return {
          serverAddress: app.url,
          sessions: [],
          type: 'plex',
          appId: app.id,
          version: undefined,
          success: false,
        };
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

export default async (request: NextApiRequest, response: NextApiResponse) => {
  if (request.method === 'GET') {
    return Get(request, response);
  }

  return response.status(405);
};
