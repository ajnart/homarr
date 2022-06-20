import { ActionIcon, Drawer, Group, List, Text } from '@mantine/core';
import { IconBrandDocker } from '@tabler/icons';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Docker from 'dockerode';

export default function DockerDrawer(props: any) {
  const [opened, setOpened] = useState(false);
  const [containers, setContainers] = useState<any[]>([]);
  useEffect(() => {
    axios.get('/api/docker/containers').then((res) => {
      setContainers(res.data);
    });
  }, []);
  return (
    <>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title="Register"
        padding="xl"
        size="full"
      >
        <List>
          {containers.map((container) => (
            <List.Item key={container.Id}>
              <Text>{container.Names[0]}</Text>
              <Text>{container.State}</Text>
              <Text>{container.Status}</Text>
              <Text>{container.Image}</Text>
            </List.Item>
          ))}
        </List>
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
