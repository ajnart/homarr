import { ActionIcon, Drawer, Text, Tooltip } from '@mantine/core';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Docker from 'dockerode';
import { IconBrandDocker, IconX } from '@tabler/icons';
import { showNotification } from '@mantine/notifications';
import ContainerActionBar from './ContainerActionBar';
import DockerTable from './DockerTable';
import { useConfig } from '../../tools/state';
import { IModule } from '../ModuleTypes';

export const DockerModule: IModule = {
  title: 'Docker',
  description: 'Allows you to easily manage your torrents',
  icon: IconBrandDocker,
  component: DockerMenuButton,
};

export default function DockerMenuButton(props: any) {
  const [opened, setOpened] = useState(false);
  const [containers, setContainers] = useState<Docker.ContainerInfo[]>([]);
  const [selection, setSelection] = useState<Docker.ContainerInfo[]>([]);
  const { config } = useConfig();
  const moduleEnabled = config.modules?.[DockerModule.title]?.enabled ?? false;

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
            title: <Text>Docker integration failed</Text>,
            color: 'red',
            icon: <IconX />,
            message: 'Did you forget to mount the docker socket ?',
          });
        });
    }, 300);
  }
  const exists = config.modules?.[DockerModule.title]?.enabled ?? false;
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
      <Tooltip label="Docker">
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
