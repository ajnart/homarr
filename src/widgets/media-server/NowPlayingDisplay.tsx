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
  TablerIcon,
} from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { JellyfinSessionInfo } from '../../types/api/media-server/session-info';

export const NowPlayingDisplay = ({ session }: { session: JellyfinSessionInfo }) => {
  const { t } = useTranslation();

  if (!session.nowPlayingItem) {
    return null;
  }

  const Test = BaseItemKindIcon({ kind: session.nowPlayingItem?.Type });

  return (
    <Group spacing="sm">
      <Test size={20} />
      <Group spacing="xs">
        <Text>{session.nowPlayingItem.Name}</Text>
        {session.nowPlayingItem.SeasonName && <Text>- {session.nowPlayingItem.SeasonName}</Text>}
      </Group>
    </Group>
  );
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
