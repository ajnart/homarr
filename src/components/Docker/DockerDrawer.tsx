import { ActionIcon, Drawer, Group, LoadingOverlay, ScrollArea } from '@mantine/core';
import { IconBrandDocker } from '@tabler/icons';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Docker from 'dockerode';
import ContainerActionBar from './ContainerActionBar';
import DockerTable from './DockerTable';

export default function DockerDrawer(props: any) {
  const [opened, setOpened] = useState(false);
  const [containers, setContainers] = useState<Docker.ContainerInfo[]>([]);
  const [selection, setSelection] = useState<Docker.ContainerInfo[]>([]);
  const [visible, setVisible] = useState(false);

  function reload() {
    setVisible(true);
    setTimeout(() => {
      axios.get('/api/docker/containers').then((res) => {
        setContainers(res.data);
        setSelection([]);
        setVisible(false);
      });
    }, 300);
  }

  useEffect(() => {
    reload();
  }, []);

  return (
    <>
      <Drawer opened={opened} onClose={() => setOpened(false)} padding="xl" size="full">
        <ContainerActionBar selected={selection} reload={reload} />
        <div style={{ position: 'relative' }}>
          <LoadingOverlay transitionDuration={500} visible={visible} />
          <DockerTable containers={containers} selection={selection} setSelection={setSelection} />
        </div>
      </Drawer>
      <Group position="center">
        <ActionIcon
          variant="default"
          radius="md"
          size="xl"
          color="blue"
          onClick={() => setOpened(true)}
        >
          <IconBrandDocker />
        </ActionIcon>
      </Group>
    </>
  );
}
