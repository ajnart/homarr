import {
  Avatar,
  Center,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { IconAlertTriangle, IconMovie } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { AppAvatar } from '../../components/AppAvatar';
import { useEditModeStore } from '../../components/Dashboard/Views/useEditModeStore';
import { useConfigContext } from '../../config/provider';
import { useGetMediaServers } from '../../hooks/widgets/media-servers/useGetMediaServers';
import { defineWidget } from '../helper';
import { IWidget } from '../widgets';
import { TableRow } from './TableRow';

const definition = defineWidget({
  id: 'media-server',
  icon: IconMovie,
  options: {},
  component: MediaServerTile,
  gridstack: {
    minWidth: 3,
    minHeight: 2,
    maxWidth: 12,
    maxHeight: 12,
  },
});

export type MediaServerWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface MediaServerWidgetProps {
  widget: MediaServerWidget;
}

function MediaServerTile({ widget }: MediaServerWidgetProps) {
  const { t } = useTranslation('modules/media-server');
  const { config } = useConfigContext();
  const isEditMode = useEditModeStore((x) => x.enabled);

  const { data, isError, isFetching, isInitialLoading } = useGetMediaServers({
    enabled: config !== undefined,
  });

  if (isError) {
    return (
      <Center>
        <Stack align="center">
          <IconAlertTriangle />
          <Title order={6}>{t('card.errors.general.title')}</Title>
          <Text>{t('card.errors.general.text')}</Text>
        </Stack>
      </Center>
    );
  }

  if (isInitialLoading) {
    return (
      <Stack
        align="center"
        justify="center"
        style={{
          height: '100%',
        }}
      >
        <Loader />
        <Stack align="center" spacing={0}>
          <Text>{t('descriptor.name')}</Text>
          <Text color="dimmed">Homarr is loading streams...</Text>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack h="100%">
      <ScrollArea offsetScrollbars>
        <Table highlightOnHover>
          <thead>
            <tr>
              <th>{t('card.table.header.session')}</th>
              <th>{t('card.table.header.user')}</th>
              <th>{t('card.table.header.currentlyPlaying')}</th>
            </tr>
          </thead>
          <tbody>
            {data?.servers.map((server) => {
              const app = config?.apps.find((x) => x.id === server.appId);
              return server.sessions.map((session, index) => (
                <TableRow session={session} app={app} key={index} />
              ));
            })}
          </tbody>
        </Table>
      </ScrollArea>

      <Group position="right" mt="auto">
        <Avatar.Group>
          {data?.servers.map((server) => {
            const app = config?.apps.find((x) => x.id === server.appId);

            if (!app) {
              return null;
            }

            return (
              <AppAvatar
                iconUrl={app.appearance.iconUrl}
                // If success, the color is undefined, otherwise it's red but if isFetching is true, it's yellow
                color={server.success ? (isFetching ? 'yellow' : undefined) : 'red'}
              />
            );
          })}
        </Avatar.Group>
      </Group>
    </Stack>
  );
}

export default definition;
