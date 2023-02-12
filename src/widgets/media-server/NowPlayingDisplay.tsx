import { Flex, Group, Text } from '@mantine/core';
import {
  IconDeviceTv,
  IconHeadphones,
  IconQuestionMark,
  IconVideo,
  TablerIcon,
} from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { GenericSessionInfo } from '../../types/api/media-server/session-info';

export const NowPlayingDisplay = ({ session }: { session: GenericSessionInfo }) => {
  const { t } = useTranslation();

  if (!session.currentlyPlaying) {
    return null;
  }

  const Icon = (): TablerIcon => {
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
      <Group spacing="xs">
        <Text lineClamp={1}>{session.currentlyPlaying.name}</Text>
      </Group>
    </Flex>
  );
};
