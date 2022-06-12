import React from 'react';
import { createStyles, Switch, Group, useMantineColorScheme, Kbd } from '@mantine/core';
import { IconSun as Sun, IconMoonStars as MoonStars } from '@tabler/icons';
import { useConfig } from '../../tools/state';

const useStyles = createStyles((theme) => ({
  root: {
    position: 'relative',
    '& *': {
      cursor: 'pointer',
    },
  },

  icon: {
    pointerEvents: 'none',
    position: 'absolute',
    zIndex: 1,
    top: 3,
  },

  iconLight: {
    left: 4,
    color: theme.white,
  },

  iconDark: {
    right: 4,
    color: theme.colors.gray[6],
  },
}));

export function ColorSchemeSwitch() {
  const { config, setConfig } = useConfig();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { classes, cx } = useStyles();

  return (
    <>
    <Group>
      <div className={classes.root}>
        <Sun className={cx(classes.icon, classes.iconLight)} size={18} />
        <MoonStars className={cx(classes.icon, classes.iconDark)} size={18} />
        <Switch checked={colorScheme === 'dark'} onChange={() => toggleColorScheme()} size="md" />
      </div>
      Switch to {colorScheme === 'dark' ? 'light' : 'dark'} mode
      <Group spacing={2}>
        <Kbd>Ctrl</Kbd>+<Kbd>J</Kbd>
      </Group>
    </Group>
    
    <Group>
      <Switch size='md' checked={config.settings.colorBlind === true} onChange={(event) => setConfig({
        ...config,
        settings: {
          ...config.settings,
          colorBlind: event.currentTarget.checked,
        },
      })}/>
      {config.settings.colorBlind === true ? 'Disable' : 'Enable'} color blind mode
    </Group>
    </>
  );
}
