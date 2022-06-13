import React, { useState } from 'react';
import { createStyles, Switch, Group } from '@mantine/core';
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

export function LogoToggleSwitch() {
  const { config, setConfig } = useConfig();
  const { classes, cx } = useStyles();
  const defaultVisibility = config?.settings?.logoVisibility || 'visible';
  const [logoVisibility, setWidgetPosition] = useState(defaultVisibility);
  const toggleWidgetPosition = () => {
    const logoVisible = logoVisibility === 'visible' ? 'hidden' : 'visible';
    setWidgetPosition(logoVisible);
    setConfig({
      ...config,
      settings: {
        ...config.settings,
        logoVisibility: logoVisible,
      },
    });
  };

  return (
    <Group>
      <div className={classes.root}>
        <Switch
          checked={logoVisibility === 'visible'}
          onChange={() => toggleWidgetPosition()}
          size="md"
        />
      </div>
      Show Logo
    </Group>
  );
}
