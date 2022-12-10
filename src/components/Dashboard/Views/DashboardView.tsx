import { Group, Stack } from '@mantine/core';
import { useMemo } from 'react';
import { useConfigContext } from '../../../config/provider';
import { CategoryType } from '../../../types/category';
import { WrapperType } from '../../../types/wrapper';
import { DashboardCategory } from '../Wrappers/Category/Category';
import { DashboardSidebar } from '../Wrappers/Sidebar/Sidebar';
import { DashboardWrapper } from '../Wrappers/Wrapper/Wrapper';

export const DashboardView = () => {
  const wrappers = useWrapperItems();
  const clockModule = useConfigContext().config?.integrations.clock;

  return (
    <Group align="top" h="100%">
      <DashboardSidebar location="left" />
      <Stack mx={-10} style={{ flexGrow: 1 }}>
        {wrappers.map((item) =>
          item.type === 'category' ? (
            <DashboardCategory key={item.id} category={item as unknown as CategoryType} />
          ) : (
            <DashboardWrapper key={item.id} wrapper={item as WrapperType} />
          )
        )}
      </Stack>
      <DashboardSidebar location="right" />
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
