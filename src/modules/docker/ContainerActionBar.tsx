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
import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { tryMatchService } from '../../tools/addToHomarr';
import { AddAppShelfItemForm } from '../../components/AppShelf/AddAppShelfItem';

function sendDockerCommand(
  action: string,
  containerId: string,
  containerName: string,
  reload: () => void
) {
  const { t } = useTranslation('modules/docker-module');

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
  const [opened, setOpened] = useState<boolean>(false);
  const { t } = useTranslation('modules/docker-module');

  return (
    <Group>
      <Modal
        size="xl"
        radius="md"
        opened={opened}
        onClose={() => setOpened(false)}
        title={t('actionBar.addService.title')}
      >
        <AddAppShelfItemForm
          setOpened={setOpened}
          {...tryMatchService(selected.at(0))}
          message={t('actionBar.addService.message')}
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
      >
        {t('actionBar.start.title')}
      </Button>
      <Button leftIcon={<IconRefresh />} onClick={() => reload()} variant="light" radius="md">
        {t('actionBar.refreshData.title')}
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
              title: <Title order={5}>{t('errors.oneServiceAtATime')}</Title>,
              color: 'red',
              message: undefined,
            });
          } else {
            setOpened(true);
          }
        }}
      >
        {t('actionBar.addToHomarr.title')}
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
        {t('actionBar.remove.title')}
      </Button>
    </Group>
  );
}
