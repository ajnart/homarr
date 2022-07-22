import {
  ActionIcon,
  Box,
  Burger,
  createStyles,
  Drawer,
  Group,
  Header as Head,
  ScrollArea,
  Title,
  Transition,
} from '@mantine/core';
import { useBooleanToggle } from '@mantine/hooks';
import { AddItemShelfButton } from '../AppShelf/AddAppShelfItem';
import {
  CalendarModule,
  DateModule,
  TotalDownloadsModule,
  WeatherModule,
  DashdotModule,
} from '../modules';
import DockerMenuButton from '../modules/docker/DockerModule';
import { ModuleWrapper } from '../modules/moduleWrapper';
import SearchBar from '../modules/search/SearchModule';
import { SettingsMenuButton } from '../Settings/SettingsMenu';
import { Logo } from './Logo';

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
  const [opened, toggleOpened] = useBooleanToggle(false);
  const { classes, cx } = useStyles();
  const [hidden, toggleHidden] = useBooleanToggle(true);

  return (
    <Head height="auto">
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
