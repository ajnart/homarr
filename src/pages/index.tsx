import { getCookie, setCookie } from 'cookies-next';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import LoadConfigComponent from '../components/Config/LoadConfig';
import { Dashboard } from '../components/Dashboard/Dashboard';
import Layout from '../components/layout/Layout';
import { useInitConfig } from '../config/init';
import { getFrontendConfig } from '../tools/config/getFrontendConfig';
import { dashboardNamespaces } from '../tools/translation-namespaces';
import { ConfigType } from '../types/config';

type ServerSideProps = {
  config: ConfigType;
  configName: string;
  _nextI18Next: SSRConfig['_nextI18Next'];
};

export async function getServerSideProps({
  req,
  res,
  locale,
}: GetServerSidePropsContext): Promise<{ props: ServerSideProps }> {
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
  const config = getFrontendConfig(configName as string);

  return {
    props: { configName: configName as string, config, ...translations },
  };
}

export default function HomePage({ config: initialConfig }: ServerSideProps) {
  useInitConfig(initialConfig);

  return (
    <Layout>
      <Dashboard />
      <LoadConfigComponent />
    </Layout>
  );
}
