import React, { useState } from 'react';
import {
  createStyles,
  Header as Head,
  Container,
  Group,
  Burger,
  Drawer,
  Center,
} from '@mantine/core';
import { useBooleanToggle } from '@mantine/hooks';
import { NextLink } from '@mantine/next';
import { Logo } from './Logo';
import { SettingsMenuButton } from '../Settings/SettingsMenu';
import CalendarComponent from '../modules/calendar/CalendarModule';

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
    justifyContent: 'space-between',
    alignItems: 'center',
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

export function Header({ links }: HeaderResponsiveProps) {
  const [opened, toggleOpened] = useBooleanToggle(false);
  const [active, setActive] = useState('/');
  const { classes, cx } = useStyles();

  const items = (
    <>
      {links.map((link) => (
        <NextLink
          key={link.label}
          href={link.link}
          className={cx(classes.link, { [classes.linkActive]: active === link.link })}
          onClick={(event) => {
            setActive(link.link);
            toggleOpened(false);
          }}
        >
          {link.label}
        </NextLink>
      ))}
    </>
  );
  return (
    <Head height={HEADER_HEIGHT} mb={10} className={classes.root}>
      <Container className={classes.header}>
        <Group>
          <NextLink style={{ textDecoration: 'none' }} href="/">
            <Logo style={{ fontSize: 22 }} />
          </NextLink>
        </Group>
        <Group spacing={5} className={classes.links}>
          {items}
        </Group>
        <Group>
          <SettingsMenuButton />

          <Burger
            opened={opened}
            onClick={() => toggleOpened()}
            className={classes.burger}
            size="sm"
          />
        </Group>

        <Drawer
          opened={opened}
          overlayOpacity={0.55}
          overlayBlur={3}
          onClose={() => toggleOpened()}
          position="right"
        >
          {opened ?? (
            <Center>
              <CalendarComponent />
            </Center>
          )}
        </Drawer>
      </Container>
    </Head>
  );
}
