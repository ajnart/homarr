import { NormalizedTorrent } from '@ctrl/shared-torrent';
import { Tooltip, Text, Progress, useMantineTheme } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { calculateETA } from '../../tools/calculateEta';
import { humanFileSize } from '../../tools/humanFileSize';

interface BitTorrentQueueItemProps {
  torrent: NormalizedTorrent;
}

export const BitTorrrentQueueItem = ({ torrent }: BitTorrentQueueItemProps) => {
  const MIN_WIDTH_MOBILE = useMantineTheme().breakpoints.xs;
  const { width } = useElementSize();

  const downloadSpeed = torrent.downloadSpeed / 1024 / 1024;
  const uploadSpeed = torrent.uploadSpeed / 1024 / 1024;
  const size = torrent.totalSelected;
  return (
    <tr key={torrent.id}>
      <td>
        <Tooltip position="top" withinPortal label={torrent.name}>
          <Text
            style={{
              maxWidth: '30vw',
            }}
            size="xs"
            lineClamp={1}
          >
            {torrent.name}
          </Text>
        </Tooltip>
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
