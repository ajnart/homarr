import { getCookie, setCookie } from 'cookies-next';
import { GetServerSidePropsContext } from 'next';
import { SSRConfig } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import fs from 'fs';
import LoadConfigComponent from '../components/Config/LoadConfig';
import { Dashboard } from '../components/Dashboard/Dashboard';
import Layout from '../components/layout/Layout';
import { useInitConfig } from '../config/init';
import { getFrontendConfig } from '../tools/config/getFrontendConfig';
import { dashboardNamespaces } from '../tools/translation-namespaces';
import { ConfigType } from '../types/config';

type ServerSideProps = {
  config: ConfigType;
  // eslint-disable-next-line react/no-unused-prop-types
  configName: string;
  // eslint-disable-next-line react/no-unused-prop-types
  _nextI18Next: SSRConfig['_nextI18Next'];
};

export async function getServerSideProps({
  req,
  res,
  locale,
}: GetServerSidePropsContext): Promise<{ props: ServerSideProps }> {
  // Check that all the json files in the /data/configs folder are migrated
  // If not, redirect to the migrate page
  const configs = await fs.readdirSync('./data/configs');
  if (
    !configs.every(
      (config) => JSON.parse(fs.readFileSync(`./data/configs/${config}`, 'utf8')).schemaVersion
    )
  ) {
    // Replace the current page with the migrate page but don't redirect
    // This is to prevent the user from seeing the redirect
    res.writeHead(302, {
      Location: '/migrate',
    });
    res.end();

    return { props: {} as ServerSideProps };
  }

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
