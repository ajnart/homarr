import { Center, Progress, Table, Text, Title, Tooltip, useMantineTheme } from '@mantine/core';
import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { FunctionComponent } from 'react';
import { humanFileSize } from '../../tools/humanFileSize';
import { UsenetQueueItem } from './types';

dayjs.extend(duration);
interface UsenetQueueListProps {
  items: UsenetQueueItem[];
}

export const UsenetQueueList: FunctionComponent<UsenetQueueListProps> = ({ items }) => {
  const theme = useMantineTheme();

  if (items.length <= 0) {
    return (
      <Center style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Title order={3}>Queue is empty</Title>
      </Center>
    );
  }

  return (
    <Table highlightOnHover style={{ tableLayout: 'fixed' }}>
      <thead>
        <tr>
          <th style={{ width: 40 }} />
          <th style={{ width: '75%' }}>Name</th>
          <th style={{ width: 100 }}>Size</th>
          <th style={{ width: 100 }}>ETA</th>
          <th style={{ width: 200 }}>Progress</th>
        </tr>
      </thead>
      <tbody>
        {items.map((nzb) => (
          <tr key={nzb.id}>
            <td>
              {nzb.state === 'paused' ? (
                <IconPlayerPause fill="grey" stroke={0} size="16" />
              ) : (
                <IconPlayerPlay fill="black" stroke={0} size="16" />
              )}
            </td>
            <td>
              <Tooltip position="top" label={nzb.name}>
                <Text
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  size="xs"
                >
                  {nzb.name}
                </Text>
              </Tooltip>
            </td>
            <td>
              <Text size="xs">{humanFileSize(nzb.size)}</Text>
            </td>
            <td>
              {nzb.eta <= 0 ? (
                <Text size="xs" color="dimmed">
                  Paused
                </Text>
              ) : (
                <Text size="xs">{dayjs.duration(nzb.eta, 's').format('H:mm:ss')}</Text>
              )}
            </td>
            <td style={{ display: 'flex', alignItems: 'center' }}>
              <Text mr="sm">{nzb.progress.toFixed(1)}%</Text>
              <Progress
                radius="lg"
                color={nzb.eta > 0 ? theme.primaryColor : 'lightgrey'}
                value={nzb.progress}
                size="lg"
                style={{ width: '100%' }}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
