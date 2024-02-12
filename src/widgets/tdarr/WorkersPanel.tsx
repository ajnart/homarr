import { Center, Group, Progress, ScrollArea, Stack, Table, Text, Title, Tooltip } from '@mantine/core';
import { IconHeartbeat, IconTransform } from '@tabler/icons-react';
import { Filename } from '~/widgets/tdarr/Filename';
import { useTranslation } from 'next-i18next';
import { TdarrWorker } from '~/server/api/routers/tdarr';
import { WidgetLoading } from '~/widgets/loading';

interface WorkersPanelProps {
  workers: TdarrWorker[] | undefined;
  isLoading: boolean;
}

export function WorkersPanel(props: WorkersPanelProps) {
  const { workers, isLoading } = props;

  const { t } = useTranslation('modules/tdarr-queue');

  if (isLoading) {
    return (
      <Stack justify="center" style={{
        flex: 1,
      }}>
        <WidgetLoading />
      </Stack>
    );
  }

  if (!workers?.length) {
    return (
      <Center style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '1' }}>
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
                    <Tooltip label={'Transcode'}>
                      <IconTransform size={14} />
                    </Tooltip>
                  ) : (
                    <Tooltip label={'Healthcheck'}>
                      <IconHeartbeat size={14} />
                    </Tooltip>
                  )}
                </div>
                <Filename filename={worker.file} />
              </Group>
            </td>
            <td>
              <Text size="xs">{worker.ETA.startsWith('0:') ? worker.ETA.substring(2) : worker.ETA}</Text>
            </td>
            <td>
              <Group noWrap>
                <Text size="xs">{worker.step}</Text>
                <Progress
                  value={worker.percentage}
                  label={`${Math.round(worker.percentage)}%`}
                  size="xl"
                  radius="xl"
                  style={{
                    flex: 1,
                  }}
                  styles={{
                    label: {
                      position: 'absolute',
                      right: worker.percentage < 40 ? '-10px' : '10px',
                      transform: worker.percentage < 40 ? 'translateX(100%)' : 'translateX(0)',
                    },
                  }} />
              </Group>
            </td>
          </tr>
        ))}
        </tbody>
      </Table>
    </ScrollArea>
  );
}