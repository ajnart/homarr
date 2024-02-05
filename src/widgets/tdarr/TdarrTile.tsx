import { defineWidget } from '../helper';
import { IWidget } from '../widgets';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '~/config/provider';
import { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Center,
  Code,
  Divider,
  Group,
  List,
  MantineColor,
  Popover,
  ScrollArea,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { TdarrFile, useGetTdarrFiles, useGetTdarrStagedFiles, useGetTdarrStats } from '~/widgets/tdarr/api';
import { IconAlertCircle, IconDeviceFloppy, IconFileInfo, IconInfoCircle } from '@tabler/icons-react';
import { humanFileSize } from '~/tools/humanFileSize';
import { AppAvatar } from '~/components/AppAvatar';

const definition = defineWidget({
  id: 'tdarr',
  icon: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/tdarr.png',
  options: {},
  gridstack: {
    minWidth: 2,
    minHeight: 1,
    maxWidth: 12,
    maxHeight: 6,
  },
  component: TdarrTile,
});

export type TdarrWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface TdarrTileProps {
  widget: TdarrWidget;
}

function TdarrTile({ widget }: TdarrTileProps) {
  const { t } = useTranslation('modules/tdarr');
  const { config } = useConfigContext();

  const tdarrApps = config?.apps.filter(app => app.integration.type === widget.type) ?? [];

  const [selectedAppId, setSelectedApp] = useState<string | null>(tdarrApps[0]?.id);
  useEffect(() => {
    if (!selectedAppId && tdarrApps.length) {
      setSelectedApp(tdarrApps[0].id);
    }
  }, [tdarrApps, selectedAppId]);

  if (tdarrApps.length === 0) {
    return (
      <Stack>
        <Title order={3}>{t('card.errors.noTdarrApps.title')}</Title>
        <Group>
          <Text>{t('card.errors.noTdarrApps.text')}</Text>
        </Group>
      </Stack>
    );
  }

  if (!selectedAppId) {
    return null;
  }

  const app = tdarrApps.find(app => app.id === selectedAppId);

  const [stats, statsStatus, statsError] = useGetTdarrStats(selectedAppId);
  // const nodes = useGetTdarrNodes(selectedAppId); // No use for it atm
  const [{ queued, errored }, filesStatus, filesError] = useGetTdarrFiles(selectedAppId);
  const [staged, stagedStatus, stagedError] = useGetTdarrStagedFiles(selectedAppId);
  const filteredQueued = queued.filter(file => !staged.some(stagedFile => stagedFile.filename === file.filename));

  const totalSize = queued.reduce((prev, curr) => prev + curr.size, 0);

  if (statsStatus === 'loading' || filesStatus === 'loading' || stagedStatus === 'loading') {
    return (
      <>
        <Skeleton height={40} mt={10} />
        <Skeleton height={30} mt={30} />
        <Skeleton height={30} mt={10} />
        <Skeleton height={30} mt={10} />
      </>
    );
  }

  if (statsStatus === 'error' || filesStatus === 'error' || stagedStatus === 'error') {
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
            {statsError && <Code mt="sm" block>{statsError.message}</Code>}
            {filesError && <Code mt="sm" block>{filesError.message}</Code>}
            {stagedError && <Code mt="sm" block>{stagedError.message}</Code>}
          </List>
        </Alert>
      </Group>
    );
  }

  return (
    <Stack spacing="xs" style={{
      height: '100%',
    }}>
      <Group position="apart">
        <Group>
          {app && (
            <Tooltip
              label={app.name}
              withArrow
              withinPortal
            >
              <div>
                <AppAvatar iconUrl={app.appearance.iconUrl} />
              </div>
            </Tooltip>
          )}
          <Title size="md">
            {t('title', {
              files: stats.queued,
              size: humanFileSize(totalSize),
            })}
          </Title>
        </Group>
        {!!stats.errored && (
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
                <Badge color={'red'}>
                  {t(`badges.errors.${stats.errored === 1 ? 'singular' : 'plural'}`, {
                    errors: stats.errored,
                  })}
                </Badge></Popover.Target>
              <Popover.Dropdown>
                <List>
                  {errored.map(file => (
                    <List.Item key={file.filename} icon={<IconFileInfo size={16} />}>{file.filename}</List.Item>
                  ))}
                </List>
              </Popover.Dropdown>
            </Popover>
          </Group>
        )}
      </Group>
      <Divider />
      <ScrollArea>
        {tdarrApps.length > 1 && (
          <Select
            value={selectedAppId}
            onChange={setSelectedApp}
            ml="xs"
            data={tdarrApps.map((app) => ({ value: app.id, label: app.name }))}
          />
        )}
        {!!totalSize ? (
          <Table highlightOnHover style={{ tableLayout: 'fixed' }}>
            <thead>
            <tr>
              <th>{t('table.header.name')}</th>
              <th style={{ width: 75 }}>{t('table.header.size')}</th>
              <th style={{ width: 100 }}>{t('table.header.status')}</th>
            </tr>
            </thead>
            <tbody>
            {[...staged, ...filteredQueued].map((file) => (
              <Popover
                withArrow
                withinPortal
                radius="lg"
                shadow="sm"
                transitionProps={{
                  transition: 'pop',
                }}
                key={file.filename}
              >
                <Popover.Target>
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
                        {file.filename}
                      </Text>
                    </td>
                    <td>
                      <Text size="xs">{humanFileSize(file.size)}</Text>
                    </td>
                    <td>
                      <Badge
                        color={getStatusBadgeColor(file.status)}>
                        {t(getStatusBadgeTextKey(file.status))}
                      </Badge>
                    </td>
                  </tr>
                </Popover.Target>
                <Popover.Dropdown>
                  <List>
                    <List.Item icon={<IconFileInfo size={16} />}>{file.filename}</List.Item>
                    <List.Item icon={<IconDeviceFloppy size={16} />}>
                      {humanFileSize(file.size)}
                    </List.Item>
                    <List.Item icon={<IconInfoCircle size={16} />}>
                      <Badge
                        color={getStatusBadgeColor(file.status)}>
                        {t(getStatusBadgeTextKey(file.status))}
                      </Badge>
                    </List.Item>
                  </List>
                </Popover.Dropdown>
              </Popover>
            ))}
            </tbody>
          </Table>
        ) : (
          <Center style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Title order={3}>{t('table.empty')}</Title>
          </Center>
        )}
      </ScrollArea>
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
  }
}

export default definition;
