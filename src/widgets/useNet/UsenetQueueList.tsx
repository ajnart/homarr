import {
  ActionIcon,
  Alert,
  Center,
  Code,
  Group,
  Pagination,
  Progress,
  Skeleton,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
  useMantineTheme,
} from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { IconAlertCircle, IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useTranslation } from 'next-i18next';
import { FunctionComponent, useState } from 'react';

import { useGetUsenetDownloads } from '../../hooks/widgets/dashDot/api';
import { humanFileSize } from '../../tools/humanFileSize';

dayjs.extend(duration);

interface UsenetQueueListProps {
  appId: string;
}

const PAGE_SIZE = 13;

export const UsenetQueueList: FunctionComponent<UsenetQueueListProps> = ({ appId }) => {
  const theme = useMantineTheme();
  const { t } = useTranslation('modules/usenet');
  const progressbarBreakpoint = parseInt(theme.breakpoints.xs, 10);
  const progressBreakpoint = 400;
  const sizeBreakpoint = 300;
  const { ref, width } = useElementSize();

  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useGetUsenetDownloads({
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
    appId,
  });
  const totalPages = Math.ceil((data?.total || 1) / PAGE_SIZE);

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
        <Alert
          icon={<IconAlertCircle size={16} />}
          my="lg"
          title={t('queue.error.title')}
          color="red"
          radius="md"
        >
          {t('queue.error.message')}
          <Code mt="sm" block>
            {error.message}
          </Code>
        </Alert>
      </Group>
    );
  }

  if (!data || data.items.length <= 0) {
    return (
      <Center style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Title order={3}>{t('queue.empty')}</Title>
      </Center>
    );
  }

  // TODO: Set ScollArea dynamic height based on the widget size
  return (
    <Stack justify="space-around" spacing="xs">
      <Table highlightOnHover style={{ tableLayout: 'fixed' }} ref={ref}>
        <thead>
          <tr>
            <th style={{ width: 32 }} />
            <th style={{ width: '75%' }}>{t('queue.header.name')}</th>
            {sizeBreakpoint < width ? (
              <th style={{ width: 100 }}>{t('queue.header.size')}</th>
            ) : null}
            <th style={{ width: 60 }}>{t('queue.header.eta')}</th>
            {progressBreakpoint < width ? (
              <th style={{ width: progressbarBreakpoint > width ? 100 : 200 }}>
                {t('queue.header.progress')}
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {data.items.map((nzb) => (
            <tr key={nzb.id}>
              <td>
                {nzb.state === 'paused' ? (
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
                    color={nzb.state === 'paused' ? 'dimmed' : undefined}
                  >
                    {nzb.name}
                  </Text>
                </Tooltip>
              </td>
              {sizeBreakpoint < width ? (
                <td>
                  <Text size="xs">{humanFileSize(nzb.size)}</Text>
                </td>
              ) : null}
              <td>
                {nzb.eta <= 0 ? (
                  <Text size="xs" color="dimmed">
                    {t('queue.paused')}
                  </Text>
                ) : (
                  <Text size="xs">{dayjs.duration(nzb.eta, 's').format('H:mm:ss')}</Text>
                )}
              </td>
              {progressBreakpoint < width ? (
                <td style={{ display: 'flex', alignItems: 'center' }}>
                  <Text mr="sm" style={{ whiteSpace: 'nowrap' }}>
                    {nzb.progress.toFixed(1)}%
                  </Text>
                  {width > progressbarBreakpoint ? (
                    <Progress
                      radius="lg"
                      color={nzb.eta > 0 ? theme.primaryColor : 'lightgrey'}
                      value={nzb.progress}
                      size="lg"
                      style={{ width: '100%' }}
                    />
                  ) : null}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </Table>
      {totalPages > 1 && (
        <Pagination
          noWrap
          size="sm"
          position="center"
          total={totalPages}
          value={page}
          onChange={setPage}
        />
      )}
    </Stack>
  );
};
