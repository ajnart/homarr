import { getCookie, setCookie } from 'cookies-next';
import { GetServerSidePropsContext } from 'next';

import fs from 'fs';
import Consola from 'consola';
import { Dashboard } from '../components/Dashboard/Dashboard';
import Layout from '../components/layout/Layout';
import { useInitConfig } from '../config/init';
import { getFrontendConfig } from '../tools/config/getFrontendConfig';
import { getServerSideTranslations } from '../tools/getServerSideTranslations';
import { dashboardNamespaces } from '../tools/translation-namespaces';
import { DashboardServerSideProps } from '../types/dashboardPageType';
import { LoadConfigComponent } from '../components/Config/LoadConfig';

export async function getServerSideProps({
  req,
  res,
  locale,
}: GetServerSidePropsContext): Promise<{ props: DashboardServerSideProps }> {
  // Get all the configs in the /data/configs folder
  // All the files that end in ".json"
  const configs = fs.readdirSync('./data/configs').filter((file) => file.endsWith('.json'));

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

    return { props: {} as DashboardServerSideProps };
  }

  let configName = getCookie('config-name', { req, res });
  if (!configName) {
    setCookie('config-name', 'default', {
      req,
      res,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'strict',
    });
    configName = 'default';
  }

  const translations = await getServerSideTranslations(req, res, dashboardNamespaces, locale);

  const config = getFrontendConfig(configName as string);

  return {
    props: { configName: configName as string, config, ...translations },
  };
}

export default function HomePage({ config: initialConfig }: DashboardServerSideProps) {
  useInitConfig(initialConfig);

  return (
    <Layout>
      <Dashboard />
      <LoadConfigComponent />
    </Layout>
  );
}
