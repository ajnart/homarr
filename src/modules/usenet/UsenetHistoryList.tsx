import { Center, Table, Text, Title, Tooltip, useMantineTheme } from '@mantine/core';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { FunctionComponent } from 'react';
import { humanFileSize } from '../../tools/humanFileSize';
import { UsenetHistoryItem } from './types';

dayjs.extend(duration);

interface UsenetHistoryListProps {
  items: UsenetHistoryItem[];
}

export const UsenetHistoryList: FunctionComponent<UsenetHistoryListProps> = ({ items }) => {
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
      <colgroup>
        <col span={1} />
        <col span={1} style={{ width: 100 }} />
        <col span={1} style={{ width: 200 }} />
      </colgroup>
      <thead>
        <tr>
          <th>Name</th>
          <th>Size</th>
          <th>Download Duration</th>
        </tr>
      </thead>
      <tbody>
        {items.map((history) => (
          <tr key={history.id}>
            <td>
              <Tooltip position="top" label={history.name}>
                <Text
                  size="xs"
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {history.name}
                </Text>
              </Tooltip>
            </td>
            <td>
              <Text size="xs">{humanFileSize(history.size)}</Text>
            </td>
            <td>
              <Text size="xs">
                {dayjs
                  .duration(history.time, 's')
                  .format(history.time < 60 ? 's [seconds]' : 'm [minutes] s [seconds] ')}
              </Text>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
