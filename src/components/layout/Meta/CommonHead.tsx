import { useMantineTheme } from '@mantine/core';
import Head from 'next/head';

export const CommonHead = () => {
  const { colorScheme } = useMantineTheme();

  return (
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      <link rel="shortcut icon" href="/imgs/favicon/favicon.svg" />

      <link crossOrigin="use-credentials" rel="manifest" href="/site.webmanifest" />

      {/* configure apple splash screen & touch icon */}
      <link rel="apple-touch-icon" href="/imgs/pwa/apple-icon-180.png" />
      <meta name="apple-mobile-web-app-title" content="Homarr" />

      <meta name="apple-mobile-web-app-capable" content="yes" />

      <meta
        name="apple-mobile-web-app-status-bar-style"
        content={colorScheme === 'dark' ? 'white-translucent' : 'black-translucent'}
      />
    </Head>
  );
};
