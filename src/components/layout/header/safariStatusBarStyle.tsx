import { useMantineTheme } from '@mantine/core';

export const SafariStatusBarStyle = () => {
  const colorScheme = useMantineTheme();

  const isDark = colorScheme.colorScheme === 'dark';

  if (isDark) {
    return <meta name="apple-mobile-web-app-status-bar-style" content="white-translucent" />;
  }

  return <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />;
};
