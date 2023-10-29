import { ActionIcon, Space, createStyles } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useConfigContext } from '~/config/provider';
import { useScreenLargerThan } from '~/hooks/useScreenLargerThan';

import { MobileRibbonSidebarDrawer } from './MobileRibbonSidebarDrawer';

export const MobileRibbons = () => {
  const { classes, cx } = useStyles();
  const { config } = useConfigContext();
  const [openedRight, rightSidebar] = useDisclosure(false);
  const [openedLeft, leftSidebar] = useDisclosure(false);
  const screenLargerThanMd = useScreenLargerThan('md');

  if (screenLargerThanMd || !config) {
    return <></>;
  }

  const layoutSettings = config.settings.customization.layout;

  return (
    <div className={classes.root}>
      {layoutSettings.enabledLeftSidebar ? (
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
            location="left"
          />
        </>
      ) : (
        <Space />
      )}

      {layoutSettings.enabledRightSidebar ? (
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
            location="right"
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
