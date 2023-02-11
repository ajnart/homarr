import { Group, Table } from '@mantine/core';
import { IconMovie } from '@tabler/icons';
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
  const { data } = useGetMediaServers();

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
          {data?.servers
            .flatMap((server) => server.sessions)
            .map((session, index) => {
              if (!session.nowPlayingItem) {
                return (
                  <tr key={index}>
                    <td>{session.sessionName}</td>
                    <td>{session.username}</td>
                    <td />
                  </tr>
                );
              }
              return (
                <tr key={index}>
                  <td>{session.sessionName}</td>
                  <td>{session.username}</td>
                  <td>
                    <NowPlayingDisplay session={session} />
                  </td>
                </tr>
              );
            })}
        </tbody>
      </Table>
    </>
  );
}

export default definition;
