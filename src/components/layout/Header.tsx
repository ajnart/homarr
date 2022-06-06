import React from 'react';
import {
  createStyles,
  Header as Head,
  Group,
  Box,
  Burger,
  Drawer,
  Title,
  ScrollArea,
  ActionIcon,
  Transition,
} from '@mantine/core';
import { useBooleanToggle } from '@mantine/hooks';
import { Logo } from './Logo';
import SearchBar from '../modules/search/SearchModule';
import { AddItemShelfButton } from '../AppShelf/AddAppShelfItem';
import { SettingsMenuButton } from '../Settings/SettingsMenu';
import { ModuleWrapper } from '../modules/moduleWrapper';
import {
  CalendarModule,
  TotalDownloadsModule,
  WeatherModule,
  DateModule,
  SystemModule,
} from '../modules';

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
  const drawerModule = CalendarModule;

  return (
    <Head height="auto">
      <Group m="xs" position="apart">
        <Box className={classes.hide}>
          <Logo style={{ fontSize: 22 }} />
        </Box>
        <Group noWrap>
          <SearchBar />
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
                  <ScrollArea style={{ height: '90vh' }}>
                    <Group my="sm" grow direction="column" style={{ width: 300 }}>
                      <ModuleWrapper module={drawerModule} />
                      <ModuleWrapper module={TotalDownloadsModule} />
                      <ModuleWrapper module={WeatherModule} />
                      <ModuleWrapper module={DateModule} />
                      <ModuleWrapper module={SystemModule} />
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
