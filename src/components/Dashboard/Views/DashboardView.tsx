import { Group, Stack } from '@mantine/core';
import { useEffect, useMemo, useRef } from 'react';
import { useConfigContext } from '~/config/provider';
import { useResize } from '~/hooks/use-resize';
import { useScreenLargerThan } from '~/hooks/useScreenLargerThan';
import { CategoryType } from '~/types/category';
import { WrapperType } from '~/types/wrapper';

import { DashboardCategory } from '../Wrappers/Category/Category';
import { DashboardSidebar } from '../Wrappers/Sidebar/Sidebar';
import { DashboardWrapper } from '../Wrappers/Wrapper/Wrapper';
import { useGridstackStore } from '../Wrappers/gridstack/store';

export const DashboardView = () => {
  const wrappers = useWrapperItems();
  const sidebarsVisible = useSidebarVisibility();
  const { isReady, mainAreaRef } = usePrepareGridstack();

  return (
    <Group align="top" h="100%" spacing="xs">
      {sidebarsVisible.left ? (
        <DashboardSidebar location="left" isGridstackReady={isReady} />
      ) : null}

      <Stack ref={mainAreaRef} mx={-10} style={{ flexGrow: 1 }}>
        {isReady &&
          wrappers.map((item) =>
            item.type === 'category' ? (
              <DashboardCategory key={item.id} category={item as unknown as CategoryType} />
            ) : (
              <DashboardWrapper key={item.id} wrapper={item as WrapperType} />
            )
          )}
      </Stack>

      {sidebarsVisible.right ? (
        <DashboardSidebar location="right" isGridstackReady={isReady} />
      ) : null}
    </Group>
  );
};

const usePrepareGridstack = () => {
  const mainAreaRef = useRef<HTMLDivElement>(null);
  const { width } = useResize(mainAreaRef, []);
  const setMainAreaWidth = useGridstackStore((x) => x.setMainAreaWidth);
  const mainAreaWidth = useGridstackStore((x) => x.mainAreaWidth);

  useEffect(() => {
    if (width === 0) return;
    setMainAreaWidth(width);
  }, [width]);

  return {
    isReady: Boolean(mainAreaWidth),
    mainAreaRef,
  };
};

const useSidebarVisibility = () => {
  const layoutSettings = useConfigContext()?.config?.settings.customization.layout;
  const screenLargerThanMd = useScreenLargerThan('md'); // For smaller screens mobile ribbons are displayed with drawers

  const isScreenSizeUnknown = typeof screenLargerThanMd === 'undefined';

  return {
    right: layoutSettings?.enabledRightSidebar && screenLargerThanMd,
    left: layoutSettings?.enabledLeftSidebar && screenLargerThanMd,
    isLoading: isScreenSizeUnknown,
  };
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
