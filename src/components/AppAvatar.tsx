import { Avatar, useMantineTheme } from '@mantine/core';

export const AppAvatar = ({ iconUrl }: { iconUrl: string }) => {
  const { colors, colorScheme } = useMantineTheme();

  return (
    <Avatar
      src={iconUrl}
      bg={colorScheme === 'dark' ? colors.gray[8] : colors.gray[2]}
      size="sm"
      radius="xl"
      p={4}
    />
  );
};
