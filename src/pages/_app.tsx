import { MantineColorScheme, MantineProvider, MantineTheme } from '@mantine/core';
// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import '@mantine/core/styles.css';
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
import Script from 'next/script';
import { useEffect } from 'react';
import { createEmotionSsrAdvancedApproach } from 'tss-react/next/pagesDir';
import 'video.js/dist/video-js.css';
import { CommonHead } from '~/components/layout/Meta/CommonHead';
import { ConfigProvider } from '~/config/provider';
import { env } from '~/env.js';
import { ColorSchemeProvider } from '~/hooks/use-colorscheme';
import { modals } from '~/modals';
import { usePackageAttributesStore } from '~/tools/client/zustands/usePackageAttributesStore';
import { getLanguageByCode } from '~/tools/language';
import {
  ServerSidePackageAttributesType,
  getServiceSidePackageAttributes,
} from '~/tools/server/getPackageVersion';
import { theme } from '~/tools/server/theme/theme';
import { ConfigType } from '~/types/config';
import { api } from '~/utils/api';
import { colorSchemeParser } from '~/validations/user';

import { COOKIE_COLOR_SCHEME_KEY, COOKIE_LOCALE_KEY } from '../../data/constants';
import nextI18nextConfig from '../../next-i18next.config.js';
import '../styles/global.scss';

dayjs.extend(locale);
dayjs.extend(utc);

const { augmentDocumentWithEmotionCache, withAppEmotionCache } = createEmotionSsrAdvancedApproach({
  key: 'css',
});

export { augmentDocumentWithEmotionCache };

function App(
  this: any,
  props: AppProps<{
    activeColorScheme: MantineColorScheme;
    environmentColorScheme: MantineColorScheme;
    packageAttributes: ServerSidePackageAttributesType;
    editModeEnabled: boolean;
    analyticsEnabled: boolean;
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
  const analyticsEnabled = pageProps.analyticsEnabled ?? true;
  // TODO: make mapping from our locales to moment locales
  const language = getLanguageByCode(pageProps.session?.user?.language ?? 'en');
  if (language.locale !== 'cr') require(`dayjs/locale/${language.locale}.js`);
  dayjs.locale(language.locale);

  const { setInitialPackageAttributes } = usePackageAttributesStore();
  useEffect(() => {
    setInitialPackageAttributes(props.pageProps.packageAttributes);
  }, []);

  return (
    <>
      <CommonHead />
      {pageProps.session && pageProps.session.user.language === 'cr' && (
        <>
          <Script type="text/javascript" src="//cdn.crowdin.com/jipt/jipt.js" />
          <Script type="text/javascript">var _jipt = []; _jipt.push(['project', 'homarr']);</Script>
        </>
      )}
      {analyticsEnabled === true && (
        <Script
          src="https://umami.homarr.dev/script.js"
          data-website-id="f133f10c-30a7-4506-889c-3a803f328fa4"
          strategy="lazyOnload"
        />
      )}
      <SessionProvider session={pageProps.session}>
        <ConfigProvider {...props.pageProps}>
          <MantineProvider
            theme={
              {
                //TODO: Fix secondary color
                // secondaryColor: props.pageProps.secondaryColor ?? 'orange',
                // primaryColor: 'var(--mantine-color-red-6)',
                // primaryShade: props.pageProps.primaryShade ?? 6,
                // ...theme,
              }
            }
          >
            <Notifications limit={4} position="bottom-left" />
            <ModalsProvider modals={modals}>
              <Component {...pageProps} />
            </ModalsProvider>
          </MantineProvider>
        </ConfigProvider>
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

  const analyticsEnabled = env.NEXT_PUBLIC_DISABLE_ANALYTICS !== 'true';

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
      analyticsEnabled,
      session,
      locale: ctx.locale ?? 'en',
    },
  };
};

export default withAppEmotionCache(appWithTranslation<any>(api.withTRPC(App), nextI18nextConfig));

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
