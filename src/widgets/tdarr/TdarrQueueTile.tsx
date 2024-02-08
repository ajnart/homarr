import {
  Alert,
  Badge,
  Center,
  Code,
  Divider,
  Flex,
  Group,
  Indicator,
  List,
  MantineColor,
  Popover,
  Progress,
  ScrollArea,
  Stack,
  Table,
  Text,
  Title, Tooltip,
} from '@mantine/core';
import { IconAlertCircle, IconHeartbeat, IconTransform } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '~/config/provider';

import { defineWidget } from '../helper';
import { IWidget } from '../widgets';
import { WidgetLoading } from '~/widgets/loading';
import { api } from '~/utils/api';
import { TdarrFile } from '~/server/api/routers/tdarr';
import { AppAvatar } from '~/components/AppAvatar';

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

  const staged = api.tdarr.getStagedFiles.useQuery({
    appId: app?.id!,
    configName: configName!,
  }, { enabled: !!app?.id && !!configName });

  const workers = api.tdarr.workers.useQuery({
    appId: app?.id!,
    configName: configName!,
  }, { enabled: !!app?.id && !!configName, refetchInterval: 5000 });

  // const filteredQueued = queued.filter(
  //   (file) => !staged.some((stagedFile) => stagedFile.filename === file.filename),
  // );
  //
  // const totalSize = queued.reduce((prev, curr) => prev + curr.size, 0);

  if (statistics.isError || files.isError || staged.isError || workers.isError) {
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
            {staged.isError && (
              <Code mt="sm" block>
                {staged.error.message}
              </Code>
            )}
          </List>
        </Alert>
      </Group>
    );
  }

  if (!app) {
    return (
      <div>Please select an app in the widget settings</div>
    )
  }

  return (
    <Stack
      spacing="xs"
      style={{
        height: '100%',
      }}
    >
      <Group position="apart">
        <Tooltip
          label={app.name}
          withArrow
          withinPortal
        >
          <div>
            <AppAvatar iconUrl={app.appearance.iconUrl} />
          </div>
        </Tooltip>
        <Group position="right" ml="auto">
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
              <Group>
                <Stack align="center">
                </Stack>
                <Indicator label="27" size={14}>
                  <IconTransform size={24} />
                </Indicator>
                <Flex direction="column" align="center" gap={0}>
                  {/*<Text size="xs">Transcodes</Text>*/}
                </Flex>
                <Badge color={'red'}>
                  27
                </Badge>
                <Badge color={'red'}>
                  <IconHeartbeat />
                  5
                </Badge>
              </Group>
            </Popover.Target>
            <Popover.Dropdown>
              <List>
                {/*{errored.map((file) => (*/}
                {/*  <List.Item key={file.filename} icon={<IconFileInfo size={16} />}>*/}
                {/*    {file.filename}*/}
                {/*  </List.Item>*/}
                {/*))}*/}
              </List>
            </Popover.Dropdown>
          </Popover>
        </Group>
      </Group>
      <Divider />
      {statistics.isLoading || files.isLoading || staged.isLoading || workers.isLoading ? (
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
              <th>{t('table.header.name')}</th>
              <th style={{ width: 50 }}>{t('table.header.eta')}</th>
              <th style={{ width: 175 }}>{t('table.header.progress')}</th>
            </tr>
            </thead>
            <tbody>
            {workers.data.map((worker) => (
              <tr>
                <td>
                  <Text
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    size="xs"
                  >
                    {worker.file.substring(worker.file.lastIndexOf('/') + 1)}
                  </Text>
                </td>
                <td>
                  <Text size="xs">{worker.ETA.startsWith('0:') ? worker.ETA.substring(2) : worker.ETA}</Text>
                </td>
                <td>
                  <Group noWrap>
                    <Text size="xs">{worker.step}</Text>
                    <Progress value={worker.percentage} label={`${worker.percentage}%`} size="xl" radius="xl" style={{
                      flex: 1,
                    }} />
                  </Group>
                </td>
              </tr>
            ))}
            </tbody>
          </Table>
        </ScrollArea>
      )}
    </Stack>
  );
}

function getStatusBadgeTextKey(status: TdarrFile['status']): MantineColor {
  switch (status) {
    case 'Queued':
      return 'badges.status.queued';
    case 'processing':
      return 'badges.status.processing';
    case 'copying':
      return 'badges.status.copying';
    case 'Transcode error':
      return 'badges.status.error';
    case 'accepted':
      return 'badges.status.accepted';
    default:
      return status;
  }
}

function getStatusBadgeColor(status: TdarrFile['status']): string {
  switch (status) {
    case 'Queued':
      return 'blue';
    case 'processing':
      return 'yellow';
    case 'copying':
      return 'teal';
    case 'Transcode error':
      return 'red';
    case 'accepted':
      return 'green';
    default:
      return 'gray';
  }
}

export default definition;
