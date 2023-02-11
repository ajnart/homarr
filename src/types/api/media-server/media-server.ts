import { GenericSessionInfo } from './session-info';

export type GenericMediaServer = {
  type: 'jellyfin'; // TODO: Add plex later
  serverAddress: string;
  version: string;
  sessions: GenericSessionInfo[];
};
