import { ColorScheme, ColorSchemeProvider, MantineProvider, MantineTheme } from '@mantine/core';
import { useColorScheme, useHotkeys, useLocalStorage } from '@mantine/hooks';
import { ModalsProvider } from '@mantine/modals';
import { NotificationsProvider } from '@mantine/notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import { getCookie } from 'cookies-next';
import { GetServerSidePropsContext } from 'next';
import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { useState } from 'react';
import { EditServiceModal } from '../components/Dashboard/Modals/EditService/EditServiceModal';
import { SelectElementModal } from '../components/Dashboard/Modals/SelectElement/SelectElementModal';
import { ConfigProvider } from '../config/provider';
import { ColorTheme } from '../tools/color';
import { queryClient } from '../tools/queryClient';
import { theme } from '../tools/theme';

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
                <ConfigProvider>
                  <ModalsProvider
                    modals={{ editService: EditServiceModal, selectElement: SelectElementModal }}
                  >
                    <Component {...pageProps} />
                  </ModalsProvider>
                </ConfigProvider>
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
