import { Button, Group } from '@mantine/core';
import { showNotification, updateNotification } from '@mantine/notifications';
import {
  IconCheck,
  IconPlayerPlay,
  IconPlayerStop,
  IconRefresh,
  IconRotateClockwise,
  IconTrash,
} from '@tabler/icons';
import axios from 'axios';
import Dockerode from 'dockerode';
import { useTranslation } from 'next-i18next';
import { TFunction } from 'react-i18next';

let t: TFunction<'modules/docker', undefined>;

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
        title: t('messages.successfullyExecuted.message', { containerName, action }),
        message: t('messages.successfullyExecuted.message', { action }),
        icon: <IconCheck />,
        autoClose: 2000,
      });
    })
    .catch((err) => {
      updateNotification({
        id: containerId,
        color: 'red',
        title: t('errors.unknownError.title'),
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
  t = useTranslation('modules/docker').t;

  return (
    <Group>
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
        disabled={selected.length === 0}
      >
        {t('actionBar.restart.title')}
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
        disabled={selected.length === 0}
      >
        {t('actionBar.stop.title')}
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
        disabled={selected.length === 0}
      >
        {t('actionBar.start.title')}
      </Button>
      <Button leftIcon={<IconRefresh />} onClick={() => reload()} variant="light" color="violet" radius="md">
        {t('actionBar.refreshData.title')}
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
        disabled={selected.length === 0}
      >
        {t('actionBar.remove.title')}
      </Button>
    </Group>
  );
}
