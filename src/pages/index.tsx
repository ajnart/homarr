import { getCookie, setCookie } from 'cookies-next';
import { GetServerSidePropsContext } from 'next';
import { useEffect } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import AppShelf from '../components/AppShelf/AppShelf';
import LoadConfigComponent from '../components/Config/LoadConfig';
import { Config } from '../tools/types';
import { useConfig } from '../tools/state';
import { migrateToIdConfig } from '../tools/migrate';
import { getConfig } from '../tools/getConfig';
import { useColorTheme } from '../tools/color';
import Layout from '../components/layout/Layout';

export async function getServerSideProps({
  req,
  res,
  locale,
}: GetServerSidePropsContext): Promise<{ props: { config: Config } }> {
  let cookie = getCookie('config-name', { req, res });
  if (!cookie) {
    setCookie('config-name', 'default', {
      req,
      res,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'strict',
    });
    cookie = 'default';
  }

  const translations = await serverSideTranslations(locale as string, [
    'common',
    'layout/app-shelf',
    'layout/add-service-app-shelf',
    'settings/common',
    'settings/general/theme-selector',
    'settings/general/config-changer',
    'settings/general/internationalization',
    'settings/general/module-enabler',
    'settings/general/search-engine',
    'settings/general/widget-positions',
    'settings/customization/color-selector',
    'settings/customization/page-appearance',
    'settings/customization/shade-selector',
    'modules/search-module',
    'modules/downloads-module',
    'modules/weather-module',
    'modules/ping-module',
    'modules/docker-module',
    'modules/dashdot-module',
    'modules/overseerr-module',
    'modules/common-media-cards-module',
  ]);
  return getConfig(cookie as string, translations);
}

export default function HomePage(props: any) {
  const { config: initialConfig }: { config: Config } = props;
  const { setConfig } = useConfig();
  const { setPrimaryColor, setSecondaryColor } = useColorTheme();
  useEffect(() => {
    const migratedConfig = migrateToIdConfig(initialConfig);
    setPrimaryColor(migratedConfig.settings.primaryColor || 'red');
    setSecondaryColor(migratedConfig.settings.secondaryColor || 'orange');
    setConfig(migratedConfig);
  }, [initialConfig]);
  return (
    <Layout>
      <AppShelf />
      <LoadConfigComponent />
    </Layout>
  );
}
