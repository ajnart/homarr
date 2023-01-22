import { Deluge } from '@ctrl/deluge';
import { QBittorrent } from '@ctrl/qbittorrent';
import { AllClientData } from '@ctrl/shared-torrent';
import { Transmission } from '@ctrl/transmission';
import Consola from 'consola';
import { getCookie } from 'cookies-next';
import { NextApiRequest, NextApiResponse } from 'next';
import { getConfig } from '../../../tools/config/getConfig';
import { NormalizedTorrentListResponse } from '../../../types/api/NormalizedTorrentListResponse';
import { ConfigAppType, IntegrationType } from '../../../types/app';

const supportedTypes: IntegrationType[] = ['deluge', 'qBittorrent', 'transmission'];

async function Post(req: NextApiRequest, res: NextApiResponse<NormalizedTorrentListResponse>) {
  // Get the type of app from the request url
  const configName = getCookie('config-name', { req });
  const config = getConfig(configName?.toString() ?? 'default');

  const clientApps = config.apps.filter(
    (app) =>
      app.integration && app.integration.type && supportedTypes.includes(app.integration.type)
  );

  if (clientApps.length < 1) {
    return res.status(500).json({
      allSuccess: false,
      missingDownloadClients: true,
      labels: [],
      torrents: [],
    });
  }

  const promiseList: Promise<ConcatenatedClientData>[] = [];

  for (let i = 0; i < clientApps.length; i += 1) {
    const app = clientApps[i];
    const getAllData = getAllDataForClient(app);
    if (!getAllData) {
      continue;
    }
    const concatenatedPromise = async (): Promise<ConcatenatedClientData> => ({
      clientData: await getAllData,
      appId: app.id,
    });
    promiseList.push(concatenatedPromise());
  }

  const settledPromises = await Promise.allSettled(promiseList);
  const fulfilledPromises = settledPromises.filter(
    (settledPromise) => settledPromise.status === 'fulfilled'
  );

  const fulfilledClientData: ConcatenatedClientData[] = fulfilledPromises.map(
    (fulfilledPromise) => (fulfilledPromise as PromiseFulfilledResult<ConcatenatedClientData>).value
  );

  const notFulfilledClientData = settledPromises
    .filter((x) => x.status === 'rejected')
    .map(
      (fulfilledPromise) =>
        (fulfilledPromise as PromiseRejectedResult)
  );

  notFulfilledClientData.forEach((result) => {
    Consola.error(`Error while communicating with torrent download client: ${result.reason}`);
  });

  Consola.info(
    `Successfully fetched data from ${fulfilledPromises.length} torrent download clients`
  );

  return res.status(200).json({
    labels: fulfilledClientData.flatMap((clientData) => clientData.clientData.labels),
    torrents: fulfilledClientData.map((clientData) => ({
      appId: clientData.appId,
      torrents: clientData.clientData.torrents,
    })),
    allSuccess: settledPromises.length === fulfilledPromises.length,
    missingDownloadClients: false,
  });
}

const getAllDataForClient = (app: ConfigAppType) => {
  switch (app.integration?.type) {
    case 'deluge': {
      const password =
        app.integration?.properties.find((x) => x.field === 'password')?.value ?? undefined;
      return new Deluge({
        baseUrl: app.url,
        password,
      }).getAllData();
    }
    case 'transmission': {
      return new Transmission({
        baseUrl: app.url,
        username:
          app.integration!.properties.find((x) => x.field === 'username')?.value ?? undefined,
        password:
          app.integration!.properties.find((x) => x.field === 'password')?.value ?? undefined,
      }).getAllData();
    }
    case 'qBittorrent': {
      return new QBittorrent({
        baseUrl: app.url,
        username:
          app.integration!.properties.find((x) => x.field === 'username')?.value ?? undefined,
        password:
          app.integration!.properties.find((x) => x.field === 'password')?.value ?? undefined,
      }).getAllData();
    }
    default:
      Consola.error(`unable to find torrent client of type '${app.integration?.type}'`);
      return undefined;
  }
};

type ConcatenatedClientData = {
  appId: string;
  clientData: AllClientData;
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // Filter out if the reuqest is a POST or a GET
  if (req.method === 'POST') {
    return Post(req, res);
  }
  return res.status(405).json({
    statusCode: 405,
    message: 'Method not allowed',
  });
};
