import { Flex, Stack, Text } from '@mantine/core';
import {
  IconDeviceTv,
  IconHeadphones,
  IconQuestionMark,
  IconVideo,
  Icon,
} from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { GenericSessionInfo } from '../../types/api/media-server/session-info';

export const NowPlayingDisplay = ({ session }: { session: GenericSessionInfo }) => {
  const { t } = useTranslation();

  if (!session.currentlyPlaying) {
    return null;
  }

  const Icon = (): Icon => {
    switch (session.currentlyPlaying?.type) {
      case 'audio':
        return IconHeadphones;
      case 'tv':
        return IconDeviceTv;
      case 'video':
        return IconVideo;
      default:
        return IconQuestionMark;
    }
  };

  const Test = Icon();
  return (
    <Flex wrap="nowrap" gap="sm" align="center">
      <Test size={16} />
      <Stack spacing={0} w={200}>
        <Text lineClamp={1}>{session.currentlyPlaying.name}</Text>

        {session.currentlyPlaying.albumName ? (
          <Text lineClamp={1} color="dimmed" size="xs">
            {session.currentlyPlaying.albumName}
          </Text>
        ) : (
          session.currentlyPlaying.seasonName && (
            <Text lineClamp={2} color="dimmed" size="xs">
              {session.currentlyPlaying.seasonName} - {session.currentlyPlaying.episodeName}
            </Text>
          )
        )}
      </Stack>
    </Flex>
  );
};
