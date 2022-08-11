import { Button, Group, Modal, Title } from '@mantine/core';
import { showNotification, updateNotification } from '@mantine/notifications';
import {
  IconCheck,
  IconPlayerPlay,
  IconPlayerStop,
  IconPlus,
  IconRefresh,
  IconRotateClockwise,
  IconTrash,
} from '@tabler/icons';
import axios from 'axios';
import Dockerode from 'dockerode';
import { tryMatchService } from '../../tools/addToHomarr';
import { AddAppShelfItemForm } from '../../components/AppShelf/AddAppShelfItem';
import { useState } from 'react';

function sendDockerCommand(
  action: string,
  containerId: string,
  containerName: string,
  reload: () => void
) {
  showNotification({
    id: containerId,
    loading: true,
    title: `${action}ing container ${containerName}`,
    message: undefined,
    autoClose: false,
    disallowClose: true,
  });
  axios
    .get(`/api/docker/container/${containerId}?action=${action}`)
    .then((res) => {
      updateNotification({
        id: containerId,
        title: `Container ${containerName} ${action}ed`,
        message: `Your container was successfully ${action}ed`,
        icon: <IconCheck />,
        autoClose: 2000,
      });
    })
    .catch((err) => {
      updateNotification({
        id: containerId,
        color: 'red',
        title: 'There was an error',
        message: err.response.data.reason,
        autoClose: 2000,
      });
    })
    .finally(() => {
      reload();
    });
}

export interface ContainerActionBarProps {
  selected: Dockerode.ContainerInfo[];
  reload: () => void;
}

export default function ContainerActionBar({ selected, reload }: ContainerActionBarProps) {
  const [opened, setOpened] = useState<boolean>(false);
  return (
    <Group>
      <Modal
        size="xl"
        radius="md"
        opened={opened}
        onClose={() => setOpened(false)}
        title="Add service"
      >
        <AddAppShelfItemForm
          setOpened={setOpened}
          {...tryMatchService(selected.at(0))}
          message="Add service to homarr"
        />
      </Modal>
      <Button
        leftIcon={<IconRotateClockwise />}
        onClick={() =>
          Promise.all(
            selected.map((container) =>
              sendDockerCommand('restart', container.Id, container.Names[0].substring(1), reload)
            )
          )
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
            selected.map((container) =>
              sendDockerCommand('stop', container.Id, container.Names[0].substring(1), reload)
            )
          )
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
            selected.map((container) =>
              sendDockerCommand('start', container.Id, container.Names[0].substring(1), reload)
            )
          )
        }
        variant="light"
        color="green"
        radius="md"
      >
        Start
      </Button>
      <Button leftIcon={<IconRefresh />} onClick={() => reload()} variant="light" radius="md">
        Refresh data
      </Button>
      <Button
        leftIcon={<IconPlus />}
        color="indigo"
        variant="light"
        radius="md"
        onClick={() => {
          if (selected.length !== 1) {
            showNotification({
              autoClose: 5000,
              title: <Title order={5}>Please only add one service at a time!</Title>,
              color: 'red',
              message: undefined,
            });
          } else {
            setOpened(true);
          }
        }}
      >
        Add to Homarr
      </Button>
      <Button
        leftIcon={<IconTrash />}
        color="red"
        variant="light"
        radius="md"
        onClick={() =>
          Promise.all(
            selected.map((container) =>
              sendDockerCommand('remove', container.Id, container.Names[0].substring(1), reload)
            )
          )
        }
      >
        Remove
      </Button>
    </Group>
  );
}
