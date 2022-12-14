import { ActionIcon, createStyles, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons';

export const MobileRibbons = () => {
  const theme = useMantineTheme();
  const { classes, cx } = useStyles();

  const screenSmallerThanSm = useMediaQuery(`(min-width: ${theme.breakpoints.sm}px)`);

  if (screenSmallerThanSm) {
    return <></>;
  }

  return (
    <div className={classes.root}>
      <ActionIcon className={cx(classes.button, classes.removeBorderLeft)} variant="default">
        <IconChevronRight />
      </ActionIcon>

      <ActionIcon className={cx(classes.button, classes.removeBorderRight)} variant="default">
        <IconChevronLeft />
      </ActionIcon>
    </div>
  );
};

const useStyles = createStyles(() => ({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100vw',
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