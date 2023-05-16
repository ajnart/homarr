import { Menu, useMantineColorScheme } from '@mantine/core';
import { IconMoonStars, IconSun } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';

export const ColorSchemeSwitch = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { t } = useTranslation('settings/general/theme-selector');

  const Icon = colorScheme === 'dark' ? IconSun : IconMoonStars;

  return (
    <Menu.Item
      closeMenuOnClick={false}
      icon={<Icon strokeWidth={1.2} size={18} />}
      onClick={() => toggleColorScheme()}
    >
      {t('label', {
        theme: colorScheme === 'dark' ? 'light' : 'dark',
      })}
    </Menu.Item>
  );
};
