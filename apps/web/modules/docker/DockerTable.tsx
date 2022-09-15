import { DockerContainer } from '@homarr/graphql';
import { Table, Checkbox, Group, Badge, createStyles, ScrollArea, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useState } from 'react';
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
  setSelection: Dispatch<SetStateAction<string[]>>;
  containers: DockerContainer[];
  selection: string[];
}) {
  const { classes, cx } = useStyles();
  const [search, setSearch] = useState('');

  const { t } = useTranslation('modules/docker');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setSearch(value);
  };

  function filterContainers(data: DockerContainer[], search: string) {
    const query = search.toLowerCase().trim();
    return data.filter(
      (item) => item.name.toLowerCase().includes(query) || item.image.includes(query)
    );
  }

  const toggleRow = (containerId: string) =>
    setSelection((currentIds: string[]) =>
      currentIds.includes(containerId)
        ? currentIds.filter((c) => c !== containerId)
        : [...currentIds, containerId]
    );
  // const toggleAll = () =>
  //   setSelection((current: any) =>
  //     current.length === usedContainers.length ? [] : usedContainers.map((c) => c.id)
  //   );

  const rows = containers.map((element) => {
    const selected = selection.includes(element.id);
    return (
      <tr key={element.id} className={cx({ [classes.rowSelected]: selected })}>
        <td>
          <Checkbox
            checked={selection.includes(element.id)}
            onChange={() => toggleRow(element.id)}
            transitionDuration={0}
          />
        </td>
        <td>{element.name}</td>
        <td>{element.image}</td>
        <td>
          <Group>
            {element.ports
              .sort((a, b) => a.private - b.private)
              // Remove duplicates with filter function
              .filter(
                (port, index, self) => index === self.findIndex((t) => t.private === port.private)
              )
              .slice(-3)
              .map((port) => (
                <Badge key={port.private} variant="outline">
                  {port.private}:{port.public}
                </Badge>
              ))}
            {element.ports.length > 3 && (
              <Badge variant="filled">
                {t('table.body.portCollapse', { ports: element.ports.length - 3 })}
              </Badge>
            )}
          </Group>
        </td>
        <td>
          <ContainerState state={element.status} />
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
        // disabled={usedContainers.length === 0}
      />
      <Table captionSide="bottom" highlightOnHover sx={{ minWidth: 800 }} verticalSpacing="sm">
        <thead>
          <tr>
            <th style={{ width: 40 }}>
              <Checkbox />
            </th>
            <th>{t('table.header.name')}</th>
            <th>{t('table.header.image')}</th>
            <th>{t('table.header.ports')}</th>
            <th>{t('table.header.state')}</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}
