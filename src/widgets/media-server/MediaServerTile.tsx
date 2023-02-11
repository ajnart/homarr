import { Avatar, Group, Table, Text } from '@mantine/core';
import { IconMovie } from '@tabler/icons';
import { AppAvatar } from '../../components/AppAvatar';
import { useConfigContext } from '../../config/provider';
import { useGetMediaServers } from '../../hooks/widgets/media-servers/useGetMediaServers';
import { defineWidget } from '../helper';
import { IWidget } from '../widgets';
import { NowPlayingDisplay } from './NowPlayingDisplay';

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
    <>
      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th>Session</th>
            <th>Username</th>
            <th>Item</th>
          </tr>
        </thead>
        <tbody>
          {data?.servers.map((server) => {
            const app = config?.apps.find((x) => x.id === server.appId);
            return server.sessions.map((session, index) => {
              if (!session.nowPlayingItem) {
                return (
                  <tr key={index}>
                    <td>
                      <Group>
                        <AppAvatar iconUrl={app?.appearance.iconUrl} />
                        <Text>{session.sessionName}</Text>
                      </Group>
                    </td>
                    <td>
                      <Group>
                        {session.type === 'plex' && session.userThumb ? (
                          <Avatar src={session.userThumb} size="sm" />
                        ) : (
                          <Avatar src={null} alt={session.username} size="sm">
                            {session.username?.at(0)?.toUpperCase()}
                          </Avatar>
                        )}
                        <Text>{session.username}</Text>
                      </Group>
                    </td>
                    <td />
                  </tr>
                );
              }
              return (
                <tr key={index}>
                  <td>
                    <Group>
                      <AppAvatar iconUrl={app?.appearance.iconUrl} />
                      <Text>{session.sessionName}</Text>
                    </Group>
                  </td>
                  <td>
                    <Group spacing="sm">
                      {session.type === 'plex' && session.userThumb ? (
                        <Avatar src={session.userThumb} size="sm" />
                      ) : (
                        <Avatar src={null} alt={session.username} size="sm">
                          {session.username?.at(0)?.toUpperCase()}
                        </Avatar>
                      )}
                      <Text>{session.username}</Text>
                    </Group>
                  </td>
                  <td>
                    <NowPlayingDisplay session={session} />
                  </td>
                </tr>
              );
            });
          })}
        </tbody>
      </Table>
    </>
  );
}

export default definition;
