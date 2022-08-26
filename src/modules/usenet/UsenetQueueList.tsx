import {
  Alert,
  Center,
  Code,
  Group,
  Progress,
  Skeleton,
  Table,
  Text,
  Title,
  Tooltip,
  useMantineTheme,
} from '@mantine/core';
import { IconAlertCircle, IconPlayerPause, IconPlayerPlay } from '@tabler/icons';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { FunctionComponent, useState } from 'react';
import { useGetUsenetDownloads } from '../../tools/hooks/api';
import { humanFileSize } from '../../tools/humanFileSize';

dayjs.extend(duration);

interface UsenetQueueListProps {
  serviceId: string;
}

const PAGE_SIZE = 10;

export const UsenetQueueList: FunctionComponent<UsenetQueueListProps> = ({ serviceId }) => {
  const theme = useMantineTheme();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useGetUsenetDownloads({
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
    serviceId,
  });

  if (isLoading) {
    return (
      <>
        <Skeleton height={40} mt={10} />
        <Skeleton height={40} mt={10} />
        <Skeleton height={40} mt={10} />
      </>
    );
  }

  if (isError) {
    return (
      <Group position="center">
        <Alert icon={<IconAlertCircle size={16} />} my="lg" title="Error!" color="red" radius="md">
          Some error has occured while fetching data:
          <Code mt="sm" block>
            {(error as AxiosError)?.response?.data as string}
          </Code>
        </Alert>
      </Group>
    );
  }

  if (!data || data.items.length <= 0) {
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
        {data.items.map((nzb) => (
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
