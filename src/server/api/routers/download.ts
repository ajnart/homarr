import { Deluge } from '@ctrl/deluge';
import { QBittorrent } from '@ctrl/qbittorrent';
import { AllClientData } from '@ctrl/shared-torrent';
import { Transmission } from '@ctrl/transmission';
import Consola from 'consola';
import dayjs from 'dayjs';
import { Client } from 'sabnzbd-api';
import { z } from 'zod';
import { NzbgetClient } from '~/server/api/routers/usenet/nzbget/nzbget-client';
import { NzbgetQueueItem, NzbgetStatus } from '~/server/api/routers/usenet/nzbget/types';
import { findAppProperty } from '~/tools/client/app-properties';
import { getConfig } from '~/tools/config/getConfig';
import {
  NormalizedDownloadAppStat,
  NormalizedDownloadQueueResponse,
} from '~/types/api/downloads/queue/NormalizedDownloadQueueResponse';
import { ConfigAppType, IntegrationField } from '~/types/app';
import { UsenetQueueItem } from '~/widgets/useNet/types';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const downloadRouter = createTRPCRouter({
  get: publicProcedure
    .input(
      z.object({
        configName: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const config = getConfig(input.configName);

      const failedClients: string[] = [];

      const clientData: Promise<NormalizedDownloadAppStat>[] = config.apps.map(async (app) => {
        try {
          const response = await GetDataFromClient(app);

          if (!response) {
            return {
              success: false,
            } as NormalizedDownloadAppStat;
          }

          return response;
        } catch (err: any) {
          Consola.error(
            `Error communicating with your download client '${app.name}' (${app.id}): ${err}`,
          );
          failedClients.push(app.id);
          return {
            success: false,
          } as NormalizedDownloadAppStat;
        }
      });

      const settledPromises = await Promise.allSettled(clientData);

      const data: NormalizedDownloadAppStat[] = settledPromises
        .filter((x) => x.status === 'fulfilled')
        .map((promise) => (promise as PromiseFulfilledResult<NormalizedDownloadAppStat>).value)
        .filter((x) => x !== undefined && x.type !== undefined);

      const responseBody = {
        apps: data,
        failedApps: failedClients,
      } as NormalizedDownloadQueueResponse;

      if (failedClients.length > 0) {
        Consola.warn(
          `${failedClients.length} download clients failed. Please check your configuration and the above log`,
        );
      }

      return responseBody;
    }),
});

const GetDataFromClient = async (
  app: ConfigAppType,
): Promise<NormalizedDownloadAppStat | undefined> => {
  const reduceTorrent = (data: AllClientData): NormalizedDownloadAppStat => ({
    type: 'torrent',
    appId: app.id,
    success: true,
    torrents: data.torrents.map((torrent) => ({
      name: torrent.name,
      eta: torrent.eta,
      state: torrent.state,
      progress: torrent.progress,
      totalSeeds: torrent.totalSeeds,
      totalSelected: torrent.totalSelected,
      totalPeers: torrent.totalPeers,
      ratio: torrent.ratio,
      uploadSpeed: torrent.uploadSpeed,
      downloadSpeed: torrent.downloadSpeed,
      isCompleted: torrent.isCompleted,
      totalDownloaded: torrent.totalDownloaded,
      totalUploaded: torrent.totalUploaded,
      label: torrent.label,
      queuePosition: torrent.queuePosition,
      stateMessage: torrent.stateMessage,
      dateAdded: torrent.dateAdded
    })),
    totalDownload: data.torrents
      .map((torrent) => torrent.downloadSpeed)
      .reduce((acc, torrent) => acc + torrent, 0),
    totalUpload: data.torrents
      .map((torrent) => torrent.uploadSpeed)
      .reduce((acc, torrent) => acc + torrent, 0),
  });

  const findField = (app: ConfigAppType, field: IntegrationField) =>
    app.integration?.properties.find((x) => x.field === field)?.value ?? undefined;

  switch (app.integration?.type) {
    case 'deluge': {
      return reduceTorrent(
        await new Deluge({
          baseUrl: app.url,
          password: findField(app, 'password'),
        }).getAllData(),
      );
    }
    case 'transmission': {
      return reduceTorrent(
        await new Transmission({
          baseUrl: app.url,
          username: findField(app, 'username'),
          password: findField(app, 'password'),
        }).getAllData(),
      );
    }
    case 'qBittorrent': {
      return reduceTorrent(
        await new QBittorrent({
          baseUrl: app.url,
          username: findField(app, 'username'),
          password: findField(app, 'password'),
        }).getAllData(),
      );
    }
    case 'sabnzbd': {
      const { origin } = new URL(app.url);
      const client = new Client(origin, findField(app, 'apiKey') ?? '');
      const queue = await client.queue();
      const items: UsenetQueueItem[] = queue.slots.map((slot) => {
        const [hours, minutes, seconds] = slot.timeleft.split(':');
        const eta = dayjs.duration({
          hour: parseInt(hours, 10),
          minutes: parseInt(minutes, 10),
          seconds: parseInt(seconds, 10),
        } as any);

        return {
          id: slot.nzo_id,
          eta: eta.asSeconds(),
          name: slot.filename,
          progress: parseFloat(slot.percentage),
          size: parseFloat(slot.mb) * 1000 * 1000,
          state: slot.status.toLowerCase() as any,
        };
      });
      const killobitsPerSecond = Number(queue.kbpersec);
      const bytesPerSecond = killobitsPerSecond * 1024; // convert killobytes to bytes
      return {
        type: 'usenet',
        appId: app.id,
        totalDownload: bytesPerSecond,
        nzbs: items,
        success: true,
      };
    }
    case 'nzbGet': {
      const url = new URL(app.url);
      const options = {
        host: url.hostname,
        port: url.port || (url.protocol === 'https:' ? '443' : '80'),
        login: findAppProperty(app, 'username'),
        hash: findAppProperty(app, 'password'),
      };

      const nzbGet = NzbgetClient(options);
      const nzbgetQueue: NzbgetQueueItem[] = await new Promise((resolve, reject) => {
        nzbGet.listGroups((err: any, result: NzbgetQueueItem[]) => {
          if (!err) {
            resolve(result);
          } else {
            Consola.error(`Error while listing groups: ${err}`);
            reject(err);
          }
        });
      });
      if (!nzbgetQueue) {
        throw new Error('Error while getting NZBGet queue');
      }

      const nzbgetStatus: NzbgetStatus = await new Promise((resolve, reject) => {
        nzbGet.status((err: any, result: NzbgetStatus) => {
          if (!err) {
            resolve(result);
          } else {
            Consola.error(`Error while retrieving NZBGet stats: ${err}`);
            reject(err);
          }
        });
      });

      if (!nzbgetStatus) {
        throw new Error('Error while getting NZBGet status');
      }

      const nzbgetItems: UsenetQueueItem[] = nzbgetQueue.map((item: NzbgetQueueItem) => ({
        id: item.NZBID.toString(),
        name: item.NZBName,
        progress: (item.DownloadedSizeMB / item.FileSizeMB) * 100,
        eta: (item.RemainingSizeMB * 1000000) / nzbgetStatus.DownloadRate,
        // Multiple MB to get bytes
        size: item.FileSizeMB * 1000 * 1000,
        state: getNzbgetState(item.Status),
      }));

      return {
        type: 'usenet',
        appId: app.id,
        nzbs: nzbgetItems,
        success: true,
        totalDownload: nzbgetStatus.DownloadRate,
      };
    }
    default:
      return undefined;
  }
};

function getNzbgetState(status: string) {
  switch (status) {
    case 'QUEUED':
      return 'queued';
    case 'PAUSED ':
      return 'paused';
    default:
      return 'downloading';
  }
}
