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
import { IconAlertCircle, IconClipboardList, IconCpu2, IconReportAnalytics } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '~/config/provider';

import { defineWidget } from '../helper';
import { IWidget } from '../widgets';
import { api } from '~/utils/api';
import { AppAvatar } from '~/components/AppAvatar';
import { HealthCheckStatus } from '~/widgets/tdarr/HealthCheckStatus';
import { useState } from 'react';
import { z } from 'zod';
import { WorkersPanel } from '~/widgets/tdarr/WorkersPanel';
import { QueuePanel } from '~/widgets/tdarr/QueuePanel';

const definition = defineWidget({
  id: 'tdarr-queue',
  icon: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/tdarr.png',
  options: {
    appId: {
      type: 'app-select',
      defaultValue: '',
      integrations: ['tdarr'],
    },
    defaultView: {
      type: 'select',
      data: [
        {
          value: 'workers',
          label: 'Workers',
        },
        {
          value: 'queue',
          label: 'Queue',
        },
        {
          value: 'statistics',
          label: 'Statistics',
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
    minWidth: 2,
    minHeight: 1,
    maxWidth: 12,
    maxHeight: 6,
  },
  component: TdarrQueueTile,
});

export type TdarrWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface TdarrQueueTileProps {
  widget: TdarrWidget;
}

function TdarrQueueTile({ widget }: TdarrQueueTileProps) {
  const { t } = useTranslation('modules/tdarr-queue');
  const { config, name: configName } = useConfigContext();

  const app = config?.apps.find(app => app.id === widget.properties.appId);
  const { defaultView, showHealthCheck, showHealthChecksInQueue, queuePageSize, showAppIcon } = widget.properties;

  const [view, setView] = useState<'workers' | 'queue' | 'statistics'>(viewSchema.parse(defaultView));

  const [page, setPage] = useState(1);

  const workers = api.tdarr.workers.useQuery({
    appId: app?.id!,
    configName: configName!,
  }, { enabled: !!app?.id && !!configName, refetchInterval: 2000 });

  const statistics = api.tdarr.statistics.useQuery({
    appId: app?.id!,
    configName: configName!,
  }, { enabled: !!app?.id && !!configName, refetchInterval: 10000 });

  const queue = api.tdarr.queue.useQuery({
    appId: app?.id!,
    configName: configName!,
    pageSize: queuePageSize,
    page: page - 1,
    showHealthChecksInQueue
  }, {
    enabled: !!app?.id && !!configName,
    refetchInterval: 2000,
  });

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
      <Stack justify="center" style={{
        height: '100%',
      }}>
        <Center style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Title order={3}>{t('noAppSelected')}</Title>
        </Center>
      </Stack>
    );
  }

  const totalQueuePages = Math.ceil((queue.data?.totalCount || 1) / queuePageSize);

  return (
    <Stack
      spacing="xs"
      style={{
        height: '100%',
      }}
    >
      {view === 'workers' ? (
        <WorkersPanel workers={workers.data} isLoading={workers.isLoading} />
      ) : view === "queue" ? (
        <QueuePanel queue={queue.data} isLoading={queue.isLoading}/>
      ) : (
        <>TODO</>
      )}
      <Divider />
      <Group spacing="xs">
        <SegmentedControl
          data={[
            {
              label: (
                <Center>
                  <IconCpu2 size={18} />
                  <Text size="xs" ml={8}>{t('tabs.workers', { count1: workers.data?.length ?? '?' })}</Text>
                </Center>
              ),
              value: 'workers',
            },
            {
              label: (
                <Center>
                  <IconClipboardList size={18} />
                  <Text size="xs" ml={8}>{t('tabs.queue', { count1: workers.data?.length ?? '?' })}</Text>
                </Center>
              ),
              value: 'queue',
            },
            {
              label: (
                <Center>
                  <IconReportAnalytics size={18} />
                  <Text size="xs" ml={8}>{t('tabs.statistics', { count1: workers.data?.length ?? '?' })}</Text>
                </Center>
              ),
              value: 'statistics',
            },
          ]}
          value={view}
          onChange={value => setView(viewSchema.parse(value))}
          size="xs"
        />
        {view === 'queue' && !!queue.data && (
          <>
            <Pagination.Root
              total={totalQueuePages}
              value={page}
              onChange={setPage}
              size="sm"
            >
              <Group spacing={5} position="center">
                <Pagination.First disabled={page === 1} />
                <Pagination.Previous disabled={page === 1} />
                <Pagination.Next disabled={page === totalQueuePages}  />
                <Pagination.Last disabled={page === totalQueuePages} />
              </Group>
            </Pagination.Root>
            <Text size="xs">{t("views.queue.table.footer.currentIndex", {
              start: queue.data.startIndex + 1,
              end: queue.data.endIndex + 1,
              total: queue.data.totalCount
            })}</Text>
          </>
        )}
        <Group spacing="xs" style={{
          marginLeft: 'auto',
        }}>
          {showHealthCheck && statistics.data && (
            <HealthCheckStatus statistics={statistics.data} />
          )}
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
