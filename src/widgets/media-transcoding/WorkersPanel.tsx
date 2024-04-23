import {
  Center,
  Group,
  Progress,
  ScrollArea,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconHeartbeat, IconTransform } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { WidgetLoading } from '~/widgets/loading';
import { TdarrWorker } from '~/types/api/tdarr';

interface WorkersPanelProps {
  workers: TdarrWorker[] | undefined;
  isLoading: boolean;
}

export function WorkersPanel(props: WorkersPanelProps) {
  const { workers, isLoading } = props;

  const { t } = useTranslation('modules/media-transcoding');

  if (isLoading) {
    return <WidgetLoading />;
  }

  if (!workers?.length) {
    return (
      <Center
        style={{ flex: '1' }}
      >
        <Title order={3}>{t('views.workers.table.empty')}</Title>
      </Center>
    );
  }

  return (
    <ScrollArea style={{ flex: '1' }}>
      <Table style={{ tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <th>{t('views.workers.table.header.name')}</th>
            <th style={{ width: 60 }}>{t('views.workers.table.header.eta')}</th>
            <th style={{ width: 175 }}>{t('views.workers.table.header.progress')}</th>
          </tr>
        </thead>
        <tbody>
          {workers.map((worker) => (
            <tr key={worker.id}>
              <td>
                <Group spacing="xs" noWrap>
                  <div>
                    {worker.jobType === 'transcode' ? (
                      <Tooltip label={t('views.workers.table.tooltip.transcode')}>
                        <IconTransform size={14} />
                      </Tooltip>
                    ) : (
                      <Tooltip label={t('views.workers.table.tooltip.healthCheck')}>
                        <IconHeartbeat size={14} />
                      </Tooltip>
                    )}
                  </div>
                  <Text lineClamp={1} size="xs">{worker.filePath.split('\\').pop()?.split('/').pop() ?? worker.filePath}</Text>
                </Group>
              </td>
              <td>
                <Text size="xs">
                  {worker.ETA.startsWith('0:') ? worker.ETA.substring(2) : worker.ETA}
                </Text>
              </td>
              <td>
                <Group noWrap spacing="xs">
                  <Text size="xs">{worker.step}</Text>
                  <Progress
                    value={worker.percentage}
                    size="lg"
                    radius="xl"
                    style={{
                      flex: 1,
                    }}
                  />
                  <Text size="xs">{Math.round(worker.percentage)}%</Text>
                </Group>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </ScrollArea>
  );
}
