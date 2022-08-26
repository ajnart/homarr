import { Center, Pagination, Skeleton, Table, Text, Title, Tooltip } from '@mantine/core';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
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

  const { data, isLoading } = useGetUsenetHistory({
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

  if (!data || data.items.length <= 0) {
    return (
      <Center style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Title order={3}>Queue is empty</Title>
      </Center>
    );
  }

  return (
    <div>
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
      <Pagination
        size="sm"
        position="center"
        mt="md"
        total={totalPages}
        page={page}
        onChange={setPage}
      />
    </div>
  );
};
