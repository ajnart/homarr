import { Jellyfin } from '@jellyfin/sdk';
import { getSystemApi } from '@jellyfin/sdk/lib/utils/api/system-api';
import { getSessionApi } from '@jellyfin/sdk/lib/utils/api/session-api';

import { NextApiRequest, NextApiResponse } from 'next';
import { MediaServersResponseType } from '../../../../types/api/media-server/response';

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
  const api = jellyfin.createApi('nope');
  const info = await getSystemApi(api).getPublicSystemInfo();
  await api.authenticateUserByName('nope', 'nope');
  const test = await getSessionApi(api);
  const sessions = await test.getSessions();
  console.log(info.data);
  console.log(sessions.data);
  return response.status(200).json({
    servers: [
      {
        type: 'jellyfin',
        serverAddress: info.data.LocalAddress,
        version: info.data.Version,
        sessions: sessions.data.map((session) => ({
          type: 'jellyfin',
          username: session.UserName,
          sessionName: `${session.Client} (${session.DeviceName})`,
          supportsMediaControl: session.SupportsMediaControl,
          nowPlayingItem: session.NowPlayingItem,
        })),
      },
    ],
  } as MediaServersResponseType);
};

export default async (request: NextApiRequest, response: NextApiResponse) => {
  if (request.method === 'GET') {
    return Get(request, response);
  }

  return response.status(405);
};
