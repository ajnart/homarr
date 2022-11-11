import React, { useState } from 'react';
import { createStyles, Switch, Group } from '@mantine/core';
import { useTranslation } from 'next-i18next';
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

export function SearchNewTabSwitch() {
  const { config, setConfig } = useConfig();
  const { classes, cx } = useStyles();
  const defaultPosition = config?.settings?.searchNewTab ?? true;
  const [openInNewTab, setOpenInNewTab] = useState<boolean>(defaultPosition);
  const { t } = useTranslation('settings/general/search-engine');
  const toggleOpenInNewTab = () => {
    setOpenInNewTab(!openInNewTab);
    setConfig({
      ...config,
      settings: {
        ...config.settings,
        searchNewTab: !openInNewTab,
      },
    });
  };

  return (
    <Group>
      <div className={classes.root}>
        <Switch checked={openInNewTab} onChange={() => toggleOpenInNewTab()} size="md" />
      </div>
      {t('searchNewTab.label')}
    </Group>
  );
}
