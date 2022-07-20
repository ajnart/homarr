import { Menu, Text, useMantineTheme } from '@mantine/core';
import { showNotification, updateNotification } from '@mantine/notifications';
import {
  IconCheck,
  IconCodePlus,
  IconPlayerPlay,
  IconPlayerStop,
  IconRotateClockwise,
  IconX,
} from '@tabler/icons';
import axios from 'axios';
import Dockerode from 'dockerode';

function sendNotification(action: string, containerId: string, containerName: string) {
  showNotification({
    id: 'load-data',
    loading: true,
    title: `${action}ing container ${containerName}`,
    message: 'Your password is being checked...',
    autoClose: false,
    disallowClose: true,
  });
  axios.get(`/api/docker/container/${containerId}?action=${action}`).then((res) => {
    setTimeout(() => {
      if (res.data.success === true) {
        updateNotification({
          id: 'load-data',
          title: 'Container restarted',
          message: 'Your container was successfully restarted',
          icon: <IconCheck />,
          autoClose: 2000,
        });
      }
      if (res.data.success === false) {
        updateNotification({
          id: 'load-data',
          color: 'red',
          title: 'There was an error restarting your container.',
          message: 'Your container has encountered issues while restarting.',
          icon: <IconX />,
          autoClose: 2000,
        });
      }
    }, 500);
  });
}

function restart(container: Dockerode.ContainerInfo) {
  sendNotification('restart', container.Id, container.Names[0]);
}
function stop(container: Dockerode.ContainerInfo) {
  console.log('stoping container', container.Id);
}
function start(container: Dockerode.ContainerInfo) {
  console.log('starting container', container.Id);
}

export default function DockerMenu(props: any) {
  const { container }: { container: Dockerode.ContainerInfo } = props;
  const theme = useMantineTheme();
  if (container === undefined) {
    return null;
  }
  return (
    <Menu shadow="lg" radius="md">
      <Menu.Label>Actions</Menu.Label>
      <Menu.Item icon={<IconRotateClockwise color="orange" />} onClick={() => restart(container)}>
        <Text>Restart</Text>
      </Menu.Item>
      {container.State === 'running' ? (
        <Menu.Item icon={<IconPlayerStop color="red" />}>
          <Text>Stop</Text>
        </Menu.Item>
      ) : (
        <Menu.Item icon={<IconPlayerPlay color="green" />}>
          <Text>Start</Text>
        </Menu.Item>
      )}
      {/* <Menu.Item icon={<IconDownload color="blue" />}>
        <Text>Pull latest image </Text>
      </Menu.Item>
      <Menu.Item icon={<IconFileText color="grey" />}>
        <Text>Logs</Text>
      </Menu.Item> */}
      <Menu.Label>Homarr</Menu.Label>
      <Menu.Item icon={<IconCodePlus color={theme.primaryColor} />}>
        <Text>Add to Homarr</Text>
      </Menu.Item>
    </Menu>
  );
}
