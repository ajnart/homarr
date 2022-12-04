import { Group, Stack } from '@mantine/core';
import { useMemo } from 'react';
import { useConfigContext } from '../../../config/provider';
import { ServiceTile } from '../Tiles/Service/Service';
import { DashboardSidebar } from '../Wrappers/Sidebar/Sidebar';

export const DashboardView = () => {
  const wrappers = useWrapperItems();

  return (
    <Group align="top" h="100%">
      {/*<DashboardSidebar location="left" />*/}
      <Stack mx={-10} style={{ flexGrow: 1 }}>
        {wrappers.map(
          (item) =>
            item.type === 'category'
              ? 'category' //<DashboardCategory key={item.id} category={item as unknown as CategoryType} />
              : 'wrapper' //<DashboardWrapper key={item.id} wrapper={item as WrapperType} />
        )}
      </Stack>
      {/*<DashboardSidebar location="right" />*/}
    </Group>
  );
};

const useWrapperItems = () => {
  const { config } = useConfigContext();

  return useMemo(
    () =>
      config
        ? [
            ...config.categories.map((c) => ({ ...c, type: 'category' })),
            ...config.wrappers.map((w) => ({ ...w, type: 'wrapper' })),
          ].sort((a, b) => a.position - b.position)
        : [],
    [config?.categories, config?.wrappers]
  );
};
