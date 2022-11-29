import { Table, Checkbox, Group, Badge, createStyles, ScrollArea, TextInput, useMantineTheme } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons';
import Dockerode from 'dockerode';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
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
  const MIN_WIDTH_MOBILE = useMantineTheme().breakpoints.xs;
  const [usedContainers, setContainers] = useState<Dockerode.ContainerInfo[]>(containers);
  const { classes, cx } = useStyles();
  const [search, setSearch] = useState('');
  const { ref, width, height } = useElementSize();

  const { t } = useTranslation('modules/docker');

  useEffect(() => {
    setContainers(containers);
  }, [containers]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setSearch(value);
    setContainers(filterContainers(containers, value));
  };

  function filterContainers(data: Dockerode.ContainerInfo[], search: string) {
    const query = search.toLowerCase().trim();
    return data.filter((item) =>
      item.Names.some((name) => name.toLowerCase().includes(query) || item.Image.includes(query))
    );
  }

  const toggleRow = (container: Dockerode.ContainerInfo) =>
    setSelection((current: Dockerode.ContainerInfo[]) =>
      current.includes(container) ? current.filter((c) => c !== container) : [...current, container]
    );
  const toggleAll = () =>
    setSelection((current: any) =>
      current.length === usedContainers.length ? [] : usedContainers.map((c) => c)
    );

  const rows = usedContainers.map((element) => {
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
        {width > MIN_WIDTH_MOBILE && <td>{element.Image}</td>}
        {width > MIN_WIDTH_MOBILE && (
          <td>
            <Group>
              {element.Ports.sort((a, b) => a.PrivatePort - b.PrivatePort)
                // Remove duplicates with filter function
                .filter(
                  (port, index, self) =>
                    index === self.findIndex((t) => t.PrivatePort === port.PrivatePort)
                )
                .slice(-3)
                .map((port) => (
                  <Badge key={port.PrivatePort} variant="outline">
                    {port.PrivatePort}:{port.PublicPort}
                  </Badge>
                ))}
              {element.Ports.length > 3 && (
                <Badge variant="filled">
                  {t('table.body.portCollapse', { ports: element.Ports.length - 3 })}
                </Badge>
              )}
            </Group>
          </td>
        )}
        <td>
          <ContainerState state={element.State} />
        </td>
      </tr>
    );
  });

  return (
    <ScrollArea style={{ height: '80vh' }}>
      <TextInput
        placeholder={t('search.placeholder')}
        mt="md"
        icon={<IconSearch size={14} />}
        value={search}
        onChange={handleSearchChange}
        disabled={usedContainers.length === 0}
      />
      <Table ref={ref} captionSide="bottom" highlightOnHover verticalSpacing="sm">
        <thead>
          <tr>
            <th style={{ width: 40 }}>
              <Checkbox
                onChange={toggleAll}
                checked={selection.length === usedContainers.length && selection.length > 0}
                indeterminate={selection.length > 0 && selection.length !== usedContainers.length}
                transitionDuration={0}
                disabled={usedContainers.length === 0}
              />
            </th>
            <th>{t('table.header.name')}</th>
            {width > MIN_WIDTH_MOBILE ? <th>{t('table.header.image')}</th> : null}
            {width > MIN_WIDTH_MOBILE ? <th>{t('table.header.ports')}</th> : null}
            <th>{t('table.header.state')}</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}
