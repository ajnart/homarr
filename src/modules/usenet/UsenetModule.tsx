import { Group, Select, Tabs } from '@mantine/core';
import { IconDownload } from '@tabler/icons';
import { FunctionComponent, useState } from 'react';

import { IModule } from '../ModuleTypes';
import { UsenetQueueList } from './UsenetQueueList';
import { UsenetHistoryList } from './UsenetHistoryList';
import { useGetServiceByType } from '../../tools/hooks/useGetServiceByType';

export const UsenetComponent: FunctionComponent = () => {
  const downloadServices = useGetServiceByType('Sabnzbd');

  const [selectedServiceId, setSelectedService] = useState<string | null>(downloadServices[0]?.id);

  if (!selectedServiceId) {
    return null;
  }

  return (
    <Tabs keepMounted={false} defaultValue="queue">
      <Group mb="md">
        <Tabs.List style={{ flex: 1 }}>
          <Tabs.Tab value="queue">Queue</Tabs.Tab>
          <Tabs.Tab value="history">History</Tabs.Tab>
        </Tabs.List>
        {downloadServices.length > 1 && (
          <Select
            value={selectedServiceId}
            onChange={setSelectedService}
            ml="xs"
            data={downloadServices.map((service) => ({ value: service.id, label: service.name }))}
          />
        )}
      </Group>
      <Tabs.Panel value="queue">
        <UsenetQueueList serviceId={selectedServiceId} />
      </Tabs.Panel>
      <Tabs.Panel value="history">
        <UsenetHistoryList serviceId={selectedServiceId} />
      </Tabs.Panel>
    </Tabs>
  );
};

export const UsenetModule: IModule = {
  id: 'usenet',
  title: 'Usenet',
  icon: IconDownload,
  component: UsenetComponent,
};

export default UsenetComponent;
