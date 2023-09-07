import { ColorScheme as MantineColorScheme, MantineProvider, MantineTheme } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Consola from 'consola';
import { getCookie, setCookie } from 'cookies-next';
import dayjs from 'dayjs';
import locale from 'dayjs/plugin/localeData';
import utc from 'dayjs/plugin/utc';
import 'flag-icons/css/flag-icons.min.css';
import { GetServerSidePropsContext } from 'next';
import { Session } from 'next-auth';
import { SessionProvider, getSession } from 'next-auth/react';
import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import 'video.js/dist/video-js.css';
import { CommonHead } from '~/components/layout/Meta/CommonHead';
import { env } from '~/env.js';
import { ColorSchemeProvider } from '~/hooks/use-colorscheme';
import { modals } from '~/modals';
import { getLanguageByCode } from '~/tools/language';
import { ConfigType } from '~/types/config';
import { api } from '~/utils/api';
import { colorSchemeParser } from '~/validations/user';

import { COOKIE_COLOR_SCHEME_KEY, COOKIE_LOCALE_KEY } from '../../data/constants';
import nextI18nextConfig from '../../next-i18next.config.js';
import { ConfigProvider } from '~/config/provider';
import '../styles/global.scss';
import { usePackageAttributesStore } from '~/tools/client/zustands/usePackageAttributesStore';
import { ColorTheme } from '~/tools/color';
import {
  ServerSidePackageAttributesType,
  getServiceSidePackageAttributes,
} from '~/tools/server/getPackageVersion';
import { theme } from '~/tools/server/theme/theme';

dayjs.extend(locale);
dayjs.extend(utc);

function App(
  this: any,
  props: AppProps<{
    activeColorScheme: MantineColorScheme;
    environmentColorScheme: MantineColorScheme;
    packageAttributes: ServerSidePackageAttributesType;
    editModeEnabled: boolean;
    config?: ConfigType;
    primaryColor?: MantineTheme['primaryColor'];
    secondaryColor?: MantineTheme['primaryColor'];
    primaryShade?: MantineTheme['primaryShade'];
    session: Session;
    configName?: string;
    locale: string;
  }>
) {
  const { Component, pageProps } = props;
  // TODO: make mapping from our locales to moment locales
  const language = getLanguageByCode(pageProps.session?.user?.language ?? 'en');
  require(`dayjs/locale/${language.locale}.js`);
  dayjs.locale(language.locale);

  const [primaryColor, setPrimaryColor] = useState<MantineTheme['primaryColor']>(
    props.pageProps.primaryColor ?? 'red'
  );
  const [secondaryColor, setSecondaryColor] = useState<MantineTheme['primaryColor']>(
    props.pageProps.secondaryColor ?? 'orange'
  );
  const [primaryShade, setPrimaryShade] = useState<MantineTheme['primaryShade']>(
    props.pageProps.primaryShade ?? 6
  );
  const colorTheme = {
    primaryColor,
    secondaryColor,
    setPrimaryColor,
    setSecondaryColor,
    primaryShade,
    setPrimaryShade,
  };

  useEffect(() => {
    setPrimaryColor(props.pageProps.primaryColor ?? 'red');
    setSecondaryColor(props.pageProps.secondaryColor ?? 'orange');
    setPrimaryShade(props.pageProps.primaryShade ?? 6);
    return () => {
      setPrimaryColor('red');
      setSecondaryColor('orange');
      setPrimaryShade(6);
    };
  }, [props.pageProps]);

  const { setInitialPackageAttributes } = usePackageAttributesStore();

  useEffect(() => {
    setInitialPackageAttributes(props.pageProps.packageAttributes);
  }, []);

  return (
    <>
      <CommonHead />
      <SessionProvider session={pageProps.session}>
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
                withCSSVariables
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
      locale: ctx.locale ?? 'en',
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
