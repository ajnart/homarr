import { ColorScheme as MantineColorScheme, MantineProvider, MantineTheme } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import Consola from 'consola';
import { getCookie, setCookie } from 'cookies-next';
import 'flag-icons/css/flag-icons.min.css';
import { GetServerSidePropsContext } from 'next';
import { Session } from 'next-auth';
import { SessionProvider, getSession } from 'next-auth/react';
import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import 'video.js/dist/video-js.css';
import { z } from 'zod';
import { CommonHead } from '~/components/layout/Meta/CommonHead';
import { env } from '~/env.js';
import { ColorSchemeProvider } from '~/hooks/use-colorscheme';
import { modals } from '~/modals/modals';
import { queryClient } from '~/tools/server/configurations/tanstack/queryClient.tool';
import { ConfigType } from '~/types/config';
import { api } from '~/utils/api';
import { colorSchemeParser } from '~/validations/user';

import { COOKIE_COLOR_SCHEME_KEY, COOKIE_LOCALE_KEY } from '../../data/constants';
import nextI18nextConfig from '../../next-i18next.config.js';
import { ConfigProvider } from '../config/provider';
import '../styles/global.scss';
import { usePackageAttributesStore } from '../tools/client/zustands/usePackageAttributesStore';
import { ColorTheme } from '../tools/color';
import {
  ServerSidePackageAttributesType,
  getServiceSidePackageAttributes,
} from '../tools/server/getPackageVersion';
import { theme } from '../tools/server/theme/theme';

function App(
  this: any,
  props: AppProps<{
    activeColorScheme: MantineColorScheme;
    environmentColorScheme: MantineColorScheme;
    packageAttributes: ServerSidePackageAttributesType;
    editModeEnabled: boolean;
    config?: ConfigType;
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

  const asyncStoragePersister = createAsyncStoragePersister({
    storage: AsyncStorage,
  });

  useEffect(() => {
    setInitialPackageAttributes(props.pageProps.packageAttributes);
  }, []);

  return (
    <>
      <CommonHead />
      <SessionProvider session={pageProps.session}>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: asyncStoragePersister }}
        >
          <ColorSchemeProvider {...pageProps}>
            {(colorScheme) => (
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
                    <ModalsProvider modals={modals}>
                      <Component {...pageProps} />
                    </ModalsProvider>
                  </ConfigProvider>
                </MantineProvider>
              </ColorTheme.Provider>
            )}
          </ColorSchemeProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </PersistQueryClientProvider>
      </SessionProvider>
    </>
  );
}

App.getInitialProps = async ({ ctx }: { ctx: GetServerSidePropsContext }) => {
  if (env.NEXT_PUBLIC_DEFAULT_COLOR_SCHEME !== 'light') {
    Consola.debug(
      `Overriding the default color scheme with ${env.NEXT_PUBLIC_DEFAULT_COLOR_SCHEME}`
    );
  }

  const session = await getSession(ctx);

  // Set the cookie language to the user language if it is not set correctly
  const cookieLanguage = getCookie(COOKIE_LOCALE_KEY, ctx);
  if (session?.user && session.user.language != cookieLanguage) {
    setCookie(COOKIE_LOCALE_KEY, session.user.language, ctx);
  }

  return {
    pageProps: {
      ...getActiveColorScheme(session, ctx),
      packageAttributes: getServiceSidePackageAttributes(),
      session,
    },
  };
};

export default appWithTranslation<any>(api.withTRPC(App), nextI18nextConfig as any);

const getActiveColorScheme = (session: Session | null, ctx: GetServerSidePropsContext) => {
  const environmentColorScheme = env.NEXT_PUBLIC_DEFAULT_COLOR_SCHEME ?? 'light';
  const cookieColorScheme = getCookie(COOKIE_COLOR_SCHEME_KEY, ctx);
  const activeColorScheme = colorSchemeParser.parse(
    session?.user?.colorScheme ?? cookieColorScheme ?? environmentColorScheme
  );

  if (cookieColorScheme !== activeColorScheme) {
    setCookie(COOKIE_COLOR_SCHEME_KEY, activeColorScheme, ctx);
  }

  return {
    activeColorScheme: activeColorScheme,
    environmentColorScheme,
  };
};
