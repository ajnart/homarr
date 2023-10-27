import { Flex, Stack, Text } from '@mantine/core';
import {
  IconDeviceTv,
  IconHeadphones,
  IconMovie,
  IconQuestionMark,
  IconVideo,
} from '@tabler/icons-react';
import { GenericSessionInfo } from '~/types/api/media-server/session-info';

export const NowPlayingDisplay = ({ session }: { session: GenericSessionInfo }) => {
  if (!session.currentlyPlaying) {
    return null;
  }

  const IconSelector = () => {
    switch (session.currentlyPlaying?.type) {
      case 'audio':
        return IconHeadphones;
      case 'tv':
        return IconDeviceTv;
      case 'movie':
        return IconMovie;
      case 'video':
        return IconVideo;
      default:
        return IconQuestionMark;
    }
  };

  const Icon = IconSelector();

  return (
    <Flex wrap="nowrap" gap="sm" align="center">
      <Icon size={16} />
      <Stack spacing={0}>
        <Text lineClamp={1}>{session.currentlyPlaying.name}</Text>

        {session.currentlyPlaying.albumName ? (
          <Text lineClamp={1} color="dimmed" size="xs">
            {session.currentlyPlaying.albumName}
          </Text>
        ) : (
          session.currentlyPlaying.seasonName && (
            <Text lineClamp={1} color="dimmed" size="xs">
              {session.currentlyPlaying.seasonName} - {session.currentlyPlaying.episodeName}
            </Text>
          )
        )}
      </Stack>
    </Flex>
  );
};
