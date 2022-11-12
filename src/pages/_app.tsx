import { GetServerSidePropsContext } from 'next';
import { useState } from 'react';
import { AppProps } from 'next/app';
import { getCookie } from 'cookies-next';
import Head from 'next/head';
import { MantineProvider, ColorScheme, ColorSchemeProvider, MantineTheme } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import { useColorScheme, useHotkeys, useLocalStorage } from '@mantine/hooks';
import { ModalsProvider } from '@mantine/modals';
import { appWithTranslation } from 'next-i18next';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from '../tools/state';
import { theme } from '../tools/theme';
import { ColorTheme } from '../tools/color';
import { queryClient } from '../tools/queryClient';

function App(this: any, props: AppProps & { colorScheme: ColorScheme }) {
  const { Component, pageProps } = props;
  const [primaryColor, setPrimaryColor] = useState<MantineTheme['primaryColor']>('red');
  const [secondaryColor, setSecondaryColor] = useState<MantineTheme['primaryColor']>('orange');
  const [primaryShade, setPrimaryShade] = useState<MantineTheme['primaryShade']>(6);
  const colorTheme = {
    primaryColor,
    secondaryColor,
    setPrimaryColor,
    setSecondaryColor,
    primaryShade,
    setPrimaryShade,
  };

  // hook will return either 'dark' or 'light' on client
  // and always 'light' during ssr as window.matchMedia is not available
  const preferredColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: 'mantine-color-scheme',
    defaultValue: preferredColorScheme,
    getInitialValueInEffect: true,
  });

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  useHotkeys([['mod+J', () => toggleColorScheme()]]);

  return (
    <>
      <Head>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
          <ColorTheme.Provider value={colorTheme}>
            <MantineProvider
              theme={{
                ...theme,
                components: {
                  Checkbox: {
                    styles: {
                      input: { cursor: 'pointer' },
                      label: { cursor: 'pointer' },
                    },
                  },
                  Switch: {
                    styles: {
                      input: { cursor: 'pointer' },
                      label: { cursor: 'pointer' },
                    },
                  },
                },
                primaryColor,
                primaryShade,
                colorScheme,
              }}
              withGlobalStyles
              withNormalizeCSS
            >
              <NotificationsProvider limit={4} position="bottom-left">
                <ModalsProvider>
                  <ConfigProvider>
                    <Component {...pageProps} />
                  </ConfigProvider>
                </ModalsProvider>
              </NotificationsProvider>
            </MantineProvider>
          </ColorTheme.Provider>
        </ColorSchemeProvider>
      </QueryClientProvider>
    </>
  );
}

App.getInitialProps = ({ ctx }: { ctx: GetServerSidePropsContext }) => ({
  colorScheme: getCookie('color-scheme', ctx) || 'light',
});

export default appWithTranslation(App);
