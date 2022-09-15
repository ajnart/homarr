import { createStyles, Navbar as MantineNavbar } from '@mantine/core';
import Widgets from './Widgets';

const useStyles = createStyles((theme) => ({
  hide: {
    [theme.fn.smallerThan('xs')]: {
      display: 'none',
    },
  },
  burger: {
    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },
}));

export default function Navbar() {
  const { classes, cx } = useStyles();

  return (
    <MantineNavbar
      pl="md"
      hiddenBreakpoint="sm"
      hidden
      className={cx(classes.hide)}
      style={{
        border: 'none',
        background: 'none',
      }}
      width={{
        base: 'auto',
      }}
    >
      <Widgets />
    </MantineNavbar>
  );
}
