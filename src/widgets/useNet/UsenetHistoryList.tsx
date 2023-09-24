import {
  Alert,
  Center,
  Code,
  Group,
  List,
  Pagination,
  Popover,
  Skeleton,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { IconAlertCircle, IconClock, IconFileDownload, IconFileInfo } from '@tabler/icons-react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useTranslation } from 'next-i18next';
import { FunctionComponent, useState } from 'react';
import { parseDuration } from '~/tools/client/parseDuration';
import { humanFileSize } from '~/tools/humanFileSize';

import { useGetUsenetHistory } from '../dashDot/api';

dayjs.extend(duration);

interface UsenetHistoryListProps {
  appId: string;
}

const PAGE_SIZE = 13;

export const UsenetHistoryList: FunctionComponent<UsenetHistoryListProps> = ({ appId }) => {
  const [page, setPage] = useState(1);
  const { t } = useTranslation(['modules/usenet', 'common']);

  const { ref, width, height } = useElementSize();
  const durationBreakpoint = 400;
  const { data, isLoading, isError, error } = useGetUsenetHistory({
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
          title={t('modules/usenet:history.error.title')}
          color="red"
          radius="md"
        >
          {t('modules/usenet:history.error.message')}
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
        <Title order={3}>{t('modules/usenet:history.empty')}</Title>
      </Center>
    );
  }

  return (
    <Stack justify="space-around" spacing="xs">
      <Table highlightOnHover style={{ tableLayout: 'fixed' }} ref={ref}>
        <thead>
          <tr>
            <th>{t('modules/usenet:history.header.name')}</th>
            <th style={{ width: 100 }}>{t('modules/usenet:history.header.size')}</th>
            {durationBreakpoint < width && (
              <th style={{ width: 200 }}>{t('modules/usenet:history.header.duration')}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.items.map((history) => (
            <Popover
              withArrow
              withinPortal
              radius="lg"
              shadow="sm"
              transitionProps={{
                transition: 'pop',
              }}
            >
              <Popover.Target>
                <tr key={history.id}>
                  <td>
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
                  </td>
                  <td>
                    <Text size="xs">{humanFileSize(history.size)}</Text>
                  </td>
                  {durationBreakpoint < width && (
                    <td>
                      <Text size="xs">{parseDuration(history.time, t)}</Text>
                    </td>
                  )}
                </tr>
              </Popover.Target>
              <Popover.Dropdown>
                <List>
                  <List.Item icon={<IconFileInfo size={16} />}>{history.name}</List.Item>
                  <List.Item icon={<IconClock size={16} />}>
                    {parseDuration(history.time, t)}
                  </List.Item>
                  <List.Item icon={<IconFileDownload size={16} />}>
                    {humanFileSize(history.size)}
                  </List.Item>
                </List>
              </Popover.Dropdown>
            </Popover>
          ))}
        </tbody>
      </Table>
      {totalPages > 1 && (
        <Pagination
          noWrap
          size="sm"
          position="center"
          mt="md"
          total={totalPages}
          value={page}
          onChange={setPage}
        />
      )}
    </Stack>
  );
};
