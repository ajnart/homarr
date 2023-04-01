import { Avatar, DefaultMantineColor, useMantineTheme } from '@mantine/core';

export const AppAvatar = ({
  iconUrl,
  color,
}: {
  iconUrl: string;
  color?: DefaultMantineColor | undefined;
}) => {
  const { colors, colorScheme } = useMantineTheme();

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
          borderColor: color !== undefined ? colors[color] : undefined,
        },
      }}
    />
  );
};
