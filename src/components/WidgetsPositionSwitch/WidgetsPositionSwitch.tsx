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

export function WidgetsPositionSwitch() {
  const { config, setConfig } = useConfig();
  const { classes, cx } = useStyles();
  const defaultPosition = config?.settings?.widgetPosition || 'right';
  const [widgetPosition, setWidgetPosition] = useState(defaultPosition);
  const { t } = useTranslation('settings/general/widget-positions');
  const toggleWidgetPosition = () => {
    const position = widgetPosition === 'right' ? 'left' : 'right';
    setWidgetPosition(position);
    setConfig({
      ...config,
      settings: {
        ...config.settings,
        widgetPosition: position,
      },
    });
  };

  return (
    <Switch
      label={t('label')}
      checked={widgetPosition === 'left'}
      onChange={() => toggleWidgetPosition()}
      size="md"
    />
  );
}
