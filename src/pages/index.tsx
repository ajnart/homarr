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
import { dashboardNamespaces } from '../tools/translation-namespaces';

export async function getServerSideProps({
  req,
  res,
  locale,
}: GetServerSidePropsContext): Promise<{ props: { config: Config } }> {
  let configName = getCookie('config-name', { req, res });
  const configLocale = getCookie('config-locale', { req, res });
  if (!configName) {
    setCookie('config-name', 'default', {
      req,
      res,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'strict',
    });
    configName = 'default';
  }

  const translations = await serverSideTranslations(
    (configLocale ?? locale) as string,
    dashboardNamespaces
  );
  return getConfig(configName as string, translations);
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
