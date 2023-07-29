import { ColorScheme, ColorSchemeProvider, MantineProvider, MantineTheme } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import Consola from 'consola';
import { getCookie, setCookie } from 'cookies-next';
import { GetServerSidePropsContext } from 'next';
import { Session } from 'next-auth';
import { SessionProvider, getSession } from 'next-auth/react';
import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import 'video.js/dist/video-js.css';
import { env } from '~/env.js';
import { useColorScheme } from '~/hooks/use-colorscheme';
import { ConfigType } from '~/types/config';
import { api } from '~/utils/api';
import { colorSchemeParser } from '~/validations/user';

import { COOKIE_COLOR_SCHEME_KEY, COOKIE_LOCALE_KEY } from '../../data/constants';
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

  const { setInitialPackageAttributes } = usePackageAttributesStore();

  useEffect(() => {
    setInitialPackageAttributes(props.pageProps.packageAttributes);
  }, []);

  const asyncStoragePersister = createAsyncStoragePersister({
    storage: AsyncStorage,
  });

  const { colorScheme, toggleColorScheme } = useColorScheme(
    pageProps.colorScheme,
    pageProps.session
  );

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

  // Set the cookie language to the user language if it is not set correctly
  const cookieLanguage = getCookie(COOKIE_LOCALE_KEY, ctx);
  if (session?.user && session.user.language != cookieLanguage) {
    setCookie(COOKIE_LOCALE_KEY, session.user.language, ctx);
  }

  return {
    pageProps: {
      colorScheme: getActiveColorScheme(session, ctx),
      packageAttributes: getServiceSidePackageAttributes(),
      session,
    },
  };
};

export default appWithTranslation<any>(api.withTRPC(App), nextI18nextConfig as any);

const getActiveColorScheme = (session: Session | null, ctx: GetServerSidePropsContext) => {
  const environmentColorScheme = env.DEFAULT_COLOR_SCHEME ?? 'light';
  const cookieColorScheme = getCookie(COOKIE_COLOR_SCHEME_KEY, ctx);
  const activeColorScheme = colorSchemeParser.parse(
    session?.user?.colorScheme ?? cookieColorScheme ?? environmentColorScheme
  );

  if (cookieColorScheme !== activeColorScheme) {
    setCookie(COOKIE_COLOR_SCHEME_KEY, activeColorScheme, ctx);
  }

  return activeColorScheme === 'environment' ? environmentColorScheme : activeColorScheme;
};
