/* eslint-disable @next/next/no-img-element */
import {
  Badge,
  Flex,
  Group,
  List,
  MantineColor,
  Progress,
  Stack,
  Text,
  useMantineTheme
} from '@mantine/core';
import {
  IconAffiliate,
  IconDatabase,
  IconDownload,
  IconFileInfo,
  IconInfoCircle,
  IconPercentage,
  IconSortDescending,
  IconUpload,
} from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { humanFileSize } from '~/tools/humanFileSize';
import { AppType } from '~/types/app';
import { TorrentTotalDownload } from '~/types/api/downloads/queue/NormalizedDownloadQueueResponse';

interface TorrentQueueItemProps {
  torrent: TorrentTotalDownload['torrents'][0];
  app?: AppType;
  width: number;
}

export const TorrentQueuePopover = ({ torrent, app }: Omit<TorrentQueueItemProps, 'width'>) => {
  const { t } = useTranslation('modules/torrents-status');
  const { colors } = useMantineTheme();

  const RatioMetric = () => {
    const color = (): MantineColor => {
      if (torrent.ratio < 1) {
        return colors.red[7];
      }

      if (torrent.ratio < 1.15) {
        return colors.orange[7];
      }

      return colors.green[7];
    };
    return (
      <Group spacing="xs">
        <Group spacing={3}>
          <Text>{t('card.popover.metrics.ratio')}</Text>

          <Text color={color()} weight="bold">
            {torrent.ratio.toFixed(2)}
          </Text>
        </Group>
      </Group>
    );
  };

  return (
    <Stack spacing="xs">
      {app && (
        <Group spacing={3}>
          <Text size="xs" color="dimmed">
            {t('card.popover.introductionPrefix')}
          </Text>
          <img src={app.appearance.iconUrl} alt="download client logo" width={15} height={15} />
          <Text size="xs" color="dimmed">
            {app.name}
          </Text>
        </Group>
      )}

      <List>
        <List.Item icon={<IconFileInfo size={16} />}>
          <Text
            style={{
              display: 'inline-block',
              wordBreak: 'break-word',
            }}
          >
            {torrent.name}
          </Text>
        </List.Item>
        <List.Item icon={<IconAffiliate size={16} />}>
          <RatioMetric />
        </List.Item>
        <List.Item icon={<IconSortDescending size={16} />}>
          <Group spacing="xs">
            <Text>
              {t('card.popover.metrics.queuePosition', { position: torrent.queuePosition })}
            </Text>
          </Group>
        </List.Item>
        <List.Item icon={<IconPercentage size={16} />}>
          <Group spacing="xs">
            <Text>
              {t('card.popover.metrics.progress', {
                progress: (torrent.progress * 100).toFixed(2),
              })}
              <Progress
                color={
                  torrent.progress === 1 ? 'green' : torrent.state === 'paused' ? 'yellow' : 'blue'
                }
                radius="md"
                size="sm"
                value={torrent.progress * 100}
                animate={torrent.state !== 'paused'}
              />
            </Text>
          </Group>
        </List.Item>
        <List.Item icon={<IconDatabase size={16} />}>
          <Text>
            {t('card.popover.metrics.totalSelectedSize', {
              totalSize: humanFileSize(torrent.totalSelected, false),
            })}
          </Text>
        </List.Item>
        <List.Item icon={<IconDownload size={16} />}>
          <Group spacing="xs">
            <Text>{humanFileSize(torrent.totalDownloaded, false)}</Text>
            <IconUpload size={16} />
            <Text>{humanFileSize(torrent.totalUploaded, false)}</Text>
          </Group>
        </List.Item>
        <List.Item icon={<IconInfoCircle size={16} />}>
          <Text>
            {t('card.popover.metrics.state', {
              state: torrent.stateMessage !== '' ? torrent.stateMessage : torrent.state,
            })}
          </Text>
        </List.Item>
        <Flex gap="sm" mt="md">
          {torrent.label && <Badge variant="outline">{torrent.label}</Badge>}
          {torrent.isCompleted && (
            <Badge variant="dot" color="green">
              {t('card.popover.metrics.completed')}
            </Badge>
          )}
        </Flex>
      </List>
    </Stack>
  );
};
