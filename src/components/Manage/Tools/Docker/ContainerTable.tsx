import {
  Badge,
  Checkbox,
  Group,
  Image,
  ScrollArea,
  Table,
  Text,
  TextInput,
  createStyles,
} from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import Dockerode, { ContainerInfo } from 'dockerode';
import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';

import { MIN_WIDTH_MOBILE } from '../../../../constants/constants';
import ContainerState from './ContainerState';

const useStyles = createStyles((theme) => ({
  rowSelected: {
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.fn.rgba(theme.colors[theme.primaryColor][7], 0.2)
        : theme.colors[theme.primaryColor][0],
  },
}));

export default function ContainerTable({
  containers,
  selection,
  setSelection,
}: {
  setSelection: Dispatch<SetStateAction<ContainerInfo[]>>;
  containers: ContainerInfo[];
  selection: ContainerInfo[];
}) {
  const { t } = useTranslation('modules/docker');
  const [search, setSearch] = useState('');
  const { ref, width } = useElementSize();

  const filteredContainers = useMemo(
    () => filterContainers(containers, search),
    [containers, search]
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.currentTarget.value);
  };

  const toggleRow = (container: ContainerInfo) =>
    setSelection((selected: ContainerInfo[]) =>
      selected.includes(container)
        ? selected.filter((c) => c !== container)
        : [...selected, container]
    );
  const toggleAll = () =>
    setSelection((selected: ContainerInfo[]) =>
      selected.length === filteredContainers.length ? [] : filteredContainers.map((c) => c)
    );

  return (
    <ScrollArea style={{ height: '100%' }} offsetScrollbars>
      <TextInput
        placeholder={t('search.placeholder') ?? undefined}
        mr="md"
        icon={<IconSearch size={14} />}
        value={search}
        autoFocus
        onChange={handleSearchChange}
      />
      <Table ref={ref} captionSide="bottom" highlightOnHover verticalSpacing="sm">
        <thead>
          <tr>
            <th style={{ width: 40 }}>
              <Checkbox
                onChange={toggleAll}
                checked={selection.length === filteredContainers.length && selection.length > 0}
                indeterminate={
                  selection.length > 0 && selection.length !== filteredContainers.length
                }
                transitionDuration={0}
                disabled={filteredContainers.length === 0}
              />
            </th>
            <th>{t('table.header.name')}</th>
            {width > MIN_WIDTH_MOBILE ? <th>{t('table.header.image')}</th> : null}
            {width > MIN_WIDTH_MOBILE ? <th>{t('table.header.ports')}</th> : null}
            <th>{t('table.header.state')}</th>
          </tr>
        </thead>
        <tbody>
          {filteredContainers.map((container) => {
            const selected = selection.includes(container);
            return (
              <Row
                key={container.Id}
                container={container}
                icon={(container as any).icon ?? undefined}
                selected={selected}
                toggleRow={toggleRow}
                width={width}
              />
            );
          })}
        </tbody>
      </Table>
    </ScrollArea>
  );
}

type RowProps = {
  container: ContainerInfo;
  selected: boolean;
  toggleRow: (container: ContainerInfo) => void;
  width: number;
  icon?: string;
};
const Row = ({ icon, container, selected, toggleRow, width }: RowProps) => {
  const { t } = useTranslation('modules/docker');
  const { classes, cx } = useStyles();
  const containerName = container.Names[0].replace('/', '');

  return (
    <tr className={cx({ [classes.rowSelected]: selected })}>
      <td>
        <Checkbox checked={selected} onChange={() => toggleRow(container)} transitionDuration={0} />
      </td>
      <td>
        <Group noWrap>
          <Image withPlaceholder src={icon} width={30} height={30} />
          <Text size="lg" weight={600}>
            {containerName}
          </Text>
        </Group>
      </td>
      {width > MIN_WIDTH_MOBILE && (
        <td>
          <Text size="lg">{container.Image.slice(0, 25)}</Text>
        </td>
      )}
      {width > MIN_WIDTH_MOBILE && (
        <td>
          <Group>
            {container.Ports.sort((a, b) => a.PrivatePort - b.PrivatePort)
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
            {container.Ports.length > 3 && (
              <Badge variant="filled">
                {t('table.body.portCollapse', { ports: container.Ports.length - 3 })}
              </Badge>
            )}
          </Group>
        </td>
      )}
      <td>
        <ContainerState state={container.State} />
      </td>
    </tr>
  );
};

function filterContainers(data: Dockerode.ContainerInfo[], search: string) {
  const query = search.toLowerCase().trim();
  return data.filter((item) =>
    item.Names.some((name) => name.toLowerCase().includes(query) || item.Image.includes(query))
  );
}
