import {
  ActionIcon,
  Alert,
  Center,
  Code,
  Collapse,
  Divider,
  Group,
  List,
  Progress,
  ScrollArea,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconAdjustments,
  IconAlertCircle,
  IconChevronDown,
  IconChevronUp,
  IconHeartbeat,
  IconTransform,
} from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '~/config/provider';

import { defineWidget } from '../helper';
import { IWidget } from '../widgets';
import { WidgetLoading } from '~/widgets/loading';
import { api } from '~/utils/api';
import { AppAvatar } from '~/components/AppAvatar';
import { useDisclosure } from '@mantine/hooks';
import { StatisticsBadge } from '~/widgets/tdarr/StatisticsBadge';
import { Filename } from '~/widgets/tdarr/Filename';

const definition = defineWidget({
  id: 'tdarr-queue',
  icon: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/tdarr.png',
  options: {
    appId: {
      type: 'app-select',
      defaultValue: '',
      integrations: ['tdarr'],
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

  const statistics = api.tdarr.statistics.useQuery({
    appId: app?.id!,
    configName: configName!,
  }, { enabled: !!app?.id && !!configName });

  const files = api.tdarr.getFiles.useQuery({
    appId: app?.id!,
    configName: configName!,
  }, { enabled: !!app?.id && !!configName });

  const workers = api.tdarr.workers.useQuery({
    appId: app?.id!,
    configName: configName!,
  }, { enabled: !!app?.id && !!configName, refetchInterval: 5000 });

  if (statistics.isError || files.isError || workers.isError) {
    return (
      <Group position="center">
        <Alert
          icon={<IconAlertCircle size={16} />}
          my="lg"
          title={t('table.error.title')}
          color="red"
          radius="md"
        >
          {t('table.error.message')}
          <List>
            {statistics.isError && (
              <Code mt="sm" block>
                {statistics.error.message}
              </Code>
            )}
            {files.isError && (
              <Code mt="sm" block>
                {files.error.message}
              </Code>
            )}
            {workers.isError && (
              <Code mt="sm" block>
                {workers.error.message}
              </Code>
            )}
          </List>
        </Alert>
      </Group>
    );
  }

  if (!app) {
    return (
      <Center style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Title order={3}>{t('noAppSelected')}</Title>
      </Center>
    );
  }

  const [queueOpen, { toggle }] = useDisclosure(false);
  const queuedFiles = (files.data ?? []).filter(file => file.status === 'Queued' && !workers.data?.some(worker => worker.file === file.file));
  const queueDividerLabel = queueOpen ? (
    <Group spacing={8}>
      <IconChevronUp size={10} />
      <Text size="xs">{t('table.divider.open', { count: queuedFiles.length })}</Text>
    </Group>
  ) : (
    <Group spacing={8}>
      <IconChevronDown size={10} />
      <Text size="xs">{t('table.divider.closed', { count: queuedFiles.length })}</Text>
    </Group>
  );

  return (
    <Stack
      spacing="xs"
      style={{
        height: '100%',
      }}
    >
      <Group position="apart">
        <Tooltip label={app.name}>
          <div>
            <AppAvatar iconUrl={app.appearance.iconUrl} />
          </div>
        </Tooltip>
        {statistics.data && (
          <Group position="right" ml="auto" spacing={8}>
            <ActionIcon color="dark" variant="subtle">
              <IconAdjustments size="1.125rem" />
            </ActionIcon>
            <StatisticsBadge
              type="transcodes"
              staged={statistics.data.stagedTranscodeCount}
              total={statistics.data.totalTranscodeCount}
              failed={statistics.data.failedTranscodeCount} />
            <StatisticsBadge
              type="healthchecks"
              staged={statistics.data.stagedHealthCheckCount}
              total={statistics.data.totalHealthCheckCount}
              failed={statistics.data.totalHealthCheckCount} />
          </Group>
        )}
      </Group>
      <Divider />
      {statistics.isLoading || files.isLoading || workers.isLoading ? (
        <Stack justify="center" style={{
          flex: 1,
        }}>
          <WidgetLoading />
        </Stack>
      ) : !files.data.length || !workers.data.length ? (
        <Center style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Title order={3}>{t('table.empty')}</Title>
        </Center>
      ) : (
        <ScrollArea>
          <Table highlightOnHover style={{ tableLayout: 'fixed' }}>
            <thead>
            <tr>
              <th style={{ width: 20 }}></th>
              <th>{t('table.header.name')}</th>
              <th style={{ width: 60 }}>{t('table.header.eta')}</th>
              <th style={{ width: 175 }}>{t('table.header.progress')}</th>
            </tr>
            </thead>
            <tbody>
            {workers.data.map((worker) => (
              <tr key={worker.id}>
                <td>
                  {worker.jobType === 'transcode' ? (
                    <Tooltip label={'Transcode'}>
                      <IconTransform size={14} />
                    </Tooltip>
                  ) : (
                    <Tooltip label={'Healthcheck'}>
                      <IconHeartbeat size={14} />
                    </Tooltip>
                  )}
                </td>
                <td>
                  <Filename filename={worker.file} />
                </td>
                <td>
                  <Text size="xs">{worker.ETA.startsWith('0:') ? worker.ETA.substring(2) : worker.ETA}</Text>
                </td>
                <td>
                  <Group noWrap>
                    <Text size="xs">{worker.step}</Text>
                    <Progress value={worker.percentage} label={`${Math.round(worker.percentage)}%`} size="xl"
                              radius="xl" style={{
                      flex: 1,
                    }} />
                  </Group>
                </td>
              </tr>
            ))}
            </tbody>
          </Table>
          {!!queuedFiles.length && (
            <>
              <Divider my={0} label={queueDividerLabel} labelPosition="center" onClick={toggle} style={{
                cursor: 'pointer',
              }} />
              <Collapse in={queueOpen}>
                <Table highlightOnHover style={{ tableLayout: 'fixed' }}>
                  <thead>
                  <tr style={{
                    display: 'none',
                  }}>
                    <th>{t('table.header.name')}</th>
                  </tr>
                  </thead>
                  <tbody>
                  {queuedFiles.map(file => (
                    <tr>
                      <td>
                        <Filename filename={file.file} />
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </Table>
              </Collapse>
            </>
          )}
        </ScrollArea>
      )}
    </Stack>
  );
}

export default definition;
