import { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';

export type GenericSessionInfo = {
  supportsMediaControl: boolean;
  username: string;
  sessionName: string;
} & JellyfinSessionInfo;

export type JellyfinSessionInfo = {
  type: 'jellyfin';
  supportsMediaControl: boolean;
  nowPlayingItem: BaseItemDto | undefined;
};
