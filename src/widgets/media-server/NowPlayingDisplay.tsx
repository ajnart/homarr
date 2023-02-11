import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models';
import { Group, Text } from '@mantine/core';
import {
  IconBook,
  IconBrandZoom,
  IconDeviceTv,
  IconHeadphones,
  IconMovie,
  IconPlaylist,
  IconQuestionMark,
  IconVideo,
  TablerIcon,
} from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { PlexSession } from '../../tools/server/sdk/plex/plexClient';
import {
  GenericSessionInfo,
  JellyfinSessionInfo,
  PlexSessionInfo,
} from '../../types/api/media-server/session-info';

export const NowPlayingDisplay = ({ session }: { session: GenericSessionInfo }) => {
  const { t } = useTranslation();

  switch (session.type) {
    case 'jellyfin':
      return <NowPlayingDisplayJellyin session={session} />;
    case 'plex':
      return <NowPlayingDisplayPlex session={session} />;
    default:
      return null;
  }
};

const NowPlayingDisplayPlex = ({ session }: { session: PlexSessionInfo }) => {
  if (!session.nowPlayingItem) {
    return null;
  }

  const PlexIcon = PlexTypeIcon({ type: session.nowPlayingItem.type });

  return (
    <Group spacing="sm">
      <PlexIcon size={14} />
      <Group spacing="xs">
        <Text>{session.nowPlayingItem.title}</Text>
      </Group>
    </Group>
  );
};

const NowPlayingDisplayJellyin = ({ session }: { session: JellyfinSessionInfo }) => {
  if (!session.nowPlayingItem) {
    return null;
  }

  const Test = BaseItemKindIcon({ kind: session.nowPlayingItem?.Type });

  return (
    <Group spacing="sm">
      <Test size={14} />
      <Group spacing="xs">
        <Text>{session.nowPlayingItem.Name}</Text>
        {session.nowPlayingItem.SeasonName && <Text>- {session.nowPlayingItem.SeasonName}</Text>}
      </Group>
    </Group>
  );
};

const PlexTypeIcon = ({ type }: { type: PlexSession['type'] }): TablerIcon => {
  switch (type) {
    case 'track':
      return IconHeadphones;
    case 'video':
      return IconVideo;
    default:
      return IconQuestionMark;
  }
};

const BaseItemKindIcon = ({ kind }: { kind?: BaseItemKind }): TablerIcon => {
  switch (kind) {
    case BaseItemKind.Audio:
      return IconHeadphones;
    case BaseItemKind.Episode:
    case BaseItemKind.Movie:
      return IconMovie;
    case BaseItemKind.Video:
    case BaseItemKind.MusicVideo:
      return IconBrandZoom;
    case BaseItemKind.TvChannel:
    case BaseItemKind.TvProgram:
    case BaseItemKind.LiveTvChannel:
    case BaseItemKind.LiveTvProgram:
      return IconDeviceTv;
    case BaseItemKind.Playlist:
    case BaseItemKind.PlaylistsFolder:
      return IconPlaylist;
    case BaseItemKind.Book:
      return IconBook;
    default:
      return IconQuestionMark;
  }
};
