import { Avatar, DefaultMantineColor, useMantineTheme } from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';

export const AppAvatar = ({ iconUrl }: { iconUrl: string }) => {
  const { colors, primaryColor } = useMantineTheme();
  const colorScheme = useColorScheme();

  return (
    <Avatar
      data-testid="app-avatar"
      src={iconUrl}
      bg={colorScheme === 'dark' ? colors.gray[8] : colors.gray[2]}
      size="sm"
      radius="xl"
      p={4}
      styles={{
        root: {
          borderColor: primaryColor[5],
        },
      }}
    />
  );
};
