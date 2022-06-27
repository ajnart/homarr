import { Button, Group } from '@mantine/core';
import { showNotification, updateNotification } from '@mantine/notifications';
import {
  IconCheck,
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

export interface ContainerActionBarProps {
  selected: Dockerode.ContainerInfo[];
}

export default function ContainerActionBar(props: ContainerActionBarProps) {
  const { selected } = props;
  return (
    <Group>
      <Button
        leftIcon={<IconRotateClockwise />}
        onClick={() => selected.map((container) => restart(container))}
        variant="filled"
        color="orange"
        radius="md"
      >
        Restart
      </Button>
      <Button leftIcon={<IconPlayerStop />} variant="filled" color="red" radius="md">
        Stop
      </Button>
      <Button leftIcon={<IconPlayerPlay />} variant="filled" color="green" radius="md">
        Start
      </Button>
    </Group>
  );
}
