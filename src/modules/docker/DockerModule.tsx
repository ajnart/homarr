import { ActionIcon, Drawer, Text, Tooltip } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconBrandDocker, IconX } from '@tabler/icons';
import axios from 'axios';
import Docker from 'dockerode';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import { useConfigContext } from '../../config/provider';
import ContainerActionBar from './ContainerActionBar';
import DockerTable from './DockerTable';

export default function DockerMenuButton(props: any) {
  const [opened, setOpened] = useState(false);
  const [containers, setContainers] = useState<Docker.ContainerInfo[]>([]);
  const [selection, setSelection] = useState<Docker.ContainerInfo[]>([]);
  const { config } = useConfigContext();

  const dockerEnabled = config?.settings.customization.layout.enabledDocker || false;

  const { t } = useTranslation('modules/docker');

  useEffect(() => {
    reload();
  }, [config?.settings]);

  function reload() {
    if (!dockerEnabled) {
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

  if (!dockerEnabled) {
    return null;
  }

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
