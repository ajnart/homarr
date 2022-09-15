import { ApolloError } from '@apollo/client';
import { useGetUsenetQueueQuery, UsenetQueueStatus } from '@homarr/graphql';
import {
  ActionIcon,
  Alert,
  Center,
  Code,
  Group,
  Pagination,
  Progress,
  Skeleton,
  Table,
  Text,
  Title,
  Tooltip,
  useMantineTheme,
} from '@mantine/core';
import { IconAlertCircle, IconPlayerPause, IconPlayerPlay } from '@tabler/icons';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useTranslation } from 'next-i18next';
import { FunctionComponent, useState } from 'react';
import { humanFileSize } from '../../lib/humanFileSize';

dayjs.extend(duration);

interface UsenetQueueListProps {
  serviceId: string;
}

const PAGE_SIZE = 10;

export const UsenetQueueList: FunctionComponent<UsenetQueueListProps> = ({ serviceId }) => {
  const theme = useMantineTheme();
  const { t } = useTranslation('modules/usenet');

  const [page, setPage] = useState(1);

  const { data, loading, error } = useGetUsenetQueueQuery({
    variables: {
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      serviceId,
    },
    pollInterval: 5000,
  });

  const totalPages = Math.ceil((data?.usenetQueue.total || 1) / PAGE_SIZE);

  if (loading) {
    return (
      <>
        <Skeleton height={40} mt={10} />
        <Skeleton height={40} mt={10} />
        <Skeleton height={40} mt={10} />
      </>
    );
  }

  if (error) {
    return (
      <Group position="center">
        <Alert
          icon={<IconAlertCircle size={16} />}
          my="lg"
          title={t('queue.error.title')}
          color="red"
          radius="md"
        >
          {t('queue.error.message')}
          <Code mt="sm" block>
            {(error as ApolloError)?.message}
          </Code>
        </Alert>
      </Group>
    );
  }

  if (!data || data.usenetQueue.items.length <= 0) {
    return (
      <Center style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Title order={3}>{t('queue.empty')}</Title>
      </Center>
    );
  }

  return (
    <>
      <Table highlightOnHover style={{ tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <th style={{ width: 50 }} />
            <th style={{ width: '75%' }}>{t('queue.header.name')}</th>
            <th style={{ width: 100 }}>{t('queue.header.size')}</th>
            <th style={{ width: 100 }}>{t('queue.header.eta')}</th>
            <th style={{ width: 200 }}>{t('queue.header.progress')}</th>
          </tr>
        </thead>
        <tbody>
          {data.usenetQueue.items.map((nzb) => (
            <tr key={nzb.id}>
              <td>
                {nzb.state === UsenetQueueStatus.Paused ? (
                  <Tooltip label="NOT IMPLEMENTED">
                    <ActionIcon color="gray" variant="subtle" radius="xl" size="sm">
                      <IconPlayerPlay size="16" />
                    </ActionIcon>
                  </Tooltip>
                ) : (
                  <Tooltip label="NOT IMPLEMENTED">
                    <ActionIcon color="primary" variant="subtle" radius="xl" size="sm">
                      <IconPlayerPause size="16" />
                    </ActionIcon>
                  </Tooltip>
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
                    color={nzb.state === UsenetQueueStatus.Paused ? 'dimmed' : undefined}
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
                    {t('queue.paused')}
                  </Text>
                ) : (
                  <Text size="xs">{dayjs.duration(nzb.eta, 's').format('H:mm:ss')}</Text>
                )}
              </td>
              <td style={{ display: 'flex', alignItems: 'center' }}>
                <Text mr="sm" style={{ whiteSpace: 'nowrap' }}>
                  {nzb.progress.toFixed(1)}%
                </Text>
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
      {totalPages > 1 && (
        <Pagination
          size="sm"
          position="center"
          mt="md"
          total={totalPages}
          page={page}
          onChange={setPage}
        />
      )}
    </>
  );
};
