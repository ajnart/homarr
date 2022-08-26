import {
  Alert,
  Center,
  Code,
  Group,
  Pagination,
  Skeleton,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useTranslation } from 'next-i18next';
import { FunctionComponent, useState } from 'react';
import { useGetUsenetHistory } from '../../tools/hooks/api';
import { humanFileSize } from '../../tools/humanFileSize';

dayjs.extend(duration);

interface UsenetHistoryListProps {
  serviceId: string;
}

const PAGE_SIZE = 10;

export const UsenetHistoryList: FunctionComponent<UsenetHistoryListProps> = ({ serviceId }) => {
  const [page, setPage] = useState(1);
  const { t } = useTranslation('modules/usenet');

  const { data, isLoading, isError, error } = useGetUsenetHistory({
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
    serviceId,
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
        <Alert icon={<IconAlertCircle size={16} />} my="lg" title="Error!" color="red" radius="md">
          {t('history.error')}
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
        <Title order={3}>{t('history.empty')}</Title>
      </Center>
    );
  }

  return (
    <>
      <Table highlightOnHover style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col span={1} />
          <col span={1} style={{ width: 100 }} />
          <col span={1} style={{ width: 200 }} />
        </colgroup>
        <thead>
          <tr>
            <th>{t('history.header.name')}</th>
            <th>{t('history.header.size')}</th>
            <th>{t('history.header.duration')}</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((history) => (
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
