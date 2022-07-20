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
import { ModuleWrapper } from '../modules/moduleWrapper';
import DockerDrawer from '../Docker/DockerDrawer';
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
          <DockerDrawer />
          <SettingsMenuButton />
          <AddItemShelfButton />
          <ActionIcon className={classes.burger} variant="default" radius="md" size="xl">
            <Burger
              opened={!hidden}
              onClick={(_) => {
                toggleHidden();
                toggleOpened();
              }}
            />
          </ActionIcon>
          <Drawer
            size="auto"
            padding="xl"
            position="right"
            hidden={hidden}
            title={<Title order={3}>Modules</Title>}
            opened
            onClose={() => {
              toggleHidden();
            }}
          >
            <Transition
              mounted={opened}
              transition="pop-top-right"
              duration={300}
              timingFunction="ease"
              onExit={() => toggleOpened()}
            >
              {(styles) => (
                <div style={styles}>
                  <ScrollArea offsetScrollbars style={{ height: '90vh' }}>
                    <Group my="sm" grow direction="column" style={{ width: 300 }}>
                      <ModuleWrapper module={CalendarModule} />
                      <ModuleWrapper module={TotalDownloadsModule} />
                      <ModuleWrapper module={WeatherModule} />
                      <ModuleWrapper module={DateModule} />
                      <ModuleWrapper module={DashdotModule} />
                    </Group>
                  </ScrollArea>
                </div>
              )}
            </Transition>
          </Drawer>
        </Group>
      </Group>
    </Head>
  );
}
