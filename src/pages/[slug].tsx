import { setCookie } from 'cookies-next';
import fs from 'fs';
import { GetServerSidePropsContext } from 'next';
import path from 'path';
import { LoadConfigComponent } from '../components/Config/LoadConfig';
import { Dashboard } from '../components/Dashboard/Dashboard';
import Layout from '../components/layout/Layout';
import { useInitConfig } from '../config/init';
import { getFallbackConfig } from '../tools/config/getFallbackConfig';
import { getFrontendConfig } from '../tools/config/getFrontendConfig';
import { getServerSideTranslations } from '../tools/server/getServerSideTranslations';
import { dashboardNamespaces } from '../tools/server/translation-namespaces';
import { ConfigType } from '../types/config';
import { DashboardServerSideProps } from '../types/dashboardPageType';

export async function getServerSideProps({
  req,
  res,
  locale,
  query,
}: GetServerSidePropsContext): Promise<{ props: DashboardServerSideProps }> {
  const configName = query.slug as string;
  const configPath = path.join(process.cwd(), 'data/configs', `${configName}.json`);
  const configExists = fs.existsSync(configPath);

  const translations = await getServerSideTranslations(req, res, dashboardNamespaces, locale);

  if (!configExists) {
    // Redirect to 404
    res.writeHead(301, { Location: '/404' });
    res.end();
    return {
      props: {
        config: getFallbackConfig() as unknown as ConfigType,
        configName,
        ...translations,
      },
    };
  }

  const config = getFrontendConfig(configName as string);
  setCookie('config-name', configName, {
    req,
    res,
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'strict',
  });

  return {
    props: {
      configName,
      config,
      ...translations,
    },
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
