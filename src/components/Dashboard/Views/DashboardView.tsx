import { Box, Group, LoadingOverlay, Stack } from '@mantine/core';
import { useEffect, useRef } from 'react';
import {
  CategorySection,
  EmptySection,
  SidebarSection,
  useRequiredBoard,
} from '~/components/Board/context';
import { useResize } from '~/hooks/use-resize';
import { useScreenLargerThan } from '~/hooks/useScreenLargerThan';

import { DashboardCategory } from '../Wrappers/Category/Category';
import { DashboardSidebar } from '../Wrappers/Sidebar/Sidebar';
import { DashboardWrapper } from '../Wrappers/Wrapper/Wrapper';
import { useGridstackStore } from '../Wrappers/gridstack/store';

export const BoardView = () => {
  const stackedSections = useStackedSections();
  const sidebarsVisible = useSidebarVisibility();
  const { isReady, mainAreaRef } = usePrepareGridstack();
  const leftSidebarSection = useSidebarSection('left');
  const rightSidebarSection = useSidebarSection('right');

  return (
    <Box h="100%" pos="relative">
      <LoadingOverlay
        visible={!isReady}
        transitionDuration={500}
        loaderProps={{ size: 'lg', variant: 'bars' }}
      />
      <Group
        align="top"
        h="100%"
        spacing="xs"
        style={{ visibility: isReady ? 'visible' : 'hidden' }}
      >
        {sidebarsVisible.left && leftSidebarSection ? (
          <DashboardSidebar section={leftSidebarSection} isGridstackReady={isReady} />
        ) : null}

        <Stack ref={mainAreaRef} mx={-10} style={{ flexGrow: 1 }}>
          {stackedSections.map((item) =>
            item.type === 'category' ? (
              <DashboardCategory key={item.id} section={item} />
            ) : (
              <DashboardWrapper key={item.id} section={item} />
            )
          )}
        </Stack>

        {sidebarsVisible.right && rightSidebarSection ? (
          <DashboardSidebar section={rightSidebarSection} isGridstackReady={isReady} />
        ) : null}
      </Group>
    </Box>
  );
};
// <DashboardCategory key={item.id} category={item as unknown as CategoryType} />
// <DashboardWrapper key={item.id} wrapper={item as WrapperType} />
/*
{sidebarsVisible.left ? (
        <DashboardSidebar location="left" isGridstackReady={isReady} />
      ) : null}

{sidebarsVisible.right ? (
        <DashboardSidebar location="right" isGridstackReady={isReady} />
      ) : null}
*/

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
    isReady: !!mainAreaWidth,
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

const useSidebarSection = (position: 'left' | 'right') => {
  const board = useRequiredBoard();
  return board.sections.find(
    (s): s is SidebarSection => s.type === 'sidebar' && s.position === position
  );
};
