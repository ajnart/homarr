import {
  Center,
  Progress,
  ScrollArea,
  Skeleton,
  Table,
  Tabs,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconDownload, IconPlayerPause, IconPlayerPlay } from '@tabler/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import { FunctionComponent, useEffect, useState } from 'react';
import duration from 'dayjs/plugin/duration';
import { humanFileSize } from '../../tools/humanFileSize';
import { DownloadItem } from '../../tools/types';
import { IModule } from '../ModuleTypes';

dayjs.extend(duration);

export const UsenetComponent: FunctionComponent = () => {
  const [nzbs, setNzbs] = useState<DownloadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    const getData = async () => {
      try {
        const response = await axios.get('/api/modules/usenet');
        setNzbs(response.data);
      } catch (error) {
        setNzbs([]);
        showNotification({
          title: 'Error fetching torrents',
          autoClose: 1000,
          disallowClose: true,
          id: 'fail-torrent-downloads-module',
          color: 'red',
          message:
            'Please check your config for any potential errors, check the console for more info',
        });
      } finally {
        setIsLoading(false);
      }
    };

    const interval = setInterval(getData, 5000);
    getData();

    () => {
      clearInterval(interval);
    };
  }, []);

  const ths = (
    <tr>
      <th />
      <th>Name</th>
      <th>Size</th>
      <th>ETA</th>
      <th>Progress</th>
    </tr>
  );

  const rows = nzbs.map((nzb) => (
    <tr key={nzb.id}>
      <td>
        {nzb.state === 'paused' ? (
          <IconPlayerPause fill="grey" stroke={0} />
        ) : (
          <IconPlayerPlay fill="black" stroke={0} />
        )}
      </td>
      <td>
        <Tooltip position="top" label={nzb.name}>
          <Text
            style={{
              maxWidth: '30vw',
            }}
            size="xs"
          >
            {nzb.name}
          </Text>
        </Tooltip>
      </td>
      <td>
        <Text size="xs">{humanFileSize(nzb.size * 1000 * 1000)}</Text>
      </td>
      <td>
        {nzb.eta <= 0 ? (
          <Text size="xs" color="dimmed">
            Paused
          </Text>
        ) : (
          <Text size="xs">{dayjs.duration(nzb.eta, 's').format('H:mm:ss')}</Text>
        )}
      </td>
      <td>
        <Text>{nzb.progress.toFixed(1)}%</Text>
        <Progress
          radius="lg"
          color={nzb.progress === 1 ? 'green' : nzb.state === 'downloading' ? 'blue' : 'lightgrey'}
          value={nzb.progress}
          size="lg"
        />
      </td>
    </tr>
  ));

  if (isLoading) {
    return (
      <>
        <Skeleton height={40} mt={10} />
        <Skeleton height={40} mt={10} />
        <Skeleton height={40} mt={10} />
      </>
    );
  }

  return (
    <Tabs defaultValue="queue">
      <Tabs.List>
        <Tabs.Tab value="queue">Queue</Tabs.Tab>
        <Tabs.Tab value="history">History</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="queue">
        <ScrollArea sx={{ maxHeight: 300, width: '100%' }}>
          {rows.length > 0 ? (
            <Table highlightOnHover>
              <thead>{ths}</thead>
              <tbody>{rows}</tbody>
            </Table>
          ) : (
            <Center style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Title order={3}>Queue is empty</Title>
            </Center>
          )}
        </ScrollArea>
      </Tabs.Panel>
    </Tabs>
  );
};

export const UsenetModule: IModule = {
  id: 'usenet',
  title: 'Usenet',
  icon: IconDownload,
  component: UsenetComponent,
};

export default UsenetComponent;
