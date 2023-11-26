import { Box, Group, LoadingOverlay, Stack } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { useCallback, useEffect, useRef } from 'react';
import {
  CategorySection,
  EmptySection,
  SidebarSection,
  useRequiredBoard,
} from '~/components/Board/context';
import { useResize } from '~/hooks/use-resize';
import { useScreenLargerThan } from '~/hooks/useScreenLargerThan';

import { BoardCategorySection } from './Sections/Category/CategorySection';
import { BoardEmptySection } from './Sections/EmptySection';
import { DashboardSidebar } from './Sections/Sidebar/SidebarSection';
import { useGridstackStore } from './gridstack/store';

export const BoardView = () => {
  const boardName = useRequiredBoard().name;
  const stackedSections = useStackedSections();
  const sidebarsVisible = useSidebarVisibility();
  const { isReady, mainAreaRef } = usePrepareGridstack();
  const leftSidebarSection = useSidebarSection('left');
  const rightSidebarSection = useSidebarSection('right');
  const [toggledCategories, setToggledCategories] = useLocalStorage({
    key: `${boardName}-category-section-toggled`,
    // This is a bit of a hack to toggle the categories on the first load, return a string[] of the categories
    defaultValue: stackedSections.filter((s) => s.kind === 'category').map((s) => s.id),
  });
  const toggleCategory = useCallback((categoryId: string) => {
    setToggledCategories((current) => {
      if (current.includes(categoryId)) {
        return current.filter((x) => x !== categoryId);
      }
      return [...current, categoryId];
    });
  }, []);

  return (
    <Box h="100%" pos="relative">
      <LoadingOverlay
        visible={!isReady}
        transitionDuration={500}
        loaderProps={{ size: 'lg', variant: 'bars' }}
        h="calc(100dvh - var(--mantine-header-height))"
      />
      <Group
        align="top"
        h="100%"
        spacing="xs"
        style={{ visibility: isReady ? 'visible' : 'hidden' }}
      >
        {sidebarsVisible.left && leftSidebarSection ? (
          <DashboardSidebar section={leftSidebarSection} />
        ) : null}

        <Stack ref={mainAreaRef} mx={-10} style={{ flexGrow: 1 }}>
          {stackedSections.map((item) =>
            item.kind === 'category' ? (
              <BoardCategorySection
                key={item.id}
                section={item}
                isOpened={toggledCategories.includes(item.id)}
                toggle={toggleCategory}
              />
            ) : (
              <BoardEmptySection key={item.id} section={item} />
            )
          )}
        </Stack>

        {sidebarsVisible.right && rightSidebarSection ? (
          <DashboardSidebar section={rightSidebarSection} />
        ) : null}
      </Group>
    </Box>
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
    isReady: !!mainAreaWidth,
    mainAreaRef,
  };
};

const useSidebarVisibility = () => {
  const layout = useRequiredBoard().layout;
  const screenLargerThanMd = useScreenLargerThan('md'); // For smaller screens mobile ribbons are displayed with drawers

  const isScreenSizeUnknown = typeof screenLargerThanMd === 'undefined';

  return {
    right: layout.showRightSidebar && screenLargerThanMd,
    left: layout.showLeftSidebar && screenLargerThanMd,
    isLoading: isScreenSizeUnknown,
  };
};

const useStackedSections = () => {
  const board = useRequiredBoard();
  return board.sections
    .filter((s): s is CategorySection | EmptySection => s.kind === 'category' || s.kind === 'empty')
    .sort((a, b) => a.position - b.position);
};

const useSidebarSection = (position: 'left' | 'right') => {
  const board = useRequiredBoard();
  return board.sections.find(
    (s): s is SidebarSection => s.kind === 'sidebar' && s.position === position
  );
};
