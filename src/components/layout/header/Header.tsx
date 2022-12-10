import { Box, createStyles, Group, Header as MantineHeader } from '@mantine/core';
import { useConfigContext } from '../../../config/provider';
import { Logo } from '../Logo';
import { useCardStyles } from '../useCardStyles';
import { AddElementAction } from './Actions/AddElementAction/AddElementAction';
import { ToggleEditModeAction } from './Actions/ToggleEditMode/ToggleEditMode';
import { Search } from './Search';
import { SettingsMenu } from './SettingsMenu';

export const HeaderHeight = 64;

export function Header(props: any) {
  const { classes } = useStyles();
  const { classes: cardClasses } = useCardStyles();

  const { config } = useConfigContext();

  return (
    <MantineHeader height={HeaderHeight} className={cardClasses.card}>
      <Group p="xs" noWrap grow>
        <Box className={classes.hide}>
          <Logo />
        </Box>
        <Group position="right" style={{ maxWidth: 'none' }} noWrap>
          <Search />
          <AddElementAction />
          <ToggleEditModeAction />
          <SettingsMenu />
        </Group>
      </Group>
    </MantineHeader>
  );
}

const useStyles = createStyles((theme) => ({
  hide: {
    [theme.fn.smallerThan('xs')]: {
      display: 'none',
    },
  },
}));
