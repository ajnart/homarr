import { Table, Checkbox, Group, Badge, createStyles } from '@mantine/core';
import Dockerode from 'dockerode';
import ContainerState from './ContainerState';

const useStyles = createStyles((theme) => ({
  rowSelected: {
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.fn.rgba(theme.colors[theme.primaryColor][7], 0.2)
        : theme.colors[theme.primaryColor][0],
  },
}));

export default function DockerTable({
  containers,
  selection,
  setSelection,
}: {
  setSelection: any;
  containers: Dockerode.ContainerInfo[];
  selection: Dockerode.ContainerInfo[];
}) {
  const { classes, cx } = useStyles();

  const toggleRow = (container: Dockerode.ContainerInfo) =>
    setSelection((current: Dockerode.ContainerInfo[]) =>
      current.includes(container) ? current.filter((c) => c !== container) : [...current, container]
    );
  const toggleAll = () =>
    setSelection((current: any) =>
      current.length === containers.length ? [] : containers.map((c) => c)
    );

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
            {element.Ports.sort((a, b) => a.PrivatePort - b.PrivatePort)
              .slice(-3)
              .map((port) => (
                <Badge key={port.PrivatePort} variant="outline">
                  {port.PrivatePort}:{port.PublicPort}
                </Badge>
              ))}
            {element.Ports.length > 3 && (
              <Badge variant="filled">{element.Ports.length - 3} more</Badge>
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
    <ScrollArea style={{ height: '80vh' }}>
      <TextInput
        placeholder="Search by container or image name"
        mt="md"
        icon={<IconSearch size={14} />}
        value={search}
        onChange={handleSearchChange}
      />
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
  );
}
