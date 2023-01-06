import { Center, Group, Loader, Stack } from '@mantine/core';
import { useEffect, useMemo, useRef } from 'react';
import { useConfigContext } from '../../../config/provider';
import { useResize } from '../../../hooks/use-resize';
import { useScreenSmallerThan } from '../../../hooks/useScreenSmallerThan';
import { CategoryType } from '../../../types/category';
import { WrapperType } from '../../../types/wrapper';
import { DashboardCategory } from '../Wrappers/Category/Category';
import { useGridstackStore } from '../Wrappers/gridstack/store';
import { DashboardSidebar } from '../Wrappers/Sidebar/Sidebar';
import { DashboardWrapper } from '../Wrappers/Wrapper/Wrapper';

export const DashboardView = () => {
  const wrappers = useWrapperItems();
  const layoutSettings = useConfigContext()?.config?.settings.customization.layout;
  const doNotShowSidebar = useScreenSmallerThan('md');
  const notReady = typeof doNotShowSidebar === 'undefined';
  const mainAreaRef = useRef<HTMLDivElement>(null);
  const { width } = useResize(mainAreaRef, [doNotShowSidebar]);
  const setMainAreaWidth = useGridstackStore(x => x.setMainAreaWidth);
  const mainAreaWidth = useGridstackStore(x => x.mainAreaWidth);

  useEffect(() => {
    if (width === 0) return;
    setMainAreaWidth(width);
  }, [width]);

  return (
    <Group align="top" h="100%">
      {notReady ? <Center w="100%">
          <Loader />
        </Center> : <>
      {layoutSettings?.enabledLeftSidebar && !doNotShowSidebar ? (
        <DashboardSidebar location="left" isGridstackReady={!!mainAreaWidth} />
      ) : null}
      <Stack ref={mainAreaRef} mx={-10} style={{ flexGrow: 1 }}>
        {!mainAreaWidth ? null : wrappers.map((item) =>
          item.type === 'category' ? (
            <DashboardCategory key={item.id} category={item as unknown as CategoryType} />
          ) : (
            <DashboardWrapper key={item.id} wrapper={item as WrapperType} />
          )
        )}
      </Stack>
      {layoutSettings?.enabledRightSidebar && !doNotShowSidebar ? (
        <DashboardSidebar location="right" isGridstackReady={!!mainAreaWidth} />
      ) : null}
      </>
}
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
