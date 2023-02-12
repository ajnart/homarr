import { Avatar, Group, ScrollArea, Stack, Table } from '@mantine/core';
import { IconMovie } from '@tabler/icons';
import { AppAvatar } from '../../components/AppAvatar';
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
  const { config } = useConfigContext();

  const { data } = useGetMediaServers({
    enabled: config !== undefined,
  });

  if (!data) {
    <>loading...</>;
  }

  return (
    <Stack h="100%">
      <ScrollArea offsetScrollbars>
        <Table highlightOnHover striped>
          <thead>
            <tr>
              <th>Session</th>
              <th>Username</th>
              <th>Currently playing</th>
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
                color={server.success === true ? undefined : 'red'}
              />
            );
          })}
        </Avatar.Group>
      </Group>
    </Stack>
  );
}

export default definition;
