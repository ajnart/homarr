import { ActionIcon, Space, createStyles } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { SidebarSection, useRequiredBoard } from '~/components/Board/context';
import { useScreenLargerThan } from '~/hooks/useScreenLargerThan';

import { MobileRibbonSidebarDrawer } from './MobileRibbonSidebarDrawer';

export const MobileRibbons = () => {
  const { classes, cx } = useStyles();
  const board = useRequiredBoard();
  const [openedRight, rightSidebar] = useDisclosure(false);
  const [openedLeft, leftSidebar] = useDisclosure(false);
  const screenLargerThanMd = useScreenLargerThan('md');

  if (screenLargerThanMd) {
    return <></>;
  }

  const leftSection = board.sections.find(
    (x): x is SidebarSection => x.kind === 'sidebar' && x.position === 'left'
  )!;
  const rightSection = board.sections.find(
    (x): x is SidebarSection => x.kind === 'sidebar' && x.position === 'right'
  )!;

  return (
    <div className={classes.root}>
      {board.layout.showLeftSidebar && leftSection ? (
        <>
          <ActionIcon
            onClick={leftSidebar.open}
            className={cx(classes.button, classes.removeBorderLeft)}
            variant="default"
          >
            <IconChevronRight />
          </ActionIcon>
          <MobileRibbonSidebarDrawer
            onClose={leftSidebar.close}
            opened={openedLeft}
            section={leftSection}
          />
        </>
      ) : (
        <Space />
      )}

      {board.layout.showRightSidebar && rightSection ? (
        <>
          <ActionIcon
            onClick={rightSidebar.open}
            className={cx(classes.button, classes.removeBorderRight)}
            variant="default"
          >
            <IconChevronLeft />
          </ActionIcon>
          <MobileRibbonSidebarDrawer
            onClose={rightSidebar.close}
            opened={openedRight}
            section={rightSection}
          />
        </>
      ) : null}
    </div>
  );
};

const useStyles = createStyles(() => ({
  root: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    pointerEvents: 'none',
  },
  button: {
    height: 100,
    width: 36,
    pointerEvents: 'auto',
  },
  removeBorderLeft: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  removeBorderRight: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
}));
