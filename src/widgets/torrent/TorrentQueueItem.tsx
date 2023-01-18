/* eslint-disable @next/next/no-img-element */
import { NormalizedTorrent } from '@ctrl/shared-torrent';
import {
  Badge,
  Flex,
  Group,
  MantineColor,
  Popover,
  Progress,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure, useElementSize } from '@mantine/hooks';
import {
  IconAffiliate,
  IconDatabase,
  IconDownload,
  IconInfoCircle,
  IconPercentage,
  IconSortDescending,
  IconUpload,
} from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { calculateETA } from '../../tools/calculateEta';
import { humanFileSize } from '../../tools/humanFileSize';
import { AppType } from '../../types/app';

interface TorrentQueueItemProps {
  torrent: NormalizedTorrent;
  app?: AppType;
}

export const BitTorrrentQueueItem = ({ torrent, app }: TorrentQueueItemProps) => {
  const [popoverOpened, { open: openPopover, close: closePopover }] = useDisclosure(false);
  const MIN_WIDTH_MOBILE = useMantineTheme().breakpoints.xs;
  const { width } = useElementSize();

  const downloadSpeed = torrent.downloadSpeed / 1024 / 1024;
  const uploadSpeed = torrent.uploadSpeed / 1024 / 1024;
  const size = torrent.totalSelected;
  return (
    <tr key={torrent.id}>
      <td>
        <Popover opened={popoverOpened} width={350} position="top" withinPortal>
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
                  Managed by {app.name}, {torrent.ratio.toFixed(2)} ratio
                </Text>
              )}
            </div>
          </Popover.Target>
        </Popover>
      </td>
      <td>
        <Text size="xs">{humanFileSize(size)}</Text>
      </td>
      {width > MIN_WIDTH_MOBILE && (
        <td>
          <Text size="xs">{downloadSpeed > 0 ? `${downloadSpeed.toFixed(1)} Mb/s` : '-'}</Text>
        </td>
      )}
      {width > MIN_WIDTH_MOBILE && (
        <td>
          <Text size="xs">{uploadSpeed > 0 ? `${uploadSpeed.toFixed(1)} Mb/s` : '-'}</Text>
        </td>
      )}
      {width > MIN_WIDTH_MOBILE && (
        <td>
          <Text size="xs">{torrent.eta <= 0 ? '∞' : calculateETA(torrent.eta)}</Text>
        </td>
      )}
      <td>
        <Text>{(torrent.progress * 100).toFixed(1)}%</Text>
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

const TorrentQueuePopover = ({ torrent, app }: TorrentQueueItemProps) => {
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
        <IconAffiliate size={16} />
        <Group spacing={3}>
          <Text>Ratio -</Text>

          <Text color={color()} weight="bold">
            {torrent.ratio.toFixed(2)}
          </Text>
        </Group>
      </Group>
    );
  };

  return (
    <>
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
      <Text mb="md" weight="bold">
        {torrent.name}
      </Text>

      <RatioMetric />
      <Group spacing="xs">
        <IconSortDescending size={16} />
        <Text>{t('card.popover.metrics.queuePosition', { position: torrent.queuePosition })}</Text>
      </Group>

      <Group spacing="xs">
        <IconPercentage size={16} />
        <Text>
          {t('card.popover.metrics.progress', { progress: (torrent.progress * 100).toFixed(2) })}
        </Text>
      </Group>
      <Group spacing="xs">
        <IconDatabase size={16} />
        <Text>
          {t('card.popover.metrics.totalSelectedSize', {
            totalSize: humanFileSize(torrent.totalSelected),
          })}
        </Text>
      </Group>
      <Group>
        <Group spacing="xs">
          <IconDownload size={16} />
          <Text>{humanFileSize(torrent.totalDownloaded)}</Text>
        </Group>
        <Group spacing="xs">
          <IconUpload size={16} />
          <Text>{humanFileSize(torrent.totalUploaded)}</Text>
        </Group>
      </Group>

      <Group spacing="xs">
        <IconInfoCircle size={16} />
        <Text>{t('card.popover.metrics.state', { state: torrent.stateMessage })}</Text>
      </Group>

      <Flex mt="md" mb="xs" gap="sm">
        {torrent.label && <Badge variant="outline">{torrent.label}</Badge>}
        {torrent.isCompleted && (
          <Badge variant="dot" color="green">
            {t('card.popover.metrics.completed')}
          </Badge>
        )}
      </Flex>
    </>
  );
};
