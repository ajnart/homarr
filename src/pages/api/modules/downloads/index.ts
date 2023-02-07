import { Deluge } from '@ctrl/deluge';
import { QBittorrent } from '@ctrl/qbittorrent';
import { Transmission } from '@ctrl/transmission';
import { AllClientData } from '@ctrl/shared-torrent';

import Consola from 'consola';

import { getCookie } from 'cookies-next';

import dayjs from 'dayjs';

import { NextApiRequest, NextApiResponse } from 'next';

import { Client } from 'sabnzbd-api';

import { NzbgetClient } from '../usenet/nzbget/nzbget-client';
import { NzbgetQueueItem, NzbgetStatus } from '../usenet/nzbget/types';
import { ConfigAppType, IntegrationField } from '../../../../types/app';
import { getConfig } from '../../../../tools/config/getConfig';
import { UsenetQueueItem } from '../../../../widgets/useNet/types';
import {
  NormalizedDownloadAppStat,
  NormalizedDownloadQueueResponse,
} from '../../../../types/api/downloads/queue/NormalizedDownloadQueueResponse';

const Get = async (request: NextApiRequest, response: NextApiResponse) => {
  const configName = getCookie('config-name', { req: request });
  const config = getConfig(configName?.toString() ?? 'default');

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
        `Error communicating with your download client '${app.name}' (${app.id}): ${err}`
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

  const responseBody = { apps: data, failedApps: failedClients } as NormalizedDownloadQueueResponse;

  if (failedClients.length > 0) {
    Consola.warn(`${failedClients.length} download clients failed. Please check your configuration and the above log`);
  }

  return response.status(200).json(responseBody);
};

const GetDataFromClient = async (
  app: ConfigAppType
): Promise<NormalizedDownloadAppStat | undefined> => {
  const reduceTorrent = (data: AllClientData): NormalizedDownloadAppStat => ({
    type: 'torrent',
    appId: app.id,
    success: true,
    torrents: data.torrents,
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
        }).getAllData()
      );
    }
    case 'transmission': {
      return reduceTorrent(
        await new Transmission({
          baseUrl: app.url,
          username: findField(app, 'username'),
          password: findField(app, 'password'),
        }).getAllData()
      );
    }
    case 'qBittorrent': {
      return reduceTorrent(
        await new QBittorrent({
          baseUrl: app.url,
          username: findField(app, 'username'),
          password: findField(app, 'password'),
        }).getAllData()
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
        port: url.port,
        login: app.integration.properties.find((x) => x.field === 'username')?.value ?? undefined,
        hash: app.integration.properties.find((x) => x.field === 'password')?.value ?? undefined,
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
        totalDownload: 0,
      };
    }
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
