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
import { useEffect, useState } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ChangeAppPositionModal } from '../components/Dashboard/Modals/ChangePosition/ChangeAppPositionModal';
import { ChangeWidgetPositionModal } from '../components/Dashboard/Modals/ChangePosition/ChangeWidgetPositionModal';
import { EditAppModal } from '../components/Dashboard/Modals/EditAppModal/EditAppModal';
import { SelectElementModal } from '../components/Dashboard/Modals/SelectElement/SelectElementModal';
import { WidgetsEditModal } from '../components/Dashboard/Tiles/Widgets/WidgetsEditModal';
import { WidgetsRemoveModal } from '../components/Dashboard/Tiles/Widgets/WidgetsRemoveModal';
import { CategoryEditModal } from '../components/Dashboard/Wrappers/Category/CategoryEditModal';
import { ConfigProvider } from '../config/provider';
import '../styles/global.scss';
import { ColorTheme } from '../tools/color';
import { queryClient } from '../tools/queryClient';
import { theme } from '../tools/theme';
import {
  getServiceSidePackageAttributes,
  ServerSidePackageAttributesType,
} from '../tools/server/getPackageVersion';
import { usePackageAttributesStore } from '../tools/client/zustands/usePackageAttributesStore';

function App(
  this: any,
  props: AppProps & { colorScheme: ColorScheme; packageAttributes: ServerSidePackageAttributesType }
) {
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

  const { setInitialPackageAttributes } = usePackageAttributesStore();

  useEffect(() => {
    setInitialPackageAttributes(props.packageAttributes);
  }, []);

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
              <ConfigProvider>
                <NotificationsProvider limit={4} position="bottom-left">
                  <ModalsProvider
                    modals={{
                      editApp: EditAppModal,
                      selectElement: SelectElementModal,
                      integrationOptions: WidgetsEditModal,
                      integrationRemove: WidgetsRemoveModal,
                      categoryEditModal: CategoryEditModal,
                      changeAppPositionModal: ChangeAppPositionModal,
                      changeIntegrationPositionModal: ChangeWidgetPositionModal,
                    }}
                  >
                    <Component {...pageProps} />
                  </ModalsProvider>
                </NotificationsProvider>
              </ConfigProvider>
            </MantineProvider>
          </ColorTheme.Provider>
        </ColorSchemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </>
  );
}

App.getInitialProps = ({ ctx }: { ctx: GetServerSidePropsContext }) => ({
  colorScheme: getCookie('color-scheme', ctx) || 'light',
  packageAttributes: getServiceSidePackageAttributes(),
});

export default appWithTranslation(App);
