import { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import { PlexSession } from '../../../tools/server/sdk/plex/plexClient';

export type GenericSessionInfo = {
  supportsMediaControl: boolean;
  username: string | undefined;
  sessionName: string;
} & (JellyfinSessionInfo | PlexSessionInfo);

export type JellyfinSessionInfo = {
  type: 'jellyfin';
  supportsMediaControl: boolean;
  nowPlayingItem: BaseItemDto | undefined;
};

export type PlexSessionInfo = {
  nowPlayingItem: {
    title: string;
    type: PlexSession['type'];
  },
  userThumb: string | undefined;
  type: 'plex';
};
