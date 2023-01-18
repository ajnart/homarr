import { useMantineTheme } from '@mantine/core';

export const SafariStatusBarStyle = () => {
  const { colorScheme } = useMantineTheme();
  const isDark = colorScheme === 'dark';
  return (
    <meta
      name="apple-mobile-web-app-status-bar-style"
      content={isDark ? 'white-translucent' : 'black-translucent'}
    />
  );
};
