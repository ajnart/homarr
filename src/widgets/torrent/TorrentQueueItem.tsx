/* eslint-disable @next/next/no-img-element */
import { NormalizedTorrent } from '@ctrl/shared-torrent';
import {
  Badge,
  Flex,
  Group,
  List,
  MantineColor,
  Popover,
  Progress,
  Stack,
  Text,
  createStyles,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure, useElementSize } from '@mantine/hooks';
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
import { MIN_WIDTH_MOBILE } from '~/constants/constants';

import { calculateETA } from '../../tools/client/calculateEta';
import { humanFileSize } from '../../tools/humanFileSize';
import { AppType } from '../../types/app';

interface TorrentQueueItemProps {
  torrent: NormalizedTorrent;
  app?: AppType;
  width: number;
}

export const BitTorrrentQueueItem = ({ torrent, width, app }: TorrentQueueItemProps) => {
  const [popoverOpened, { open: openPopover, close: closePopover }] = useDisclosure(false);
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const { t } = useTranslation('modules/torrents-status');

  const downloadSpeed = torrent.downloadSpeed / 1024 / 1024;
  const uploadSpeed = torrent.uploadSpeed / 1024 / 1024;
  const size = torrent.totalSelected;
  return (
    <tr key={torrent.id} className={classes.transparentBackground}>
      <td>
        <Popover opened={popoverOpened} radius="md" shadow="md" width={350} withinPortal>
          <Popover.Dropdown>
            <TorrentQueuePopover torrent={torrent} app={app} />
          </Popover.Dropdown>
          <Popover.Target>
            <div onMouseEnter={openPopover} onMouseLeave={closePopover}>
              <Text
                style={{
                  maxWidth: '30vw',
                }}
                size="xs"
                lineClamp={1}
              >
                {torrent.name}
              </Text>
              {app && (
                <Text size="xs" color="dimmed">
                  {t('card.table.item.text', {
                    appName: app.name,
                    ratio: torrent.ratio.toFixed(2),
                  })}
                </Text>
              )}
            </div>
          </Popover.Target>
        </Popover>
      </td>
      <td>
        <Text className={classes.noTextBreak} size="xs">
          {humanFileSize(size, false)}
        </Text>
      </td>
      {width > MIN_WIDTH_MOBILE && (
        <td>
          <Text className={classes.noTextBreak} size="xs">
            {downloadSpeed > 0 ? `${downloadSpeed.toFixed(1)} Mb/s` : '-'}
          </Text>
        </td>
      )}
      {width > MIN_WIDTH_MOBILE && (
        <td>
          <Text className={classes.noTextBreak} size="xs">
            {uploadSpeed > 0 ? `${uploadSpeed.toFixed(1)} Mb/s` : '-'}
          </Text>
        </td>
      )}
      {width > MIN_WIDTH_MOBILE && (
        <td>
          <Text className={classes.noTextBreak} size="xs">
            {torrent.eta <= 0 ? '∞' : calculateETA(torrent.eta)}
          </Text>
        </td>
      )}
      <td>
        <Text className={classes.noTextBreak}>{(torrent.progress * 100).toFixed(1)}%</Text>
        <Progress
          radius="lg"
          color={torrent.progress === 1 ? 'green' : torrent.state === 'paused' ? 'yellow' : 'blue'}
          value={torrent.progress * 100}
          size="lg"
        />
      </td>
    </tr>
  );
};

const TorrentQueuePopover = ({ torrent, app }: Omit<TorrentQueueItemProps, 'width'>) => {
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

const useStyles = createStyles(() => ({
  noTextBreak: {
    whiteSpace: 'nowrap',
  },
  transparentBackground: {
    backgroundColor: 'transparent',
  },
}));
