import React from 'react';
import {
  createStyles,
  Header as Head,
  Group,
} from '@mantine/core';
import { NextLink } from '@mantine/next';
import { Logo } from './Logo';
import { SettingsMenuButton } from '../Settings/SettingsMenu';
import { AddItemShelfButton } from '../AppShelf/AddAppShelfItem';
import SearchBar from '../SearchBar/SearchBar';

const HEADER_HEIGHT = 60;

const useStyles = createStyles((theme) => ({
  root: {
    position: 'relative',
    zIndex: 1,
  },

  dropdown: {
    position: 'absolute',
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    zIndex: 0,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopWidth: 0,
    overflow: 'hidden',

    [theme.fn.largerThan('md')]: {
      display: 'none',
    },
  },

  header: {
    display: 'flex',
    height: '100%',
  },

  links: {
    [theme.fn.smallerThan('md')]: {
      display: 'none',
    },
  },

  burger: {
    [theme.fn.largerThan('md')]: {
      display: 'none',
    },
  },

  link: {
    display: 'block',
    lineHeight: 1,
    padding: '8px 12px',
    borderRadius: theme.radius.sm,
    textDecoration: 'none',
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    },

    [theme.fn.smallerThan('sm')]: {
      borderRadius: 0,
      padding: theme.spacing.md,
    },
  },

  linkActive: {
    '&, &:hover': {
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.fn.rgba(theme.colors[theme.primaryColor][9], 0.25)
          : theme.colors[theme.primaryColor][0],
      color: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 3 : 7],
    },
  },
}));

interface HeaderResponsiveProps {
  links: { link: string; label: string }[];
}

export function Header(props: any) {
  const { classes, cx } = useStyles();

  return (
    <Head height={HEADER_HEIGHT}>
      <Group direction="row" align="center" position="apart" className={classes.header} mx="xl">
        <NextLink style={{ textDecoration: 'none' }} href="/">
          <Logo style={{ fontSize: 22 }} />
        </NextLink>
        <Group>
          <SearchBar />
          <SettingsMenuButton />
          <AddItemShelfButton />
        </Group>
      </Group>
    </Head>
  );
}
