import { GenericSessionInfo } from './session-info';

export type GenericMediaServer = {
  /**
   * The type of the media server.
   * Undefined indicates, that the type is either unsupported or recognizing went wrong
   */
  type: 'jellyfin' | 'plex' | undefined;

  /**
   * The address of the server
   */
  serverAddress: string;

  /**
   * The current version of the server
   */
  version: string | undefined;

  /**
   * The active sessions on the server
   */
  sessions: GenericSessionInfo[];

  /**
   * The app id of the used app
   */
  appId: string;

  /**
   * Indicates, wether the communication was successfull or not
   */
  success: boolean;
};
