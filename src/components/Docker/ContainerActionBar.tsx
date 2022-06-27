import { Button, Group } from '@mantine/core';
import { showNotification, updateNotification } from '@mantine/notifications';
import {
  IconCheck,
  IconPlayerPlay,
  IconPlayerStop,
  IconRefresh,
  IconRotateClockwise,
  IconX,
} from '@tabler/icons';
import axios from 'axios';
import Dockerode from 'dockerode';

function sendNotification(action: string, containerId: string, containerName: string) {
  showNotification({
    id: containerId,
    loading: true,
    title: `${action}ing container ${containerName}`,
    message: undefined,
    autoClose: false,
    disallowClose: true,
  });
  axios.get(`/api/docker/container/${containerId}?action=${action}`).then((res) => {
    setTimeout(() => {
      if (res.data.success === true) {
        updateNotification({
          id: containerId,
          title: `Container ${containerName} ${action}ed`,
          message: `Your container was successfully ${action}ed`,
          icon: <IconCheck />,
          autoClose: 2000,
        });
      }
      if (res.data.success === false) {
        updateNotification({
          id: containerId,
          color: 'red',
          title: 'There was an error with your container.',
          message: undefined,
          icon: <IconX />,
          autoClose: 2000,
        });
      }
    }, 500);
  });
}

export interface ContainerActionBarProps {
  selected: Dockerode.ContainerInfo[];
  reload: () => void;
}

export default function ContainerActionBar({ selected, reload }: ContainerActionBarProps) {
  return (
    <Group>
      <Button
        leftIcon={<IconRotateClockwise />}
        onClick={() =>
          Promise.all(
            selected.map((container) =>
              sendNotification('restart', container.Id, container.Names[0])
            )
          ).then(() => reload())
        }
        variant="light"
        color="orange"
        radius="md"
      >
        Restart
      </Button>
      <Button
        leftIcon={<IconPlayerStop />}
        onClick={() =>
          Promise.all(
            selected.map((container) => sendNotification('stop', container.Id, container.Names[0]))
          ).then(() => reload())
        }
        variant="light"
        color="red"
        radius="md"
      >
        Stop
      </Button>
      <Button
        leftIcon={<IconPlayerPlay />}
        onClick={() =>
          Promise.all(
            selected.map((container) => sendNotification('start', container.Id, container.Names[0]))
          ).then(() => reload())
        }
        variant="light"
        color="green"
        radius="md"
      >
        Start
      </Button>
      <Button leftIcon={<IconRefresh />} onClick={() => reload()} variant="light">
        Refresh data
      </Button>
    </Group>
  );
}
