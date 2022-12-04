import { Box, createStyles, Group, Header as MantineHeader, useMantineTheme } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { AddItemShelfButton } from '../../AppShelf/AddAppShelfItem';

import DockerMenuButton from '../../../modules/docker/DockerModule';
import { Search } from './Search';
import { SettingsMenuButton } from '../../Settings/SettingsMenu';
import { Logo } from '../Logo';
import { useCardStyles } from '../useCardStyles';

export const HeaderHeight = 64;

export function Header(props: any) {
  const { classes } = useStyles();
  const { classes: cardClasses } = useCardStyles();

  return (
    <MantineHeader height={HeaderHeight} className={cardClasses.card}>
      <Group p="xs" noWrap grow>
        <Box className={classes.hide}>
          <Logo />
        </Box>
        <Group position="right" noWrap>
          <Search />
          <DockerMenuButton />
          <SettingsMenuButton />
          <AddItemShelfButton />
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
