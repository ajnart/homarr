import { Group, Stack } from '@mantine/core';
import { useEffect, useRef } from 'react';
import { CategorySection, EmptySection, useRequiredBoard } from '~/components/Board/context';
import { useResize } from '~/hooks/use-resize';
import { useScreenLargerThan } from '~/hooks/useScreenLargerThan';

import { DashboardSidebar } from '../Wrappers/Sidebar/Sidebar';
import { DashboardWrapper } from '../Wrappers/Wrapper/Wrapper';
import { useGridstackStore } from '../Wrappers/gridstack/store';

export const BoardView = () => {
  const sections = useStackedSections();
  const sidebarsVisible = useSidebarVisibility();
  const { isReady, mainAreaRef } = usePrepareGridstack();

  return (
    <Group align="top" h="100%" spacing="xs">
      {sidebarsVisible.left ? (
        <DashboardSidebar location="left" isGridstackReady={isReady} />
      ) : null}

      <Stack ref={mainAreaRef} mx={-10} style={{ flexGrow: 1 }}>
        {isReady &&
          sections.map((item) =>
            item.type === 'category' ? (
              <span>{item.name}</span>
            ) : (
              <DashboardWrapper key={item.id} section={item} />
            )
          )}
      </Stack>

      {sidebarsVisible.right ? (
        <DashboardSidebar location="right" isGridstackReady={isReady} />
      ) : null}
    </Group>
  );
};
// <DashboardCategory key={item.id} category={item as unknown as CategoryType} />
// <DashboardWrapper key={item.id} wrapper={item as WrapperType} />

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
  const board = useRequiredBoard();
  const screenLargerThanMd = useScreenLargerThan('md'); // For smaller screens mobile ribbons are displayed with drawers

  const isScreenSizeUnknown = typeof screenLargerThanMd === 'undefined';

  return {
    right: board.isRightSidebarVisible && screenLargerThanMd,
    left: board.isLeftSidebarVisible && screenLargerThanMd,
    isLoading: isScreenSizeUnknown,
  };
};

const useStackedSections = () => {
  const board = useRequiredBoard();
  return board.sections.filter(
    (s): s is CategorySection | EmptySection => s.type === 'category' || s.type === 'empty'
  );
};
