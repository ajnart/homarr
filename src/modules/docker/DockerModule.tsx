import { ActionIcon, Drawer, Text, Tooltip } from '@mantine/core';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Docker from 'dockerode';
import { IconBrandDocker, IconX } from '@tabler/icons';
import { showNotification } from '@mantine/notifications';
import { useTranslation } from 'next-i18next';

import ContainerActionBar from './ContainerActionBar';
import DockerTable from './DockerTable';
import { useConfig } from '../../tools/state';
import { IModule } from '../ModuleTypes';

export const DockerModule: IModule = {
  title: 'Docker',
  icon: IconBrandDocker,
  component: DockerMenuButton,
  id: 'docker',
};

export default function DockerMenuButton(props: any) {
  const [opened, setOpened] = useState(false);
  const [containers, setContainers] = useState<Docker.ContainerInfo[]>([]);
  const [selection, setSelection] = useState<Docker.ContainerInfo[]>([]);
  const { config } = useConfig();
  const moduleEnabled = config.modules?.[DockerModule.id]?.enabled ?? false;

  const { t } = useTranslation('modules/docker');

  useEffect(() => {
    reload();
  }, [config.modules]);

  function reload() {
    if (!moduleEnabled) {
      return;
    }
    setTimeout(() => {
      axios
        .get('/api/docker/containers')
        .then((res) => {
          setContainers(res.data);
          setSelection([]);
        })
        .catch(() => {
          // Remove containers from the list
          setContainers([]);
          // Send an Error notification
          showNotification({
            autoClose: 1500,
            title: <Text>{t('errors.integrationFailed.title')}</Text>,
            color: 'red',
            icon: <IconX />,
            message: t('errors.integrationFailed.message'),
          });
        });
    }, 300);
  }
  const exists = config.modules?.[DockerModule.id]?.enabled ?? false;
  if (!exists) {
    return null;
  }
  // Check if the user has at least one container
  if (containers.length < 1) return null;
  return (
    <>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        padding="xl"
        size="full"
        title={<ContainerActionBar selected={selection} reload={reload} />}
      >
        <DockerTable containers={containers} selection={selection} setSelection={setSelection} />
      </Drawer>
      <Tooltip label={t('actionIcon.tooltip')}>
        <ActionIcon
          variant="default"
          radius="md"
          size="xl"
          color="blue"
          onClick={() => setOpened(true)}
        >
          <IconBrandDocker />
        </ActionIcon>
      </Tooltip>
    </>
  );
}
