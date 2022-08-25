import { Skeleton, Tabs, useMantineTheme } from '@mantine/core';
import { IconDownload } from '@tabler/icons';
import { FunctionComponent } from 'react';

import { IModule } from '../ModuleTypes';
import { useGetUsenetDownloads, useGetUsenetHistory } from '../../tools/hooks/api';
import { UsenetQueueList } from './UsenetQueueList';
import { UsenetHistoryList } from './UsenetHistoryList';

export const UsenetComponent: FunctionComponent = () => {
  const theme = useMantineTheme();
  const { isLoading, data: nzbs = [] } = useGetUsenetDownloads();
  const { data: history = [] } = useGetUsenetHistory();

  if (isLoading) {
    return (
      <>
        <Skeleton height={40} mt={10} />
        <Skeleton height={40} mt={10} />
        <Skeleton height={40} mt={10} />
      </>
    );
  }

  return (
    <Tabs defaultValue="queue">
      <Tabs.List>
        <Tabs.Tab value="queue">Queue</Tabs.Tab>
        <Tabs.Tab value="history">History</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="queue">
        <UsenetQueueList items={nzbs} />
      </Tabs.Panel>
      <Tabs.Panel value="history">
        <UsenetHistoryList items={history} />
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
