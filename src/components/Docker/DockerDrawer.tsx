import {
  ActionIcon,
  Badge,
  Checkbox,
  createStyles,
  Drawer,
  Group,
  List,
  Menu,
  ScrollArea,
  Table,
  Text,
} from '@mantine/core';
import { IconBrandDocker } from '@tabler/icons';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Docker from 'dockerode';
import DockerMenu from './DockerMenu';
import ContainerState from './ContainerState';
import ContainerActionBar from './ContainerActionBar';

const useStyles = createStyles((theme) => ({
  rowSelected: {
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.fn.rgba(theme.colors[theme.primaryColor][7], 0.2)
        : theme.colors[theme.primaryColor][0],
  },
}));

export default function DockerDrawer(props: any) {
  const [opened, setOpened] = useState(false);
  const [containers, setContainers] = useState<Docker.ContainerInfo[]>([]);
  const { classes, cx } = useStyles();
  const [selection, setSelection] = useState<Docker.ContainerInfo[]>([]);
  const toggleRow = (container: Docker.ContainerInfo) =>
    setSelection((current) =>
      current.includes(container) ? current.filter((c) => c !== container) : [...current, container]
    );
  const toggleAll = () =>
    setSelection((current) =>
      current.length === containers.length ? [] : containers.map((c) => c)
    );

  useEffect(() => {
    axios.get('/api/docker/containers').then((res) => {
      setContainers(res.data);
    });
  }, []);
  const rows = containers.map((element) => {
    const selected = selection.includes(element);
    return (
      <tr key={element.Id} className={cx({ [classes.rowSelected]: selected })}>
        <td>
          <Checkbox
            checked={selection.includes(element)}
            onChange={() => toggleRow(element)}
            transitionDuration={0}
          />
        </td>
        <td>{element.Names[0].replace('/', '')}</td>
        <td>{element.Image}</td>
        <td>
          <Group>
            {element.Ports.slice(-3).map((port) => (
              <Badge variant="outline">
                {port.PrivatePort}:{port.PublicPort}
              </Badge>
            ))}
            {element.Ports.length > 3 && (
              <Badge variant="filled">
                {element.Ports.length - 3} more
              </Badge>
            )}
          </Group>
        </td>
        <td>
          <ContainerState state={element.State} />
        </td>
      </tr>
    );
  });

  return (
    <>
      <Drawer opened={opened} onClose={() => setOpened(false)} padding="xl" size="full">
        <ScrollArea>
          <ContainerActionBar selected={selection} />
          <Table captionSide="bottom" highlightOnHover sx={{ minWidth: 800 }} verticalSpacing="sm">
            <caption>your docker containers</caption>
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <Checkbox
                    onChange={toggleAll}
                    checked={selection.length === containers.length}
                    indeterminate={selection.length > 0 && selection.length !== containers.length}
                    transitionDuration={0}
                  />
                </th>
                <th>Name</th>
                <th>Image</th>
                <th>Ports</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </Table>
        </ScrollArea>
      </Drawer>
      <DockerMenu container={containers?.at(0)} />
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
