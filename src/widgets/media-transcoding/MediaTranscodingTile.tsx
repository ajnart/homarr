import {
  Alert,
  Center,
  Code,
  Divider,
  Group,
  List,
  Pagination,
  SegmentedControl,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconClipboardList,
  IconCpu2,
  IconReportAnalytics, IconTransform,
} from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { z } from 'zod';
import { AppAvatar } from '~/components/AppAvatar';
import { useConfigContext } from '~/config/provider';
import { api } from '~/utils/api';
import { HealthCheckStatus } from '~/widgets/media-transcoding/HealthCheckStatus';
import { QueuePanel } from '~/widgets/media-transcoding/QueuePanel';
import { StatisticsPanel } from '~/widgets/media-transcoding/StatisticsPanel';
import { WorkersPanel } from '~/widgets/media-transcoding/WorkersPanel';

import { defineWidget } from '../helper';
import { IWidget } from '../widgets';

const definition = defineWidget({
  id: 'media-transcoding',
  icon: IconTransform,
  options: {
    defaultView: {
      type: 'select',
      data: [
        {
          value: 'workers',
        },
        {
          value: 'queue',
        },
        {
          value: 'statistics',
        },
      ],
      defaultValue: 'workers',
    },
    showHealthCheck: {
      type: 'switch',
      defaultValue: true,
    },
    showHealthChecksInQueue: {
      type: 'switch',
      defaultValue: true,
    },
    queuePageSize: {
      type: 'number',
      defaultValue: 10,
    },
    showAppIcon: {
      type: 'switch',
      defaultValue: true,
    },
  },
  gridstack: {
    minWidth: 3,
    minHeight: 2,
    maxWidth: 12,
    maxHeight: 6,
  },
  component: MediaTranscodingTile,
});

export type TdarrWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface TdarrQueueTileProps {
  widget: TdarrWidget;
}

function MediaTranscodingTile({ widget }: TdarrQueueTileProps) {
  const { t } = useTranslation('modules/media-transcoding');
  const { config, name: configName } = useConfigContext();

  const appId = config?.apps.find(
    (app) => app.integration.type === 'tdarr',
  )?.id;
  const app = config?.apps.find((app) => app.id === appId);
  const { defaultView, showHealthCheck, showHealthChecksInQueue, queuePageSize, showAppIcon } =
    widget.properties;

  const [view, setView] = useState<'workers' | 'queue' | 'statistics'>(
    viewSchema.parse(defaultView)
  );

  const [queuePage, setQueuePage] = useState(1);

  const workers = api.tdarr.workers.useQuery(
    {
      appId: app?.id!,
      configName: configName!,
    },
    { enabled: !!app?.id && !!configName && view === 'workers', refetchInterval: 2000 }
  );

  const statistics = api.tdarr.statistics.useQuery(
    {
      appId: app?.id!,
      configName: configName!,
    },
    { enabled: !!app?.id && !!configName, refetchInterval: 10000 }
  );

  const queue = api.tdarr.queue.useQuery(
    {
      appId: app?.id!,
      configName: configName!,
      pageSize: queuePageSize,
      page: queuePage - 1,
      showHealthChecksInQueue,
    },
    {
      enabled: !!app?.id && !!configName && view === 'queue',
      refetchInterval: 2000,
    }
  );

  if (statistics.isError || workers.isError || queue.isError) {
    return (
      <Group position="center">
        <Alert
          icon={<IconAlertCircle size={16} />}
          my="lg"
          title={t('error.title')}
          color="red"
          radius="md"
        >
          {t('error.message')}
          <List>
            {statistics.isError && (
              <Code mt="sm" block>
                {statistics.error.message}
              </Code>
            )}
            {workers.isError && (
              <Code mt="sm" block>
                {workers.error.message}
              </Code>
            )}
            {queue.isError && (
              <Code mt="sm" block>
                {queue.error.message}
              </Code>
            )}
          </List>
        </Alert>
      </Group>
    );
  }

  if (!app) {
    return (
      <Stack justify="center" h="100%">
        <Center>
          <Title order={3}>{t('noAppSelected')}</Title>
        </Center>
      </Stack>
    );
  }

  const totalQueuePages = Math.ceil((queue.data?.totalCount || 1) / queuePageSize);

  return (
    <Stack spacing="xs" h="100%">
      {view === 'workers' ? (
        <WorkersPanel workers={workers.data} isLoading={workers.isLoading} />
      ) : view === 'queue' ? (
        <QueuePanel queue={queue.data} isLoading={queue.isLoading} />
      ) : (
        <StatisticsPanel statistics={statistics.data} isLoading={statistics.isLoading} />
      )}
      <Divider />
      <Group spacing="xs">
        <SegmentedControl
          data={[
            {
              label: (
                <Center>
                  <IconCpu2 size={18} />
                  <Text size="xs" ml={8}>
                    {t('tabs.workers')}
                  </Text>
                </Center>
              ),
              value: 'workers',
            },
            {
              label: (
                <Center>
                  <IconClipboardList size={18} />
                  <Text size="xs" ml={8}>
                    {t('tabs.queue')}
                  </Text>
                </Center>
              ),
              value: 'queue',
            },
            {
              label: (
                <Center>
                  <IconReportAnalytics size={18} />
                  <Text size="xs" ml={8}>
                    {t('tabs.statistics')}
                  </Text>
                </Center>
              ),
              value: 'statistics',
            },
          ]}
          value={view}
          onChange={(value) => setView(viewSchema.parse(value))}
          size="xs"
        />
        {view === 'queue' && !!queue.data && (
          <>
            <Pagination.Root total={totalQueuePages} value={queuePage} onChange={setQueuePage} size="sm">
              <Group spacing={5} position="center">
                <Pagination.First disabled={queuePage === 1} />
                <Pagination.Previous disabled={queuePage === 1} />
                <Pagination.Next disabled={queuePage === totalQueuePages} />
                <Pagination.Last disabled={queuePage === totalQueuePages} />
              </Group>
            </Pagination.Root>
            <Text size="xs">
              {t('views.queue.table.footer.currentIndex', {
                start: queue.data.startIndex + 1,
                end: queue.data.endIndex + 1,
                total: queue.data.totalCount,
              })}
            </Text>
          </>
        )}
        <Group spacing="xs" ml="auto">
          {showHealthCheck && statistics.data && <HealthCheckStatus statistics={statistics.data} />}
          {showAppIcon && (
            <Tooltip label={app.name}>
              <div>
                <AppAvatar iconUrl={app.appearance.iconUrl} />
              </div>
            </Tooltip>
          )}
        </Group>
      </Group>
    </Stack>
  );
}

const viewSchema = z.enum(['workers', 'queue', 'statistics']);

export default definition;
