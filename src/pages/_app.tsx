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
import { Session } from 'next-auth';
import { SessionProvider, getSession } from 'next-auth/react';
import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import 'video.js/dist/video-js.css';
import { env } from '~/env.js';
import { ConfigType } from '~/types/config';
import { api } from '~/utils/api';

import nextI18nextConfig from '../../next-i18next.config.js';
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

function App(
  this: any,
  props: AppProps<{
    colorScheme: ColorScheme;
    packageAttributes: ServerSidePackageAttributesType;
    editModeEnabled: boolean;
    defaultColorScheme: ColorScheme;
    config?: ConfigType;
    configName?: string;
    session: Session;
  }>
) {
  const { Component, pageProps } = props;

  const [primaryColor, setPrimaryColor] = useState<MantineTheme['primaryColor']>(
    props.pageProps.config?.settings.customization.colors.primary || 'red'
  );
  const [secondaryColor, setSecondaryColor] = useState<MantineTheme['primaryColor']>(
    props.pageProps.config?.settings.customization.colors.secondary || 'orange'
  );
  const [primaryShade, setPrimaryShade] = useState<MantineTheme['primaryShade']>(
    props.pageProps.config?.settings.customization.colors.shade || 6
  );
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
  const preferredColorScheme = useColorScheme(props.pageProps.defaultColorScheme);
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: 'mantine-color-scheme',
    defaultValue: preferredColorScheme,
    getInitialValueInEffect: true,
  });

  const { setInitialPackageAttributes } = usePackageAttributesStore();
  const { setDisabled } = useEditModeInformationStore();

  useEffect(() => {
    setInitialPackageAttributes(props.pageProps.packageAttributes);

    if (!props.pageProps.editModeEnabled) {
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
      <SessionProvider session={pageProps.session}>
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
                <ConfigProvider {...props.pageProps}>
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
      </SessionProvider>
    </>
  );
}

App.getInitialProps = async ({ ctx }: { ctx: GetServerSidePropsContext }) => {
  if (process.env.DISABLE_EDIT_MODE === 'true') {
    Consola.warn(
      'EXPERIMENTAL: You have disabled the edit mode. Modifications are no longer possible and any requests on the API will be dropped. If you want to disable this, unset the DISABLE_EDIT_MODE environment variable. This behaviour may be removed in future versions of Homarr'
    );
  }

  if (env.DEFAULT_COLOR_SCHEME !== 'light') {
    Consola.debug(`Overriding the default color scheme with ${env.DEFAULT_COLOR_SCHEME}`);
  }

  const session = await getSession(ctx);

  return {
    pageProps: {
      colorScheme: getCookie('color-scheme', ctx) || 'light',
      packageAttributes: getServiceSidePackageAttributes(),
      editModeEnabled: process.env.DISABLE_EDIT_MODE !== 'true',
      defaultColorScheme: env.DEFAULT_COLOR_SCHEME,
      session,
    },
  };
};

export default appWithTranslation<any>(api.withTRPC(App), nextI18nextConfig as any);
