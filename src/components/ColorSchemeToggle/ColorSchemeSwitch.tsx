import React from 'react';
import {
  createStyles,
  Switch,
  Group,
  useMantineColorScheme,
  Kbd,
  useMantineTheme,
} from '@mantine/core';
import { IconMoonStars, IconSun } from '@tabler/icons';
import { useTranslation } from 'next-i18next';

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
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { t } = useTranslation('settings/general/theme-selector');
  const theme = useMantineTheme();
  return (
    <Group>
      <Switch
        checked={colorScheme === 'dark'}
        onChange={() => toggleColorScheme()}
        size="md"
        onLabel={<IconSun color={theme.white} size={20} stroke={1.5} />}
        offLabel={<IconMoonStars color={theme.colors.gray[6]} size={20} stroke={1.5} />}
      />
      {t('label', {
        theme: colorScheme === 'dark' ? 'light' : 'dark',
      })}
      <Group spacing={2}>
        <Kbd>Ctrl</Kbd>+<Kbd>J</Kbd>
      </Group>
    </Group>
  );
}
