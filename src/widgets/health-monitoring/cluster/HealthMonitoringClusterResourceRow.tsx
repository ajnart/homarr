import { Accordion, Badge, Group, Indicator, Popover, Table, Text } from '@mantine/core';
import { TablerIconsProps } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ResourceTypeEntryDetails } from '~/widgets/health-monitoring/cluster/HealthMonitoringClusterDetailPopover';
import { ResourceData } from '~/widgets/health-monitoring/cluster/types';

interface ResourceType {
  data: ResourceData[];
  icon: (props: TablerIconsProps) => JSX.Element;
  title: string;
  count: number;
  length: number;
  indicatorColorControl: string;
}

interface ResourceTypeProps {
  item: ResourceType;
  id: string;
  include: boolean;
  tableConfig: TableViewConfig;
}

interface TableViewConfig {
  showCpu: boolean;
  showRam: boolean;
  showNode: boolean;
}

const indicatorColorControl = (entry: ResourceType) => {
  return (entry.indicatorColorControl === 'all' && entry.count == entry.length) ||
    (entry.indicatorColorControl === 'any' && entry.count > 0)
    ? 'green'
    : 'orange';
};

export const ResourceType = ({ item, id, include, tableConfig }: ResourceTypeProps) => {
  const { t } = useTranslation('modules/health-monitoring');
  if (!include) {
    return null;
  }
  return (
    <Accordion.Item value={id}>
      <Accordion.Control icon={<item.icon />}>
        <Group style={{ rowGap: '0' }}>
          <Text>{item.title}</Text>
          <Badge variant="dot" color={indicatorColorControl(item)} size="lg">
            {item.count} / {item.length}
          </Badge>
        </Group>
      </Accordion.Control>
      <Accordion.Panel>
        <Table highlightOnHover>
          <thead>
            <tr>
              <th>{t('cluster.table.header.name')}</th>
              {tableConfig.showCpu && <th>{t('cluster.table.header.cpu')}</th>}
              {tableConfig.showRam && <th>{t('cluster.table.header.ram')}</th>}
              {tableConfig.showNode && <th>{t('cluster.table.header.node')}</th>}
            </tr>
          </thead>
          <tbody>
            {item.data.map((data) => {
              return <ResourceTypeEntry entry={data} tableConfig={tableConfig} />;
            })}
          </tbody>
        </Table>
      </Accordion.Panel>
    </Accordion.Item>
  );
};

interface ResourceTypeEntryProps {
  entry: ResourceData;
  tableConfig: TableViewConfig;
}

const ResourceTypeEntry = ({ entry, tableConfig }: ResourceTypeEntryProps) => {
  return (
    <Popover
      withArrow
      withinPortal
      radius="lg"
      shadow="sm"
      transitionProps={{
        transition: 'pop',
      }}
    >
      <Popover.Target>
        <tr>
          <td>
            <Group noWrap>
              <Indicator size={14} children={null} color={entry.running ? 'green' : 'yellow'} />
              <Text lineClamp={1}>{entry.name}</Text>
            </Group>
          </td>
          {tableConfig.showCpu && (
            <td style={{ whiteSpace: 'nowrap' }}>{(entry.cpu * 100).toFixed(1)}%</td>
          )}
          {tableConfig.showRam && (
            <td style={{ whiteSpace: 'nowrap' }}>
              {(entry.maxMem ? (entry.mem / entry.maxMem) * 100 : 0).toFixed(1)}%
            </td>
          )}
          {tableConfig.showNode && <td style={{ WebkitLineClamp: '1' }}>{entry.node}</td>}
        </tr>
      </Popover.Target>
      <Popover.Dropdown>
        <ResourceTypeEntryDetails entry={entry} />
      </Popover.Dropdown>
    </Popover>
  );
};
