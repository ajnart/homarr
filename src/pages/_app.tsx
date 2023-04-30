import { ColorScheme, ColorSchemeProvider, MantineProvider, MantineTheme } from '@mantine/core';
import { useColorScheme, useHotkeys, useLocalStorage } from '@mantine/hooks';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import Consola from 'consola';
import { getCookie } from 'cookies-next';
import { GetServerSidePropsContext } from 'next';
import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import 'video.js/dist/video-js.css';
import { api } from '~/utils/api';
import { ChangeAppPositionModal } from '../components/Dashboard/Modals/ChangePosition/ChangeAppPositionModal';
import { ChangeWidgetPositionModal } from '../components/Dashboard/Modals/ChangePosition/ChangeWidgetPositionModal';
import { EditAppModal } from '../components/Dashboard/Modals/EditAppModal/EditAppModal';
import { SelectElementModal } from '../components/Dashboard/Modals/SelectElement/SelectElementModal';
import { WidgetsEditModal } from '../components/Dashboard/Tiles/Widgets/WidgetsEditModal';
import { WidgetsRemoveModal } from '../components/Dashboard/Tiles/Widgets/WidgetsRemoveModal';
import { CategoryEditModal } from '../components/Dashboard/Wrappers/Category/CategoryEditModal';
import { ConfigProvider } from '../config/provider';
import { useEditModeInformationStore } from '../hooks/useEditModeInformation';
import '../styles/global.scss';
import { usePackageAttributesStore } from '../tools/client/zustands/usePackageAttributesStore';
import { ColorTheme } from '../tools/color';
import { queryClient } from '../tools/server/configurations/tanstack/queryClient.tool';
import {
  ServerSidePackageAttributesType,
  getServiceSidePackageAttributes,
} from '../tools/server/getPackageVersion';
import { theme } from '../tools/server/theme/theme';
import nextI18nextConfig from '../../next-i18next.config';

function App(
  this: any,
  props: AppProps<{
    colorScheme: ColorScheme;
    packageAttributes: ServerSidePackageAttributesType;
    editModeEnabled: boolean;
    defaultColorScheme: ColorScheme;
  }>
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
  const preferredColorScheme = useColorScheme(pageProps.defaultColorScheme);
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: 'mantine-color-scheme',
    defaultValue: preferredColorScheme,
    getInitialValueInEffect: true,
  });

  const { setInitialPackageAttributes } = usePackageAttributesStore();
  const { setDisabled } = useEditModeInformationStore();

  useEffect(() => {
    setInitialPackageAttributes(pageProps.packageAttributes);

    if (!pageProps.editModeEnabled) {
      setDisabled();
    }
  }, []);

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  const asyncStoragePersister = createAsyncStoragePersister({
    storage: AsyncStorage,
  });

  useHotkeys([['mod+J', () => toggleColorScheme()]]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: asyncStoragePersister }}
      >
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
                <Notifications limit={4} position="bottom-left" />
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
              </ConfigProvider>
            </MantineProvider>
          </ColorTheme.Provider>
        </ColorSchemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </PersistQueryClientProvider>
    </>
  );
}

App.getInitialProps = ({ ctx }: { ctx: GetServerSidePropsContext }) => {
  const disableEditMode =
    process.env.DISABLE_EDIT_MODE && process.env.DISABLE_EDIT_MODE.toLowerCase() === 'true';
  if (disableEditMode) {
    Consola.warn(
      'EXPERIMENTAL: You have disabled the edit mode. Modifications are no longer possible and any requests on the API will be dropped. If you want to disable this, unset the DISABLE_EDIT_MODE environment variable. This behaviour may be removed in future versions of Homarr'
    );
  }

  if (process.env.DEFAULT_COLOR_SCHEME !== undefined) {
    Consola.debug(`Overriding the default color scheme with ${process.env.DEFAULT_COLOR_SCHEME}`);
  }

  const colorScheme: ColorScheme = (process.env.DEFAULT_COLOR_SCHEME as ColorScheme) ?? 'light';

  return {
    pageProps: {
      colorScheme: getCookie('color-scheme', ctx) || 'light',
      packageAttributes: getServiceSidePackageAttributes(),
      editModeEnabled: !disableEditMode,
      defaultColorScheme: colorScheme,
    },
  };
};

export default appWithTranslation<any>(api.withTRPC(App), nextI18nextConfig as any);
