import React from 'react';
import { createStyles, Header as Head, Group, Box } from '@mantine/core';
import { Logo } from './Logo';
import SearchBar from '../SearchBar/SearchBar';
import { AddItemShelfButton } from '../AppShelf/AddAppShelfItem';
import { SettingsMenuButton } from '../Settings/SettingsMenu';

const HEADER_HEIGHT = 60;

const useStyles = createStyles((theme) => ({
  hide: {
    [theme.fn.smallerThan('xs')]: {
      display: 'none',
    },
  },
}));

export function Header(props: any) {
  const { classes, cx } = useStyles();

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
        </Group>
      </Group>
    </Head>
  );
}
