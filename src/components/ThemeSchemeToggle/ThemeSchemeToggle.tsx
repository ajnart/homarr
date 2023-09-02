import {
  ActionIcon,
  ActionIconProps,
} from '@mantine/core';
import { useColorScheme } from '~/hooks/use-colorscheme';
import { IconMoonStars, IconSun } from '@tabler/icons-react';

export const ThemeSchemeToggle = (props : Partial<ActionIconProps>) => {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const Icon = colorScheme === 'dark' ? IconSun : IconMoonStars;

  return (
    <ActionIcon
      size={50}
      variant="outline"
      radius="md"
      onClick={toggleColorScheme}
      {...props}
    >
      <Icon size="66%"/>
    </ActionIcon>
  );
};
