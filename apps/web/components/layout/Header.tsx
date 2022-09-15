import { Box, createStyles, Group, Header as Head, useMantineColorScheme } from '@mantine/core';
import { AddItemShelfButton } from '../AppShelf/AddAppShelfItem';

import DockerMenuButton from '../../modules/docker/DockerModule';
import SearchBar from '../../modules/search/SearchModule';
import { SettingsMenuButton } from '../Settings/SettingsMenu';
import { Logo } from './Logo';
import { useConfig } from '../../lib/state';

const HEADER_HEIGHT = 60;

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

export function Header(props: any) {
  const { classes, cx } = useStyles();
  const { config } = useConfig();
  const { colorScheme } = useMantineColorScheme();

  return (
    <Head
      height="auto"
      style={{
        background: `rgba(${colorScheme === 'dark' ? '37, 38, 43,' : '255, 255, 255,'} \
      ${(config.settings.appOpacity || 100) / 100}`,
        borderColor: `rgba(${colorScheme === 'dark' ? '37, 38, 43,' : '233, 236, 239,'} \
      ${(config.settings.appOpacity || 100) / 100}`,
      }}
    >
      <Group p="xs" position="apart">
        <Box className={classes.hide}>
          <Logo style={{ fontSize: 22 }} />
        </Box>
        <Group noWrap>
          <SearchBar />
          <DockerMenuButton />
          <SettingsMenuButton />
          <AddItemShelfButton />
        </Group>
      </Group>
    </Head>
  );
}
